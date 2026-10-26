"""pasang — tempelkan beat-sheet dari preset (detik contoh) ke rekaman nyata: anchor kata otomatis + hindari wajah.

Pemakaian:
    python pasang.py <folder-proyek> [--kering]

Butuh: cache/words.json (transkrip). Opsional: cache/wajah.json (video.py wajah) untuk menghindari wajah.
Langkah:
  1. Timeline contoh koreografi [0, N] dipetakan ke durasi rekaman [0, D].
  2. Batas beat → jeda antar kata terdekat (diutamakan jeda panjang / akhir kalimat) → anchor {"kata", "ke"}.
  3. Mulai elemen → awal kata terdekat di dalam beat (anchor kata); selesai = batas beat atau akhir kata.
  4. Transisi di awal beat → anchor {"beat": id}. Beat terakhir selesai = akhir video.
  5. Posisi elemen (atas/tengah) yang diperkirakan menutupi wajah dipindah ke posisi yang paling sedikit menutupi.
  6. Tiap beat diberi "_ucapan" (teks transkrip di rentang beat) + "_kata_kunci" → bahan untuk mengisi teks perangkat.
Beat-sheet lama disalin ke beat-sheet.sebelum-pasang.json. Hasil tetap perlu ditinjau (storyboard).
"""
from __future__ import annotations

import argparse
import copy
import re
import shutil

import beat as modul_beat
from sistem import GagalPipeline, Proyek, baca_json, durasi, frontmatter, log, main_aman, resolve, tulis_json

AKHIR_KALIMAT = re.compile(r"[.!?…]$")
STOP = set("yang dan di ke dari ini itu untuk dengan pada adalah juga kamu aku saya kita the a an and to of in is it you i that this "
           "for on with be are was so but just like your my we they".split())
TINGGI_KIRA = {"chip": 0.07, "cta": 0.07, "info": 0.14, "judul": 0.12, "teks": 0.1, "kartu": 0.28, "remotion": 0.26}


def _ke(kata: list[dict], i: int) -> int:
    n = modul_beat.norm(kata[i]["w"])
    return sum(1 for w in kata[: i + 1] if modul_beat.norm(w["w"]) == n)


def _anchor(kata, i, ujung="mulai", offset=0.0):
    a = {"kata": modul_beat.norm(kata[i]["w"]) or kata[i]["w"], "ke": _ke(kata, i)}
    if ujung != "mulai":
        a["ujung"] = ujung
    if offset:
        a["offset"] = round(offset, 2)
    return a


def _jeda_terbaik(kata, target, jendela, bawah, atas):
    """Indeks kata i sehingga batas di antara kata i-1 dan i paling cocok untuk target (detik)."""
    terbaik, skor_terbaik = None, None
    for i in range(1, len(kata)):
        tengah = (kata[i - 1]["e"] + kata[i]["s"]) / 2
        if not bawah < tengah < atas or abs(tengah - target) > jendela:
            continue
        jeda = kata[i]["s"] - kata[i - 1]["e"]
        bonus = 0.8 if AKHIR_KALIMAT.search(kata[i - 1]["w"]) else 0.0
        skor = abs(tengah - target) - 2.0 * min(jeda, 0.8) - bonus
        if skor_terbaik is None or skor < skor_terbaik:
            terbaik, skor_terbaik = i, skor
    return terbaik


def _kata_dekat(kata, t, a, z, maks=0.7):
    c = [(abs(w["s"] - t), i) for i, w in enumerate(kata) if a - 1e-3 <= w["s"] < z]
    c = [x for x in c if x[0] <= maks]
    return min(c)[1] if c else None


def _durasi_maks(e: dict) -> float | None:
    """Batas atas durasi dari frontmatter modul efek elemen (None = mengikuti narasi)."""
    if not e.get("efek") or e.get("tipe") == "transisi":
        return None
    try:
        d = frontmatter(resolve("efek", e["efek"]).path)[0].get("durasi")
    except GagalPipeline:
        return None
    return float(d[1]) if d else None


def _wajah_median(wajah, a, z):
    k = [x["kotak"] for x in (wajah or {}).get("bingkai", []) if x["kotak"] and a <= x["t"] <= z]
    if not k:
        return None
    k.sort(key=lambda b: (b[1] + b[3]) / 2)
    return k[len(k) // 2]


def _pita(p: Proyek, e: dict, posisi: str) -> tuple[float, float]:
    """Perkiraan rentang vertikal (0–1) elemen di posisi tertentu (sebelum render; tinggi kira-kira per tipe)."""
    zx0, zy0, zx1, zy1 = p.zona_aman()
    h = TINGGI_KIRA.get(e.get("tipe"), 0.15)
    a, z = zy0 / p.H, zy1 / p.H
    geser = p.px(e.get("geser_y", 0)) / p.H
    if posisi == "atas":
        return a + geser, a + geser + h
    if posisi == "bawah":
        return z - h + geser, z + geser
    m = (a + z) / 2 + geser
    return m - h / 2, m + h / 2


def pasang(p: Proyek, kering: bool = False) -> dict:
    if not p.words_path.exists():
        raise GagalPipeline("cache/words.json belum ada — jalankan transkrip dulu.")
    kata = baca_json(p.words_path)["kata"]
    if len(kata) < 4:
        raise GagalPipeline("transkrip terlalu pendek untuk dipasang otomatis.")
    wajah = baca_json(p.cache / "wajah.json") if (p.cache / "wajah.json").exists() else None
    bs = baca_json(p.beat_sheet_path)
    beats = bs["beats"]
    if any(not isinstance(b.get("mulai", 0), (int, float)) for b in beats):
        raise GagalPipeline("beat-sheet sudah memakai anchor — pasang hanya untuk beat-sheet berdetik dari preset.")
    D = durasi(p.ingest_video) if p.ingest_video.exists() else kata[-1]["e"] + 0.5
    N = float(beats[-1].get("selesai") or max(e.get("selesai", 0) for b in beats for e in b.get("elemen", []) if isinstance(e.get("selesai"), (int, float))))
    k = D / N
    log("pasang", f"timeline contoh {N:.1f} s → rekaman {D:.1f} s (×{k:.2f}), {len(kata)} kata")
    tdur = p.template_fm.get("durasi")
    if tdur and not tdur[0] - 3 <= D <= tdur[1] + 3:
        log("pasang", f"PERINGATAN: rekaman {D:.1f} s di luar durasi template {tdur[0]}–{tdur[1]} s (T.2) — potong rekaman "
                      f"(manifest aset.potong) atau pilih preset dengan template lain.")
    lama = copy.deepcopy(beats)
    # hook mempertahankan panjang contohnya (aturan template: hook pendek); beat lain berbagi sisa rekaman
    h0 = float(beats[1]["mulai"]) if len(beats) > 1 else N
    k_sisa = (D - h0) / max(1e-3, N - h0)
    peta = lambda t: t if t <= h0 else h0 + (t - h0) * k_sisa  # noqa: E731
    batas = [0.0]
    for bi in range(1, len(beats)):
        target = peta(float(beats[bi]["mulai"]))
        jendela = 0.8 if bi == 1 else max(1.5, 0.25 * (float(beats[bi].get("selesai", N)) - float(beats[bi]["mulai"])) * k_sisa)
        atas = target + 0.01 if bi == 1 else D - 1.0  # akhir hook tidak boleh melewati panjang contohnya (T.3)
        i = _jeda_terbaik(kata, target, jendela, batas[-1] + 1.2, atas)
        if i is None:
            batas.append(round(max(batas[-1] + 1.2, target), 3))
            beats[bi]["mulai"] = batas[-1]
        else:
            batas.append(kata[i]["s"])
            beats[bi]["mulai"] = _anchor(kata, i)
    batas.append(D)
    perubahan = []
    for bi, b in enumerate(beats):
        a0, z0 = float(lama[bi]["mulai"]), float(lama[bi].get("selesai") or N)
        a1, z1 = batas[bi], batas[bi + 1]
        b.pop("selesai", None)
        sk = (z1 - a1) / max(1e-3, z0 - a0)
        ucapan = [w for w in kata if a1 <= w["s"] < z1]
        b["_ucapan"] = " ".join(w["w"] for w in ucapan)
        kunci = [w["w"].strip(".,!?") for w in ucapan if any(c.isdigit() for c in w["w"]) or
                 (len(w["w"]) >= 7 and modul_beat.norm(w["w"]) not in STOP)]
        b["_kata_kunci"] = list(dict.fromkeys(kunci))[:6]
        for e in b.get("elemen", []):
            m = e.get("mulai")
            if e.get("tipe") == "transisi":
                e["mulai"] = {"beat": b["id"]}
                continue
            t_m = a1
            if isinstance(m, (int, float)):
                t = a1 + (float(m) - a0) * sk
                i = _kata_dekat(kata, t, a1, z1)
                t_m = kata[i]["s"] if i is not None and abs(kata[i]["s"] - a1) > 0.05 else t
                e["mulai"] = _anchor(kata, i) if i is not None and abs(kata[i]["s"] - a1) > 0.05 else round(t, 3)
                if i is not None and abs(kata[i]["s"] - a1) <= 0.05:
                    e["mulai"] = {"beat": b["id"], "offset": round(max(0.0, t - a1), 2)} if t - a1 > 0.05 else {"beat": b["id"]}
            s = e.get("selesai")
            maks = _durasi_maks(e)
            if isinstance(s, (int, float)):
                if abs(float(s) - z0) < 0.05 and not maks:
                    e.pop("selesai", None)  # = akhir beat
                else:
                    # durasi elemen dipertahankan (bukan diregangkan) — rentang durasi modul efek tetap terpenuhi
                    d0 = float(s) - (float(m) if isinstance(m, (int, float)) else a0)
                    if abs(float(s) - z0) < 0.05:
                        d0 = max(d0, d0 * sk)
                    if maks:
                        d0 = min(d0, maks)
                    d0 = min(d0, z1 - t_m - 0.05)
                    e.pop("selesai", None)
                    e["durasi"] = round(d0, 2)
                    e["_t"] = (t_m, t_m + d0)
            # hindari wajah: pindah posisi bila perkiraan pita menutupi wajah
            ada_latar = any(x.get("tipe") == "latar" for x in b.get("elemen", []))  # cutaway kaca: wajah sudah tertutup
            if wajah and not ada_latar and e.get("posisi") in ("atas", "tengah") and e.get("tipe") in TINGGI_KIRA and "y" not in e:
                fk = _wajah_median(wajah, a1, z1)
                if fk:
                    def tutup(pos, e=e, fk=fk):
                        pa, pz = _pita(p, e, pos)
                        return max(0.0, min(pz, fk[3]) - max(pa, fk[1])) / max(1e-3, fk[3] - fk[1])
                    pilihan = sorted(("atas", "tengah"), key=tutup)
                    if tutup(e["posisi"]) > 0.1 and pilihan[0] != e["posisi"] and tutup(pilihan[0]) < tutup(e["posisi"]):
                        perubahan.append(f"{b['id']}/{e.get('tipe')}: posisi {e['posisi']} → {pilihan[0]} (wajah)")
                        e["posisi"] = pilihan[0]
    for b in beats:  # latar kaca (cutaway) harus menaungi perangkat yang dimulai di dalamnya sampai selesai
        for lt in [x for x in b.get("elemen", []) if x.get("tipe") == "latar" and "_t" in x]:
            a0, z0 = lt["_t"]
            akhir = max([x["_t"][1] for x in b["elemen"] if x is not lt and "_t" in x and a0 - 0.1 <= x["_t"][0] <= z0] + [z0])
            lt["durasi"] = round(akhir - a0 + 0.05, 2)
        for x in b.get("elemen", []):
            x.pop("_t", None)
    bs["_pasang"] = {"skala": round(k, 3), "durasi_rekaman": round(D, 2), "durasi_contoh": N, "wajah": bool(wajah),
                     "perubahan_posisi": perubahan}
    for b in beats:
        log("pasang", f"{b['id']:12} mulai {b['mulai']!s:42.42}  ucapan: {b['_ucapan'][:60]}")
    for x in perubahan:
        log("pasang", x)
    if not kering:
        shutil.copy(p.beat_sheet_path, p.dir / "beat-sheet.sebelum-pasang.json")
        tulis_json(p.beat_sheet_path, bs)
        log("pasang", "beat-sheet.json diperbarui (salinan: beat-sheet.sebelum-pasang.json). Ganti teks contoh sesuai _ucapan, "
                      "lalu storyboard.")
    return bs


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--kering", action="store_true", help="tampilkan hasil tanpa menulis")
    a = ap.parse_args()
    pasang(Proyek(a.proyek), a.kering)
    return 0


if __name__ == "__main__":
    main_aman(main)
