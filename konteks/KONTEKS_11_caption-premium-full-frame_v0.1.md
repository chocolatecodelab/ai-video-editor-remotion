---
id: K11
nama: caption-premium-full-frame
versi: 0.1
status: draft
bergantung_pada: [K00, K01, K05]
---

# K11 — Subtitle premium pada motion grafis layar penuh

## Cakupan

Aturan tetap pengguna, 3 November 2026, untuk video berikutnya yang memiliki
adegan motion grafis full frame. Tidak memerintahkan render ulang video lama.
K00 zona aman, K01 akurasi/keterbacaan, dan K05 gerak tetap berlaku.

## Arah desain

Subtitle merupakan bagian dari komposisi motion, dengan mutu visual setara
subtitle pada layout grafis atas + talent bawah. Jangan memakai teks putih kecil
polos di bawah animasi sebagai pilihan otomatis. Saat talent keluar dari layar,
subtitle tetap mempunyai hierarki, ukuran, kontras, dan gerak yang dirancang.

Pilih satu pendekatan yang sesuai brand dan narasi:

1. **Selaras dengan split:** kapsul/panel elegan, tipografi tegas, aksen kata
   aktif, garis tepi dan bayangan halus. Adaptasikan ukuran serta posisi untuk
   layar penuh; jangan sekadar menyalin posisi split.
2. **Tipografi editorial:** frasa singkat berukuran jelas, susunan baris yang
   disengaja, aksen warna atau sorot terpilih, reveal halus mengikuti ucapan.
   Panel boleh dihilangkan bila hirarki dan kontras tetap kuat.

Untuk OTCA: Montserrat, putih dan emas pada hitam; kedalaman/sapuan cahaya
secukupnya. Hindari glow berat, bounce terus-menerus, dan efek ramai pada setiap
kata. Tidak wajib memakai kapsul bila solusi editorial lain lebih baik.

## Aturan produksi dan tinjauan

- Timing berasal dari timestamp kata; isi subtitle tetap mengikuti suara sumber.
- Batasi maksimal dua baris, pecah pada frasa yang nyaman; jangan memotong kata,
  nama, angka, atau istilah. Hormati ukuran minimum dan kecepatan baca K01.
- Sediakan area subtitle tersendiri. Jangan menutup judul, diagram, ikon penting,
  wajah/sosok pada ilustrasi, ataupun UI platform. Atur ulang komposisi bila perlu.
- Jaga kontinuitas visual saat berpindah split/full: keluarga font, aksen, dan
  karakter gerak konsisten; skala dan penempatan boleh berbeda.
- Storyboard wajib memperlihatkan contoh subtitle full frame dan split, termasuk
  frasa terpanjang. Pilihan gaya harus terlihat sebelum persetujuan produksi.
- Saat QA, periksa ukuran, kontras, pemenggalan, durasi baca, transisi halaman,
  sinkronisasi, serta tabrakan dengan grafis; jangan cukup memeriksa hadirnya teks.

## Bukti dan batas

Preferensi ini berasal dari revisi setelah penyerahan OTCA sertifikat premium.
Belum merupakan komponen renderer baru yang telah diuji. Implementasikan pada
proyek berikutnya melalui token/props, storyboard, dan QA; jangan mengklaim video
yang sudah selesai telah menerapkan perbaikan ini.
