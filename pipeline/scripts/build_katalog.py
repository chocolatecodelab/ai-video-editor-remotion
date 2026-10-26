"""build_katalog — registry modul → katalog.json + pratinjau gif/png terkompres untuk web Vorta (PRD F22–F24).

Pemakaian:
    python pipeline/scripts/build_katalog.py [--keluar ../vorta] [--paksa]

Sumber (tanpa data ditulis dua kali): INDEX.md (durasi/dukungan efek), frontmatter & heading modul .md, JSON
koreografi/preset, tokens (palet & font). Hanya modul aktif (bukan arsip), versi terbaru per nama pendek.

Pratinjau (tanpa mp4 — terlalu berat untuk web):
    gaya   gaya/katalog/<gaya>.png                            → png
    preset preset/pratinjau/<preset>.mp4 (sumber saja)        → png (frame perangkat terluas) + gif (ringkas, dipercepat)
    efek   efek/pratinjau/<efek>.gif|.png (video.py pratinjau-efek) → gif + png
Media ditulis ke <keluar>/public/pratinjau/<jenis>/; dilewati bila sudah lebih baru dari sumbernya (--paksa: ulang).

Validasi: build GAGAL bila ID/nama ganda, preset/efek/koreografi merujuk modul yang tidak ada, atau JSON rusak.
Item tanpa pratinjau hanya diberi peringatan (kartu web menampilkan "Belum ada pratinjau").
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path
from typing import Callable

from sistem import (ROOT, GagalPipeline, Modul, baca_json, daftar_modul, durasi, frontmatter, jalankan, log, main_aman,
                    resolve, tulis_json)

VERSI_SKEMA = 1  # ubah bersama vorta/src/types/katalog.ts
LEBAR_PNG, WARNA_PNG = 270, 128
LEBAR_GIF, FPS_GIF, WARNA_GIF = 180, 8, 48
PRESET_GIF_SUMBER, PRESET_GIF_CEPAT = 16.0, 2.0  # detik awal video preset, dipercepat 2× → gif ±8 s


# ---------------------------------------------------------------- baca modul

def aktif(jenis: str) -> list[Modul]:
    """Modul aktif, versi terbaru per nama pendek."""
    terbaru: dict[str, Modul] = {}
    for m in daftar_modul(jenis, termasuk_arsip=False):
        terbaru[m.nama] = resolve(jenis, m.nama)
    return sorted(terbaru.values(), key=lambda m: m.nomor)


def tabel_index() -> dict[str, dict[str, str]]:
    """Baris tabel INDEX.md per ID (E21, G04, …) → {kolom: isi}."""
    hasil, kepala = {}, None
    for baris in (ROOT / "INDEX.md").read_text(encoding="utf-8").splitlines():
        if not baris.startswith("|"):
            kepala = None
            continue
        sel = [s.strip() for s in baris.strip().strip("|").split("|")]
        if kepala is None:
            kepala = sel
        elif not set("".join(sel)) <= set("-: ") and re.fullmatch(r"[A-Z]+\d{2}", sel[0]):
            hasil[sel[0]] = dict(zip(kepala, sel))
    return hasil


def judul(isi: str) -> str:
    """Bagian setelah 'Jenis:' di heading '# E21 — Efek: Coret kata' / '# K00 — Zona Aman'."""
    m = re.search(r"^# .*?—\s*(.+)$", isi, re.M)
    h = m.group(1).strip() if m else ""
    return h.split(":", 1)[1].strip() if re.match(r"^(Gaya|Efek|Template):", h) else h


def label_gaya(nama: str, isi: str) -> str:
    m = re.search(r"\(([^)]+)\)\s*$", judul(isi))
    return m.group(1) if m else nama.replace("-", " ").title()


def tanpa_kurung(teks: str) -> str:
    return re.sub(r"\s*\([^)]*\)\s*$", "", teks).strip()


def bagian(isi: str, heading: str) -> str:
    """Paragraf pertama di bawah '## <heading>'."""
    m = re.search(rf"^##\s+{re.escape(heading)}\s*\n+(.+?)(?:\n\s*\n|\n#|\Z)", isi, re.M | re.S)
    return " ".join(m.group(1).split()) if m else ""


def tebal(isi: str, kunci: str) -> str:
    """Isi setelah '**Kunci:**'."""
    m = re.search(rf"\*\*{re.escape(kunci)}:\*\*\s*(.+)", isi)
    return m.group(1).strip() if m else ""


def rasio(v) -> str:
    """YAML 1.1 membaca `rasio: 9:16` tanpa kutip sebagai angka basis-60 (556) → kembalikan ke '9:16'."""
    return f"{v // 60}:{v % 60}" if isinstance(v, int) else str(v or "")


def dasar(m: Modul, label: str, deskripsi: str, kapan: str, tag: list[str], status: str) -> dict:
    return {"id": m.nama, "kode": m.id, "label": label, "deskripsi": deskripsi, "kapan": kapan or None,
            "tag": [t for t in dict.fromkeys(tag) if t], "versi": m.versi, "status": status or "draft", "pratinjau": None}


# ---------------------------------------------------------------- pratinjau

class Media:
    def __init__(self, keluar: Path, paksa: bool):
        self.dir = keluar / "public" / "pratinjau"
        self.hilang: list[str] = []
        # setelan kompresi berubah → semua media dibuat ulang (cek mtime saja tidak menangkapnya)
        setelan = f"{LEBAR_PNG},{WARNA_PNG},{LEBAR_GIF},{FPS_GIF},{WARNA_GIF},{PRESET_GIF_SUMBER},{PRESET_GIF_CEPAT}"
        self.penanda, self.setelan = self.dir / ".setelan", setelan
        self.paksa = paksa or not self.penanda.exists() or self.penanda.read_text(encoding="utf-8").strip() != setelan

    def selesai(self) -> None:
        """Dipanggil setelah build berhasil: media sudah memakai setelan ini."""
        self.dir.mkdir(parents=True, exist_ok=True)
        self.penanda.write_text(self.setelan + "\n", encoding="utf-8")

    def _perlu(self, sumber: Path, tujuan: Path) -> bool:
        return self.paksa or not tujuan.exists() or tujuan.stat().st_mtime < sumber.stat().st_mtime

    def _tujuan(self, jenis: str, nama: str, ext: str) -> tuple[Path, str]:
        t = self.dir / jenis / f"{nama}.{ext}"
        t.parent.mkdir(parents=True, exist_ok=True)
        return t, f"pratinjau/{jenis}/{nama}.{ext}"

    def png(self, jenis: str, nama: str, sumber: Path, detik: Callable[[], float] | None = None) -> str | None:
        """detik: dipanggil hanya bila png perlu dibuat ulang (memilih frame bisa mahal)."""
        if not sumber.exists():
            return None
        t, rel = self._tujuan(jenis, nama, "png")
        if self._perlu(sumber, t):
            ss = ["-ss", f"{detik():.2f}"] if detik is not None else []
            jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *ss, "-i", sumber, "-frames:v", 1, "-vf",
                      f"scale={LEBAR_PNG}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors={WARNA_PNG}[p];"
                      "[b][p]paletteuse=dither=bayer:bayer_scale=3", t])
        return rel

    def gif(self, jenis: str, nama: str, sumber: Path, sampai: float | None = None, cepat: float = 1.0) -> str | None:
        if not sumber.exists():
            return None
        t, rel = self._tujuan(jenis, nama, "gif")
        if self._perlu(sumber, t):
            durasi_in = ["-t", f"{sampai:.2f}"] if sampai else []
            jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *durasi_in, "-i", sumber, "-vf",
                      f"setpts=PTS/{cepat},fps={FPS_GIF},scale={LEBAR_GIF}:-1:flags=lanczos,split[a][b];"
                      f"[a]palettegen=max_colors={WARNA_GIF}:stats_mode=diff[p];"
                      "[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle", "-loop", 0, t])
        return rel

    def pasang(self, item: dict, jenis: str, png: str | None, gif: str | None = None) -> None:
        p = {k: v for k, v in (("png", png), ("gif", gif)) if v}
        item["pratinjau"] = p or None
        if not p:
            self.hilang.append(f"{jenis}/{item['id']}")


def detik_preset(mp4: Path) -> float:
    """Frame diam preset yang paling 'berisi': kandidat = 60% tiap perangkat (preset/pratinjau/<preset>.json) + beberapa
    titik tetap; skor = kontras + sedikit kecerahan (frame transisi/latar gelap kalah). Satu frame kecil per kandidat."""
    import tempfile

    from PIL import Image, ImageStat
    info = baca_json(mp4.with_suffix(".json"), {})
    dur = durasi(mp4)
    kandidat = [r["mulai"] + (r["selesai"] - r["mulai"]) * 0.6 for r in info.get("perangkat", [])
                if r.get("efek") and r.get("selesai")]
    kandidat = sorted({round(min(t, dur - 0.1), 2) for t in kandidat + [dur * f for f in (0.2, 0.4, 0.6)]})
    terbaik, skor_maks = dur * 0.3, -1.0
    with tempfile.TemporaryDirectory() as d:
        for i, t in enumerate(kandidat):
            f = Path(d) / f"{i}.png"
            jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", mp4,
                      "-frames:v", 1, "-vf", "scale=96:-1", f])
            st = ImageStat.Stat(Image.open(f).convert("L"))
            skor = st.stddev[0] + 0.3 * st.mean[0]
            if skor > skor_maks:
                terbaik, skor_maks = t, skor
    return terbaik


# ---------------------------------------------------------------- per jenis

def bangun(keluar: Path, paksa: bool = False) -> dict:
    idx = tabel_index()
    media = Media(keluar, paksa)
    masalah: list[str] = []

    mod = {j: aktif(j) for j in ("gaya", "koreografi", "preset", "template", "efek", "konteks", "tokens")}
    for j, daftar in mod.items():  # F23: ID & nama tidak boleh ganda
        for kunci in ("id", "nama"):
            nilai = [getattr(m, kunci) for m in daftar]
            masalah += [f"{j}: {kunci} ganda '{v}'" for v in sorted({v for v in nilai if nilai.count(v) > 1})]
    nama = {j: {m.nama for m in d} for j, d in mod.items()}
    token = {m.nama: baca_json(m.path) for m in mod["tokens"]}

    gaya = []
    for m in mod["gaya"]:
        fm, isi = frontmatter(m.path)
        tok = token.get(m.nama, {})
        w = tok.get("warna", {})
        item = dasar(m, label_gaya(m.nama, isi), bagian(isi, "Rasa / Mood"), "", fm.get("ciri", []),
                     idx.get(m.id, {}).get("Status", fm.get("status")))
        item.update(ciri=fm.get("ciri", []),
                    palet=[w[k] for k in ("latar", "teks-utama", "aksen", "aksen-2") if isinstance(w.get(k), str)],
                    font={"judul": tok.get("font", {}).get("judul", {}).get("family", ""),
                          "isi": tok.get("font", {}).get("isi", {}).get("family", "")})
        if not tok:
            masalah.append(f"gaya {m.nama}: token '{m.nama}' tidak ada")
        media.pasang(item, "gaya", media.png("gaya", m.nama, ROOT / "gaya" / "katalog" / f"{m.nama}.png"))
        gaya.append(item)

    koreografi = []
    for m in mod["koreografi"]:
        d = baca_json(m.path)
        butuh = d.get("butuh", {}).get("rekaman", True)
        item = dasar(m, tanpa_kurung(d.get("label", m.nama).split("·")[0].strip()), d.get("deskripsi", ""), d.get("kapan", ""),
                     [m.nama, "pakai footage" if butuh else "tanpa footage"], d.get("_meta", {}).get("status"))
        # "Mitos vs Fakta · Talking Head 35–40 s" → format "Talking Head", durasi "35–40 s"
        ekor = d.get("label", "").split("·", 1)[1].strip() if "·" in d.get("label", "") else ""
        m_dur = re.search(r"(\d+)\s*[–-]\s*(\d+)\s*s\b", ekor)
        item.update(template=d.get("template", ""), butuhRekaman=bool(butuh), variasiMin=int(d.get("variasi_min", 0)),
                    format=ekor[:m_dur.start()].strip() if m_dur else ekor,
                    durasi=f"{m_dur.group(1)}–{m_dur.group(2)} s" if m_dur else "")
        if item["template"] not in nama["template"]:
            masalah.append(f"koreografi {m.nama}: template '{item['template']}' tidak ada")
        media.pasang(item, "koreografi", None)
        koreografi.append(item)

    preset = []
    for m in mod["preset"]:
        d = baca_json(m.path)
        item = dasar(m, d.get("label", m.nama), d.get("deskripsi", ""), d.get("kapan", ""),
                     [d.get("format"), d.get("gaya"), d.get("koreografi")], d.get("_meta", {}).get("status"))
        item.update(gaya=d.get("gaya", ""), koreografi=d.get("koreografi", ""), format=d.get("format", ""))
        for j in ("gaya", "koreografi"):
            if item[j] not in nama[j]:
                masalah.append(f"preset {m.nama}: {j} '{item[j]}' tidak ada")
        mp4 = ROOT / "preset" / "pratinjau" / f"{m.nama}.mp4"
        png = media.png("preset", m.nama, mp4, lambda mp4=mp4: detik_preset(mp4))
        gif = media.gif("preset", m.nama, mp4, PRESET_GIF_SUMBER, PRESET_GIF_CEPAT)
        media.pasang(item, "preset", png, gif)
        preset.append(item)

    template = []
    for m in mod["template"]:
        fm, isi = frontmatter(m.path)
        dur = fm.get("durasi") or []
        item = dasar(m, judul(isi) or m.nama, bagian(isi, "Kapan dipakai"), "", [m.nama, *fm.get("beat_wajib", [])],
                     fm.get("status"))
        item.update(durasi=f"{dur[0]}–{dur[1]} s" if len(dur) == 2 else "", rasio=rasio(fm.get("rasio")))
        media.pasang(item, "template", None)
        template.append(item)

    efek = []
    for m in mod["efek"]:
        fm, isi = frontmatter(m.path)
        baris = idx.get(m.id, {})
        cocok = fm.get("gaya_cocok") or []
        masalah += [f"efek {m.nama}: gaya_cocok '{g}' tidak ada" for g in cocok if g not in nama["gaya"]]
        item = dasar(m, judul(isi) or m.nama, tebal(isi, "Deskripsi"), tebal(isi, "Kapan dipakai"),
                     [*(["khas gaya"] if cocok else []), *cocok], baris.get("Status", fm.get("status")))
        item.update(durasi=baris.get("Durasi", ""), dukungan=baris.get("Dukungan", str(fm.get("dukungan", ""))),
                    gayaCocok=cocok)
        src = ROOT / "efek" / "pratinjau"
        media.pasang(item, "efek", media.png("efek", m.nama, src / f"{m.nama}.png"), media.gif("efek", m.nama, src / f"{m.nama}.gif"))
        efek.append(item)

    # konteks "otomatis" = dipakai semua gaya aktif (pengguna tidak perlu memilihnya)
    konteks_gaya = [{k.partition("@")[0] for k in frontmatter(m.path)[0].get("konteks", [])} for m in mod["gaya"]]
    selalu = set.intersection(*konteks_gaya) if konteks_gaya else set()
    konteks = []
    for m in mod["konteks"]:
        fm, isi = frontmatter(m.path)
        item = dasar(m, judul(isi) or m.nama, bagian(isi, "Tujuan"), "", [m.nama], fm.get("status"))
        item["otomatis"] = m.nama in selalu
        media.pasang(item, "konteks", None)
        konteks.append(item)

    if masalah:
        raise GagalPipeline("katalog tidak valid:\n  " + "\n  ".join(masalah))
    media.selesai()
    tanpa = [h for h in media.hilang if h.split("/")[0] in ("gaya", "preset", "efek")]
    if tanpa:
        log("katalog", f"PERINGATAN {len(tanpa)} item tanpa pratinjau: {', '.join(tanpa)}")
    return {"versi": VERSI_SKEMA, "dibuat": dt.date.today().isoformat(), "preset": preset, "gaya": gaya,
            "koreografi": koreografi, "template": template, "efek": efek, "konteks": konteks}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--keluar", default=str(ROOT.parent / "vorta"), help="folder proyek web (default: ../vorta)")
    ap.add_argument("--paksa", action="store_true", help="kompres ulang semua media pratinjau")
    a = ap.parse_args()
    keluar = Path(a.keluar).resolve()
    if not (keluar / "package.json").exists():
        raise GagalPipeline(f"{keluar}: bukan folder web Vorta (package.json tidak ada).")
    kat = bangun(keluar, a.paksa)
    tulis_json(keluar / "public" / "katalog.json", kat)
    n = {j: len(kat[j]) for j in ("preset", "gaya", "koreografi", "template", "efek", "konteks")}
    log("katalog", f"→ {keluar / 'public' / 'katalog.json'}: " + ", ".join(f"{v} {k}" for k, v in n.items()))
    return 0


if __name__ == "__main__":
    main_aman(main)
