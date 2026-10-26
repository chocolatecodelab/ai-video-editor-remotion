"""pratinjau_efek — contoh gerak tiap efek → efek/pratinjau/<efek>.gif + .png (untuk katalog web Vorta).

Pemakaian (lewat video.py):
    python pipeline/scripts/video.py pratinjau-efek [efek] [--gaya g]

Tiap efek dirender lewat jalur yang SAMA dengan proyek (render.Renderer): proyek mini sementara di
proyek/_pratinjau/efek-<nama>/ berisi potongan footage contoh 7 s (proyek/_pratinjau/_dasar, lihat video.py pratinjau)
dan satu elemen = contoh JSON dari modul efek itu sendiri (blok ```json pertama). Tidak ada isi yang ditulis dua kali:
yang ditambahkan di sini hanya waktu (mulai/durasi) dan pengganti teks "…" di contoh.

Gaya: --gaya, atau gaya_cocok pertama di frontmatter efek, atau GAYA_DEFAULT.
Keluaran: .gif (gerak, 270 px, 12 fps) dan .png (satu frame di tengah efek). Tanpa mp4.
"""
from __future__ import annotations

import copy
import json
import re
import shutil

from sistem import ROOT, GagalPipeline, Proyek, baca_json, daftar_modul, frontmatter, gabung, jalankan, log, resolve, tulis_json

KELUAR = ROOT / "efek" / "pratinjau"
KERJA = ROOT / "proyek" / "_pratinjau"
GAYA_DEFAULT = "glass-tech"
DURASI = 7.0          # panjang potongan footage contoh (s)
MULAI = 0.6           # awal efek di potongan
DURASI_EFEK = 4.0     # bila contoh tidak menyebut durasi
POTONG = 3.0          # titik potong untuk efek transisi (dua beat)
RESOLUSI = (540, 960)
LEBAR_GIF = 270

# Contoh di modul memakai "…" sebagai tempat isi; pratinjau butuh teks nyata.
PENGGANTI = {
    "headline-wall": {"judul_judul": ["Harga naik lagi", "Kreator bingung", "Algoritma *berubah*"]},
}


def contoh_json(path) -> dict:
    """Blok ```json pertama di modul efek."""
    m = re.search(r"```json\s*\n(.*?)\n```", path.read_text(encoding="utf-8"), re.S)
    if not m:
        raise GagalPipeline(f"{path.name}: tidak ada contoh ```json.")
    return json.loads(m.group(1), strict=False)  # contoh judul-gaya menulis baris baru langsung di dalam string


def _ganti_elipsis(v):
    if isinstance(v, str):
        return v.replace("…", "contoh")
    if isinstance(v, list):
        return [_ganti_elipsis(x) for x in v]
    if isinstance(v, dict):
        return {k: _ganti_elipsis(x) for k, x in v.items()}
    return v


def beat_sheet(nama: str, contoh: dict) -> tuple[dict, tuple[float, float]]:
    """Beat-sheet mini + jendela waktu (mulai, selesai) yang dipotong jadi gif."""
    e = _ganti_elipsis(gabung(copy.deepcopy(contoh), PENGGANTI.get(nama, {})))
    tanpa_anim = {"caption": {"aktif": False, "posisi": "bawah", "kecuali": []}}
    if e.get("tipe") == "transisi":
        e["mulai"] = POTONG
        return dict(tanpa_anim, beats=[{"id": "awal", "beat": "Awal", "mulai": 0, "selesai": POTONG, "elemen": []},
                                       {"id": "akhir", "beat": "Akhir", "mulai": POTONG, "selesai": DURASI, "elemen": [e]}]), \
            (POTONG - 1.5, POTONG + 1.5)
    mulai, selesai = e.get("mulai"), e.get("selesai")
    if isinstance(mulai, (int, float)) and isinstance(selesai, (int, float)):
        dur = selesai - mulai
    else:
        dur = float(e.get("durasi") or DURASI_EFEK)
    # contoh modul kadang mepet minimum jadwal perangkat (mis. coret 2,5 s < 2,57 s di glass-tech) → beri ruang
    dur = min(max(dur, DURASI_EFEK), DURASI - MULAI - 0.6)
    e.pop("selesai", None)
    e.update(mulai=MULAI, durasi=round(dur, 2))
    return dict(tanpa_anim, beats=[{"id": "isi", "beat": "Isi", "mulai": 0, "selesai": DURASI, "elemen": [e]}]), \
        (max(0.0, MULAI - 0.3), min(DURASI, MULAI + dur + 0.3))


def _footage(tujuan) -> None:
    """Potongan DURASI s dari footage contoh pratinjau preset (ingest + audio + words)."""
    dasar = KERJA / "_dasar" / "cache"
    if not (dasar / "ingest.mp4").exists():
        raise GagalPipeline("Footage contoh belum ada: jalankan sekali `video.py pratinjau --sumber <proyek>`.")
    c = tujuan / "cache"
    c.mkdir(parents=True, exist_ok=True)
    for f in ("ingest.mp4", "audio.wav"):
        jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", dasar / f, "-t", DURASI, "-c", "copy", c / f])
    w = baca_json(dasar / "words.json")
    tulis_json(c / "words.json", dict(w, kata=[k for k in w["kata"] if k["e"] <= DURASI]))


def _sudah_ada(m) -> bool:
    """gif & png ada dan lebih baru dari modul efeknya → tidak perlu dirender ulang."""
    hasil = [KELUAR / f"{m.nama}.{x}" for x in ("gif", "png")]
    return all(f.exists() and f.stat().st_mtime >= m.path.stat().st_mtime for f in hasil)


def pratinjau_efek(nama: str | None = None, gaya: str | None = None, paksa: bool = False) -> list[str]:
    """→ daftar efek yang gagal (efek lain tetap dirender). Tanpa paksa: efek yang pratinjaunya mutakhir dilewati."""
    import render
    from render_kamera import KAMERA_MASK
    daftar = [m for m in daftar_modul("efek", termasuk_arsip=False) if not nama or m.nama == nama]
    if not daftar:
        raise GagalPipeline(f"efek '{nama}' tidak ada.")
    KELUAR.mkdir(parents=True, exist_ok=True)
    gagal, ringkas = [], baca_json(KELUAR / "_ringkasan.json", {})
    for m in daftar:
        if not paksa and not gaya and _sudah_ada(m):
            continue
        fm, _ = frontmatter(m.path)
        g = resolve("gaya", gaya or (fm.get("gaya_cocok") or [GAYA_DEFAULT])[0])
        gfm, _ = frontmatter(g.path)
        tujuan = KERJA / f"efek-{m.nama}"
        try:
            contoh = contoh_json(m.path)
            bs, (t0, t1) = beat_sheet(m.nama, contoh)
            shutil.rmtree(tujuan, ignore_errors=True)
            shutil.copytree(ROOT / "proyek" / "_template-proyek", tujuan)
            mf = baca_json(tujuan / "manifest.json")
            mf.update(proyek=f"pratinjau-efek-{m.nama}", gaya=g.ref, template=resolve("template", "hook-problem-solution").ref,
                      konteks=gfm.get("konteks", []), token_override={"format": {"resolusi": list(RESOLUSI)}})
            mf["aset"]["rekaman"] = "pratinjau (footage contoh)"
            tulis_json(tujuan / "manifest.json", mf)
            tulis_json(tujuan / "beat-sheet.json", bs)
            _footage(tujuan)
            p = Proyek(tujuan)
            if str(contoh.get("efek", "")) in KAMERA_MASK:
                import roto
                roto.roto(p, semua=True)
            log("pratinjau-efek", f"{m.id} {m.nama} ({g.nama}): render {RESOLUSI[0]}×{RESOLUSI[1]} …")
            render.Renderer(p).render()
            gif, png = KELUAR / f"{m.nama}.gif", KELUAR / f"{m.nama}.png"
            jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{t0:.2f}", "-t", f"{t1 - t0:.2f}",
                      "-i", p.master_path, "-vf",
                      f"fps=12,scale={LEBAR_GIF}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];"
                      "[b][p]paletteuse=dither=bayer", "-loop", 0, gif])
            # frame diam: transisi sesaat sebelum titik potong (blur/geser sedang terjadi; tepat di potong, celup =
            # layar warna polos); efek lain 60% jalannya efek (animasi masuk selesai, belum keluar)
            t_png = POTONG - 0.1 if contoh.get("tipe") == "transisi" else t0 + (t1 - t0) * 0.6
            jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{t_png:.2f}",
                      "-i", p.master_path, "-frames:v", 1, "-vf", f"scale={LEBAR_GIF}:-1:flags=lanczos", png])
            ringkas[m.nama] = {"efek": m.ref, "gaya": g.ref, "jendela": [round(t0, 2), round(t1, 2)]}
            log("pratinjau-efek", f"→ efek/pratinjau/{m.nama}.gif · .png")
        except (GagalPipeline, ValueError) as ex:  # ValueError: contoh JSON rusak di modul
            gagal.append(m.nama)
            log("pratinjau-efek", f"GAGAL {m.nama}: {ex}")
        finally:
            shutil.rmtree(tujuan, ignore_errors=True)
    tulis_json(KELUAR / "_ringkasan.json", dict(sorted(ringkas.items())))
    if gagal:
        log("pratinjau-efek", f"{len(gagal)} gagal: {', '.join(gagal)}")
    return gagal
