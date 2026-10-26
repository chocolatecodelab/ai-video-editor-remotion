"""render_dasar — bahan dasar komposit render.py: easing token, sprite premultiplied & transform, pembaca video
(ffmpeg pipe) & overlay Remotion, lapisan elemen + animasi masuk/keluar."""
from __future__ import annotations

import subprocess
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import TYPE_CHECKING

import cv2
import numpy as np
from PIL import Image

from sistem import GagalPipeline, Proyek, ffprobe, stream

if TYPE_CHECKING:
    from render_panel import Panel
    from render_teks import Sprite


# ============================================================== easing


class Easing:
    """cubic-bezier(x1, y1, x2, y2) seperti CSS, via tabel lookup."""

    def __init__(self, nama: str, kurva):
        self.nama = nama
        if kurva == "linear":
            kurva = [0, 0, 1, 1]
        x1, y1, x2, y2 = kurva
        t = np.linspace(0, 1, 2001)
        b = lambda p1, p2: 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3
        self.xs, self.ys = b(x1, x2), b(y1, y2)

    def __call__(self, x: float) -> float:
        return float(np.interp(min(max(x, 0.0), 1.0), self.xs, self.ys))


# ============================================================== sprite & compositing


def ke_premult(img: Image.Image) -> np.ndarray:
    a = np.asarray(img.convert("RGBA"), np.float32) / 255.0
    a[..., :3] *= a[..., 3:4]
    return a


@dataclass
class Transform:
    cx: float
    cy: float
    s: float
    op: float


def bbox_transform(w: int, h: int, tr: Transform) -> tuple[float, float, float, float]:
    return (tr.cx - w * tr.s / 2, tr.cy - h * tr.s / 2, tr.cx + w * tr.s / 2, tr.cy + h * tr.s / 2)


def tempel(frame: np.ndarray, spr: np.ndarray, trs: list[Transform]) -> None:
    """Komposit sprite premultiplied ke frame (float32 0–255). >1 transform = motion blur (rata-rata sampel)."""
    trs = [t for t in trs if t.op > 0.002 and t.s > 0.01]
    if not trs:
        return
    h, w = spr.shape[:2]
    H, W = frame.shape[:2]
    kotak = [bbox_transform(w, h, t) for t in trs]
    x0 = max(0, int(np.floor(min(k[0] for k in kotak))))
    y0 = max(0, int(np.floor(min(k[1] for k in kotak))))
    x1 = min(W, int(np.ceil(max(k[2] for k in kotak))))
    y1 = min(H, int(np.ceil(max(k[3] for k in kotak))))
    if x1 <= x0 or y1 <= y0:
        return
    acc = np.zeros((y1 - y0, x1 - x0, 4), np.float32)
    for t in trs:
        tx, ty = t.cx - t.s * w / 2 - x0, t.cy - t.s * h / 2 - y0
        if t.s == 1.0 and tx == int(tx) and ty == int(ty):
            ix, iy = int(tx), int(ty)
            sx0, sy0 = max(0, -ix), max(0, -iy)
            dx0, dy0 = max(0, ix), max(0, iy)
            ww, hh = min(w - sx0, acc.shape[1] - dx0), min(h - sy0, acc.shape[0] - dy0)
            if ww > 0 and hh > 0:
                acc[dy0:dy0 + hh, dx0:dx0 + ww] += spr[sy0:sy0 + hh, sx0:sx0 + ww] * t.op
        else:
            M = np.float32([[t.s, 0, tx], [0, t.s, ty]])
            acc += cv2.warpAffine(spr, M, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR,
                                  borderMode=cv2.BORDER_CONSTANT, borderValue=0) * t.op
    if len(trs) > 1:
        acc /= len(trs)
    reg = frame[y0:y1, x0:x1]
    reg *= 1.0 - acc[..., 3:4]
    reg += acc[..., :3] * 255.0


def warp_penuh(img: np.ndarray, s: float, fx: float, fy: float) -> np.ndarray:
    """Skala gambar penuh terhadap titik fokus (push-in)."""
    if abs(s - 1.0) < 1e-4:
        return img
    M = np.float32([[s, 0, fx * (1 - s)], [0, s, fy * (1 - s)]])
    return cv2.warpAffine(img, M, (img.shape[1], img.shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


# ============================================================== lapisan


@dataclass
class Lapisan:
    id: str
    tipe: str
    mulai: float
    selesai: float
    cx: float                     # pusat posisi diam
    cy: float
    sprite: Sprite | None = None
    panel: Panel | None = None
    masuk: str = "fade"
    keluar: str = "fade"
    d_in: float = 0.3
    d_out: float = 0.2
    e_in: Easing | None = None
    e_out: Easing | None = None
    delay: float = 0.0
    belakang: bool = False        # depth
    induk: str | None = None      # id elemen logis (untuk anak kartu)
    ukur_kontras: bool = True
    overlay: "Overlay | None" = None  # elemen remotion: animasi sudah ada di overlay
    kaca: bool = False                # backdrop blur di bawah overlay (Remotion tak bisa melihat video)
    blur_px: float | None = None      # kekuatan blur kaca khusus (glass-type); None = token blur.panel

    @property
    def wh(self):
        return (self.panel.w, self.panel.h) if self.panel else (self.sprite.w, self.sprite.h)


class Animator:
    def __init__(self, p: Proyek):
        self.p = p
        self.jarak = p.px(p.t("gerak.jarak-naik"))
        self.s0 = p.t("gerak.skala-pop")

    def __call__(self, L: Lapisan, t: float) -> Transform | None:
        a = L.mulai + L.delay
        if t < a or t >= L.selesai:
            return None
        op, dx, dy, s = 1.0, 0.0, 0.0, 1.0
        if L.masuk != "tidak" and L.d_in > 0:
            pr = (t - a) / L.d_in
            if pr < 1:
                e = L.e_in(pr)
                if L.masuk == "fade":
                    op *= e
                elif L.masuk == "naik":
                    op *= min(1, pr * 2)
                    dy += self.jarak * (1 - e)
                elif L.masuk == "turun":
                    op *= min(1, pr * 2)
                    dy -= self.jarak * (1 - e)
                elif L.masuk == "geser":
                    op *= min(1, pr * 2)
                    dx += self.jarak * 1.5 * (1 - e)
                elif L.masuk == "pop":
                    op *= min(1, pr * 3)
                    s *= self.s0 + (1 - self.s0) * e
        if L.keluar != "tidak" and L.d_out > 0:
            pr = (t - (L.selesai - L.d_out)) / L.d_out
            if pr > 0:
                e = L.e_out(pr)
                op *= 1 - e
                if L.keluar == "naik":
                    dy -= self.jarak * 0.5 * e
                elif L.keluar == "pop":
                    s *= 1 - (1 - self.s0) * 0.5 * e
        return Transform(L.cx + dx, L.cy + dy, s, op)


# ============================================================== pembaca video


# nama matriks ffprobe (color_space) → nama opsi in_color_matrix filter scale
MATRIKS_SCALE = {"bt709": "bt709", "smpte170m": "smpte170m", "bt470bg": "bt470", "bt2020nc": "bt2020", "bt2020c": "bt2020",
                 "fcc": "fcc", "smpte240m": "smpte240m"}


@lru_cache(maxsize=64)
def matriks_masuk(path: str) -> tuple[str, str]:
    """(in_color_matrix, in_range) untuk konversi YUV → RGB. Ditulis eksplisit: tanpa itu ffmpeg menganggap video tanpa
    tag sebagai BT.601 (video SD lama), padahal klip HD hampir selalu BT.709 → warna bergeser (merah bata 200,50,50
    terbaca 184,30,48). Tanpa tag: BT.709 untuk tinggi ≥ 720 px, BT.601 untuk SD; range TV."""
    try:
        vs = stream(ffprobe(Path(path)), "video") or {}
    except GagalPipeline:
        return "bt709", "tv"
    m = MATRIKS_SCALE.get(str(vs.get("color_space") or ""))
    if not m:
        m = "bt709" if int(vs.get("height") or 0) >= 720 else "smpte170m"
    r = vs.get("color_range") if vs.get("color_range") in ("tv", "pc") else "tv"
    return m, r


class Pembaca:
    """Baca frame RGB berurutan via ffmpeg pipe, di-scale 'cover' ke W×H."""

    def __init__(self, path, mulai: float, W: int, H: int, fps: int, cover: bool = False, rgba: bool = False):
        m, r = matriks_masuk(str(path))
        warna = f"in_color_matrix={m}:in_range={r}"
        # resize tetap di YUV dengan matriks yang sama (tanpa out_color_matrix, scale mengonversi ke BT.601)
        vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase:{warna}:out_color_matrix={m}:out_range={r},"
              f"crop={W}:{H},") if cover else ""
        ch, fmt = (4, "rgba") if rgba else (3, "rgb24")
        # seek ¼ frame lebih awal: frame k (pts k/fps) tidak terbuang karena pembulatan waktu seek, dan filter fps
        # memetakan keluaran 0 ke frame k (terdekat) → seek ke frame mana pun = hasil baca berurutan dari 0
        ss = max(0.0, mulai - 0.25 / fps)
        cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{ss:.6f}", "-i", str(path),
               "-vf", f"{vf}fps={fps},scale={warna},format={fmt}", "-f", "rawvideo", "-"]
        self.proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stdin=subprocess.DEVNULL)
        self.n, self.shape, self.akhir = W * H * ch, (H, W, ch), None

    def baca(self) -> np.ndarray:
        buf = self.proc.stdout.read(self.n)
        if len(buf) == self.n:
            self.akhir = np.frombuffer(buf, np.uint8).reshape(self.shape)
        if self.akhir is None:
            raise GagalPipeline("Gagal membaca frame video.")
        return self.akhir

    def tutup(self):
        self.proc.kill()  # hentikan dulu, baru tutup pipe → ffmpeg tidak mencetak 'Broken pipe'
        self.proc.wait()
        self.proc.stdout.close()


class Overlay:
    """Overlay Remotion (ProRes 4444, alpha lurus) dibaca berurutan; lompatan → buka ulang di frame tujuan."""

    def __init__(self, path, W: int, H: int, fps: int, n: int):
        self.path, self.W, self.H, self.fps, self.n = path, W, H, fps, n
        self.r: Pembaca | None = None
        self.berikut = -1

    def ambil(self, k: int) -> np.ndarray | None:
        if not 0 <= k < self.n:
            return None
        if self.r is None or k != self.berikut:
            self.tutup()
            self.r = Pembaca(self.path, k / self.fps, self.W, self.H, self.fps, rgba=True)
        self.berikut = k + 1
        return self.r.baca()

    def tutup(self) -> None:
        if self.r:
            self.r.tutup()
            self.r = None
