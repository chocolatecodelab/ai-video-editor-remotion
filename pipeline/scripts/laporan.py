"""laporan — laporan perangkat per beat + kontak-sheet untuk ditinjau (dari out/layout.json + out/master.mov).

Pemakaian:
    python laporan.py <folder-proyek> [--tanpa-kontak]

Keluaran:
    out/laporan-perangkat.md / .json — per elemen: efek/komposisi, fungsi, kapan tampil, luas layar (%),
                                       menutupi wajah (% kotak wajah tertutup, dari cache/wajah.json).
    out/kontak.png                   — 3 frame per beat (awal · tengah · akhir) dengan kotak elemen aktif (warna per
                                       elemen) dan kotak wajah (garis putus merah), label beat + perangkat.
Dipanggil otomatis oleh qa.py (K00.3 memakai angka "menutupi wajah").
"""
from __future__ import annotations

import argparse
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

import wajah as modul_wajah
from perangkat import kunci_perangkat
from sistem import Proyek, baca_json, cari_font, jalankan, log, main_aman, tulis_json

BUKAN = {"caption", "sfx"}
WARNA = ["#2EC4FF", "#FFB020", "#7CFF6B", "#FF5DA2", "#B18CFF", "#FF7A45", "#40E0D0"]


def _luas(b, W, H) -> float:
    if not b:
        return 0.0
    x0, y0, x1, y1 = max(0, b[0]), max(0, b[1]), min(W, b[2]), min(H, b[3])
    return max(0.0, x1 - x0) * max(0.0, y1 - y0) / (W * H)


def _tutup_wajah(b, kotak: list, W, H) -> float | None:
    """Bagian (0–1) kotak wajah yang tertutup kotak elemen, maksimum selama elemen tampil. None = tak ada data wajah."""
    if not kotak:
        return None
    if not b:
        return 0.0
    hasil = 0.0
    for k in kotak:
        fx0, fy0, fx1, fy1 = k[0] * W, k[1] * H, k[2] * W, k[3] * H
        iw = min(b[2], fx1) - max(b[0], fx0)
        ih = min(b[3], fy1) - max(b[1], fy0)
        if iw > 0 and ih > 0:
            hasil = max(hasil, iw * ih / max(1.0, (fx1 - fx0) * (fy1 - fy0)))
    return hasil


def elemen_laporan(p: Proyek, L: dict) -> list[dict]:
    W, H = L["resolusi"]
    data_wajah = baca_json(p.cache / "wajah.json") if (p.cache / "wajah.json").exists() else None
    bukan = p.t("koreografi.bukan-perangkat", [])
    hasil = []
    for e in L["elemen"]:
        if e.get("induk") or e["tipe"] in BUKAN:
            continue
        b = e.get("bbox_animasi") or e.get("bbox")
        penuh = e["tipe"] in ("cutaway", "kamera", "latar")
        kotak = modul_wajah.kotak_di(data_wajah, e["mulai"], e["selesai"], L.get("push"))
        di_latar = any(x["tipe"] == "latar" and x["mulai"] <= e["mulai"] + 0.3 and x["selesai"] >= e["selesai"] - 0.3
                       for x in L["elemen"])  # wajah sudah tertutup latar kaca (cutaway)
        if penuh or e["tipe"] == "depth" or di_latar:
            tutup = None  # layar penuh / di balik subjek / di atas latar
        elif "tutup_wajah_px" in e:
            tutup = e["tutup_wajah_px"] if kotak else None  # overlay: diukur per piksel saat render
        else:
            tutup = _tutup_wajah(e.get("bbox_teks") or e.get("bbox"), kotak, W, H)
        hasil.append({
            "id": e["id"], "beat": e.get("beat"), "tipe": e["tipe"],
            "perangkat": kunci_perangkat(e, bukan) or e["tipe"],
            "efek": e.get("efek") or e.get("komposisi"), "fungsi": e.get("fungsi"),
            "mulai": e["mulai"], "selesai": e["selesai"], "durasi": round(e["selesai"] - e["mulai"], 2),
            "luas_layar": round(1.0 if penuh else _luas(b, W, H), 3),
            "tutup_wajah": None if tutup is None else round(tutup, 3),
            "wajah_data": bool(data_wajah), "dekoratif": bool(e.get("dekoratif")), "bbox": b,
            "teks": (e.get("teks") or "")[:60],
        })
    for tr in L.get("transisi", []):
        hasil.append({"id": tr["id"], "beat": None, "tipe": "transisi", "perangkat": f"transisi:{tr['jenis']}",
                      "efek": tr.get("efek"), "fungsi": None, "mulai": tr["mulai"], "selesai": tr["selesai"],
                      "durasi": round(tr["selesai"] - tr["mulai"], 2), "luas_layar": 1.0, "tutup_wajah": None,
                      "wajah_data": bool(data_wajah), "dekoratif": True, "bbox": None, "teks": ""})
    return sorted(hasil, key=lambda r: r["mulai"])


def tulis_laporan(p: Proyek, L: dict, rows: list[dict]) -> None:
    beats = L["beats"]
    baris = [f"# Laporan perangkat — {L['proyek']}", "",
             f"Durasi {L['durasi']} s · {len(rows)} perangkat/transisi · wajah: "
             + ("cache/wajah.json" if rows and rows[0]["wajah_data"] else "belum dideteksi (video.py wajah <proyek>)"), ""]
    for b in beats:
        isi = [r for r in rows if r["beat"] == b["id"] or (r["beat"] is None and b["mulai"] <= r["mulai"] + 0.25 < b["selesai"])]
        baris += [f"## {b['id']} ({b['mulai']:.2f}–{b['selesai']:.2f} s)", "",
                  "| Perangkat | Efek | Fungsi | Tampil (s) | Luas layar | Tutup wajah | Teks |", "|---|---|---|---|---|---|---|"]
        for r in isi:
            tw = "—" if r["tutup_wajah"] is None else f"{r['tutup_wajah']:.0%}" + (" ⚠" if r["tutup_wajah"] > 0.1 else "")
            baris.append(f"| {r['perangkat']} | {r['efek'] or '—'} | {r['fungsi'] or '—'} | {r['mulai']:.2f}–{r['selesai']:.2f} "
                         f"({r['durasi']:.1f}) | {r['luas_layar']:.0%} | {tw} | {r['teks'] or ''} |")
        baris.append("")
    (p.out / "laporan-perangkat.md").write_text("\n".join(baris), encoding="utf-8")
    tulis_json(p.out / "laporan-perangkat.json", {"proyek": L["proyek"], "elemen": rows})


def kontak(p: Proyek, L: dict, rows: list[dict], sumber: Path | None = None, lebar: int = 300) -> Path:
    """3 frame per beat dari master → out/kontak.png, dengan kotak elemen aktif & kotak wajah."""
    W, H = L["resolusi"]
    sumber = sumber or p.master_path
    data_wajah = baca_json(p.cache / "wajah.json") if (p.cache / "wajah.json").exists() else None
    tinggi = int(lebar * H / W)
    sk = lebar / W
    f_judul = ImageFont.truetype(str(cari_font("Montserrat-Bold.ttf")), 18)
    f_kecil = ImageFont.truetype(str(cari_font("Montserrat-Regular.ttf")), 13)
    beats = L["beats"]
    kol, label_h = 3, 74
    lembar = Image.new("RGB", (kol * (lebar + 8) + 8, len(beats) * (tinggi + label_h + 8) + 8), "#151515")
    g = ImageDraw.Draw(lembar)
    warna_el = {r["id"]: WARNA[i % len(WARNA)] for i, r in enumerate(x for x in rows if x["bbox"])}
    with tempfile.TemporaryDirectory() as tmp:
        for bi, b in enumerate(beats):
            a, z = b["mulai"], b["selesai"]
            # frame saat perangkat tampil penuh (60% bagian diamnya), lalu isi sisa dengan awal/tengah/akhir beat
            waktu = []
            for r in sorted((r for r in rows if r["beat"] == b["id"] and r["tipe"] not in ("latar", "transisi")),
                            key=lambda r: -r["durasi"]):
                t = r["mulai"] + 0.35 + (r["selesai"] - r["mulai"] - 0.6) * 0.6
                if a <= t < z and all(abs(t - x) > 0.8 for x in waktu):
                    waktu.append(t)
            for t in ((a + z) / 2, min(z - 0.05, a + 0.35), max(a + 0.05, z - 0.3)):
                if len(waktu) < 3 and all(abs(t - x) > 0.5 for x in waktu):
                    waktu.append(t)
            waktu = sorted(waktu[:3])
            y = 8 + bi * (tinggi + label_h + 8)
            for ki, t in enumerate(waktu):
                f = Path(tmp) / f"k{bi}_{ki}.png"
                jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{max(0.0, t):.3f}", "-i", sumber,
                          "-frames:v", 1, "-vf", f"scale={lebar}:{tinggi}", f])
                x = 8 + ki * (lebar + 8)
                if f.exists():
                    lembar.paste(Image.open(f).convert("RGB"), (x, y))
                for r in rows:
                    if r["bbox"] and r["mulai"] <= t < r["selesai"] and r["luas_layar"] < 0.95:
                        bx = [x + r["bbox"][0] * sk, y + r["bbox"][1] * sk, x + r["bbox"][2] * sk, y + r["bbox"][3] * sk]
                        g.rectangle(bx, outline=warna_el.get(r["id"], "#FFFFFF"), width=2)
                for k in modul_wajah.kotak_di(data_wajah, t - 0.15, t + 0.15, L.get("push"))[:1]:
                    fx = [x + k[0] * lebar, y + k[1] * tinggi, x + k[2] * lebar, y + k[3] * tinggi]
                    for xa in range(int(fx[0]), int(fx[2]), 8):  # garis putus: kotak wajah
                        g.line([(xa, fx[1]), (min(xa + 4, fx[2]), fx[1])], fill="#FF3B3B", width=2)
                        g.line([(xa, fx[3]), (min(xa + 4, fx[2]), fx[3])], fill="#FF3B3B", width=2)
                    for ya in range(int(fx[1]), int(fx[3]), 8):
                        g.line([(fx[0], ya), (fx[0], min(ya + 4, fx[3]))], fill="#FF3B3B", width=2)
                        g.line([(fx[2], ya), (fx[2], min(ya + 4, fx[3]))], fill="#FF3B3B", width=2)
                g.text((x + 6, y + 4), f"{t:.1f}s", font=f_kecil, fill="#FFFFFF", stroke_width=2, stroke_fill="#000000")
            aktif = [r for r in rows if r["mulai"] < z and r["selesai"] > a and r["tipe"] != "latar"]
            g.text((10, y + tinggi + 6), f"{b['id']}  {a:.1f}–{z:.1f}s", font=f_judul, fill="#FFFFFF")
            teks = "  ·  ".join(f"{r['perangkat']}" + (f" [{r['fungsi']}]" if r["fungsi"] else "") for r in aktif) or "—"
            g.text((10, y + tinggi + 32), teks[:150], font=f_kecil, fill="#BBBBBB")
            tutup = [r for r in aktif if (r["tutup_wajah"] or 0) > 0.1]
            if tutup:
                g.text((10, y + tinggi + 52), "⚠ menutupi wajah: " + ", ".join(r["perangkat"] for r in tutup), font=f_kecil, fill="#FF6B6B")
    out = p.out / "kontak.png"
    lembar.save(out)
    return out


def laporan(p: Proyek, dengan_kontak: bool = True) -> list[dict]:
    if not p.layout_path.exists():
        log("laporan", "out/layout.json belum ada — render dulu.")
        return []
    L = baca_json(p.layout_path)
    rows = elemen_laporan(p, L)
    tulis_laporan(p, L, rows)
    log("laporan", f"{len(rows)} perangkat → out/laporan-perangkat.md")
    if dengan_kontak and p.master_path.exists():
        out = kontak(p, L, rows)
        log("laporan", f"kontak-sheet {len(L['beats'])} beat → {out.relative_to(p.dir)}")
    return rows


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--tanpa-kontak", action="store_true")
    a = ap.parse_args()
    laporan(Proyek(a.proyek), not a.tanpa_kontak)
    return 0


if __name__ == "__main__":
    main_aman(main)
