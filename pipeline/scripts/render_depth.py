"""render_depth — bagian Renderer: teks depth (rotoscope, K02) — corak dari token, penataan otomatis di atas kepala dari
mask, ukur bagian huruf tertutup subjek."""
from __future__ import annotations

import cv2
import numpy as np

from render_dasar import Lapisan, Transform, bbox_transform
from render_teks import Sprite
from sistem import hex_rgb


class DepthMixin:
    """Teks depth. Dipakai sebagai kelas dasar Renderer (render.py)."""

    def _el_depth(self, e):
        p = self.p
        # gaya teks rotoscope: field elemen > token motif.depth (gradien · padat · garis)
        corak = "gradien" if e.get("gradien") else e.get("corak", p.t("motif.depth", "gradien"))
        warna_dasar = e.get("warna", "teks-utama" if "warna" in e or corak == "gradien" else "aksen")
        spr = self.pen.teks(e["teks"], "depth", p.px(e.get("ukuran", p.t("ukuran.depth"))), self._lebar_maks(e),
                            p.t(f"warna.{warna_dasar}"), aksen=p.t("warna.aksen"), bayangan=False)
        if corak == "garis":  # hanya garis tepi: cincin = dilasi(alpha) − alpha
            tebal = max(3, p.px(7))
            img = np.pad(spr.img, ((tebal, tebal), (tebal, tebal), (0, 0)))
            a = img[..., 3]
            cincin = np.clip(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * tebal + 1, 2 * tebal + 1))) - a, 0, 1)
            img = np.zeros_like(img)
            img[..., :3] = (np.float32(hex_rgb(p.t(f"warna.{warna_dasar}"))) / 255.0) * cincin[..., None]
            img[..., 3] = cincin
            spr = Sprite(img, dict(spr.info, warna=[p.t(f"warna.{warna_dasar}")]))
        if corak == "gradien":  # isian gradien horizontal dari warna token (gaya rotoscope)
            nama = e["gradien"] if isinstance(e.get("gradien"), list) else ["aksen", "aksen-2", "peringatan"]
            stop = np.float32([hex_rgb(p.t(f"warna.{n}")) for n in nama]) / 255.0
            x = np.linspace(0, len(stop) - 1, spr.w)
            i = np.minimum(x.astype(int), len(stop) - 2)
            grad = stop[i] + (stop[i + 1] - stop[i]) * (x - i)[:, None]
            spr.img[..., :3] = grad[None, :, :] * spr.img[..., 3:4]
            spr.info["warna"] = [p.t(f"warna.{n}") for n in nama]
        e.setdefault("y", 0.30)
        cx, cy = self._pusat(e, spr.w, spr.h, "atas")
        L = Lapisan(e["_id"], "depth", e["mulai"], e["selesai"], cx, cy, sprite=spr, belakang=True,
                    ukur_kontras=False, **self._anim_dasar(e, "naik"))
        self.lapisan.append(L)
        self._catat(L, e, peran="depth")
        self._depth_tunda.append((L, e))

    def _ukur_tutup_depth(self, L: Lapisan, m: np.ndarray) -> None:
        """K02.3: bagian huruf depth (alpha) yang tertutup subjek pada frame ini → rata-rata & maksimum di catatan."""
        if not self._sampel:
            return
        h, w = L.sprite.h, L.sprite.w
        x0, y0 = int(round(L.cx - w / 2)), int(round(L.cy - h / 2))
        a0, b0, a1, b1 = max(0, x0), max(0, y0), min(self.p.W, x0 + w), min(self.p.H, y0 + h)
        if a1 <= a0 or b1 <= b0:
            return
        al = L.sprite.img[b0 - y0:b1 - y0, a0 - x0:a1 - x0, 3]
        jml = float(al.sum())
        if jml <= 0:
            return
        f = float((al * m[b0:b1, a0:a1, 0]).sum() / jml)
        rec = self.rekam[L.id]
        u = rec.setdefault("tertutup", {"n": 0, "jumlah": 0.0, "maks": 0.0})
        u["n"] += 1
        u["jumlah"] = round(u["jumlah"] + f, 4)
        u["maks"] = round(max(u["maks"], f), 3)

    def _bentuk_depth(self, e, skala: float) -> Sprite:
        """Sprite teks depth pada skala ukuran tertentu (untuk penataan ulang otomatis)."""
        e2 = dict(e, ukuran=int(e.get("ukuran", self.p.t("ukuran.depth")) * skala), _bangun_ulang=True)
        simpan = self.lapisan, self.rekam.get(e["_id"]), self._depth_tunda
        self.lapisan, self._depth_tunda = [], []
        try:
            self._el_depth(e2)
            return self.lapisan[0].sprite
        finally:
            self.lapisan, self._depth_tunda = simpan[0], simpan[2]
            if simpan[1] is not None:
                self.rekam[e["_id"]] = simpan[1]

    def _tata_depth(self) -> None:
        """Teks rotoscope (K02.3/K02.6): letakkan DI ATAS kepala dengan sedikit tumpang (≤ depth.tutup-maks tinggi huruf
        tertutup), memakai titik tertinggi kepala (mask roto) selama elemen tampil; hindari teks lain yang tampil
        bersamaan; ruang kurang → kecilkan huruf (≥ 60 %). Tanpa mask (still/storyboard sebelum roto) → posisi `y`."""
        p = self.p
        tutup = float(p.t("depth.tutup-maks", 0.25))
        jarak = p.px(18)
        zx0, zy0, zx1, zy1 = self.zona
        for L, e in self._depth_tunda:
            if e.get("tetap"):
                continue
            n0, n1 = int(L.mulai * p.fps), int(L.selesai * p.fps)
            sampel = [self._mask(i) for i in range(n0, n1, max(1, int(p.fps * 0.2)))]
            sampel = [m for m in sampel if m is not None]
            if not sampel:
                continue
            if not self._tata_satu(L, e, sampel, tutup, jarak):
                # tidak muat: URUTKAN, jangan tumpuk — tampil setelah elemen yang bentrok selesai (≥ 1,5 s tersisa)
                akhir = max((r["selesai"] for r in self._bentrok(L)), default=L.mulai)
                if L.selesai - (akhir + 0.15) >= 1.5:
                    L.mulai = round(akhir + 0.15, 3)
                    self.rekam[L.id]["mulai"] = L.mulai
                    self.peringatan.append(f"{L.id}: teks depth digeser ke {L.mulai:.1f}s (setelah elemen lain) agar tidak bertumpuk")
                    sampel = [m for m in (self._mask(i) for i in range(int(L.mulai * p.fps), int(L.selesai * p.fps),
                                                                          max(1, int(p.fps * 0.2)))) if m is not None]
                    if self._tata_satu(L, e, sampel, tutup, jarak):
                        continue
                self.lapisan.remove(L)  # tidak pernah tampil terpotong: lebih baik dihilangkan
                self.rekam.pop(L.id, None)
                self.peringatan.append(f"{L.id}: teks depth dihilangkan — tidak ada ruang terbaca di atas kepala "
                                       f"(pendekkan teks / beri jeda dari elemen lain)")

    def _bentrok(self, L) -> list[dict]:
        """Catatan elemen teks/panel lain yang tampil bersamaan dengan L (bukan caption/latar/hiasan)."""
        return [r for r in self.rekam.values()
                if r["id"] != L.id and not r.get("induk") and not r.get("dekoratif")
                and r["tipe"] not in ("caption", "latar", "depth") and min(r["selesai"], L.selesai) - max(r["mulai"], L.mulai) > 0.05]

    def _tata_satu(self, L, e, sampel, tutup: float, jarak: int) -> bool:
        p = self.p
        zx0, zy0, zx1, zy1 = self.zona
        if True:
            # pita terlarang: teks/panel lain yang tampil bersamaan & bersinggungan horizontal
            larang = []
            for r in self._bentrok(L):
                b = r.get("bbox")
                if b is None and r["tipe"] == "remotion":  # overlay belum dirender: perkiraan pita dari posisi
                    pos = r.get("posisi") or "tengah"
                    tinggi = p.H * 0.26
                    b = {"atas": [zx0, zy0, zx1, zy0 + tinggi], "bawah": [zx0, zy1 - tinggi, zx1, zy1]}.get(
                        pos, [zx0, (zy0 + zy1) / 2 - tinggi / 2, zx1, (zy0 + zy1) / 2 + tinggi / 2])
                if b:
                    larang.append((b[1] - jarak, b[3] + jarak))
            for skala in (1.0, 0.88, 0.76, 0.66, 0.6):
                spr = L.sprite if skala == 1.0 else self._bentuk_depth(e, skala)
                a = spr.img[..., 3]
                baris = np.flatnonzero(a.max(axis=1) > 0.3)
                if baris.size == 0:
                    break
                g0, g1 = int(baris[0]), int(baris[-1]) + 1          # glyph di dalam sprite
                hg = g1 - g0
                x0 = int(max(0, L.cx - spr.w / 2))
                x1 = int(min(p.W, L.cx + spr.w / 2))
                puncak = []
                for m in sampel:
                    kol = m[:, x0:x1] > 0.5
                    ada = np.flatnonzero(kol.any(axis=1))
                    if ada.size:
                        puncak.append(int(ada[0]))
                kepala = min(puncak) if puncak else zy1               # titik tertinggi subjek di bawah teks
                bawah_maks = kepala + tutup * hg                      # dasar huruf boleh turun sedikit ke kepala
                # cari dasar huruf tertinggi-yang-dekat-kepala yang bebas dari pita terlarang & di zona aman
                kandidat = [bawah_maks] + [lo for lo, _ in larang if lo < bawah_maks]
                pilih = None
                for bw in sorted(kandidat, reverse=True):
                    atas = bw - hg
                    if atas < zy0:
                        continue
                    if all(bw <= lo or atas >= hi for lo, hi in larang):
                        pilih = bw
                        break
                if pilih is not None:
                    if skala != 1.0:
                        L.sprite = spr
                    L.cy = pilih - hg / 2 - (g0 + g1) / 2 + spr.h / 2
                    rec = self.rekam[L.id]
                    w_, h_ = L.wh
                    rec["bbox"] = [round(v, 1) for v in bbox_transform(w_, h_, Transform(L.cx, L.cy, 1, 1))]
                    pad = L.sprite.info["pad"]  # kotak teks ikut posisi baru (QA K00.1/K02.6 memakai bbox_teks)
                    x0, y0, x1, y1 = rec["bbox"]
                    rec["bbox_teks"] = [x0 + pad, y0 + pad, x1 - pad, y1 - pad]
                    rec["depth_tata"] = {"skala": skala, "kepala_y": kepala, "tutup_rencana": round(
                        max(0.0, min(1.0, (pilih - kepala) / hg)), 2)}
                    return True
            return False
