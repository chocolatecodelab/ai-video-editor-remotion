"""storyboard — pratinjau sebelum render penuh: thumbnail, timeline, timestamp, transkrip, pra-QA.

Pemakaian:
    python storyboard.py <folder-proyek> [--buka]

Output : out/storyboard.html (+ out/storyboard/*.jpg), out/storyboard.json
Lalu   : video.py setuju <proyek>   → mencatat persetujuan atas versi beat-sheet ini
         video.py semua <proyek>    → render penuh

Thumbnail diambil di frame saat tiap elemen tampil penuh, dengan mesin yang sama dengan render final
(termasuk overlay Remotion). Di frame itu kontras & kotak elemen diukur, jadi pra-QA bisa mengecek zona aman,
tumpang tindih, kontras, kecepatan baca, durasi efek, stagger, dan template — tanpa render penuh.
Aturan yang butuh file hasil render (loudness, ekspor, mask per frame) ditandai "setelah render".
"""
from __future__ import annotations

import argparse
import datetime as dt
import os
import re

from PIL import Image

import qa
import storyboard_html
from render import Renderer
from sistem import GagalPipeline, Proyek, baca_json, log, main_aman, sha_file, tulis_json

LEBAR_THUMB = 360  # tampil 196 px di pita (≈2×), cukup tajam saat diperbesar


def sha_beat(p: Proyek) -> str:
    return sha_file(p.beat_sheet_path, penuh=True)


def _tengah(r: dict) -> float:
    return (r["mulai"] + r.get("delay", 0) + r.get("durasi_masuk", 0) + r["selesai"] - r.get("durasi_keluar", 0)) / 2


def kumpulkan(r: Renderer) -> tuple[list[dict], list[dict]]:
    """→ (item timeline: elemen/push/broll, daftar waktu thumbnail)."""
    fps = r.p.fps
    rek = list(r.rekam.values())
    items = []
    for rec in rek:
        if rec.get("induk") or rec["tipe"] == "caption":
            continue
        if rec["tipe"] == "remotion" and rec.get("dekoratif"):  # hiasan yang memudar (partikel): sampel saat tampak, bukan di akhir
            t = rec["mulai"] + min(0.4, (rec["selesai"] - rec["mulai"]) / 3)
        elif rec["tipe"] == "remotion":
            t = rec["t_ukur"]
        else:
            t = max([_tengah(rec)] + [_tengah(x) for x in rek if x.get("induk") == rec["id"]])
        anak = " · ".join(x["teks"] for x in rek if x.get("induk") == rec["id"] and x.get("teks"))
        items.append({"id": rec["id"], "tipe": rec["tipe"], "beat": rec.get("beat"), "mulai": rec["mulai"],
                      "selesai": rec["selesai"],
                      "teks": rec.get("teks") or anak or rec.get("file") or rec.get("komposisi") or "",
                      "efek": rec.get("efek"), "komposisi": rec.get("komposisi"), "anchor": rec.get("anchor"), "masuk": rec.get("masuk"),
                      "keluar": rec.get("keluar"), "t": min(t, rec["selesai"] - 1 / fps)})
    for u in r.push:
        items.append({"id": u["id"], "tipe": "push", "beat": u["id"].split("/")[0], "mulai": u["mulai"],
                      "selesai": u["selesai"], "teks": (f"zoom potong ×{u['skala']:.2f}" if u.get("potong")
                                                       else f"push ×{u['skala']:.2f}, gerak {u['gerak']:.2f}s, {u['easing']}"),
                      "efek": u.get("efek"), "anchor": None, "t": min(u["selesai"] - 1 / fps, u["mulai"] + u["gerak"])})
    for b in r.broll:
        items.append({"id": b["id"], "tipe": "broll", "beat": b["id"].split("/")[0], "mulai": b["mulai"],
                      "selesai": b["selesai"], "teks": os.path.basename(str(b["file"])), "efek": b.get("efek"),
                      "anchor": None, "t": (b["mulai"] + b["selesai"]) / 2})
    items.sort(key=lambda x: x["mulai"])
    # satu thumbnail per frame unik; beat tanpa elemen tetap dapat satu thumbnail
    waktu = {round(i["t"] * fps): i["id"] for i in items}
    for b in r.bs["beats"]:
        if not any(b["mulai"] <= w / fps < b["selesai"] for w in waktu):
            waktu[round(min(b["mulai"] + 0.5, (b["mulai"] + b["selesai"]) / 2) * fps)] = f"beat {b['id']}"
    thumbs = []
    for f, lbl in sorted(waktu.items()):
        if thumbs and f - thumbs[-1]["frame"] < 0.25 * fps:
            thumbs[-1]["label"] += f", {lbl}"
            continue
        thumbs.append({"frame": f, "t": f / fps, "label": lbl})
    return items, thumbs


def _isu_per_elemen(hasil: list[dict], ids: list[str]) -> dict[str, list[tuple]]:
    isu: dict[str, list[tuple]] = {}
    for h in hasil:
        if h["status"] not in (qa.GAGAL, qa.PERINGATAN):
            continue
        for baris in h["detail"]:
            for i in ids:
                if re.search(rf"(^|[^\w/-]){re.escape(i)}([^\w-]|$)", baris):
                    isu.setdefault(i, []).append((h["id"], h["status"], baris))
    return isu


def storyboard(p: Proyek, buka: bool = False) -> dict:
    r = Renderer(p)
    dur = r.dur
    items, thumbs = kumpulkan(r)
    d = p.out / "storyboard"
    d.mkdir(parents=True, exist_ok=True)
    for f in d.glob("*.jpg"):
        f.unlink()
    log("storyboard", f"{len(thumbs)} thumbnail, {len(items)} elemen …")
    for th in thumbs:
        img = Image.fromarray(r.potret(th["t"]))
        img = img.resize((LEBAR_THUMB, round(img.height * LEBAR_THUMB / img.width)), Image.LANCZOS)
        th["file"] = f"storyboard/t{th['frame']:05d}.jpg"
        img.save(p.out / th["file"], quality=85)
    r._tutup_pembaca()

    layout = r.layout(None)
    hasil = qa.evaluasi(p, qa.Ctx(p, layout), qa.BUTUH_RENDER)
    status, n = qa.ringkas(hasil)
    isu = _isu_per_elemen(hasil, sorted({i["id"] for i in items} | {x["id"] for x in layout["elemen"]}))
    data = {"proyek": p.manifest["proyek"], "waktu": dt.datetime.now().isoformat(timespec="seconds"),
            "beat_sheet_sha": sha_beat(p), "durasi": round(dur, 3), "pra_qa": status, "ringkas": n,
            "elemen": [{k: v for k, v in i.items()} for i in items], "thumbnail": thumbs}
    tulis_json(p.out / "storyboard.json", data)
    halaman = p.out / "storyboard.html"
    halaman.write_text(_html(p, r, items, thumbs, hasil, status, n, isu, layout), encoding="utf-8")
    log("storyboard", f"pra-QA {status} (gagal {n[qa.GAGAL]}, peringatan {n[qa.PERINGATAN]}) → "
                      f"{halaman.relative_to(p.dir)}")
    if buka and hasattr(os, "startfile"):
        os.startfile(halaman)
    return data


def _html(p, r, items, thumbs, hasil, status, n, isu, layout) -> str:
    """Halaman tinjauan (desain & interaksi: storyboard_html.py + storyboard_aset/)."""
    return storyboard_html.halaman(p, r, items, thumbs, hasil, status, n, isu, layout, sha_beat(p), LEBAR_THUMB)


def setuju(p: Proyek) -> dict:
    sb = p.out / "storyboard.json"
    if not sb.exists():
        raise GagalPipeline("Belum ada storyboard. Jalankan: video.py storyboard <proyek>")
    data = baca_json(sb)
    if data["beat_sheet_sha"] != sha_beat(p):
        raise GagalPipeline("beat-sheet.json berubah sejak storyboard dibuat. Buat ulang storyboard lalu setujui.")
    if data["pra_qa"] != "LULUS":
        log("setuju", f"PERINGATAN: pra-QA {data['pra_qa']} — tetap disetujui atas keputusan pengguna.")
    p.manifest["persetujuan"] = {"beat_sheet_sha": data["beat_sheet_sha"], "waktu": dt.datetime.now().isoformat(timespec="seconds"),
                                 "pra_qa": data["pra_qa"], "storyboard": data["waktu"]}
    p.manifest["status"] = "disetujui"
    p.simpan_manifest()
    log("setuju", f"beat-sheet {data['beat_sheet_sha'][:10]} disetujui. Lanjut: video.py semua <proyek>")
    return p.manifest["persetujuan"]


def cek_persetujuan(p: Proyek) -> str | None:
    """Pesan peringatan bila render penuh dijalankan tanpa persetujuan atas beat-sheet saat ini."""
    s = (p.manifest.get("persetujuan") or {}).get("beat_sheet_sha")
    if not s:
        return "beat-sheet belum disetujui (video.py storyboard → setuju)."
    if s != sha_beat(p):
        return "beat-sheet berubah sejak disetujui (buat storyboard & setujui ulang)."
    return None


def wajib_persetujuan(p: Proyek, lewati: bool = False) -> None:
    """Gerbang render penuh: beat-sheet saat ini harus sudah disetujui pengguna lewat storyboard.
    lewati (--tanpa-setuju) hanya atas keputusan pengguna — dicatat di manifest.render_tanpa_setuju."""
    pesan = cek_persetujuan(p)
    if not pesan:
        return
    if not lewati:
        raise GagalPipeline(f"Render penuh ditolak: {pesan}\n"
                            "  video.py storyboard <proyek> --buka → tunjukkan ke pengguna → video.py setuju <proyek>\n"
                            "  (hanya bila pengguna sendiri memutuskan render tanpa persetujuan: tambah --tanpa-setuju)")
    log("render", f"PERINGATAN: {pesan} Dilanjutkan dengan --tanpa-setuju.")
    p.manifest.setdefault("render_tanpa_setuju", []).append(
        {"waktu": dt.datetime.now().isoformat(timespec="seconds"), "beat_sheet_sha": sha_beat(p), "sebab": pesan})
    p.simpan_manifest()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--buka", action="store_true", help="buka storyboard.html di browser")
    arg = ap.parse_args()
    storyboard(Proyek(arg.proyek), arg.buka)
    return 0


if __name__ == "__main__":
    main_aman(main)
