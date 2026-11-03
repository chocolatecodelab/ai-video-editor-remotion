# Rencana edit OTCA — draf untuk konfirmasi

Status: analisis awal dan rencana; belum produksi, belum mengunci naskah atau timing.

## Bahan yang sudah diperiksa
- CONTOH VIDEO.MOV: 58,66 detik, 30 fps; raster tersimpan 3840 × 2160 dengan orientasi tampilan portrait. Sampel frame memperlihatkan talent berhijab dengan latar batu. Perlu membaca metadata rotasi saat ingest agar crop tepat.
- OTCA_Sertifikat-Bahasa-Jerman: 58,70 detik, 1080 × 1920, 30 fps. Sampel frame: logo kecil di atas, grafis garis emas di bidang hitam, talent di bawah, subtitle dengan penekanan emas. Talent dan latar tampak sama dengan footage mentah; kesamaan isi/audio belum diverifikasi penuh.
- Storyboard PDF: 14 halaman, 12 adegan, topik Salah Pilih Studienkolleg, durasi rencana 49,6 detik. Memuat pergantian talent, ilustrasi layar penuh, diagram, dan CTA link di bio. Ini referensi editorial, bukan instruksi otomatis untuk mengganti dialog footage.
- Brand Guidelines OTCA New.pdf serta ATURAN_KERJA.md: hitam dominan, emas #CB9D31, gradasi #CB9D31 → #FDF1A4 → #B3822C, putih, Montserrat; logo kecil tanpa glow. Aturan proyek mengutamakan grafis di atas dan talent di bawah.

## Keputusan sebelum produksi
1. Apakah PDF dipakai sebagai referensi cara bercerita/visual saja, sementara isi dan suara mengikuti CONTOH VIDEO; atau hasil memang harus bertopik Studienkolleg? Jika pilihan kedua, cari/terima footage atau VO yang sesuai dahulu. Jangan memasangkan dialog sertifikat dengan grafis Studienkolleg.
2. Apakah layout mengikuti split referensi dan aturan proyek, atau boleh berganti antara talent dan grafis layar penuh seperti PDF? Rekomendasi: split sebagai dasar, layar penuh singkat hanya untuk penjelasan yang perlu ruang dan setelah disetujui.
3. CTA harus mengikuti ucapan sumber; konfirmasi bila ingin CTA lain. Durasi ditentukan setelah transkrip, kisaran awal 50–60 detik, tanpa memaksa tepat 49,6 detik.

## Arah kreatif
Premium editorial black & gold: hierarki tenang, ruang kosong terukur, ilustrasi yang menjelaskan ucapan, gerak presisi, dan aksen emas terpilih. Gunakan referensi sebagai bahasa visual, lalu tingkatkan hubungan antargrafis dan keterbacaan.
- Hook: tampilkan konflik visual yang sesuai kalimat pembuka dalam 1–2 detik.
- Isi: satu gagasan visual utama per beat; diagram dibangun bertahap mengikuti kata, bukan semua muncul sekaligus.
- Kontinuitas: bentuk dari adegan sebelumnya berubah menjadi objek adegan berikutnya; transisi berbasis makna dan posisi.
- Kedalaman: parallax 2.5D ringan dan sapuan cahaya emas sesekali pada objek utama. Hindari glow berlebih, partikel ramai, dan gerak memantul pada semua elemen.
- Talent: warna kulit natural, eksposur stabil, framing konsisten, gestur tetap terbaca. Mask hanya dipakai bila tepinya bisa bersih; perpaduan gradient dengan footage bisa menjadi pilihan lebih baik setelah uji still.
- Subtitle: Montserrat, maksimal dua baris pendek, putih dengan shadow halus, emas pada kata penting; posisikan di ruang khusus tanpa menutupi wajah atau sosok talent. Periksa pula figur pada grafis dan UI platform.
- Audio: suara utama dibersihkan secukupnya; musik instrumental berizin diturunkan otomatis saat bicara; SFX lembut hanya pada aksi penting.

## Tahapan dan hasil
1. Setelah arah isi dikonfirmasi: transkripsi audio dengan timestamp kata; koreksi istilah dan identifikasi jeda/take. Pertahankan arti dan intonasi.
2. Susun beat-sheet: ucapan persis, timecode sumber, durasi edit, objek visual, gerak, transisi, caption, musik dan SFX. Jumlah adegan mengikuti isi; 12 adegan PDF bukan kewajiban.
3. Siapkan storyboard still per adegan, termasuk hook, diagram terpadat, contoh subtitle, dan close-up tepi mask bila dipakai. Minta persetujuan storyboard sebelum produksi.
4. Implementasikan di Remotion memakai modul yang sudah tersedia; simpan semua materi proyek dan file kerja di D:. Bila modul belum mencukupi, identifikasi kebutuhan dahulu sesuai pemisahan kerja modul di repo.
5. Validasi struktur dan tipe, sinkronisasi kata, crop/rotasi, font, safe zone, transisi, ketepatan caption, audio, dan hak pakai aset. Periksa frame di titik rawan.
6. Ekspor final hanya setelah storyboard disetujui dan tahap ekspor diminta/disepakati: satu MP4 1080 × 1920, 30 fps, H.264/AAC, BT.709; target −14 LUFS dan plafon master −2 dBTP. QA K00–K10 harus lulus; sertakan contact sheet dan laporan.

## Batas analisis awal
Pemeriksaan video saat ini berbasis metadata dan sampel frame; belum mendengarkan keseluruhan audio, mengunci transkrip, atau menilai gerak dan mixing secara menyeluruh. Timing final dan penilaian rinci audio baru dibuat setelah pilihan isi jelas. PDF dibaca seluruh teksnya dan overview visual halaman pertama diperiksa. Brand PDF dibaca teksnya; inspeksi visual halaman brand yang relevan dilakukan saat menyiapkan storyboard.

## Upgrade utama yang diusulkan
1. Grafis berkesinambungan lewat match cut sesuai narasi.
2. Hook visual lebih jelas pada detik pertama.
3. Area subtitle terencana agar talent dan diagram tetap bersih.
