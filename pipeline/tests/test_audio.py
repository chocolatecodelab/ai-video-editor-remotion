"""Audio: musik latar fade masuk & keluar (selesai tepat di akhir video), bukan terpotong mendadak."""
from __future__ import annotations

import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

import _dasar  # noqa: F401  (jalur skrip)
from render_audio import FADE_KELUAR_MUSIK, filter_musik


def _rms_db(path: Path, mulai: float, durasi: float) -> float:
    """RMS (dB) potongan audio [mulai, mulai+durasi)."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-ss", f"{mulai}", "-t", f"{durasi}", "-i", str(path),
                        "-af", "astats=measure_overall=RMS_level:measure_perchannel=none", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace", stdin=subprocess.DEVNULL)
    m = re.findall(r"RMS level dB:\s*(-?inf|-?[\d.]+)", r.stderr)
    return float("-inf") if not m or "inf" in m[-1] else float(m[-1])


class UjiFilterMusik(unittest.TestCase):
    def test_fade_selesai_tepat_di_akhir(self):
        f = filter_musik(48000, -22, 30.0)
        self.assertIn("afade=t=in:st=0:d=0.300", f)
        self.assertIn(f"afade=t=out:st={30 - FADE_KELUAR_MUSIK:.3f}:d={FADE_KELUAR_MUSIK:.3f}", f)

    def test_video_pendek_fade_dipendekkan(self):
        f = filter_musik(48000, -22, 2.4)  # ≤ ⅓ durasi
        self.assertIn("afade=t=out:st=1.600:d=0.800", f)

    def test_fade_nol_dilewati(self):
        self.assertNotIn("afade", filter_musik(48000, -22, 10.0, fade_masuk=0, fade_keluar=0))


class UjiMusikNyata(unittest.TestCase):
    """Musik di-loop melewati akhir video (seperti di render): ekor harus senyap, bagian tengah tidak."""

    def test_ekor_musik_senyap(self):
        d = Path(tempfile.mkdtemp(prefix="uji-musik-"))
        try:
            musik, out = d / "musik.wav", d / "campur.wav"
            subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i",
                            "sine=f=220:d=2:sample_rate=48000", str(musik)], check=True, stdin=subprocess.DEVNULL)
            dur = 6.0
            subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-stream_loop", "-1", "-i", str(musik),
                            "-af", filter_musik(48000, 0, dur) + f",atrim=0:{dur}", str(out)], check=True,
                           stdin=subprocess.DEVNULL)
            tengah, ekor = _rms_db(out, 2.0, 1.0), _rms_db(out, dur - 0.05, 0.05)
            self.assertGreater(tengah, -30)  # sine ffmpeg bawaan amplitudo 1/8 (±−21 dB)
            self.assertLess(ekor, tengah - 30)  # 50 ms terakhir hampir senyap
        finally:
            shutil.rmtree(d, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
