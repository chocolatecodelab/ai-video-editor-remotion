"""Regresi tahap pipeline: transkrip tidak menimpa koreksi, gabung statistik render paralel, seek frame eksak."""
from __future__ import annotations

import shutil
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import numpy as np

import _dasar
import transkrip
from render import Pembaca, Renderer
from sistem import GagalPipeline, Proyek, baca_json, sha_file, tulis_json


class UjiTranskrip(unittest.TestCase):
    """SKILL.md: words.json yang sudah `dikoreksi: true` tidak boleh ditimpa — juga dengan --paksa."""

    def setUp(self):
        self.d = _dasar.proyek_sementara()
        self.p = Proyek(self.d)
        self.p.ingest_audio.write_bytes(b"audio palsu")
        self.koreksi = {"_meta": {"audio_sha": sha_file(self.p.ingest_audio), "dikoreksi": True},
                        "kata": [{"w": "Koreksi", "s": 0, "e": 1, "p": 1}]}
        tulis_json(self.p.words_path, self.koreksi)

    def tearDown(self):
        _dasar.hapus(self.d)

    def _jalankan(self, paksa: bool):
        baru = [{"w": "mesin", "s": 0, "e": 1, "p": 0.9}]
        with mock.patch.object(transkrip, "_ada", return_value=True), \
             mock.patch.object(transkrip, "_whisperx", return_value=baru):
            transkrip.transkrip(self.p, paksa=paksa, backend="whisperx")

    def test_paksa_tidak_menimpa_koreksi(self):
        self._jalankan(paksa=True)
        self.assertEqual(baca_json(self.p.words_path), self.koreksi)
        self.assertEqual(baca_json(self.p.cache / "words.baru.json")["kata"][0]["w"], "mesin")

    def test_audio_berubah_tidak_menimpa_koreksi(self):
        self.p.ingest_audio.write_bytes(b"audio lain")
        self._jalankan(paksa=False)
        self.assertEqual(baca_json(self.p.words_path), self.koreksi)
        self.assertTrue((self.p.cache / "words.baru.json").exists())

    def test_cache_valid_dilewati(self):
        self._jalankan(paksa=False)
        self.assertFalse((self.p.cache / "words.baru.json").exists())


class UjiGerbangPersetujuan(unittest.TestCase):
    """SKILL.md: storyboard wajib disetujui pengguna sebelum render penuh."""

    def setUp(self):
        import storyboard
        self.sb = storyboard
        self.d = _dasar.proyek_sementara({"beats": [{"id": "hook", "mulai": 0, "selesai": 1}]})
        self.p = Proyek(self.d)

    def tearDown(self):
        _dasar.hapus(self.d)

    def _setujui(self):
        self.p.manifest["persetujuan"] = {"beat_sheet_sha": self.sb.sha_beat(self.p)}

    def test_belum_disetujui_ditolak(self):
        with self.assertRaises(GagalPipeline):
            self.sb.wajib_persetujuan(self.p)

    def test_disetujui_lolos_lalu_revisi_ditolak(self):
        self._setujui()
        self.sb.wajib_persetujuan(self.p)
        self.p.beat_sheet_path.write_text('{"beats": []}', encoding="utf-8")
        with self.assertRaises(GagalPipeline):
            self.sb.wajib_persetujuan(self.p)

    def test_tanpa_setuju_dicatat(self):
        self.sb.wajib_persetujuan(self.p, lewati=True)
        self.assertEqual(len(baca_json(self.p.manifest_path)["render_tanpa_setuju"]), 1)


class UjiGabungStatistik(unittest.TestCase):
    """Render paralel harus menghasilkan layout.json sama dengan render berurutan."""

    def _renderer(self, rekam: dict) -> Renderer:
        r = Renderer.__new__(Renderer)  # tanpa membangun proyek: hanya logika penggabungan
        r.rekam, r.mask_info, r.kamera_info, r.mb_dipakai = rekam, {}, {}, 0
        return r

    def test_aturan_gabung(self):
        r = self._renderer({
            "judul": {"tipe": "judul", "bbox_animasi": None, "kontras": None},
            "ov": {"tipe": "remotion", "bbox": None, "bbox_teks": None, "bbox_animasi": None, "kontras": None},
            "dep": {"tipe": "depth", "bbox_animasi": None},
        })
        hasil = [
            {"mb": 2, "mask": {"dep": {"butuh": 10, "ada": 10}}, "kamera": {}, "rekam": {
                "judul": {"bbox_animasi": [10, 10, 50, 50], "kontras": None},
                "ov": {"bbox_animasi": [0, 0, 5, 5], "kontras": None, "tutup_wajah_px": 0.1},
                "dep": {"tertutup": {"n": 2, "jumlah": 0.3, "maks": 0.2}}}},
            {"mb": 1, "mask": {"dep": {"butuh": 5, "ada": 4}}, "kamera": {}, "rekam": {
                "judul": {"bbox_animasi": [5, 20, 40, 60], "kontras": {"t": 2.0, "l_p10": 0.1}},
                "ov": {"bbox_animasi": [1, 1, 9, 9], "kontras": {"t": 3.0}, "bbox": [1, 1, 9, 9], "bbox_teks": [1, 1, 9, 9],
                       "tutup_wajah_px": 0.4},
                "dep": {"tertutup": {"n": 1, "jumlah": 0.1, "maks": 0.5}}}},
            {"mb": 0, "mask": {}, "kamera": {}, "rekam": {  # proses setelahnya mencatat sampel lebih lambat → diabaikan
                "judul": {"bbox_animasi": None, "kontras": {"t": 4.0, "l_p10": 0.9}},
                "ov": {"bbox_animasi": None, "kontras": {"t": 5.0}, "bbox": [7, 7, 8, 8], "bbox_teks": [7, 7, 8, 8]}}},
        ]
        r._gabung_statistik(hasil)
        self.assertEqual(r.rekam["judul"]["bbox_animasi"], [5, 10, 50, 60])
        self.assertEqual(r.rekam["judul"]["kontras"]["t"], 2.0)
        self.assertEqual(r.rekam["ov"]["bbox"], [1, 1, 9, 9])
        self.assertEqual(r.rekam["ov"]["tutup_wajah_px"], 0.4)
        self.assertEqual(r.rekam["dep"]["tertutup"], {"n": 3, "jumlah": 0.4, "maks": 0.5})
        self.assertEqual(r.mask_info["dep"], {"butuh": 15, "ada": 14})
        self.assertEqual(r.mb_dipakai, 3)


@unittest.skipUnless(shutil.which("ffmpeg"), "butuh ffmpeg")
class UjiSeekFrame(unittest.TestCase):
    """Pembaca yang dibuka di frame k = frame k dari pembacaan berurutan (dasar render paralel, overlay, still)."""

    @classmethod
    def setUpClass(cls):
        import subprocess
        cls.tmp = Path(tempfile.mkdtemp(prefix="uji-seek-"))
        cls.vid = cls.tmp / "v.mp4"
        subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i",
                        "testsrc=s=96x160:r=30:d=2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-g", "15", str(cls.vid)],
                       check=True)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def test_seek_sama_dengan_berurutan(self):
        r = Pembaca(self.vid, 0, 96, 160, 30)
        urut = [r.baca().copy() for _ in range(60)]
        r.tutup()
        for k in (1, 7, 20, 29, 41, 59):  # termasuk k/30 yang pembulatan desimalnya ke atas (mis. 20/30, 41/30)
            s = Pembaca(self.vid, k / 30, 96, 160, 30)
            f = s.baca()
            s.tutup()
            self.assertTrue(np.array_equal(f, urut[k]), f"frame {k} meleset")


if __name__ == "__main__":
    unittest.main()
