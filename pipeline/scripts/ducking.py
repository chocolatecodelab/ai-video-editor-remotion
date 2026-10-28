"""ducking — auto-ducking musik latar dari transkrip: musik turun `db` selama talent bicara dan naik lagi di jeda.

Lebih rapi daripada sidechaincompress saja: kedalaman pasti (tidak bergantung keras-pelan suara), turun SEBELUM kata
pertama (pra-gulung) sehingga konsonan awal tidak tertutup musik, dan jeda pendek antar-kata tidak membuat musik
"memompa". Hasilnya ekspresi `volume` ffmpeg per frame — dipakai render_audio.py (beat-sheet) dan split.py.

Konfigurasi (musik di manifest/split.json):
    "ducking": {"mode": "transkrip", "db": -9, "pra": 0.12, "pasca": 0.35, "jeda_min": 0.6, "rampa": 0.18}
    mode: "transkrip" (bawaan bila ada words.json) | "sidechain" (cara lama) | "mati"
"""
from __future__ import annotations

BAWAAN = {"mode": "transkrip", "db": -9.0, "pra": 0.12, "pasca": 0.35, "jeda_min": 0.6, "rampa": 0.18}


def konfigurasi(musik: dict | None) -> dict:
    """Gabung `musik.ducking` dengan bawaan; `"ducking": false` → mode mati."""
    d = (musik or {}).get("ducking", {})
    if d is False:
        return {**BAWAAN, "mode": "mati"}
    return {**BAWAAN, **(d if isinstance(d, dict) else {})}


def segmen_bicara(kata: list[dict], durasi: float, pra: float = BAWAAN["pra"], pasca: float = BAWAAN["pasca"],
                  jeda_min: float = BAWAAN["jeda_min"]) -> list[tuple[float, float]]:
    """Kata transkrip [{s, e}] → selang bicara [(mulai, selesai)] yang sudah diberi pra/pasca-gulung. Jeda antar-kata
    lebih pendek dari `jeda_min` digabung (musik tidak naik-turun di tengah kalimat)."""
    hasil: list[list[float]] = []
    for k in sorted(kata, key=lambda x: x["s"]):
        a, b = max(0.0, float(k["s"]) - pra), min(durasi, float(k["e"]) + pasca)
        if hasil and a - hasil[-1][1] < jeda_min:
            hasil[-1][1] = max(hasil[-1][1], b)
        else:
            hasil.append([a, b])
    return [(round(a, 3), round(b, 3)) for a, b in hasil if b > a]


def ekspresi_gain(segmen: list[tuple[float, float]], rampa: float = BAWAAN["rampa"]) -> str:
    """Ekspresi ffmpeg 0..1 = seberapa dalam musik di-duck pada waktu t (rampa linear `rampa` detik di tiap sisi)."""
    if not segmen:
        return "0"
    r = max(0.01, rampa)
    bagian = [f"min(clip((t-{a - r:.3f})/{r:.3f},0,1),clip(({b + r:.3f}-t)/{r:.3f},0,1))" for a, b in segmen]
    eks = bagian[0]
    for x in bagian[1:]:
        eks = f"max({eks},{x})"
    return eks


def filter_ducking(kata: list[dict], durasi: float, cfg: dict) -> str:
    """Filter ffmpeg untuk rantai musik: `volume='pow(10, db·g(t)/20)':eval=frame`. Kosong bila tidak ada bicara."""
    seg = segmen_bicara(kata, durasi, cfg["pra"], cfg["pasca"], cfg["jeda_min"])
    if not seg:
        return ""
    return f"volume='pow(10,{float(cfg['db']):.2f}*({ekspresi_gain(seg, cfg['rampa'])})/20)':eval=frame"


def gain_db(t: float, segmen: list[tuple[float, float]], db: float, rampa: float = BAWAAN["rampa"]) -> float:
    """Padanan Python ekspresi_gain (untuk test & QA): gain musik dalam dB pada detik t."""
    r = max(0.01, rampa)
    g = max((min(min(max((t - (a - r)) / r, 0), 1), min(max(((b + r) - t) / r, 0), 1)) for a, b in segmen), default=0)
    return db * g
