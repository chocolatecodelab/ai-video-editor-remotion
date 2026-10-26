---
id: G10
nama: kertas-tipografi
versi: 0.5
status: draft
tokens: [platform@0.4, kertas-tipografi@0.3]
konteks: [zona-aman@0.2, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.2, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.2]
ciri: [serif editorial, gading, merah tua]
teks_di_video: panel
---

# G10 — Gaya: kertas-tipografi (Kertas & Tipografi)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Editorial, intelek, klasik. Seperti halaman majalah: serif Bodoni, kertas gading, merah editorial.

**Ciri pengenal:** serif editorial, gading, merah tua.

## Tipografi
Playfair Display + Inter — judul/depth vs isi/caption, maksimal dua keluarga font. Caption tebal + outline/bayangan; satu kata aksen per kalimat.

## Warna
Merah editorial (`aksen`) untuk kata kunci, biru tinta (`aksen-2`) untuk kutipan/sumber.

## Gerak
Masuk `naik` 30 px, easing ease-out 0,5 s; push-in 1,03.

## Elemen khas
Panel kertas gading persegi, garis tinta 25%, bayangan tipis.

Teks/judul langsung di atas video: `"latar": "panel"` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Motif (token `motif`, dipakai otomatis oleh perangkat, panel & generator koreografi)
- Bingkai perangkat: **editorial** — garis rambut atas/bawah, label kapital berspasi.
- Hiasan kata `*kunci*`: **garis** — garis bawah tergambar.
- Tekstur: **kertas** · Transisi: **celup** · Reveal: **garis**.
- Judul/hook (E31 judul-gaya): masuk **masker** (naik dari balik garis masker), hiasan **none** (tanpa).
- Teks rotoscope (depth, di belakang subjek): **padat** — warna aksen padat.
- Efek khas gaya ini = efek yang mencantumkan `kertas-tipografi` di `gaya_cocok` (dipilih lebih dulu oleh slot).

## Larangan
- Font sans tebal.
- Neon/gradien.
- Caption KAPITAL.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G10.1 | Tampilan terbaca sebagai Kertas & Tipografi (serif editorial, gading, merah tua) tanpa melihat nama preset. | manual |
| G10.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
