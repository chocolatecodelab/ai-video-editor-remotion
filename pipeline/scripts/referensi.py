"""referensi — analisis video referensi semi-otomatis: potongan adegan, kepadatan gerak, area teks, wajah → peta slot.

Pemakaian:
    python referensi.py <video.mp4> [--nama <nama>] [--fps 10]

Keluaran (referensi/<nama>/):
    analisis.json / analisis.md — per shot: waktu, durasi, gerak, area teks, wajah, warna dominan, tebakan slot
    kontak.png                  — 1 thumbnail per shot + kotak teks (hijau) & wajah (merah), label tebakan
    ritme.png                   — grafik gerak per detik, garis potong, area teks
    koreografi-draf.json        — kerangka koreografi v0.3 (beat → slot + fungsi + durasi) untuk diisi `isi`-nya

Semi-otomatis: angka & tebakan di sini adalah titik awal. Tinjau kontak.png, koreksi tebakan slot, lalu isi konten.
Metode: potongan = lonjakan selisih histogram HSV (ambang adaptif median + 4·MAD), gerak = rerata |Δ| abu-abu,
area teks = kotak hasil gradien morfologis → Otsu → closing horizontal (rasio lebar ≥ 1,6), wajah = BlazeFace (wajah.py).
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from sistem import ROOT, GagalPipeline, cari_font, ffprobe, log, main_aman, stream, tulis_json

LEBAR = 360


def _frame(path: Path, fps: float):
    v = stream(ffprobe(path), "video")
    if not v:
        raise GagalPipeline(f"{path}: tidak ada stream video.")
    w0, h0 = int(v["width"]), int(v["height"])
    h = int(round(LEBAR * h0 / w0 / 2)) * 2
    proc = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-vf", f"fps={fps},scale={LEBAR}:{h}",
                             "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, stdin=subprocess.DEVNULL)
    n = LEBAR * h * 3
    try:
        while True:
            buf = proc.stdout.read(n)
            if len(buf) < n:
                break
            yield np.frombuffer(buf, np.uint8).reshape(h, LEBAR, 3)
    finally:
        proc.stdout.close()
        proc.wait()


def kotak_teks(rgb: np.ndarray) -> list[tuple[int, int, int, int]]:
    """Perkiraan kotak teks (tanpa OCR): pita berisi banyak tepi vertikal kontras tinggi (goresan huruf) — |Sobel x| →
    closing horizontal → komponen memanjang, disaring kepadatan tepi & jumlah transisi per tinggi (huruf berulang)."""
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    H, W = g.shape
    s = W / 540.0
    gx = np.abs(cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3))
    tepi = (gx > 90).astype(np.uint8) * 255
    blok = cv2.morphologyEx(tepi, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (max(3, int(11 * s)), max(1, int(3 * s)))))
    blok = cv2.morphologyEx(blok, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (max(2, int(5 * s)), max(2, int(5 * s)))))
    n, _, st, _ = cv2.connectedComponentsWithStats(blok, connectivity=8)
    hasil = []
    for i in range(1, n):
        x, y, w, h, _ = st[i]
        if not (7 * s <= h <= 90 * s) or w < 1.8 * h or w > 0.97 * W:
            continue
        rt = tepi[y:y + h, x:x + w]
        trans = np.count_nonzero(np.diff(rt[h // 2].astype(np.int16)) > 0)
        if rt.mean() / 255.0 >= 0.12 and trans >= max(4, 1.2 * w / h):
            hasil.append((int(x), int(y), int(w), int(h)))
    return hasil


def _warna_dominan(rgb: np.ndarray, k: int = 3) -> list[str]:
    z = rgb.reshape(-1, 3).astype(np.float32)[::7]
    _, lab, pusat = cv2.kmeans(z, k, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0), 2, cv2.KMEANS_PP_CENTERS)
    urut = np.argsort(-np.bincount(lab.ravel(), minlength=k))
    return ["#%02X%02X%02X" % tuple(int(c) for c in pusat[i]) for i in urut]


def tebak_slot(s: dict, pertama: bool) -> tuple[str, str]:
    """→ (slot/perangkat tebakan, alasan)."""
    if s["durasi"] < 0.6 and s["gerak"] > 18 and s.get("awal") == "potong":
        return "transisi", "shot sangat pendek + gerak tinggi"
    if pertama:
        return "hook", "shot pertama"
    if s["wajah"]:
        if s["teks"] >= 0.03:
            return ("info/chip di atas talking head", "wajah + teks sedang") if s["teks"] < 0.15 else \
                   ("kartu besar di atas talking head (latar kaca)", "wajah + teks luas")
        if s["puncak_gerak"] >= 2:
            return "kamera: digital-zoom", f"talking head dengan {s['puncak_gerak']} lonjakan gerak (punch-in)"
        return "talking head (caption)", "wajah, hampir tanpa teks"
    if s["durasi"] < 0.5 and s.get("awal") == "potong" and s["gerak"] > 6:
        return "transisi", "segmen sangat pendek di antara potongan (perangkat masuk/keluar)"
    if s["teks"] >= 0.025:
        return "perangkat cutaway (bukti/langkah)", "tanpa wajah, ada blok teks/UI"
    if s["gerak"] > 12:
        return "cutaway gerak (orbit / ui-world / broll)", "tanpa wajah, gerak tinggi"
    return "cutaway diam (couch-wall / paper-cut / gambar)", "tanpa wajah, gerak rendah"


SLOT_FUNGSI = {"hook": "hook", "info/chip di atas talking head": "masalah", "kartu besar di atas talking head (latar kaca)": "bukti",
               "perangkat cutaway (bukti/langkah)": "bukti", "cutaway gerak (orbit / ui-world / broll)": "konteks",
               "cutaway diam (couch-wall / paper-cut / gambar)": "konteks", "kamera: digital-zoom": "hasil",
               "talking head (caption)": None}


def analisis(path: Path, nama: str, fps: float = 10.0) -> Path:
    if not path.exists():
        raise GagalPipeline(f"{path} tidak ada.")
    tujuan = ROOT / "referensi" / nama
    tujuan.mkdir(parents=True, exist_ok=True)
    try:
        from wajah import Detektor
        det = Detektor()
    except Exception as e:  # noqa: BLE001 — analisis tetap jalan tanpa wajah
        log("referensi", f"deteksi wajah nonaktif: {e}")
        det = None
    hist, gerak, teks, wajah, cuplikan, kotak_t, kecil = [], [], [], [], [], [], []
    prev = None
    for i, rgb in enumerate(_frame(path, fps)):
        hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
        h = cv2.calcHist([hsv], [0, 1, 2], None, [16, 4, 4], [0, 180, 0, 256, 0, 256])
        hist.append(cv2.normalize(h, h).flatten())
        g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
        kecil.append(cv2.resize(g, (48, 85), interpolation=cv2.INTER_AREA))
        gerak.append(float(np.mean(np.abs(g - prev))) if prev is not None else 0.0)
        prev = g
        kt = kotak_teks(rgb)
        kotak_t.append(kt)
        teks.append(sum(w * h for _, _, w, h in kt) / float(rgb.shape[0] * rgb.shape[1]))
        wajah.append(det(rgb) if det and i % 3 == 0 else None)
        cuplikan.append(rgb)
    n = len(hist)
    if n < 2:
        raise GagalPipeline(f"{path}: terlalu pendek untuk dianalisis.")
    d = np.array([0.0] + [cv2.compareHist(hist[i - 1], hist[i], cv2.HISTCMP_BHATTACHARYYA) for i in range(1, n)])
    med = float(np.median(d))
    mad = float(np.median(np.abs(d - med))) + 1e-6
    ambang = max(0.3, med + 4 * mad * 1.4826)
    potong = [0]
    for i in range(1, n):
        if d[i] > ambang and i - potong[-1] >= max(2, int(0.25 * fps)):
            potong.append(i)
    # peristiwa di dalam shot (tanpa potongan keras): perubahan susunan lambat (thumbnail 0,4 s sebelumnya) + perubahan
    # area teks → puncak lokal di atas ambang adaptif = perangkat/teks/lapisan baru muncul atau hilang
    k = max(1, int(0.4 * fps))
    lambat = np.array([0.0] * k + [float(np.mean(np.abs(kecil[i] - kecil[i - k]))) + 400 * abs(teks[i] - teks[i - k])
                                   for i in range(k, n)])
    lm = float(np.median(lambat))
    la = float(np.median(np.abs(lambat - lm))) + 1e-6
    ambang_p = max(6.0, lm + 3 * la * 1.4826)
    peristiwa = []
    for i in range(k, n - 1):
        if lambat[i] > ambang_p and lambat[i] == lambat[max(0, i - k):i + k + 1].max():
            if all(abs(i - c) >= int(0.6 * fps) for c in potong + peristiwa):
                peristiwa.append(i - k // 2)
    potong.append(n)
    batas = sorted(set(potong) | set(peristiwa))
    jenis_batas = {b: ("potong" if b in potong else "peristiwa") for b in batas}
    # wajah tiap frame: isi dari sampel terdekat
    wajah_isi = []
    for i in range(n):
        dekat = [wajah[j] for j in range(max(0, i - 2), min(n, i + 3)) if j % 3 == 0]
        wajah_isi.append(next((w for w in dekat if w), None))
    shot = []
    for a, z in zip(batas, batas[1:]):
        g = np.array(gerak[a + 1:z] or [0.0])
        ambang_puncak = max(8.0, float(np.median(g)) * 2.5)
        puncak = int(np.sum((g[1:-1] > ambang_puncak) & (g[1:-1] >= g[:-2]) & (g[1:-1] >= g[2:]))) if g.size > 2 else 0
        tengah = (a + z) // 2
        s = {"no": len(shot) + 1, "mulai": round(a / fps, 2), "selesai": round(z / fps, 2), "durasi": round((z - a) / fps, 2),
             "gerak": round(float(np.mean(g)), 2), "puncak_gerak": puncak, "teks": round(float(np.mean(teks[a:z])), 4),
             "wajah": sum(1 for w in wajah_isi[a:z] if w) / max(1, z - a) > 0.4,
             "kotak_wajah": wajah_isi[tengah], "warna": _warna_dominan(cuplikan[tengah]), "_tengah": tengah,
             "awal": jenis_batas.get(a, "potong")}
        s["slot"], s["alasan"] = tebak_slot(s, not shot)
        if s["awal"] == "peristiwa" and s["slot"] == "talking head (caption)" and s["teks"] >= 0.008:
            s["slot"], s["alasan"] = "info/chip di atas talking head", "peristiwa: elemen baru muncul di atas wajah"
        shot.append(s)
    per_detik = [round(float(np.mean(gerak[int(k * fps):int((k + 1) * fps)] or [0])), 2) for k in range(int(np.ceil(n / fps)))]
    ringkas = {"video": str(path), "fps_analisis": fps, "durasi": round(n / fps, 2), "segmen": len(shot),
               "potongan_keras": len(potong) - 2, "peristiwa": len(peristiwa),
               "shot": len(shot),
               "rata_durasi_shot": round(float(np.mean([s["durasi"] for s in shot])), 2),
               "potong_per_menit": round(len(shot) / max(1e-3, n / fps) * 60, 1),  # potongan keras + peristiwa
               "ganti_visual_per_detik": round(len(shot) / max(1e-3, n / fps), 2),
               "persen_wajah": round(sum(s["durasi"] for s in shot if s["wajah"]) / max(1e-3, n / fps), 2),
               "persen_berteks": round(sum(s["durasi"] for s in shot if s["teks"] >= 0.03) / max(1e-3, n / fps), 2)}
    tulis_json(tujuan / "analisis.json", {"ringkas": ringkas, "gerak_per_detik": per_detik,
                                          "shot": [{k: v for k, v in s.items() if not k.startswith("_")} for s in shot]})
    _md(tujuan, ringkas, shot)
    _kontak(tujuan, shot, cuplikan, kotak_t)
    _ritme(tujuan, gerak, teks, potong, fps)
    _draf(tujuan, nama, shot)
    log("referensi", f"{len(shot)} segmen ({ringkas['potongan_keras']} potong + {ringkas['peristiwa']} peristiwa), {ringkas['ganti_visual_per_detik']} ganti/detik, wajah {ringkas['persen_wajah']:.0%}, "
                     f"berteks {ringkas['persen_berteks']:.0%} → referensi/{nama}/")
    return tujuan


def _md(tujuan: Path, r: dict, shot: list) -> None:
    b = [f"# Analisis referensi — {Path(r['video']).name}", "",
         f"Durasi {r['durasi']} s · {r['segmen']} segmen ({r['potongan_keras']} potongan keras + {r['peristiwa']} peristiwa) · rata-rata {r['rata_durasi_shot']} s/segmen · {r['ganti_visual_per_detik']} ganti visual/detik · "
         f"wajah {r['persen_wajah']:.0%} · berteks {r['persen_berteks']:.0%}", "",
         "Tebakan slot otomatis — tinjau `kontak.png`, koreksi, lalu isi `koreografi-draf.json`.", "",
         "| # | Awal | Waktu (s) | Durasi | Gerak | Lonjakan | Teks | Wajah | Warna | Tebakan slot | Alasan |", "|---|---|---|---|---|---|---|---|---|---|---|"]
    for s in shot:
        b.append(f"| {s['no']} | {s['awal']} | {s['mulai']:.2f}–{s['selesai']:.2f} | {s['durasi']:.2f} | {s['gerak']:.1f} | {s['puncak_gerak']} | "
                 f"{s['teks']:.1%} | {'ya' if s['wajah'] else '—'} | {' '.join(s['warna'])} | {s['slot']} | {s['alasan']} |")
    (tujuan / "analisis.md").write_text("\n".join(b) + "\n", encoding="utf-8")


def _kontak(tujuan: Path, shot: list, cuplikan: list, kotak_t: list) -> None:
    kol = 6
    h0, w0 = cuplikan[0].shape[:2]
    lh = 64
    baris = (len(shot) + kol - 1) // kol
    lembar = Image.new("RGB", (kol * (w0 + 6) + 6, baris * (h0 + lh + 6) + 6), "#151515")
    g = ImageDraw.Draw(lembar)
    f1 = ImageFont.truetype(str(cari_font("Montserrat-Bold.ttf")), 14)
    f2 = ImageFont.truetype(str(cari_font("Montserrat-Regular.ttf")), 11)
    for i, s in enumerate(shot):
        x, y = 6 + (i % kol) * (w0 + 6), 6 + (i // kol) * (h0 + lh + 6)
        lembar.paste(Image.fromarray(cuplikan[s["_tengah"]]), (x, y))
        for (a, b, w, h) in kotak_t[s["_tengah"]]:
            g.rectangle([x + a, y + b, x + a + w, y + b + h], outline="#3DFF7A", width=1)
        if s["kotak_wajah"]:
            k = s["kotak_wajah"]
            g.rectangle([x + k[0] * w0, y + k[1] * h0, x + k[2] * w0, y + k[3] * h0], outline="#FF3B3B", width=2)
        g.text((x + 4, y + h0 + 4), f"#{s['no']} {'POTONG' if s['awal'] == 'potong' else 'peristiwa'} {s['mulai']:.1f}s · {s['durasi']:.1f}s", font=f1, fill="#FFFFFF")
        g.text((x + 4, y + h0 + 24), s["slot"][:38], font=f2, fill="#FFD25A")
        g.text((x + 4, y + h0 + 40), f"gerak {s['gerak']:.0f} · teks {s['teks']:.0%}", font=f2, fill="#AAAAAA")
    lembar.save(tujuan / "kontak.png")


def _ritme(tujuan: Path, gerak: list, teks: list, potong: list, fps: float) -> None:
    W, H, pad = 1200, 320, 40
    img = Image.new("RGB", (W, H), "#111111")
    g = ImageDraw.Draw(img)
    n = len(gerak)
    mx = max(1.0, max(gerak))
    sx = lambda i: pad + (W - 2 * pad) * i / max(1, n - 1)
    for c in potong[1:-1]:
        g.line([(sx(c), pad), (sx(c), H - pad)], fill="#444444", width=1)
    g.line([(sx(i), H - pad - (H - 2 * pad) * min(1.0, teks[i] / 0.3)) for i in range(n)], fill="#3DFF7A", width=2)
    g.line([(sx(i), H - pad - (H - 2 * pad) * gerak[i] / mx) for i in range(n)], fill="#2EC4FF", width=2)
    f = ImageFont.truetype(str(cari_font("Montserrat-Regular.ttf")), 13)
    for k in range(0, int(n / fps) + 1, 5):
        g.text((sx(k * fps) - 6, H - pad + 8), f"{k}s", font=f, fill="#999999")
    g.text((pad, 10), "biru = gerak · hijau = area teks (skala 0–30%) · abu-abu = potongan", font=f, fill="#DDDDDD")
    img.save(tujuan / "ritme.png")


def _draf(tujuan: Path, nama: str, shot: list) -> None:
    """Kerangka koreografi v0.3: shot talking head berurutan digabung; tiap beat → satu slot sesuai tebakan."""
    beats, i = [], 0
    while i < len(shot):
        s = shot[i]
        j = i
        while j + 1 < len(shot) and shot[j + 1]["slot"] == s["slot"] == "talking head (caption)":
            j += 1
        a, z = s["mulai"], shot[j]["selesai"]
        fungsi = SLOT_FUNGSI.get(s["slot"])
        el = []
        if s["slot"] == "transisi":
            el.append({"slot": "transisi", "mulai": a})
        elif s["slot"].startswith("kamera"):
            el.append({"slot": "kamera", "fungsi": fungsi, "mulai": a, "selesai": z})
        elif fungsi:
            el.append({"slot": fungsi, "isi": {"judul": "ISI DARI REFERENSI"}, "mulai": round(a + 0.2, 2), "selesai": z,
                       "_ref": f"shot {s['no']}: {s['slot']}"})
        beats.append({"id": f"b{len(beats) + 1}", "beat": s["slot"], "mulai": a, "selesai": z, "elemen": el})
        i = j + 1
    draf = {"_meta": {"id": f"{nama}-draf", "versi": "0.1", "status": "draft",
                      "catatan": "Draf otomatis dari referensi.py — pindahkan ke koreografi/KOREO_NN_<nama>_v0.1.json setelah ditinjau."},
            "label": f"Dari referensi {nama}", "template": "hook-problem-solution", "variasi_min": 4,
            "butuh": {"rekaman": True, "remotion": True}, "beat_sheet": {"caption": {"aktif": True}, "beats": beats}}
    (tujuan / "koreografi-draf.json").write_text(json.dumps(draf, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--nama")
    ap.add_argument("--fps", type=float, default=10.0)
    a = ap.parse_args()
    v = Path(a.video)
    analisis(v, a.nama or "".join(c if c.isalnum() else "-" for c in v.stem.lower()).strip("-")[:40], a.fps)
    return 0


if __name__ == "__main__":
    main_aman(main)
