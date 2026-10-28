"""menyatu — grafis menyatu dengan rekaman (K10): fungsi murni tanpa state Renderer.

1. Grain film: satu lapisan derau di komposit akhir → rekaman, panel, teks, caption dan overlay Remotion mendapat butir
   yang sama (grafis tidak lagi "terlalu bersih" di atas video). Derau ditentukan nomor frame → berurutan = paralel.
2. Grade warna: kurva per kanal (angkat hitam, kontras S, suhu, split-tone bayangan → warna `grade.bayangan`, sorot →
   `grade.sorot`) + saturasi, hanya pada rekaman/b-roll (bukan grafis) → rekaman condong ke palet gaya.
3. Arah cahaya: perbandingan terang sisi kiri/kanan wajah (cache/wajah.json) di beberapa frame rekaman; tanpa wajah →
   separuh kiri/kanan bingkai (keyakinan dipotong). Bayangan grafis jatuh berlawanan dengan sisi yang terang.
"""
from __future__ import annotations

import math

import cv2
import numpy as np

from sistem import hex_rgb

LUMA = np.array([0.2126, 0.7152, 0.0722], np.float32)
SALT_GRAIN = 7919  # seed derau grain ≠ dither ke_uint8 (seed = nomor frame) → keduanya tidak berkorelasi


# ------------------------------------------------------------------ 1. grain

def grain(frame: np.ndarray, i: int, cfg: dict) -> np.ndarray:
    """Tambah grain ke frame float (H, W, 3) 0–255, in place. cfg: kekuatan (simpangan baku, level 8-bit), ukuran
    (px butir), kroma (porsi derau warna), midtone (0 = rata, 1 = hanya nada tengah — seperti film)."""
    k = float(cfg.get("kekuatan", 0))
    if k <= 0:
        return frame
    H, W = frame.shape[:2]
    u = max(1.0, float(cfg.get("ukuran", 1.0)))
    h, w = max(2, int(round(H / u))), max(2, int(round(W / u)))
    rng = np.random.default_rng(SALT_GRAIN + i)
    kroma = float(cfg.get("kroma", 0))

    def medan() -> np.ndarray:
        n = rng.standard_normal((h, w), dtype=np.float32)
        if (h, w) != (H, W):
            n = cv2.resize(n, (W, H), interpolation=cv2.INTER_LINEAR)
        return n / max(float(n.std()), 1e-6)  # interpolasi menurunkan simpangan → normalkan lagi

    lum = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY) / 255.0
    mt = float(cfg.get("midtone", 0.6))
    amp = k * ((1 - mt) + mt * 4 * lum * (1 - lum))
    n = medan() * amp
    frame += n[..., None]
    if kroma > 0:
        c = medan() * amp * kroma
        frame[..., 0] += c
        frame[..., 2] -= c
    return frame


def derau(gray: np.ndarray, mask: np.ndarray, ubin: int = 32, persen: float = 20) -> float | None:
    """Simpangan derau (level 8-bit) di area mask (bool, H×W): high-pass (gray − blur σ1) → σ robust (MAD) per ubin yang
    seluruhnya di dalam mask, lalu persentil rendah antar-ubin = bagian paling rata (tepi teks & tekstur latar tidak ikut
    terhitung). None bila tidak ada ubin."""
    g = gray.astype(np.float32)
    hp = g - cv2.GaussianBlur(g, (0, 0), 1.0)
    H, W = g.shape
    nilai = []
    for y in range(0, H - ubin + 1, ubin):
        for x in range(0, W - ubin + 1, ubin):
            if mask[y:y + ubin, x:x + ubin].all():
                t = hp[y:y + ubin, x:x + ubin]
                nilai.append(1.4826 * float(np.median(np.abs(t - np.median(t)))))
    return float(np.percentile(nilai, persen)) if nilai else None


# ------------------------------------------------------------------ 2. grade

def _arah_kroma(hex_: str | None) -> np.ndarray:
    """Arah warna (tanpa terang): rgb − luma, dinormalkan ke kanal terbesar = 1. Warna netral (abu/hitam) → nol."""
    if not hex_:
        return np.zeros(3, np.float32)
    c = np.array(hex_rgb(hex_), np.float32) / 255.0
    v = c - float(c @ LUMA)
    m = float(np.abs(v).max())
    return v / m if m > 0.02 else np.zeros(3, np.float32)


def lut_grade(cfg: dict, warna: dict) -> tuple[np.ndarray, float]:
    """cfg grade + palet gaya → (LUT uint8 (256, 1, 3) untuk cv2.LUT, saturasi). `kekuatan` menskalakan semuanya."""
    s = float(cfg.get("kekuatan", 1.0))
    x = np.linspace(0, 1, 256, dtype=np.float32)
    y = np.stack([x, x, x], axis=1)
    angkat = s * float(cfg.get("angkat", 0))
    y = angkat + y * (1 - angkat)
    y = y + s * float(cfg.get("kontras", 0)) * (y - 0.5) * 4 * y * (1 - y)
    vb = _arah_kroma(warna.get(cfg.get("bayangan")) if cfg.get("bayangan") else None)
    vs = _arah_kroma(warna.get(cfg.get("sorot")) if cfg.get("sorot") else None)
    y = y + s * float(cfg.get("bayangan-kekuatan", 0)) * ((1 - x) ** 2)[:, None] * vb
    y = y + s * float(cfg.get("sorot-kekuatan", 0)) * (x ** 2)[:, None] * vs
    suhu = s * float(cfg.get("suhu", 0)) * 0.05 * (4 * x * (1 - x))
    y[:, 0] += suhu
    y[:, 2] -= suhu
    lut = np.clip(np.round(y * 255), 0, 255).astype(np.uint8).reshape(256, 1, 3)
    sat = 1 + s * (float(cfg.get("saturasi", 1.0)) - 1)
    return lut, sat


def terapkan_grade(img: np.ndarray, lut: np.ndarray, sat: float) -> np.ndarray:
    """Rekaman uint8 RGB (H, W, 3) → hasil grade (array baru; sumber tidak diubah)."""
    out = cv2.LUT(np.ascontiguousarray(img), lut)
    if abs(sat - 1) > 1e-3:
        g = cv2.cvtColor(cv2.cvtColor(out, cv2.COLOR_RGB2GRAY), cv2.COLOR_GRAY2RGB)
        out = cv2.addWeighted(out, sat, g, 1 - sat, 0)
    return out


def delta_e(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """ΔE76 per piksel antara dua gambar uint8 RGB."""
    la = cv2.cvtColor(a.astype(np.float32) / 255, cv2.COLOR_RGB2LAB)
    lb = cv2.cvtColor(b.astype(np.float32) / 255, cv2.COLOR_RGB2LAB)
    return np.sqrt(((la - lb) ** 2).sum(axis=2))


# ------------------------------------------------------------------ 3. arah cahaya → bayangan

def asimetri_wajah(gray: np.ndarray, kotak: tuple[int, int, int, int]) -> float | None:
    """(terang kanan − kiri) / (kanan + kiri) di pipi/dahi: 80 % lebar tengah, baris 20–85 % kotak, tanpa 12 % garis
    hidung di tengah. Positif = cahaya dari kanan bingkai."""
    x0, y0, x1, y1 = kotak
    w, h = x1 - x0, y1 - y0
    if w < 24 or h < 24:
        return None
    reg = gray[y0 + int(0.2 * h):y0 + int(0.85 * h), x0 + int(0.1 * w):x1 - int(0.1 * w)].astype(np.float32)
    if reg.size == 0:
        return None
    m = reg.shape[1] // 2
    gap = max(1, int(0.06 * w))
    kiri, kanan = float(np.median(reg[:, :m - gap])), float(np.median(reg[:, m + gap:]))
    return (kanan - kiri) / max(kanan + kiri, 1.0)


def asimetri_bingkai(gray: np.ndarray) -> float:
    """Tanpa wajah: separuh atas bingkai, sepertiga kiri vs kanan."""
    H, W = gray.shape
    reg = gray[: int(0.6 * H)].astype(np.float32)
    kiri, kanan = float(reg[:, : W // 3].mean()), float(reg[:, -W // 3:].mean())
    return (kanan - kiri) / max(kanan + kiri, 1.0)


def perkiraan_cahaya(asimetri: list[float], sumber: str, cfg: dict) -> dict:
    """Asimetri per sampel → {sudut (° dari bawah, + = bayangan ke kanan), keyakinan 0–1, sumber, asimetri}.
    Keyakinan = kesepakatan tanda antar-sampel × kekuatan asimetri (≥ `asimetri-penuh` = penuh); bingkai tanpa wajah ×½."""
    if not asimetri:
        return {"sudut": 0.0, "keyakinan": 0.0, "sumber": "bawaan", "asimetri": None, "sampel": 0}
    a = np.array(asimetri, np.float32)
    rata = float(np.median(a))
    penuh = float(cfg.get("asimetri-penuh", 0.15))
    sepakat = float(np.mean(np.sign(a) == np.sign(rata))) if rata else 0.0
    yakin = sepakat * min(1.0, abs(rata) / penuh) * (1.0 if sumber == "wajah" else 0.5)
    maks = float(cfg.get("sudut-maks", 40))
    sudut = -maks * max(-1.0, min(1.0, rata / penuh))  # cahaya dari kanan → bayangan ke kiri
    return {"sudut": round(sudut, 1), "keyakinan": round(yakin, 2), "sumber": sumber, "asimetri": round(rata, 4),
            "sampel": len(asimetri)}


def putar(offset: list[float], derajat: float, batas: float = 60.0) -> tuple[list[int], float]:
    """Putar vektor bayangan token (0° = lurus ke bawah) sebesar `derajat`; sudut akhir dibatasi ±batas agar bayangan
    tetap jatuh ke bawah. → (offset baru dibulatkan, putaran efektif)."""
    ox, oy = float(offset[0]), float(offset[1])
    pj = math.hypot(ox, oy)
    if pj < 0.5:
        return [int(ox), int(oy)], 0.0
    awal = math.degrees(math.atan2(ox, oy))
    akhir = max(-batas, min(batas, awal + derajat))
    r = math.radians(akhir)
    return [int(round(pj * math.sin(r))), int(round(pj * math.cos(r)))], round(akhir - awal, 1)
