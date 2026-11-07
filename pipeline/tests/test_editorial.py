"""Komposisi campuran harus memakai renderer editorial melalui pintu video.py."""
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import _dasar  # noqa: F401
import video


class EditorialRouting(unittest.TestCase):
    def test_render_mixed_layout_does_not_fall_back_to_split(self):
        project = SimpleNamespace(dir=Path("proyek/uji"))
        with patch("video.baca_json", return_value={"editorial_props": "production-props.json"}), \
                patch("editorial.render") as render, patch("split.render") as old_render, \
                patch("thumbnail.generate") as cover:
            self.assertEqual(video.split_satu_pintu(project, "render"), 0)
        render.assert_called_once_with(project)
        old_render.assert_not_called()
        cover.assert_called_once_with(project)

    def test_all_propagates_failed_media_qa(self):
        project = SimpleNamespace(dir=Path("proyek/uji"))
        with patch("video.baca_json", return_value={"editorial_props": "production-props.json"}), \
                patch("editorial.render"), patch("editorial.qa", return_value=False), patch("thumbnail.generate"):
            self.assertEqual(video.split_satu_pintu(project, "semua"), 1)


if __name__ == "__main__":
    unittest.main()
