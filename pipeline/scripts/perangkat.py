"""perangkat — jadwal & bunyi untuk Composition Remotion perangkat UI (E18–E25).

Setiap perangkat menghitung jadwal (detik relatif mulai elemen) yang dipakai BERSAMA oleh gambar (Remotion, lewat
props `elemen.jadwal`) dan suara (render.py mendaftarkan SFX dari `bunyi`), jadi klik/tick/pop jatuh tepat di frame
geraknya. Durasi elemen yang terlalu pendek ditolak dengan pesan yang menyebut durasi minimum.

Kontrak tiap perangkat:
    jadwal(e, an, p, dur) -> (jadwal: dict, bunyi: [(t_relatif, kunci_peta_sfx, nama_sumber)])
    teks(e) -> str            # teks yang tampil (QA keterbacaan K01.5)
    kontrak                   # peran ukuran & warna token yang dipakai teks (QA K01.4/K01.8)
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Callable

from sistem import GagalPipeline


@dataclass
class Spek:
    jadwal: Callable
    teks: Callable
    kontrak: dict = field(default_factory=lambda: {"ukuran": ["isi"], "warna": ["teks-utama", "aksen"]})
    posisi: str = "tengah"
    jendela: bool = True     # panel mock UI → opasitas minimal perangkat.opasitas-min (keterbacaan)
    dekoratif: bool = False  # tanpa teks (partikel): dikecualikan dari cek tumpang tindih & tahan
    cutaway: bool = False    # klip layar penuh beserta latarnya → dirender sebagai broll (bukan overlay)
    kaca: bool | None = None  # None = ikut token blur.panel; True = video di balik alpha selalu di-blur (glass-type)
    panel: bool = True        # teks di atas panel sendiri; False = langsung di atas video (kontras diukur vs video)
    lensa: bool = False       # E37: video di balik alpha dibiaskan seperti kaca cair (render_pip._lensa)
    scrim: float | None = None  # teks di atas scrim hitam ber-opasitas ini (kontras diukur vs video × scrim)


def _cukup(e, butuh: float, dur: float, saran: str) -> None:
    if butuh > dur + 1e-3:
        raise GagalPipeline(f"{e['_id']}: butuh ≥ {butuh:.2f} s, elemen {dur:.2f} s — perpanjang elemen atau {saran}.")


def _polos(s: str) -> str:
    return str(s or "").replace("*", "")


def _ketik(teks: str, t0: float, cps: float) -> list[float]:
    return [round(t0 + i / cps, 3) for i in range(len(teks))]


# ---------------------------------------------------------------- E18 prompt-ui
def _prompt(e, an, p, dur):
    polos = _polos(e.get("teks"))
    if not polos:
        raise GagalPipeline(f"{e['_id']}: prompt-ui butuh 'teks'.")
    k = p.t("ketik")
    ketik = _ketik(polos, an["d_in"] + k["jeda-awal"], float(e.get("cps", k["cps"])))
    kirim = round(ketik[-1] + k["jeda-kirim"], 3)
    ciut, butuh = None, kirim + an["d_out"]
    if e.get("ciut", True):
        ciut = round(max(kirim + k["jeda-kirim"], dur - an["d_out"] - k["durasi-ciut"] - p.t("durasi.tahan-min")), 3)
        butuh = kirim + k["jeda-kirim"] + k["durasi-ciut"] + p.t("durasi.tahan-min") + an["d_out"]
    _cukup(e, butuh, dur, "naikkan 'cps' / pendekkan teks")
    j = {"ketik": ketik, "lampiran": round(an["d_in"] * 0.6, 3) if e.get("lampiran") else None,
         "kirim": kirim, "ciut": ciut, "durasi_ciut": k["durasi-ciut"]}
    b = [(0.0, "prompt-masuk", "masuk")]
    if j["lampiran"] is not None:
        b.append((j["lampiran"], "prompt-lampiran", "lampiran"))
    b += [(t, "prompt-ketik", f"huruf{i}") for i, (t, ch) in enumerate(zip(ketik, polos)) if ch != " "]
    b.append((kirim, "prompt-kirim", "kirim"))
    if ciut is not None:
        b.append((ciut + k["durasi-ciut"] / 2, "prompt-ciut", "ciut"))
    return j, b


# ---------------------------------------------------------------- E19 penghitung
def _hitung(e, an, p, dur):
    if "ke" not in e:
        raise GagalPipeline(f"{e['_id']}: penghitung butuh 'ke' (angka akhir).")
    k = p.t("perangkat")
    dh = float(e.get("durasi_hitung", k["durasi-hitung"]))
    m0 = round(an["d_in"] + 0.15, 3)
    _cukup(e, m0 + dh + p.t("durasi.tahan-min") + an["d_out"], dur, "kecilkan 'durasi_hitung'")
    jarak = abs(float(e["ke"]) - float(e.get("dari", 0)))
    n = max(3, min(int(k["tick-maks"]), int(jarak) or 3))
    # nilai = 1 − (1 − x)³ (ease-out kubik, sama dengan Remotion) → tick rapat di awal, jarang di akhir
    tick = [round(m0 + dh * (1 - (1 - i / n) ** (1 / 3)), 3) for i in range(1, n)]
    b = [(0.0, "remotion", "masuk")] + [(t, "hitung-tick", f"tick{i}") for i, t in enumerate(tick)]
    b.append((m0 + dh, "hitung-selesai", "selesai"))
    return {"mulai_hitung": m0, "durasi_hitung": dh}, b


# ---------------------------------------------------------------- E20 terminal
def _terminal(e, an, p, dur):
    perintah = _polos(e.get("perintah"))
    if not perintah:
        raise GagalPipeline(f"{e['_id']}: terminal butuh 'perintah' (opsional: keluaran[], judul).")
    k, pk = p.t("ketik"), p.t("perangkat")
    ketik = _ketik(perintah, an["d_in"] + k["jeda-awal"], float(e.get("cps", k["cps"])))
    enter = round(ketik[-1] + k["jeda-kirim"], 3)
    st = float(e.get("stagger", pk["stagger-baris"]))
    baris = [round(enter + 0.15 + i * st, 3) for i in range(len(e.get("keluaran", [])))]
    _cukup(e, (baris[-1] if baris else enter) + p.t("durasi.tahan-min") + an["d_out"], dur,
           "naikkan 'cps' / kurangi baris keluaran")
    b = [(0.0, "remotion", "masuk")]
    b += [(t, "terminal-ketik", f"huruf{i}") for i, (t, ch) in enumerate(zip(ketik, perintah)) if ch != " "]
    b.append((enter, "terminal-baris", "enter"))
    for i, t in enumerate(baris):
        akhir = i == len(baris) - 1 and str(e["keluaran"][i]).lstrip().startswith("✓")
        b.append((t, "terminal-selesai" if akhir else "terminal-baris", f"baris{i}"))
    return {"ketik": ketik, "enter": enter, "baris": baris}, b


# ---------------------------------------------------------------- E21 coret
def _coret(e, an, p, dur):
    if not e.get("teks"):
        raise GagalPipeline(f"{e['_id']}: coret butuh 'teks' (opsional: judul, ikon, tunda).")
    dc = p.t("perangkat")["durasi-coret"]
    tc = round(float(e.get("tunda", an["d_in"] + 0.4)), 3)
    silang = round(tc + dc, 3)
    _cukup(e, silang + p.t("durasi.tahan-min") + an["d_out"], dur, "kecilkan 'tunda'")
    return ({"coret": tc, "durasi_coret": dc, "silang": silang},
            [(0.0, "remotion", "masuk"), (tc, "coret-gores", "gores"), (silang, "coret-silang", "silang")])


# ---------------------------------------------------------------- E22 timeline
TREK_DEFAULT = [{"nama": "TEKS", "blok": 5}, {"nama": "B-ROLL", "blok": 5}, {"nama": "EFEK", "blok": 5, "bentuk": "wajik"}]


def _timeline(e, an, p, dur):
    pk = p.t("perangkat")
    trek = e.get("trek") or TREK_DEFAULT
    t_trek = [round(an["d_in"] + 0.2 + i * 0.5, 3) for i in range(len(trek))]
    chip = e.get("chip", [])
    c0 = t_trek[-1] + 0.6
    t_chip = [round(c0 + i * pk["stagger-chip"], 3) for i in range(len(chip))]
    _cukup(e, (t_chip[-1] if t_chip else t_trek[-1]) + p.t("durasi.tahan-min") + an["d_out"], dur, "kurangi chip/trek")
    b = [(t, "timeline-blok", f"trek{i}") for i, t in enumerate(t_trek)] + \
        [(t, "timeline-chip", f"chip{i}") for i, t in enumerate(t_chip)]
    return {"trek": t_trek, "chip": t_chip, "playhead": [round(an["d_in"], 3), round(dur - an["d_out"], 3)]}, b


# ---------------------------------------------------------------- E23 grid-variasi
def _grid(e, an, p, dur):
    n = int(e.get("ke", 0))
    if n < 1:
        raise GagalPipeline(f"{e['_id']}: grid-variasi butuh 'ke' (jumlah ubin ≥ 1).")
    dg = float(e.get("durasi_isi", p.t("perangkat")["durasi-grid"]))
    m0 = an["d_in"] + 0.3
    # kebalikan smoothstep: mulai pelan, cepat di tengah, melambat di akhir (seperti referensi 1 → 12 → 41 → 60)
    inv = lambda q: 0.5 - math.sin(math.asin(1 - 2 * q) / 3)
    ubin = [round(m0 + dg * inv((i + 1) / n), 3) for i in range(n)]
    _cukup(e, ubin[-1] + p.t("durasi.tahan-min") + an["d_out"], dur, "kecilkan 'durasi_isi'")
    langkah = max(1, math.ceil(n / 12))
    b = [(0.0, "remotion", "masuk")] + [(ubin[i], "grid-isi", f"ubin{i}") for i in range(0, n - 1, langkah)]
    b.append((ubin[-1], "grid-selesai", "selesai"))
    return {"ubin": ubin}, b


# ---------------------------------------------------------------- E24 form-ganti
def _form(e, an, p, dur):
    baris = e.get("baris", [])
    if not baris or any("label" not in r or "baru" not in r for r in baris):
        raise GagalPipeline(f"{e['_id']}: form-ganti butuh 'baris': [{{label, lama, baru}}, …].")
    st = float(e.get("stagger", p.t("perangkat")["stagger-form"]))
    ganti = [round(an["d_in"] + 0.4 + i * st, 3) for i in range(len(baris))]
    _cukup(e, ganti[-1] + 0.2 + p.t("durasi.tahan-min") + an["d_out"], dur, "kecilkan 'stagger' / kurangi baris")
    b = [(0.0, "remotion", "masuk")]
    for i, t in enumerate(ganti):
        b += [(t, "form-ganti", f"ganti{i}"), (t + 0.2, "form-lencana", f"lencana{i}")]
    return {"ganti": ganti}, b


# ---------------------------------------------------------------- E25 partikel
def _partikel(e, an, p, dur):
    return {"ledak": 0.0}, [(0.0, "partikel", "ledak")]


# ---------------------------------------------------------------- E27 aksen-gaya (reveal khas gaya)
def _aksen_gaya(e, an, p, dur):
    jenis = e.get("jenis") or p.t("motif.reveal", "partikel")
    kunci = {"kilau": "aksen-kilau", "target": "aksen-target", "stempel": "aksen-stempel", "selotip": "aksen-selotip",
             "doodle": "aksen-doodle", "uap": "aksen-uap"}.get(jenis, "aksen-garis")
    return {"mulai": 0.05}, [(0.05, kunci, "aksen")]


# ---------------------------------------------------------------- E10 chart-grow
def _chart(e, an, p, dur):
    nilai = e.get("nilai") or []
    if len(nilai) < 2:
        raise GagalPipeline(f"{e['_id']}: chart-grow butuh 'nilai' (≥ 2 angka; opsional label[], akhiran, sorot, bentuk).")
    db = 0.5
    st = min(0.28, 1.4 / len(nilai))
    batang = [round(an["d_in"] + 0.25 + i * st, 3) for i in range(len(nilai))]
    catatan = round(batang[-1] + db + 0.3, 3)
    _cukup(e, (catatan if e.get("catatan") else batang[-1] + db) + p.t("durasi.tahan-min") + an["d_out"], dur,
           "kurangi nilai / hapus catatan")
    b = [(0.0, "remotion", "masuk")] + [(t, "chart-batang", f"batang{i}") for i, t in enumerate(batang)]
    b.append((batang[-1] + db, "chart-selesai", "selesai"))
    return {"batang": batang, "durasi_batang": db, "catatan": catatan}, b


# ---------------------------------------------------------------- E17 glass-type
def _glass_type(e, an, p, dur):
    teks = _polos(e.get("teks")).replace("\n", "")
    if not teks or len(teks.split()) > 3:
        raise GagalPipeline(f"{e['_id']}: glass-type butuh 'teks' 1–3 kata (huruf raksasa).")
    huruf = [round(0.15 + i * min(0.06, 0.6 / len(teks)), 3) for i in range(len(teks))]
    kilau = round(huruf[-1] + 0.5, 3)
    _cukup(e, kilau + 0.9 + an["d_out"], dur, "pendekkan teks")
    return {"huruf": huruf, "kilau": kilau}, [(0.1, "kaca-masuk", "masuk"), (kilau + 0.2, "aksen-kilau", "kilau")]


# ---------------------------------------------------------------- E16 cover-story
def _cover(e, an, p, dur):
    bagian = e.get("bagian", "semua")
    baris = e.get("baris") or []
    if bagian != "masthead" and not (e.get("judul_utama") or baris):
        raise GagalPipeline(f"{e['_id']}: cover-story butuh 'judul_utama' dan/atau 'baris'[] (opsional masthead, edisi, bagian).")
    mh = 0.1
    tb = [round(0.7 + i * 0.25, 3) for i in range(len(baris))]
    judul = round((tb[-1] if tb else 0.6) + 0.45, 3)
    barcode = round(judul + 0.4, 3)
    _cukup(e, (mh + 0.6 if bagian == "masthead" else barcode) + p.t("durasi.tahan-min") + an["d_out"], dur, "kurangi baris")
    b = [] if bagian == "isi" else [(mh + 0.3, "cover-masthead", "masthead")]
    if bagian != "masthead":
        b += [(t, "cover-baris", f"baris{i}") for i, t in enumerate(tb)]
        if e.get("judul_utama"):
            b.append((judul, "cover-judul", "judul"))
    return {"masthead": mh, "judul": judul, "baris": tb, "barcode": barcode}, b


# ---------------------------------------------------------------- E14 doodle-boil
def _doodle(e, an, p, dur):
    anotasi = e.get("anotasi") or []
    if not anotasi:
        raise GagalPipeline(f"{e['_id']}: doodle-boil butuh 'anotasi': [{{jenis, x, y, …}}].")
    dg = 0.5
    gores = [round(0.15 + i * 0.45, 3) for i in range(len(anotasi))]
    _cukup(e, gores[-1] + dg + 0.6 + an["d_out"], dur, "kurangi anotasi")
    return {"gores": gores, "durasi_gores": dg}, [(t, "doodle-gores", f"gores{i}") for i, t in enumerate(gores)]


# ---------------------------------------------------------------- cutaway (klip broll native, E01/E02/E03/E08/E13)
def _headline(e, an, p, dur):
    h = e.get("judul_judul") or []
    if len(h) < 3:
        raise GagalPipeline(f"{e['_id']}: headline-wall butuh 'judul_judul' (≥ 3 judul berita).")
    kartu = [round(0.15 + i * 0.16, 3) for i in range(len(h))]
    sorot = round(kartu[-1] + 0.8, 3)
    _cukup(e, sorot + 1.3, dur, "kurangi judul")
    return ({"kartu": kartu, "sorot": sorot},
            [(t, "headline-jatuh", f"kartu{i}") for i, t in enumerate(kartu)] + [(sorot, "headline-sorot", "sorot")])


def _orbit(e, an, p, dur):
    if not e.get("pusat") or len(e.get("satelit") or []) < 3:
        raise GagalPipeline(f"{e['_id']}: orbit butuh 'pusat' dan 'satelit' (≥ 3 chip).")
    return {"masuk": 0.1}, [(0.1, "orbit", "masuk")]


def _couch(e, an, p, dur):
    k = e.get("konten") or []
    if len(k) < 2:
        raise GagalPipeline(f"{e['_id']}: couch-wall butuh 'konten' (≥ 2 isi dinding: {{judul, sub}}).")
    langkah = float(e.get("ganti", max(1.8, min(3.0, (dur - 0.6) / len(k)))))
    ganti = [round(0.2 + i * langkah, 3) for i in range(len(k))]
    _cukup(e, ganti[-1] + 1.5, dur, "kurangi konten / kecilkan 'ganti'")
    return {"ganti": ganti}, [(t, "dinding-ganti", f"ganti{i}") for i, t in enumerate(ganti)]


def _ui_world(e, an, p, dur):
    if not e.get("judul"):
        raise GagalPipeline(f"{e['_id']}: ui-world butuh 'judul' (panel utama).")
    tiba = round(max(1.8, dur - 1.6), 3)
    return {"tiba": tiba}, [(0.05, "ui-dolly", "dolly"), (tiba, "ui-tiba", "tiba")]


def _paper(e, an, p, dur):
    if not e.get("judul"):
        raise GagalPipeline(f"{e['_id']}: paper-cut butuh 'judul'.")
    lapis = [0.1, 0.3, 0.5, 0.7]
    kartu = 1.3
    _cukup(e, kartu + 1.5, dur, "perpanjang elemen")
    return ({"lapis": lapis, "kartu": kartu},
            [(t, "paper-lapis", f"lapis{i}") for i, t in enumerate(lapis)] + [(kartu, "paper-kartu", "kartu")])


# ---------------------------------------------------------------- E31 judul-gaya
def _judul_gaya(e, an, p, dur):
    teks = _polos(e.get("teks")).replace("\n", "")
    if not teks:
        raise GagalPipeline(f"{e['_id']}: judul-gaya butuh 'teks'.")
    masuk = e.get("masuk_gaya") or p.t("motif.judul.masuk", "fade")
    huruf, selesai = [], an["d_in"]
    if masuk == "ketik":
        k = p.t("ketik")
        huruf = _ketik(teks, 0.15, float(e.get("cps", k["cps"]) * 1.3))
        selesai = huruf[-1] + 0.05
        _cukup(e, selesai + p.t("durasi.tahan-min") + an["d_out"], dur, "pendekkan judul / naikkan 'cps'")
    kunci = {"pop": "judul-pop", "stiker": "judul-pop", "slam": "judul-slam", "neon": "judul-neon"}.get(masuk, "judul-masuk")
    b = [(0.0 if masuk != "slam" else 0.18, kunci, "masuk")]
    b += [(t, "judul-ketik", f"huruf{i}") for i, (t, ch) in enumerate(zip(huruf, teks)) if ch != " "]
    return {"huruf": huruf, "selesai_masuk": round(selesai, 3)}, b


# ---------------------------------------------------------------- E32–E36 grafis penjelas
def _lower_third(e, an, p, dur):
    if not e.get("nama"):
        raise GagalPipeline(f"{e['_id']}: lower-third butuh 'nama' (opsional 'peran').")
    j = {"pita": 0.1, "nama": 0.35, "peran": 0.55}
    _cukup(e, 0.9 + p.t("durasi.tahan-min") + an["d_out"], dur, "perpanjang elemen")
    return j, [(0.1, "lower-pita", "pita"), (0.35, "lower-teks", "nama")]


def _langkah(e, an, p, dur):
    it = e.get("item") or []
    if not 2 <= len(it) <= 4:
        raise GagalPipeline(f"{e['_id']}: langkah butuh 'item' 2–4 langkah singkat.")
    st = min(0.6, max(0.35, (dur - 2.2) / len(it)))
    t = [round(an["d_in"] + 0.15 + i * st, 3) for i in range(len(it))]
    _cukup(e, t[-1] + 0.35 + p.t("durasi.tahan-min") + an["d_out"], dur, "kurangi langkah")
    return {"langkah": t}, [(x, "langkah-titik", f"l{i}") for i, x in enumerate(t)]


def _sebelum_sesudah(e, an, p, dur):
    if not e.get("sebelum") or not e.get("sesudah"):
        raise GagalPipeline(f"{e['_id']}: sebelum-sesudah butuh 'sebelum' dan 'sesudah'.")
    w0 = round(an["d_in"] + 0.9, 3)
    _cukup(e, w0 + 0.8 + p.t("durasi.tahan-min") + an["d_out"], dur, "perpanjang elemen")
    return {"wipe": w0, "durasi_wipe": 0.8}, [(0.0, "remotion", "masuk"), (w0 + 0.1, "wipe", "wipe")]


def _callout(e, an, p, dur):
    if e.get("x") is None or e.get("y") is None or not e.get("teks"):
        raise GagalPipeline(f"{e['_id']}: callout butuh 'x', 'y' (titik yang ditunjuk, 0–1) dan 'teks'.")
    _cukup(e, 0.9 + p.t("durasi.tahan-min") + an["d_out"], dur, "perpanjang elemen")
    return {"lingkar": 0.1, "label": 0.5}, [(0.1, "callout", "lingkar"), (0.5, "remotion", "label")]


def _linimasa(e, an, p, dur):
    tt = e.get("titik") or []
    if len(tt) < 2 or any("tahun" not in x for x in tt):
        raise GagalPipeline(f"{e['_id']}: linimasa butuh 'titik': [{{tahun, label}}, …] (≥ 2).")
    st = min(0.5, max(0.3, (dur - 2.2) / len(tt)))
    t = [round(an["d_in"] + 0.2 + i * st, 3) for i in range(len(tt))]
    _cukup(e, t[-1] + 0.35 + p.t("durasi.tahan-min") + an["d_out"], dur, "kurangi titik")
    return {"garis": round(an["d_in"], 3), "titik": t}, [(x, "langkah-titik", f"t{i}") for i, x in enumerate(t)]


# ---------------------------------------------------------------- E37 liquid-glass · E41 headline-storm · E43 growth-curve
def _liquid_glass(e, an, p, dur):
    if not e.get("judul"):
        raise GagalPipeline(f"{e['_id']}: liquid-glass butuh 'judul' (opsional 'sub', 'bentuk': pil|kartu).")
    _cukup(e, 0.7 + p.t("durasi.tahan-min") + an["d_out"], dur, "perpanjang elemen")
    return {"morf": 0.05}, [(0.05, "kaca-masuk", "morf")]


def _headline_storm(e, an, p, dur):
    h = e.get("judul_judul") or []
    if len(h) < 3 or not e.get("utama"):
        raise GagalPipeline(f"{e['_id']}: headline-storm butuh 'judul_judul' (≥ 3) dan 'utama' (judul yang menghentak).")
    n = int(e.get("jumlah", 16))
    utama = round(max(1.6, dur - 1.6), 3)
    jeda = (utama - 0.4) / n
    pot = [round(0.1 + i * jeda, 3) for i in range(n)]
    _cukup(e, utama + 1.2, dur, "perpanjang elemen")
    return ({"potongan": pot, "utama": utama},
            [(t, "headline-jatuh", f"p{i}") for i, t in enumerate(pot) if i % 3 == 0] + [(utama, "ui-tiba", "utama")])


def _growth_curve(e, an, p, dur):
    if not isinstance(e.get("ke"), (int, float)):
        raise GagalPipeline(f"{e['_id']}: growth-curve butuh 'ke' (nilai akhir; opsional dari, akhiran, tonggak[], label_x, catatan).")
    g0, dg = round(an["d_in"] + 0.2, 3), float(e.get("durasi_gambar", 2.0))
    catatan = round(g0 + dg + 0.3, 3)
    _cukup(e, (catatan if e.get("catatan") else g0 + dg) + p.t("durasi.tahan-min") + an["d_out"], dur, "kecilkan 'durasi_gambar'")
    b = [(0.0, "remotion", "masuk")] + [(g0 + dg * tg.get("x", 0), "chart-batang", f"t{i}") for i, tg in enumerate(e.get("tonggak", []))]
    b.append((g0 + dg, "chart-selesai", "selesai"))
    return {"gambar": g0, "durasi_gambar": dg, "catatan": catatan}, b


def _gabung(*bagian) -> str:
    return " ".join(_polos(x) for x in bagian if x)


PERANGKAT: dict[str, Spek] = {
    "PromptUI": Spek(_prompt, lambda e: _gabung(e.get("label"), e.get("teks")), posisi="atas", jendela=False),
    "Penghitung": Spek(_hitung, lambda e: _gabung(e.get("judul"), e.get("sub"), str(e.get("ke")), e.get("label")),
                       {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder", "aksen"]}),
    "Terminal": Spek(_terminal, lambda e: _gabung(e.get("judul"), e.get("perintah"), *e.get("keluaran", [])),
                     {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder", "aksen"]}),
    "Coret": Spek(_coret, lambda e: _gabung(e.get("judul"), e.get("teks")),
                  {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder"]}),
    "Timeline": Spek(_timeline, lambda e: _gabung(e.get("judul"), *[t["nama"] for t in e.get("trek") or TREK_DEFAULT],
                                                  *e.get("chip", []), e.get("catatan")),
                     {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder", "aksen"]}),
    "GridVariasi": Spek(_grid, lambda e: _gabung(e.get("judul"), e.get("dari_label"), str(e.get("ke")), e.get("label")),
                        {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder", "aksen"]}),
    "FormGanti": Spek(_form, lambda e: _gabung(e.get("judul"), *[f"{r['label']} {r['baru']}" for r in e.get("baris", [])]),
                      {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder", "aksen"]}),
    "Partikel": Spek(_partikel, lambda e: "", {"ukuran": [], "warna": []}, jendela=False, dekoratif=True),
    "AksenGaya": Spek(_aksen_gaya, lambda e: "", {"ukuran": [], "warna": []}, jendela=False, dekoratif=True),
    "ChartGrow": Spek(_chart, lambda e: _gabung(e.get("judul"), *[str(v) for v in e.get("nilai", [])], *e.get("label", []),
                                                e.get("catatan")),
                      {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder", "aksen"]}),
    "GlassType": Spek(_glass_type, lambda e: _polos(e.get("teks")), {"ukuran": ["judul"], "warna": []},
                      jendela=False, kaca=True, panel=False),
    "CoverStory": Spek(_cover, lambda e: _gabung(e.get("masthead") if e.get("bagian") != "isi" else "",
                                                 e.get("judul_utama"), *e.get("baris", []), e.get("edisi")),
                       {"ukuran": ["isi"], "warna": ["@terang"]}, jendela=False, panel=False, scrim=0.6),
    "DoodleBoil": Spek(_doodle, lambda e: _gabung(*[a.get("teks") for a in e.get("anotasi", [])]),
                       {"ukuran": ["subjudul"], "warna": []}, jendela=False, dekoratif=True, panel=False),
    "JudulGaya": Spek(_judul_gaya, lambda e: _polos(e.get("teks")), {"ukuran": ["judul"], "warna": ["teks-utama", "aksen"]},
                      posisi="atas", jendela=False),
    "LowerThird": Spek(_lower_third, lambda e: _gabung(e.get("nama"), e.get("peran")), {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder"]}),
    "Langkah": Spek(_langkah, lambda e: _gabung(*e.get("item", [])), {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder"]}, posisi="atas"),
    "SebelumSesudah": Spek(_sebelum_sesudah, lambda e: _gabung(e.get("sebelum"), e.get("sesudah")),
                           {"ukuran": ["isi"], "warna": ["teks-utama", "aksen"]}),
    "Callout": Spek(_callout, lambda e: _polos(e.get("teks")), {"ukuran": ["isi"], "warna": ["teks-utama"]}),
    "Linimasa": Spek(_linimasa, lambda e: _gabung(*[f"{x.get('tahun')} {x.get('label', '')}" for x in e.get("titik", [])]),
                     {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder", "aksen"]}),
    "LiquidGlass": Spek(_liquid_glass, lambda e: _gabung(e.get("judul"), e.get("sub")), {"ukuran": ["isi"], "warna": ["teks-utama", "aksen"]},
                        posisi="atas", jendela=False, lensa=True),
    "HeadlineStorm": Spek(_headline_storm, lambda e: _gabung(*e.get("judul_judul", []), e.get("utama")), cutaway=True),
    "GrowthCurve": Spek(_growth_curve, lambda e: _gabung(e.get("judul"), str(e.get("ke")), e.get("catatan")),
                        {"ukuran": ["isi"], "warna": ["teks-utama", "teks-sekunder", "aksen"]}),
    "HeadlineWall": Spek(_headline, lambda e: _gabung(*e.get("judul_judul", [])), cutaway=True),
    "Orbit": Spek(_orbit, lambda e: _gabung(e.get("pusat"), e.get("sub"), *e.get("satelit", [])), cutaway=True),
    "CouchWall": Spek(_couch, lambda e: _gabung(*[f"{k.get('judul')} {k.get('sub', '')}" for k in e.get("konten", [])]), cutaway=True),
    "UIWorld": Spek(_ui_world, lambda e: _gabung(e.get("judul"), e.get("sub")), cutaway=True),
    "PaperCut": Spek(_paper, lambda e: _gabung(e.get("judul"), e.get("sub")), cutaway=True),
}


# ---------------------------------------------------------------- koreografi (K09)
def kunci_perangkat(e: dict, bukan: list[str]) -> str | None:
    """Identitas perangkat sebuah elemen (beat-sheet atau catatan layout) untuk aturan ritme K09; None = bukan perangkat."""
    tipe = e.get("tipe")
    if tipe in bukan or e.get("induk") or tipe in ("caption", "sfx") or e.get("judul") is True:  # judul-gaya = judul
        return None
    if tipe in ("remotion", "kamera", "cutaway"):
        return str(e.get("efek") or e.get("_efek") or e.get("komposisi") or tipe).partition("@")[0]
    if tipe == "chip":
        return f"chip-{e.get('status', 'info')}"
    return tipe


def cek_ritme(beats: list[tuple[str, list[dict]]], bukan: list[str], fungsi_ok: list[str], variasi_min: int) -> dict:
    """beats = [(id_beat, [elemen…])] berurutan → {aturan: (lulus, [pesan])} untuk K09.1–K09.4."""
    hasil, per_beat = {}, []
    for bid, el in beats:
        per_beat.append((bid, {k for e in el if (k := kunci_perangkat(e, bukan))}))
    ulang = [f"{a[0]} → {b[0]}: {', '.join(sorted(a[1] & b[1]))}" for a, b in zip(per_beat, per_beat[1:]) if a[1] & b[1]]
    hasil["K09.1"] = (not ulang, ulang or [f"{len(per_beat)} beat tanpa perangkat berulang berurutan"])
    semua = set().union(*[k for _, k in per_beat]) if per_beat else set()
    hasil["K09.2"] = (len(semua) >= variasi_min, [f"{len(semua)} perangkat berbeda (min {variasi_min}): {', '.join(sorted(semua))}"])
    tr = []
    for bid, el in beats:
        n = sum(1 for e in el if e.get("tipe") == "transisi")
        if n and bid == "hook":
            tr.append(f"{bid}: transisi di hook")
        if n > 1:
            tr.append(f"{bid}: {n} transisi")
    hasil["K09.3"] = (not tr, tr)
    tanpa = [f"{bid}: {kunci_perangkat(e, bukan)}" for bid, el in beats for e in el
             if kunci_perangkat(e, bukan) and e.get("fungsi") not in fungsi_ok]
    hasil["K09.4"] = (not tanpa, [f"tanpa/ salah 'fungsi': {', '.join(tanpa)}"] if tanpa else [])
    return hasil
