"""render_ketukan — bagian Renderer: sinkron ketukan musik latar (ketukan.py) dan riser sebelum adegan besar.

Sebelum elemen dibangun: grid ketukan musik → titik mulai musik dipilih agar ketukan jatuh di potongan/reveal penting
(berbobot) → potongan yang tinggal ≤ `toleransi` dari ketukan digeser tepat ke ketukan; elemen lain yang mulai/berakhir
di titik yang sama ikut (latar cutaway, akhir elemen sebelumnya). Ucapan tidak digeser. Beat-sheet:
`"ketukan": {"aktif": true, "toleransi": 0.1, "toleransi_potong": 0.16, "riser": true}`."""
from __future__ import annotations

import subprocess

import numpy as np

import beat
import ketukan
from perangkat import PERANGKAT
from sistem import baca_json, frontmatter, log, resolve, sha_file, tulis_json

TOLERANSI = 0.1        # s — reveal sejauh ini dari ketukan digeser ke ketukan (K05.5 mengizinkan ±0,15 s)
TOLERANSI_POTONG = 0.16  # s — potongan besar (cutaway, transisi, efek kamera): ±5 frame dari kata = J/L-cut biasa
BPM_SUBDIVISI = 100     # musik lebih pelan dari ini: potongan juga boleh jatuh di ½ ketukan (seperti editor memotong)
RISER_DURASI_MIN = 2.5  # s — cutaway sependek ini tidak dianggap "adegan besar"
RISER_JARAK_MIN = 6.0   # s — riser tidak lebih rapat dari ini
RISER_RUANG = 1.5       # s — butuh ruang sebelum potongan untuk naik


def sumber_musik(p) -> tuple[dict, object, str | None] | None:
    """manifest aset.musik → (spek, path, nama bawaan | None); None = tanpa musik."""
    musik = p.manifest.get("aset", {}).get("musik")
    if isinstance(musik, str):
        musik = {"file": musik}
    if not musik or not musik.get("file"):
        return None
    f = str(musik["file"])
    if f.startswith("bawaan:"):  # musik latar sintesis (musik.py)
        import musik as musik_bawaan
        nama = f.split(":", 1)[1]
        return musik, musik_bawaan.file_musik(nama), nama
    return musik, p.path_aset(f), None


def _deteksi_file(p, path) -> tuple[float, float]:
    """Tempo & fase file musik pengguna (120 s pertama), ber-cache per isi file di cache/ketukan.json."""
    kunci = sha_file(path)
    cache = p.cache / "ketukan.json"
    data = baca_json(cache, {}) if cache.exists() else {}
    if kunci in data:
        return tuple(data[kunci])
    log("ketukan", f"deteksi tempo {path.name} …")
    mentah = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-t", "120", "-i", str(path), "-ac", "1",
                             "-ar", str(ketukan.SR_ANALISIS), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    bpm, fase = ketukan.deteksi(np.frombuffer(mentah, np.float32))
    data[kunci] = [round(bpm, 3), round(fase, 4)]
    tulis_json(cache, data)
    return bpm, fase


class KetukanMixin:
    """Sinkron ketukan & riser. Dipakai sebagai kelas dasar Renderer (render.py)."""

    def _cutaway(self, e: dict) -> bool:
        if e["tipe"] == "broll":
            return not e.get("jendela")
        if e["tipe"] != "remotion":
            return False
        komposisi = e.get("komposisi")
        if not komposisi and e.get("efek"):
            komposisi = frontmatter(resolve("efek", e["efek"]).path)[0].get("remotion")
        spek = PERANGKAT.get(komposisi)
        return bool(spek and spek.cutaway)

    def _titik_potong(self, e: dict) -> list[tuple[str, float]]:
        """Titik visual elemen yang layak jatuh di ketukan → [(mulai|selesai, bobot)]."""
        if e["tipe"] == "transisi":
            return [("mulai", 3.0)]
        if self._cutaway(e):
            return [("mulai", 3.0), ("selesai", 2.0)]
        if e["tipe"] == "kamera":
            return [("mulai", 2.0), ("selesai", 1.5)]
        if e["tipe"] in ("judul", "kartu", "gambar", "depth") or (e["tipe"] == "remotion" and not self._kinetik(e)):
            return [("mulai", 1.0)]
        return []

    def _kinetik(self, e: dict) -> bool:
        komposisi = e.get("komposisi")
        if not komposisi and e.get("efek"):
            komposisi = frontmatter(resolve("efek", e["efek"]).path)[0].get("remotion")
        spek = PERANGKAT.get(komposisi)
        return bool(spek and spek.ganti_caption)  # teks kinetik ikut kata, bukan ketukan

    def _ketukan_siapkan(self) -> None:
        self.ketukan = None
        cfg = self.bs.get("ketukan") or {}
        m = sumber_musik(self.p)
        if not cfg.get("aktif", True) or not m or not m[1] or not m[1].exists():
            return
        _, path, nama = m
        if nama:
            import musik as musik_bawaan
            bpm, fase_file, asal = float(musik_bawaan.BPM[nama]), 0.0, "bawaan"
        else:
            (bpm, fase_file), asal = _deteksi_file(self.p, path), "deteksi"
        periode = 60.0 / bpm
        elemen = [e for e in beat.semua_elemen(self.bs) if e["tipe"] != "sfx"]
        peristiwa = [(e[k], w) for e in elemen for k, w in self._titik_potong(e)]
        fase = ketukan.pilih_fase(periode, peristiwa)  # fase dari ketukan penuh: potongan besar jatuh di ketukan
        sub = 2 if bpm < BPM_SUBDIVISI else 1
        ketuk = ketukan.titik(fase, periode / sub, self.dur)
        tol = float(cfg.get("toleransi", TOLERANSI))
        tol_potong = float(cfg.get("toleransi_potong", TOLERANSI_POTONG))
        geser: dict[float, float] = {}
        for e in elemen:
            for k, w in self._titik_potong(e):
                if not 0.05 < e[k] < self.dur - 0.05:  # awal & akhir video tetap
                    continue
                t = ketukan.snap(e[k], ketuk, tol_potong if w >= 2 else tol)
                if abs(t - e[k]) > 1e-4:
                    geser[round(e[k], 3)] = round(float(t), 4)
        n = 0
        for e in beat.semua_elemen(self.bs):  # semua yang mulai/berakhir di titik potong ikut (latar, sfx eksplisit, …)
            for k in ("mulai", "selesai"):
                baru = geser.get(round(e[k], 3))
                if baru is not None and not (k == "mulai" and self._kinetik(e)):
                    e[k] = baru
                    n += 1
        sesudah = [e[k] for e in elemen for k, _ in self._titik_potong(e)]
        di_ketukan = sum(1 for t in sesudah if ketuk and min(abs(t - k) for k in ketuk) <= 0.02)
        self.ketukan = {"bpm": round(bpm, 2), "asal": asal, "fase": round(fase, 4), "subdivisi": sub,
                        "ofset_musik": ketukan.ofset_musik(fase_file, fase, periode), "titik": ketuk,
                        "geser": [{"dari": a, "ke": b} for a, b in sorted(geser.items())], "elemen_digeser": n,
                        "peristiwa": len(peristiwa), "peristiwa_di_ketukan": di_ketukan}

    def _riser(self) -> None:
        """Riser yang puncaknya tepat di potongan masuk adegan besar (cutaway ≥ RISER_DURASI_MIN)."""
        cfg = self.bs.get("ketukan") or {}
        if not cfg.get("riser", True) or not self.p.t("sfx.otomatis", False):
            return
        terakhir = -1e9
        for b in sorted(self.broll, key=lambda x: x["mulai"]):
            t = b["mulai"]
            if b["selesai"] - t < RISER_DURASI_MIN or t < RISER_RUANG or t - terakhir < RISER_JARAK_MIN:
                continue
            self._daftar_sfx({"file": "riser"}, t, f"{b['id']}/riser", kelas="transisi", otomatis=True)
            terakhir = t
