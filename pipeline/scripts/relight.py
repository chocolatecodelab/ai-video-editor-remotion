"""relight — latar talent digelapkan (split layout): subjek tetap natural, dinding/latar diredupkan, didesaturasi, dan
dikaburkan, + cahaya tepi (rim) emas tipis dari atas → frame dominan hitam (brand OTCA) dan pita gradasi panggung↔talent
tidak terlihat sebagai potongan.

Mask per frame: MediaPipe ImageSegmenter "selfie_multiclass_256x256" (6 kelas; subjek = 1 − latar; tepi hijab/rambut
lebih rapi daripada selfie_segmenter biner), dihaluskan antar-frame (EMA) lalu dirapikan guided filter berpanduan frame
(tepi mengikuti kontur asli, bukan blok 256 px — pola skrip/bersihkan_mask.py proyek OTCA lama).

Pemakaian (biasanya otomatis dari split.py bila split.json punya "latar_talent"):
    python pipeline/scripts/relight.py <folder-proyek> [--paksa]
split.json: "latar_talent": {"gelap": 0.3, "saturasi": 0.35, "blur": 6, "rim": 0.22, "halus": 0.6}
    gelap    = kecerahan latar (0..1)          saturasi = saturasi latar (0..1)
    blur     = sigma blur latar (px @1080)     rim      = kekuatan cahaya tepi emas (0 = mati)
    halus    = EMA mask antar-frame (0 = tanpa, 0.6 = bawaan; makin besar makin stabil tapi tepi tertinggal)
Keluaran: remotion/public/proyek/<id>/talent_relit.mp4 (+ .json kunci cache: ingest + parameter → tidak diulang).
"""
from __future__ import annotations

import argparse
import functools
import subprocess
import urllib.request
from pathlib import Path

import cv2
import numpy as np

import remotion_jembatan as rj
from sistem import ROOT, GagalPipeline, Proyek, baca_json, butuh, fps_dari, ffprobe, log, main_aman, sha_file, tulis_json

MODEL = ROOT / "pipeline" / "models" / "selfie_multiclass_256x256.tflite"
MODEL_URL = ("https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/"
             "float32/latest/selfie_multiclass_256x256.tflite")
BAWAAN = {"gelap": 0.3, "saturasi": 0.35, "blur": 6.0, "rim": 0.22, "halus": 0.6}
EMAS_BGR = np.array([49, 157, 203], np.float32)  # #CB9D31


def _segmenter():
    import mediapipe as mp
    from mediapipe.tasks.python import BaseOptions, vision
    if not MODEL.exists():
        MODEL.parent.mkdir(parents=True, exist_ok=True)
        log("relight", f"unduh model {MODEL.name} …")
        urllib.request.urlretrieve(MODEL_URL, MODEL)
    opsi = vision.ImageSegmenterOptions(base_options=BaseOptions(model_asset_path=str(MODEL)),
                                        running_mode=vision.RunningMode.VIDEO,
                                        output_confidence_masks=True, output_category_mask=False)
    return mp, vision.ImageSegmenter.create_from_options(opsi)


def _guided(g: np.ndarray, p: np.ndarray, r: int, eps: float) -> np.ndarray:
    """Guided filter abu-abu (He et al.) dengan box filter OpenCV: g = panduan (0..1), p = mask (0..1)."""
    k = (2 * r + 1, 2 * r + 1)
    mg, mp_ = cv2.blur(g, k), cv2.blur(p, k)
    cov = cv2.blur(g * p, k) - mg * mp_
    var = cv2.blur(g * g, k) - mg * mg
    a = cov / (var + eps)
    b = mp_ - a * mg
    return cv2.blur(a, k) * g + cv2.blur(b, k)


def _smooth(x: np.ndarray, a: float, b: float) -> np.ndarray:
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


@functools.lru_cache(maxsize=2)
def _peta(h: int, w: int) -> tuple[np.ndarray, np.ndarray]:
    """Vignet latar (tepi frame lebih gelap → cahaya terfokus ke talent) + bobot arah cahaya rim (kuat di atas)."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    vig = 1 - 0.45 * np.clip(((xx - w / 2) / (w * 0.62)) ** 2 + ((yy - h * 0.55) / (h * 0.7)) ** 2, 0, 1)
    return vig, np.clip(1.2 - yy / (h * 0.75), 0, 1)


def proses_frame(bgr: np.ndarray, m: np.ndarray, cfg: dict) -> np.ndarray:
    """bgr uint8 + mask subjek float (0..1, ukuran frame) → frame relight uint8."""
    f = bgr.astype(np.float32)
    abu = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None]
    latar = cfg["saturasi"] * f + (1 - cfg["saturasi"]) * abu
    if cfg["blur"] > 0:
        latar = cv2.GaussianBlur(latar, (0, 0), cfg["blur"])
    vig, arah = _peta(*m.shape)
    latar = latar * (cfg["gelap"] * vig)[..., None]
    a = m[..., None]
    out = latar * (1 - a) + f * a
    if cfg["rim"] > 0:
        # cahaya tepi: pita tipis di luar-dalam kontur subjek, lebih kuat di bagian atas (sumber cahaya = panggung emas)
        tepi = np.clip(m - cv2.GaussianBlur(m, (0, 0), 7), 0, 1) * 2.2
        rim = (tepi * arah)[..., None] * cfg["rim"]
        out = out + rim * (EMAS_BGR * 1.1 - out * 0.5)
    return np.clip(out, 0, 255).astype(np.uint8)


def buat(p: Proyek, cfg_lt: dict, paksa: bool = False) -> Path:
    cfg = {**BAWAAN, **(cfg_lt or {})}
    tujuan = rj.DIR / "public" / "proyek" / p.dir.name / "talent_relit.mp4"
    kunci_path = tujuan.with_suffix(".json")
    kunci = {"ingest": sha_file(p.ingest_video), "cfg": cfg, "versi": 1}
    if not paksa and tujuan.exists() and baca_json(kunci_path) == kunci:
        log("relight", f"cache valid → {tujuan.name}")
        return tujuan
    tujuan.parent.mkdir(parents=True, exist_ok=True)
    info = ffprobe(p.ingest_video)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    W, H, fps = int(v["width"]), int(v["height"]), fps_dari(v)
    mp, seg = _segmenter()
    cap = cv2.VideoCapture(str(p.ingest_video))
    enc = subprocess.Popen([butuh("ffmpeg"), "-y", "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
                            "-s", f"{W}x{H}", "-r", f"{fps}", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "14",
                            "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                            str(tujuan)], stdin=subprocess.PIPE)
    ema = None
    i = 0
    try:
        while True:
            ok, bgr = cap.read()
            if not ok:
                break
            rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            img = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
            masks = seg.segment_for_video(img, int(round(i * 1000 / fps))).confidence_masks
            m = 1 - np.asarray(masks[0].numpy_view(), np.float32).reshape(masks[0].height, masks[0].width)
            m = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
            ema = m if ema is None else cfg["halus"] * ema + (1 - cfg["halus"]) * m
            m = _smooth(ema, 0.35, 0.65)
            panduan = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
            m = np.clip(_guided(panduan, m, 8, 1e-4), 0, 1)
            m = _smooth(m, 0.3, 0.7)
            enc.stdin.write(proses_frame(bgr, m, cfg).tobytes())
            i += 1
            if i % 300 == 0:
                log("relight", f"{i} frame …")
    finally:
        cap.release()
        enc.stdin.close()
        enc.wait()
    if enc.returncode != 0 or i == 0:
        raise GagalPipeline(f"relight gagal (ffmpeg {enc.returncode}, {i} frame)")
    tulis_json(kunci_path, kunci)
    log("relight", f"{i} frame → {tujuan}")
    return tujuan


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--paksa", action="store_true")
    a = ap.parse_args()
    p = Proyek(a.proyek)
    cfg = (baca_json(p.dir / "split.json") or {}).get("latar_talent")
    if cfg is None:
        raise GagalPipeline("split.json tidak punya \"latar_talent\"")
    buat(p, cfg, a.paksa)
    return 0


if __name__ == "__main__":
    main_aman(main)
