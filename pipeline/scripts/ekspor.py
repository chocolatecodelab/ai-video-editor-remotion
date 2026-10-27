"""ekspor — master → versi per platform (preset dari token ekspor.platform).

Pemakaian:
    python ekspor.py <folder-proyek> [--platform reels,tiktok]

Input  : out/master.mov (ProRes 422 HQ, hasil render)
Output : out/<proyek>_<platform>.mp4  — H.264 high, 1080×1920, yuv420p, bt709 (primaries/trc/matrix), AAC 48 kHz
Aturan : K07.1, K07.2
"""
from __future__ import annotations

import argparse

from sistem import SETPARAMS_BT709, GagalPipeline, Proyek, jalankan, log, main_aman


def path_platform(p: Proyek, nama: str):
    # satu platform (bawaan proyek baru) → satu file <proyek>.mp4 untuk semua platform vertikal
    if len(p.manifest.get("platform") or []) == 1:
        return p.out / f"{p.manifest['proyek']}.mp4"
    return p.out / f"{p.manifest['proyek']}_{nama}.mp4"


def ekspor(p: Proyek, platform: list[str] | None = None) -> list:
    if not p.master_path.exists():
        raise GagalPipeline("out/master.mov belum ada. Jalankan render dulu.")
    preset = p.t("ekspor.platform")
    daftar = platform or p.manifest.get("platform") or list(preset)
    hasil = []
    for nama in daftar:
        if nama not in preset:
            raise GagalPipeline(f"platform {nama!r} tidak punya preset (ada: {', '.join(preset)}).")
        c = preset[nama]
        out = path_platform(p, nama)
        cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", p.master_path,
               "-vf", f"scale={p.W}:{p.H}:flags=lanczos:in_color_matrix=bt709:out_color_matrix=bt709:out_range=tv,"
                      f"format={p.t('ekspor.pix_fmt')},{SETPARAMS_BT709}",
               "-r", p.fps, "-c:v", c["vcodec"], "-preset", "slow", "-profile:v", c["profile"], "-level", c["level"],
               "-crf", c["crf"], "-maxrate", c["maxrate"], "-bufsize", c["bufsize"], "-g", p.fps * 2,
               "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
               "-c:a", c["acodec"], "-b:a", c["abitrate"], "-ar", 48000, "-ac", 2,
               "-movflags", "+faststart", out]
        log("ekspor", f"{nama} → {out.name}")
        jalankan(cmd)
        hasil.append(out)
    log("ekspor", "selesai.")
    return hasil


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--platform", help="dipisah koma; default manifest.platform")
    arg = ap.parse_args()
    ekspor(Proyek(arg.proyek), arg.platform.split(",") if arg.platform else None)
    return 0


if __name__ == "__main__":
    main_aman(main)
