"""Cover delivery must preserve brand, legibility, and an existing valid output on failure."""
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

from PIL import Image

import _dasar  # noqa: F401
import ekspor
import thumbnail
import video
from sistem import GagalPipeline, SEMENTARA, baca_json


class CoverDelivery(unittest.TestCase):
    def test_unknown_explicit_brand_is_rejected_and_no_substring_guessing(self):
        p = SimpleNamespace(dir=Path("2026-11_notcat"), manifest={})
        self.assertIsNone(thumbnail.brand_for(p))
        p.manifest = {"thumbnail": {"brand": "wrong"}}
        with self.assertRaises(GagalPipeline):
            thumbnail.brand_for(p)

    def test_four_brands_keep_face_clear_and_fit_both_formats(self):
        photo = Image.new("RGB", (1080, 1920), "#666666")
        for brand in ("otca", "info-jerman", "jepang-koey", "ciao-manda"):
            for fmt, size in (("reels", (1080, 1920)), ("grid", (1080, 1440))):
                with self.subTest(brand=brand, format=fmt):
                    image, qa = thumbnail.compose(photo, [.32, .2, .68, .4], brand,
                                                  "JUDUL VIDEO", "Isi sesuai narasi.", fmt, {})
                    self.assertEqual(image.size, size)
                    self.assertGreater(min(b[1] for b in qa["text_boxes"]), qa["face"][3] + 18)

    def test_failure_keeps_both_existing_covers_and_marks_qa_failed(self):
        with tempfile.TemporaryDirectory(dir=SEMENTARA) as tmp:
            p = SimpleNamespace(dir=Path(tmp), out=Path(tmp), simpan_manifest=Mock(),
                                manifest={"thumbnail": {"brand": "otca", "headline": "TERLALU PANJANG " * 30}})
            for name in ("thumbnail.png", "thumbnail-grid.png"):
                (p.out / name).write_bytes(b"previous approved cover")
            with patch("thumbnail.select_photo", return_value=(Image.new("RGB", (1080, 1920)),
                                                               [.32, .2, .68, .4], {})):
                with self.assertRaisesRegex(GagalPipeline, "diringkas"):
                    thumbnail.generate(p)
            self.assertEqual(baca_json(p.out / "thumbnail-qa.json")["status"], "GAGAL")
            for name in ("thumbnail.png", "thumbnail-grid.png"):
                self.assertEqual((p.out / name).read_bytes(), b"previous approved cover")
            p.simpan_manifest.assert_not_called()

    def test_legacy_split_also_delivers_cover(self):
        p = SimpleNamespace(dir=Path("proyek/uji"))
        with patch("video.baca_json", return_value={}), patch("split.render") as render, \
                patch("thumbnail.generate") as cover:
            self.assertEqual(video.split_satu_pintu(p, "render"), 0)
        render.assert_called_once_with(p)
        cover.assert_called_once_with(p)

    def test_export_delivers_cover_once_after_all_platforms(self):
        with tempfile.TemporaryDirectory(dir=SEMENTARA) as tmp:
            master = Path(tmp) / "master.mov"
            master.touch()
            settings = {"ekspor.platform": {name: {"vcodec": "libx264", "profile": "high", "level": "4.1",
                        "crf": 18, "maxrate": "10M", "bufsize": "20M", "acodec": "aac", "abitrate": "192k"}
                        for name in ("reels", "tiktok")}, "ekspor.pix_fmt": "yuv420p"}
            p = SimpleNamespace(master_path=master, out=Path(tmp), W=1080, H=1920, fps=30,
                                manifest={"proyek": "uji", "platform": ["reels", "tiktok"]}, t=settings.get)
            events = []
            with patch("ekspor.jalankan", side_effect=lambda cmd: events.append("export")), \
                    patch("thumbnail.generate", side_effect=lambda p: events.append("cover")):
                self.assertEqual(len(ekspor.ekspor(p)), 2)
            self.assertEqual(events, ["export", "export", "cover"])


if __name__ == "__main__":
    unittest.main()
