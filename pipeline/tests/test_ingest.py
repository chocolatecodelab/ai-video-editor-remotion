"""Ingest: rekaman HDR (HLG/PQ, BT.2020 — bawaan iPhone) dikonversi ke SDR BT.709, SDR tidak tersentuh."""
from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

import _dasar
import ingest
from sistem import Proyek, ffprobe, jalankan, stream


def _klip(path: Path, hdr: bool) -> None:
    """Klip uji 1080×1920 0,5 s tanpa audio: HEVC 10-bit HLG/BT.2020 (seperti iPhone) atau H.264 SDR BT.709."""
    if hdr:
        tag = ["-color_primaries", "bt2020", "-color_trc", "arib-std-b67", "-colorspace", "bt2020nc"]
        # libx265 menulis tag VUI hanya lewat x265-params (rekaman iPhone selalu membawa tag ini)
        enc = ["-c:v", "libx265", "-x265-params", "log-level=error:colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc",
               "-pix_fmt", "yuv420p10le", "-tag:v", "hvc1"]
    else:
        tag = ["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
        enc = ["-c:v", "libx264", "-pix_fmt", "yuv420p"]
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc2=s=1080x1920:r=30:d=0.5",
              *enc, *tag, path])


class UjiDeteksiHDR(unittest.TestCase):
    def test_jenis(self):
        self.assertEqual(ingest.jenis_hdr({"color_transfer": "arib-std-b67"}), "HLG")
        self.assertEqual(ingest.jenis_hdr({"color_transfer": "smpte2084"}), "PQ")
        self.assertIsNone(ingest.jenis_hdr({"color_transfer": "bt709"}))
        self.assertIsNone(ingest.jenis_hdr({}))

    def test_filter_hanya_untuk_hdr(self):
        self.assertEqual(ingest.filter_tonemap({"color_transfer": "bt709"}), "")
        f = ingest.filter_tonemap({"color_transfer": "arib-std-b67", "color_primaries": "bt2020", "color_space": "bt2020nc"})
        self.assertIn("tin=arib-std-b67", f)  # transfer masukan eksplisit
        self.assertIn(f"tonemap={ingest.TONEMAP}", f)
        self.assertTrue(f.endswith(","))     # disambung di depan crop/scale


class UjiIngestHDR(unittest.TestCase):
    def setUp(self):
        self.d = _dasar.proyek_sementara()
        self.tmp = Path(tempfile.mkdtemp(prefix="uji-hdr-"))

    def tearDown(self):
        _dasar.hapus(self.d)
        import shutil
        shutil.rmtree(self.tmp, ignore_errors=True)

    def _ingest(self, hdr: bool) -> tuple[dict, dict]:
        src = self.tmp / ("hlg.mp4" if hdr else "sdr.mp4")
        _klip(src, hdr)
        m = json.loads((self.d / "manifest.json").read_text(encoding="utf-8"))
        m["aset"]["rekaman"] = str(src)
        (self.d / "manifest.json").write_text(json.dumps(m), encoding="utf-8")
        p = Proyek(self.d)
        hasil = ingest.ingest(p)
        return hasil, stream(ffprobe(p.ingest_video), "video")

    def test_hlg_jadi_sdr_bt709(self):
        hasil, vs = self._ingest(hdr=True)
        self.assertEqual((vs.get("color_primaries"), vs.get("color_transfer"), vs.get("color_space")), ("bt709", "bt709", "bt709"))
        self.assertTrue(any("HDR (HLG" in x for x in hasil["peringatan"]), hasil["peringatan"])

    def test_sdr_tanpa_tone_mapping(self):
        hasil, vs = self._ingest(hdr=False)
        self.assertEqual(vs.get("color_transfer"), "bt709")
        self.assertFalse(any("HDR" in x for x in hasil["peringatan"]))


if __name__ == "__main__":
    unittest.main()
