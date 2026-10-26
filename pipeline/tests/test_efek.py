"""Efek & generator slot: alias nama efek, tabel slot dari modul, lookahead K09.1, lensa kaca cair, efek kamera baru."""
from __future__ import annotations

import unittest
from types import SimpleNamespace

import numpy as np

import _dasar  # noqa: F401  (jalur skrip)
import slot
from perangkat import kunci_perangkat
from render_kamera import KAMERA, KAMERA_MASK, KameraMixin, param_efek
from render_pip import PipMixin
from roto import KAMERA_MASK as ROTO_MASK
from sistem import resolve


class UjiAlias(unittest.TestCase):
    def test_alias_ke_modul_kanonik(self):
        for nama, harap in (("dolly zoom", "vertigo"), ("magazine-cover", "cover-story"), ("Green Screen", "green-screen"),
                            ("b-roll overlay", "broll-overlay"), ("liquid glass", "liquid-glass")):
            self.assertEqual(resolve("efek", nama).nama, harap, nama)

    def test_mask_kamera_sinkron_dengan_roto(self):
        self.assertEqual(KAMERA_MASK, ROTO_MASK)  # roto harus membuat mask untuk semua efek kamera ber-mask
        self.assertTrue(KAMERA_MASK <= set(KAMERA))

    def test_param_bawaan_dari_modul(self):
        self.assertEqual(param_efek("snap-zoom")["skala"], 1.45)
        self.assertEqual(param_efek("tidak-ada"), {})


class UjiSlot(unittest.TestCase):
    def test_tabel_menggabung_slot_modul(self):
        tabel = slot.tabel_slot(slot.tokens_gaya("kolase-kertas"))
        self.assertIn("paper-cutout", tabel["kamera"])
        self.assertIn("growth-curve", tabel["bukti"])
        self.assertIn(("portal", ["apple-glass", "glass-tech", "kaca-gelap", "minimalism", "rts-modern"]), tabel["_transisi"])

    def test_tidak_memilih_perangkat_tetap_beat_berikutnya(self):
        kd = {"variasi_min": 1, "butuh": {"rekaman": True}, "beat_sheet": {"caption": {"aktif": True}, "beats": [
            {"id": "a", "mulai": 0, "selesai": 6, "elemen": [
                {"slot": "membantah", "isi": {"chip": "Salah", "anggapan": "anggapan lama"}, "mulai": 0.2, "selesai": 6,
                 "kandidat": ["chip-salah", "coret"]}]},
            {"id": "b", "mulai": 6, "selesai": 12, "elemen": [
                {"tipe": "chip", "status": "salah", "teks": "Tetap", "mulai": 6.2, "selesai": 12, "fungsi": "membantah"}]}]}}
        for s in range(6):
            d = slot.rakit(kd, "glass-tech", s, "uji")
            dipilih = d["beat_sheet"]["beats"][0]["elemen"][0]
            self.assertNotEqual(kunci_perangkat(dipilih, []), "chip-salah")


class _Palsu(KameraMixin, PipMixin):
    """Renderer minimal untuk menguji fungsi efek per frame tanpa video."""

    def __init__(self, W=60, H=100):
        tok = {"warna": {"latar": "#202020", "aksen": "#33CCFF", "aksen-2": "#FF6699", "panel": "#FFFFFF"}}
        self.p = SimpleNamespace(W=W, H=H, fps=30, px=lambda v: max(1, int(round(v * 0.1))),
                                 t=lambda k, d=None: tok["warna"][k.split(".")[1]] if k.startswith("warna.") else d)
        self.ease = {"standar": lambda x: x, "keluar": lambda x: x}
        self.wajah = None
        self._m = np.zeros((H, W), np.float32)
        self._m[30:80, 20:40] = 1.0

    def _mask(self, i):
        return self._m


class UjiEfekFrame(unittest.TestCase):
    def setUp(self):
        self.r = _Palsu()
        rng = np.random.default_rng(1)
        self.src = (rng.random((100, 60, 3)) * 255).astype(np.float32)

    def test_lensa_hanya_mengubah_dalam_bentuk(self):
        al = np.zeros((100, 60, 1), np.float32)
        al[20:60, 10:50] = 0.1
        hasil = self.r._lensa(self.src, al)
        self.assertEqual(hasil.shape, self.src.shape)
        np.testing.assert_array_equal(hasil[:15], self.src[:15])          # di luar panel: tidak tersentuh
        self.assertGreater(float(np.abs(hasil[25:55, 15:45] - self.src[25:55, 15:45]).mean()), 1.0)  # di dalam: dibiaskan

    def test_paper_cutout_subjek_utuh_latar_berganti(self):
        k = {"cfg": {"tepi-px": 30, "getar-px": 0}}
        hasil = self.r._paper_cutout(k, self.src.copy(), 0, 0.5, 1.0, 1.0, 30, 40)
        np.testing.assert_allclose(hasil[50, 30], self.src[50, 30], atol=1)  # subjek tetap rekaman asli
        self.assertLess(abs(float(hasil[5, 5].mean()) - 32), 8)              # latar = warna latar gaya (#202020)

    def test_snap_zoom_kembali_normal_di_ujung(self):
        k = {"cfg": {"skala": 1.5, "durasi-masuk": 0.16, "durasi-keluar": 0.14}, "selesai": 2.0}
        akhir = self.r._snap_zoom(k, self.src, 60, 2.0, 1.0, 30, 40, 2.0)  # tepat di ujung: skala kembali 1
        np.testing.assert_allclose(akhir, self.src, atol=2)


if __name__ == "__main__":
    unittest.main()
