"""slot — generator koreografi: slot per fungsi → perangkat/efek konkret sesuai gaya, dengan seed untuk variasi.

Koreografi v0.3 menulis APA yang dikatakan tiap bagian (`slot` = fungsi + `isi` generik), bukan efek tertentu:

    {"slot": "bukti", "isi": {"judul": "Retensi naik", "angka": {"ke": 73, "akhiran": "%", "label": "retensi"},
                              "seri": [22, 31, 54, 73]}, "mulai": 18.2, "selesai": 24.0}
    {"slot": "transisi", "mulai": 18.0}              → transisi khas gaya (token motif.transisi)
    {"slot": "reveal", "x": 0.5, "y": 0.2, ...}       → hiasan reveal khas gaya (motif.reveal) / partikel
    {"slot": "kamera", "mulai": 11.3, "selesai": 14}  → efek kamera pada rekaman (digital-zoom, vertigo, phone-mockup, …)

Generator (`rakit`) memilih SATU kandidat per slot dari token `slot.<fungsi>` (platform), dengan syarat:
    - isi cukup untuk kandidat itu (mis. penghitung butuh angka, timeline butuh ≥ 3 item)
    - durasi slot dalam rentang `durasi` modul efek (dipotong ke maksimum bila perlu)
    - efek cocok gaya: `gaya_cocok` kosong = universal; berisi = hanya gaya itu (khas → bobot 3×)
    - K09.1: perangkat tidak sama dengan beat sebelumnya; perangkat yang sudah dipakai diberi bobot kecil (variasi)
    - kandidat "penuh" (cutaway/sampul) hanya bila beat tidak punya teks tetap lain pada waktu yang sama
Pilihan ditentukan random.Random(f"{koreografi}:{gaya}:{seed}") → seed sama = hasil sama; seed lain = varian lain.
"""
from __future__ import annotations

import copy
import random
from dataclasses import dataclass
from typing import Callable

from sistem import GagalPipeline, baca_json, frontmatter, gabung, resolve

POLOS = lambda s: str(s or "").replace("*", "")
IKON_FUNGSI = {"hook": "ide", "konteks": "info", "bukti": "grafik", "masalah": "petir", "membantah": "silang",
               "proses": "lapisan", "langkah": "cek", "kustomisasi": "kartu", "hasil": "bintang", "ringkasan": "dokumen",
               "reveal": "bintang", "ajakan": "kirim"}
STATUS_FUNGSI = {"masalah": "salah", "membantah": "salah", "hasil": "benar", "bukti": "benar", "langkah": "nomor"}
EFEK_TRANSISI = {"blur-zoom": "blur-zoom", "zoom-tembus": "zoom-through-cut", "whip": "whip", "glitch": "glitch",
                 "celup": "celup", "kertas": "paper-cut", "coretan": "doodle-boil", "portal": "zoom-portal"}
SALIN = ("posisi", "x", "y", "geser_y", "lebar", "opasitas", "fungsi", "ukuran")


@dataclass
class Kandidat:
    efek: str | None                  # modul efek (gaya_cocok, durasi) — None = elemen dasar universal
    buat: Callable                    # (isi, ctx) → elemen dict | None (isi tidak cukup)
    min: float = 1.5                  # durasi minimum perkiraan (detik)
    maks: float | None = None         # dipotong ke sini (None = ikut slot / frontmatter durasi)
    penuh: bool = False               # memakai seluruh layar → tidak boleh bersama teks tetap lain
    roto: bool = False                # butuh mask subjek
    titik: bool = False               # slot titik (transisi/reveal): durasi sendiri


def _item(isi):
    return [x for x in (isi.get("item") or []) if x]


def _r(efek, **kw):
    return {"tipe": "remotion", "efek": efek, **kw}


def _chip(status=None):
    def buat(isi, c):
        teks = isi.get("chip") or isi.get("teks") or isi.get("judul")
        if not teks or len(POLOS(teks)) > 42:
            return None
        st = status or isi.get("status") or ("nomor" if isi.get("nomor") else STATUS_FUNGSI.get(c["fungsi"], "info"))
        e = {"tipe": "chip", "status": st, "teks": teks}
        if st == "nomor":
            e["nomor"] = str(isi.get("nomor", c["ke"]))
        return e
    return buat


def _info(isi, c):
    if not isi.get("judul"):
        return None
    return {"tipe": "info", "ikon": isi.get("ikon", IKON_FUNGSI.get(c["fungsi"], "info")), "judul": isi["judul"],
            **({"sub": isi["sub"]} if isi.get("sub") else {})}


def _kata(isi, maks_kata=2, maks_huruf=12):
    k = isi.get("kata")
    if not k or len(POLOS(k).split()) > maks_kata or len(POLOS(k)) > maks_huruf:
        return None
    return POLOS(k)


def _glass(isi, c):
    k = _kata(isi)
    return _r("glass-type", teks=k.upper(), y=0.3) if k else None


def _cover(isi, c):
    if not isi.get("judul") or not _item(isi):
        return None
    return _r("cover-story", masthead=isi.get("masthead", "EDISI"), judul_utama=isi["judul"], baris=_item(isi)[:2],
              edisi=isi.get("edisi", "Edisi khusus"), bagian="semua")


def _prompt(isi, c):
    if not isi.get("teks"):
        return None
    e = _r("prompt-ui", teks=isi["teks"], posisi="atas")
    for k in ("label", "lampiran", "cps", "opasitas"):
        if isi.get(k):
            e[k] = isi[k]
    if _kata(isi, 3, 18):
        e["kata_ciut"] = _kata(isi, 3, 18)
    return e


def _berita(isi):
    b = isi.get("berita") or _item(isi)
    return b if len(b) >= 3 else None


def _headline(isi, c):
    b = _berita(isi)
    if not b:
        return None
    sorot = next((i for i, x in enumerate(b) if "*" in x), min(2, len(b) - 1))
    return _r("headline-wall", judul_judul=b[:6], sorot=sorot)


def _couch(isi, c):
    it = _item(isi)
    return _r("couch-wall", konten=[{"judul": x} for x in it[:4]]) if len(it) >= 2 else None


def _uiworld(isi, c):
    return _r("ui-world", judul=isi["judul"], **({"sub": isi["sub"]} if isi.get("sub") else {})) if isi.get("judul") else None


def _orbit(isi, c):
    it = _item(isi)
    if not isi.get("judul") or len(it) < 3:
        return None
    return _r("orbit", pusat=isi["judul"], satelit=[POLOS(x) for x in it[:6]], **({"sub": isi["sub"]} if isi.get("sub") else {}))


def _paper(isi, c):
    return _r("paper-cut", judul=isi["judul"], **({"sub": isi["sub"]} if isi.get("sub") else {})) if isi.get("judul") else None


def _coret(isi, c):
    teks = isi.get("anggapan") or isi.get("teks")
    if not teks or len(POLOS(teks)) > 34:
        return None
    return _r("coret", judul=isi.get("file", "catatan.txt"), teks=POLOS(teks))


def _doodle(isi, c):
    k = _kata(isi, 3, 16) or (POLOS(isi.get("chip")) if isi.get("chip") and len(POLOS(isi["chip"])) <= 16 else None)
    if not k:
        return None
    return _r("doodle-boil", anotasi=[{"jenis": "panah", "x": 0.64, "y": 0.34, "arah": 35, "teks": k},
                                      {"jenis": "bintang", "x": 0.26, "y": 0.22, "w": 0.07},
                                      {"jenis": "bintang", "x": 0.74, "y": 0.18, "w": 0.05}])


def _form(isi, c):
    g = isi.get("ganti") or []
    if not g or any("label" not in r or "baru" not in r for r in g):
        return None
    return _r("form-ganti", baris=g[:3], **({"judul": isi["file"]} if isi.get("file") else {}))


def _angka(isi):
    a = isi.get("angka") or {}
    return a if isinstance(a.get("ke"), (int, float)) else None


def _hitung(isi, c):
    a = _angka(isi)
    if not a:
        return None
    e = _r("penghitung", judul=isi.get("sumber") or POLOS(isi.get("judul")) or "data", ke=a["ke"],
           **{k: a[k] for k in ("akhiran", "label", "dari") if k in a}, bintang=bool(isi.get("bintang", False)))
    if isi.get("sub"):
        e["sub"] = isi["sub"]
    if isi.get("durasi_hitung"):
        e["durasi_hitung"] = isi["durasi_hitung"]
    return e


def _chart(isi, c):
    a = _angka(isi)
    seri = isi.get("seri") or ([round(a["ke"] * f, 1 if a["ke"] < 20 else 0) for f in (0.3, 0.42, 0.55, 0.78, 1.0)] if a else None)
    if not seri or len(seri) < 3:
        return None
    e = _r("chart-grow", judul=isi.get("sumber") or POLOS(isi.get("judul")) or "data", nilai=seri)
    if isi.get("label_seri"):
        e["label"] = isi["label_seri"][:len(seri)]
    if a and a.get("akhiran"):
        e["akhiran"] = a["akhiran"]
    if isi.get("sub"):
        e["catatan"] = isi["sub"]
    return e


def _grid(isi, c):
    a = _angka(isi)
    if not a or not float(a["ke"]).is_integer() or not 6 <= a["ke"] <= 120:
        return None
    return _r("grid-variasi", judul=isi.get("file", POLOS(isi.get("judul"))[:16] or "hasil"), ke=int(a["ke"]),
              **({"label": a["label"]} if a.get("label") else {}))


def _terminal(isi, c):
    perintah = isi.get("perintah")
    it = _item(isi)
    if not perintah and not (isi.get("judul") and it):
        return None
    return _r("terminal", judul=isi.get("app", "terminal"), perintah=POLOS(perintah or isi["judul"]).lower(),
              keluaran=[POLOS(x) for x in it[:2]] + [f"✓ {POLOS(isi.get('hasil', 'selesai'))}"])


def _timeline(isi, c):
    it = _item(isi)
    if len(it) < 3:
        return None
    return _r("timeline", chip=[POLOS(x) for x in it[:5]], **({"catatan": POLOS(isi["sub"])} if isi.get("sub") else {}))


def _checklist(isi, c):
    it = _item(isi)
    if len(it) < 2:
        return None
    return _r("checklist", item=it[:4], stagger=0.6, **({"judul": isi["judul"]} if isi.get("judul") else {}))


def _aksen_gaya(isi, c):
    return _r("aksen-gaya")


def _partikel(isi, c):
    return _r("partikel")


def _depth(isi, c):
    k = _kata(isi)
    return {"tipe": "depth", "teks": k.upper(), "gradien": True, "y": 0.36} if k else None


def _cta(isi, c):
    teks = isi.get("teks") or isi.get("judul")
    return {"tipe": "cta", "teks": teks, "posisi": "atas"} if teks else None


def _lower_third(isi, c):
    if not isi.get("nama"):
        return None
    return _r("lower-third", nama=isi["nama"], **({"peran": isi["peran"]} if isi.get("peran") else {}))


def _langkah(isi, c):
    it = [x for x in (isi.get("langkah") or _item(isi)) if x]
    if not 2 <= len(it) <= 4 or any(len(POLOS(x)) > 14 for x in it):
        return None
    return _r("langkah", item=it, posisi="atas")


def _sebelum_sesudah(isi, c):
    ss = isi.get("sebelum_sesudah") or {}
    sb = ss.get("sebelum") or isi.get("anggapan")
    sd = ss.get("sesudah") or isi.get("fakta")
    if not sb or not sd:
        return None
    return _r("sebelum-sesudah", sebelum=sb, sesudah=sd)


def _callout(isi, c):
    co = isi.get("callout") or {}
    if co.get("x") is None or co.get("y") is None or not co.get("teks"):
        return None
    return _r("callout", x=co["x"], y=co["y"], teks=co["teks"])


def _linimasa(isi, c):
    lm = isi.get("linimasa") or []
    return _r("linimasa", titik=lm[:4]) if len(lm) >= 2 else None


def _liquid(isi, c):
    j = isi.get("kaca") or isi.get("judul") or isi.get("chip")
    if not j or len(POLOS(j)) > 34:
        return None
    e = _r("liquid-glass", judul=j, opasitas=0.24, posisi="atas")
    if isi.get("sub") and len(POLOS(isi["sub"])) <= 40:
        e["sub"] = isi["sub"]
    return e


def _checklist_pop(isi, c):
    e = _checklist(isi, c)
    return dict(e, efek="checklist-pop", stagger=0.55) if e else None


def _storm(isi, c):
    b = _berita(isi)
    utama = isi.get("utama") or isi.get("judul")
    return _r("headline-storm", judul_judul=b[:6], utama=utama) if b and utama else None


def _growth(isi, c):
    a = _angka(isi)
    if not a or a["ke"] <= 0:
        return None
    e = _r("growth-curve", judul=isi.get("sumber") or POLOS(isi.get("judul")) or "pertumbuhan", ke=a["ke"],
           **({"akhiran": a["akhiran"]} if a.get("akhiran") else {}))
    if isi.get("tonggak"):
        e["tonggak"] = isi["tonggak"][:3]
    if isi.get("label_seri") and len(isi["label_seri"]) >= 2:
        e["label_x"] = [isi["label_seri"][0], isi["label_seri"][-1]]
    if isi.get("sub"):
        e["catatan"] = isi["sub"]
    return e


def _kamera(efek):
    return lambda isi, c: {"tipe": "kamera", "efek": efek}


KANDIDAT: dict[str, Kandidat] = {
    "chip": Kandidat(None, _chip(), 1.5),
    "chip-benar": Kandidat(None, _chip("benar"), 1.5),
    "chip-salah": Kandidat(None, _chip("salah"), 1.5),
    "info": Kandidat(None, _info, 1.8),
    "glass-type": Kandidat("glass-type", _glass, 2.2, 4.0),
    "cover-story": Kandidat("cover-story", _cover, 3.0, 4.0, penuh=True),
    "prompt-ui": Kandidat("prompt-ui", _prompt, 4.0),
    "headline-wall": Kandidat("headline-wall", _headline, 3.6, 5.0, penuh=True),
    "couch-wall": Kandidat("couch-wall", _couch, 4.2, penuh=True),
    "ui-world": Kandidat("ui-world", _uiworld, 4.0, 6.0, penuh=True),
    "orbit": Kandidat("orbit", _orbit, 3.0, 5.0, penuh=True),
    "paper-cut": Kandidat("paper-cut", _paper, 3.0, 5.0, penuh=True),
    "coret": Kandidat("coret", _coret, 2.4),
    "doodle-boil": Kandidat("doodle-boil", _doodle, 2.0, 4.0),
    "form-ganti": Kandidat("form-ganti", _form, 3.4),
    "penghitung": Kandidat("penghitung", _hitung, 3.0),
    "chart-grow": Kandidat("chart-grow", _chart, 3.8),
    "grid-variasi": Kandidat("grid-variasi", _grid, 3.6),
    "terminal": Kandidat("terminal", _terminal, 3.8),
    "timeline": Kandidat("timeline", _timeline, 4.4),
    "checklist": Kandidat("checklist", _checklist, 3.2),
    "aksen-gaya": Kandidat("aksen-gaya", _aksen_gaya, 1.2, 1.8, titik=True),
    "partikel": Kandidat("partikel", _partikel, 1.2, 1.2, titik=True),
    "depth": Kandidat(None, _depth, 2.0, roto=True),
    "cta": Kandidat(None, _cta, 2.0),
    "lower-third": Kandidat("lower-third", _lower_third, 2.6, 5.0),
    "langkah": Kandidat("langkah", _langkah, 3.6),
    "sebelum-sesudah": Kandidat("sebelum-sesudah", _sebelum_sesudah, 3.6),
    "callout": Kandidat("callout", _callout, 2.4),
    "linimasa": Kandidat("linimasa", _linimasa, 3.4),
    "liquid-glass": Kandidat("liquid-glass", _liquid, 2.0),
    "checklist-pop": Kandidat("checklist-pop", _checklist_pop, 3.2),
    "headline-storm": Kandidat("headline-storm", _storm, 3.4, 5.0, penuh=True),
    "growth-curve": Kandidat("growth-curve", _growth, 3.6),
    "snap-zoom": Kandidat("snap-zoom", _kamera("snap-zoom"), 0.9, 2.5),
    "frame-escape": Kandidat("frame-escape", _kamera("frame-escape"), 2.6, 5.0, roto=True),
    "studio-reveal": Kandidat("studio-reveal", _kamera("studio-reveal"), 3.0, 6.0),
    "paper-cutout": Kandidat("paper-cutout", _kamera("paper-cutout"), 2.0, 6.0, roto=True),
    "digital-zoom": Kandidat("digital-zoom", _kamera("digital-zoom"), 1.0, 2.0),
    "vertigo": Kandidat("vertigo", _kamera("vertigo"), 2.0, 4.0, roto=True),
    "phone-mockup": Kandidat("phone-mockup", _kamera("phone-mockup"), 3.0, 6.0),
    "pull-back-reveal": Kandidat("pull-back-reveal", _kamera("pull-back-reveal"), 3.0, 5.0),
    "frame-break": Kandidat("frame-break", _kamera("frame-break"), 1.5, 3.0, roto=True),
    "green-screen": Kandidat("green-screen", _kamera("green-screen"), 2.0, roto=True),
}


PENUH_EFEK = {n for n, k in KANDIDAT.items() if k.penuh}


def _kunci(e: dict) -> str:
    if e.get("tipe") == "chip":
        return f"chip-{e.get('status', 'info')}"
    return e.get("efek") or e["tipe"]


def _fm_efek(nama: str, cache: dict) -> dict:
    if nama not in cache:
        cache[nama] = frontmatter(resolve("efek", nama).path)[0]
    return cache[nama]


def tokens_gaya(gaya_ref: str) -> dict:
    g = resolve("gaya", gaya_ref)
    tok = {}
    for r in frontmatter(g.path)[0].get("tokens", []):
        tok = gabung(tok, baca_json(resolve("tokens", r).path))
    return tok


def _teks_tetap(beat: dict) -> list[tuple[float, float]]:
    out = []
    for e in beat.get("elemen", []):
        if e.get("tipe") in ("judul", "teks", "kartu", "info", "chip", "cta", "depth"):
            a = e.get("mulai", beat.get("mulai"))
            z = e.get("selesai", beat.get("selesai"))
            if isinstance(a, (int, float)) and isinstance(z, (int, float)):
                out.append((a, z))
    return out


def _detik(v, cadangan):
    return v if isinstance(v, (int, float)) else cadangan


def rakit(kd: dict, gaya: str, seed: int = 0, nama: str = "") -> dict:
    """Koreografi (dict) + gaya → koreografi konkret (beat_sheet tanpa slot). Mencoba beberapa sub-seed agar
    variasi_min (K09.2) terpenuhi; gagal → GagalPipeline."""
    beats = kd.get("beat_sheet", {}).get("beats", [])
    if not any("slot" in e for b in beats for e in b.get("elemen", [])):
        return kd  # koreografi lama (tanpa slot) dipakai apa adanya
    tok = tokens_gaya(gaya)
    g = resolve("gaya", gaya).nama
    motif = tok.get("motif", {})
    tabel = tabel_slot(tok)
    vmin = int(kd.get("variasi_min", 3))
    kmin = int(tok.get("koreografi", {}).get("khas-min", 2))
    terbaik, galat = None, None
    for coba in range(32):
        try:
            hasil = _rakit_sekali(kd, g, motif, tabel, random.Random(f"{nama}:{g}:{seed}:{coba}"))
        except GagalPipeline as e:
            galat = e
            continue
        n = len({k for _, ks in hasil["_kunci_beat"] for k in ks})
        khas = len(_khas(g, [e for b in hasil["beat_sheet"]["beats"] for e in b["elemen"]]))
        skor = (min(khas, kmin), min(n, vmin), khas, n)
        if terbaik is None or skor > terbaik[0]:
            terbaik = (skor, hasil)
        if n >= vmin and khas >= kmin:
            break
    if terbaik is None:
        raise galat
    (_, _, khas, n), hasil = terbaik
    hasil["_variasi"] = n
    hasil["_khas"] = khas
    hasil.pop("_kunci_beat")
    return hasil


def tabel_slot(tok: dict) -> dict:
    """Kandidat per fungsi = token platform `slot` + efek yang mendeklarasikan `slot: [fungsi…]` di frontmatter modulnya
    (efek baru ikut terpilih tanpa menaikkan versi token). `_transisi` = [(jenis, gaya_cocok)] efek transisi ber-slot."""
    from render_kamera import JENIS_TRANSISI
    from sistem import daftar_modul
    tabel = {k: list(v) for k, v in tok.get("slot", {}).items() if isinstance(v, list)}
    tabel["_transisi"] = []
    for m in daftar_modul("efek", termasuk_arsip=False):
        fm = frontmatter(m.path)[0]
        for fungsi in fm.get("slot") or []:
            if fungsi == "transisi" and m.nama in JENIS_TRANSISI:
                tabel["_transisi"].append((JENIS_TRANSISI[m.nama], fm.get("gaya_cocok") or []))
            elif m.nama in KANDIDAT and m.nama not in tabel.setdefault(fungsi, []):
                tabel[fungsi].append(m.nama)
    return tabel


def _khas(gaya: str, el: list[dict]) -> set[str]:
    out = set()
    for e in el:
        if e.get("efek"):
            cocok = frontmatter(resolve("efek", e["efek"]).path)[0].get("gaya_cocok") or []
            if gaya in cocok:
                out.add(str(e["efek"]).partition("@")[0])
    return out


def _rakit_sekali(kd: dict, gaya: str, motif: dict, tabel: dict, rng: random.Random) -> dict:
    out = copy.deepcopy(kd)
    fm_cache: dict = {}
    roto_boleh = bool(kd.get("butuh", {}).get("roto_boleh", kd.get("butuh", {}).get("rekaman", True)))
    dipakai: dict[str, int] = {}
    sebelum: set[str] = set()
    pilihan, kunci_beat = [], []
    semua_beat = out["beat_sheet"]["beats"]
    # perangkat TETAP tiap beat (bukan slot) → slot di beat sebelumnya tidak boleh memilih perangkat yang sama (K09.1)
    tetap = [{_kunci(x) for x in bb.get("elemen", []) if "slot" not in x and x.get("tipe") in ("chip", "info", "kartu", "cta", "depth", "remotion")}
             for bb in semua_beat]
    for bi, b in enumerate(semua_beat):
        teks_tetap = _teks_tetap(b)
        baru, kunci_ini = [], set()
        for e in b.get("elemen", []):
            if "slot" not in e:
                baru.append(e)
                if e.get("tipe") in ("chip", "info", "kartu", "cta", "depth", "remotion"):
                    kunci_ini.add(_kunci(e))
                continue
            slot = e["slot"]
            a = _detik(e.get("mulai"), b.get("mulai", 0))
            z = _detik(e.get("selesai"), b.get("selesai", a + 2))
            if slot == "transisi":
                # transisi khas gaya: token motif.transisi + efek transisi yang mencantumkan gaya ini (mis. zoom-portal)
                pilih = [motif.get("transisi", "blur-zoom")] + [j for j in tabel.get("_transisi", []) if j[1] and gaya in j[1]
                                                                 and j[0] != motif.get("transisi")]
                pilih = [x if isinstance(x, str) else x[0] for x in pilih]
                jenis = e.get("jenis") or rng.choice([pilih[0], pilih[0]] + pilih[1:])  # motif gaya tetap dominan (2:1)
                baru.append({"tipe": "transisi", "efek": EFEK_TRANSISI.get(jenis, "blur-zoom"), "jenis": jenis, "mulai": e.get("mulai", a)})
                pilihan.append({"beat": b["id"], "slot": slot, "dipilih": f"transisi:{jenis}", "lolos": [jenis]})
                continue
            nama_k = e.get("kandidat") or tabel.get(slot) or []
            if slot == "reveal" and not e.get("kandidat"):
                rv = motif.get("reveal", "partikel")
                nama_k = ["partikel"] if rv == "partikel" else ["aksen-gaya"]
            ctx = {"fungsi": e.get("fungsi", slot if slot != "kamera" else "hasil"), "ke": len(pilihan) + 1}
            lolos = []
            for nk in nama_k:
                k = KANDIDAT.get(nk)
                if not k or nk in e.get("kecuali", []):
                    continue
                if k.roto and not roto_boleh:
                    continue
                durasi_ok = (z - a) >= k.min - 1e-6
                if k.efek:
                    fm = _fm_efek(k.efek, fm_cache)
                    cocok = fm.get("gaya_cocok") or []
                    if cocok and gaya not in cocok:
                        continue
                    bobot = 3.0 if cocok else 1.0
                    if fm.get("durasi") and (z - a) < fm["durasi"][0] - 1e-6:
                        durasi_ok = False
                else:
                    bobot = 1.0
                if not durasi_ok:
                    continue
                if k.penuh and any(min(z, tz) - max(a, ta) > 0.05 for ta, tz in teks_tetap):
                    continue
                el = k.buat(e.get("isi") or {}, ctx)
                if el is None:
                    continue
                kunci = _kunci(el)
                if kunci in sebelum or kunci in kunci_ini or (bi + 1 < len(tetap) and kunci in tetap[bi + 1]):
                    continue
                if dipakai.get(kunci):
                    bobot *= 0.3
                lolos.append((nk, k, el, bobot))
            if not lolos:
                if e.get("wajib", True):
                    raise GagalPipeline(f"beat {b['id']} slot {slot!r}: tidak ada kandidat yang cocok (gaya {gaya}, isi "
                                        f"{sorted((e.get('isi') or {}).keys())}, {z - a:.1f} s) — tambah isi atau 'kandidat'.")
                continue
            total = sum(x[3] for x in lolos)
            r = rng.uniform(0, total)
            for nk, k, el, bobot in lolos:
                r -= bobot
                if r <= 0:
                    break
            el = dict(el, mulai=e.get("mulai", a))
            maks = k.maks
            if k.efek and _fm_efek(k.efek, fm_cache).get("durasi"):
                maks = min(maks or 1e9, _fm_efek(k.efek, fm_cache)["durasi"][1])
            if k.titik:
                el["selesai"] = round(a + (maks or k.min), 3)
            elif maks and z - a > maks:
                el["selesai"] = round(a + maks, 3)
            else:
                el["selesai"] = e.get("selesai", z)
            for f in SALIN:
                if f in e and (el["tipe"] not in ("kamera",) or f == "fungsi"):
                    el.setdefault(f, e[f])
            el.setdefault("fungsi", ctx["fungsi"])
            if k.penuh or el["tipe"] == "kamera":
                for f in ("posisi", "x", "y", "geser_y", "lebar"):
                    el.pop(f, None)
            if el.get("efek") == "aksen-gaya" and motif.get("reveal") and motif["reveal"] != "partikel":
                el["jenis"] = motif["reveal"]
            if el.get("efek") == "cover-story":  # sampul punya teks sendiri → caption beat ini disembunyikan (K00.2)
                cap = out["beat_sheet"].setdefault("caption", {})
                if cap.get("aktif", True) and b["id"] not in cap.setdefault("kecuali", []):
                    cap["kecuali"].append(b["id"])
            baru.append(el)
            kunci = _kunci(el)
            kunci_ini.add(kunci)
            dipakai[kunci] = dipakai.get(kunci, 0) + 1
            pilihan.append({"beat": b["id"], "slot": slot, "dipilih": nk, "lolos": [x[0] for x in lolos]})
        penuh = [(x["mulai"], x["selesai"]) for x in baru if x.get("efek") in PENUH_EFEK
                 and isinstance(x.get("mulai"), (int, float)) and isinstance(x.get("selesai"), (int, float))]
        if penuh:  # klip cutaway menutup layar → latar kaca di rentang yang sama tidak perlu
            baru = [x for x in baru if not (x.get("tipe") == "latar" and any(
                min(z, _detik(x.get("selesai"), z)) - max(a, _detik(x.get("mulai"), a)) > 0.1 for a, z in penuh))]
        b["elemen"] = baru
        kunci_beat.append((b["id"], kunci_ini))
        sebelum = kunci_ini
    el_semua = [e for b in out["beat_sheet"]["beats"] for e in b["elemen"]]
    efek = []
    for e in el_semua:
        if e.get("efek") and e["efek"] not in efek:
            efek.append(e["efek"])
    out["efek"] = [f"{x}@{resolve('efek', x).versi}" for x in efek]
    butuh = dict(out.get("butuh", {}))
    butuh.pop("roto_boleh", None)
    from roto import butuh_mask
    butuh["roto"] = any(butuh_mask(e) for e in el_semua)
    butuh["remotion"] = any(e.get("tipe") in ("remotion",) for e in el_semua) or any(
        e.get("tipe") == "transisi" and e.get("jenis") in ("kertas", "coretan") for e in el_semua)
    out["butuh"] = butuh
    if any(e.get("tipe") == "depth" for e in el_semua):
        kt = out.setdefault("konteks_tambahan", [])
        if not any(str(x).startswith("depth-typography") for x in kt):
            kt.append("depth-typography@0.2")
    out["_pilihan"] = pilihan
    out["_kunci_beat"] = kunci_beat
    return out
