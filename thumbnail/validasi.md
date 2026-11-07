# Validasi thumbnail v1.1 — 7 November 2026

- Empat demo memakai footage proyek nyata; hasil 9:16 dan 3:4 terbentuk.
- Contact sheet empat brand diperiksa: identitas warna, logo, wajah,
  pemenggalan judul, dan keterbacaan. Cover demo belum disetujui untuk publikasi.
- 89 pengujian pipeline lulus, termasuk batas 3 baris headline/2 baris subheadline
  pada empat brand dan kedua ukuran, gradien emas OTCA yang berubah di dalam
  glyph, penolakan judul berlebih, perlindungan
  output lama saat gagal, ketepatan brand, wajah/teks pada delapan layout, dan
  integrasi ekspor multisumber/renderer. Lint berkas yang diubah lulus.
- Pemeriksaan seluruh repo belum bersih: empat lint lama di
  `pipeline/scripts/buat_pratinjau_preset_png.py`; validasi registry melaporkan
  field `gaya` tidak ada pada proyek `2026-11_otca-nina-office-r3` dan `r4`.
  Berkas tersebut berasal dari pekerjaan lain dan tidak diubah oleh tugas ini.
- Tidak ada render ulang MP4. Manifest empat proyek demo dipertahankan.
- Kuning Info Jerman disampel dari bidang bawah ketiga contoh: semuanya
  RGB (237, 208, 95), yaitu `#EDD05F`.
- Tipografi OTCA dikalibrasi dengan teks screenshot 03: Montserrat Black
  72 px, jarak 74 px, margin 8 px; pendukung Bold Italic 36 px. Snapshot
  kalibrasi menunjukkan tiga baris judul dan dua baris pendukung.

Pemeriksaan otomatis tidak mengesahkan ekspresi talent, kebenaran klaim,
kesempurnaan tepi mask, atau crop aktual aplikasi. Pemeriksaan itu dilakukan
pada cover dalam storyboard, sebelum produksi video baru.
