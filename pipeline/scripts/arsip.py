"""arsip — catat modul & versi yang dipakai ke manifest, perbarui INDEX.md, git commit + tag.

Pemakaian:
    python arsip.py <folder-proyek> [--paksa] [--tanpa-git]

Syarat : out/qa.json berstatus LULUS (kecuali --paksa).
Output : manifest.terpakai + manifest.riwayat[], out/terpakai.json, baris proyek di INDEX.md,
         commit "arsip(<proyek>): vN" + tag "<proyek>/vN" (bila folder sistem adalah repo git).
Media besar (cache/, *.mov, *.mp4, *.wav) tidak di-commit — lihat .gitignore.
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import subprocess

from sistem import ROOT, GagalPipeline, Proyek, baca_json, log, main_aman, sha_file, tulis_json


def perbarui_index(id_: str, template: str, gaya: str, status: str) -> None:
    f = ROOT / "INDEX.md"
    teks = f.read_text(encoding="utf-8")
    baris = f"| {id_} | {template} | {gaya} | {status} |"
    pola = re.compile(rf"^\| {re.escape(id_)} \|.*$", re.M)
    if pola.search(teks):
        teks = pola.sub(baris, teks)
    else:
        m = re.search(r"(## Proyek\n(?:.*\n)*?\|---\|.*\n(?:\|.*\n)*)", teks)
        if not m:
            raise GagalPipeline("Tabel '## Proyek' di INDEX.md tidak ditemukan.")
        teks = teks[:m.end()] + baris + "\n" + teks[m.end():]
    f.write_text(teks, encoding="utf-8")


def _git(*arg) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "-C", str(ROOT), *arg], capture_output=True, text=True, encoding="utf-8")


def arsip(p: Proyek, paksa: bool = False, tanpa_git: bool = False) -> dict:
    qa = baca_json(p.out / "qa.json", {})
    if qa.get("status") != "LULUS" and not paksa:
        raise GagalPipeline(f"QA belum LULUS (status: {qa.get('status', 'belum dijalankan')}). Perbaiki dulu atau --paksa.")
    m = p.manifest
    riwayat = m.setdefault("riwayat", [])
    versi = len(riwayat) + 1
    hasil = {f.name: sha_file(f)[:16] for f in sorted(p.out.glob("*")) if f.suffix in (".mov", ".mp4")}
    terpakai = {**p.modul_terpakai(), "qa": qa.get("status"), "qa_ringkas": qa.get("ringkas"), "hasil": hasil}
    m["terpakai"] = terpakai
    m["status"] = "selesai"
    riwayat.append({"versi": versi, "waktu": dt.datetime.now().isoformat(timespec="seconds"),
                    "qa": qa.get("status"), "gaya": terpakai["gaya"]["ref"], "template": terpakai["template"]["ref"]})
    p.simpan_manifest()
    tulis_json(p.out / "terpakai.json", terpakai)
    di_sistem = p.dir.parent == ROOT / "proyek"
    if di_sistem:
        perbarui_index(m["proyek"], terpakai["template"]["ref"], terpakai["gaya"]["ref"], f"selesai v{versi}")
    log("arsip", f"manifest.terpakai diperbarui (v{versi})" + ("; INDEX.md diperbarui." if di_sistem else
                                                                 " — proyek di luar proyek/, INDEX & git dilewati."))
    if tanpa_git or not di_sistem:
        return terpakai
    if _git("rev-parse", "--is-inside-work-tree").returncode != 0:
        log("arsip", "bukan repo git — lewati commit/tag (jalankan 'git init' di folder sistem).")
        return terpakai
    rel = p.dir.relative_to(ROOT).as_posix()
    _git("add", "--", rel, "INDEX.md")
    tag = f"{m['proyek']}/v{versi}"
    r = _git("commit", "-m", f"arsip({m['proyek']}): v{versi} — QA {qa.get('status')}\n\n"
                             f"gaya {terpakai['gaya']['ref']}, template {terpakai['template']['ref']}, "
                             f"konteks {', '.join(k['ref'] for k in terpakai['konteks'])}")
    if r.returncode != 0:
        log("arsip", f"commit gagal/tidak ada perubahan: {(r.stdout + r.stderr).strip()[-200:]}")
        return terpakai
    t = _git("tag", tag)
    log("arsip", f"commit + tag {tag}" + ("" if t.returncode == 0 else f" (tag gagal: {t.stderr.strip()})"))
    return terpakai


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("proyek")
    ap.add_argument("--paksa", action="store_true", help="arsipkan walau QA belum LULUS")
    ap.add_argument("--tanpa-git", action="store_true")
    arg = ap.parse_args()
    arsip(Proyek(arg.proyek), arg.paksa, arg.tanpa_git)
    return 0


if __name__ == "__main__":
    main_aman(main)
