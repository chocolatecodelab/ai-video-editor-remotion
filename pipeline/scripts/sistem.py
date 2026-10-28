"""sistem — pustaka bersama semua skrip pipeline.

Isi: resolver modul (nama pendek/ID → file), pemuat manifest/token/beat-sheet,
helper ffmpeg/ffprobe, cache, dan util warna.
"""
from __future__ import annotations

import copy
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

import yaml

VERSI_SCRIPTS = "0.6"

ROOT = Path(__file__).resolve().parents[2]

# Konteks yang dijalankan pipeline untuk setiap video (bukan pilihan gaya): K10 grain/grade/arah bayangan (render_menyatu)
KONTEKS_WAJIB = ("menyatu",)

# Folder sementara semua proses pipeline (tempfile Python, ffmpeg, render-server Remotion & Chrome headless yang mewarisi
# env) di dalam repo — drive data, bukan %TEMP% sistem di C: yang bisa penuh. Pindahkan dengan env VIDEO_TEMP.
SEMENTARA = Path(os.environ.get("VIDEO_TEMP") or ROOT / ".sementara")
SEMENTARA.mkdir(parents=True, exist_ok=True)
for _k in ("TEMP", "TMP", "TMPDIR"):
    os.environ[_k] = str(SEMENTARA)
tempfile.tempdir = str(SEMENTARA)

# jenis → (folder, prefix nama file, ekstensi)
LAPISAN = {
    "tokens":   ("tokens",   "TOKEN",    ".json"),
    "konteks":  ("konteks",  "KONTEKS",  ".md"),
    "gaya":     ("gaya",     "GAYA",     ".md"),
    "template": ("template", "TEMPLATE", ".md"),
    "efek":     ("efek",     "EFEK",     ".md"),
    "koreografi": ("koreografi", "KOREO", ".json"),
    "preset":   ("preset",   "PRESET",   ".json"),
}
POLA_NAMA = re.compile(r"^(?P<prefix>[A-Z]+)_(?P<nomor>\d{2})_(?P<nama>[a-z0-9-]+)_v(?P<versi>\d+\.\d+)$")
PREFIX_ID = {"tokens": "TK", "konteks": "K", "gaya": "G", "template": "T", "efek": "E", "koreografi": "KR", "preset": "PR"}

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


class GagalPipeline(Exception):
    """Kesalahan yang dilaporkan ke pengguna tanpa traceback."""


def log(langkah: str, pesan: str) -> None:
    print(f"[{langkah}] {pesan}", flush=True)


# ---------------------------------------------------------------- registry

@dataclass
class Modul:
    jenis: str
    nomor: str
    nama: str
    versi: str
    path: Path
    diarsip: bool

    @property
    def id(self) -> str:
        return f"{PREFIX_ID[self.jenis]}{self.nomor}"

    @property
    def ref(self) -> str:
        return f"{self.nama}@{self.versi}"

    def rel(self) -> str:
        return self.path.relative_to(ROOT).as_posix()


def _versi_tuple(v: str) -> tuple[int, ...]:
    return tuple(int(x) for x in v.split("."))


def daftar_modul(jenis: str, termasuk_arsip: bool = True) -> list[Modul]:
    folder, prefix, ext = LAPISAN[jenis]
    hasil = []
    lokasi = [(ROOT / folder, False)]
    if termasuk_arsip:
        lokasi.append((ROOT / "arsip" / folder, True))
    for d, diarsip in lokasi:
        if not d.exists():
            continue
        for f in sorted(d.glob(f"{prefix}_*{ext}")):
            m = POLA_NAMA.match(f.stem)
            if m and m["prefix"] == prefix:
                hasil.append(Modul(jenis, m["nomor"], m["nama"], m["versi"], f, diarsip))
    return hasil


def resolve(jenis: str, ref: str) -> Modul:
    """ref: 'nama', 'nama@versi', 'K00', 'K00@0.1', atau '00-zona-aman@0.1' (gaya lama)."""
    ref = ref.strip()
    nama, _, versi = ref.partition("@")
    nama = re.sub(r"^\d{2}-", "", nama)  # '00-zona-aman' → 'zona-aman'
    semua = daftar_modul(jenis)
    cocok = [m for m in semua if m.nama == nama or m.id.lower() == nama.lower()]
    if not cocok and jenis == "efek":  # nama lain di frontmatter `alias` (mis. "dolly-zoom" → vertigo)
        kunci = re.sub(r"[\s_]+", "-", nama.lower())
        cocok = [m for m in semua if not m.diarsip and kunci in
                 [re.sub(r"[\s_]+", "-", str(a).lower()) for a in (frontmatter(m.path)[0].get("alias") or [])]]
    if not cocok:
        raise GagalPipeline(f"{jenis} '{ref}' tidak ditemukan. Cek INDEX.md.")
    if versi:
        cocok = [m for m in cocok if m.versi == versi]
        if not cocok:
            raise GagalPipeline(f"{jenis} '{ref}': versi {versi} tidak ada (aktif maupun arsip).")
        return cocok[0]
    aktif = [m for m in cocok if not m.diarsip] or cocok
    return max(aktif, key=lambda m: _versi_tuple(m.versi))


# ---------------------------------------------------------------- parsing

def frontmatter(path: Path) -> tuple[dict, str]:
    teks = path.read_text(encoding="utf-8")
    if not teks.startswith("---"):
        return {}, teks
    _, fm, isi = teks.split("---", 2)
    return yaml.safe_load(fm) or {}, isi


def tabel_aturan(path: Path) -> list[dict]:
    """Baris tabel markdown '| ID | Aturan | Cek |' dari file modul."""
    rows = []
    for baris in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\|\s*([A-Z]{1,2}\d{2}\.\d+)\s*\|(.+)\|\s*([^|]+?)\s*\|\s*$", baris)
        if m:
            rows.append({"id": m[1], "aturan": m[2].strip(), "cek": m[3].strip(), "sumber": path.relative_to(ROOT).as_posix()})
    return rows


def baca_json(path: Path, default=None):
    if not path.exists():
        if default is not None:
            return copy.deepcopy(default)
        raise GagalPipeline(f"File tidak ada: {path}")
    return json.loads(path.read_text(encoding="utf-8-sig"))  # -sig: toleran BOM (Notepad/PowerShell di Windows)


def tulis_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def gabung(dasar: dict, timpa: dict) -> dict:
    hasil = copy.deepcopy(dasar)
    for k, v in timpa.items():
        if k == "_meta":
            continue
        if isinstance(v, dict) and isinstance(hasil.get(k), dict):
            hasil[k] = gabung(hasil[k], v)
        else:
            hasil[k] = copy.deepcopy(v)
    return hasil


# ---------------------------------------------------------------- proyek

class Proyek:
    """Semua yang dibutuhkan skrip tentang satu proyek, dimuat dari manifest.json."""

    def __init__(self, folder: Path | str):
        self.dir = Path(folder).resolve()
        self.manifest_path = self.dir / "manifest.json"
        if not self.manifest_path.exists():
            raise GagalPipeline(f"manifest.json tidak ada di {self.dir}")
        self.manifest = baca_json(self.manifest_path)
        self.cache = self.dir / "cache"
        self.out = self.dir / "out"
        self.cache.mkdir(exist_ok=True)
        self.out.mkdir(exist_ok=True)

        m = self.manifest
        self.gaya = resolve("gaya", m["gaya"])
        self.template = resolve("template", m["template"])
        self.gaya_fm, _ = frontmatter(self.gaya.path)
        self.template_fm, _ = frontmatter(self.template.path)
        ref_konteks = m.get("konteks") or self.gaya_fm.get("konteks", [])
        self.konteks = [resolve("konteks", r) for r in ref_konteks]
        for nama in KONTEKS_WAJIB:  # berlaku untuk setiap proyek, juga gaya/manifest lama yang belum mencantumkannya
            if all(k.nama != nama for k in self.konteks):
                self.konteks.append(resolve("konteks", nama))
        self.token_modul = [resolve("tokens", r) for r in self.gaya_fm.get("tokens", [])]
        tok: dict = {}
        for tm in self.token_modul:
            tok = gabung(tok, baca_json(tm.path))
        tok = gabung(tok, m.get("token_override", {}))
        self.tokens = tok

        fmt = tok["format"]
        self.W, self.H = fmt["resolusi"]
        self.fps = fmt["fps"]
        wr, hr = fmt.get("resolusi-referensi", fmt["resolusi"])
        self.skala = min(self.W / wr, self.H / hr)

    # path standar
    @property
    def ingest_video(self) -> Path: return self.cache / "ingest.mp4"
    @property
    def ingest_audio(self) -> Path: return self.cache / "audio.wav"
    @property
    def words_path(self) -> Path: return self.cache / "words.json"
    @property
    def masks_dir(self) -> Path: return self.cache / "masks"
    @property
    def beat_sheet_path(self) -> Path: return self.dir / "beat-sheet.json"
    @property
    def layout_path(self) -> Path: return self.out / "layout.json"
    @property
    def master_path(self) -> Path: return self.out / "master.mov"

    def path_aset(self, rel: str | None) -> Path | None:
        if not rel:
            return None
        p = Path(rel)
        return p if p.is_absolute() else self.dir / p

    def t(self, kunci: str, default=None):
        """Ambil token dengan path titik: t('zona-aman.bawah')."""
        node = self.tokens
        for k in kunci.split("."):
            if not isinstance(node, dict) or k not in node:
                if default is not None:
                    return default
                raise GagalPipeline(f"Token '{kunci}' tidak ada (gaya {self.gaya.ref}).")
            node = node[k]
        return node

    def px(self, v: float) -> int:
        return int(round(v * self.skala))

    def zona_aman(self) -> tuple[int, int, int, int]:
        z = self.t("zona-aman")
        return (self.px(z["kiri"]), self.px(z["atas"]), self.W - self.px(z["kanan"]), self.H - self.px(z["bawah"]))

    def simpan_manifest(self) -> None:
        tulis_json(self.manifest_path, self.manifest)

    def efek_dipakai(self) -> list[Modul]:
        """Modul efek yang dirujuk field "efek" di beat-sheet.json (urutan kemunculan, tanpa duplikat)."""
        if not self.beat_sheet_path.exists():
            return []
        refs = []
        bs = baca_json(self.beat_sheet_path)
        for b in bs.get("beats", []):
            for e in b.get("elemen", []):
                if e.get("efek") and e["efek"] not in refs:
                    refs.append(e["efek"])
        if (bs.get("zoom_potong") or {}).get("aktif", True) and self.ingest_video.exists():
            refs.append("zoom-potong")  # E55 otomatis pada rekaman (render._zoom_potong)
        return [resolve("efek", r) for r in refs]

    def modul_terpakai(self) -> dict:
        def info(m: Modul):
            return {"id": m.id, "ref": m.ref, "file": m.rel(), "sha256": sha_file(m.path, penuh=True)[:16]}
        skill = ROOT / "pipeline" / "skill" / "SKILL.md"
        skill_fm, _ = frontmatter(skill)
        hasil = {
            "gaya": info(self.gaya),
            "template": info(self.template),
            "konteks": [info(k) for k in self.konteks],
            "tokens": [info(t) for t in self.token_modul],
            "efek": [info(e) for e in self.efek_dipakai()],
            "skill": {"ref": f"{skill_fm.get('name')}@{skill_fm.get('versi')}", "file": "pipeline/skill/SKILL.md",
                      "sha256": sha_file(skill, penuh=True)[:16]},
            "scripts": {"ref": f"scripts@{VERSI_SCRIPTS}"},
        }
        if self.manifest.get("preset"):
            hasil["preset"] = info(resolve("preset", self.manifest["preset"]))
        return hasil


# ---------------------------------------------------------------- cache

def sha_file(path: Path, penuh: bool = False) -> str:
    """Sidik jari file. Untuk media besar: ukuran + 8 MB awal + 8 MB akhir (cepat)."""
    h = hashlib.sha256()
    st = path.stat()
    if penuh or st.st_size <= 32 * 1024 * 1024:
        h.update(path.read_bytes())
    else:
        h.update(str(st.st_size).encode())
        with path.open("rb") as f:
            h.update(f.read(8 * 1024 * 1024))
            f.seek(-8 * 1024 * 1024, os.SEEK_END)
            h.update(f.read())
    return h.hexdigest()


def sha_data(obj) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def cache_valid(meta_path: Path, kunci: dict) -> bool:
    if not meta_path.exists():
        return False
    try:
        return baca_json(meta_path).get("kunci") == kunci
    except Exception:
        return False


def tulis_meta(meta_path: Path, kunci: dict, **lain) -> None:
    tulis_json(meta_path, {"kunci": kunci, **lain})


# ---------------------------------------------------------------- ffmpeg

# Tag warna di level frame. Tanpa ini filter scale bisa menghapus primaries/trc → encoder menulis "unknown".
SETPARAMS_BT709 = "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv"


def butuh(prog: str) -> str:
    p = shutil.which(prog)
    if not p:
        raise GagalPipeline(f"'{prog}' tidak ditemukan di PATH.")
    return p


def jalankan(cmd: list) -> subprocess.CompletedProcess:
    cmd = [str(c) for c in cmd]
    # stdin kosong: ffmpeg selalu membaca stdin (tombol 'q'); bila pipeline jalan di latar belakang stdin warisan
    # bukan konsol → ffmpeg bisa tersangkut selamanya walau keluaran sudah lengkap
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", stdin=subprocess.DEVNULL)
    if r.returncode != 0:
        ekor = "\n".join((r.stderr or "").strip().splitlines()[-15:])
        raise GagalPipeline(f"Perintah gagal ({cmd[0]}):\n{ekor}")
    return r


def ffprobe(path: Path) -> dict:
    butuh("ffprobe")
    r = jalankan(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", path])
    return json.loads(r.stdout)


def stream(info: dict, jenis: str) -> dict | None:
    return next((s for s in info.get("streams", []) if s.get("codec_type") == jenis), None)


def fps_dari(s: dict) -> float:
    a, _, b = (s.get("avg_frame_rate") or s.get("r_frame_rate") or "0/1").partition("/")
    return float(a) / float(b or 1) if float(b or 1) else 0.0


def durasi(path: Path) -> float:
    return float(ffprobe(path)["format"]["duration"])


def ukur_loudness(path: Path) -> dict:
    """Integrated LUFS & true peak (EBU R128) dari file audio/video."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace", stdin=subprocess.DEVNULL)
    teks = r.stderr.split("Summary:")[-1]
    i = re.search(r"I:\s+(-?[\d.]+|-inf) LUFS", teks)
    p = re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", teks)
    f = lambda m: float(m[1]) if m and m[1] != "-inf" else float("-inf")
    return {"lufs": f(i), "true_peak": f(p)}


def loudnorm_2pass(src: Path, dst: Path, lufs: float, tp: float, lra: float, pre: str = "", sr: int = 48000) -> dict:
    """Normalisasi loudness dua tahap (ukur → terapkan linear) ke WAV."""
    pre_f = f"{pre}," if pre else ""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(src), "-af",
                        f"{pre_f}loudnorm=I={lufs}:TP={tp}:LRA={lra}:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace", stdin=subprocess.DEVNULL)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S)
    if not m:
        raise GagalPipeline(f"loudnorm gagal mengukur {src.name}")
    ukur = json.loads(m[0])
    if ukur["input_i"] in ("-inf", "inf"):
        raise GagalPipeline(f"Audio {src.name} senyap; tidak bisa dinormalisasi.")
    af = (f"{pre_f}loudnorm=I={lufs}:TP={tp}:LRA={lra}:measured_I={ukur['input_i']}:measured_TP={ukur['input_tp']}"
          f":measured_LRA={ukur['input_lra']}:measured_thresh={ukur['input_thresh']}:offset={ukur['target_offset']}:linear=true")
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-af", af, "-ar", sr, "-ac", 2,
              "-c:a", "pcm_s24le", dst])
    return ukur


def sfx_bawaan(nama: str) -> Path:
    """SFX bawaan dibuat sekali dengan ffmpeg (noise tersaring) lalu di-cache."""
    d = ROOT / "pipeline" / "aset-bawaan" / "sfx"
    p = d / f"{nama}.wav"
    if p.exists():
        return p
    resep = {
        "whoosh": "anoisesrc=d=0.55:c=pink:a=0.6,highpass=f=350,lowpass=f=5000,"
                  "afade=t=in:d=0.3:curve=exp,afade=t=out:st=0.3:d=0.25:curve=exp",
        "riser": "anoisesrc=d=1.2:c=white:a=0.4,highpass=f=800,lowpass=f=9000,afade=t=in:d=1.1:curve=qsin,"
                 "afade=t=out:st=1.1:d=0.1",
        "pop": "sine=f=520:d=0.12,afade=t=out:d=0.12:curve=exp",
    }
    if nama not in resep:
        raise GagalPipeline(f"SFX '{nama}' tidak ada. Bawaan: {', '.join(resep)}; atau beri path file.")
    d.mkdir(parents=True, exist_ok=True)
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", resep[nama],
              "-ar", 48000, "-ac", 2, p])
    return p


# ---------------------------------------------------------------- warna

def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def luminans(rgb) -> float:
    def lin(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def rasio_kontras(l1: float, l2: float) -> float:
    a, b = max(l1, l2), min(l1, l2)
    return (a + 0.05) / (b + 0.05)


# ---------------------------------------------------------------- font

def cari_font(nama_file: str) -> Path:
    kandidat = [
        ROOT / "pipeline" / "fonts" / nama_file,
        Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts" / nama_file,
        Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "Windows" / "Fonts" / nama_file,
        Path("/usr/share/fonts/truetype") / nama_file,
        Path.home() / "Library" / "Fonts" / nama_file,
        Path("/Library/Fonts") / nama_file,
    ]
    for k in kandidat:
        if k.exists():
            return k
    raise GagalPipeline(f"Font '{nama_file}' tidak ditemukan. Taruh file di pipeline/fonts/.")


def main_aman(fungsi) -> None:
    """Bungkus main(): GagalPipeline → pesan rapi + exit code 2."""
    try:
        kode = fungsi()
        sys.exit(kode or 0)
    except GagalPipeline as e:
        print(f"GAGAL: {e}", file=sys.stderr)
        sys.exit(2)
