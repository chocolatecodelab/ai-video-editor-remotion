"""transkrip — transkrip dengan timestamp per kata, di-cache ke cache/words.json.

Pemakaian:
    python transkrip.py <folder-proyek> [--paksa] [--backend whisperx|faster-whisper|whisper]
    python transkrip.py <folder-proyek> --srt        # hanya tulis ulang words.srt dari words.json

Input  : cache/audio.wav (hasil ingest)
Output : cache/words.json  {"_meta": {...}, "kata": [{"w","s","e","p"}]}
         cache/words.srt   (untuk dicek/koreksi di editor teks)
Aturan : K01.1, K01.2

Koreksi manual: edit cache/words.json langsung (teks & waktu), lalu set "_meta.dikoreksi": true.
Bila audio berubah (atau --paksa) setelah dikoreksi, hasil baru ditulis ke words.baru.json — koreksi lama TIDAK ditimpa.
"""
from __future__ import annotations

import argparse
import importlib.util

from sistem import GagalPipeline, Proyek, baca_json, log, main_aman, sha_file, tulis_json

BACKENDS = ["whisperx", "faster-whisper", "whisper"]
MODUL = {"whisperx": "whisperx", "faster-whisper": "faster_whisper", "whisper": "whisper"}


def _ada(backend: str) -> bool:
    return importlib.util.find_spec(MODUL[backend]) is not None


def _whisperx(audio: str, model: str, bahasa: str) -> list[dict]:
    import torch
    import whisperx
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    m = whisperx.load_model(model, dev, compute_type="float16" if dev == "cuda" else "int8", language=bahasa)
    a = whisperx.load_audio(audio)
    hasil = m.transcribe(a, batch_size=16, language=bahasa)
    align, meta = whisperx.load_align_model(language_code=bahasa, device=dev)
    hasil = whisperx.align(hasil["segments"], align, meta, a, dev, return_char_alignments=False)
    kata = []
    for seg in hasil["segments"]:
        for w in seg.get("words", []):
            if "start" in w:  # angka/simbol kadang tak ter-align
                kata.append({"w": w["word"].strip(), "s": round(w["start"], 3), "e": round(w["end"], 3),
                             "p": round(w.get("score", 0), 3)})
    return kata


def _faster(audio: str, model: str, bahasa: str) -> list[dict]:
    from faster_whisper import WhisperModel
    m = WhisperModel(model, compute_type="int8")
    segs, _ = m.transcribe(audio, language=bahasa, word_timestamps=True, vad_filter=True)
    return [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)}
            for s in segs for w in (s.words or [])]


def _whisper(audio: str, model: str, bahasa: str) -> list[dict]:
    import whisper
    m = whisper.load_model(model)
    r = m.transcribe(audio, language=bahasa, word_timestamps=True)
    return [{"w": w["word"].strip(), "s": round(w["start"], 3), "e": round(w["end"], 3),
             "p": round(w.get("probability", 0), 3)} for s in r["segments"] for w in s.get("words", [])]


def _srt_waktu(t: float) -> str:
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def tulis_srt(words: dict, path) -> None:
    """Satu baris SRT per ±7 kata — untuk dibaca/dikoreksi, bukan caption final."""
    kata, blok, baris = words["kata"], [], []
    for w in kata:
        baris.append(w)
        if len(baris) >= 7 or w["w"].endswith((".", "?", "!")):
            blok.append(baris)
            baris = []
    if baris:
        blok.append(baris)
    isi = [f"{i}\n{_srt_waktu(b[0]['s'])} --> {_srt_waktu(b[-1]['e'])}\n{' '.join(w['w'] for w in b)}\n"
           for i, b in enumerate(blok, 1)]
    path.write_text("\n".join(isi), encoding="utf-8")


def transkrip(p: Proyek, paksa: bool = False, backend: str | None = None) -> dict:
    audio = p.ingest_audio
    if not audio.exists():
        raise GagalPipeline("cache/audio.wav belum ada. Jalankan ingest dulu.")
    cfg = p.manifest.get("transkrip", {})
    model, bahasa = cfg.get("model", "large-v3"), cfg.get("bahasa", "id")
    sha = sha_file(audio)

    lama = baca_json(p.words_path) if p.words_path.exists() else None
    if lama and not paksa and lama["_meta"].get("audio_sha") == sha:
        log("transkrip", "cache valid (audio sama), dilewati.")
        return lama

    pilihan = [backend] if backend else ([cfg["backend"]] if cfg.get("backend") else BACKENDS)
    tersedia = [b for b in pilihan if _ada(b)]
    if not tersedia:
        raise GagalPipeline(
            "Tidak ada backend transkrip terpasang. Pasang salah satu:\n"
            "  pip install whisperx          (disarankan: forced alignment per kata)\n"
            "  pip install faster-whisper\n"
            "Atau tulis cache/words.json manual (format lihat docstring transkrip.py), set _meta.audio_sha "
            f"= \"{sha}\" dan _meta.backend = \"manual\".")
    b = tersedia[0]
    log("transkrip", f"backend {b}, model {model}, bahasa {bahasa} …")
    fn = {"whisperx": _whisperx, "faster-whisper": _faster, "whisper": _whisper}[b]
    kata = fn(str(audio), model, bahasa)
    data = {"_meta": {"audio_sha": sha, "backend": b, "model": model, "bahasa": bahasa,
                      "timestamp_per_kata": True, "dikoreksi": False}, "kata": kata}

    tujuan = p.words_path
    if lama and lama["_meta"].get("dikoreksi"):  # koreksi manual tidak pernah ditimpa (juga dengan --paksa)
        tujuan = p.cache / "words.baru.json"
        sebab = "audio berubah" if lama["_meta"].get("audio_sha") != sha else "transkrip diulang (--paksa)"
        log("transkrip", f"PERINGATAN: words.json sudah dikoreksi manual ({sebab}). "
                         f"Hasil baru ditulis ke {tujuan.name}; gabungkan koreksi lalu ganti words.json.")
    tulis_json(tujuan, data)
    tulis_srt(data, tujuan.with_suffix(".srt"))
    log("transkrip", f"{len(kata)} kata → {tujuan.relative_to(p.dir)}. Koreksi manual lalu set _meta.dikoreksi = true.")
    return data


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--paksa", action="store_true")
    ap.add_argument("--backend", choices=BACKENDS)
    ap.add_argument("--srt", action="store_true", help="tulis ulang words.srt dari words.json")
    arg = ap.parse_args()
    p = Proyek(arg.proyek)
    if arg.srt:
        tulis_srt(baca_json(p.words_path), p.words_path.with_suffix(".srt"))
        return 0
    transkrip(p, arg.paksa, arg.backend)
    return 0


if __name__ == "__main__":
    main_aman(main)
