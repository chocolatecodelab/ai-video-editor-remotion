"""roto — segmentasi subjek per frame, di-cache ke cache/masks/NNNNNN.png.

Pemakaian:
    python roto.py <folder-proyek> [--paksa] [--semua]

Hanya frame yang dipakai elemen `depth` (± 0,5 s) yang diproses, kecuali --semua.
Frame yang mask-nya sudah ada dilewati → revisi beat-sheet tidak mengulang segmentasi.

Backend (manifest.roto.backend):
    mediapipe  — pip install mediapipe   (cepat, CPU)
    rembg      — pip install rembg       (u2net_human_seg, lebih rapi, lebih lambat)
    eksternal  — mask dari Roto Brush 3 / Magic Mask: PNG grayscale/alpha, nama NNNNNN.png,
                 N = indeks frame berbasis 0 pada cache/ingest.mp4. Skrip hanya memvalidasi.

manifest.roto.langkah = n: model hanya tiap frame ke-n, sisanya interpolasi linear (lalu EMA `halus`).
Feather (mask.feather-px) diterapkan saat render, jadi mengubahnya tidak perlu roto ulang.
Aturan : K02.1, K02.2
"""
from __future__ import annotations

import argparse
import importlib.util
import shutil
import subprocess

import cv2
import numpy as np

import beat
from sistem import ROOT, GagalPipeline, Proyek, baca_json, durasi, log, main_aman, sha_file, tulis_json

MARGIN = 0.5
KAMERA_MASK = {"frame-break", "vertigo", "green-screen", "frame-escape", "paper-cutout"}  # = render_kamera.KAMERA_MASK


def butuh_mask(e: dict) -> bool:
    """Elemen yang memerlukan mask subjek: depth, overlay Remotion "belakang", efek kamera frame-break/vertigo/green-screen."""
    if e.get("tipe") == "depth" or (e.get("tipe") == "remotion" and e.get("belakang")):
        return True
    return e.get("tipe") == "kamera" and str(e.get("efek", "")).partition("@")[0] in KAMERA_MASK


def jendela_split(p: Proyek) -> list[tuple[float, float]]:
    """Jendela (detik) adegan split.json bertanda "depan": true — talent hasil matting digambar di atas panggung."""
    cfg = baca_json(p.dir / "split.json") if (p.dir / "split.json").exists() else None
    if not cfg or not p.words_path.exists():
        return []
    import split  # lazy: split.py juga memanggil roto (potong_talent)
    kata = baca_json(p.words_path)["kata"]
    dur = durasi(p.ingest_video)
    return [(split.resolve_waktu(a["mulai"], kata),
             split.resolve_waktu(a["selesai"], kata) if a.get("selesai") is not None else dur)
            for a in cfg.get("adegan", []) if a.get("depan")]


def frame_dibutuhkan(p: Proyek, semua: bool, hanya: list[int] | None = None) -> list[int]:
    total = int(round(durasi(p.ingest_video) * p.fps))
    if semua:
        return list(range(total))
    if hanya is not None:
        return sorted(i for i in set(hanya) if 0 <= i < total)
    jendela = jendela_split(p)
    if p.beat_sheet_path.exists():
        jendela += [(e["mulai"], e["selesai"]) for e in beat.semua_elemen(beat.muat(p, durasi(p.ingest_video)))
                    if butuh_mask(e)]
    idx: set[int] = set()
    for m, s in jendela:
        a = max(0, int((m - MARGIN) * p.fps))
        z = min(total, int((s + MARGIN) * p.fps) + 1)
        idx.update(range(a, z))
    return sorted(idx)


def _rentang(idx: list[int]) -> list[tuple[int, int]]:
    out, mulai = [], None
    for i, v in enumerate(idx):
        if mulai is None:
            mulai = v
        if i + 1 == len(idx) or idx[i + 1] != v + 1:
            out.append((mulai, v + 1))
            mulai = None
    return out


def baca_frame(p: Proyek, a: int, z: int):
    """Generator (indeks, frame RGB) untuk frame [a, z)."""
    # skala "cover" ke resolusi keluaran (sama dengan render.Pembaca): ingest bisa lebih besar dari format proyek
    # (mis. pratinjau 540×960) — tanpa ini buffer dibaca dengan ukuran salah dan mask jadi acak.
    vf = f"scale={p.W}:{p.H}:force_original_aspect_ratio=increase,crop={p.W}:{p.H}"
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{a / p.fps:.6f}", "-i", str(p.ingest_video),
           "-frames:v", str(z - a), "-vf", vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stdin=subprocess.DEVNULL)
    n = p.W * p.H * 3
    try:
        for i in range(a, z):
            buf = proc.stdout.read(n)
            if len(buf) < n:
                break
            yield i, np.frombuffer(buf, np.uint8).reshape(p.H, p.W, 3)
    finally:
        proc.stdout.close()
        proc.wait()


MODEL_SELFIE = ("https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/"
                "float16/latest/selfie_segmenter.tflite")


class _Mediapipe:
    """MediaPipe Tasks ImageSegmenter (mediapipe ≥ 0.10; mp.solutions sudah dihapus di 1.x)."""

    def __init__(self):
        import urllib.request

        import mediapipe as mp
        from mediapipe.tasks.python import BaseOptions, vision
        model = ROOT / "pipeline" / "models" / "selfie_segmenter.tflite"
        if not model.exists():
            model.parent.mkdir(parents=True, exist_ok=True)
            log("roto", f"unduh model {model.name} …")
            urllib.request.urlretrieve(MODEL_SELFIE, model)
        opsi = vision.ImageSegmenterOptions(base_options=BaseOptions(model_asset_path=str(model)),
                                            running_mode=vision.RunningMode.IMAGE,
                                            output_confidence_masks=True, output_category_mask=False)
        self.mp = mp
        self.seg = vision.ImageSegmenter.create_from_options(opsi)

    def __call__(self, rgb):
        img = self.mp.Image(image_format=self.mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
        masks = self.seg.segment(img).confidence_masks
        return np.asarray(masks[-1].numpy_view(), np.float32).reshape(rgb.shape[:2])  # kanal terakhir = orang


class _Rembg:
    """manifest.roto.model: birefnet-portrait (tepi rambut/hijab paling bersih, lambat di CPU) → cadangan u2net_human_seg."""

    def __init__(self, model: str = "u2net_human_seg"):
        from rembg import new_session
        for m in dict.fromkeys([model, "u2net_human_seg"]):
            try:
                self.s = new_session(m)
                self.model = m
                break
            except Exception as e:  # unduhan/onnx gagal → model cadangan
                log("roto", f"model {m} gagal dimuat ({e}); coba cadangan.")
        else:
            raise GagalPipeline("tidak ada model rembg yang bisa dimuat.")

    def __call__(self, rgb):
        from PIL import Image
        from rembg import remove
        return np.asarray(remove(Image.fromarray(rgb), session=self.s, only_mask=True), np.float32) / 255.0


BACKEND = {"mediapipe": ("mediapipe", _Mediapipe), "rembg": ("rembg", _Rembg)}


def roto(p: Proyek, paksa: bool = False, semua: bool = False, hanya: list[int] | None = None) -> dict:
    """`hanya` = indeks frame tertentu (mis. still storyboard) alih-alih semua rentang yang butuh mask."""
    if not p.ingest_video.exists():
        raise GagalPipeline("cache/ingest.mp4 belum ada. Jalankan ingest dulu.")
    cfg = p.manifest.get("roto", {})
    backend = cfg.get("backend", "mediapipe")
    model = cfg.get("model", "u2net_human_seg")
    halus = float(cfg.get("halus", 0.3))  # EMA temporal untuk mengurangi flicker
    langkah = max(1, int(cfg.get("langkah", 1)))  # model tiap n frame (model berat, mis. birefnet ±30 s/frame di CPU)
    d = p.masks_dir
    d.mkdir(parents=True, exist_ok=True)
    meta_path = d / "meta.json"
    kunci = {"ingest": sha_file(p.ingest_video), "backend": backend, "halus": halus, "resolusi": [p.W, p.H],
             **({"model": model} if backend == "rembg" else {}), **({"langkah": langkah} if langkah > 1 else {})}

    if backend != "eksternal":
        lama = baca_json(meta_path) if meta_path.exists() else None
        if paksa or (lama and lama.get("kunci") != kunci):
            log("roto", "ingest/backend berubah → hapus mask lama.")
            shutil.rmtree(d)
            d.mkdir(parents=True)

    idx = frame_dibutuhkan(p, semua, hanya)
    if not idx:
        log("roto", "tidak ada elemen yang butuh mask (depth / belakang / kamera mask); tidak perlu roto.")
        return {"frame": 0}
    kurang = [i for i in idx if not (d / f"{i:06d}.png").exists()]

    if backend == "eksternal":
        if kurang:
            raise GagalPipeline(f"{len(kurang)} mask eksternal belum ada, mis. {kurang[0]:06d}.png "
                                f"(rentang {_rentang(kurang)[:3]} …).")
        log("roto", f"{len(idx)} mask eksternal lengkap.")
        return {"frame": len(idx)}

    if not kurang:
        log("roto", f"cache valid: {len(idx)} mask sudah ada.")
        return {"frame": len(idx), "baru": 0}

    modul, kelas = BACKEND.get(backend, (None, None))
    if not kelas:
        raise GagalPipeline(f"backend roto {backend!r} tidak dikenal ({', '.join(BACKEND)}, eksternal).")
    if importlib.util.find_spec(modul) is None:
        raise GagalPipeline(f"Backend '{backend}' belum terpasang: pip install {modul}\n"
                            "Atau pakai mask dari After Effects/DaVinci dengan manifest.roto.backend = \"eksternal\".")
    seg = kelas(model) if backend == "rembg" else kelas()
    log("roto", f"{backend}{'/' + seg.model if backend == 'rembg' else ''}: {len(kurang)} frame baru dari {len(idx)} dibutuhkan …")
    for a, z in _rentang(kurang):
        prev = None
        kunci_m = None  # (indeks, mask) frame kunci terakhir
        tunda: list[int] = []
        for i, rgb in baca_frame(p, a, z):
            # langkah > 1: model hanya di tiap frame ke-n (+ frame terakhir rentang), frame di antaranya interpolasi linear
            if (i - a) % langkah and i != z - 1:
                tunda.append(i)
                continue
            m_kunci = seg(rgb)
            urut = [(j, kunci_m[1] + (m_kunci - kunci_m[1]) * (j - kunci_m[0]) / (i - kunci_m[0])) for j in tunda] if kunci_m else []
            tunda = []
            kunci_m = (i, m_kunci)
            for j, m in [*urut, (i, m_kunci)]:
                if prev is not None and halus > 0:
                    m = (1 - halus) * m + halus * prev
                prev = m
                cv2.imwrite(str(d / f"{j:06d}.png"), np.clip(m * 255, 0, 255).astype(np.uint8))
    tulis_json(meta_path, {"kunci": kunci})
    log("roto", "selesai.")
    return {"frame": len(idx), "baru": len(kurang)}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--paksa", action="store_true", help="hapus cache mask lalu ulang")
    ap.add_argument("--semua", action="store_true", help="proses semua frame, bukan hanya rentang depth")
    arg = ap.parse_args()
    roto(Proyek(arg.proyek), arg.paksa, arg.semua)
    return 0


if __name__ == "__main__":
    main_aman(main)
