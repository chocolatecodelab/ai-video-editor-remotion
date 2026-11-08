# Storyboard revisi 03 — native Remotion

Status: **menunggu persetujuan pengguna**. Tidak membuat video final.

Buka `out/r3/storyboard.html`. Ringkasan sembilan adegan tersedia di
`out/r3/storyboard-kontak.jpg`. Tiga strip fase aksi menyertakan waktu sampel.

## Perubahan dari revisi yang ditolak

Seluruh ilustrasi kini SVG/React, dibuat di `NinaNativeReview.tsx`:
kampus, buku, lembar program, folder, kalender, diagram cabang, pemeriksaan
aplikasi, jalur persiapan dan penunjuk CTA. Tidak menggunakan tiga gambar
ImageGen. Logo resmi dan cutout talent tetap berasal dari media sumber.

Bagian objek bergerak terpisah: lembar keluar dari folder, halaman berputar
pada engsel, garis/jalur muncul mengikuti ucapan, tahap pemeriksaan aktif
berurutan, tombol merespons penunjuk. Pegas lembar berbeda dari gerak jalur
dan tekanan CTA. Gerak yang dibuat pada tahap ini masih prototipe storyboard.

Split kembali ke grafis atas–talent bawah. Adegan 03, 05, 07 memenuhi layar
dengan motion grafis. Subtitle editorial tetap Montserrat putih/emas, maksimal
dua baris. Narasi dan CTA mengikuti transkrip sumber; tidak membuat angka
beasiswa, peluang kelulusan, durasi atau biaya.

## Verifikasi dan batasnya

- Gambar dirender oleh Remotion, bukan gambar yang digambar terpisah.
- Periksa TypeScript dan lint komponen native sebelum penyerahan.
- Tinjauan visual: sembilan frame utama dan strip aksi folder/kalender/seleksi.
- Still belum membuktikan keluwesan gerak, transisi antarscene, akurasi masking
  seluruh durasi, sinkronisasi audio, atau QA final. Tidak menyatakan video lulus.
- Komposisi review belum memasang audio. Tahap produksi harus memakai audio
  sumber melalui pipeline, setelah persetujuan storyboard.
- Thumbnail 9:16 dan grid 3:4 memakai keluaran Nina sebelumnya, template v1.2.

## Reproduksi lokal

Props: `storyboard-props-r3.json`. Job still: `render-stills-r3.json`.
Entry: `remotion/nina-native-entry.tsx`.
Kode: `remotion/src/storyboards/NinaNativeReview.tsx`.

Jalankan dari root repo:

```powershell
node pipeline/scripts/scholarship_render.cjs proyek/2026-11_otca-nina-referensi-08/render-stills-r3.json
.venv/Scripts/python proyek/2026-11_otca-nina-referensi-08/package-r3.py
```

Job terkunci `mode: still`. Tidak mengganti status persetujuan atau menjalankan
render final. Cache cutout dan font proyek Nina harus tersedia di public lokal.
Revisi 02 tetap riwayat; revisi 03 menjadi calon desain untuk ditinjau.
