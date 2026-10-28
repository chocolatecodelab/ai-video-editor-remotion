"""Auto-ducking musik dari transkrip (ducking.py) + hook & pustaka layout split (split.py)."""
from __future__ import annotations

import subprocess
import tempfile
import unittest
from pathlib import Path

import numpy as np

import _dasar  # noqa: F401  (jalur skrip)
import ducking
import split

KATA = [{"w": "a", "s": 1.0, "e": 1.4}, {"w": "b", "s": 1.6, "e": 2.0}, {"w": "c", "s": 4.0, "e": 4.5}]


class UjiDucking(unittest.TestCase):
    def test_segmen_gabung_jeda_pendek(self):
        seg = ducking.segmen_bicara(KATA, 10, pra=0.1, pasca=0.3, jeda_min=0.6)
        self.assertEqual(seg, [(0.9, 2.3), (3.9, 4.8)])  # jeda 0,2 s digabung, jeda ±1,6 s dipisah

    def test_gain_turun_sebelum_kata_naik_di_jeda(self):
        seg = ducking.segmen_bicara(KATA, 10)
        self.assertEqual(ducking.gain_db(0.0, seg, -9), 0)
        self.assertAlmostEqual(ducking.gain_db(1.0, seg, -9), -9)  # kata pertama sudah di bawah musik penuh-duck
        self.assertEqual(ducking.gain_db(3.1, seg, -9), 0)  # jeda panjang: musik kembali penuh
        self.assertLess(ducking.gain_db(0.85, seg, -9), 0)  # rampa mulai sebelum pra-gulung

    def test_konfigurasi(self):
        self.assertEqual(ducking.konfigurasi({"ducking": False})["mode"], "mati")
        self.assertEqual(ducking.konfigurasi({"ducking": {"db": -12}})["db"], -12)
        self.assertEqual(ducking.konfigurasi(None)["mode"], "transkrip")
        self.assertEqual(ducking.filter_ducking([], 5, ducking.BAWAAN), "")

    def test_ekspresi_ffmpeg_sama_dengan_python(self):
        """Amplop ffmpeg (volume eval=frame) = gain_db Python di beberapa titik."""
        seg = ducking.segmen_bicara(KATA, 6)
        sr, dur = 8000, 6.0
        with tempfile.TemporaryDirectory() as d:
            out = Path(d) / "env.f32"
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i",
                            f"aevalsrc=1:s={sr}:d={dur}",
                            "-af", ducking.filter_ducking(KATA, dur, ducking.BAWAAN), "-f", "f32le", str(out)], check=True)
            x = np.fromfile(out, np.float32)
        for t in (0.2, 0.9, 1.5, 3.2, 4.2):
            ukur = 20 * np.log10(max(1e-6, float(x[int(t * sr)])))
            self.assertAlmostEqual(ukur, ducking.gain_db(t, seg, -9), delta=0.6, msg=f"t={t}")


class UjiSplit(unittest.TestCase):
    def test_hook_sfx_hanya_bila_belum_ada_bunyi_awal(self):
        self.assertEqual(split.daftar_sfx({}, [])[-1]["t"], 0)
        self.assertEqual(split.daftar_sfx({"sfx": [{"jenis": "hit-2", "t": 0.1}]}, []), [{"jenis": "hit-2", "t": 0.1}])
        self.assertEqual(split.daftar_sfx({"hook": {"sfx": None}}, []), [])

    def test_pustaka_terbaca(self):
        self.assertIn("menara-sendiri", split.modul_pustaka())


if __name__ == "__main__":
    unittest.main()
