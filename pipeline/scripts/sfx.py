"""sfx — pustaka bunyi motion (sintesis numpy, deterministik, tanpa unduhan) + perakit bus SFX.

Bunyi: nama dasar → beberapa varian ("pop" → pop-1..pop-3) agar bunyi berulang tidak identik.
File di-cache di pipeline/aset-bawaan/sfx/v2/<nama>.wav (48 kHz, stereo, 16-bit).

    python pipeline/scripts/sfx.py            # buat semua bunyi + lembar dengar out: pipeline/aset-bawaan/sfx/v2/_semua.wav
"""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

from sistem import ROOT, GagalPipeline, log

SR = 48000
DIR = ROOT / "pipeline" / "aset-bawaan" / "sfx" / "v2"


# ---------------------------------------------------------------- bahan
def _t(d: float) -> np.ndarray:
    return np.arange(int(d * SR)) / SR


def _noise(n: int, rng: np.random.Generator) -> np.ndarray:
    return rng.standard_normal(n).astype(np.float64)


def _lowpass(x: np.ndarray, fc) -> np.ndarray:
    """Low-pass satu kutub; fc boleh array (cutoff berubah per sampel → sapuan)."""
    fc = np.broadcast_to(np.asarray(fc, np.float64), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def _highpass(x: np.ndarray, fc) -> np.ndarray:
    return x - _lowpass(x, fc)


def _band(x: np.ndarray, lo, hi) -> np.ndarray:
    return _lowpass(_highpass(x, lo), hi)


def _env(n: int, serang: float, lepas: float, kurva: float = 4.0) -> np.ndarray:
    """Amplop serang linear → peluruhan eksponensial."""
    t = np.arange(n) / SR
    a = np.clip(t / max(serang, 1e-4), 0, 1)
    d = np.exp(-kurva * np.clip(t - serang, 0, None) / max(lepas, 1e-4))
    return a * d


def _lonceng(n: int, puncak: float) -> np.ndarray:
    """Amplop naik-turun halus (whoosh): puncak di fraksi `puncak`."""
    x = np.linspace(0, 1, n)
    naik = np.clip(x / puncak, 0, 1) ** 2
    turun = np.clip((1 - x) / (1 - puncak), 0, 1) ** 1.5
    return naik * turun


def _sinus(f, d: float, fase: float = 0.0) -> np.ndarray:
    """Osilator dengan frekuensi konstan atau array (glide)."""
    n = int(round(d * SR))
    f = np.broadcast_to(np.asarray(f, np.float64), (n,))
    return np.sin(2 * np.pi * np.cumsum(f) / SR + fase)


def _stereo(x: np.ndarray, pan=0.0, lebar: float = 0.0, rng=None) -> np.ndarray:
    """pan −1..1 (boleh array → bergerak), lebar = sedikit dekorelasi kiri/kanan."""
    pan = np.broadcast_to(np.asarray(pan, np.float64), x.shape)
    kiri, kanan = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L, R = x * kiri * np.sqrt(2), x * kanan * np.sqrt(2)
    if lebar and rng is not None:
        geser = int(SR * 0.0007)
        R = (1 - lebar) * R + lebar * np.concatenate([np.zeros(geser), R[:-geser]])
    return np.stack([L, R], axis=1)


def _normal(x: np.ndarray, puncak_db: float) -> np.ndarray:
    m = np.max(np.abs(x)) or 1.0
    return x / m * 10 ** (puncak_db / 20)


# ---------------------------------------------------------------- resep (nama, varian) → stereo float
def _klik_ketik(v: int) -> np.ndarray:
    rng = np.random.default_rng(100 + v)
    n = int(0.045 * SR)
    klik = _band(_noise(n, rng), 1800 + 500 * v, 7000) * _env(n, 0.0008, 0.012, 5)
    dentum = _sinus(180 + 25 * v, 0.045) * _env(n, 0.001, 0.02, 6) * 0.35
    return _stereo(_normal(klik + dentum, -3), pan=rng.uniform(-0.15, 0.15))


def _tick(v: int) -> np.ndarray:
    d = 0.06
    x = _sinus(2600 + 300 * v, d) * _env(int(d * SR), 0.0006, 0.018, 5) + \
        _sinus(5200 + 600 * v, d) * _env(int(d * SR), 0.0006, 0.008, 5) * 0.3
    return _stereo(_normal(x, -4))


def _pop(v: int) -> np.ndarray:
    d = 0.16
    n = int(d * SR)
    f = np.geomspace(700 + 120 * v, 260 + 30 * v, n)
    x = _sinus(f, d) * _env(n, 0.002, 0.07, 4)
    rng = np.random.default_rng(200 + v)
    x += _band(_noise(n, rng), 2000, 6000) * _env(n, 0.0005, 0.006, 5) * 0.15
    return _stereo(_normal(x, -3))


def _whoosh(v: int, d: float, puncak: float, mundur: bool = False) -> np.ndarray:
    rng = np.random.default_rng(300 + v + int(d * 10))
    n = int(d * SR)
    am = _lonceng(n, puncak)
    fc = 250 + 3800 * am ** 1.5
    x = _lowpass(_lowpass(_highpass(_noise(n, rng), 120), fc), fc) * am  # 2 kutub: hembusan, bukan desis
    x += _lowpass(_noise(n, rng), 180) * am * 0.6  # badan rendah
    pan = np.linspace(-0.6, 0.6, n) * (1 if v % 2 else -1)
    s = _stereo(_normal(x, -3), pan=pan, lebar=0.3, rng=rng)
    return s[::-1].copy() if mundur else s


def _ding(v: int, benar: bool) -> np.ndarray:
    if benar:  # dua nada naik (kuint), halus
        d = 0.75
        n = int(d * SR)
        a = _sinus(1318.5, d) * _env(n, 0.003, 0.35, 3)
        b = np.concatenate([np.zeros(int(0.07 * SR)), _sinus(1975.5, d - 0.07) * _env(n - int(0.07 * SR), 0.003, 0.4, 3)])
        x = a + 0.8 * b + 0.15 * _sinus(3951, d) * _env(n, 0.002, 0.12, 4)
    else:      # dua nada turun, sedikit kasar
        d = 0.45
        n = int(d * SR)
        a = np.sign(_sinus(392 - 20 * v, d)) * 0.25 + _sinus(392 - 20 * v, d)
        b = np.concatenate([np.zeros(int(0.11 * SR)), _sinus(311, d - 0.11)])
        x = (a * _env(n, 0.003, 0.12, 3) + 0.9 * b * _env(n, 0.11, 0.2, 3))
        x = _lowpass(x, 2500)
    return _stereo(_normal(x, -4))


def _riser(v: int) -> np.ndarray:
    rng = np.random.default_rng(400 + v)
    d = 1.3
    n = int(d * SR)
    naik = np.linspace(0, 1, n) ** 2
    x = _lowpass(_lowpass(_highpass(_noise(n, rng), 400), 600 + 7000 * naik), 600 + 7000 * naik) * naik
    x += _sinus(np.geomspace(200, 1600, n), d) * naik * 0.25
    x *= np.clip((d - np.arange(n) / SR) / 0.03, 0, 1)
    return _stereo(_normal(x, -4), lebar=0.4, rng=rng)


def _hit(v: int) -> np.ndarray:
    rng = np.random.default_rng(500 + v)
    d = 0.5
    n = int(d * SR)
    f = np.geomspace(120 - 10 * v, 42, n)
    x = _sinus(f, d) * _env(n, 0.002, 0.25, 4)
    x += _band(_noise(n, rng), 800, 5000) * _env(n, 0.0005, 0.02, 5) * 0.5
    return _stereo(_normal(np.tanh(2.2 * x), -2))


def _glitch(v: int) -> np.ndarray:
    rng = np.random.default_rng(600 + v)
    d = 0.22
    n = int(d * SR)
    blok = rng.integers(200, 900, size=40)
    x = np.zeros(n)
    i = 0
    for b in blok:
        if i >= n:
            break
        seg = min(b, n - i)
        x[i:i + seg] = (_sinus(rng.uniform(300, 3000), seg / SR) if rng.random() < 0.6 else _noise(seg, rng)) * rng.uniform(0.2, 1)
        i += seg + int(rng.integers(0, 300))
    x = np.round(x * 6) / 6  # kuantisasi kasar (bitcrush)
    return _stereo(_normal(x * _env(n, 0.001, 0.15, 2), -5), pan=rng.uniform(-0.3, 0.3))


def _ketuk(v: int) -> np.ndarray:
    """Ketukan lembut (kartu kertas/kaca mendarat)."""
    rng = np.random.default_rng(700 + v)
    d = 0.12
    n = int(d * SR)
    x = _band(_noise(n, rng), 300, 2200 + 300 * v) * _env(n, 0.001, 0.03, 5)
    x += _sinus(220 + 40 * v, d) * _env(n, 0.001, 0.04, 6) * 0.5
    return _stereo(_normal(x, -4))


def _kilau(v: int) -> np.ndarray:
    """Taburan nada tinggi naik (ledakan partikel/reveal)."""
    rng = np.random.default_rng(800 + v)
    d = 0.7
    n = int(round(d * SR))
    x = np.zeros(n)
    for k in range(9):
        t0 = int((0.02 + k * 0.055 + rng.uniform(0, 0.02)) * SR)
        f = 1800 * 2 ** ((k + rng.integers(0, 3)) / 6)
        m = n - t0
        x[t0:] += _sinus(f, m / SR) * _env(m, 0.002, 0.09, 4) * (1 - k / 14)
    x += _band(_noise(n, rng), 5000, 12000) * _env(n, 0.01, 0.25, 3) * 0.08
    return _stereo(_normal(x, -5), pan=np.linspace(-0.4, 0.4, n), lebar=0.5, rng=rng)


def _gores(v: int) -> np.ndarray:
    """Goresan spidol/pena (coret kata): noise bergetar dengan nada bergerak."""
    rng = np.random.default_rng(900 + v)
    d = 0.32
    n = int(round(d * SR))
    getar = 1 + 0.6 * np.sin(2 * np.pi * (38 + 6 * v) * np.arange(n) / SR)
    fc = np.linspace(1500, 3800, n)
    x = _lowpass(_highpass(_noise(n, rng), 900), fc) * getar * _lonceng(n, 0.3)
    return _stereo(_normal(x, -5), pan=np.linspace(-0.3, 0.3, n))


RESEP = {
    "klik-ketik": (4, _klik_ketik),
    "tick": (3, _tick),
    "pop": (3, _pop),
    "ketuk": (3, _ketuk),
    "whoosh-pendek": (3, lambda v: _whoosh(v, 0.42, 0.55)),
    "whoosh-panjang": (2, lambda v: _whoosh(v, 0.9, 0.6)),
    "swoosh-balik": (2, lambda v: _whoosh(v, 0.5, 0.25, mundur=True)),  # membesar pelan, berhenti tajam
    "ding-benar": (1, lambda v: _ding(v, True)),
    "ding-salah": (1, lambda v: _ding(v, False)),
    "riser": (2, _riser),
    "hit": (2, _hit),
    "glitch": (3, _glitch),
    "kilau": (2, _kilau),
    "gores": (2, _gores),
}
ALIAS = {"whoosh": "whoosh-pendek"}  # nama v0.1
# Detik dari awal file ke puncak bunyi: render menggeser bunyi ini lebih awal agar puncaknya jatuh tepat di gerak.
PUNCAK = {"whoosh-pendek": 0.42 * 0.55, "whoosh-panjang": 0.9 * 0.6, "swoosh-balik": 0.5 * 0.75, "riser": 1.27}


def _tulis(path: Path, s: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = (np.clip(s, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def baca(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as w:
        if w.getsampwidth() != 2:
            raise GagalPipeline(f"{path.name}: hanya WAV 16-bit yang didukung bus SFX.")
        x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float32) / 32768
        ch, sr = w.getnchannels(), w.getframerate()
    x = x.reshape(-1, ch)
    if ch == 1:
        x = np.repeat(x, 2, axis=1)
    if sr != SR:
        idx = np.arange(0, len(x), sr / SR)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, k]) for k in range(2)], axis=1).astype(np.float32)
    return x


def puncak(nama: str) -> float:
    return PUNCAK.get(ALIAS.get(nama, nama), 0.0)


def varian(nama: str) -> int:
    nama = ALIAS.get(nama, nama)
    if nama not in RESEP:
        raise GagalPipeline(f"SFX '{nama}' tidak ada. Bawaan: {', '.join(RESEP)}.")
    return RESEP[nama][0]


def file_bunyi(nama: str, k: int = 0) -> Path:
    """Path WAV varian ke-k (dibuat & di-cache bila belum ada)."""
    nama = ALIAS.get(nama, nama)
    n_var, fungsi = RESEP[nama] if nama in RESEP else (None, None)
    if fungsi is None:
        raise GagalPipeline(f"SFX '{nama}' tidak ada. Bawaan: {', '.join(RESEP)}.")
    v = k % n_var + 1
    path = DIR / f"{nama}-{v}.wav"
    if not path.exists():
        _tulis(path, fungsi(v))
    return path


def rakit_bus(daftar: list[dict], durasi: float, tujuan: Path) -> dict:
    """Satukan semua SFX ({file, t, db}) menjadi satu WAV stereo sepanjang video."""
    n = int(np.ceil(durasi * SR)) + 1
    bus = np.zeros((n, 2), np.float32)
    cache: dict[str, np.ndarray] = {}
    for s in daftar:
        x = cache.get(s["file"])
        if x is None:
            x = cache[s["file"]] = baca(Path(s["file"]))
        i = int(round(s["t"] * SR))
        if i >= n:
            continue
        m = min(len(x), n - i)
        bus[i:i + m] += x[:m] * np.float32(10 ** (s["db"] / 20))
    puncak = float(np.max(np.abs(bus))) if len(bus) else 0.0
    if puncak > 0.98:  # jaga bus dari clipping sebelum dicampur (loudnorm akhir tetap mengatur level total)
        bus *= 0.98 / puncak
    _tulis(tujuan, bus)
    return {"jumlah": len(daftar), "puncak_db": round(20 * np.log10(max(puncak, 1e-9)), 1)}


def main() -> int:
    potongan = []
    for nama, (n_var, _) in RESEP.items():
        for k in range(n_var):
            p = file_bunyi(nama, k)
            potongan.append(baca(p))
            potongan.append(np.zeros((int(0.35 * SR), 2), np.float32))
            log("sfx", f"{p.relative_to(ROOT).as_posix()}")
    _tulis(DIR / "_semua.wav", np.concatenate(potongan))
    log("sfx", f"lembar dengar → {(DIR / '_semua.wav').relative_to(ROOT).as_posix()}")
    return 0


if __name__ == "__main__":
    from sistem import main_aman
    main_aman(main)
