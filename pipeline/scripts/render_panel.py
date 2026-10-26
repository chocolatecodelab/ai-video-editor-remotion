"""render_panel — panel kaca/solid ber-motif gaya (token motif.bingkai), ikon kartu info, lingkaran status chip,
penyusunan sprite."""
from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from render_dasar import Transform, bbox_transform, ke_premult, tempel
from render_teks import Sprite
from sistem import Proyek, cari_font, hex_rgb


# Ikon kartu info: glyph Segoe Fluent Icons (font bawaan Windows 11).
FONT_IKON = "SegoeIcons.ttf"
IKON = {"gambar": "", "teks": "", "video": "", "musik": "", "orang": "", "hati": "",
        "kalender": "", "jam": "", "bintang": "", "petir": "", "kunci": "",
        "lapisan": "", "cek": "", "silang": "", "info": "", "ide": "", "pesan": "",
        "target": "", "grafik": "", "kamera": "", "dokumen": "", "rumah": "",
        "dunia": "", "kirim": "", "lampiran": "", "cari": "", "bel": "",
        "kartu": "", "tanya": ""}

# ============================================================== ikon & susunan (kartu info, chip)


def _pangkas(img: np.ndarray) -> np.ndarray:
    a = img[..., 3]
    b, k = np.flatnonzero(a.any(axis=1)), np.flatnonzero(a.any(axis=0))
    return img[b[0]:b[-1] + 1, k[0]:k[-1] + 1] if b.size else img


def _di_atas(dasar: np.ndarray, img: np.ndarray, x: int, y: int) -> None:
    h, w = img.shape[:2]
    reg = dasar[y:y + h, x:x + w]
    reg[:] = img + reg * (1 - img[..., 3:4])


def susun_vertikal(sprites: list, jarak: int) -> np.ndarray:
    """Tumpuk sprite (premult) rata kiri, margin transparan dipangkas."""
    imgs = [_pangkas(s.img) for s in sprites]
    W, H = max(i.shape[1] for i in imgs), sum(i.shape[0] for i in imgs) + jarak * (len(imgs) - 1)
    out = np.zeros((H, W, 4), np.float32)
    y = 0
    for i in imgs:
        _di_atas(out, i, 0, y)
        y += i.shape[0] + jarak
    return out


def susun_horizontal(sprites: list, jarak: int) -> np.ndarray:
    """Jajarkan sprite (premult) tengah-vertikal, margin transparan dipangkas."""
    imgs = [_pangkas(s.img) for s in sprites]
    W, H = sum(i.shape[1] for i in imgs) + jarak * (len(imgs) - 1), max(i.shape[0] for i in imgs)
    out = np.zeros((H, W, 4), np.float32)
    x = 0
    for i in imgs:
        _di_atas(out, i, x, (H - i.shape[0]) // 2)
        x += i.shape[1] + jarak
    return out


def sprite_ikon(nama: str, ukuran: int, warna: str) -> Sprite:
    f = ImageFont.truetype(str(cari_font(FONT_IKON)), ukuran)
    s = int(ukuran * 1.5)
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((s / 2, s / 2), IKON[nama], font=f, fill=hex_rgb(warna), anchor="mm")
    return Sprite(ke_premult(img), {"pad": 0})


def sprite_status(status: str, d: int, warna: str, warna_isi: str, nomor: str, font) -> Sprite:
    """Lingkaran berwarna + centang / silang / nomor (vektor, supersample 4×)."""
    k = 4
    img = Image.new("RGBA", (d * k, d * k), (0, 0, 0, 0))
    g = ImageDraw.Draw(img)
    g.ellipse([0, 0, d * k - 1, d * k - 1], fill=hex_rgb(warna))
    tebal = max(2, int(d * k * 0.11))
    isi = hex_rgb(warna_isi)
    if status == "benar":
        g.line([(d * k * .28, d * k * .53), (d * k * .44, d * k * .68), (d * k * .73, d * k * .36)], fill=isi,
               width=tebal, joint="curve")
    elif status == "salah":
        for a, b in (((.32, .32), (.68, .68)), ((.68, .32), (.32, .68))):
            g.line([(d * k * a[0], d * k * a[1]), (d * k * b[0], d * k * b[1])], fill=isi, width=tebal)
    img = img.resize((d, d), Image.LANCZOS)
    if status == "nomor" and nomor:
        ImageDraw.Draw(img).text((d / 2, d / 2), nomor, font=font, fill=isi, anchor="mm")
    return Sprite(ke_premult(img), {"pad": 0})


# ============================================================== panel kaca / solid


@dataclass
class Panel:
    w: int
    h: int
    mask: np.ndarray            # (h, w) float 0–1
    garis: np.ndarray | None    # sprite premult
    bayangan: np.ndarray | None
    bay_off: tuple
    warna: np.ndarray
    opas: float
    blur: float


def _goyah(titik: list, amp: float, rng: np.random.Generator) -> list:
    return [(x + rng.uniform(-amp, amp), y + rng.uniform(-amp, amp)) for x, y in titik]


def _keliling(w: float, h: float, n: int, inset: float) -> list:
    """Titik di keliling persegi (searah jarum jam), n per sisi."""
    a, b = inset, inset
    c, d = w - inset, h - inset
    sisi = [((a, b), (c, b)), ((c, b), (c, d)), ((c, d), (a, d)), ((a, d), (a, b))]
    return [(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n) for (x0, y0), (x1, y1) in sisi for i in range(n)]


def hias_panel(p: Proyek, w: int, h: int, k: int, m: Image.Image, g: Image.Image, warna_garis: str, garis_opas: float,
               radius: int) -> bool:
    """Motif gaya (token motif.bingkai) untuk panel PIL ber-garis (judul ber-panel, kartu, info, chip): mengubah mask
    `m` & menggambar garis/hiasan di `g` (keduanya supersample ×k). → True bila garis tepi bawaan sudah diganti."""
    bingkai = p.t("motif.bingkai", "kaca")
    W, H = w * k, h * k
    gm, gg = ImageDraw.Draw(m), ImageDraw.Draw(g)
    aksen, aksen2, utama = (hex_rgb(p.t(f"warna.{n}")) for n in ("aksen", "aksen-2", "teks-utama"))
    rng = np.random.default_rng(w * 7919 + h)
    if bingkai == "kinetik":
        gg.rectangle([0, 0, 9 * k, H], fill=aksen + (255,))
        return False
    if bingkai == "hud":
        c = min(22 * k, H // 3)
        m.paste(0, [0, 0, W, H])
        poli = [(c, 0), (W, 0), (W, H - c), (W - c, H), (0, H), (0, c)]
        gm.polygon(poli, fill=255)
        gg.line(poli + [poli[0]], fill=aksen + (150,), width=2 * k, joint="curve")
        L = min(34 * k, W // 4, H // 2)
        for (x, y, dx, dy) in ((c // 2, c // 2 + L, 0, -1), (W - 2 * k, 2 * k, -1, 0), (W - c // 2, H - c // 2 - L, 0, 1),
                               (2 * k, H - 2 * k, 1, 0)):
            gg.line([(x, y), (x + dx * L, y + dy * L)], fill=aksen + (255,), width=4 * k)
        return True
    if bingkai == "kertas":
        f = min(40 * k, H // 3, W // 4)
        gm.polygon([(W - f, 0), (W, 0), (W, f)], fill=0)
        gg.polygon([(W - f, 0), (W - f, f), (W, f)], fill=utama + (46,))
        return False
    if bingkai == "minimal":
        gg.rectangle([20 * k, 0, 68 * k, 3 * k], fill=aksen + (255,))
        return True
    if bingkai == "brutal":
        gg.rectangle([0, 0, W - 1, H - 1], outline=hex_rgb(warna_garis) + (255,), width=5 * k)
        return True
    if bingkai == "editorial":
        gg.rectangle([0, 0, W, 5 * k], fill=utama + (255,))
        gg.rectangle([0, H - int(1.5 * k), W, H], fill=utama + (255,))
        return True
    if bingkai == "kolase":
        n = 16
        atas = [(W * i / n, rng.uniform(0, 1.6) / 100 * H + rng.uniform(0, 3 * k)) for i in range(n + 1)]
        bawah = [(W * i / n, H - rng.uniform(0, 4 * k)) for i in range(n, -1, -1)]
        m.paste(0, [0, 0, W, H])
        gm.polygon(atas + bawah, fill=255)
        for kiri in (True, False):
            tw, th = min(110 * k, W // 3), 30 * k
            pita = Image.new("RGBA", (tw, th), aksen2 + (140,))
            pita = pita.rotate(-9 if kiri else 8, expand=True, resample=Image.BICUBIC)
            g.alpha_composite(pita, (int(18 * k) if kiri else W - pita.width - int(18 * k), -int(th * 0.35)))
        return False
    if bingkai in ("spidol", "pensil"):
        spidol = bingkai == "spidol"
        for s in range(1 if spidol else 2):
            t = _goyah(_keliling(W, H, 7, 3 * k), (2.6 if spidol else 1.6) * k, rng)
            gg.line(t + [t[0]], fill=utama + (255 if spidol else 200,), width=int((4.5 if spidol else 1.8) * k), joint="curve")
        if not spidol:
            for i in range(7):
                x = W - 80 * k + i * 10 * k
                gg.line([(x, H - 14 * k), (x + 24 * k, H - 44 * k)], fill=utama + (110,), width=int(1.4 * k))
        return True
    return False  # kaca / jendela: garis tepi tipis bawaan


def buat_panel(p: Proyek, w: int, h: int, radius: int, warna: str, opas: float, garis_opas: float,
               warna_garis: str, blur: float) -> Panel:
    k = 3
    m = Image.new("L", (w * k, h * k), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w * k - 1, h * k - 1], radius=min(radius, h // 2) * k, fill=255)
    garis = None
    if garis_opas > 0:
        g = Image.new("RGBA", (w * k, h * k), (0, 0, 0, 0))
        if not hias_panel(p, w, h, k, m, g, warna_garis, garis_opas, radius):
            tepi = Image.new("RGBA", (w * k, h * k), (0, 0, 0, 0))
            ImageDraw.Draw(tepi).rounded_rectangle([1, 1, w * k - 2, h * k - 2], radius=min(radius, h // 2) * k,
                                                   outline=hex_rgb(warna_garis) + (int(255 * garis_opas),), width=2 * k)
            g = Image.alpha_composite(tepi, g)
        garis = ke_premult(g.resize((w, h), Image.LANCZOS))
    mask = np.asarray(m.resize((w, h), Image.LANCZOS), np.float32) / 255.0
    bay, off = None, (0, 0)
    bb = p.t("bayangan.blur")
    bo = p.t("warna.bayangan-opasitas")
    if bo > 0:
        pad = int(bb * 2) + 2
        s = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
        ImageDraw.Draw(s).rounded_rectangle([pad, pad, pad + w, pad + h], radius=min(radius, h // 2),
                                            fill=hex_rgb(p.t("warna.bayangan")) + (int(255 * bo),))
        if bb:
            s = s.filter(ImageFilter.GaussianBlur(bb / 2))
        bay, off = ke_premult(s), tuple(p.t("bayangan.offset"))
    return Panel(w, h, mask, garis, bay, off, np.float32(hex_rgb(warna)), opas, blur)


def tempel_panel(frame: np.ndarray, pn: Panel, tr: Transform) -> None:
    if tr.op <= 0.002:
        return
    if pn.bayangan is not None:
        tempel(frame, pn.bayangan, [Transform(tr.cx + pn.bay_off[0] * tr.s, tr.cy + pn.bay_off[1] * tr.s, tr.s, tr.op)])
    H, W = frame.shape[:2]
    x0f, y0f, x1f, y1f = bbox_transform(pn.w, pn.h, tr)
    x0, y0, x1, y1 = max(0, int(x0f)), max(0, int(y0f)), min(W, int(np.ceil(x1f))), min(H, int(np.ceil(y1f)))
    if x1 <= x0 or y1 <= y0:
        return
    M = np.float32([[tr.s, 0, x0f - x0], [0, tr.s, y0f - y0]])
    m = cv2.warpAffine(pn.mask, M, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR, borderValue=0)[..., None] * tr.op
    reg = frame[y0:y1, x0:x1]
    isi = cv2.GaussianBlur(reg, (0, 0), pn.blur / 2) if pn.blur > 0 else reg
    isi = isi * (1 - pn.opas) + pn.warna * pn.opas
    reg *= 1 - m
    reg += isi * m
    if pn.garis is not None:
        tempel(frame, pn.garis, [tr])
