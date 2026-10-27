"""wajah — deteksi kotak wajah per waktu pada rekaman, di-cache ke cache/wajah.json.

Pemakaian:
    python wajah.py <folder-proyek> [--paksa] [--fps 5]

Dipakai untuk:
    - laporan perangkat & QA K00.3 (elemen menutupi wajah?) — laporan.py / qa.py
    - fokus efek kamera digital-zoom (render.py)
    - analisis referensi (referensi.py memanggil `deteksi_video`)
Backend: MediaPipe Tasks FaceDetector (model BlazeFace short-range, diunduh sekali ke pipeline/models/).
Koordinat kotak dinormalisasi 0–1 terhadap frame keluaran (setelah ingest, rasio proyek).
"""
from __future__ import annotations

import argparse
import subprocess
import urllib.request

import numpy as np

from sistem import ROOT, GagalPipeline, Proyek, baca_json, durasi, log, main_aman, sha_file, tulis_json

MODEL_URL = ("https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/"
             "float16/latest/blaze_face_short_range.tflite")
LEBAR = 360  # deteksi pada frame kecil (cepat); kotak dinormalisasi


class Detektor:
    def __init__(self):
        try:
            import mediapipe as mp
            from mediapipe.tasks.python import BaseOptions, vision
        except ImportError as e:
            raise GagalPipeline("mediapipe belum terpasang di .venv (dibutuhkan deteksi wajah).") from e
        model = ROOT / "pipeline" / "models" / "blaze_face_short_range.tflite"
        if not model.exists():
            model.parent.mkdir(parents=True, exist_ok=True)
            log("wajah", f"unduh model {model.name} …")
            urllib.request.urlretrieve(MODEL_URL, model)
        opsi = vision.FaceDetectorOptions(base_options=BaseOptions(model_asset_path=str(model)),
                                          running_mode=vision.RunningMode.IMAGE, min_detection_confidence=0.5)
        self.mp = mp
        self.det = vision.FaceDetector.create_from_options(opsi)

    def __call__(self, rgb: np.ndarray) -> list[float] | None:
        """→ kotak wajah terbesar [x0, y0, x1, y1] (0–1) atau None."""
        h, w = rgb.shape[:2]
        img = self.mp.Image(image_format=self.mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
        hasil = self.det.detect(img).detections
        if not hasil:
            return None
        b = max(hasil, key=lambda d: d.bounding_box.width * d.bounding_box.height).bounding_box
        # perluas sedikit ke atas (dahi/rambut) — kotak BlazeFace pas di wajah
        x0, y0 = b.origin_x / w, (b.origin_y - b.height * 0.25) / h
        x1, y1 = (b.origin_x + b.width) / w, (b.origin_y + b.height * 1.05) / h
        return [round(max(0.0, x0), 4), round(max(0.0, y0), 4), round(min(1.0, x1), 4), round(min(1.0, y1), 4)]


def deteksi_video(path, lebar: int, tinggi: int, fps: float, det: Detektor | None = None) -> list[dict]:
    """Baca video (cover ke rasio lebar×tinggi, diperkecil) pada `fps` → [{t, kotak|None}]."""
    det = det or Detektor()
    w = LEBAR
    h = int(round(LEBAR * tinggi / lebar / 2)) * 2
    vf = f"fps={fps},scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}"
    proc = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-vf", vf, "-f", "rawvideo",
                             "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, stdin=subprocess.DEVNULL)
    hasil, k, n = [], 0, w * h * 3
    try:
        while True:
            buf = proc.stdout.read(n)
            if len(buf) < n:
                break
            rgb = np.frombuffer(buf, np.uint8).reshape(h, w, 3)
            hasil.append({"t": round(k / fps, 3), "kotak": det(rgb)})
            k += 1
    finally:
        proc.stdout.close()
        proc.wait()
    return hasil


def wajah(p: Proyek, paksa: bool = False, fps: float = 5.0) -> dict:
    if not p.ingest_video.exists():
        raise GagalPipeline("cache/ingest.mp4 belum ada. Jalankan ingest dulu.")
    tujuan = p.cache / "wajah.json"
    kunci = {"ingest": sha_file(p.ingest_video), "fps": fps}
    if tujuan.exists() and not paksa and baca_json(tujuan).get("_meta", {}).get("kunci") == kunci:
        log("wajah", "cache valid.")
        return baca_json(tujuan)
    log("wajah", f"deteksi wajah {fps:g} fps pada {durasi(p.ingest_video):.1f} s …")
    b = deteksi_video(p.ingest_video, p.W, p.H, fps)
    ada = sum(1 for x in b if x["kotak"])
    data = {"_meta": {"kunci": kunci, "backend": "mediapipe-blazeface", "frame": len(b), "terdeteksi": ada}, "bingkai": b}
    tulis_json(tujuan, data)
    log("wajah", f"{ada}/{len(b)} sampel berwajah → cache/wajah.json")
    return data


def kotak_di(data: dict | None, t0: float, t1: float, push: list[dict] | None = None) -> list[list[float]]:
    """Semua kotak wajah (0–1) yang terdeteksi di rentang [t0, t1]. `push` (layout.json): kotak diperbesar seperti
    yang tampil saat push / zoom potong aktif (skala penuh, berpusat di fokus) — K00.3 mengukur wajah yang terlihat."""
    if not data:
        return []
    hasil = []
    for x in data.get("bingkai", []):
        if not x["kotak"] or not t0 - 0.1 <= x["t"] <= t1 + 0.1:
            continue
        k = x["kotak"]
        for u in push or []:
            if u["mulai"] <= x["t"] < u["selesai"]:
                s, (fx, fy) = u["skala"], u["fokus"]
                k = [fx + (k[0] - fx) * s, fy + (k[1] - fy) * s, fx + (k[2] - fx) * s, fy + (k[3] - fy) * s]
        hasil.append(k)
    return hasil


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--paksa", action="store_true")
    ap.add_argument("--fps", type=float, default=5.0)
    a = ap.parse_args()
    wajah(Proyek(a.proyek), a.paksa, a.fps)
    return 0


if __name__ == "__main__":
    main_aman(main)
