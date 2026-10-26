"""Katalog web (build_katalog) & pratinjau efek (pratinjau_efek): parser dan beat-sheet mini, tanpa render/ffmpeg."""
from __future__ import annotations

import unittest

import _dasar  # noqa: F401  (jalur skrip)
from build_katalog import bagian, judul, label_gaya, rasio, tabel_index, tanpa_kurung, tebal
from pratinjau_efek import DURASI, MULAI, POTONG, beat_sheet, contoh_json
from sistem import daftar_modul


class UjiParser(unittest.TestCase):
    def test_judul_heading(self):
        self.assertEqual(judul("# E21 — Efek: Coret kata\n"), "Coret kata")
        self.assertEqual(judul("# K00 — Zona Aman\n"), "Zona Aman")
        self.assertEqual(judul("# T02 — Template: Hook → Problem → Solution\n"), "Hook → Problem → Solution")

    def test_label_gaya_dari_kurung_atau_nama(self):
        self.assertEqual(label_gaya("kaca-gelap", "# G04 — Gaya: kaca-gelap (Kaca Gelap)\n"), "Kaca Gelap")
        self.assertEqual(label_gaya("glass-tech", "# G01 — Gaya: glass-tech\n"), "Glass Tech")

    def test_bagian_dan_tebal(self):
        isi = "## Rasa / Mood\nGelap, elegan.\nPelan.\n\n## Lain\nx\n**Deskripsi:** Kartu file dicoret.\n"
        self.assertEqual(bagian(isi, "Rasa / Mood"), "Gelap, elegan. Pelan.")
        self.assertEqual(tebal(isi, "Deskripsi"), "Kartu file dicoret.")
        self.assertEqual(bagian(isi, "Tidak ada"), "")

    def test_rasio_sexagesimal_yaml(self):
        self.assertEqual(rasio(556), "9:16")  # yaml: 9:16 → 556
        self.assertEqual(rasio("9:16"), "9:16")
        self.assertEqual(rasio(None), "")

    def test_tanpa_kurung(self):
        self.assertEqual(tanpa_kurung("Explainer (talking head)"), "Explainer")

    def test_index_memuat_semua_efek_aktif(self):
        idx = tabel_index()
        for m in daftar_modul("efek", termasuk_arsip=False):
            self.assertIn(m.id, idx)
            self.assertEqual(idx[m.id]["Nama pendek"], m.nama)


class UjiPratinjauEfek(unittest.TestCase):
    def test_semua_efek_punya_contoh_json(self):
        for m in daftar_modul("efek", termasuk_arsip=False):
            self.assertIsInstance(contoh_json(m.path), dict, m.nama)

    def test_beat_sheet_waktu_angka_dalam_potongan(self):
        for m in daftar_modul("efek", termasuk_arsip=False):
            bs, (t0, t1) = beat_sheet(m.nama, contoh_json(m.path))
            e = bs["beats"][-1]["elemen"][0]
            self.assertIsInstance(e["mulai"], (int, float), m.nama)  # anchor kata/beat diganti angka
            self.assertNotIn("…", str(e), m.nama)
            self.assertTrue(0 <= t0 < t1 <= DURASI, m.nama)
            self.assertFalse(bs["caption"]["aktif"])
            if e["tipe"] == "transisi":
                self.assertEqual(e["mulai"], POTONG)
            else:
                self.assertEqual(e["mulai"], MULAI)
                self.assertLessEqual(MULAI + e["durasi"], DURASI)


if __name__ == "__main__":
    unittest.main()
