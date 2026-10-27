"""Ekspor: satu platform → satu file <proyek>.mp4; beberapa platform → file per platform."""
from __future__ import annotations

import unittest
from pathlib import Path
from types import SimpleNamespace

import _dasar  # noqa: F401  (jalur skrip)
from ekspor import path_platform


class UjiPathEkspor(unittest.TestCase):
    def proyek(self, platform):
        return SimpleNamespace(out=Path("out"), manifest={"proyek": "x", "platform": platform})

    def test_satu_platform_satu_file(self):
        self.assertEqual(path_platform(self.proyek(["reels"]), "reels").name, "x.mp4")

    def test_beberapa_platform_per_file(self):
        self.assertEqual(path_platform(self.proyek(["reels", "tiktok"]), "tiktok").name, "x_tiktok.mp4")


if __name__ == "__main__":
    unittest.main()
