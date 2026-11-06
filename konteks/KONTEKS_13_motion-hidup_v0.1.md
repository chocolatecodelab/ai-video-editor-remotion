---
id: K13
nama: motion-hidup
versi: 0.1
status: draft
bergantung_pada: [K05, K09, K12]
---

# K13 — Perilaku objek dan koreografi yang hidup

## Maksud pengguna

Referensi kualitas gerak: `OTCA_Sertifikat-Bahasa-Jerman_9x16_v2-tanpa-bingkai_opus_medium_20%.mp4`.
Pengguna menilai geraknya lebih hidup daripada hasil Nina beasiswa S1. Ambil
kualitas aksi–reaksi, bobot, keluwesan, variasi ritme dan kontinuitasnya. Isi,
metafora, warna, komposisi, dan efek tidak harus ditiru pada setiap video.
Brand klien dan narasi sumber tetap mengikat; kebebasan kreatif tetap luas.

Ini panduan keputusan artistik, berlaku untuk agen apa pun yang bekerja di repo.
Tidak menjamin kesetaraan kualitas antarmodel dan bukan pengaturan model/effort.

## Rancang perilaku, bukan hanya kemunculan ikon

Untuk adegan penjelas utama, tentukan aksi yang membuat isi kalimat terbaca:
apa yang bergerak, apa pemicunya, bagian mana yang merespons, dan apa yang
berubah setelah aksi. Contoh pola: benda mendekat → kontak → objek lain bereaksi
→ gerak sisa meluruh → tahan untuk membaca. Pilih bagian yang relevan; tidak
semua adegan memerlukan benturan, pantulan, atau seluruh tahapan tersebut.

- Masuk/fade/slide boleh untuk mengantar. Seluruh paragraf jangan hanya diwakili
  ikon masuk lalu ditahan tanpa perkembangan visual yang menjelaskan narasi.
- Satu aksi utama mengarahkan perhatian; gerak pendukung boleh menyusul atau
  bertumpang tindih bila hubungan sebab–akibat tetap terbaca.
- Benda boleh berubah peran: objek utama mengecil menjadi penunjuk, detail
  diperbesar saat dibahas, atau objek yang sama menghubungkan dua kalimat.
- Jeda tenang dan hold tetap penting. Beri alasan editorial pada jeda, bukan
  menambah drift, glow atau partikel hanya supaya layar terus berubah.

## Bobot dan mekanisme

- Pilih kurva dan durasi berdasarkan benda, jarak, kontak, maksud dan ucapan.
  Jangan menerapkan satu easing dan durasi seragam pada seluruh aksi.
- Gunakan persiapan gerak, percepatan/pelambatan, sedikit overshoot, pegas yang
  meluruh atau follow-through bila sifat objek memerlukannya. Gerak presisi
  tanpa overshoot juga sah. Jangan mengganti semuanya dengan bounce universal.
- Pegas harus mempunyai pemicu dan titik berhenti; objek UI tetap settle sesuai
  K05. Larangan idle UI tidak berarti melarang mekanisme ilustrasi bergerak
  selama masih menjelaskan narasi: mangkuk timbangan boleh merespons beban baru.
- Buku/berkas: pertimbangkan engsel, lembar berlapis, mask reveal, lipatan atau
  perspektif. Membesarkan scaleX seluruh ikon saja bukan bukti halaman terbuka.
- Lensa/alat pemeriksa: gerak harus mengarahkan perhatian atau memicu perubahan
  yang relevan pada bagian yang diperiksa, bukan hanya lewat dan berhenti di sisi.
- Objek yang menempuh kurva mengikuti orientasi lintasannya jika masuk akal.
  Gerak cepat diperiksa untuk blur dan keterbacaan; gunakan token dan K05.
- Semua animasi deterministik berbasis frame. Teks, timing, anchor, pilihan
  motion dan parameter kreatif proyek berasal dari data/props.

## Contoh pembanding, bukan resep wajib

- Referensi sekitar 39–43 detik: benda masuk ke mangkuk timbangan, batang dan
  kedua mangkuk bereaksi. Pelajaran: satu aksi mengubah sistem yang terlihat.
- Referensi sekitar 23–33 detik: fokus berpindah melalui beberapa tindakan
  perkuliahan; objek utama dapat berubah skala/posisi menjadi pendukung.
- Referensi sekitar 54–57 detik: pesawat mengikuti jalur melengkung dengan arah
  yang mengikuti lintasan. Metafora perjalanan dipilih karena narasi saat itu.
- Hasil Nina sekitar 31–39 detik: ikon prestasi, berkas dan lensa datang bergiliran,
  tetapi interaksinya lemah. Untuk cerita seleksi, alternatifnya: berkas terbuka,
  kriteria disorot saat disebut, pemeriksaan memicu respons pada isi berkas.
  Jangan menambahkan keputusan lolos atau jaminan yang tidak diucapkan.
- Ilustrasi tangan menekan simbol link boleh untuk memvisualkan CTA sumber.
  MP4 tetap video; jangan menjanjikan interaksi klik di dalam berkas atau
  menambahkan URL/CTA baru. Tidak semua metafora antarmuka harus dihindari.

## Alur kerja yang bisa diperiksa

1. Pelajari referensi yang tersedia dan catat kejadian pada timestamp, bukan
   hanya warna atau nama efek. Jika file belum terbaca, nyatakan keterbatasannya.
2. Sebelum implementasi, tulis ringkas per adegan: pesan, aksi utama,
   pemicu → respons, karakter/bobot gerak, waktu baca, sambungan, dan bukti tinjauan.
3. Pakai komposisi Remotion yang menjadi dasar produksi untuk still storyboard.
   Sketsa/wireframe boleh, tetapi beri label jelas; jangan menyebutnya desain
   final atau bukti animasi. Subtitle split/full dan frasa panjang tetap terlihat.
4. Periksa adegan dengan interaksi paling penting dahulu. Jika uji gerak lokal
   telah diizinkan, cuplikan pendek lebih berguna untuk keluwesan daripada still.
   Aturan tanpa Studio/pratinjau cloud dan persetujuan storyboard tetap berlaku;
   pedoman ini tidak menambah izin render atau mewajibkan pratinjau baru.
5. Saat produksi diizinkan, tinjau hasil bergerak pada kecepatan normal bila alat
   mendukung, lalu frame berisiko. Jika hanya sekuen gambar/kode yang dapat
   diperiksa, sebutkan batasnya; keluwesan belum dianggap terverifikasi penuh.
6. Kelompokkan revisi sebelum render berikutnya. Jangan meminta ulang persetujuan
   yang sudah jelas hanya untuk mengisi checklist atau memilih angka pegas.

## Kriteria revisi dan penerimaan

Tandai **revisi** jika pola dominan hanya ikon masuk–sedikit bergeser–diam,
objek bergerak seperti diregangkan tanpa mekanisme yang meyakinkan, perpindahan
fokus sulit diikuti, reaksi tidak terkait pemicu, atau semua benda terasa memakai
ritme/bobot yang sama. Adegan tenang yang disengaja tidak otomatis gagal.

Pisahkan hasil: **brand**, **QA teknis**, dan **kurasi artistik gerak**. Masing-masing
memakai status layak/revisi/belum diverifikasi beserta bukti. Pixel delta hanya
membuktikan perubahan gambar; FPS, easing, spring, dan QA LULUS tidak otomatis
membuktikan animasi premium. Jangan memberi skor estetika presisi dari kode/still.
Jika pengguna menilai gerak kaku, buka kembali kurasi meskipun QA teknis lulus.

## Batas dan bukti

Dasar: perbandingan rangkaian frame referensi dan source terkait, serta kode dan
frame final Nina; umpan balik pengguna pada 6 November 2026. Ini versi draft,
belum merupakan peningkatan animator yang diuji dan disetujui pada produksi baru.
Tidak mengubah atau merender ulang video selesai tanpa permintaan pengguna.
