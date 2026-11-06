# Revisi R2 — pembandingan dengan video sertifikat premium

Pemicu: pengguna menolak R1 karena sangat standar dan jauh dari kualitas
D:/KERJAAN/OTCA/2026-11_otca-sertifikat-premium.mp4.

## Dasar pembandingan

Video acuan disampel pada 1, 5, 12, 18, 24, 31, 39, 47, 54 detik; urutan
30–31,6 detik diperiksa tiap 0,2 detik. Ini pembandingan visual dan urutan
frame terpilih, bukan klaim telah menonton/mendengar seluruh video lagi.

Kelebihan acuan terhadap R1: objek langsung dikenali (sertifikat, timbangan,
kelas, peta), detail bentuk dan penekanan cahaya lebih terarah, talent lebih
utuh, dan latar talent terhubung dengan panggung hitam. R1 terlalu mengandalkan
diagram kotak/garis, judul besar berulang, dan cutout kecil yang terpisah dari
grafis. Menghapus glow tidak menggantikan kebutuhan merancang ilustrasi.

## Perubahan konkret

- R1 dipertahankan sebagai arsip tinjauan; bukan desain yang disetujui.
- R2 mengganti ilustrasi melalui ScholarshipArt.tsx: objek vektor berlapis
  dengan bidang, tepian, refleksi dan bayangan terbatas. Ini bukan render 3D fisik.
- ScholarshipReel.tsx mengomposit rekaman asli melalui OffthreadVideo dan
  gradasi hitam; tidak memakai proxy still/Pillow sebagai pengganti talent.
- Split memberi ruang utama pada ilustrasi dan talent; headline besar tidak
  diulang pada semua split. Full memakai komposisi dan area subtitle sendiri.
- Caption tetap seluruh kata sumber, dengan timestamp yang sama. 33 frasa
  ditetapkan, pemenggalan baris diukur dengan font Montserrat Bold 56 px;
  lebar konservatif maksimal 748 px, maksimal dua baris. Frasa seperti
  di Jerman tidak dipotong antarbaris.
- Highlight kata aktif emas solid dengan teks hitam; body putih dan judul
  emas solid. Kekurangan caption full pada acuan lama tidak disalin kembali.
- 10 still adegan dan 5 still tambahan dibuat melalui renderer Remotion yang
  sama. Semua masih bukti komposisi, bukan bukti QA gerak/audio final.

## Bukti pemeriksaan

TypeScript dan ESLint pada kedua modul baru lulus. Semua 15 still berhasil
dirender. Kontak semua adegan, perbandingan acuan/R1/R2, contoh subtitle dan
urutan fokus diperiksa. HTML R2 diuji: filter 6/4, zoom, catatan tersimpan,
ekspor catatan, dan viewport mobile tanpa overflow; tidak ada error JavaScript.

## Batas dan pekerjaan setelah persetujuan

Komposisi dasar, masuk adegan, fokus bertimestamp, footage dan caption telah
berjalan. Koreografi lanjutan (membuka/merapikan berkas, perubahan objek,
sambungan antarscene), mix audio, serta QA final belum selesai. Jangan menyebut
hal-hal yang hanya ditulis pada storyboard sudah diimplementasikan.

Integrasi gerbang persetujuan dan ekspor ke pipeline video.py untuk komposisi
baru masih perlu diselesaikan sebelum produksi; jangan memakai jalur lama
editorial.py dengan props baru tanpa penyesuaian dan validasi. Persetujuan
pengguna belum diberikan. Render MP4 final tidak dijalankan.

File aktif: storyboard-r2.json, storyboard-props-r2.json, out/storyboard-r2.html.
Entry: remotion/nina-scholarship-entry.tsx. Pembuat still:
storyboard/render_stills_r2.cjs. Pembuat HTML: storyboard/build_review_r2.py.
