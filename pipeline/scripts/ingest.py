"""ingest — validasi, rough cut, crop 9:16, color correction, bersihkan & normalisasi audio.

Pemakaian:
    python ingest.py <folder-proyek> [--paksa]

Input  : manifest.aset.rekaman (+ aset.potong, aset.crop, warna.filter)
Output : cache/ingest.mp4 (video, tanpa audio), cache/audio.wav (−14 LUFS), cache/ingest.meta.json
Aturan : K04.1, K04.4
"""
from __future__ import annotations

import argparse

from sistem import (SETPARAMS_BT709, VERSI_SCRIPTS, GagalPipeline, Proyek, cache_valid, fps_dari, ffprobe, jalankan, log,
                    loudnorm_2pass, main_aman, sha_file, stream, tulis_meta)


def _genap(x: float) -> int:
    return int(round(x / 2)) * 2


# Rekaman HDR (bawaan iPhone: HLG / Dolby Vision 8.4 berbasis HLG, BT.2020) yang hanya diberi label BT.709 tampak pucat &
# kusam. Konversi HDR → SDR: linearisasi dengan transfer masukan eksplisit → primaries BT.709 → tone mapping → BT.709 TV.
TRANSFER_HDR = {"arib-std-b67": "HLG", "smpte2084": "PQ"}
TONEMAP = "hable"   # operator tone mapping (lembut di highlight, umum untuk konten sosial)
NPL = 100           # nits puncak acuan SDR untuk linearisasi


def jenis_hdr(vs: dict) -> str | None:
    """'HLG' / 'PQ' bila stream video HDR (dari tag color_transfer), selain itu None."""
    return TRANSFER_HDR.get(str(vs.get("color_transfer") or ""))


def filter_tonemap(vs: dict) -> str:
    """Rantai zscale/tonemap HDR → SDR BT.709 (kosong bila sumber bukan HDR). Tag masukan ditulis eksplisit agar
    tidak bergantung pada metadata frame yang kadang hilang setelah decode."""
    if not jenis_hdr(vs):
        return ""
    tin = vs["color_transfer"]
    pin = vs.get("color_primaries") or "bt2020"
    min_ = vs.get("color_space") or "bt2020nc"
    return (f"zscale=tin={tin}:pin={pin}:min={min_}:t=linear:npl={NPL},format=gbrpf32le,zscale=p=bt709,"
            f"tonemap=tonemap={TONEMAP}:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p10le,")


def _rotasi(vs: dict) -> int:
    for sd in vs.get("side_data_list", []) or []:
        if "rotation" in sd:
            return int(sd["rotation"])
    return int((vs.get("tags") or {}).get("rotate", 0))


def ingest(p: Proyek, paksa: bool = False) -> dict:
    aset = p.manifest.get("aset", {})
    src = p.path_aset(aset.get("rekaman"))
    if not src or not src.exists():
        raise GagalPipeline(f"Rekaman tidak ada: manifest.aset.rekaman = {aset.get('rekaman')!r}")

    info = ffprobe(src)
    vs, as_ = stream(info, "video"), stream(info, "audio")
    if not vs:
        raise GagalPipeline(f"{src.name} tidak punya stream video.")
    w, h = int(vs["width"]), int(vs["height"])
    if abs(_rotasi(vs)) in (90, 270):
        w, h = h, w
    fps_src = fps_dari(vs)

    peringatan = []
    tinggi_min = p.t("ingest.tinggi-min")
    if min(w, h) < min(tinggi_min, p.W) and not paksa:
        raise GagalPipeline(f"Resolusi sumber {w}x{h} terlalu kecil (min sisi pendek {tinggi_min}). Pakai --paksa untuk lanjut.")
    if not any(abs(fps_src - f) < 0.05 for f in p.t("ingest.fps-diterima")):
        peringatan.append(f"fps sumber {fps_src:.3f} tidak standar; dikonversi ke {p.fps}.")
    hdr = jenis_hdr(vs)
    if hdr:
        peringatan.append(f"Rekaman HDR ({hdr}, {vs.get('color_primaries') or 'bt2020'}) dikonversi ke SDR BT.709 "
                          f"(tone mapping {TONEMAP}); periksa warna kulit di storyboard.")
    elif vs.get("color_primaries") == "bt2020":
        peringatan.append("Rekaman berprimaries BT.2020 tanpa tag transfer HDR; diperlakukan sebagai SDR — "
                          "bila tampak pucat, ekspor ulang dari ponsel sebagai SDR.")

    potong = aset.get("potong") or []
    crop = aset.get("crop") or {}
    filter_warna = (p.manifest.get("warna") or {}).get("filter", "")
    a = p.tokens["audio"]
    kunci = {"src": sha_file(src), "potong": potong, "crop": crop, "warna": filter_warna,
             "format": [p.W, p.H, p.fps], "audio": a, "versi": VERSI_SCRIPTS,
             "hdr": [hdr, TONEMAP, NPL] if hdr else None}
    meta_path = p.cache / "ingest.meta.json"
    if not paksa and cache_valid(meta_path, kunci) and p.ingest_video.exists() and p.ingest_audio.exists():
        log("ingest", "cache valid, dilewati.")
        return {"dilewati": True}

    # --- crop ke rasio target
    target = p.W / p.H
    if w / h > target:
        cw, ch = _genap(h * target), h
        cx, cy = _genap((w - cw) * float(crop.get("x", 0.5))), 0
    else:
        cw, ch = w, _genap(w / target)
        cx, cy = 0, _genap((h - ch) * float(crop.get("y", 0.5)))
    v_chain = (f"{filter_tonemap(vs)}crop={cw}:{ch}:{cx}:{cy},scale={p.W}:{p.H}:flags=lanczos:out_color_matrix=bt709,"
               f"fps={p.fps},setsar=1" + (f",{filter_warna}" if filter_warna else "") + f",format=yuv420p,{SETPARAMS_BT709}")
    a_chain = f"highpass=f={a['highpass-hz']}" + (f",{a['denoise']}" if a.get("denoise") else "")

    # --- rough cut: daftar segmen yang DISIMPAN
    fc, n = [], len(potong)
    if n:
        for i, (s, e) in enumerate(potong):
            fc.append(f"[0:v]trim=start={s}:end={e},setpts=PTS-STARTPTS[v{i}]")
            if as_:
                fc.append(f"[0:a]atrim=start={s}:end={e},asetpts=PTS-STARTPTS[a{i}]")
        if as_:
            fc.append("".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[vc][ac]")
        else:
            fc.append("".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[vc]")
        vin, ain = "[vc]", "[ac]"
    else:
        vin, ain = "[0:v]", "[0:a]"
    fc.append(f"{vin}{v_chain}[vout]")
    if as_:
        fc.append(f"{ain}{a_chain}[aout]")

    pre_audio = p.cache / "audio_pre.wav"
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-filter_complex", ";".join(fc),
           "-map", "[vout]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", p.t("ingest.crf-antara"),
           "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
           p.ingest_video]
    if as_:
        cmd += ["-map", "[aout]", "-vn", "-ar", a["sample-rate"], "-c:a", "pcm_s24le", pre_audio]
    log("ingest", f"{src.name} {w}x{h}@{fps_src:.2f} → {p.W}x{p.H}@{p.fps}"
                  f"{f', {n} segmen rough cut' if n else ''}")
    jalankan(cmd)

    if as_:
        log("ingest", f"normalisasi audio → {a['lufs']} LUFS, TP {a['true-peak']} dBTP")
        ukur = loudnorm_2pass(pre_audio, p.ingest_audio, a["lufs"], a["true-peak"], a["lra"], sr=a["sample-rate"])
        pre_audio.unlink(missing_ok=True)
    else:
        peringatan.append("Rekaman tanpa audio; audio.wav senyap dibuat.")
        dur = float(ffprobe(p.ingest_video)["format"]["duration"])
        jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i",
                  f"anullsrc=r={a['sample-rate']}:cl=stereo", "-t", dur, "-c:a", "pcm_s24le", p.ingest_audio])
        ukur = None

    hasil = {"sumber": {"file": str(src.name), "resolusi": [w, h], "fps": fps_src,
                        "audio": bool(as_)},
             "crop": [cw, ch, cx, cy], "loudnorm_ukur": ukur, "peringatan": peringatan}
    tulis_meta(meta_path, kunci, **hasil)
    for pr in peringatan:
        log("ingest", f"PERINGATAN: {pr}")
    log("ingest", "selesai.")
    return hasil


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--paksa", action="store_true", help="abaikan cache & validasi resolusi")
    arg = ap.parse_args()
    ingest(Proyek(arg.proyek), arg.paksa)
    return 0


if __name__ == "__main__":
    main_aman(main)
