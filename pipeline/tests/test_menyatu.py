"""K10 grafis menyatu dengan rekaman: grain, grade ke palet gaya, arah bayangan dari cahaya wajah, cek QA."""
from __future__ import annotations

import unittest

import numpy as np

import _dasar
import menyatu
import qa
from sistem import Proyek


class UjiGrain(unittest.TestCase):
    def test_deterministik_dan_kekuatan(self):
        cfg = {"kekuatan": 3.0, "ukuran": 1.4, "kroma": 0.2, "midtone": 0.0}
        a = menyatu.grain(np.full((240, 160, 3), 128, np.float32), 7, cfg)
        b = menyatu.grain(np.full((240, 160, 3), 128, np.float32), 7, cfg)
        c = menyatu.grain(np.full((240, 160, 3), 128, np.float32), 8, cfg)
        np.testing.assert_array_equal(a, b)  # berurutan = paralel
        self.assertFalse(np.array_equal(a, c))
        self.assertAlmostEqual(float(a[..., 1].std()), 3.0, delta=0.3)

    def test_mati(self):
        f = np.full((8, 8, 3), 50, np.float32)
        menyatu.grain(f, 0, {"kekuatan": 0})
        self.assertTrue((f == 50).all())

    def test_derau_menyamakan_grafis_dan_rekaman(self):
        rng = np.random.default_rng(0)
        img = np.full((256, 256, 3), 120, np.float32)
        img[:, 128:] += rng.normal(0, 2.0, (256, 128, 1))  # kanan = "rekaman" berderau, kiri = panel bersih
        kiri, kanan = np.zeros((256, 256), bool), np.zeros((256, 256), bool)
        kiri[:, :128], kanan[:, 128:] = True, True
        gray = lambda x: np.clip(x, 0, 255).astype(np.uint8)[..., 1]
        sebelum = menyatu.derau(gray(img), kiri) / menyatu.derau(gray(img), kanan)
        menyatu.grain(img, 3, {"kekuatan": 3.0, "ukuran": 1.4, "midtone": 0})
        sesudah = menyatu.derau(gray(img), kiri) / menyatu.derau(gray(img), kanan)
        self.assertLess(sebelum, 0.5)
        self.assertGreater(sesudah, 0.6)


class UjiGrade(unittest.TestCase):
    warna = {"latar": "#0B0F17", "aksen": "#5EE6FF", "netral": "#808080"}

    def test_identitas_bila_kosong(self):
        lut, sat = menyatu.lut_grade({}, self.warna)
        np.testing.assert_array_equal(lut[:, 0, 0], np.arange(256))
        self.assertEqual(sat, 1.0)

    def test_bayangan_condong_ke_warna_latar(self):
        lut, _ = menyatu.lut_grade({"bayangan": "latar", "bayangan-kekuatan": 0.08}, self.warna)
        r, b = int(lut[30, 0, 0]), int(lut[30, 0, 2])
        self.assertGreater(b, 30)  # latar biru gelap → bayangan kebiruan
        self.assertLessEqual(r, 30)
        self.assertEqual(int(lut[255, 0, 2]), 255)  # sorot tidak tersentuh split-tone bayangan

    def test_warna_netral_tanpa_tint_dan_kekuatan_nol(self):
        lut, _ = menyatu.lut_grade({"bayangan": "netral", "bayangan-kekuatan": 0.2}, self.warna)
        np.testing.assert_array_equal(lut[:, 0, 0], lut[:, 0, 2])
        lut, sat = menyatu.lut_grade({"kekuatan": 0, "kontras": 0.3, "suhu": 1, "saturasi": 0.5}, self.warna)
        np.testing.assert_array_equal(lut[:, 0, 1], np.arange(256))
        self.assertEqual(sat, 1.0)

    def test_saturasi_dan_delta_e(self):
        img = np.zeros((4, 4, 3), np.uint8)
        img[..., 0] = 200
        lut, sat = menyatu.lut_grade({"saturasi": 0.5}, self.warna)
        out = menyatu.terapkan_grade(img, lut, sat)
        self.assertLess(int(out[0, 0, 0]), 200)
        self.assertGreater(int(out[0, 0, 1]), 0)
        self.assertGreater(float(menyatu.delta_e(img, out).mean()), 5)


class UjiCahaya(unittest.TestCase):
    def wajah(self, kiri: int, kanan: int) -> np.ndarray:
        g = np.zeros((200, 200), np.uint8)
        g[:, :100], g[:, 100:] = kiri, kanan
        return g

    def test_asimetri_wajah(self):
        a = menyatu.asimetri_wajah(self.wajah(80, 160), (40, 20, 160, 180))
        self.assertAlmostEqual(a, 80 / 240, places=3)
        self.assertIsNone(menyatu.asimetri_wajah(self.wajah(1, 1), (0, 0, 10, 10)))

    def test_cahaya_kanan_bayangan_ke_kiri(self):
        cfg = {"asimetri-penuh": 0.15, "sudut-maks": 40}
        est = menyatu.perkiraan_cahaya([0.2, 0.18, 0.22, 0.19], "wajah", cfg)
        self.assertEqual(est["sudut"], -40.0)
        self.assertEqual(est["keyakinan"], 1.0)
        bingkai = menyatu.perkiraan_cahaya([0.2, 0.18, 0.22, 0.19], "bingkai", cfg)
        self.assertEqual(bingkai["keyakinan"], 0.5)
        ragu = menyatu.perkiraan_cahaya([0.05, -0.04, 0.03, -0.05], "wajah", cfg)
        self.assertLess(ragu["keyakinan"], 0.35)
        self.assertEqual(menyatu.perkiraan_cahaya([], "wajah", cfg)["sumber"], "bawaan")

    def test_putar_offset(self):
        self.assertEqual(menyatu.putar([0, 10], -36.87), ([-6, 8], -36.9))
        baru, ef = menyatu.putar([14, 14], 30, batas=60)  # 45° + 30° → dibatasi 60°
        self.assertEqual(ef, 15.0)
        self.assertEqual(baru, [17, 10])
        self.assertEqual(menyatu.putar([0, 0], 20), ([0, 0], 0.0))


class UjiQA(unittest.TestCase):
    def setUp(self):
        self.d = _dasar.proyek_sementara()
        self.p = Proyek(self.d)

    def tearDown(self):
        _dasar.hapus(self.d)

    def test_k10_selalu_terpakai(self):
        self.assertIn("menyatu", [k.nama for k in self.p.konteks])
        self.assertTrue({"grain", "grade", "cahaya"} <= set(self.p.tokens))

    def ctx(self, menyatu_: dict) -> qa.Ctx:
        return qa.Ctx(self.p, {"elemen": [], "zona_aman": [0, 0, 1080, 1920], "menyatu": menyatu_})

    def test_cek_grade_dan_bayangan(self):
        b = {"sudut": -30.0, "keyakinan": 0.8, "sumber": "wajah", "asimetri": 0.11, "sampel": 16, "dipakai": True,
             "offset_token": [0, 10], "offset": [-5, 9], "putar": -30.0}
        c = self.ctx({"bayangan": b, "grade": {"aktif": True, "setelan": {}, "ukur": {"de_rata": 3.0, "de_wajah": 2.5,
                                                                                       "sampel": 3}}})
        self.assertEqual(qa._arah_bayangan(c)[0], qa.LULUS)
        self.assertEqual(qa._grade(c)[0], qa.LULUS)
        c.L["menyatu"]["bayangan"] = {**b, "putar": 30.0, "offset": [5, 9]}
        self.assertEqual(qa._arah_bayangan(c)[0], qa.GAGAL)
        c.L["menyatu"]["grade"]["ukur"]["de_wajah"] = 9.0
        self.assertEqual(qa._grade(c)[0], qa.GAGAL)
        c.L["menyatu"]["grade"] = {"aktif": False}
        self.assertEqual(qa._grade(c)[0], qa.LULUS)
        self.assertEqual(qa._grain(self.ctx({}))[0], qa.GAGAL)  # layout lama tanpa catatan grain


if __name__ == "__main__":
    unittest.main()
