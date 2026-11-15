# Revisi R2 — rotoscope tetap wajib

Arahan pengguna terbaru mengoreksi pilihan mempertahankan ruangan pada R1. Talent tetap di-rotoscope, mask harus bersih dan halus. R1 yang memakai kolom ruangan asli tidak menjadi rancangan final. Arah buku/jalur, brand, narasi dan subtitle bilingual tetap dipertahankan; frasa “not who you are” sudah dikonfirmasi pengguna.

## Referensi yang benar-benar diperiksa

`D:/KERJAAN/CONTENT CREATOR/NAZARVERSE/referensi video 2.mp4`, durasi 33.967 detik, 478×850. Lembar kontak tersimpan di cache/reference/contact.jpg. Referensi menampilkan kartu footage berbingkai/berotasi ringan, perbandingan sebelum–sesudah, cutaway diagram/ikon, tumpukan gambar, potongan antarmuka, dan kembali ke talent. Tidak mengklaim contoh ini seluruhnya sudah memakai rotoscope.

Diambil sebagai prinsip: perubahan skala dan jenis shot, interaksi antarelemen mengikuti ucapan, variasi ruang dan cutaway, kesinambungan dari talent ke grafis dan kembali. Tidak menyalin kulit hijau/kuning, grid kertas, stiker bintang, font, kalimat promosi, CTA, atau komposisi persis. Narasi reflektif Today's Failure memerlukan gerak lebih tenang daripada contoh tutorial tersebut.

## Brand dan komposisi R2

NazarVerse v1.0 tetap menjadi sumber warna/typography: #101827, #26364C, #C5B69A, #EDEAE4, #718A83; Inter. Background ruangan dihapus. Foreground transparan mencapai tepi bawah dan sisi kiri/kanan; bagian bawah torso tidak boleh berakhir di tengah ruang kosong. Punggung/halaman buku menyentuh bidang tumpuan. Frame cutaway buku penuh tidak menampilkan talent.

Subtitle English 52px / Indonesia 44px di area atas yang terpisah dari siluet; pada cutaway buku tetap di area bawah khusus. Maksimal dua baris per bahasa, plafon 17 karakter/detik. Periksa alpha nyata terhadap kotak teks, bukan hanya bounding box video transparan. Hapus heading tambahan bila mengganggu ruang subtitle. Grafis tidak dibatasi hanya di atas tengah.

## Pekerjaan mask dan bukti

- Uji 8 pose dengan u2net_human_seg + flow-aligned smoothing pada frame tetangga, feather, dan decontamination; mask-review/mask-samples.jpg dan hair-edge-detail.jpg menunjukkan navy, ivory dan checkerboard.
- Satu pose BiRefNet portrait juga disimpan sebagai pembanding. Model ini tidak dianggap otomatis paling baik berdasarkan namanya; biaya proses dan hasil aktual dipisahkan.
- Full-range recurrent video matting lokal diproses berurutan memakai RVM mobilenetv3 ONNX dari repo resmi PeterL1n/RobustVideoMatting. State tidak di-reset setiap frame. Model/izin sumber tersimpan di .sementara/rvm; metadata/hash dan jumlah frame dicatat di cache/roto-video-r2.json setelah selesai.
- Cache RGBA source-resolution disimpan di cache/roto-video-r2. Media transparan WebM adalah aset antara untuk HyperFrames, bukan MP4 final atau video pratinjau.
- QA harus memeriksa tepi rambut, telinga, bahu, jari dan tangan bergerak; sisa ruangan, pinggir putih/gelap, bagian tubuh hilang dan flicker. Feather bukan pengganti penanganan halo. Source rendah resolusi membatasi detail rambut, tidak boleh diklaim menjadi detail Full HD asli setelah upscale.

## Status

Arahan rotoscope diterima sebagai instruksi, tidak meminta persetujuan ulang untuk metode tersebut. Storyboard R1 digantikan oleh R2. Pengguna menyetujui R2 dan render melalui pesan “jalankan render”, 15 November 2026; bukti hash di out/render-approval.json. Still mask bukan bukti seluruh gerak sudah bersih; yang belum ditonton atau diuji tetap dinyatakan belum terverifikasi.
