---
id: K12
nama: kurasi-motion-premium
versi: 0.1
status: draft
bergantung_pada: [K00, K01, K05, K09, K11]
---

# K12 — Kurasi motion premium

## Tujuan dan prioritas

Arahan pengguna 6 November 2026: kurasi motion agar tidak generik atau sekadar
menambah efek. Brand dan makna narasi menentukan pilihan desain. Dokumen ini
menambahkan tinjauan artistik manual; belum merupakan pemeriksaan otomatis dan
tidak menjamin kualitas tanpa melihat hasil geraknya. Tidak memerintahkan render
ulang video lama.

Resep di skill motion-design-craft (spring, glass, bevel, glow, partikel, HUD,
stop-motion) adalah opsi sesuai konteks, bukan kewajiban untuk semua brand.
Vektor sederhana, bidang datar, dan animasi tenang boleh premium bila bentuk,
tipografi, komposisi, timing, dan fungsinya tepat. Kompleksitas bukan ukuran mutu.
Parameter spring contoh bukan parameter universal. K05 dan aturan brand tetap
berlaku; pengecualian harus dijelaskan, tidak disamarkan sebagai parallax.

## Kurasi sebelum storyboard

### Kebebasan kreatif yang diizinkan pengguna

Pengguna mengizinkan eksplorasi kreatif seluas mungkin untuk animasi motion,
selama tetap mengikuti brand guidelines. Jangan membatasi desain pada katalog,
ikon, metafora, atau resep gerak yang sudah ada. Boleh membuat bentuk baru,
ilustrasi khusus, tipografi kinetik, transformasi objek, permainan ruang,
kedalaman, kamera, dan transisi yang membantu cerita. Pilih teknik berdasarkan
pesan dan kualitas hasil; kompleksitas dan kebaruan bukan tujuan tersendiri.

Warna, keluarga font, logo, dan ketentuan brand yang berlaku tetap menjadi
batas. Karakter gerak, material, dan atmosfer harus selaras dengan identitas
OTCA. Eksplorasi tidak membolehkan perubahan narasi/CTA tanpa arahan pengguna,
pelanggaran keterbacaan, atau render sebelum persetujuan storyboard.
Tidak perlu meminta izin untuk setiap pilihan kreatif dalam batas ini;
tampilkan hasil desain secara konkret dalam storyboard untuk ditinjau.
Kebebasan ini bukan perintah render ulang video yang sudah selesai.

Untuk tiap adegan, tulis di berkas storyboard/catatan pendamping:

- Pesan utama dan alasan metafora visual dipilih.
- Fokus pertama, fokus berikutnya, serta elemen yang harus tetap terbaca.
- Urutan gerak: keadaan awal → aksi/perubahan bermakna → keadaan akhir dan tahan.
- Anchor ucapan, durasi aksi, waktu baca, serta hubungan dengan adegan berikutnya.
- Pilihan full/split, desain subtitle, dan adaptasi komposisi pada masing-masing.
- Referensi visual yang benar-benar diamati dan unsur yang diambil darinya.
  Jangan mengaku mengikuti referensi yang belum dapat dibuka.

Tampilkan awal, puncak aksi, dan akhir untuk adegan berisiko; satu still akhir
tidak membuktikan kualitas gerak. Persetujuan storyboard tetap sebelum produksi.
Preview bergerak pendek hanya bila diizinkan pengguna/alur proyek; jangan
melanggar larangan preview cloud atau menganggap permintaan audit sebagai izin render.

## Tanda revisi wajib

- Semua adegan memakai pola masuk scale/fade → riak → melayang tanpa sebab cerita.
- Glow, sparkle, lingkaran, atau gerak kamera hanya menutupi ilustrasi yang lemah.
- Seluruh objek bergerak bersamaan sehingga fokus tidak jelas.
- Ikon diganti, tetapi susunan, timing, dan cara menyampaikan pesan tetap sama.
- Full frame hanya memperbesar komponen split tanpa menata ulang ruang dan teks.
- Kamera/parallax diklaim ada, tetapi semua objek bergeser sama tanpa beda kedalaman.
- Lompatan koordinat, pergantian warna mendadak, potongan path, clipping, atau
  teks bergeser yang tidak disengaja. Gerak bertahap boleh bila konsepnya jelas.
- Transisi bernama match cut tetapi tidak punya bentuk, posisi, arah, atau makna
  yang berlanjut. Crossfade saja tidak cukup sebagai bukti match cut.
- Diagram memberi kesan data atau tingkat capaian faktual yang tidak ada sumbernya.
- Caption polos otomatis, label redup, frasa janggal, logo berubah, atau warna
  keluar brand. Perbaiki keterbacaan sebelum dekorasi.

## Bahasa motion OTCA

- Hitam dominan, palet emas resmi, Montserrat, logo resmi proporsional. Validasi
  terhadap brand guide yang tersedia; bila PDF tidak tersedia, sebutkan bahwa
  dasar pemeriksaan hanya aturan brand tersimpan di repo.
- Gerak tegas dan terukur: reveal berarah, perubahan bentuk yang menjelaskan,
  perpindahan fokus, lalu tahan. Hindari bounce/denyut sebagai default.
- Satu aksi dominan pada satu waktu; pendukung mengikuti dengan jeda yang masuk
  akal. Jangan memaksa semua objek punya stagger yang sama.
- Emas dipakai sebagai fokus/material atau alur informasi. Kilau singkat boleh
  pada momen penting; bukan lapisan glow seragam pada seluruh ilustrasi.
- UI/label berhenti setelah settle sesuai K05. Gerak timbangan yang meluruh
  setelah beban datang masuk akal; goyang sinus tanpa akhir perlu direvisi.
- Buat bentuk dapat dikenali tanpa glow. Ilustrasi garis boleh dipakai jika
  geometri, ketebalan, kontras, dan skala baca rapi.

## Keputusan kurasi tiap adegan

Nilai dengan status **layak / revisi / belum diverifikasi**, disertai alasan dan
bukti file/timecode, untuk: makna visual, kepatuhan brand, komposisi, tipografi
dan caption, koreografi, kontinuitas gerak, sambungan adegan, serta audio/sinkron.
Jangan mengarang skor presisi dari satu gambar atau hanya dari kode.

Syarat diterima: tidak ada status revisi; aspek gerak dan audio sudah ditonton/
didengar pada hasil yang relevan. Jika hanya still yang tersedia, keduanya tetap
belum diverifikasi. QA teknis LULUS tidak otomatis berarti kurasi artistik lulus.
Simpan checklist artistik di catatan proyek; jangan mengubah laporan QA otomatis
agar seolah-olah pemeriksaan artistik sudah dijalankan.

Tinjau pada kecepatan normal, lalu per frame hanya pada masalah/transisi berisiko.
Periksa fokus dan caption pada ukuran layar HP. Periksa versi tanpa suara untuk
kejelasan cerita, lalu dengan suara untuk anchor ucapan dan SFX. Jangan memberi
SFX pada setiap elemen; hening dapat menjadi bagian dari ritme.

## Dasar teknis

Animasi Remotion harus mengikuti frame agar hasil deterministik; interpolation
dan spring adalah alat, bukan bukti mutu artistik. Acuan resmi:
https://www.remotion.dev/docs/animating-properties dan
https://www.remotion.dev/docs/spring (dibaca 6 November 2026).

## Bukti uji

Draft kurasi dari audit screenshot dan kode OTCA sertifikat premium; belum diuji
melalui produksi baru. Implementasi dan tinjauan gerak tetap diperlukan.
