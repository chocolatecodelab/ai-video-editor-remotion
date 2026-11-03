"""Produksi komposisi editorial dari props storyboard yang sudah disetujui.

Memakai modul split untuk audio, pemeriksaan media, dan struktur; Remotion untuk
komposisi campuran. Tidak mengubah timing/teks props yang disetujui pengguna.
"""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

import split
from sistem import (
    ROOT, SEMENTARA, GagalPipeline, Proyek, baca_json, jalankan, log,
    main_aman, tulis_json, ukur_loudness,
)


def siapkan(p: Proyek) -> tuple[dict, dict, Path]:
    cfg = baca_json(p.dir / "split.json")
    src = p.dir / cfg["editorial_props"]
    data = src.read_bytes()
    persetujuan = p.manifest.get("persetujuan", {})
    if hashlib.sha256(data).hexdigest() != persetujuan.get("editorial_props_sha"):
        raise GagalPipeline("Props editorial belum disetujui atau berubah sejak persetujuan.")
    props = baca_json(src)
    problems, _ = split.cek(p)
    if problems:
        raise GagalPipeline("; ".join(problems))
    timeline = props["editorial"]
    if len(timeline) != len(props["adegan"]):
        raise GagalPipeline("Jumlah layout dan adegan berbeda.")
    for layout, scene in zip(timeline, props["adegan"]):
        if any(layout[k] != scene[k] for k in ("modul", "mulai", "selesai")):
            raise GagalPipeline("Layout dan adegan tidak sinkron.")
    work = SEMENTARA / "split" / p.dir.name
    work.mkdir(parents=True, exist_ok=True)
    tulis_json(work / "props.json", props)
    split.rj.siapkan_font(props["tokens"])
    return cfg, props, work


def render(p: Proyek) -> Path:
    cfg, props, work = siapkan(p)
    entry = (ROOT / "remotion" / cfg["editorial_entry"]).resolve()
    if not entry.is_relative_to((ROOT / "remotion").resolve()) or not entry.exists():
        raise GagalPipeline("Entry editorial tidak valid.")
    video = work / "video-editorial.mp4"
    log("editorial", f"render final {props['durasiFrame']} frame, {len(props['editorial'])} adegan")
    split._remotion([
        "render", entry, cfg["editorial_composition"], video,
        f"--props={work / 'props.json'}", "--codec=h264", "--crf=14", "--muted",
        "--log=error", "--concurrency=4", "--port=3125",
    ])
    audio = work / "master.wav"
    lu = split.mix_audio(p, cfg, audio)
    log("editorial", f"master {lu['lufs']:.1f} LUFS, {lu['true_peak']:.1f} dBTP")
    out = p.out / f"{p.dir.name}.mp4"
    jalankan([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", video,
        "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "libx264",
        "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
        "-movflags", "+faststart", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
        "-shortest", out,
    ])
    final = ukur_loudness(out)
    log("editorial", f"hasil {final['lufs']:.1f} LUFS, {final['true_peak']:.1f} dBTP")
    return out


def qa(p: Proyek) -> bool:
    from editorial_audit import audit
    siapkan(p)
    media_ok = split.qa(p)
    return audit(p) and media_ok


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("aksi", choices=["cek", "render", "qa"])
    ap.add_argument("proyek")
    args = ap.parse_args()
    p = Proyek(args.proyek)
    if args.aksi == "cek":
        siapkan(p)
        log("editorial", "props disetujui, layout sinkron, aset valid")
        return 0
    if args.aksi == "render":
        render(p)
        return 0
    return 0 if qa(p) else 1


if __name__ == "__main__":
    main_aman(main)
