"""Bersama untuk test: jalur skrip pipeline + proyek sementara.

Jalankan semua test:  .venv\\Scripts\\python -m unittest discover -s pipeline/tests -v
"""
from __future__ import annotations

import json
import shutil
import sys
import tempfile
from pathlib import Path

SKRIP = Path(__file__).resolve().parents[1] / "scripts"
if str(SKRIP) not in sys.path:
    sys.path.insert(0, str(SKRIP))

from sistem import ROOT  # noqa: E402


def proyek_sementara(beat_sheet: dict | None = None) -> Path:
    """Salinan _template-proyek di folder temp (gaya/template versi terbaru). Hapus dengan shutil.rmtree."""
    d = Path(tempfile.mkdtemp(prefix="uji-video-")) / "proyek"
    shutil.copytree(ROOT / "proyek" / "_template-proyek", d)
    m = json.loads((d / "manifest.json").read_text(encoding="utf-8"))
    m.update(proyek="uji", gaya="glass-tech", template="explainer")
    (d / "manifest.json").write_text(json.dumps(m), encoding="utf-8")
    if beat_sheet is not None:
        (d / "beat-sheet.json").write_text(json.dumps(beat_sheet), encoding="utf-8")
    return d


def hapus(d: Path) -> None:
    shutil.rmtree(d.parent, ignore_errors=True)
