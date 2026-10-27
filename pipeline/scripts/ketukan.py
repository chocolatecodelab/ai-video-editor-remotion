"""ketukan — sinkron ketukan musik latar: grid ketukan (BPM + fase), titik mulai musik yang menjatuhkan ketukan di
potongan/reveal penting, dan snap kecil waktu potongan ke ketukan terdekat.

Musik bawaan (musik.py) punya tempo pasti dan loop yang mulai di ketukan → grid tanpa deteksi. File musik pengguna:
tempo dideteksi dari onset (spectral flux) + autokorelasi, fase dari lipatan onset pada periode itu.
Ucapan tidak pernah digeser — yang digeser titik mulai musik (sebebas satu periode) dan potongan ±toleransi."""
from __future__ import annotations

import numpy as np

SR_ANALISIS = 22050
HOP = 256
N_FFT = 1024
BPM_MIN, BPM_MAX, BPM_TENGAH = 60.0, 180.0, 110.0
SIGMA_SKOR = 0.05  # s — sebaran skor kedekatan ke ketukan saat memilih titik mulai musik


def onset(x: np.ndarray, sr: int = SR_ANALISIS) -> np.ndarray:
    """Kekuatan onset per hop: spectral flux positif dari magnitudo log, dikurangi rata-rata bergerak."""
    n = N_FFT
    if len(x) < n + HOP:
        return np.zeros(1)
    jendela = np.hanning(n).astype(np.float32)
    bingkai = np.lib.stride_tricks.sliding_window_view(x, n)[::HOP] * jendela
    mag = np.log1p(np.abs(np.fft.rfft(bingkai, axis=1)) * 10)
    flux = np.maximum(0, np.diff(mag, axis=0)).sum(axis=1)
    rata = np.convolve(flux, np.ones(32) / 32, mode="same")
    return np.maximum(0, flux - rata)


def tempo_fase(env: np.ndarray, sr: int = SR_ANALISIS) -> tuple[float, float]:
    """Onset → (bpm, fase detik ketukan pertama). Tempo: autokorelasi berbobot log-normal di sekitar BPM_TENGAH."""
    dt = HOP / sr
    env = env - env.mean()
    ac = np.correlate(env, env, mode="full")[len(env) - 1:]
    lag = np.arange(len(ac))
    bpm = np.where(lag > 0, 60 / (np.maximum(lag, 1) * dt), 0)
    sah = (bpm >= BPM_MIN) & (bpm <= BPM_MAX)
    bobot = np.exp(-0.5 * (np.log2(np.maximum(bpm, 1) / BPM_TENGAH) / 0.9) ** 2)
    skor = np.where(sah, ac * bobot, -np.inf)
    k = int(np.argmax(skor))
    if 1 <= k < len(ac) - 1 and np.isfinite(skor[k - 1]) and np.isfinite(skor[k + 1]):  # puncak parabola (sub-hop)
        a, b, c = ac[k - 1], ac[k], ac[k + 1]
        k = k + 0.5 * (a - c) / (a - 2 * b + c) if a - 2 * b + c != 0 else k
    periode = k * dt
    # fase: jumlah onset di grid φ + n·periode, φ dicari per 5 ms. Onset ke-i = selisih jendela i+1 dan i → waktunya
    # tengah jendela i+1 (½ jendela FFT + satu hop)
    t = np.arange(len(env)) * dt + (N_FFT / 2 + HOP) / sr
    kandidat = np.arange(0, periode, 0.005)
    skor_fase = [np.interp(np.arange(f, t[-1], periode), t, env).sum() for f in kandidat]
    return 60 / periode, float(kandidat[int(np.argmax(skor_fase))])


def deteksi(x: np.ndarray, sr: int = SR_ANALISIS) -> tuple[float, float]:
    return tempo_fase(onset(x, sr), sr)


def titik(fase: float, periode: float, durasi: float) -> list[float]:
    """Waktu semua ketukan di video untuk grid (fase video, periode)."""
    return [round(float(t), 4) for t in np.arange(fase % periode, durasi, periode)]


def pilih_fase(periode: float, peristiwa: list[tuple[float, float]], langkah: float = 0.005) -> float:
    """Fase grid video (0 ≤ φ < periode) yang menjatuhkan ketukan paling dekat ke peristiwa berbobot [(t, bobot)]."""
    if not peristiwa:
        return 0.0
    t = np.array([p[0] for p in peristiwa])
    w = np.array([p[1] for p in peristiwa])
    terbaik, skor_maks = 0.0, -1.0
    for f in np.arange(0, periode, langkah):
        d = (t - f) % periode
        d = np.minimum(d, periode - d)
        skor = float((w * np.exp(-0.5 * (d / SIGMA_SKOR) ** 2)).sum())
        if skor > skor_maks + 1e-9:
            terbaik, skor_maks = float(f), skor
    return terbaik


def ofset_musik(fase_file: float, fase_video: float, periode: float) -> float:
    """Detik di file musik tempat pemutaran dimulai agar ketukan file (fase_file + n·periode) jatuh di fase_video."""
    return round((fase_file - fase_video) % periode, 4)


def snap(t: float, ketuk: list[float], toleransi: float) -> float:
    """Waktu → ketukan terdekat bila jaraknya ≤ toleransi, selain itu tetap."""
    if not ketuk:
        return t
    k = min(ketuk, key=lambda x: abs(x - t))
    return k if abs(k - t) <= toleransi else t
