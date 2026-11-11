"""buat_pratinjau_preset_png — render 1 still frame PNG per preset (PRD/Vorta).
100% bebas dari objek manusia. Menggunakan Renderer.still([t]) sehingga sangat cepat (±1 s per preset).
"""
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT / "pipeline" / "scripts"))

from sistem import Proyek, baca_json, daftar_modul, frontmatter, gabung, jalankan, log, resolve, tulis_json
from video import preset_efektif
import render

PRATINJAU = ROOT / "preset" / "pratinjau"
RESOLUSI = (540, 960)

# Titik waktu terbaik untuk tiap preset (saat perangkat utama aktif penuh)
TITIK_PRESET = {
    "glass-tech-bukti-sosial": 18.0,
    "glass-tech-tutorial-langkah": 17.0,
    "bold-kinetic-mitos-fakta": 6.0,
    "bold-kinetic-bukti-sosial": 2.0,
    "apple-glass-kata-prompt": 2.0,
    "kaca-gelap-mitos-fakta": 6.0,
    "arang-lime-tutorial-langkah": 17.0,
    "rts-modern-bukti-sosial": 18.0,
    "paper-motion-tutorial-langkah": 17.0,
    "minimalism-minimal-quote": 22.0,
    "retro-brutalism-mitos-fakta": 21.0,
    "kertas-tipografi-minimal-quote": 22.0,
    "kolase-kertas-kata-prompt": 10.0,
    "doodle-art-kata-prompt": 15.0,
    "sketch-art-tutorial-langkah": 17.0,
    "coffee-lofi-minimal-quote": 22.0,
}

def render_preset_png(nama: str | None = None, paksa: bool = False) -> None:
    PRATINJAU.mkdir(parents=True, exist_ok=True)
    semua = [m for m in daftar_modul("preset", termasuk_arsip=False) if not nama or m.nama == nama]
    dasar = ROOT / "proyek" / "_pratinjau" / "_dasar" / "cache"

    for m in semua:
        png_out = PRATINJAU / f"{m.nama}.png"
        if not paksa and png_out.exists() and png_out.stat().st_mtime >= m.path.stat().st_mtime:
            continue

        d = preset_efektif(baca_json(m.path), 0)
        g, t = resolve("gaya", d["gaya"]), resolve("template", d["template"])
        gfm, _ = frontmatter(g.path)
        tujuan = ROOT / "proyek" / "_pratinjau" / f"still-preset-{m.nama}"

        shutil.rmtree(tujuan, ignore_errors=True)
        shutil.copytree(ROOT / "proyek" / "_template-proyek", tujuan)

        mf = gabung(baca_json(tujuan / "manifest.json"), d.get("manifest", {}))
        mf.update(proyek=f"pratinjau-{m.nama}", gaya=g.ref, template=t.ref, preset=m.ref,
                  koreografi=d.get("_koreografi"),
                  konteks=gfm.get("konteks", []) + [k for k in d.get("_konteks_tambahan", []) if k not in gfm.get("konteks", [])],
                  token_override={"format": {"resolusi": list(RESOLUSI)}})
        mf["aset"]["rekaman"] = "pratinjau (clean background)"
        tulis_json(tujuan / "manifest.json", mf)
        tulis_json(tujuan / "beat-sheet.json", d["beat_sheet"])

        c = tujuan / "cache"
        c.mkdir(parents=True, exist_ok=True)
        for f in ("ingest.mp4", "audio.wav", "words.json"):
            if (dasar / f).exists():
                shutil.copy(dasar / f, c / f)

        p = Proyek(tujuan)
        t_target = TITIK_PRESET.get(m.nama, 5.0)

        log("pratinjau-preset", f"{m.id} {m.nama} ({g.nama}): still frame t={t_target:.2f}s …")
        r = render.Renderer(p)
        stills = r.still([t_target])
        if stills and stills[0].exists():
            shutil.copy(stills[0], png_out)
            log("pratinjau-preset", f"→ {png_out.relative_to(ROOT)}")
        shutil.rmtree(tujuan, ignore_errors=True)

if __name__ == "__main__":
    paksa = "--paksa" in sys.argv
    args = [a for a in sys.argv[1:] if a != "--paksa"]
    arg = args[0] if args else None
    render_preset_png(arg, paksa=paksa)
