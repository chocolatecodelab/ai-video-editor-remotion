"""qa — cek otomatis dari aturan konteks/gaya/template yang dipakai proyek. Laporan lulus/gagal.

Pemakaian:
    python qa.py <folder-proyek>

Input  : out/layout.json (posisi & timing tiap elemen, ditulis render), out/master.mov, out/*_<platform>.mp4,
         cache/words.json, cache/ingest.*, manifest.json, beat-sheet.json
Output : out/qa-report.md, out/qa.json
Exit   : 0 = LULUS, 1 = GAGAL

Aturan dibaca dari tabel `| ID | Aturan | Cek |` di setiap modul yang dipakai:
    'otomatis' → dijalankan di sini (fungsi @cek("ID"))
    'manual'   → masuk checklist manual di laporan
    otomatis tapi belum ada fungsinya → dilaporkan "BELUM DIIMPLEMENTASI"
"""
from __future__ import annotations

import argparse
import datetime as dt
import re

import ekspor
from pathlib import Path

from sistem import (Proyek, baca_json, ffprobe, fps_dari, frontmatter, hex_rgb, log, luminans, main_aman,
                    rasio_kontras, stream, tabel_aturan, tulis_json, ukur_loudness)

LULUS, GAGAL, PERINGATAN, LEWAT = "LULUS", "GAGAL", "PERINGATAN", "LEWAT"
TEKS = {"judul", "teks", "teks-kartu", "teks-cta", "teks-panel", "teks-info", "teks-chip", "caption", "depth", "remotion"}
GERAK_BESAR = {"judul", "kartu", "cta", "depth", "remotion", "info"}
CEK: dict[str, callable] = {}


def cek(*ids):
    def daftar(fn):
        for i in ids:
            CEK[i] = fn
        return fn
    return daftar


class Ctx:
    def __init__(self, p: Proyek, layout: dict | None = None):
        self.p = p
        self.L = layout if layout is not None else (baca_json(p.layout_path) if p.layout_path.exists() else None)
        self.el = self.L["elemen"] if self.L else []
        self.zona = self.L["zona_aman"] if self.L else list(p.zona_aman())
        self._probe, self._loud = {}, {}

    def probe(self, path):
        if path not in self._probe:
            self._probe[path] = ffprobe(path) if path.exists() else None
        return self._probe[path]

    def loud(self, path):
        if path not in self._loud:
            self._loud[path] = ukur_loudness(path)
        return self._loud[path]

    def tipe(self, *t):
        return [e for e in self.el if e["tipe"] in t]

    def platform_files(self):
        return [(n, ekspor.path_platform(self.p, n)) for n in (self.p.manifest.get("platform") or [])]


def _kotak_teks(e):
    return e.get("bbox_teks") or e["bbox"]


def _keluar(b, z, tol=1.0):
    x0, y0, x1, y1 = b
    zx0, zy0, zx1, zy1 = z
    sisi = {"kiri": zx0 - x0, "atas": zy0 - y0, "kanan": x1 - zx1, "bawah": y1 - zy1}
    return {k: round(v) for k, v in sisi.items() if v > tol}


def _iris(a, b):
    w = min(a[2], b[2]) - max(a[0], b[0])
    h = min(a[3], b[3]) - max(a[1], b[1])
    return max(0, w) * max(0, h)


def _butuh_layout(c):
    if not c.L:
        return GAGAL, ["out/layout.json tidak ada — jalankan render dulu."]
    return None


# ------------------------------------------------------------------ K00 zona aman

@cek("K00.1")
def _zona(c: Ctx):
    if r := _butuh_layout(c):
        return r
    gagal, warn = [], []
    for e in c.el:
        if e["tipe"] in ("latar", "cutaway", "kamera"):
            continue  # layar penuh (latar kaca, klip cutaway, efek kamera): bukan elemen di zona
        if e["bbox"] is None:
            gagal.append(f"{e['id']}: tidak pernah tampil di frame mana pun (di luar durasi video?)")
            continue
        k = _keluar(_kotak_teks(e), c.zona)
        if k:
            gagal.append(f"{e['id']} ({e.get('teks') or e['tipe']!s:.30}): keluar {k} px")
        elif e.get("bbox_animasi") and e.get("bbox_teks"):
            pad = e["bbox_teks"][0] - e["bbox"][0]
            a = e["bbox_animasi"]
            ka = _keluar([a[0] + pad, a[1] + pad, a[2] - pad, a[3] - pad], c.zona, tol=4)
            if ka:
                warn.append(f"{e['id']}: saat animasi keluar {ka} px")
    if gagal:
        return GAGAL, gagal + warn
    return (PERINGATAN, warn) if warn else (LULUS, [f"{len(c.el)} elemen di dalam zona aman {c.zona}"])


@cek("K00.2")
def _tumpang(c: Ctx):
    if r := _butuh_layout(c):
        return r
    el = [e for e in c.el if e["induk"] is None and e["tipe"] not in ("depth",) and e["bbox"] is not None
          and not e.get("dekoratif")]  # partikel: hiasan, boleh di atas teks
    bentrok = []
    for i, a in enumerate(el):
        for b in el[i + 1:]:
            if min(a["selesai"], b["selesai"]) - max(a["mulai"] + a.get("delay", 0), b["mulai"] + b.get("delay", 0)) <= 0.05:
                continue
            luas = _iris(_kotak_teks(a), _kotak_teks(b))
            if luas > 0:
                bentrok.append(f"{a['id']} × {b['id']} ({luas / 1000:.1f}k px², "
                               f"{max(a['mulai'], b['mulai']):.2f}–{min(a['selesai'], b['selesai']):.2f}s)")
    return (GAGAL, bentrok) if bentrok else (LULUS, [])


@cek("K00.3")
def _wajah(c: Ctx):
    """Elemen tidak menutupi wajah: kotak teks elemen × kotak wajah (cache/wajah.json) selama elemen tampil."""
    if r := _butuh_layout(c):
        return r
    if not c.p.manifest.get("aset", {}).get("rekaman"):
        return LEWAT, ["tanpa rekaman"]
    if not (c.p.cache / "wajah.json").exists():
        return PERINGATAN, ["cache/wajah.json belum ada — jalankan video.py wajah <proyek> (sekarang dicek manual)"]
    import laporan
    maks = float(c.p.t("koreografi.tutup-wajah-maks", 0.1))
    rows = laporan.elemen_laporan(c.p, c.L)
    salah = [f"{r['id']} ({r['perangkat']}): menutupi {r['tutup_wajah']:.0%} wajah, {r['mulai']:.1f}–{r['selesai']:.1f}s"
             for r in rows if (r["tutup_wajah"] or 0) > maks and not r["dekoratif"]]
    hias = [f"{r['id']} ({r['perangkat']}, hiasan): {r['tutup_wajah']:.0%}" for r in rows
            if (r["tutup_wajah"] or 0) > maks and r["dekoratif"]]
    if salah:
        return GAGAL, salah + hias
    return (PERINGATAN, hias) if hias else (LULUS, [f"{len(rows)} elemen ≤ {maks:.0%} wajah tertutup"])


# ------------------------------------------------------------------ K01 caption & keterbacaan

def _cap_meta(c):
    return (c.L or {}).get("caption", {})


@cek("K01.1")
def _cap_sumber(c: Ctx):
    if r := _butuh_layout(c):
        return r
    cap = _cap_meta(c)
    if not cap.get("aktif"):
        return LEWAT, ["caption nonaktif di beat-sheet"]
    m = cap.get("sumber")
    if not m:
        return GAGAL, ["caption aktif tapi cache/words.json tidak ada"]
    if not m.get("timestamp_per_kata") or m.get("backend") in (None, "perkiraan"):
        return GAGAL, [f"words.json bukan timestamp per kata (backend={m.get('backend')})"]
    return LULUS, [f"backend {m.get('backend')}, {cap.get('potongan')} potongan"]


@cek("K01.2")
def _cap_koreksi(c: Ctx):
    m = _cap_meta(c).get("sumber")
    if not _cap_meta(c).get("aktif") or not m:
        return LEWAT, []
    return (LULUS, []) if m.get("dikoreksi") else (PERINGATAN, ["words.json belum dikoreksi manual (_meta.dikoreksi=false)"])


@cek("K01.3")
def _cap_panjang(c: Ctx):
    caps = c.tipe("caption")
    if not caps:
        return LEWAT, []
    bm, km = c.p.t("caption.baris-maks"), c.p.t("caption.karakter-maks-baris")
    salah = [f"{e['id']} '{e['teks']}': {e['baris']} baris, {e['karakter_baris_maks']} kar/baris"
             for e in caps if e["baris"] > bm or e["karakter_baris_maks"] > km]
    return (GAGAL, salah) if salah else (LULUS, [f"{len(caps)} potongan ≤ {bm} baris × {km} karakter"])


@cek("K01.4")
def _kontras(c: Ctx):
    if r := _butuh_layout(c):
        return r
    q = c.p.tokens["qa"]
    gagal, warn, n = [], [], 0
    for e in c.el:
        if e["tipe"] not in TEKS or e["tipe"] == "depth" or not e.get("warna"):
            continue
        besar = e["ukuran"] >= c.p.px(q["ukuran-besar-px"])
        ambang = q["kontras-min-besar"] if besar else q["kontras-min"]
        if e.get("stroke", 0) >= c.p.px(3) and e.get("warna_stroke"):
            lb = luminans(hex_rgb(e["warna_stroke"]))
            latar, sumber = (lb, lb), "stroke"
        elif e.get("kontras"):
            latar, sumber = (e["kontras"]["l_p10"], e["kontras"]["l_p90"]), f"latar@{e['kontras']['t']}s"
        else:
            warn.append(f"{e['id']}: latar tidak tersampel")
            continue
        n += 1
        for w in e["warna"]:
            lw = luminans(hex_rgb(w))
            r_ = min(rasio_kontras(lw, latar[0]), rasio_kontras(lw, latar[1]))
            if r_ < ambang:
                gagal.append(f"{e['id']} '{(e.get('teks') or '')[:24]}' {w} vs {sumber}: {r_:.2f} < {ambang}")
    if gagal:
        return GAGAL, gagal + warn
    return (PERINGATAN if warn else LULUS), warn or [f"{n} teks ≥ ambang kontras"]


@cek("K01.5")
def _baca(c: Ctx):
    if r := _butuh_layout(c):
        return r
    cps = c.p.t("qa.karakter-per-detik-maks")
    salah = []
    for e in c.el:
        if e["tipe"] not in TEKS or e["tipe"] == "depth" or not e.get("teks"):
            continue
        d = e["selesai"] - e["mulai"] - e.get("delay", 0)
        if e["tipe"] == "caption" and d < 0.3:
            salah.append(f"{e['id']} '{e['teks']}': tampil {d:.2f}s < 0,3s")
        kec = len(e["teks"].replace("*", "")) / max(d, 1e-3)
        if kec > cps:
            salah.append(f"{e['id']} '{e['teks'][:24]}': {kec:.1f} kar/s > {cps}")
    return (GAGAL, salah) if salah else (LULUS, [])


@cek("K01.6")
def _sorot(c: Ctx):
    cap = c.tipe("caption")
    if not cap:
        return LEWAT, []
    if cap[0].get("mode") == "karaoke":
        r = c.p.t("caption.redup")
        return (LULUS, [f"karaoke: kata berikutnya diredupkan {r:.0%}"]) if 0 < r < 0.8 else (GAGAL, [f"caption.redup {r} di luar 0–0,8"])
    return LULUS, ["kata aktif disorot warna caption.warna-aktif"]


@cek("K01.8")
def _ukuran(c: Ctx):
    if r := _butuh_layout(c):
        return r
    mn = c.p.px(c.p.t("qa.ukuran-min-px"))
    salah = [f"{e['id']}: {e['ukuran']} px" for e in c.el if e["tipe"] in TEKS and (e.get("ukuran") or mn) < mn]
    return (GAGAL, salah) if salah else (LULUS, [f"semua teks ≥ {mn} px"])


# ------------------------------------------------------------------ K02 depth

@cek("K02.1")
def _mask(c: Ctx):
    d = c.tipe("depth")
    km = {k: v for k, v in c.L.get("mask_kamera", {}).items() if v.get("butuh")}
    if not d and not km:
        return LEWAT, ["tidak ada elemen depth / efek kamera ber-mask"]
    salah = []
    for e in d:
        m = c.L["mask"].get(e["id"], {"butuh": 0, "ada": 0})
        if m["butuh"] == 0 or m["ada"] < m["butuh"]:
            salah.append(f"{e['id']}: mask {m['ada']}/{m['butuh']} frame (jalankan roto)")
    for k, m in km.items():
        if m["ada"] < m["butuh"]:
            salah.append(f"{k}: mask kamera {m['ada']}/{m['butuh']} frame (jalankan roto)")
    return (GAGAL, salah) if salah else (LULUS, [f"{len(d)} depth + {len(km)} kamera ber-mask, mask lengkap"])


@cek("K02.2")
def _feather(c: Ctx):
    f = c.p.t("mask.feather-px")
    return (LULUS, [f"{f} px"]) if 1 <= f <= 2 else (GAGAL, [f"mask.feather-px = {f}, harus 1–2"])


@cek("K02.3")
def _depth_kata(c: Ctx):
    """≤ 2 kata DAN tetap terbaca: bagian huruf tertutup subjek (diukur per frame saat render) di bawah ambang."""
    d = c.tipe("depth")
    if not d:
        return LEWAT, []
    rata_maks, maks_maks = c.p.t("depth.qa-tutup-rata", 0.3), c.p.t("depth.qa-tutup-maks", 0.45)
    salah, info = [], []
    for e in d:
        if e["kata"] > 2:
            salah.append(f"{e['id']} '{e['teks']}': {e['kata']} kata")
        u = e.get("tertutup")
        if not u or not u.get("n"):
            continue
        rata = u["jumlah"] / u["n"]
        info.append(f"{e['id']} '{e['teks']}': tertutup rata-rata {rata:.0%}, maks {u['maks']:.0%}")
        if rata > rata_maks or u["maks"] > maks_maks:
            salah.append(f"{e['id']} '{e['teks']}': huruf tertutup kepala rata-rata {rata:.0%} (maks {rata_maks:.0%}), "
                         f"puncak {u['maks']:.0%} (maks {maks_maks:.0%}) — kecilkan/pendekkan teks")
    return (GAGAL, salah + info) if salah else (LULUS, info)


@cek("K02.6")
def _depth_tumpuk(c: Ctx):
    """Teks depth tidak bertumpuk dengan teks/panel lain yang tampil bersamaan."""
    d = c.tipe("depth")
    if not d:
        return LEWAT, []
    lain = [e for e in c.el if e["induk"] is None and e["tipe"] not in ("depth", "caption", "latar", "cutaway", "kamera")
            and e["bbox"] is not None and not e.get("dekoratif")]
    salah = []
    for a in d:
        for b in lain:
            if min(a["selesai"], b["selesai"]) - max(a["mulai"], b["mulai"]) <= 0.05:
                continue
            luas = _iris(_kotak_teks(a), _kotak_teks(b))
            if luas > 0:
                salah.append(f"{a['id']} '{a['teks']}' × {b['id']} ({luas / 1000:.1f}k px²)")
    return (GAGAL, salah) if salah else (LULUS, [f"{len(d)} teks depth bebas tumpuk"])


# ------------------------------------------------------------------ K03 push

def _push(c):
    # zoom potong (E55) = ganti bingkai seketika, bukan push bergerak → diatur aturan modulnya, bukan K03
    return [u for u in (c.L or {}).get("push", []) if not u.get("potong")]


@cek("K03.1")
def _push_skala(c: Ctx):
    ps = _push(c)
    if not ps:
        return LEWAT, []
    mx = min(1.15, c.p.t("gerak.push-in"))
    salah = [f"{u['id']}: skala {u['skala']} > {mx}" for u in ps if u["skala"] > mx + 1e-6]
    return (GAGAL, salah) if salah else (LULUS, [f"{len(ps)} push ≤ {mx}"])


@cek("K03.2")
def _push_durasi(c: Ctx):
    ps = _push(c)
    if not ps:
        return LEWAT, []
    salah = [f"{u['id']}: gerak {u['gerak']}s < 0,6s" for u in ps if u["gerak"] < 0.6]
    salah += [f"{u['id']}: easing linear" for u in ps if u["easing"] == "linear"]
    return (GAGAL, salah) if salah else (LULUS, [])


def _dekat_kata(c, t, tol=0.15):
    titik = (c.L or {}).get("kata_mulai", []) + [b["mulai"] for b in (c.L or {}).get("beats", [])]
    return any(abs(t - x) <= tol for x in titik)


@cek("K03.3")
def _push_anchor(c: Ctx):
    ps = _push(c)
    if not ps:
        return LEWAT, []
    salah = [f"{u['id']} @ {u['mulai']:.2f}s tidak di awal kata/beat" for u in ps
             if not u.get("anchor_kata") and not _dekat_kata(c, u["mulai"])]
    return (PERINGATAN, salah) if salah else (LULUS, [])


@cek("K03.4")
def _parallax(c: Ctx):
    return (LULUS, ["UI tetap; depth ikut push 50% (render.PARALLAX_DEPTH)"]) if _push(c) else (LEWAT, [])


@cek("K03.5")
def _push_zona(c: Ctx):
    ps = _push(c)
    if not ps:
        return LEWAT, []
    salah = []
    for e in c.el:
        if not e.get("bbox_animasi") or not any(min(e["selesai"], u["selesai"]) > max(e["mulai"], u["mulai"]) for u in ps):
            continue
        pad = (e.get("bbox_teks") or e["bbox"])[0] - e["bbox"][0]
        a = e["bbox_animasi"]
        k = _keluar([a[0] + pad, a[1] + pad, a[2] - pad, a[3] - pad], c.zona, tol=4)
        if k:
            salah.append(f"{e['id']}: saat push keluar {k} px")
    return (GAGAL, salah) if salah else (LULUS, [])


# ------------------------------------------------------------------ K04 ingest

@cek("K04.1")
def _ingest(c: Ctx):
    p = c.p
    if not p.manifest.get("aset", {}).get("rekaman"):
        return LEWAT, ["proyek tanpa rekaman (grafis saja)"]
    info = c.probe(p.ingest_video)
    if not info:
        return GAGAL, ["cache/ingest.mp4 tidak ada"]
    v = stream(info, "video")
    salah = []
    if (int(v["width"]), int(v["height"])) != (p.W, p.H):
        salah.append(f"resolusi {v['width']}x{v['height']} ≠ {p.W}x{p.H}")
    if abs(fps_dari(v) - p.fps) > 0.01:
        salah.append(f"fps {fps_dari(v):.3f} ≠ {p.fps}")
    meta = baca_json(p.cache / "ingest.meta.json", {})
    src = meta.get("sumber", {}).get("resolusi")
    if src and min(src) < min(p.t("ingest.tinggi-min"), p.W):
        salah.append(f"sumber {src[0]}x{src[1]} di bawah minimum (di-ingest dengan --paksa)")
    return (GAGAL, salah) if salah else (LULUS, [f"{p.W}x{p.H}@{p.fps}"])


@cek("K04.4")
def _ingest_audio(c: Ctx):
    p = c.p
    if not p.manifest.get("aset", {}).get("rekaman"):
        return LEWAT, []
    meta = baca_json(p.cache / "ingest.meta.json", {})
    if not meta.get("loudnorm_ukur"):
        return GAGAL, ["audio rekaman tidak dinormalisasi (tidak ada audio?)"]
    lu = c.loud(p.ingest_audio)
    a = p.tokens["audio"]
    ok = abs(lu["lufs"] - a["lufs"]) <= a["lufs-toleransi"]
    return (LULUS if ok else GAGAL), [f"audio.wav {lu['lufs']:.1f} LUFS (sumber {meta['loudnorm_ukur']['input_i']})"]


# ------------------------------------------------------------------ K05 gerak

@cek("K05.1")
def _linear(c: Ctx):
    if r := _butuh_layout(c):
        return r
    salah = [f"{e['id']}: easing linear" for e in c.el if "linear" in (e.get("easing"), e.get("easing_keluar"))]
    return (GAGAL, salah) if salah else (LULUS, [])


@cek("K05.2")
def _stagger(c: Ctx):
    k = [e for e in c.tipe("kartu", "remotion") if (e.get("item") or 0) > 1]
    if not k:
        return LEWAT, []
    mn = c.p.t("durasi.stagger")
    salah = [f"{e['id']}: stagger {e['stagger']} < {mn}" for e in k if e["stagger"] < mn - 1e-6]
    return (GAGAL, salah) if salah else (LULUS, [f"{len(k)} kartu ber-stagger"])


@cek("K05.3")
def _tahan(c: Ctx):
    if r := _butuh_layout(c):
        return r
    mn = c.p.t("durasi.tahan-min")
    stg = c.p.t("durasi.stagger")
    salah = []
    for e in c.el:
        if e["tipe"] not in ("judul", "teks", "kartu", "cta", "depth", "remotion", "info", "chip") or e.get("dekoratif"):
            continue
        tambahan = (e.get("stagger") or stg) * max(0, (e.get("item") or 1) - 1) if e.get("item") else 0
        diam = e["selesai"] - e["mulai"] - e["durasi_masuk"] - e["durasi_keluar"] - tambahan
        if diam < mn:
            salah.append(f"{e['id']}: tampil penuh {diam:.2f}s < {mn}s")
    return (GAGAL, salah) if salah else (LULUS, [])


@cek("E55.5")
def _zoom_potong(c: Ctx):
    zp = [u for u in (c.L or {}).get("push", []) if u.get("potong")]
    if not zp:
        return LEWAT, ["tidak ada zoom potong (tanpa rekaman, dimatikan, atau tak ada kalimat yang layak)"]
    L = c.L
    blok = [(x["id"], x["mulai"], x["selesai"]) for k in ("broll", "kamera", "transisi") for x in L.get(k, [])]
    salah = [f"{u['id']}: skala {u['skala']} > 1,15" for u in zp if u["skala"] > 1.15 + 1e-6]
    salah += [f"{u['id']} bertumpuk dengan {b}" for u in zp for b, a, z in blok if u["mulai"] < z and u["selesai"] > a]
    salah += [f"{u['id']} @ {u['mulai']:.2f}s tidak di awal kata" for u in zp if not _dekat_kata(c, u["mulai"], 0.05)]
    return (GAGAL, salah) if salah else (LULUS, [f"{len(zp)} bingkai rapat ×{zp[0]['skala']:.2f}"])


@cek("K05.4")
def _mblur(c: Ctx):
    mb = (c.L or {}).get("motion_blur", {})
    if not mb.get("aktif"):
        return GAGAL, ["motion-blur.aktif = false"]
    det = [f"dipakai di {mb.get('frame_terpakai', 0)} lapisan-frame"]
    if mb.get("remotion"):
        det.append(f"{len(mb['remotion'])} overlay Remotion ber-blur arah: {', '.join(mb['remotion'])}")
    return LULUS, det


@cek("K05.5")
def _sinkron(c: Ctx):
    if r := _butuh_layout(c):
        return r
    if not c.L.get("kata_mulai"):
        return PERINGATAN, ["tidak ada words.json; sinkron ke ucapan tidak bisa dicek"]
    salah = [f"{e['id']} @ {e['mulai']:.2f}s" for e in c.el
             if e["tipe"] in GERAK_BESAR and e["induk"] is None and not e.get("anchor_kata") and not _dekat_kata(c, e["mulai"])]
    return (PERINGATAN, ["tidak di awal kata/beat (±0,15s): " + ", ".join(salah)]) if salah else (LULUS, [])


# ------------------------------------------------------------------ K06 audio

def _target_audio(c):
    f = [path for _, path in c.platform_files() if path.exists()]
    return f or ([c.p.master_path] if c.p.master_path.exists() else [])


@cek("K06.1", "K06.2")
def _loudness(c: Ctx, _id=None):
    a = c.p.tokens["audio"]
    files = _target_audio(c)
    if not files:
        return GAGAL, ["belum ada master/ekspor"]
    salah, info = [], []
    for f in files:
        lu = c.loud(f)
        info.append(f"{f.name}: {lu['lufs']:.1f} LUFS, TP {lu['true_peak']:.1f} dBTP")
        if _id == "K06.1" and abs(lu["lufs"] - a["lufs"]) > a["lufs-toleransi"]:
            salah.append(f"{f.name}: {lu['lufs']:.1f} LUFS (target {a['lufs']}±{a['lufs-toleransi']})")
        if _id == "K06.2" and lu["true_peak"] > a["true-peak"] + 0.05:
            salah.append(f"{f.name}: true peak {lu['true_peak']:.1f} > {a['true-peak']}")
    return (GAGAL, salah) if salah else (LULUS, info)


@cek("K06.3")
def _sfx(c: Ctx):
    if r := _butuh_layout(c):
        return r
    mx = c.p.t("sfx.level-db")
    salah = [f"{s['sumber']}: {s['db']} dB > {mx} dB" for s in c.L["sfx"] if s["db"] > mx + 1e-6]
    au = c.L.get("audio") or {}
    if au.get("musik") and not au.get("ducking"):
        salah.append("musik tanpa ducking")
    info = [f"{len(c.L['sfx'])} sfx ≤ {mx} dB"] + (["musik di-duck (sidechain)"] if au.get("musik") else [])
    return (GAGAL, salah) if salah else (LULUS, info)


# ------------------------------------------------------------------ K08 sound design

BERGERAK = {"judul", "teks", "kartu", "cta", "gambar", "info", "chip", "remotion", "depth"}


def _sfx_otomatis(c):
    if r := _butuh_layout(c):
        return r
    if not c.p.t("sfx.otomatis", False):
        return LEWAT, ["sfx.otomatis mati (token gaya lama) — bunyi hanya dari field 'sfx' eksplisit"]
    return None


@cek("K08.1")
def _sfx_ada(c: Ctx):
    if r := _sfx_otomatis(c):
        return r
    sumber = [s["sumber"] for s in c.L["sfx"]]
    salah = []
    for e in c.el:
        if e["tipe"] not in BERGERAK or e.get("induk") or e.get("masuk") == "tidak" or e.get("sfx_mati") or e.get("sfx_gabung"):
            continue
        if not any(s == e["id"] or s.startswith(e["id"] + "/") for s in sumber):
            salah.append(f"{e['id']} ({e['tipe']}) masuk tanpa bunyi")
    return (GAGAL, salah) if salah else (LULUS, [f"{len(c.L['sfx'])} bunyi"])


@cek("K08.2")
def _sfx_jarak(c: Ctx):
    if r := _sfx_otomatis(c):
        return r
    jarak = c.p.t("sfx.jarak-min")
    t = sorted((s["t"], s["sumber"]) for s in c.L["sfx"] if s.get("kelas") != "ketik")
    salah = [f"{a[1]} & {b[1]}: {b[0] - a[0]:.3f}s" for a, b in zip(t, t[1:]) if b[0] - a[0] < jarak - 1e-6]
    return (GAGAL, salah) if salah else (LULUS, [f"jarak ≥ {jarak}s"])


@cek("K08.3")
def _sfx_level(c: Ctx):
    if r := _sfx_otomatis(c):
        return r
    salah = [f"{s['sumber']}: {s['db']} dB" for s in c.L["sfx"] if s["db"] > -16 + 1e-6]
    bus = (c.L.get("audio") or {}).get("sfx_bus")
    info = [f"bus SFX puncak {bus['puncak_db']} dBFS"] if bus else []
    return (GAGAL, salah) if salah else (LULUS, info)


@cek("K08.4")
def _sfx_varian(c: Ctx):
    if r := _sfx_otomatis(c):
        return r
    import sfx as pustaka_sfx
    salah, terakhir = [], {}
    for s in sorted(c.L["sfx"], key=lambda s: s["t"]):
        b = s.get("bunyi")
        if not b or "/" in b or "." in b or pustaka_sfx.varian(b) < 2:
            continue
        if terakhir.get(b) == s["file"]:
            salah.append(f"{s['sumber']}: '{b}' identik dengan bunyi sebelumnya")
        terakhir[b] = s["file"]
    return (GAGAL, salah) if salah else (LULUS, ["varian bergilir"])


# ------------------------------------------------------------------ K09 koreografi

@cek("K09.1", "K09.2", "K09.3", "K09.4")
def _ritme(c: Ctx, _id=None):
    if r := _butuh_layout(c):
        return r
    from perangkat import cek_ritme
    k = c.p.t("koreografi")
    vmin = k["variasi-min"]
    if c.p.manifest.get("koreografi"):
        from sistem import baca_json, resolve
        vmin = baca_json(resolve("koreografi", c.p.manifest["koreografi"]).path).get("variasi_min", vmin)
    beats = [(b["id"], [e for e in c.el if e.get("beat") == b["id"]]) for b in c.L["beats"]]
    beats = [(bid, el + [{"tipe": "transisi"} for t in c.L.get("transisi", []) if _beat_dari(c, t["mulai"] + (t["selesai"] - t["mulai"]) / 2 + 0.01) == bid])
             for bid, el in beats]
    ok, pesan = cek_ritme(beats, k["bukan-perangkat"], k["fungsi"], vmin)[_id]
    if _id == "K09.4" and not ok:
        return PERINGATAN, pesan
    return (LULUS if ok else GAGAL), pesan


@cek("K09.6")
def _khas(c: Ctx):
    """Efek khas gaya terpakai (modul efek mencantumkan gaya di gaya_cocok) — termasuk transisi & kamera."""
    if r := _butuh_layout(c):
        return r
    from video import efek_khas
    el = [{"efek": e.get("efek")} for e in c.el] + [{"efek": t.get("efek")} for t in c.L.get("transisi", [])]
    khas = efek_khas(c.p.gaya.nama, el)
    mn = int(c.p.t("koreografi.khas-min", 2))
    return (LULUS if len(khas) >= mn else GAGAL), [f"{len(khas)} efek khas {c.p.gaya.nama}: {', '.join(khas) or '—'} (min {mn})"]


def _beat_dari(c, t):
    for b in c.L["beats"]:
        if b["mulai"] <= t < b["selesai"]:
            return b["id"]
    return None


# ------------------------------------------------------------------ K07 ekspor

@cek("K07.1")
def _master(c: Ctx):
    info = c.probe(c.p.master_path)
    if not info:
        return GAGAL, ["out/master.mov tidak ada"]
    v = stream(info, "video")
    return (LULUS, [f"{v['codec_name']} {v.get('profile', '')}"]) if v["codec_name"] == "prores" else \
        (GAGAL, [f"codec master {v['codec_name']}, bukan prores"])


@cek("K07.2")
def _platform(c: Ctx):
    p = c.p
    files = c.platform_files()
    if not files:
        return GAGAL, ["manifest.platform kosong"]
    salah, info = [], []
    for nama, f in files:
        pr = c.probe(f)
        if not pr:
            salah.append(f"{nama}: {f.name} tidak ada (jalankan ekspor)")
            continue
        v, a = stream(pr, "video"), stream(pr, "audio")
        cek_ = {
            "codec": (v["codec_name"], "h264"),
            "resolusi": (f"{v['width']}x{v['height']}", f"{p.W}x{p.H}"),
            "pix_fmt": (v.get("pix_fmt"), p.t("ekspor.pix_fmt")),
            "primaries": (v.get("color_primaries"), "bt709"),
            "transfer": (v.get("color_transfer"), "bt709"),
            "matrix": (v.get("color_space"), "bt709"),
            "fps": (round(fps_dari(v), 2), float(p.fps)),
            "audio": (a and a["codec_name"], "aac"),
        }
        beda = [f"{k}={x} (harus {y})" for k, (x, y) in cek_.items() if x != y]
        if beda:
            salah.append(f"{f.name}: " + ", ".join(beda))
        else:
            info.append(f"{f.name}: h264 {p.W}x{p.H} bt709 aac ✓")
    return (GAGAL, salah + info) if salah else (LULUS, info)


# ------------------------------------------------------------------ efek

def cek_efek(c: Ctx, m) -> dict:
    """Aturan standar modul efek: .1 durasi, .2 format klip broll, .3 stagger (sesuai frontmatter)."""
    fm, _ = frontmatter(m.path)
    L = c.L or {}
    el = [e for e in c.el if e.get("efek") == m.ref and e["induk"] is None]
    push = [u for u in L.get("push", []) if u.get("efek") == m.ref]
    broll = [b for b in L.get("broll", []) if b.get("efek") == m.ref]
    semua = el + push + broll
    hasil = {}
    if not semua:
        return {f"{m.id}.{k}": (LEWAT, ["efek tidak dipakai di layout"]) for k in (1, 2, 3)}

    if fm.get("durasi"):
        a, z = fm["durasi"]
        salah = [f"{x['id']}: {x['selesai'] - x['mulai']:.2f}s di luar {a}–{z}s" for x in semua
                 if not a - 0.05 <= x["selesai"] - x["mulai"] <= z + 0.05]
        hasil[f"{m.id}.1"] = (GAGAL, salah) if salah else (LULUS, [f"{len(semua)} elemen dalam {a}–{z}s"])

    if not broll and fm.get("dukungan") != "eksternal":
        hasil[f"{m.id}.2"] = (LEWAT, [f"dukungan {fm.get('dukungan')}: tidak memakai klip broll"])
    elif not broll:
        hasil[f"{m.id}.2"] = (PERINGATAN, ["efek eksternal tanpa klip broll — pastikan direalisasikan dengan benar"])
    else:
        salah, info = [], []
        for b in broll:
            v = stream(c.probe(Path(b["file"])) or {}, "video")
            if not v:
                salah.append(f"{b['id']}: tidak bisa dibaca")
                continue
            w, h, f = int(v["width"]), int(v["height"]), fps_dari(v)
            if abs(w / h - c.p.W / c.p.H) > 0.01:
                salah.append(f"{b['id']}: rasio {w}x{h} ≠ {c.p.W}x{c.p.H}")
            if w < c.p.W:
                salah.append(f"{b['id']}: resolusi {w}x{h} < {c.p.W}x{c.p.H}")
            if abs(f - c.p.fps) > 0.01:
                salah.append(f"{b['id']}: fps {f:.2f} ≠ {c.p.fps}")
            info.append(f"{b['id']}: {w}x{h}@{f:.2f}")
        hasil[f"{m.id}.2"] = (GAGAL, salah) if salah else (LULUS, info)

    if fm.get("stagger"):
        a, z = fm["stagger"]
        k = [e for e in el if e["tipe"] in ("kartu", "remotion") and e.get("item")]
        salah = [f"{e['id']}: stagger {e.get('stagger')} di luar {a}–{z}s" for e in k
                 if e.get("stagger") is None or not a - 1e-6 <= e["stagger"] <= z + 1e-6]
        hasil[f"{m.id}.3"] = (GAGAL, salah) if salah else ((LULUS, [f"{len(k)} kartu"]) if k else (LEWAT, []))
    return hasil


# ------------------------------------------------------------------ template

def cek_template(c: Ctx, tid: str) -> list[dict]:
    fm = c.p.template_fm
    hasil = []
    beats = (c.L or {}).get("beats") or []
    ids = {b["id"] for b in beats}
    kurang = [b for b in fm.get("beat_wajib", []) if b not in ids]
    hasil.append((f"{tid}.1", (GAGAL, [f"beat kurang: {', '.join(kurang)}"]) if kurang else (LULUS, [f"{len(ids)} beat"])))
    a, z = fm.get("durasi", [0, 1e9])
    tol = c.p.t("qa.durasi-toleransi-s")
    d = (c.L or {}).get("durasi")
    if d is None:
        hasil.append((f"{tid}.2", (GAGAL, ["layout.json tidak ada"])))
    else:
        ok = a - tol <= d <= z + tol
        hasil.append((f"{tid}.2", (LULUS if ok else GAGAL, [f"{d:.1f}s (template {a}–{z}s ±{tol})"])))
    hook = next((b for b in beats if b["id"] == "hook"), None)
    hm = fm.get("hook_maks")
    if hook and hm:
        hasil.append((f"{tid}.3", (LULUS if hook["selesai"] <= hm else GAGAL, [f"hook selesai {hook['selesai']:.2f}s (maks {hm})"])))
    return hasil


# ------------------------------------------------------------------ laporan

# Aturan yang butuh file hasil render penuh (master/ekspor/mask per frame) — dilewati saat pra-QA storyboard.
BUTUH_RENDER = {"K02.1", "K06.1", "K06.2", "K07.1", "K07.2"}


def evaluasi(p: Proyek, c: Ctx, lewati: set[str] = frozenset()) -> list[dict]:
    """Jalankan semua aturan modul terpakai terhadap layout di Ctx. ID di `lewati` → status LEWAT."""
    efek = p.efek_dipakai()
    modul = [*p.konteks, p.gaya, p.template, *efek]
    aturan = [r for m in modul for r in tabel_aturan(m.path)]
    tid = p.template_fm.get("id", "T")
    hasil_t = dict(cek_template(c, tid))
    for m in efek:
        hasil_t.update(cek_efek(c, m))
    out = []
    for r in aturan:
        jenis = r["cek"].lower()
        item = {**r, "status": None, "detail": []}
        if "otomatis" in jenis and r["id"] in lewati:
            item.update(status=LEWAT, detail=["dicek setelah render penuh"])
        elif "otomatis" in jenis:
            if r["id"] in CEK:
                fn = CEK[r["id"]]
                try:
                    st, det = fn(c, r["id"]) if fn.__code__.co_argcount > 1 else fn(c)
                except Exception as ex:  # cek rusak tidak boleh menghentikan laporan
                    st, det = GAGAL, [f"error saat cek: {type(ex).__name__}: {ex}"]
                item.update(status=st, detail=det)
            elif r["id"] in hasil_t:
                st, det = hasil_t[r["id"]]
                item.update(status=st, detail=det)
            else:
                item.update(status="BELUM DIIMPLEMENTASI", detail=["tidak ada fungsi @cek untuk ID ini di qa.py"])
        item["manual"] = "manual" in jenis
        out.append(item)
    return out


def ringkas(out: list[dict]) -> tuple[str, dict]:
    n = {s: sum(1 for x in out if x["status"] == s) for s in (LULUS, GAGAL, PERINGATAN, LEWAT, "BELUM DIIMPLEMENTASI")}
    return (GAGAL if n[GAGAL] else LULUS), n


def qa(p: Proyek) -> dict:
    c = Ctx(p)
    out = evaluasi(p, c)
    status, n = ringkas(out)
    data = {"proyek": p.manifest["proyek"], "waktu": dt.datetime.now().isoformat(timespec="seconds"),
            "status": status, "ringkas": n, "modul": p.modul_terpakai(), "hasil": out,
            "peringatan_render": (c.L or {}).get("peringatan", [])}
    tulis_json(p.out / "qa.json", data)
    (p.out / "qa-report.md").write_text(_md(data), encoding="utf-8")
    log("qa", f"{status} — lulus {n[LULUS]}, gagal {n[GAGAL]}, peringatan {n[PERINGATAN]}, "
              f"lewat {n[LEWAT]}, manual {sum(x['manual'] for x in out)} → out/qa-report.md")
    if c.L:
        import laporan
        laporan.laporan(p)  # laporan perangkat per beat + kontak-sheet untuk ditinjau
    return data


def _md(d: dict) -> str:
    ikon = {LULUS: "✅", GAGAL: "❌", PERINGATAN: "⚠️", LEWAT: "➖", "BELUM DIIMPLEMENTASI": "🚧"}
    m = d["modul"]
    baris = [f"# QA — {d['proyek']}", "",
             f"**Status: {ikon[d['status']]} {d['status']}** · {d['waktu']}", "",
             " · ".join(f"{k.lower()} {v}" for k, v in d["ringkas"].items()), "",
             "## Modul yang dibaca", "",
             "| Lapisan | Ref | File |", "|---|---|---|",
             f"| gaya | {m['gaya']['ref']} | {m['gaya']['file']} |",
             f"| template | {m['template']['ref']} | {m['template']['file']} |",
             *[f"| konteks | {k['ref']} | {k['file']} |" for k in m["konteks"]],
             *[f"| tokens | {t['ref']} | {t['file']} |" for t in m["tokens"]],
             *[f"| efek | {e['ref']} | {e['file']} |" for e in m.get("efek", [])],
             f"| skill | {m['skill']['ref']} | {m['skill']['file']} |",
             f"| scripts | {m['scripts']['ref']} | pipeline/scripts/ |", "",
             "## Cek otomatis", "", "| | ID | Aturan | Detail |", "|---|---|---|---|"]
    urut = {GAGAL: 0, "BELUM DIIMPLEMENTASI": 1, PERINGATAN: 2, LULUS: 3, LEWAT: 4}
    for x in sorted((x for x in d["hasil"] if x["status"]), key=lambda x: (urut[x["status"]], x["id"])):
        det = "<br>".join(re.sub(r"\|", "/", s) for s in x["detail"][:12])
        if len(x["detail"]) > 12:
            det += f"<br>… +{len(x['detail']) - 12}"
        baris.append(f"| {ikon[x['status']]} | {x['id']} | {re.sub(r'[|]', '/', x['aturan'])[:110]} | {det} |")
    baris += ["", "## Checklist manual (centang sebelum diserahkan)", ""]
    baris += [f"- [ ] **{x['id']}** {x['aturan']}" for x in d["hasil"] if x["manual"]]
    if d["peringatan_render"]:
        baris += ["", "## Peringatan render", ""] + [f"- {w}" for w in d["peringatan_render"]]
    return "\n".join(baris) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    arg = ap.parse_args()
    return 1 if qa(Proyek(arg.proyek))["status"] == GAGAL else 0


if __name__ == "__main__":
    main_aman(main)
