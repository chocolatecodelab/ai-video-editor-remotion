"""render_pip — bagian Renderer: E45 broll-overlay (jendela b-roll / picture-in-picture di atas talking head) dan lensa
kaca cair E37 liquid-glass (refraksi video di balik panel Remotion)."""
from __future__ import annotations

import cv2
import numpy as np

from render_dasar import Pembaca
from sistem import GagalPipeline, hex_rgb


class PipMixin:
    """Jendela b-roll & lensa kaca. Dipakai sebagai kelas dasar Renderer (render.py)."""

    # ---------------------------------------------------------- E45 broll-overlay
    def _el_pip(self, e):
        """Klip b-roll dalam jendela bersudut bulat di atas rekaman (bukan mengganti latar). Field: file, dari, lebar
        (0–1 zona), rasio ("4:5"), posisi (atas/tengah/bawah) atau x/y, sisi (kiri/kanan/tengah), label."""
        p = self.p
        path = p.path_aset(e.get("file"))
        if not path or not path.exists():
            raise GagalPipeline(f"{e['_id']}: file b-roll {e.get('file')!r} tidak ada.")
        zx0, zy0, zx1, zy1 = self.zona
        w = int((zx1 - zx0) * float(e.get("lebar", 0.5)))
        a, _, b = str(e.get("rasio", "4:5")).partition(":")
        h = int(w * float(b) / float(a))
        sisi = e.get("sisi", "kanan")
        cx = e["x"] * p.W if "x" in e else {"kiri": zx0 + w / 2, "tengah": (zx0 + zx1) / 2}.get(sisi, zx1 - w / 2)
        if "y" in e:
            cy = e["y"] * p.H
        else:
            cy = {"tengah": (zy0 + zy1) / 2, "bawah": zy1 - h / 2 - p.px(180)}.get(e.get("posisi", "atas"), zy0 + h / 2 + p.px(20))
        bingkai = p.t("motif.bingkai", "kaca")
        tebal = p.px(6 if bingkai in ("brutal", "kinetik") else 3)
        radius = 0 if bingkai in ("brutal", "editorial", "hud") else p.px(28)
        self.pip.append({"id": e["_id"], "file": path, "mulai": e["mulai"], "selesai": e["selesai"], "dari": float(e.get("dari", 0)),
                         "w": w, "h": h, "cx": cx, "cy": cy, "tebal": tebal, "radius": radius, "bingkai": bingkai,
                         "masker": self._kotak_bulat(w, h, radius) if radius else np.ones((h, w), np.float32), "_r": None})
        self.rekam[e["_id"]] = {"id": e["_id"], "tipe": "broll-overlay", "beat": e["_beat"], "efek": e.get("_efek"),
                                "mulai": round(e["mulai"], 3), "selesai": round(e["selesai"], 3), "delay": 0.0, "induk": None,
                                "bbox": [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], "bbox_animasi": None,
                                "fungsi": e.get("fungsi"), "anchor": e.get("_anchor_spek"), "anchor_kata": e.get("_anchor", False),
                                "masuk": "pop", "keluar": "fade", "durasi_masuk": 0.35, "durasi_keluar": 0.25, "file": str(path)}

    def _tempel_pip(self, frame: np.ndarray, t: float, sekuensial: bool) -> None:
        p = self.p
        for j in self.pip:
            if not j["mulai"] <= t < j["selesai"]:
                if j["_r"] is not None and t >= j["selesai"]:
                    j["_r"].tutup()
                    j["_r"] = None
                continue
            if j["_r"] is None or not sekuensial:
                if j["_r"]:
                    j["_r"].tutup()
                j["_r"] = Pembaca(j["file"], j["dari"] + (t - j["mulai"]), j["w"], j["h"], p.fps, cover=True)
            isi = self._grade_rekaman(j["_r"].baca()).astype(np.float32)  # K10.2: b-roll ikut grade gaya
            masuk = self.ease["standar"](min(1.0, (t - j["mulai"]) / 0.35))
            keluar = self.ease["keluar"](min(1.0, max(0.0, (t - (j["selesai"] - 0.25)) / 0.25)))
            op = masuk * (1 - keluar)
            s = 0.86 + 0.14 * masuk
            w, h = max(2, int(j["w"] * s)), max(2, int(j["h"] * s))
            isi = cv2.resize(isi, (w, h))
            mk = cv2.resize(j["masker"], (w, h)) * op
            x0, y0 = int(j["cx"] - w / 2), int(j["cy"] - h / 2 + (1 - masuk) * p.px(40))
            # bayangan: keras (brutal) atau lembut
            if j["bingkai"] == "brutal":
                bay = np.zeros((p.H, p.W), np.float32)
                self._tempel_kotak_mask(bay, mk, x0 + p.px(12), y0 + p.px(12))
                frame *= 1 - (bay * 0.9)[..., None]
            else:
                bay = np.zeros((p.H, p.W), np.float32)
                self._tempel_kotak_mask(bay, mk, x0, y0 + p.px(16))
                frame *= 1 - (cv2.GaussianBlur(bay, (0, 0), p.px(18)) * 0.4)[..., None]
            # bingkai: garis warna panel/aksen di sekeliling jendela
            warna = np.float32(hex_rgb(p.t("warna.teks-utama" if j["bingkai"] == "brutal" else "warna.panel")))
            tb = j["tebal"]
            luar = cv2.resize(j["masker"], (w + 2 * tb, h + 2 * tb)) * op
            self._tempel_kotak(frame, np.full((h + 2 * tb, w + 2 * tb, 3), warna), x0 - tb, y0 - tb, luar)
            self._tempel_kotak(frame, isi, x0, y0, mk)
            rec = self.rekam[j["id"]]
            if op > 0.95:
                rec["bbox_animasi"] = [x0 - tb, y0 - tb, x0 + w + tb, y0 + h + tb]

    @staticmethod
    def _tempel_kotak_mask(dasar: np.ndarray, m: np.ndarray, x: int, y: int) -> None:
        H, W = dasar.shape[:2]
        h, w = m.shape[:2]
        a0, b0, a1, b1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
        if a1 > a0 and b1 > b0:
            dasar[b0:b1, a0:a1] = np.maximum(dasar[b0:b1, a0:a1], m[b0 - y:b1 - y, a0 - x:a1 - x])

    # ---------------------------------------------------------- E37 liquid-glass: lensa refraksi
    def _lensa(self, reg: np.ndarray, al: np.ndarray) -> np.ndarray:
        """Video di balik panel kaca cair: tepi membiaskan (sampel ditarik ke dalam, makin kuat dekat tepi), tengah
        sedikit membesar, aberasi kromatik halus per kanal, sedikit lebih terang. `al` = alpha overlay (h, w, 1)."""
        p = self.p
        bentuk = (al[..., 0] > 0.02).astype(np.uint8)
        if not bentuk.any():
            return reg
        d = cv2.distanceTransform(bentuk, cv2.DIST_L2, 5)
        bevel = max(4.0, p.px(44))
        n = np.clip(d / bevel, 0, 1)
        tepi = (1 - n) ** 2 * bentuk
        gx = cv2.Sobel(d, cv2.CV_32F, 1, 0, ksize=5)
        gy = cv2.Sobel(d, cv2.CV_32F, 0, 1, ksize=5)
        pj = np.sqrt(gx * gx + gy * gy) + 1e-6
        gx, gy = gx / pj, gy / pj
        h, w = bentuk.shape
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        ys, xs = np.nonzero(bentuk)
        cx, cy = xs.mean(), ys.mean()
        kuat = p.px(34)
        hasil = np.empty_like(reg)
        for c, faktor in enumerate((1.0, 1.07, 1.14)):  # R, G, B sedikit berbeda → aberasi kromatik di tepi
            mx = xx + gx * tepi * kuat * faktor + (cx - xx) * 0.05 * n
            my = yy + gy * tepi * kuat * faktor + (cy - yy) * 0.05 * n
            hasil[..., c] = cv2.remap(reg[..., c], mx.astype(np.float32), my.astype(np.float32), cv2.INTER_LINEAR,
                                      borderMode=cv2.BORDER_REFLECT)
        hasil = cv2.GaussianBlur(hasil, (0, 0), 0.8) * 1.04
        m = bentuk[..., None].astype(np.float32)
        return np.clip(hasil, 0, 255) * m + reg * (1 - m)
