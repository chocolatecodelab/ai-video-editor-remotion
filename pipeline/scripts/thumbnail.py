"""Four reference-backed cover templates. Called after final export; never re-renders a video."""
from __future__ import annotations

import argparse
import hashlib
import math
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

from sistem import ROOT, GagalPipeline, Proyek, baca_json, durasi, jalankan, log, main_aman, tulis_json

TEMPLATE = ROOT / "thumbnail/brand-v1.json"


def brand_for(p: Proyek) -> str | None:
    cfg = p.manifest.get("thumbnail", {})
    value = cfg.get("brand") or p.manifest.get("brand")
    aliases = {"otca official": "otca", "otca-official": "otca", "info jerman": "info-jerman",
               "jepang koey": "jepang-koey", "ciao manda": "ciao-manda"}
    if value:
        value = aliases.get(str(value).lower(), str(value).lower())
        if value not in baca_json(TEMPLATE)["brands"]:
            raise GagalPipeline(f"Brand thumbnail tidak dikenal: {value}")
        return value
    # Legacy projects have explicit brand names in their slug; do not infer brand from colors.
    for slug in ("info-jerman", "jepang-koey", "ciao-manda", "otca"):
        if re.search(r"(?:^|[_-])" + re.escape(slug) + r"(?:[_-]|$)", p.dir.name.lower()):
            return slug
    return None


def wrap(text: str, font, width: int, maximum: int) -> list[str]:
    lines = []
    for paragraph in text.splitlines():
        current = ""
        for word in paragraph.split():
            if font.getlength(word) > width:
                raise GagalPipeline("Kata headline terlalu panjang untuk template.")
            candidate = f"{current} {word}".strip()
            if current and font.getlength(candidate) > width:
                lines.append(current)
                current = word
            else:
                current = candidate
        if current:
            lines.append(current)
    if not lines or len(lines) > maximum:
        raise GagalPipeline(f"Teks thumbnail perlu diringkas: maksimum {maximum} baris; tidak dipotong otomatis.")
    return lines


def select_photo(p: Proyek, cfg: dict) -> tuple[Image.Image, list[float], dict]:
    import cv2
    from wajah import Detektor

    detector = Detektor()
    if cfg.get("photo"):
        path = p.path_aset(cfg["photo"])
        im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        face = detector(np.asarray(im.resize((360, round(im.height * 360 / im.width)))))
        if not face:
            raise GagalPipeline("Foto thumbnail tidak memiliki wajah yang terdeteksi; pilih foto lain.")
        return im, face, {"photo": str(path)}
    source = p.ingest_video if p.ingest_video.exists() else p.path_aset(p.manifest.get("aset", {}).get("rekaman"))
    if not source or not source.exists():
        raise GagalPipeline("Sumber thumbnail belum ada. Siapkan footage atau thumbnail.photo.")
    length = durasi(source)
    times = [float(cfg["frame_time"])] if "frame_time" in cfg else [length * x for x in (.13, .27, .43, .59, .73)]
    work = p.cache / "thumbnail"
    work.mkdir(exist_ok=True)
    candidates = []
    for i, t in enumerate(times):
        if not 0 <= t < length:
            raise GagalPipeline("Waktu foto thumbnail di luar durasi sumber.")
        dest = work / f"candidate-{i}.png"
        jalankan(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.4f}", "-i", source, "-frames:v", "1", dest])
        im = Image.open(dest).convert("RGB")
        small = im.resize((360, round(im.height * 360 / im.width)))
        face = detector(np.asarray(small))
        if face:
            x0, y0, x1, y1 = face
            patch = np.asarray(small)[int(y0 * small.height):int(y1 * small.height),
                                      int(x0 * small.width):int(x1 * small.width)]
            sharpness = float(cv2.Laplacian(cv2.cvtColor(patch, cv2.COLOR_RGB2GRAY), cv2.CV_64F).var())
            candidates.append((sharpness, im, face, {"source": str(source), "frame_time": t, "sharpness": sharpness}))
    if not candidates:
        raise GagalPipeline("Tidak ada wajah jelas pada kandidat thumbnail; tetapkan thumbnail.photo/frame_time.")
    _, im, face, meta = max(candidates, key=lambda x: x[0])
    return im, face, meta


def compose(photo: Image.Image, face: list[float], brand: str, headline: str, sub: str,
            fmt: str, cfg: dict) -> tuple[Image.Image, dict]:
    template = baca_json(TEMPLATE)
    b = template["brands"][brand]
    w, h = template["formats"][fmt]
    margin = b["margin"]
    font = ImageFont.truetype(str(ROOT / "pipeline/fonts" / template["font_judul"]), 76)
    small = ImageFont.truetype(str(ROOT / "pipeline/fonts" / template["font_sub"]), 34)
    lines = wrap(headline.upper(), font, w - 2 * margin - 16, 4)
    subs = wrap(sub, small, w - 2 * margin, 3) if sub else []
    bottom = h - (420 if fmt == "reels" else 115)
    text_height = len(lines) * 81 + (32 + len(subs) * 43 if subs else 0)
    top = bottom - text_height
    x0, y0, x1, y1 = face
    # Face anchor is measured in the source, then mapped to a fixed portrait slot.
    scale = max(w / photo.width, h / photo.height, 390 / ((x1 - x0) * photo.width))
    cx, cy = (x0 + x1) / 2 * photo.width, (y0 + y1) / 2 * photo.height
    dx = w / 2 - cx * scale
    target_y = min(h * .38, top - 220)
    dy = target_y - cy * scale
    # Never leave an uncovered border when reframing a portrait.
    dx = min(0, max(w - photo.width * scale, dx))
    dy = min(0, max(h - photo.height * scale, dy))
    im = photo.transform((w, h), Image.Transform.AFFINE, (1 / scale, 0, -dx / scale, 0, 1 / scale, -dy / scale),
                         resample=Image.Resampling.BICUBIC).convert("RGBA")
    if b.get("background") == "ivory-cutout" and not cfg.get("keep_background"):
        background = Image.new("RGBA", (w, h), "#F8F6F2")
        pattern = ImageDraw.Draw(background)
        for row in range(10):
            points = [(x, round(120 + row * 42 + 18 * math.sin(x / 130 + row * .24)))
                      for x in range(0, w + 1, 4)]
            pattern.line(points, fill="#EEEAE3", width=2)
        im = Image.alpha_composite(background, im)
    face_box = [x0 * photo.width * scale + dx, y0 * photo.height * scale + dy,
                x1 * photo.width * scale + dx, y1 * photo.height * scale + dy]
    if face_box[3] + 18 > top:
        raise GagalPipeline("Headline bertabrakan dengan wajah; ringkas judul atau pilih foto/framing lain.")
    if not (0 <= face_box[0] < face_box[2] <= w and 0 <= face_box[1] < face_box[3] <= h):
        raise GagalPipeline("Wajah terpotong oleh kanvas; pilih foto/framing lain.")
    overlay = Image.new("RGBA", (w, h))
    draw = ImageDraw.Draw(overlay)
    color = tuple(int(b["overlay"][i:i + 2], 16) for i in (1, 3, 5))
    start = max(int(face_box[3] + 10), top - 280)
    for y in range(start, h):
        alpha = min(255, round(255 * (y - start) / max(1, top + 70 - start)))
        draw.line((0, y, w, y), fill=(*color, alpha))
    if brand == "otca":
        for y in range(220):
            draw.line((0, y, w, y), fill=(0, 0, 0, round(190 * (1 - y / 220))))
    im = Image.alpha_composite(im, overlay)
    d = ImageDraw.Draw(im)
    if brand == "jepang-koey":
        # Brand line motif; never bake the platform's Reels badge into artwork.
        for i in range(3):
            d.rounded_rectangle((w - 235 + i * 22, 42 + i * 45, w + 35, 68 + i * 45), radius=14, outline="white", width=3)
    logo = cfg.get("logo", b["logo"])
    if logo:
        lp = Path(logo) if Path(logo).is_absolute() else ROOT / logo
        asset = Image.open(lp).convert("RGBA")
        asset.thumbnail((235, 150 if brand == "ciao-manda" else 72), Image.Resampling.LANCZOS)
        im.alpha_composite(asset, ((w - asset.width) // 2, 315 if fmt == "reels" else 55))
    d = ImageDraw.Draw(im)
    boxes = []
    for i, line in enumerate(lines):
        y = top + i * 81
        fill = b["accent"] if b["highlight"] == "last-line" and i == len(lines) - 1 else b["headline"]
        box = d.textbbox((margin, y), line, font=font, anchor="lt")
        if b["highlight"] == "white-band" and i == len(lines) - 1:
            d.rectangle((box[0] - 6, box[1] - 3, box[2] + 7, box[3] + 4), fill="white")
            fill = b["accent"]
        d.text((margin, y), line, font=font, fill=fill, anchor="lt")
        boxes.append(box)
    for i, line in enumerate(subs):
        y = top + len(lines) * 81 + 32 + i * 43
        d.text((margin, y), line, font=small, fill=b["sub"], anchor="lt")
        boxes.append(d.textbbox((margin, y), line, font=small, anchor="lt"))
    if not all(0 <= a < c <= w and 0 <= b0 < d0 <= h for a, b0, c, d0 in boxes):
        raise GagalPipeline("Teks thumbnail keluar kanvas.")
    return im.convert("RGB"), {"face": face_box, "text_boxes": boxes, "font_headline": 76, "format": fmt}


def generate(p: Proyek, *, record_manifest: bool = True) -> list[Path]:
    cfg = dict(p.manifest.get("thumbnail", {}))
    if cfg.get("aktif") is False:
        return []
    brand = brand_for(p)
    if not brand:
        log("thumbnail", "brand belum ditetapkan; proyek nonbrand tidak diberi template empat brand.")
        return []
    if cfg.get("logo"):
        cfg["logo"] = str(p.path_aset(cfg["logo"]))
    headline = cfg.get("headline") or p.manifest.get("judul", "").split(" — ")[0]
    headline = re.sub(r"\s*\([^)]*(?:split|Info Jerman|Ciao Manda|Jepang Koey)[^)]*\)\s*$", "", headline)
    sub = cfg.get("subheadline", "")
    # Validate both layouts before overwriting a previously valid cover.
    prepared = []
    try:
        photo, face, meta = select_photo(p, cfg)
        meta["photo_pixels_sha256"] = hashlib.sha256(photo.tobytes()).hexdigest()
        if baca_json(TEMPLATE)["brands"][brand].get("background") == "ivory-cutout" and not cfg.get("keep_background"):
            from rembg import new_session, remove
            # One still only, using the existing pipeline model cache on D:.
            photo = remove(photo, session=new_session("u2net_human_seg"))
            meta["cutout_model"] = "u2net_human_seg"
        for fmt in ("reels", "grid"):
            image, geometry = compose(photo, face, brand, headline, sub, fmt, cfg)
            prepared.append((fmt, image, geometry))
    except Exception as exc:
        tulis_json(p.out / "thumbnail-qa.json", {"status": "GAGAL", "headline": headline, "error": str(exc)})
        raise
    output, qa = [], []
    for fmt, image, geometry in prepared:
        dest = p.out / ("thumbnail.png" if fmt == "reels" else "thumbnail-grid.png")
        image.save(dest)
        image.save(dest.with_suffix(".jpg"), quality=95, subsampling=0)
        output.extend([dest, dest.with_suffix(".jpg")])
        qa.append(geometry)
    version = baca_json(TEMPLATE)["versi"]
    result = {"status": "LULUS", "template": f"{brand}@{version}", "headline": headline, "subheadline": sub,
              "source": meta, "layout": qa, "template_sha": hashlib.sha256(TEMPLATE.read_bytes()).hexdigest(),
              "renderer_sha": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              "manual": "Periksa ekspresi, potongan hijab/rambut, dan judul pada storyboard; sharpness bukan deteksi mata terbuka."}
    tulis_json(p.out / "thumbnail-qa.json", result)
    if record_manifest:
        p.manifest["thumbnail_hasil"] = {"template": result["template"], "files": [f"out/{x.name}" for x in output]}
        p.simpan_manifest()
    log("thumbnail", f"{brand}: cover 9:16 + grid 3:4 → {p.out}")
    return output


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("proyek")
    args = ap.parse_args()
    generate(Proyek(args.proyek))
    return 0


if __name__ == "__main__":
    main_aman(main)
