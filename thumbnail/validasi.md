# Validasi thumbnail v1.2 — 7 November 2026

- Empat demo memakai footage proyek nyata; hasil 9:16 dan 3:4 terbentuk.
- Contact sheet empat brand diperiksa: identitas warna, logo, wajah,
  pemenggalan judul, dan keterbacaan. Cover demo belum disetujui untuk publikasi.
- 89 pengujian pipeline lulus, termasuk batas 3 baris headline/2 baris subheadline
  pada empat brand dan kedua ukuran, gradien emas OTCA mendatar yang cocok
  dengan sampel screenshot dan tetap konstan secara vertikal di interior glyph,
  penolakan judul berlebih, perlindungan
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
- Koreksi gradien v1.2: v1.1 memakai sapuan vertikal yang berbeda dari contoh.
  Screenshot 03 pada ROI x=0–284, y=297–309 memperlihatkan perubahan warna
  terutama sepanjang sumbu x. Fit tiga stop pada piksel interior menghasilkan
  `#C19E47` → `#F7EEAC` (x=47,2%) → `#9C712B`; kesalahan RMS sekitar 8,2
  level RGB terhadap screenshot yang sudah di-resize. Pita emas screenshot 01
  menunjukkan pola mendatar yang sama. Ini kalibrasi visual, bukan kecocokan
  piksel terhadap file desain sumber yang tidak tersedia.
- Pratinjau OTCA dan lembar gabungan diperbarui; desain brand lain tetap.
  Bukti pembanding: `pratinjau/perbandingan-gradien-otca.png`.

Pemeriksaan otomatis tidak mengesahkan ekspresi talent, kebenaran klaim,
kesempurnaan tepi mask, atau crop aktual aplikasi. Pemeriksaan itu dilakukan
pada cover dalam storyboard, sebelum produksi video baru.
