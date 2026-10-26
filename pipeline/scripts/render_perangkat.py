"""render_perangkat — bagian Renderer: elemen Remotion (perangkat UI, cutaway) → overlay ber-cache, komposit per frame
dengan backdrop blur, ukur kotak (alpha) & kontras latar efektif untuk QA."""
from __future__ import annotations

import cv2
import numpy as np

from perangkat import PERANGKAT
from remotion_jembatan import render_overlay
from render_dasar import Lapisan, Overlay
from sistem import GagalPipeline, frontmatter, hex_rgb, log, resolve


# Kontrak teks per Composition Remotion (untuk QA ukuran & kontras): peran ukuran & warna token yang dipakai.
KONTRAK_TEKS = {
    "Checklist": {"ukuran": ["subjudul", "isi"], "warna": ["teks-utama", "teks-sekunder", "aksen"]},
}
KONTRAK_DEFAULT = {"ukuran": ["isi"], "warna": ["teks-utama", "aksen"]}
ALPHA_KOTAK = 128  # piksel overlay dihitung "elemen" bila alpha ≥ 50% (bayangan tipis tidak ikut)


class PerangkatMixin:
    """Elemen Remotion. Dipakai sebagai kelas dasar Renderer (render.py)."""

    def _el_remotion(self, e):
        p = self.p
        komposisi = e.get("komposisi")
        if not komposisi and e.get("efek"):
            komposisi = frontmatter(resolve("efek", e["efek"]).path)[0].get("remotion")
        if not komposisi:
            raise GagalPipeline(f"{e['_id']}: butuh 'komposisi', atau 'efek' yang modulnya punya frontmatter 'remotion'.")
        an = self._anim_dasar(e)
        item = list(e.get("item") or [])
        stagger = float(e.get("stagger", p.t("durasi.stagger")))
        lewati = {"tipe", "mulai", "selesai", "durasi", "sfx", "sfx_item", "komposisi", "efek", "kaca"}
        elemen = {k: v for k, v in e.items() if not k.startswith("_") and k not in lewati}
        # jenis masuk/keluar ikut dikirim: <Wadah> Remotion memakai rumus yang sama dengan Animator (render_dasar.py),
        # jadi perangkat masuk seperti judul/kartu Python dan layout.json/QA mencatat gerak yang benar-benar terjadi
        elemen.update(durasi_masuk=an["d_in"], durasi_keluar=an["d_out"], easing=an["e_in"].nama,
                      easing_keluar=an["e_out"].nama, posisi=e.get("posisi", "tengah"),
                      masuk=an["masuk"], keluar=an["keluar"])
        if item:
            elemen.update(item=item, stagger=stagger)
        dur = e["selesai"] - e["mulai"]
        spek = PERANGKAT.get(komposisi)
        po = float(p.t("warna.panel-opasitas"))
        if spek:  # perangkat UI: jadwal bersama gambar & suara (perangkat.py)
            jadwal, bunyi = spek.jadwal(e, an, p, dur)
            elemen["jadwal"] = jadwal
            elemen["posisi"] = e.get("posisi", spek.posisi)
            if spek.jendela:
                po = max(po, p.t("perangkat.opasitas-min"))
            if "sfx" not in e and p.t("sfx.otomatis", False):
                e["_sfx_sendiri"] = True  # didaftarkan setelah catatan elemen ada (lihat bawah)
        po = float(e.get("opasitas", po))
        elemen["opasitas"] = po
        n = int(round(dur * p.fps))
        if e.get("_efek"):  # nilai bawaan dari frontmatter `props` modul efek (mis. checklist-pop → pop: true)
            for k_, v_ in (frontmatter(resolve("efek", e["_efek"]).path)[0].get("props") or {}).items():
                elemen.setdefault(k_, v_)
        props = {"W": p.W, "H": p.H, "fps": p.fps, "durasiFrame": n, "skala": p.skala, "zona": list(self.zona),
                 "tokens": p.tokens, "elemen": elemen}
        path, dari_cache = render_overlay(p, komposisi, props)
        log("remotion", f"{e['_id']}: {komposisi} → {path.name}" + (" (cache)" if dari_cache else ""))
        kt = spek.kontrak if spek else KONTRAK_TEKS.get(komposisi, KONTRAK_DEFAULT)
        teks = spek.teks(e) if spek else " ".join([e.get("judul", ""), e.get("teks", ""), *item]).replace("*", "").strip()
        if spek and spek.cutaway:  # klip layar penuh beserta latarnya → masuk sebagai broll (E01/E02/E03/E08/E13)
            self.broll.append({"id": e["_id"], "file": path, "mulai": e["mulai"], "selesai": e["selesai"], "dari": 0.0,
                               "efek": e.get("_efek"), "_r": None, "native": komposisi})
            self.rekam[e["_id"]] = {
                "id": e["_id"], "tipe": "cutaway", "komposisi": komposisi, "beat": e["_beat"], "teks": teks,
                "mulai": round(e["mulai"], 3), "selesai": round(e["selesai"], 3), "delay": 0.0, "induk": None,
                "bbox": [0, 0, p.W, p.H], "bbox_teks": None, "bbox_animasi": None, "efek": e.get("_efek"),
                "overlay": path.name, "anchor": e.get("_anchor_spek"), "anchor_kata": e.get("_anchor", False),
                "fungsi": e.get("fungsi"), "dekoratif": True, "masuk": "potong", "keluar": "potong"}
            if e.get("_sfx_sendiri"):
                peta = p.t("sfx.peta")
                for t, kunci, nama in bunyi:
                    m = peta[kunci]
                    self._daftar_sfx({"file": m["bunyi"]}, e["mulai"] + t, f"{e['_id']}/{nama}", kelas=m["kelas"], otomatis=True)
            return
        kaca = bool(e.get("kaca", spek.kaca if spek and spek.kaca is not None else p.t("blur.panel") > 0))
        L = Lapisan(e["_id"], "remotion", e["mulai"], e["selesai"], 0, 0, ukur_kontras=False,
                    overlay=Overlay(path, p.W, p.H, p.fps, n), kaca=kaca, belakang=bool(e.get("belakang")), **an)
        if spek and spek.kaca:
            L.blur_px = p.px(30)
        L.lensa = bool(spek and spek.lensa)  # E37 liquid-glass: video di balik panel dibiaskan, bukan di-blur
        self.lapisan.append(L)
        self.rekam[L.id] = {
            "id": L.id, "tipe": "remotion", "komposisi": komposisi, "beat": e["_beat"], "teks": teks,
            "mulai": round(L.mulai, 3), "selesai": round(L.selesai, 3), "delay": 0.0,
            "bbox": None, "bbox_teks": None, "bbox_animasi": None,
            "t_ukur": round(L.selesai - an["d_out"] - 1 / p.fps, 3),
            "masuk": an["masuk"], "keluar": an["keluar"], "durasi_masuk": an["d_in"], "durasi_keluar": an["d_out"],
            "easing": an["e_in"].nama, "easing_keluar": an["e_out"].nama, "anchor_kata": e.get("_anchor", False),
            "induk": None, "kontras": None, "efek": e.get("_efek"), "overlay": path.name, "kaca": L.kaca,
            "anchor": e.get("_anchor_spek"), "panel_opasitas": (spek.scrim if spek and spek.scrim else 0.0) if spek and not spek.panel else po,
            "panel_warna": "#000000" if spek and spek.scrim else None, "dekoratif": bool(spek and spek.dekoratif),
            "ukuran": min((p.px(p.t(f"ukuran.{u}")) for u in kt["ukuran"]), default=None),
            "warna": sorted({self._warna_kontrak(w) for w in kt["warna"]}), "stroke": 0,
            "item": len(item) or None, "stagger": stagger if len(item) > 1 else None, "fungsi": e.get("fungsi"),
            "posisi": elemen.get("posisi"),
        }
        if spek and e.get("_sfx_sendiri"):
            peta = p.t("sfx.peta")
            for t, kunci, nama in bunyi:
                m = peta[kunci]
                self._daftar_sfx({"file": m["bunyi"]}, e["mulai"] + t, f"{e['_id']}/{nama}", kelas=m["kelas"], otomatis=True)
        if e.get("sfx_item") and item:  # bunyi saat tiap centang selesai (Checklist: 0,15 + 0,3 s setelah item masuk)
            nama = "pop" if e["sfx_item"] is True else e["sfx_item"]
            for i in range(len(item)):
                t_i = e["mulai"] + an["d_in"] * 0.5 + i * stagger + 0.45
                self._daftar_sfx({"file": nama, "offset": 0}, t_i, f"{L.id}/item{i}")

    def _warna_kontrak(self, nama: str) -> str:
        """Nama warna kontrak teks: token warna, atau "@terang" = yang lebih terang dari teks-utama / latar (teks di atas scrim)."""
        p = self.p
        if nama == "@terang":
            return max((p.t("warna.teks-utama"), p.t("warna.latar")), key=lambda h: sum(hex_rgb(h)))
        return p.t(f"warna.{nama}")

    def _tempel_overlay(self, frame: np.ndarray, L: Lapisan, i: int, t: float) -> None:
        p = self.p
        rgba = L.overlay.ambil(i - int(round(L.mulai * p.fps)))
        if rgba is None:
            return
        a = rgba[..., 3]
        baris, kolom = np.flatnonzero(a.any(axis=1)), np.flatnonzero(a.any(axis=0))
        if baris.size == 0:
            return
        y0, y1, x0, x1 = baris[0], baris[-1] + 1, kolom[0], kolom[-1] + 1
        reg = frame[y0:y1, x0:x1]
        al = a[y0:y1, x0:x1, None].astype(np.float32) / 255.0
        blur = (L.blur_px if L.blur_px is not None else p.px(p.t("blur.panel"))) if L.kaca else 0
        if getattr(L, "lensa", False):
            latar = self._lensa(reg, al)
        else:
            latar = np.where(al > 0.004, cv2.GaussianBlur(reg, (0, 0), blur / 2), reg) if blur > 0 else reg

        rec = self.rekam[L.id]
        kuat = a >= (230 if rec.get("panel_warna") else ALPHA_KOTAK)  # scrim (alpha ±0,6) bukan bagian kotak elemen
        if self.wajah and not L.belakang and self._sampel:  # K00.3: piksel overlay (alpha ≥ 50%) di kotak wajah, bukan kotak gabungan
            k = min(self.wajah, key=lambda r: abs(r["t"] - t))
            if k.get("kotak") and abs(k["t"] - t) <= 0.3:
                fx0, fy0, fx1, fy1 = (int(k["kotak"][0] * p.W), int(k["kotak"][1] * p.H), int(k["kotak"][2] * p.W), int(k["kotak"][3] * p.H))
                if fx1 > fx0 and fy1 > fy0:
                    tutup = float(kuat[fy0:fy1, fx0:fx1].mean())
                    rec["tutup_wajah_px"] = round(max(rec.get("tutup_wajah_px", 0.0), tutup), 3)
        kb, kk = np.flatnonzero(kuat.any(axis=1)), np.flatnonzero(kuat.any(axis=0))
        if kb.size:
            bb = [float(kk[0]), float(kb[0]), float(kk[-1] + 1), float(kb[-1] + 1)]
            ba = rec["bbox_animasi"]
            rec["bbox_animasi"] = bb if ba is None else [min(ba[0], bb[0]), min(ba[1], bb[1]),
                                                         max(ba[2], bb[2]), max(ba[3], bb[3])]
            if rec.get("dekoratif"):  # tanpa teks: kotak = jangkauan seluruh animasi (K00.1)
                rec["bbox"] = rec["bbox_teks"] = rec["bbox_animasi"]
            if self._sampel and rec["kontras"] is None and t + 0.5 / p.fps >= rec["t_ukur"]:
                # latar efektif teks = panel (warna × opasitas token) di atas latar (ter-blur bila kaca)
                rec["bbox"] = rec["bbox_teks"] = bb
                po = rec["panel_opasitas"]
                efektif = latar * (1 - po) + np.float32(hex_rgb(rec.get("panel_warna") or p.t("warna.panel"))) * po
                c = efektif[al[..., 0] >= 0.5][::7] / 255.0
                lin = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
                lum = lin @ np.array([0.2126, 0.7152, 0.0722])
                rec["kontras"] = {"t": round(t, 3), "l_p10": round(float(np.percentile(lum, 10)), 4),
                                  "l_p90": round(float(np.percentile(lum, 90)), 4), "sumber": "panel+latar"}
        reg[:] = rgba[y0:y1, x0:x1, :3].astype(np.float32) * al + latar * (1 - al)
