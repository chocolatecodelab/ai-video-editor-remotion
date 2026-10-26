"""remotion_jembatan — render Composition Remotion menjadi overlay ProRes 4444 ber-alpha (bt709), ber-cache.

Dipakai render.py untuk elemen beat-sheet `{"tipe": "remotion", ...}`. Tidak dijalankan langsung.

Props yang dikirim (kontrak: remotion/src/lib/kontrak.ts):
    W, H, fps, durasiFrame, skala, zona, tokens (gabungan proyek), elemen (field elemen + waktu ter-resolve)
Cache: cache/remotion/<Komposisi>-<hash>.mov — hash = props + isi remotion/src + package-lock.json + render-server.mjs
+ isi file font token,
jadi revisi beat-sheet hanya me-render ulang overlay yang berubah.

Render lewat satu proses Node berumur panjang (remotion/render-server.mjs): bundle webpack sekali (di-cache di
remotion/.bundle/<kunci>) + satu browser untuk semua overlay dalam satu run pipeline.
"""
from __future__ import annotations

import atexit
import hashlib
import json
import shutil
import subprocess

from sistem import ROOT, GagalPipeline, Proyek, cari_font, log, sha_data, sha_file, tulis_json

DIR = ROOT / "remotion"
SERVER = DIR / "render-server.mjs"
DIR_BUNDLE = DIR / ".bundle"
_sidik: str | None = None


def sidik_sumber() -> str:
    """Hash kode Remotion + setelan render: perubahan komponen/setelan → overlay lama tidak dipakai lagi."""
    global _sidik
    if _sidik is None:
        h = hashlib.sha256()
        for f in sorted((DIR / "src").rglob("*")) + [DIR / "package-lock.json", SERVER]:
            if f.is_file():
                h.update(f.relative_to(DIR).as_posix().encode())
                h.update(f.read_bytes())
        _sidik = h.hexdigest()
    return _sidik


def kunci_bundle() -> str:
    """Bundle = kode + isi public/ (font disalin ke bundle saat bundling) → font baru = bundle baru."""
    h = hashlib.sha256(sidik_sumber().encode())
    pub = DIR / "public"
    for f in sorted(pub.rglob("*")) if pub.exists() else []:
        if f.is_file():
            h.update(f"{f.relative_to(pub).as_posix()}:{f.stat().st_size}".encode())
    return h.hexdigest()[:16]


def siap() -> None:
    if not shutil.which("node"):
        raise GagalPipeline("Node.js tidak ditemukan di PATH (dibutuhkan untuk elemen remotion).")
    if not (DIR / "node_modules" / "@remotion" / "renderer").exists():
        raise GagalPipeline("Remotion belum terpasang: jalankan 'npm install' di folder remotion/.")


def siapkan_font(tokens: dict) -> None:
    """Salin file font token ke remotion/public/fonts/ → Remotion memuatnya lewat FontFace (lib/font.ts), jadi teks
    perangkat memakai file font yang SAMA dengan render.py (font lama seperti OCR A Extended tidak dikenali Chrome)."""
    tujuan = DIR / "public" / "fonts"
    tujuan.mkdir(parents=True, exist_ok=True)
    for v in tokens.get("font", {}).values():
        f = v.get("file")
        if f and not (tujuan / f).exists():
            shutil.copy(cari_font(f), tujuan / f)


class _Server:
    """Proses render-server.mjs: dinyalakan saat overlay pertama dibutuhkan, dihentikan saat Python keluar."""

    def __init__(self):
        self.proc: subprocess.Popen | None = None
        self.kunci: str | None = None
        self.log_path = DIR_BUNDLE / "server.log"
        self.n = 0

    def _baca(self) -> dict:
        """Baris protokol berikutnya ("@@J {...}"); baris lain diabaikan."""
        while True:
            baris = self.proc.stdout.readline()
            if not baris:
                self.proc.wait()
                raise GagalPipeline(f"render-server Remotion berhenti (kode {self.proc.returncode}):\n{self._ekor()}")
            if baris.startswith("@@J "):
                return json.loads(baris[4:])

    def _ekor(self, n: int = 25) -> str:
        try:
            return "\n".join(self.log_path.read_text(encoding="utf-8", errors="replace").strip().splitlines()[-n:])
        except OSError:
            return ""

    def mulai(self, kunci: str) -> None:
        if self.proc and self.proc.poll() is None and self.kunci == kunci:
            return
        self.stop()
        DIR_BUNDLE.mkdir(exist_ok=True)
        if not (DIR_BUNDLE / kunci / "index.html").exists():
            log("remotion", "bundle kode Remotion (sekali per versi kode/font) …")
        self._log = self.log_path.open("w", encoding="utf-8")
        self.proc = subprocess.Popen(["node", str(SERVER), "--bundle", str(DIR_BUNDLE / kunci)], cwd=DIR,
                                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=self._log,
                                     text=True, encoding="utf-8", errors="replace", bufsize=1)
        self.kunci = kunci
        if not self._baca().get("siap"):
            raise GagalPipeline(f"render-server Remotion gagal siap:\n{self._ekor()}")

    def render(self, komposisi: str, props: dict, out) -> None:
        self.n += 1
        req = {"id": self.n, "komposisi": komposisi, "props": props, "out": str(out)}
        self.proc.stdin.write(json.dumps(req, ensure_ascii=False) + "\n")
        self.proc.stdin.flush()
        r = self._baca()
        if r.get("id") != self.n or not r.get("ok"):
            ekor = "\n".join(str(r.get("error", "")).strip().splitlines()[:20])
            raise GagalPipeline(f"Remotion gagal merender {komposisi}:\n{ekor}")

    def stop(self) -> None:
        if self.proc and self.proc.poll() is None:
            try:
                self.proc.stdin.close()  # server menutup browser lalu keluar
                self.proc.wait(timeout=20)
            except (OSError, subprocess.TimeoutExpired):
                self.proc.kill()
        self.proc = None
        if getattr(self, "_log", None):
            self._log.close()
            self._log = None


_server = _Server()
atexit.register(_server.stop)


def render_overlay(p: Proyek, komposisi: str, props: dict) -> tuple:
    """→ (path .mov, dari_cache: bool)."""
    siapkan_font(props["tokens"])
    # isi file font ikut kunci: file diganti dengan nama sama (versi font baru) → overlay dirender ulang
    font = {f: sha_file(DIR / "public" / "fonts" / f)[:16] for f in sorted({v["file"] for v in props["tokens"].get("font", {}).values()
                                                                             if v.get("file")})}
    kunci = sha_data({"komposisi": komposisi, "props": props, "sumber": sidik_sumber(), "font": font})[:16]
    d = p.cache / "remotion"
    d.mkdir(parents=True, exist_ok=True)
    out = d / f"{komposisi}-{kunci}.mov"
    if out.exists():
        return out, True
    siap()
    tulis_json(d / f"{komposisi}-{kunci}.props.json", props)  # untuk debug / Remotion Studio
    tmp = d / f"{komposisi}-{kunci}.tmp.mov"
    log("remotion", f"render {komposisi} ({props['durasiFrame']} frame) …")
    _server.mulai(kunci_bundle())
    _server.render(komposisi, props, tmp)
    if not tmp.exists():
        raise GagalPipeline(f"Remotion tidak menghasilkan {tmp.name}.")
    tmp.replace(out)
    return out, False
