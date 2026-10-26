"""beat — memuat beat-sheet.json dan me-resolve waktu (angka detik atau anchor kata).

Format waktu di beat-sheet:
    1.25                                   → detik absolut di timeline akhir
    {"kata": "sertifikat"}                 → awal kemunculan pertama kata itu
    {"kata": "sertifikat", "ke": 2, "ujung": "selesai", "offset": -0.1}
    {"beat": "hook", "ujung": "selesai"}   → batas beat lain

Elemen tanpa mulai/selesai mewarisi batas beat-nya.
"""
from __future__ import annotations

import copy
import re

from sistem import GagalPipeline, Proyek, baca_json, resolve

TIPE_TEKS = {"judul", "teks", "kartu", "cta", "depth", "info", "chip"}
TIPE_SEMUA = TIPE_TEKS | {"gambar", "broll", "push", "sfx", "remotion", "transisi", "latar", "kamera"}


def norm(kata: str) -> str:
    return re.sub(r"[^\w]", "", kata.lower())


def muat_words(p: Proyek) -> dict | None:
    return baca_json(p.words_path) if p.words_path.exists() else None


class Waktu:
    def __init__(self, words: dict | None, beats: list[dict]):
        self.kata = (words or {}).get("kata", [])
        self.beats = {b["id"]: b for b in beats}

    def __call__(self, v, konteks: str):
        if v is None or isinstance(v, (int, float)):
            return v
        if not isinstance(v, dict):
            raise GagalPipeline(f"{konteks}: format waktu tidak dikenal: {v!r}")
        off = float(v.get("offset", 0))
        ujung = v.get("ujung", "mulai")
        if "kata" in v:
            if not self.kata:
                raise GagalPipeline(f"{konteks}: anchor kata {v['kata']!r} butuh cache/words.json (jalankan transkrip).")
            target, ke = norm(v["kata"]), int(v.get("ke", 1))
            cocok = [w for w in self.kata if norm(w["w"]) == target]
            if len(cocok) < ke:
                raise GagalPipeline(f"{konteks}: kata {v['kata']!r} ke-{ke} tidak ada di transkrip ({len(cocok)} ditemukan).")
            w = cocok[ke - 1]
            return round((w["e"] if ujung == "selesai" else w["s"]) + off, 3)
        if "beat" in v:
            b = self.beats.get(v["beat"])
            if not b:
                raise GagalPipeline(f"{konteks}: beat {v['beat']!r} tidak ada.")
            return round(self(b["selesai" if ujung == "selesai" else "mulai"], konteks) + off, 3)
        raise GagalPipeline(f"{konteks}: waktu dict harus punya 'kata' atau 'beat'.")


def muat(p: Proyek, durasi_video: float | None = None) -> dict:
    """Beat-sheet dengan semua waktu sudah berupa detik. Tambah field: _id, _beat, _anchor."""
    bs = copy.deepcopy(baca_json(p.beat_sheet_path))
    beats = bs.get("beats", [])
    if not beats:
        raise GagalPipeline("beat-sheet.json tidak punya beats.")
    words = muat_words(p)
    wkt = Waktu(words, beats)
    for i, b in enumerate(beats):
        if "id" not in b:
            raise GagalPipeline(f"beat ke-{i + 1} tidak punya id.")
        b["_anchor_mulai"] = isinstance(b.get("mulai"), dict)
        b["mulai"] = wkt(b.get("mulai", beats[i - 1]["selesai"] if i else 0.0), f"beat {b['id']}.mulai")
        if b.get("selesai") is None:
            b["selesai"] = beats[i + 1]["mulai"] if i + 1 < len(beats) else durasi_video
        b["selesai"] = wkt(b["selesai"], f"beat {b['id']}.selesai")
        if b["selesai"] is None:
            raise GagalPipeline(f"beat {b['id']}: selesai tidak bisa ditentukan.")
    for b in beats:
        for j, e in enumerate(b.get("elemen", [])):
            tipe = e.get("tipe")
            if tipe not in TIPE_SEMUA:
                raise GagalPipeline(f"beat {b['id']} elemen {j}: tipe {tipe!r} tidak dikenal ({', '.join(sorted(TIPE_SEMUA))}).")
            k = f"beat {b['id']} elemen {j} ({tipe})"
            if e.get("efek"):
                try:
                    e["_efek"] = resolve("efek", e["efek"]).ref
                except GagalPipeline as ex:
                    raise GagalPipeline(f"{k}: {ex}") from ex
            e["_id"] = f"{b['id']}/{j}-{tipe}"
            e["_beat"] = b["id"]
            e["_anchor"] = isinstance(e.get("mulai"), dict)
            e["_anchor_spek"] = e.get("mulai") if e["_anchor"] else None
            e["mulai"] = wkt(e.get("mulai", b["mulai"]), k + ".mulai")
            if "durasi" in e and e.get("selesai") is None:
                e["selesai"] = e["mulai"] + float(e["durasi"])
            e["selesai"] = wkt(e.get("selesai", b["selesai"]), k + ".selesai")
            if tipe != "sfx" and e["selesai"] <= e["mulai"]:
                raise GagalPipeline(f"{k}: selesai ({e['selesai']}) ≤ mulai ({e['mulai']}).")
    cap = bs.setdefault("caption", {})
    cap.setdefault("aktif", True)
    kecuali = []
    for item in cap.get("kecuali", []):  # [mulai, selesai] atau id beat
        if isinstance(item, str):
            if item not in wkt.beats:
                raise GagalPipeline(f"caption.kecuali: beat {item!r} tidak ada.")
            kecuali.append([wkt.beats[item]["mulai"], wkt.beats[item]["selesai"]])
        else:
            kecuali.append([wkt(item[0], "caption.kecuali"), wkt(item[1], "caption.kecuali")])
    cap["kecuali"] = kecuali
    bs["_words"] = words
    return bs


def semua_elemen(bs: dict) -> list[dict]:
    return [e for b in bs["beats"] for e in b.get("elemen", [])]
