"""Sinkron ketukan musik: deteksi tempo & fase, pilihan titik mulai musik, snap potongan."""
from __future__ import annotations

import unittest

import numpy as np

import _dasar  # noqa: F401  (jalur skrip)
import ketukan


class UjiKetukan(unittest.TestCase):
    def test_deteksi_klik_120_bpm(self):
        sr = ketukan.SR_ANALISIS
        x = np.zeros(sr * 20, np.float32)
        derau = np.random.default_rng(1).standard_normal(200)
        for t in np.arange(0.3, 20, 0.5):
            i = int(t * sr)
            x[i:i + 200] += np.hanning(200) * derau
        bpm, fase = ketukan.deteksi(x)
        self.assertAlmostEqual(bpm, 120, delta=1)
        self.assertLess(abs(fase - 0.3), 0.02)

    def test_fase_menjatuhkan_ketukan_di_potongan(self):
        periode = 0.75
        peristiwa = [(2.1, 3.0), (5.1, 3.0), (8.85, 3.0), (4.0, 1.0)]  # tiga potongan besar searah fase 0,6
        fase = ketukan.pilih_fase(periode, peristiwa)
        self.assertAlmostEqual(fase, 0.6, delta=0.01)

    def test_ofset_musik(self):
        # ketukan file di 0,2 + n·0,5; video ingin ketukan di 0,35 → mulai file di 0,35 sebelum… = (0,2 − 0,35) mod 0,5
        of = ketukan.ofset_musik(0.2, 0.35, 0.5)
        self.assertAlmostEqual(of, 0.35)
        self.assertAlmostEqual((0.2 + 0.5 - of) % 0.5, 0.35)  # ketukan file pertama setelah ofset jatuh di 0,35 video

    def test_snap_hanya_dalam_toleransi(self):
        ketuk = ketukan.titik(0.1, 0.5, 5)
        self.assertEqual(ketukan.snap(1.15, ketuk, 0.1), 1.1)
        self.assertEqual(ketukan.snap(1.35, ketuk, 0.1), 1.35)


if __name__ == "__main__":
    unittest.main()
