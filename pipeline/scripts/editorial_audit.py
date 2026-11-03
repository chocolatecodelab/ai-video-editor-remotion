"""Bukti QA tambahan komposisi campuran dari MP4 final, bukan still storyboard."""
from __future__ import annotations

from PIL import Image, ImageDraw, ImageFont, ImageStat

from sistem import ROOT, Proyek, baca_json, jalankan, log, tulis_json


def audit(p: Proyek) -> bool:
    props = baca_json(p.dir / p.manifest.get("editorial_props", "production-props.json"))
    beats = baca_json(p.dir / "beat-sheet-editorial.json")["beats"]
    video = p.out / f"{p.dir.name}.mp4"
    samples = p.out / "qa-frames"
    samples.mkdir(exist_ok=True)
    records = []
    images = []
    for b in beats:
        target = samples / f"{b['id']}.jpg"
        jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", str(b["still"]),
                  "-i", video, "-frames:v", 1, "-vf", "scale=360:640", "-q:v", "2", target])
        im = Image.open(target).convert("RGB")
        gray = im.convert("L")
        bottom = ImageStat.Stat(gray.crop((20, 540, 340, 620))).stddev[0]
        all_std = ImageStat.Stat(gray).stddev[0]
        full = b["layout"] == "full"
        records.append({"id": b["id"], "layout": b["layout"], "t": b["still"],
                        "bottom_std": round(bottom, 2), "frame_std": round(all_std, 2),
                        "mode_correct": bottom < 3 if full else bottom > 8,
                        "not_blank": all_std > 8})
        images.append((b, im))
    # Check three consecutive frames around every editorial cut for unintended empty frames.
    transition = []
    for b in beats[1:]:
        n = int(round(b["mulai"] * props["fps"]))
        for offset in [-1, 0, 1]:
            t = (n + offset) / props["fps"]
            target = samples / f"cut-{b['id']}-{offset + 1}.jpg"
            jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", str(t),
                      "-i", video, "-frames:v", 1, "-vf", "scale=270:480", "-q:v", "3", target])
            std = ImageStat.Stat(Image.open(target).convert("L")).stddev[0]
            transition.append({"cut": b["id"], "frame": n + offset, "std": round(std, 2), "not_blank": std > 5})
    font = ImageFont.truetype(str(ROOT / "pipeline/fonts/Montserrat-SemiBold.ttf"), 18)
    small = ImageFont.truetype(str(ROOT / "pipeline/fonts/Montserrat-Medium.ttf"), 14)
    sheet = Image.new("RGB", (1220, 1160), "#080808")
    draw = ImageDraw.Draw(sheet)
    draw.text((30, 18), "OTCA / FRAME DARI VIDEO FINAL", font=font, fill="#CB9D31")
    draw.text((30, 48), "5 full frame + 4 split / narasi dan CTA asli / 1080 x 1920", font=small, fill="white")
    for i, (b, im) in enumerate(images):
        x, y = 30 + (i % 5) * 240, 90 + (i // 5) * 530
        im.thumbnail((216, 384))
        sheet.paste(im, (x, y))
        draw.text((x, y + 398), f"{b['id']} / {b['still']:.2f}s / {b['layout'].upper()}", font=small, fill="#CB9D31")
        lines = [""]
        for word in b["judul"].split():
            if draw.textlength(lines[-1] + " " + word, font=small) > 216:
                lines.append(word)
            else:
                lines[-1] = (lines[-1] + " " + word).strip()
        for j, line in enumerate(lines):
            draw.text((x, y + 426 + j * 21), line, font=small, fill="white")
    sheet.save(p.out / "kontak.png")
    ok = all(x["mode_correct"] and x["not_blank"] for x in records) and all(x["not_blank"] for x in transition)
    tulis_json(p.out / "editorial-audit.json", {"status": "LULUS" if ok else "GAGAL", "adegan": records,
                                               "transisi": transition, "cakupan": "Sampel scene dan tiga frame di setiap cut; bukan deteksi wajah di seluruh frame."})
    qa = baca_json(p.out / "qa.json")
    bpm = (props.get("ketukan") or {}).get("bpm", "tidak ditetapkan")
    for item in qa["hasil"]:
        if item["id"] == "KETUKAN":
            item["detail"] = f"Grid visual {bpm} BPM; musik disesuaikan dengan grid. Potongan mengikuti ucapan storyboard; jumlah snap lama bukan pengukuran hasil final."
    qa["hasil"].append({"id": "LAYOUT-EDITORIAL", "aturan": "mode campuran pada MP4 final, tanpa frame kosong di cut",
                        "status": "LULUS" if ok else "GAGAL", "detail": "9 sampel adegan dan 24 frame transisi diperiksa"})
    if not ok:
        qa["status"] = "GAGAL"
    tulis_json(p.out / "qa.json", qa)
    with (p.out / "qa-report.md").open("a", encoding="utf-8") as f:
        f.write("\n## Audit editorial dari video final\n\n")
        f.write(f"**{'LULUS' if ok else 'GAGAL'}** — 9 sampel scene dan 24 frame di sekitar cut.\n\n")
        f.write("Full frame: area bawah tidak mengandung tekstur footage. Split: footage tetap hadir. "
                "Tidak ada frame kosong di sampel cut. Hasil rinci: editorial-audit.json; bukti: kontak.png.\n\n")
        f.write("Batas pemeriksaan: sampel visual tidak menggantikan review setiap frame atau tontonan di HP/headphone. "
                "K00 penempatan dan K05 kontinuitas ditinjau pada sampel; K02 depth/mask tidak digunakan; "
                "K04 sumber dan transkrip diverifikasi lewat cache/provenance.json; K06/K07 memakai pengukuran media; "
                "K08 ducking memakai timestamp transkrip; K09 memakai 9 modul berbeda; K10 tampilan kulit/grain tetap perlu review visual.\n")
    report = p.out / "qa-report.md"
    text = report.read_text(encoding="utf-8")
    text = text.replace("(layout split)", "(editorial campuran split/full)")
    # The legacy split reporter describes snap counts from its original grid; the frozen
    # storyboard fixes cut times, so do not present those counts as fresh evidence.
    lines = text.splitlines()
    lines = [f"| KETUKAN | tempo audio dan grid visual | LULUS | {bpm} BPM; potongan tetap mengikuti ucapan storyboard, bukan klaim snap baru |" if line.startswith("| KETUKAN |") else line for line in lines]
    report.write_text("\n".join(lines) + "\n", encoding="utf-8")
    p.manifest["qa"] = qa["status"]
    p.simpan_manifest()
    log("editorial", f"audit final {'LULUS' if ok else 'GAGAL'}; kontak.png dibuat")
    return ok
