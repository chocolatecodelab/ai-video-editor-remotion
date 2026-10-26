"""render_audio — bagian Renderer: SFX (otomatis dari token sfx.peta, K08) dan campuran akhir suara + musik + bus SFX
→ loudnorm & kunci loudness (K06)."""
from __future__ import annotations

from pathlib import Path

import numpy as np

import sfx as pustaka_sfx
from sistem import GagalPipeline, jalankan, loudnorm_2pass, sha_file, ukur_loudness


MARGIN_TP_LOSSY = 0.5  # K06.2: headroom dB di master untuk overshoot encoder AAC saat ekspor (terukur ±0,1 dB)


class AudioMixin:
    """SFX & audio akhir. Dipakai sebagai kelas dasar Renderer (render.py)."""

    def _daftar_sfx(self, spec, t: float, sumber: str, kelas: str | None = None, otomatis: bool = False) -> None:
        """spec: True (sfx.transisi), nama bunyi pustaka, path file, atau {file, db, offset}."""
        p = self.p
        if spec is True or spec == {}:
            spec = p.t("sfx.transisi")
        if isinstance(spec, str):
            spec = {"file": spec}
        nama = spec.get("file", p.t("sfx.transisi"))
        if "/" in nama or "." in nama:
            path, puncak = p.path_aset(nama), 0.0
            if not path.exists():
                raise GagalPipeline(f"{sumber}: file sfx {nama!r} tidak ada.")
        else:
            k = self._var_sfx.get(nama, 0)
            self._var_sfx[nama] = k + 1  # varian bergilir: bunyi berulang tidak identik
            path, puncak = pustaka_sfx.file_bunyi(nama, k), pustaka_sfx.puncak(nama)
        level = p.t("sfx.level", {})
        db = float(spec.get("db", level.get(kelas, p.t("sfx.level-db")) if kelas else p.t("sfx.level-db")))
        t_bunyi = round(max(0.0, t + float(spec.get("offset", -puncak))), 3)
        if otomatis and kelas != "ketik":
            jarak = p.t("sfx.jarak-min")
            if any(s["kelas"] != "ketik" and abs(s["t"] - t_bunyi) < jarak for s in self.sfx):
                for kunci in (sumber, sumber.rsplit("/", 1)[0]):  # K08.1: elemen "berbunyi" lewat bunyi yang sudah ada
                    if kunci in self.rekam:
                        self.rekam[kunci]["sfx_gabung"] = True
                return  # K08.2: bunyi otomatis tidak menumpuk bunyi lain
        self.sfx.append({"sumber": sumber, "file": str(path), "t": t_bunyi, "db": db, "bunyi": nama,
                         "kelas": kelas, "otomatis": otomatis})

    def _sfx_otomatis(self, e) -> None:
        """Bunyi dari token sfx.peta menurut tipe elemen (K08.1)."""
        p = self.p
        if not p.t("sfx.otomatis", False) or e.get("_sfx_sendiri"):
            return
        peta = p.t("sfx.peta")
        tipe = e["tipe"]
        if tipe == "push" and float(e.get("gerak", 1.0)) > p.t("sfx.push-gerak-maks"):
            return  # push pelan tidak berbunyi
        kunci = f"chip-{e.get('status')}" if tipe == "chip" and f"chip-{e.get('status')}" in peta else tipe
        if kunci not in peta:
            return
        m = peta[kunci]
        self._daftar_sfx({"file": m["bunyi"]}, e["mulai"], e["_id"], kelas=m["kelas"], otomatis=True)
        if tipe == "kartu" and "item" in peta:  # tiap item kartu: bunyi saat mulai tampil
            mi = peta["item"]
            for r in self.rekam.values():
                if r.get("induk") == e["_id"] and r.get("bagian") == "item":
                    self._daftar_sfx({"file": mi["bunyi"]}, r["mulai"] + r["delay"], r["id"], kelas=mi["kelas"], otomatis=True)

    def _el_sfx(self, e):
        self._daftar_sfx({k: e[k] for k in ("file", "db", "offset") if k in e}, e["mulai"], e["_id"])

    # ---------------------------------------------------------- audio
    def campur_audio(self, tujuan) -> dict:
        p = self.p
        a = p.tokens["audio"]
        cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"]
        fc, label = [], []
        if p.ingest_audio.exists():
            cmd += ["-i", p.ingest_audio]
        else:
            cmd += ["-f", "lavfi", "-t", f"{self.dur:.3f}", "-i", f"anullsrc=r={a['sample-rate']}:cl=stereo"]
        n = 1
        musik = p.manifest.get("aset", {}).get("musik")
        if isinstance(musik, str):
            musik = {"file": musik}
        if musik and musik.get("file"):
            if str(musik["file"]).startswith("bawaan:"):  # musik latar sintesis (musik.py)
                import musik as musik_bawaan
                mp = musik_bawaan.file_musik(musik["file"].split(":", 1)[1])
            else:
                mp = p.path_aset(musik["file"])
            if not mp.exists():
                raise GagalPipeline(f"musik {musik['file']!r} tidak ada.")
            cmd += ["-stream_loop", "-1", "-i", mp]
            fc.append("[0:a]asplit=2[suara][kunci]")
            fc.append(f"[1:a]aresample={a['sample-rate']},volume={musik.get('db', -22)}dB[m0]")
            fc.append("[m0][kunci]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[musik]")
            label += ["[suara]", "[musik]"]
            n = 2
        else:
            label.append("[0:a]")
        bus_info = None
        if self.sfx:  # semua SFX → satu bus WAV (puluhan klik ketik tidak jadi puluhan input ffmpeg)
            bus = p.cache / "sfx_bus.wav"
            bus_info = pustaka_sfx.rakit_bus([dict(s, file=str(self._wav16(s["file"]))) for s in self.sfx], self.dur, bus)
            cmd += ["-i", bus]
            fc.append(f"[{n}:a]aresample={a['sample-rate']}[bus]")
            label.append("[bus]")
        fc.append("".join(label) + f"amix=inputs={len(label)}:normalize=0:duration=longest,"
                                   # apad ber-ujung (whole_dur): apad tanpa ujung + atrim kadang membuat ffmpeg 9
                                   # berputar selamanya (±1 dari 5 kali); hasil identik per sampel
                                   f"apad=whole_dur={self.dur:.3f},atrim=0:{self.dur:.3f}[mix]")
        mentah = p.cache / "mix_mentah.wav"
        cmd += ["-filter_complex", ";".join(fc), "-map", "[mix]", "-ar", a["sample-rate"], "-ac", 2,
                "-c:a", "pcm_s24le", mentah]
        jalankan(cmd)
        try:
            ukur = loudnorm_2pass(mentah, tujuan, a["lufs"], a["true-peak"] - MARGIN_TP_LOSSY, a["lra"], sr=a["sample-rate"])
        except GagalPipeline as ex:
            self.peringatan.append(f"Audio tidak dinormalisasi: {ex}")
            mentah.replace(tujuan)
            ukur = None
        mentah.unlink(missing_ok=True)
        akhir = self._kunci_loudness(tujuan, a)
        return {"musik": bool(musik), "ducking": bool(musik), "loudnorm_ukur": ukur, "sfx_bus": bus_info, "akhir": akhir}

    def _kunci_loudness(self, path, a: dict) -> dict:
        """Pastikan target LUFS & true-peak tercapai (K06.1–2), juga untuk video tanpa suara (SFX/musik saja) yang
        tak terjangkau loudnorm linear: koreksi gain → limiter oversampling 4× (menangkap puncak antar-sampel)."""
        batas = a["true-peak"] - MARGIN_TP_LOSSY
        u = ukur_loudness(path)
        langkah = 0
        while langkah < 3 and (abs(u["lufs"] - a["lufs"]) > a["lufs-toleransi"] * 0.4 or u["true_peak"] > batas + 0.05):
            gain = a["lufs"] - u["lufs"] if np.isfinite(u["lufs"]) else 0.0
            tmp = path.with_name(path.stem + ".lim.wav")
            jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", path, "-af",
                      f"volume={gain:.2f}dB,aresample={a['sample-rate'] * 4},"
                      f"alimiter=limit={10 ** (batas / 20):.5f}:attack=1:release=60:level=disabled,"
                      f"aresample={a['sample-rate']}", "-c:a", "pcm_s24le", tmp])
            tmp.replace(path)
            u = ukur_loudness(path)
            langkah += 1
        return {"lufs": u["lufs"], "true_peak": u["true_peak"], "koreksi": langkah}

    def _wav16(self, path: str):
        """File SFX pengguna (mp3/wav 24-bit/…) → WAV 16-bit 48 kHz di cache, agar bisa dirakit ke bus."""
        src = Path(path)
        try:
            pustaka_sfx.baca(src)
            return src
        except Exception:
            out = self.p.cache / "sfx_konversi" / f"{sha_file(src)[:16]}.wav"
            if not out.exists():
                out.parent.mkdir(parents=True, exist_ok=True)
                jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-ar", pustaka_sfx.SR,
                          "-ac", 2, "-c:a", "pcm_s16le", out])
            return out
