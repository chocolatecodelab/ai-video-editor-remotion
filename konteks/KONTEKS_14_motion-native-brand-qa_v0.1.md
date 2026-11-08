---
id: K14
nama: motion-native-brand-qa
versi: 0.1
status: draft
bergantung_pada: [K11, K12, K13]
---

# Motion native dan QA lintas brand

Arahan pengguna 8 November 2026, setelah revisi storyboard Nina R3.
Berlaku untuk semua brand, termasuk OTCA Official, Info Jerman, Jepang Koey,
dan Ciao Manda. Standar usaha dan pemeriksaannya sama; identitas visualnya
mengikuti guideline masing-masing. Tidak memicu render ulang video lama.

## Cakupan direksi kreatif

Baca `panduan/DIREKSI_KREATIF_MOTION.md`: native motion hanya salah satu
alat. Pustaka gaya, template, koreografi dan efek menjadi fondasi pengembangan
kreatif; rancang dan kurasi keseluruhan bahasa visual, bukan hanya aksi objek.

## Kontrak desain sebelum membuat scene

Catat dalam brief/storyboard: permintaan terbaru pengguna, narasi/CTA sumber,
rujukan brand beserta path/versi, warna, font, logo, layout, subtitle dan cover.
Baca guideline video brand, bukan hanya template thumbnail. Jangan membawa
emas/hitam, Montserrat, atau split OTCA ke brand lain tanpa dasar guideline.
Jika guideline belum ditemukan, telusuri proyek/aset terlebih dahulu; bila
keputusan brand tetap tidak diketahui, tandai belum terverifikasi dan tanyakan
hal yang spesifik. Jangan mengarang aturan brand atau menganggapnya lulus.

## Usaha desain yang wajib terlihat

- Motion penjelas diutamakan berupa objek native Remotion (React/SVG/CSS;
  Canvas/3D bila ada alasan visual). Pecah objek menjadi bagian yang memiliki
  fungsi: engsel/lembar, jarum/skala, batang/mangkuk, penunjuk/tombol.
- Untuk permintaan motion seperti Nina, jangan mengganti pekerjaan animasi
  dengan gambar ImageGen yang hanya digeser, fade atau zoom. Foto, footage,
  logo resmi dan aset raster yang memang dibutuhkan narasi tetap boleh.
  ImageGen bukan default pengganti motion; arah visual berbeda harus jelas
  diminta atau disetujui pengguna.
- Rancang pemicu → aksi → respons → keadaan akhir → jeda baca. Pilih bobot,
  kurva dan durasi menurut mekanisme, bukan spring/easing universal.
- Isi adegan harus berkembang sepanjang penjelasan: objek berubah peran,
  komponen berinteraksi, status diperbarui atau fokus berpindah bermakna.
  Tambah jumlah objek/partikel hanya bila membantu pesan, bukan ukuran effort.
- Kurasi opsi metafora sebelum memilih. Catat singkat alasan pilihan untuk
  adegan penting; hindari semua scene berupa kartu teks atau ikon masuk–diam.
- Rencanakan sambungan antarscene melalui objek, bentuk, posisi atau makna.
  Jangan mengklaim match cut selesai jika baru tertulis sebagai rencana.
- Kreativitas tidak dibatasi template Nina. Buku, kalender, timbangan dan
  pesawat bukan daftar wajib. Referensi mengarahkan kualitas, bukan isi video.
- Gunakan tokens/props untuk brand, teks, anchor dan parameter proyek. Prototype
  yang belum memenuhi kontrak produksi wajib dicatat, bukan langsung difinalkan.

## QA wajib sebelum setiap penyerahan

Tulis `out/qa-storyboard.md` untuk storyboard, dan review final bersama laporan
pipeline saat produksi. Gunakan empat bagian terpisah:

1. **Brief pengguna:** cocokkan tiap permintaan/revisi dengan scene dan bukti;
   termasuk native vs raster, split/full, sumber ucapan, CTA dan larangan.
2. **Brand:** cocokkan warna, font/weight, logo, grid, subtitle dan thumbnail
   dengan sumber guideline. Bedakan aturan cover dari video.
3. **Artistik/gerak:** nilai kejelasan metafora, hierarki, kepadatan, aksi–reaksi,
   bobot, ritme, keterbacaan dan kontinuitas. Tulis temuan konkret per scene.
4. **Teknis:** cek overflow/crop, safe area, tepi mask, caption/timing, font/aset,
   serta audio/ekspor pada tahap yang relevan. Typecheck bukan QA visual.

Untuk setiap temuan, catat: kriteria, scene/timestamp, bukti yang benar-benar
diperiksa, status **SESUAI / PERLU REVISI / BELUM TERVERIFIKASI**, dan tindak
lanjut. Perbaiki ketidaksesuaian yang diketahui sebelum menyerahkan storyboard
sebagai calon persetujuan. Bila terhambat, ungkapkan temuan; jangan centang lulus.
Status tidak relevan harus diberi alasan, bukan dianggap telah diuji.

Sertakan still nyata dari komposisi, contoh subtitle split/full dan frasa
panjang. Untuk adegan dengan mekanisme penting, tampilkan 3–4 fase aksi;
sertakan cover 9:16 dan grid 3:4 sesuai pipeline. Still menilai tata letak dan
perubahan pose; keluwesan/ritme/transisi/audio memerlukan playback pada tahap
yang diizinkan. Jangan melanggar batas render untuk memenuhi checklist.

QA agen membandingkan hasil dengan brief dan guideline; hanya pengguna yang
memutuskan kepuasan/persetujuan. Jangan menyebut “sudah sesuai keinginan Anda”
berdasarkan penilaian sendiri. Catat persetujuan eksplisit dan versinya.
Revisi desain/narasi yang material memerlukan tinjauan ulang. Tetap tunggu
persetujuan storyboard sebelum video final, dan jangan menyamakan persetujuan
arah visual dengan perintah menjalankan render sekarang.

## Format laporan singkat

Untuk tiap bagian QA:

> Kriteria: … / Scene & waktu: … / Sumber aturan: …
> Bukti: path gambar atau rentang playback yang ditinjau
> Status: SESUAI | PERLU REVISI | BELUM TERVERIFIKASI
> Temuan dan perbaikan: …

Di akhir: versi storyboard, daftar temuan terbuka, batas pemeriksaan, status
persetujuan pengguna. Aturan ini adalah kewajiban proses agen; tidak mengklaim
pipeline otomatis dapat mengukur selera atau memblokir semua pelanggaran.
