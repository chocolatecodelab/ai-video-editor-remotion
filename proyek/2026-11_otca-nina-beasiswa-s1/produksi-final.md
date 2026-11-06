# Produksi final — Mbak Nina beasiswa S1

Permintaan produksi: animasi dilengkapi, background full hitam seperti sebelumnya,
lalu jalankan render. Pengguna menegaskan kembali: Lanjut.

Dasar visual R2 dipertahankan; produksi R3 memakai talent RGBA pada kanvas hitam.
Map berkas membuka, buku terbuka, objek pendanaan mendapat fokus sesuai kata,
kalender bergeser untuk membedakan kursus dan kuliah penuh, centang ditulis,
lensa seleksi bergerak dalam lintasan terhubung, dan mata rantai bertemu pada CTA.
Gerak berhenti setelah settle; tidak memakai drift/riak/partikel sebagai pengisi.
Subtitle sumber dipenggal ke 33 frasa; kata aktif mengikuti timestamp.

QA otomatis LULUS: format, warna, durasi, audio, kecepatan baca, layout pada
71 frame audit, ukuran teks efektif minimal 40 px, tabrakan teks, caption vs
puncak sosok, latar hitam, serta perubahan piksel yang membuktikan animasi ada.
Pemeriksaan piksel tidak dianggap penilaian estetika. Kontak.png dari MP4 final,
seluruh sampel adegan dan frame di sekitar cut ditinjau. Rangkaian 24.2/24.5/25.3
serta 33.7/35.1/37.5 diperiksa untuk aksi semantik. Tepi mask sampel ditinjau di
atas hitam. Pemeriksaan perangkat HP/headphone oleh pengguna tetap belum.

Source caption tetap urutan kata dan timestamp Whisper large-v3; ejaan brand
OTCA dikoreksi dari OTKA pada salinan produksi. Audio sumber dinormalisasi dan
dibersihkan tanpa rough cut. Korelasi waveform segmen 10-20 detik: sekitar 0.898,
lag sekitar 25 ms (kurang satu frame), bukan verifikasi fonetik setiap kata.

Artefak final, hash, loudness dan durasi tercatat di manifest.hasil. Entry Remotion
nina-scholarship-entry.tsx; props final production-props.json; audio/matting lewat
utilitas split; render dan QA melalui video.py semua. Persetujuan merekam arahan
pengguna dan hash props/sumber. Tidak ada push remote pada pekerjaan ini.
