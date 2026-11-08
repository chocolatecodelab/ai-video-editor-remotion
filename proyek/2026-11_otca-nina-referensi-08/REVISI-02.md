# Storyboard Nina — revisi 02

Status: **menunggu persetujuan pengguna**. Tidak ada render video final.

Buka `out/r2/storyboard.html` untuk sembilan adegan, ucapan sumber, rencana
gerak, tahapan adegan 03/07, dan cover. Gambar berasal dari Remotion, bukan
sketsa pengganti. Draft sebelumnya tetap tersimpan sebagai riwayat.

## Perubahan

- Objek ilustratif kampus, buku/topi wisuda, dossier, lembar aplikasi dan kalender.
- Layar penuh pada adegan 03, 05, 07; talent kembali pada pengantar dan penutup.
- Subtitle editorial Montserrat dengan hierarki 52/64 px, maksimal dua baris,
  kata penting beraksen emas dan garis kata aktif. Kata/timing mengikuti transkrip.
- Bidang grafis dibatasi di atas zona subtitle; judul/logo di lapisan terdepan.
- Beberapa komposisi talent di samping aset diajukan sebagai variasi layout;
  ini belum menggantikan persetujuan pengguna untuk split atas/bawah.

## Batas verifikasi

TypeScript dan lint folder baru lolos. Audit 14 still memeriksa overflow dan
batas kanvas; hasil ada di `out/r2/review-notes.json`. Pemeriksaan ini tidak
membuktikan kualitas gerak, transisi, akurasi masking seluruh durasi atau audio.
Perbedaan bobot/easing, kontinuitas antarscene, dan sound design masih harus
dipoles pada tahap produksi setelah persetujuan. Jangan menyebut animasi final
atau seluruh QA video sudah lulus.

Komposisi saat ini untuk review visual, belum menyertakan audio final. Saat
produksi, gunakan suara sumber dan penutup aslinya melalui pipeline audio.
Jangan menjalankan mode render final sebelum persetujuan eksplisit.

## Sumber

- Video utama: `D:/KERJAAN/OTCA/CONTOH VIDEO MBAK NINA.MOV`.
- Acuan gaya: `D:/KERJAAN/OTCA/Referensi Video.mp4`.
- Sidik berkas: `source-r2.json`; source cocok dengan cache transkrip Nina.
- Aset buatan dan ringkasan prompt: `asset-provenance-r2.json`.
- Kampus dan berkas hanya ilustrasi; tidak mengklaim lembaga/dokumen DAAD asli.
- Entry: `remotion/nina-assets-entry.tsx`; komponen:
  `remotion/src/storyboards/nina-assets/`; props: `storyboard-props-r2.json`.
- Cover memakai keluaran thumbnail proyek Nina sebelumnya, template OTCA v1.2.

Untuk tinjauan berikutnya, rujuk nomor adegan. Revisi narasi/layout membatalkan
persetujuan lama; tidak ada persetujuan yang dicatat atas nama pengguna.
