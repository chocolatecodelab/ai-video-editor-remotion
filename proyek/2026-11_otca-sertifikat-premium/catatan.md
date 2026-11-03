# Catatan produksi dan peninjauan

## Keputusan pengguna

- PDF Studienkolleg hanya referensi cara bercerita.
- Suara, isi, dan CTA mengikuti CONTOH VIDEO.MOV.
- Split merupakan dasar; grafis layar penuh boleh digunakan bila dibutuhkan.
- Tiga upgrade disetujui untuk dikembangkan: hook lebih dini, kontinuitas grafis, subtitle yang tidak menutupi talent.
- Persetujuan arah ini belum merupakan persetujuan storyboard hasil baru.

## Jejak sumber

Sidik jari sumber memakai metode pipeline: ukuran file, 8 MiB pertama, dan 8 MiB terakhir. Cocok dengan ingest proyek 2026-10_otca-sertifikat-v3. Hash SHA-256 penuh cache audio juga cocok dengan metadata words.json. Oleh karena itu transkrip WhisperX large-v3 yang telah dikoreksi dipakai kembali, bukan menjalankan pengenalan suara ulang. Bukti ada di cache/provenance.json.

File SRT lama tidak digunakan karena masih berisi ejaan lama, sedangkan words.json telah dikoreksi. Naskah baru dibangun dari words.json. Tidak mengubah cache proyek lama.

## Implementasi storyboard

- Menggunakan pustaka adegan OTCA yang sudah ada dan renderer Remotion SplitReel.
- Hook sertifikat mulai 0,08 detik; tidak menunggu sapaan selesai.
- Logo atas diperkecil menjadi 235 px dan awal_besar dimatikan.
- Caption memakai hingga 3 kata / 24 karakter dan berada pada y=930 dalam frame 1080 × 1920; perlu cek tiap halaman setelah pemindaian wajah final.
- Transisi match yang tersedia adalah crossfade komposisi. Iris memakai titik lingkaran yang konsisten. Tidak mengklaim telah membangun morph objek khusus.
- End frame mulai 57,900 detik, setelah kata terakhir berakhir 57,880 detik. Tidak memotong suara penutup.
- Musik lembut dan 6 SFX terpilih direncanakan pada split.json. Audio mix belum dirender/didengar; level dan pilihan SFX masih perlu QA.
- Still disimpan setengah resolusi untuk tinjauan. Hasil final tetap direncanakan 1080 × 1920.

## Status teknis

Launcher .venv/Scripts/python.exe tidak dapat membuka interpreter Python 3.10 yang dirujuk pyvenv.cfg. Runtime Python bundel dapat memvalidasi sumber dan menyiapkan berkas, tetapi tidak kompatibel dengan ekstensi SciPy cp310 di .venv. Tidak mengubah Python global atau mengganti lingkungan proyek.

Remotion still dijalankan langsung dengan Node dan dependencies lokal. Akses browser lokal memerlukan eksekusi yang diizinkan setelah koneksi pertama mengalami EACCES. Ini tidak menghasilkan video final.

Sebelum produksi final: pulihkan runtime Python 3.10 x64 yang kompatibel, jalankan validasi split melalui pipeline, periksa gerak/transisi per frame dan caption vs wajah/sosok, lalu mix/ekspor dan QA. Jangan menandai QA LULUS berdasarkan still.

## Berkas untuk ditinjau

- out/storyboard.html: gambar per beat, narasi, timing, transisi, dan catatan.
- out/kontak-storyboard.jpg: ringkasan visual.
- naskah.md: transkrip per beat.
- beat-sheet-editorial.json: rencana editorial; split.json menjadi konfigurasi produksi layout split.

Modul bersama dan perubahan sesi lain tidak disentuh. Belum ada commit produksi atau persetujuan storyboard.

## Revisi 2 — koreksi pengguna

Pengguna menegaskan bahwa storyboard referensi harus diikuti dalam pergantian layout, bukan hanya isi grafis di panel atas. Revisi pertama belum sesuai dan telah diarsipkan di out/revisi-1/.

- Split: 01 (pembuka), 03 (penekanan kesiapan), 05 (jangan hanya level), 08 (CTA).
- Full frame: 02 (level), 04 (situasi kuliah), 06 (empat keterampilan), 07 (kemampuan terpakai), 09 (logo akhir).
- Full frame memakai latar opak; talent dan dinding tidak tampil. Suara talent tetap direncanakan berlanjut sebagai VO.
- Komposisi storyboard terpisah: remotion/otca-storyboard-entry.tsx dan remotion/src/storyboards/EditorialReview.tsx. Keduanya memakai ulang pustaka adegan; modul bersama tidak diubah.
- Sumber pengaturan: layout-editorial.json; pratinjau out/storyboard-props-r2.json; halaman out/storyboard-r2.html.
- Rencana split.json lama belum mewakili produksi komposisi campuran; jangan menjalankan produksi final sebelum integrasi dan persetujuan revisi 2.
- Seluruh still telah diperiksa melalui contact sheet; subtitle pada sampel split tidak menutup wajah/talent, dan adegan penuh tidak lagi memuat footage di bawah grafis. Audio dan gerak final belum dinyatakan lulus.

## Selesai — 3 November 2026

- Revisi 2 diproduksi: 5 full frame dan 4 split; satu MP4 58,67 detik, 1080x1920 30fps H.264/AAC BT.709.
- QA otomatis dan audit sampel visual LULUS; 9 scene serta 24 frame transisi. Audio -14,7 LUFS / -2,8 dBTP.
- Musik lembut disesuaikan dari 78 ke 96 BPM tanpa mengubah pitch, mengikuti grid visual. Perbaikan audio dilakukan lewat mix ulang dan remux; gambar tidak dirender ulang.
- Segmen suara 10–20 detik dibandingkan dengan sumber: lag 0 ms, korelasi 0,9715. Ini bukan verifikasi seluruh durasi.
- Runtime Python dipulihkan; 80 tes lulus; registry OK. Peringatan dari file perubahan sesi lain dibiarkan; file tugas ini lolos pemeriksaan.
- Pemeriksaan HP/headphone tetap dicatat untuk pengguna; tidak dicentang atas nama pengguna.
