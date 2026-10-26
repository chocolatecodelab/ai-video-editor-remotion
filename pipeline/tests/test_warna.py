"""Pembaca video: klip HD tanpa tag matriks warna dibaca sebagai BT.709 (bukan BT.601) — warna b-roll pengguna tidak
bergeser — dan hasilnya sama dengan klip bertanda di semua jalur (biasa, cover, RGBA)."""
from __future__ import annotations

import shutil
import tempfile
import unittest
from pathlib import Path

import numpy as np

import _dasar  # noqa: F401  (jalur skrip)
from render_dasar import Pembaca, matriks_masuk
from sistem import jalankan

WARNA = (200, 50, 50)  # merah bata: selisih BT.601/BT.709 besar di warna jenuh


def _klip(path: Path, bertanda: bool, ukuran="1280x720") -> None:
    hapus_tag = [] if bertanda else ["-bsf:v", "h264_metadata=colour_primaries=2:transfer_characteristics=2:matrix_coefficients=2"]
    jalankan(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi",
              "-i", f"color=c=0x{WARNA[0]:02X}{WARNA[1]:02X}{WARNA[2]:02X}:s={ukuran}:r=30:d=0.2",
              "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p", "-c:v", "libx264", "-crf", "1",
              *hapus_tag, path])


class UjiMatriksMasuk(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d = Path(tempfile.mkdtemp(prefix="uji-warna-"))
        cls.tanpa, cls.dengan = cls.d / "tanpa-tag.mp4", cls.d / "bertanda.mp4"
        _klip(cls.tanpa, bertanda=False)
        _klip(cls.dengan, bertanda=True)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.d, ignore_errors=True)

    def _baca(self, path: Path, **kw) -> np.ndarray:
        r = Pembaca(path, 0, 1280, 720, 30, **kw)
        try:
            return r.baca()[360, 640, :3].astype(int)
        finally:
            r.tutup()

    def test_tanpa_tag_hd_dianggap_bt709(self):
        self.assertEqual(matriks_masuk(str(self.tanpa)), ("bt709", "tv"))

    def test_warna_tidak_bergeser_di_semua_jalur(self):
        acuan = self._baca(self.dengan)
        self.assertLessEqual(np.abs(acuan - WARNA).max(), 6)  # range TV + subsampling kroma
        for kw in ({}, {"cover": True}, {"rgba": True}):
            with self.subTest(**kw):
                self.assertLessEqual(np.abs(self._baca(self.tanpa, **kw) - acuan).max(), 1)


class UjiDither(unittest.TestCase):
    """ke_uint8: gradien halus tidak berpita, tidak ada bias gelap, deterministik per frame (render paralel identik)."""

    def setUp(self):
        from render_dasar import ke_uint8
        self.ke_uint8 = ke_uint8
        # gradien sangat landai: 4 tingkat di 1080 px (vignette/panel kaca) → tanpa dither jadi 5 pita lebar
        self.grad = np.tile(np.linspace(100.0, 104.0, 1080, dtype=np.float32)[None, :, None], (400, 1, 3))

    def test_rata_rata_kolom_mengikuti_gradien(self):
        hasil = self.ke_uint8(self.grad, 7).astype(np.float32)
        galat_dither = np.abs(hasil.mean(axis=0) - self.grad[0]).max()
        galat_potong = np.abs(np.clip(self.grad, 0, 255).astype(np.uint8)[0] - self.grad[0]).max()
        self.assertLess(galat_dither, 0.2)   # pita hilang: rata-rata lokal mengikuti nilai asli
        self.assertGreater(galat_potong, 0.9)  # cara lama: pita setebal 1 tingkat + bias ke bawah

    def test_tanpa_bias_dan_deterministik(self):
        a, b = self.ke_uint8(self.grad, 3), self.ke_uint8(self.grad, 3)
        self.assertTrue(np.array_equal(a, b))
        self.assertLess(abs(a.astype(np.float32).mean() - self.grad.mean()), 0.05)
        self.assertFalse(np.array_equal(a, self.ke_uint8(self.grad, 4)))  # derau berganti tiap frame


if __name__ == "__main__":
    unittest.main()
