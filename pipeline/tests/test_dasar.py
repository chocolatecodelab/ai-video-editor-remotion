"""Logika murni: resolver modul, gabung token, baca JSON, parser teks, anchor waktu beat-sheet."""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import _dasar  # noqa: F401  (jalur skrip)
from beat import Waktu
from render import parse_teks
from sistem import GagalPipeline, baca_json, gabung, resolve

KATA = {"kata": [{"w": "Skill", "s": 0.5, "e": 0.9}, {"w": "itu", "s": 1.0, "e": 1.2},
                 {"w": "skill,", "s": 2.0, "e": 2.4}, {"w": "sertifikat.", "s": 3.0, "e": 3.6}]}


class UjiSistem(unittest.TestCase):
    def test_resolve_terbaru_dan_versi(self):
        m = resolve("gaya", "glass-tech")
        self.assertFalse(m.diarsip)
        self.assertEqual(resolve("gaya", f"glass-tech@{m.versi}").path, m.path)
        self.assertTrue(resolve("gaya", "glass-tech@0.1").diarsip)  # versi lama tetap bisa dirujuk dari arsip
        self.assertEqual(resolve("gaya", "G01").nama, "glass-tech")

    def test_resolve_tidak_ada(self):
        with self.assertRaises(GagalPipeline):
            resolve("gaya", "tidak-ada")
        with self.assertRaises(GagalPipeline):
            resolve("gaya", "glass-tech@9.9")

    def test_gabung_dalam_tanpa_meta_dan_tanpa_mutasi(self):
        dasar = {"a": {"x": 1, "y": 2}, "b": 1, "_meta": {"id": "x"}}
        hasil = gabung(dasar, {"a": {"y": 3}, "c": [1], "_meta": {"id": "y"}})
        self.assertEqual(hasil, {"a": {"x": 1, "y": 3}, "b": 1, "c": [1], "_meta": {"id": "x"}})
        self.assertEqual(dasar["a"]["y"], 2)

    def test_baca_json_toleran_bom(self):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "x.json"
            f.write_bytes(b"\xef\xbb\xbf" + b'{"a": 1}')
            self.assertEqual(baca_json(f), {"a": 1})


class UjiTeks(unittest.TestCase):
    def test_aksen_melintasi_kata_dan_tanda_baca(self):
        self.assertEqual(parse_teks("*kata kunci*? ya"),
                         [[[("kata", True)], [("kunci", True), ("?", False)], [("ya", False)]]])

    def test_baris_baru(self):
        self.assertEqual(len(parse_teks("satu\ndua")), 2)


class UjiWaktu(unittest.TestCase):
    def setUp(self):
        self.w = Waktu(KATA, [{"id": "hook", "mulai": 0, "selesai": {"kata": "itu", "ujung": "selesai"}}])

    def test_angka_lolos(self):
        self.assertEqual(self.w(1.5, "x"), 1.5)

    def test_anchor_kata_ke_ujung_offset(self):
        self.assertEqual(self.w({"kata": "skill"}, "x"), 0.5)              # normalisasi huruf besar & tanda baca
        self.assertEqual(self.w({"kata": "skill", "ke": 2}, "x"), 2.0)
        self.assertEqual(self.w({"kata": "sertifikat", "ujung": "selesai", "offset": -0.1}, "x"), 3.5)

    def test_anchor_beat_berantai(self):
        self.assertEqual(self.w({"beat": "hook", "ujung": "selesai"}, "x"), 1.2)

    def test_kata_tidak_ada(self):
        with self.assertRaises(GagalPipeline):
            self.w({"kata": "skill", "ke": 3}, "x")
        with self.assertRaises(GagalPipeline):
            Waktu(None, [])({"kata": "skill"}, "x")  # tanpa transkrip


if __name__ == "__main__":
    unittest.main()
