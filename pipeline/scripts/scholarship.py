"""Renderer ScholarshipReel: approval gate, existing split audio bus, and final-file QA."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import split
from sistem import (ROOT, SEMENTARA, GagalPipeline, Proyek, baca_json, durasi, ffprobe,
                    fps_dari, jalankan, log, stream, tulis_json, ukur_loudness)


def approved_props(p: Proyek) -> tuple[dict, dict]:
    cfg = baca_json(p.dir / "split.json")
    path = (p.dir / cfg["props"]).resolve()
    if not path.is_relative_to(p.dir.resolve()):
        raise GagalPipeline("Props harus berada dalam folder proyek.")
    approval = p.manifest.get("persetujuan", {})
    if hashlib.sha256(path.read_bytes()).hexdigest() != approval.get("scholarship_props_sha"):
        raise GagalPipeline("Props ScholarshipReel belum disetujui atau sudah berubah.")
    for rel, sha in approval.get("source_sha", {}).items():
        source = (ROOT / rel).resolve()
        if not source.is_relative_to(ROOT) or hashlib.sha256(source.read_bytes()).hexdigest() != sha:
            raise GagalPipeline(f"Sumber komposisi berubah sejak pembekuan produksi: {rel}")
    props = baca_json(path)
    if not props.get("cutout"):
        raise GagalPipeline("Produksi full hitam memerlukan cutout talent.")
    if props["W"] != 1080 or props["H"] != 1920 or props["fps"] != 30:
        raise GagalPipeline("Format ScholarshipReel harus 1080x1920 @30.")
    previous = 0.0
    for s in props["scenes"]:
        if s["mode"] not in ("split", "full") or abs(s["mulai"] - previous) > 1 / 30:
            raise GagalPipeline("Timeline tidak kontinu atau mode tidak dikenal.")
        if s["selesai"] <= s["mulai"]:
            raise GagalPipeline("Adegan memiliki durasi tidak valid.")
        previous = s["selesai"]
    expected = baca_json(p.cache / "words-production.json")["kata"]
    flattened = [w for page in props["pages"] for w in page]
    if [(w["w"], w["s"], w["e"]) for w in flattened] != [(w["w"], w["s"], w["e"]) for w in expected]:
        raise GagalPipeline("Caption berbeda dari transkrip produksi.")
    directory = (ROOT / "remotion/public" / props["cutout"]["dir"]).resolve()
    if not directory.is_relative_to((ROOT / "remotion/public").resolve()):
        raise GagalPipeline("Direktori cutout keluar dari public.")
    missing = [f for f in range(props["durasiFrame"])
               if any(s["mode"] == "split" and s["mulai"] <= f / 30 < s["selesai"] for s in props["scenes"])
               and not (directory / f"{f:06d}.webp").exists()]
    if missing:
        raise GagalPipeline(f"{len(missing)} frame cutout belum tersedia.")
    return cfg, props


def render(p: Proyek) -> Path:
    cfg, props = approved_props(p)
    work = SEMENTARA / "scholarship" / p.dir.name
    work.mkdir(parents=True, exist_ok=True)
    split.rj.siapkan_font(props["tokens"])
    job = {"props": str(p.dir / cfg["props"]), "entry": str(ROOT / "remotion" / cfg["entry"]),
           "composition": cfg["composition"], "work": str(work), "mode": "render"}
    tulis_json(work / "job.json", job)
    log("scholarship", f"render {props['durasiFrame']} frame; black background + alpha talent")
    jalankan(["node", ROOT / "pipeline/scripts/scholarship_render.cjs", work / "job.json"])
    audio = work / "master.wav"
    (SEMENTARA / "split" / p.dir.name).mkdir(parents=True, exist_ok=True)
    tulis_json(SEMENTARA / "split" / p.dir.name / "props.json", props)
    lu = split.mix_audio(p, cfg, audio)
    log("scholarship", f"master {lu['lufs']:.1f} LUFS / {lu['true_peak']:.1f} dBTP")
    out = p.out / f"{p.dir.name}.mp4"
    jalankan(["ffmpeg", "-y", "-v", "error", "-i", work / "picture.mp4", "-i", audio,
              "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "17", "-preset", "slow",
              "-pix_fmt", "yuv420p", "-profile:v", "high", "-color_primaries", "bt709",
              "-color_trc", "bt709", "-colorspace", "bt709", "-c:a", "aac", "-b:a", "256k",
              "-ar", "48000", "-movflags", "+faststart", "-shortest", out])
    return out


def qa(p: Proyek) -> bool:
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont

    _, props = approved_props(p)
    out = p.out / f"{p.dir.name}.mp4"
    checks = []

    def check(name: str, ok: bool, detail):
        checks.append({"id": name, "status": "LULUS" if ok else "GAGAL", "detail": detail})

    info = ffprobe(out)
    v, a = stream(info, "video"), stream(info, "audio")
    check("FORMAT", bool(v and a and v["width"] == 1080 and v["height"] == 1920
                         and abs(fps_dari(v) - 30) < .01 and v["codec_name"] == "h264"
                         and a["codec_name"] == "aac"), "1080x1920, 30 fps, H.264/AAC")
    check("WARNA", all(v.get(k) == "bt709" for k in ("color_space", "color_transfer", "color_primaries")),
          {k: v.get(k) for k in ("color_space", "color_transfer", "color_primaries")})
    check("DURASI", abs(durasi(out) - props["durasiFrame"] / 30) < .1,
          {"final": durasi(out), "rencana": props["durasiFrame"] / 30})
    lu = ukur_loudness(out)
    check("AUDIO", abs(lu["lufs"] + 14) <= 1 and lu["true_peak"] <= -1.95, lu)
    rows = []
    for i, page in enumerate(props["pages"]):
        end = min(props["pages"][i + 1][0]["s"] if i + 1 < len(props["pages"]) else float("inf"), page[-1]["e"] + .22)
        seconds = end - page[0]["s"] + .02
        cps = len(" ".join(w["w"] for w in page)) / seconds
        rows.append({"teks": " ".join(w["w"] for w in page), "durasi": round(seconds, 3), "cps": round(cps, 2)})
    check("CAPTION_BACA", all(r["durasi"] >= .3 and r["cps"] <= 23 for r in rows), rows)
    dom = baca_json(SEMENTARA / "scholarship" / p.dir.name / "dom-qa.json") or []
    errors = []
    for frame in dom:
        for el in frame["metrics"]:
            if el["opacity"] < .85:
                continue
            if (el["overflow"] or el["x"] < 107 or el["x"] + el["w"] > 961 or el["y"] < 249
                    or el["y"] + el["h"] > 1521 or (el.get("fontSize") is not None and el["fontSize"] < 39.5)):
                errors.append({"frame": frame["frame"], **el})
        visible = [e for e in frame["metrics"] if e["opacity"] >= .85 and e.get("text")]
        for i, first in enumerate(visible):
            for second in visible[i + 1:]:
                dx = min(first["x"] + first["w"], second["x"] + second["w"]) - max(first["x"], second["x"])
                dy = min(first["y"] + first["h"], second["y"] + second["h"]) - max(first["y"], second["y"])
                if dx > 1 and dy > 1:
                    errors.append({"frame": frame["frame"], "text_overlap": [first["text"], second["text"]]})
    covered = {d["frame"] for d in dom}
    check("DOM_LAYOUT", not errors and set(props.get("auditFrames", [])).issubset(covered),
          {"sample_frames": len(covered), "errors": errors})
    # Matting metadata also checks caption against the top of the whole person, not only a face box.
    matte = baca_json(p.cache / "depan.json")
    collisions = []
    for i, page in enumerate(props["pages"]):
        for f in range(int(page[0]["s"] * 30), int((page[-1]["e"] + .22) * 30) + 1):
            if not any(s["mode"] == "split" and s["mulai"] <= f / 30 < s["selesai"] for s in props["scenes"]):
                continue
            top = matte.get("puncak", {}).get(str(f))
            if top is None:
                collisions.append({"frame": f, "missing_mask_top": True})
                continue
            person_y = props["layout"]["talentTop"] + props["layout"]["talentOffset"] + top
            height = (2 if props["captionBreaks"][i] else 1) * 56 * 1.3 + 42
            bottom = props["layout"]["captionSplitY"] + max(132, height)
            if bottom + 12 > person_y:
                collisions.append({"frame": f, "caption_bottom": bottom, "person_top": person_y})
    check("CAPTION_SOSOK", not collisions, collisions)
    # Actual final frames, including the before/after boundary pair, are the evidence.
    frame_dir = p.out / "qa-frames"
    frame_dir.mkdir(exist_ok=True)

    def snapshot(t: float, name: str) -> np.ndarray:
        dest = frame_dir / f"{name}.png"
        jalankan(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.4f}", "-i", out,
                  "-frames:v", "1", "-vf", "scale=540:960", dest])
        return np.asarray(Image.open(dest).convert("RGB"))

    contact = Image.new("RGB", (1350, 1072), "#141414")
    draw = ImageDraw.Draw(contact)
    font = ImageFont.truetype(str(ROOT / "pipeline/fonts/Montserrat-Bold.ttf"), 14)
    black = []
    for i, s in enumerate(props["scenes"]):
        t = min(s["sample_time"], s["selesai"] - .08)
        pixels = snapshot(t, f"scene-{s['id']}")
        black.append(int(pixels[:80, :45].max()) <= 5)
        x, y = i % 5 * 270, i // 5 * 536
        contact.paste(Image.fromarray(pixels).resize((270, 480)), (x, y))
        draw.text((x + 8, y + 489), f"{s['id']} {t:.2f}s {s['mode']}", font=font, fill="white")
        if i:
            snapshot(max(0, s["mulai"] - 1 / 30), f"cut-{s['id']}-before")
            snapshot(s["mulai"] + 1 / 30, f"cut-{s['id']}-after")
    contact.save(p.out / "kontak.png")
    check("BLACK_BACKGROUND", all(black) and bool(props.get("cutout")), "Black canvas; RGBA cutout only, no source wall layer")
    motion = []
    for s in props["scenes"]:
        if s["visual"] == "brand":
            continue
        x1, x2 = 54, 480
        y1, y2 = (337, 615) if s["mode"] == "full" else (205, 409)
        a0 = snapshot(s["mulai"] + .04, f"motion-{s['id']}-start")[y1:y2, x1:x2].astype(float)
        a1 = snapshot(s["mulai"] + .7, f"motion-{s['id']}-settle")[y1:y2, x1:x2].astype(float)
        delta = float(np.abs(a0 - a1).mean())
        motion.append({"scene": s["id"], "mean_pixel_delta": round(delta, 3)})
    check("ANIMASI_ADA", all(m["mean_pixel_delta"] > .1 for m in motion), motion)
    result = {"status": "LULUS" if all(c["status"] == "LULUS" for c in checks) else "GAGAL",
              "modul": {"renderer": "ScholarshipReel@0.1", "brand": "OTCA Official", "caption": "K11", "kurasi": "K12"},
              "checks": checks,
              "manual": {"HP_dan_headphone": "belum diperiksa pengguna", "kurasi_gerak": "tinjauan sampel final diperlukan; pixel delta hanya membuktikan gerak ada"}}
    tulis_json(p.out / "qa.json", result)
    report = [f"# QA — {p.dir.name}", "", f"Status otomatis: **{result['status']}**", ""]
    report += [f"- {c['id']}: {c['status']} — {json.dumps(c['detail'], ensure_ascii=False)}" for c in checks]
    report += ["", "## Pemeriksaan manual", "", "- [ ] Tonton hasil di HP.", "- [ ] Dengarkan dengan headphone.",
               "- Kurasi sampel gerak dan tepi mask dicatat terpisah; pemeriksaan otomatis tidak menilai estetika premium."]
    (p.out / "qa-report.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    p.manifest["qa"] = result["status"]
    p.simpan_manifest()
    log("scholarship", f"QA {result['status']}; kontak.png berasal dari MP4 final")
    return result["status"] == "LULUS"
