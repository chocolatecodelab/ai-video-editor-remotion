"""render_teks — teks PIL: markup *aksen*, sprite teks (wrap, stroke, bayangan, karaoke), hiasan kata khas gaya."""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from render_dasar import ke_premult
from sistem import Proyek, cari_font, hex_rgb


# ============================================================== teks


def parse_teks(teks: str) -> list[list[list[tuple[str, bool]]]]:
    """Paragraf → kata → potongan (teks, aksen). Aksen '*…*' boleh melintasi kata; tanda baca
    setelah '*' tetap menempel: '*kata kunci*?' → [[('kata',T)], [('kunci',T), ('?',F)]]."""
    paragraf, aksen = [], False
    for baris in teks.split("\n"):
        kata = []
        for token in baris.split():
            runs = []
            for i, bagian in enumerate(token.split("*")):
                if i:
                    aksen = not aksen
                if bagian:
                    runs.append((bagian, aksen))
            if runs:
                kata.append(runs)
        paragraf.append(kata)
    return paragraf


def teks_kata(runs) -> str:
    return "".join(r[0] for r in runs)


@dataclass
class Sprite:
    img: np.ndarray
    info: dict

    @property
    def w(self): return self.img.shape[1]
    @property
    def h(self): return self.img.shape[0]


HIAS_KATA = {"stabilo", "garis", "lingkar", "target", "selotip", "arsir", "kotak"}  # "kilau" hanya beranimasi (Remotion)


def hias_kata(jenis: str, kotak: list, size: int, wh: tuple, aksen2: tuple) -> tuple[Image.Image, Image.Image]:
    """Hiasan kata aksen versi diam (PIL) — sama jenisnya dengan HiasKata di remotion/src/lib/motif.tsx.
    kotak: [(x, y, lebar, asc, desc, warna_hex)] → (lapisan di belakang teks, lapisan di depan teks)."""
    k = 2
    W, H = wh
    bawah = Image.new("RGBA", (W * k, H * k), (0, 0, 0, 0))
    atas = Image.new("RGBA", (W * k, H * k), (0, 0, 0, 0))
    gb, ga = ImageDraw.Draw(bawah), ImageDraw.Draw(atas)
    tebal = max(3, int(size * 0.07)) * k
    for i, (x, y, w, asc, desc, c) in enumerate(kotak):
        warna = hex_rgb(c)
        rng = np.random.default_rng(int(x * 31 + y * 17 + i))
        x0, x1 = x * k, (x + w) * k
        y_atas, y_dasar = (y + asc * 0.18) * k, (y + asc) * k
        tinggi = y_dasar - y_atas
        if jenis == "kotak":  # kotak highlight penuh warna aksen; huruf digambar ulang warna latar (lihat Penata.teks)
            gb.rectangle([x0 - 8 * k, y_atas - asc * 0.22 * k, x1 + 8 * k, y_dasar + desc * 0.55 * k], fill=warna + (255,))
        elif jenis == "stabilo":
            gb.rectangle([x0 - 4 * k, y_dasar - tinggi * 0.5, x1 + 4 * k, y_dasar + desc * 0.35 * k], fill=aksen2 + (110,))
        elif jenis == "selotip":
            poli = [(x0 - 8 * k, y_atas - 2 * k), (x1 + 8 * k, y_atas + 3 * k), (x1 + 6 * k, y_dasar + desc * 0.6 * k),
                    (x0 - 10 * k, y_dasar + desc * 0.4 * k)]
            gb.polygon(poli, fill=aksen2 + (125,))
        elif jenis == "garis":
            yy = y_dasar + desc * 0.55 * k
            ga.line([(x0, yy), (x1, yy)], fill=warna + (255,), width=tebal)
        elif jenis == "arsir":
            yy = y_dasar + desc * 0.4 * k
            for xx in np.arange(x0, x1, 7 * k):
                ga.line([(xx, yy + 10 * k), (xx + 7 * k, yy)], fill=warna + (230,), width=max(2, tebal // 2))
        elif jenis == "lingkar":
            cx, cy = (x0 + x1) / 2, (y_atas + y_dasar) / 2 + desc * 0.2 * k
            rx, ry = (x1 - x0) / 2 + size * 0.22 * k, (y_dasar - y_atas) / 2 + size * 0.24 * k
            titik = [(cx + rx * (1 + rng.uniform(-0.04, 0.04)) * np.cos(a), cy + ry * (1 + rng.uniform(-0.06, 0.06)) * np.sin(a))
                     for a in np.linspace(-np.pi * 0.85, np.pi * 1.25, 28)]
            ga.line(titik, fill=warna + (255,), width=tebal, joint="curve")
        elif jenis == "target":
            m = size * 0.16 * k
            L = size * 0.24 * k
            a0, b0, a1, b1 = x0 - m, y_atas - m, x1 + m, y_dasar + desc * 0.3 * k + m
            for (px_, py_, dx, dy) in ((a0, b0, 1, 1), (a1, b0, -1, 1), (a0, b1, 1, -1), (a1, b1, -1, -1)):
                ga.line([(px_ + dx * L, py_), (px_, py_), (px_, py_ + dy * L)], fill=warna + (255,), width=tebal)
    kecil = lambda im: im.resize((W, H), Image.LANCZOS)
    return kecil(bawah), kecil(atas)


class Penata:
    def __init__(self, p: Proyek):
        self.p = p
        self.spasi = p.t("spasi.baris")
        # cache per objek (bukan lru_cache di method: cache kelas menahan `self` → Penata lama tak pernah dibebaskan
        # di batch multi-proyek seperti video.py pratinjau)
        self._font: dict[tuple[str, int], ImageFont.FreeTypeFont] = {}

    def font(self, peran: str, ukuran: int) -> ImageFont.FreeTypeFont:
        if (peran, ukuran) not in self._font:
            self._font[(peran, ukuran)] = self._muat_font(peran, ukuran)
        return self._font[(peran, ukuran)]

    def _muat_font(self, peran: str, ukuran: int) -> ImageFont.FreeTypeFont:
        f = ImageFont.truetype(str(cari_font(self.p.t(f"font.{peran}.file"))), ukuran)
        wght = self.p.t(f"font.{peran}.wght", 0)
        if wght:  # variable font (Inter, Baloo 2, Playfair Display): sumbu berat dari token, optical size ikut ukuran
            nilai = []
            for a in f.get_variation_axes():
                nama = a["name"].decode() if isinstance(a["name"], bytes) else a["name"]
                if nama.lower() == "weight":
                    nilai.append(max(a["minimum"], min(a["maximum"], wght)))
                elif nama.lower().startswith("optical"):
                    nilai.append(max(a["minimum"], min(a["maximum"], ukuran)))
                else:
                    nilai.append(a["default"])
            f.set_variation_by_axes(nilai)
        return f

    def teks(self, teks: str, peran: str, ukuran: int, lebar_maks: int, warna: str, aksen: str | None = None,
             stroke: int = 0, warna_stroke: str | None = None, bayangan: bool = True, rata: str = "tengah",
             aktif: int | None = None, warna_aktif: str | None = None, huruf_besar: bool = False,
             maks_karakter: int | None = None, redup: float | None = None, hias: str | None = None) -> Sprite:
        """redup (0–1): mode karaoke — kata setelah `aktif` digambar dengan opasitas ini.
        hias: motif.aksen gaya (stabilo, garis, lingkar, target, selotip, arsir) untuk kata *aksen* (diam)."""
        p = self.p
        para = parse_teks(teks.upper() if huruf_besar else teks)
        datar = [(teks_kata(k), k) for pr in para for k in pr]
        size = ukuran
        while True:
            f = self.font(peran, size)
            sp = f.getlength(" ")
            baris: list[list[int]] = []
            i = 0
            for pr in para:
                cur, cw, cc = [], 0.0, 0
                for runs in pr:
                    w = teks_kata(runs)
                    ww = f.getlength(w)
                    lewat_px = cur and cw + sp + ww > lebar_maks - 2 * stroke
                    lewat_ch = cur and maks_karakter and cc + 1 + len(w) > maks_karakter
                    if lewat_px or lewat_ch:
                        baris.append(cur)
                        cur, cw, cc = [], 0.0, 0
                    cw = ww if not cur else cw + sp + ww
                    cc = len(w) if not cur else cc + 1 + len(w)
                    cur.append(i)
                    i += 1
                baris.append(cur)
            lebar = [sum(f.getlength(datar[j][0]) for j in b) + sp * max(0, len(b) - 1) for b in baris]
            if max(lebar) <= lebar_maks - 2 * stroke or size <= 16:
                break
            size = int(size * 0.92)

        asc, desc = f.getmetrics()
        lh = int(round(size * self.spasi))
        tinggi = lh * (len(baris) - 1) + asc + desc
        b_off = p.t("bayangan.offset") if bayangan else [0, 0]
        b_blur = p.t("bayangan.blur") if bayangan else 0
        pad = stroke + int(b_blur * 2 + max(abs(b_off[0]), abs(b_off[1]))) + 4
        if hias in HIAS_KATA:
            pad += int(size * 0.3)
        W, H = int(max(lebar)) + 2 * pad, tinggi + 2 * pad
        kotak_aksen = []
        lap = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        bay = Image.new("RGBA", (W, H), (0, 0, 0, 0)) if bayangan else None
        d, db = ImageDraw.Draw(lap), (ImageDraw.Draw(bay) if bay else None)
        warna_dipakai = set()
        for li, b in enumerate(baris):
            x = pad + ((max(lebar) - lebar[li]) / 2 if rata == "tengah" else 0)
            y = pad + li * lh
            for j in b:
                w, runs = datar[j]
                a = int(255 * redup) if (redup is not None and aktif is not None and j > aktif) else 255
                kw = dict(font=f, stroke_width=stroke,
                          stroke_fill=hex_rgb(warna_stroke) + (a,) if stroke else None)
                if db and a == 255:
                    db.text((x + b_off[0], y + b_off[1]), w, fill=hex_rgb(p.t("warna.bayangan")), **kw)
                xr = x
                for bagian, ak in runs:
                    c = warna_aktif if (aktif is not None and j == aktif and warna_aktif) else (aksen if ak and aksen else warna)
                    kotak = hias == "kotak" and ak and aksen and bagian.strip()
                    if a == 255 and not kotak:
                        warna_dipakai.add(c)
                    lap_k = Image.new("RGBA", lap.size, (0, 0, 0, 0)) if a < 255 else None
                    (ImageDraw.Draw(lap_k) if lap_k else d).text((xr, y), bagian, fill=hex_rgb(p.t("warna.latar") if kotak else c) + (a,),
                                                                 **(dict(kw, stroke_width=0) if kotak else kw))
                    if lap_k:
                        lap = Image.alpha_composite(lap, lap_k)
                        d = ImageDraw.Draw(lap)
                    if ak and aksen and bagian.strip():
                        kotak_aksen.append((xr, y, f.getlength(bagian.rstrip(".,!?:;")), asc, desc, c))
                    xr += f.getlength(bagian)
                x += f.getlength(w) + sp
        if hias in HIAS_KATA and kotak_aksen:
            bawah, atas = hias_kata(hias, kotak_aksen, size, (W, H), hex_rgb(p.t("warna.aksen-2")))
            lap = Image.alpha_composite(Image.alpha_composite(bawah, lap), atas)
        if bay:
            bay = bay.filter(ImageFilter.GaussianBlur(b_blur / 2)) if b_blur else bay
            a = np.asarray(bay, np.float32)
            a[..., 3] *= p.t("warna.bayangan-opasitas")
            bay = Image.fromarray(a.clip(0, 255).astype(np.uint8))
            lap = Image.alpha_composite(bay, lap)
        info = {"ukuran": size, "baris": len(baris),
                "karakter_baris_maks": max(len(" ".join(datar[j][0] for j in b)) for b in baris),
                "kata": len(datar), "warna": sorted(warna_dipakai), "stroke": stroke,
                "warna_stroke": warna_stroke if stroke else None, "pad": pad}
        return Sprite(ke_premult(lap), info)
