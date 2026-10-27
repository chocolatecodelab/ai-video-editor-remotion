"""zoom_potong — E55: zoom cut otomatis pada talking-head. Bingkai lebar ↔ rapat bergantian per kalimat, dipotong
tepat di awal kata pertama kalimat (seperti dua kamera). Kalimat pendek digabung dengan kalimat berikutnya. Bingkai
berakhir saat cutaway, efek kamera, transisi, teks depth, PiP atau push manual dimulai; sesudahnya bingkai rapat."""
from __future__ import annotations

AKHIR_KALIMAT = (".", "?", "!")
JEDA_GABUNG = 1.0  # kalimat pendek digabung dengan kalimat berikutnya bila jaraknya ≤ ini (detik)


def kalimat(kata: list[dict], jeda: float) -> list[tuple[float, float]]:
    """words.json → [(mulai, selesai)] per kalimat: pecah di tanda akhir kalimat atau jeda > `jeda` detik."""
    grup, cur = [], []
    for w in kata:
        if cur and (w["s"] - cur[-1]["e"] > jeda or cur[-1]["w"].rstrip("\"')”").endswith(AKHIR_KALIMAT)):
            grup.append(cur)
            cur = []
        cur.append(w)
    if cur:
        grup.append(cur)
    return [(g[0]["s"], g[-1]["e"]) for g in grup]


def satuan(kal: list[tuple[float, float]], kalimat_min: float) -> list[tuple[float, float]]:
    """Kalimat < `kalimat_min` detik digabung dengan kalimat sesudahnya ("Keep learning. Keep growing." = satu bingkai)."""
    out: list[tuple[float, float]] = []
    for a, z in kal:
        if out and out[-1][1] - out[-1][0] < kalimat_min and a - out[-1][1] <= JEDA_GABUNG:
            out[-1] = (out[-1][0], z)
        else:
            out.append((a, z))
    return out


def rencana(kata: list[dict], blok: list[tuple[float, float]], dur: float, jeda: float,
            kalimat_min: float) -> list[tuple[float, float]]:
    """→ rentang bingkai rapat [(mulai, selesai)]. Rentang berakhir di awal satuan berikutnya atau awal blok."""
    sat = satuan([k for k in kalimat([w for w in kata if w["w"].strip()], jeda) if k[0] < dur], kalimat_min)
    hasil: list[tuple[float, float]] = []
    rapat = True  # satuan layak pertama → lebar
    for i, (a, z) in enumerate(sat):
        if any(ba <= a < bz for ba, bz in blok):
            rapat = False  # sesudah cutaway/efek → mulai dari bingkai rapat
            continue
        akhir = sat[i + 1][0] if i + 1 < len(sat) else min(dur, z + 0.3)
        klip = min([akhir] + [ba for ba, _ in blok if a < ba < akhir])
        if min(z, klip) - a >= kalimat_min:
            rapat = not rapat
            if rapat:
                hasil.append((round(a, 3), round(klip, 3)))
        if klip < akhir:
            rapat = False
    return hasil
