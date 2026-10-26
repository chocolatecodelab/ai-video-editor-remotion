"""Khusus proyek ini: perbaiki mask MediaPipe → cache/masks (dipakai lewat manifest roto.backend = "eksternal").
Mask asli: cache/masks_mediapipe/.

Langkah per frame:
  1. smoothstep 0,40–0,65 — buang halo berkeyakinan rendah (sisa EMA / kepercayaan rendah di kanan kepala)
  2. hanya komponen subjek terbesar (+ 12 px)
  3. erosi 9 px lalu guided filter (frame video sebagai panduan, r 8, eps 1e-4) — tepi mengikuti kontur hijab asli;
     mask MediaPipe dihitung di 256 px sehingga tepinya bergerigi & melebar ke batu
  4. smoothstep 0,40–0,60 — tepi tegas tapi tetap halus (feather render dari token mask.feather-px)

Pemakaian: .venv\\Scripts\\python proyek/2026-10_otca-sertifikat-jerman/skrip/bersihkan_mask.py
"""
import shutil
import sys
from pathlib import Path

import cv2
import numpy as np

P = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(P.parents[1] / "pipeline" / "scripts"))
from render_dasar import Pembaca  # noqa: E402

asli, tujuan = P / "cache" / "masks_mediapipe", P / "cache" / "masks"
if not asli.exists():
    shutil.move(str(tujuan), str(asli))
tujuan.mkdir(exist_ok=True)
EROSI = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19))
JAGA = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))


def sst(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


daftar = sorted(asli.glob("*.png"))
baca = Pembaca(P / "cache" / "ingest.mp4", 0, 1080, 1920, 30, cover=True)
try:
    for i, f in enumerate(daftar):
        assert f.stem == f"{i:06d}", f"mask tidak berurutan: {f.name}"
        rgb = baca.baca().astype(np.float32) / 255
        t = sst(cv2.imread(str(f), 0).astype(np.float32) / 255, 0.40, 0.65)
        n, lab, st, _ = cv2.connectedComponentsWithStats((t > 0.5).astype(np.uint8))
        if n > 1:
            k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
            t *= cv2.dilate((lab == k).astype(np.uint8), JAGA)
        g = cv2.ximgproc.guidedFilter(rgb, cv2.erode(t, EROSI), 8, 1e-4)
        cv2.imwrite(str(tujuan / f.name), (sst(g, 0.40, 0.60) * 255 + 0.5).astype(np.uint8))
finally:
    baca.tutup()
print(f"{len(daftar)} mask diperbaiki -> {tujuan}")
