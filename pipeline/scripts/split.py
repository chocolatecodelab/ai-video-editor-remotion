"""split — layout split talking-head (ilustrasi separuh atas, talent separuh bawah) lewat Composition Remotion SplitReel.

Sumber kebenaran per proyek: proyek/<id>/split.json (adegan dari pustaka remotion/src/split/Adegan.tsx, anchor kata,
zoom potong, musik, SFX). Waktu ditulis sebagai anchor {"kata": "...", "ke": n, "offset": s} atau detik.

Pemakaian:
    python pipeline/scripts/split.py props  <proyek>              # resolve anchor → .sementara/split/<id>/props.json
    python pipeline/scripts/split.py still  <proyek> 1.2,5,9      # PNG per detik → out/storyboard/split_<t>.png
    python pipeline/scripts/split.py studio <proyek>              # Remotion Studio dengan props proyek
    python pipeline/scripts/split.py render <proyek>              # video (Remotion) + audio (suara, musik ber-ducking, SFX)
                                                                  #   → out/<proyek>.mp4 (−14 LUFS, plafon −2 dBTP, bt709)
    python pipeline/scripts/split.py qa     <proyek>              # QA keluaran split → out/qa-report.md
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sistem import (ROOT, SEMENTARA, GagalPipeline, Proyek, baca_json, butuh, durasi, ffprobe, fps_dari,  # noqa: E402
                    jalankan, log, loudnorm_2pass, main_aman, stream, tulis_json, ukur_loudness)
import remotion_jembatan as rj  # noqa: E402
from render_audio import MARGIN_TP_LOSSY  # noqa: E402

KOMPOSISI = "SplitReel"
SFX_DIR = ROOT / "pipeline" / "aset-bawaan" / "sfx" / "v2"
MUSIK_DIR = ROOT / "pipeline" / "aset-bawaan" / "musik"


def _bersih(w: str) -> str:
    return re.sub(r"[^\w']", "", w.lower())


def resolve_waktu(nilai, kata: list[dict]) -> float:
    """Anchor kata → detik (awal kata ke-n yang cocok, 1-based) + offset; angka dibiarkan."""
    if isinstance(nilai, (int, float)):
        return float(nilai)
    target = _bersih(nilai["kata"])
    cocok = [k for k in kata if _bersih(k["w"]) == target]
    ke = nilai.get("ke", 1)
    if len(cocok) < ke:
        raise GagalPipeline(f"anchor kata '{nilai['kata']}' ke-{ke} tidak ada di transkrip")
    return round(cocok[ke - 1]["s"] + nilai.get("offset", 0.0), 3)


def bangun_props(p: Proyek) -> dict:
    cfg = baca_json(p.dir / "split.json")
    if cfg is None:
        raise GagalPipeline(f"split.json tidak ada di {p.dir}")
    words = baca_json(p.words_path)
    if not words:
        raise GagalPipeline("transkrip belum ada: jalankan video.py transkrip <proyek>")
    kata = words["kata"]
    dur = durasi(p.ingest_video)
    adegan = []
    for a in cfg["adegan"]:
        adegan.append({
            "modul": a["modul"],
            "mulai": resolve_waktu(a["mulai"], kata),
            "selesai": resolve_waktu(a["selesai"], kata) if a.get("selesai") is not None else dur,
            "t": {n: resolve_waktu(v, kata) for n, v in a.get("t", {}).items()},
            **{k: a[k] for k in ("masuk", "keluar", "teks") if k in a},
        })
    zoom = [[resolve_waktu(t, kata), z] for t, z in cfg.get("zoom", [[0, 1]])]
    zoom.append([dur + 1, zoom[-1][1]])
    cap = p.t("caption")
    salin_footage(p)
    rj.siapkan_font(p.tokens)
    return {
        "W": p.W, "H": p.H, "fps": p.fps, "durasiFrame": int(round(dur * p.fps)),
        "tokens": p.tokens, "zona": list(p.zona_aman()),
        "tinggi_panggung": cfg.get("tinggi_panggung", p.H // 2),
        "gradasi": cfg.get("gradasi", 320),
        "footage": {"src": f"proyek/{p.dir.name}/talent.mp4", **cfg["footage"]},
        "zoom": zoom, "adegan": adegan,
        "kata": [{"w": k["w"], "s": k["s"], "e": k["e"]} for k in kata],
        "caption": {"y": cfg.get("caption_y", cfg.get("tinggi_panggung", p.H // 2)), "kata_maks": cap["kata-maks"],
                    "karakter_maks": cap["karakter-maks-baris"], "jeda_pecah": cap["jeda-pecah"]},
    }


def salin_footage(p: Proyek) -> Path:
    """Rekaman ingest → remotion/public/proyek/<id>/talent.mp4 (staticFile; folder ini di-gitignore)."""
    tujuan = rj.DIR / "public" / "proyek" / p.dir.name / "talent.mp4"
    tujuan.parent.mkdir(parents=True, exist_ok=True)
    if not tujuan.exists() or tujuan.stat().st_mtime < p.ingest_video.stat().st_mtime:
        shutil.copy(p.ingest_video, tujuan)
    return tujuan


def tulis_props(p: Proyek) -> Path:
    props = bangun_props(p)
    path = SEMENTARA / "split" / p.dir.name / "props.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    tulis_json(path, props)
    log("split", f"{len(props['adegan'])} adegan → {path}")
    return path


def _remotion(args: list) -> None:
    npx = butuh("npx")
    r = subprocess.run([npx, "remotion", *[str(a) for a in args]], cwd=rj.DIR, stdin=subprocess.DEVNULL)
    if r.returncode != 0:
        raise GagalPipeline(f"remotion {args[0]} gagal (kode {r.returncode})")


def still(p: Proyek, detik: list[float]) -> list[Path]:
    props = tulis_props(p)
    d = p.out / "storyboard"
    d.mkdir(parents=True, exist_ok=True)
    hasil = []
    for t in detik:
        out = d / f"split_{t:06.2f}.png"
        _remotion(["still", "src/index.ts", KOMPOSISI, out, f"--props={props}", f"--frame={int(round(t * p.fps))}", "--port=3125",
                   "--log=error"])
        hasil.append(out)
    log("split", f"{len(hasil)} still → {d}")
    return hasil


def studio(p: Proyek) -> None:
    props = tulis_props(p)
    _remotion(["studio", "src/index.ts", f"--props={props}"])


def _sfx_path(nama: str) -> Path:
    path = SFX_DIR / f"{nama}.wav"
    if not path.exists():
        raise GagalPipeline(f"SFX '{nama}' tidak ada di {SFX_DIR}")
    return path


def mix_audio(p: Proyek, cfg: dict, out: Path) -> dict:
    """Suara + musik latar ber-ducking (sidechain dari suara) + SFX terjadwal → master −14 LUFS / plafon −2 dBTP."""
    kata = baca_json(p.words_path)["kata"]
    dur = durasi(p.ingest_video)
    ins: list = ["-i", p.ingest_audio]
    fil = []
    musik = cfg.get("musik")
    label_mix = ["[suara]"]
    fil.append("[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[suara][kunci]")
    if musik:
        src = MUSIK_DIR / f"{musik['file'].split(':', 1)[1]}.wav" if musik["file"].startswith("bawaan:") else p.path_aset(musik["file"])
        ins += ["-stream_loop", "-1", "-i", src]
        fil.append(
            f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{dur:.3f},volume={musik.get('db', -18)}dB,"
            f"afade=t=in:d={musik.get('fade_masuk', 0.8)},afade=t=out:st={dur - musik.get('fade_keluar', 2.0):.3f}:"
            f"d={musik.get('fade_keluar', 2.0)}[m0]")
        # ducking: musik turun ±duck_db saat suara aktif, naik lagi di jeda (attack cepat, release pelan)
        fil.append(f"[m0][kunci]sidechaincompress=threshold=0.02:ratio={musik.get('rasio_duck', 6)}:attack=30:release=450:"
                   f"makeup=1[musik]")
        label_mix.append("[musik]")
    else:
        fil.append("[kunci]anullsink")
    for i, s in enumerate(cfg.get("sfx", [])):
        idx = len([x for x in ins if x == "-i"])
        ins += ["-i", _sfx_path(s["jenis"])]
        t = resolve_waktu(s["t"], kata)
        ms = max(0, int(round(t * 1000)))
        fil.append(f"[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={s.get('db', -18)}dB,"
                   f"adelay={ms}|{ms}[s{i}]")
        label_mix.append(f"[s{i}]")
    fil.append(f"{''.join(label_mix)}amix=inputs={len(label_mix)}:normalize=0:duration=first[mix]")
    mentah = SEMENTARA / "split" / p.dir.name / "mix.wav"
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *ins, "-filter_complex", ";".join(fil),
              "-map", "[mix]", "-t", f"{dur:.3f}", "-c:a", "pcm_s24le", mentah])
    # plafon master = token true-peak − MARGIN_TP_LOSSY (−2 dBTP) agar lolos K06.2 setelah encode AAC
    loudnorm_2pass(mentah, out, p.t("audio.lufs"), p.t("audio.true-peak") - MARGIN_TP_LOSSY, p.t("audio.lra"))
    return ukur_loudness(out)


def render(p: Proyek) -> Path:
    cfg = baca_json(p.dir / "split.json")
    props = tulis_props(p)
    kerja = SEMENTARA / "split" / p.dir.name
    video = kerja / "video.mp4"
    _remotion(["render", "src/index.ts", KOMPOSISI, video, f"--props={props}", "--codec=h264", "--crf=14", "--muted",
               "--log=error", "--concurrency=50%", "--port=3125"])
    audio = kerja / "master.wav"
    lu = mix_audio(p, cfg, audio)
    log("split", f"audio master {lu['lufs']:.1f} LUFS, TP {lu['true_peak']:.1f} dBTP")
    out = p.out / f"{p.dir.name}.mp4"
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a",
              "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
              "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart",
              "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-shortest", out])
    akhir = ukur_loudness(out)
    log("split", f"→ {out} ({akhir['lufs']:.1f} LUFS, TP {akhir['true_peak']:.1f} dBTP)")
    return out


def qa(p: Proyek) -> bool:
    """QA layout split → out/qa-report.md + out/qa.json. qa.py butuh layout.json dari render.py (perangkat per beat),
    jadi di sini dicek aturan yang berlaku untuk keluaran SplitReel: ekspor (K07.2), audio (K06.1–2), durasi & sinkron,
    kepadatan caption, hook di frame 0; sisanya checklist manual."""
    from PIL import Image, ImageStat

    out = p.out / f"{p.dir.name}.mp4"
    if not out.exists():
        raise GagalPipeline(f"{out.name} belum ada: jalankan split.py render dulu")
    info = ffprobe(out)
    v, a = stream(info, "video"), stream(info, "audio")
    hasil: list[tuple[str, str, str, str]] = []

    def catat(i, aturan, ok, detail, lunak=False):
        hasil.append((i, aturan, "LULUS" if ok else ("PERINGATAN" if lunak else "GAGAL"), detail))

    W, H = p.t("format.resolusi")
    tag = (v.get("color_primaries"), v.get("color_transfer"), v.get("color_space"))
    catat("K07.2", "H.264, resolusi format, pix_fmt, tag bt709, AAC",
          v["codec_name"] == "h264" and (v["width"], v["height"]) == (W, H) and v["pix_fmt"] == p.t("ekspor.pix_fmt")
          and all(x == "bt709" for x in tag) and a and a["codec_name"] == "aac",
          f"{v['codec_name']} {v['width']}x{v['height']} {v['pix_fmt']} {tag} audio {a and a['codec_name']}")
    catat("FPS", "fps = format.fps", abs(fps_dari(v) - p.fps) < 0.01, f"{fps_dari(v):.2f}")
    lu = ukur_loudness(out)
    catat("K06.1", "loudness terintegrasi = audio.lufs ± toleransi",
          abs(lu["lufs"] - p.t("audio.lufs")) <= p.t("audio.lufs-toleransi"), f"{lu['lufs']:.1f} LUFS")
    catat("K06.2", "true peak ≤ audio.true-peak", lu["true_peak"] <= p.t("audio.true-peak"), f"{lu['true_peak']:.1f} dBTP")
    dv, dsrc = float(v.get("duration", info["format"]["duration"])), durasi(p.ingest_video)
    catat("DUR", "durasi = rekaman (±0,1 s)", abs(dv - dsrc) <= 0.1, f"{dv:.2f} s vs rekaman {dsrc:.2f} s")
    if a:
        catat("SINK", "audio & video sama panjang (±0,1 s)", abs(float(a.get("duration", dv)) - dv) <= 0.1,
              f"audio {float(a.get('duration', dv)):.2f} s")
    props = baca_json(SEMENTARA / "split" / p.dir.name / "props.json")
    cps_maks = p.t("qa.karakter-per-detik-maks")
    halaman, kini = [], []
    c = props["caption"]
    for k in props["kata"]:
        if kini and (k["s"] - kini[-1]["e"] > c["jeda_pecah"] or len(kini) >= c["kata_maks"]
                     or sum(len(x["w"]) + 1 for x in kini) + len(k["w"]) > c["karakter_maks"]):
            halaman.append(kini)
            kini = []
        kini.append(k)
    halaman.append(kini)
    terpadat = max((sum(len(x["w"]) for x in h) / max(0.3, h[-1]["e"] - h[0]["s"]), " ".join(x["w"] for x in h))
                   for h in halaman)
    catat("K01.cps", "caption ≤ qa.karakter-per-detik-maks", terpadat[0] <= cps_maks,
          f"terpadat {terpadat[0]:.1f} cps (“{terpadat[1]}”), batas {cps_maks}")
    f0 = SEMENTARA / "split" / p.dir.name / "frame0.png"
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", out, "-frames:v", 1, f0])
    panggung = Image.open(f0).convert("L").crop((0, 0, W, props["tinggi_panggung"]))
    std = ImageStat.Stat(panggung).stddev[0]
    catat("HOOK", "frame 0 panggung sudah berisi visual (roadmap #7)", std >= 12, f"stddev luminans {std:.1f}", lunak=True)

    gagal = any(s == "GAGAL" for _, _, s, _ in hasil)
    status = "GAGAL" if gagal else "LULUS"
    manual = [
        "K00 zona aman: grafis panggung tidak masuk area tombol kanan (120 px) & atas (250 px) di HP.",
        "K07.3 tonton di HP resolusi penuh: keterbacaan caption, sinkron bibir.",
        "K08.5–6 cek SFX & ducking musik dengan headphone.",
        "G01.2 grafis tidak menutupi wajah talent; sambungan atas/bawah tidak terlihat terpotong.",
    ]
    md = [f"# QA — {p.dir.name} (layout split)", "", f"**Status: {status}**", "",
          f"File: `out/{out.name}` · dicek {dt.datetime.now():%Y-%m-%d %H:%M}", "",
          "| ID | Aturan | Status | Detail |", "|---|---|---|---|",
          *[f"| {i} | {at} | {s} | {d} |" for i, at, s, d in hasil], "",
          "K07.1 (master ProRes) dilewati: aturan Zar = satu file ekspor per proyek.", "",
          "## Checklist manual (dicentang Zar)", *[f"- [ ] {m}" for m in manual], ""]
    (p.out / "qa-report.md").write_text("\n".join(md), encoding="utf-8")
    tulis_json(p.out / "qa.json", {"status": status, "hasil": [dict(zip(("id", "aturan", "status", "detail"), h))
                                                              for h in hasil], "manual": manual})
    p.manifest["qa"] = status
    p.simpan_manifest()
    log("split", f"QA {status} → out/qa-report.md")
    return not gagal


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("aksi", choices=["props", "still", "studio", "render", "qa"])
    ap.add_argument("proyek")
    ap.add_argument("detik", nargs="?", default="")
    arg = ap.parse_args()
    folder = Path(arg.proyek)
    if not folder.exists():
        folder = ROOT / "proyek" / arg.proyek
    p = Proyek(folder)
    if arg.aksi == "props":
        tulis_props(p)
    elif arg.aksi == "still":
        still(p, [float(x) for x in arg.detik.split(",") if x])
    elif arg.aksi == "studio":
        studio(p)
    elif arg.aksi == "qa":
        if not qa(p):
            sys.exit(1)
    else:
        render(p)


if __name__ == "__main__":
    main_aman(main)
