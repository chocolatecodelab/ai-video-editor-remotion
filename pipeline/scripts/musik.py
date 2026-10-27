"""musik — musik latar bawaan (sintesis numpy/scipy, deterministik, tanpa unduhan), loop 8 bar yang menyambung mulus.

Dipakai lewat manifest: "aset": {"musik": "bawaan:pulsa"} atau {"musik": {"file": "bawaan:lofi", "db": -20}}.
Render mengulang loop sepanjang video (-stream_loop) dan men-duck musik terhadap suara.

    python pipeline/scripts/musik.py      # buat semua musik bawaan → pipeline/aset-bawaan/musik/<nama>.wav
Karakter:
    pulsa  — pad + bass + kick/hat lembut (teknologi, UI, tutorial cepat)
    lembut — pad hangat + arpeggio lonceng jarang (tenang, edukatif, kaca/kertas)
    lofi   — e-piano bergetar + kick/snare pelan berayun + desis piringan hitam (santai, coffee/doodle)
"""
from __future__ import annotations

import numpy as np
from scipy.signal import butter, lfilter

from sistem import ROOT, GagalPipeline, log
from sfx import SR, _normal, _tulis

DIR = ROOT / "pipeline" / "aset-bawaan" / "musik"
A4 = 440.0
# progresi (semitone dari A): Am – F – C – G, tiap akord 2 bar
PROGRESI = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]]
BPM = {"pulsa": 96, "lembut": 78, "lofi": 82}  # loop mulai tepat di ketukan pertama → grid ketukan = n·60/BPM (ketukan.py)


def _hz(semi: float, oktaf: int = 0) -> float:
    return A4 * 2 ** (semi / 12 + oktaf)


def _lp(x: np.ndarray, fc: float, orde: int = 2) -> np.ndarray:
    b, a = butter(orde, fc / (SR / 2), "low")
    return lfilter(b, a, x)


def _hp(x: np.ndarray, fc: float, orde: int = 2) -> np.ndarray:
    b, a = butter(orde, fc / (SR / 2), "high")
    return lfilter(b, a, x)


def _env(n: int, a: float, r: float) -> np.ndarray:
    t = np.arange(n) / SR
    return np.clip(t / max(a, 1e-4), 0, 1) * np.exp(-t / max(r, 1e-4))


def _pad(f: float, d: float, rng) -> np.ndarray:
    """Tiga osilator segitiga sedikit sumbang → lembut setelah low-pass."""
    t = np.arange(int(d * SR)) / SR
    x = sum(2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * (1 + det) * t + rng.uniform(0, 6))) for det in (-0.004, 0, 0.005))
    naik = np.clip(t / 0.6, 0, 1)
    turun = np.clip((d - t) / 0.8, 0, 1)
    return x / 3 * naik * turun


def _taruh(buf: np.ndarray, x: np.ndarray, t: float, gain: float = 1.0) -> None:
    i = int(t * SR)
    m = min(len(x), len(buf) - i)
    if m > 0:
        buf[i:i + m] += x[:m] * gain


def _kick(d=0.35) -> np.ndarray:
    n = int(d * SR)
    f = np.geomspace(110, 42, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.002, 0.11)


def _hat(rng, d=0.06) -> np.ndarray:
    n = int(d * SR)
    return _hp(rng.standard_normal(n), 7000) * _env(n, 0.001, 0.018)


def _snare(rng, d=0.22) -> np.ndarray:
    n = int(d * SR)
    return _lp(_hp(rng.standard_normal(n), 1200), 6000) * _env(n, 0.001, 0.06) * 0.7 + \
        np.sin(2 * np.pi * 190 * np.arange(n) / SR) * _env(n, 0.001, 0.04) * 0.4


def _bel(f: float, d=1.2) -> np.ndarray:
    n = int(d * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t)) * _env(n, 0.003, 0.35)


def _epiano(f: float, d: float) -> np.ndarray:
    n = int(d * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * t) * np.exp(-t * 3))
    return x * _env(n, 0.004, 0.9) * (1 + 0.25 * np.sin(2 * np.pi * 4.5 * t))


def buat(nama: str) -> np.ndarray:
    if nama not in BPM:
        raise GagalPipeline(f"musik bawaan '{nama}' tidak ada (ada: {', '.join(BPM)}).")
    bpm = BPM[nama]
    ketuk = 60 / bpm
    bar = 4 * ketuk
    panjang = 8 * bar
    ekor = 2.0
    rng = np.random.default_rng({"pulsa": 1, "lembut": 2, "lofi": 3}[nama])
    n = int((panjang + ekor) * SR)
    pad, ritme, melodi, bass = (np.zeros(n) for _ in range(4))
    for k, akord in enumerate(PROGRESI):
        t0 = k * 2 * bar
        for s in akord:
            if nama == "lofi":
                for b in range(2):
                    _taruh(melodi, _epiano(_hz(s, -1), bar * 1.1), t0 + b * bar + (0.03 if b else 0), 0.5)
            else:
                _taruh(pad, _pad(_hz(s, -1), 2 * bar + 0.8, rng), t0)
        _taruh(bass, np.sin(2 * np.pi * _hz(akord[0], -3) * np.arange(int(2 * bar * SR)) / SR) *
               _env(int(2 * bar * SR), 0.02, 2.5), t0, 0.8)
        if nama == "lembut":
            for i, s in enumerate([akord[0], akord[2], akord[1] + 12, akord[2]]):
                _taruh(melodi, _bel(_hz(s, 1)), t0 + i * bar / 2 + bar * 0.25, 0.25)
    for b in range(8):
        for q in range(4):
            t = b * bar + q * ketuk
            if nama == "pulsa":
                if q in (0, 2):
                    _taruh(ritme, _kick(), t, 0.9)
                _taruh(ritme, _hat(rng), t + ketuk / 2, 0.25)
            elif nama == "lofi":
                swing = ketuk * 0.58
                if q in (0, 2):
                    _taruh(ritme, _kick(), t, 0.7)
                if q in (1, 3):
                    _taruh(ritme, _snare(rng), t, 0.35)
                _taruh(ritme, _hat(rng), t + swing, 0.15)
    pad = _lp(pad, 1400 if nama == "pulsa" else 900)
    x = pad * 0.55 + _lp(bass, 220) * 0.5 + melodi * 0.6 + ritme
    if nama == "lofi":
        x = _lp(x, 3800)
        kresek = (rng.random(n) > 0.9993) * rng.uniform(-1, 1, n)
        x += _lp(rng.standard_normal(n), 5000) * 0.006 + _hp(kresek, 2000) * 0.25
    # lipat ekor ke awal → loop menyambung mulus
    loop = x[:int(panjang * SR)].copy()
    sisa = x[int(panjang * SR):]
    loop[:len(sisa)] += sisa
    s = np.stack([loop, np.roll(loop, int(0.012 * SR))], axis=1)  # sedikit lebar stereo
    return _normal(s, -6)


def file_musik(nama: str):
    path = DIR / f"{nama}.wav"
    if not path.exists():
        log("musik", f"membuat musik bawaan '{nama}' …")
        _tulis(path, buat(nama))
    return path


def main() -> int:
    for nama in ("pulsa", "lembut", "lofi"):
        p = file_musik(nama)
        log("musik", p.relative_to(ROOT).as_posix())
    return 0


if __name__ == "__main__":
    from sistem import main_aman
    main_aman(main)
