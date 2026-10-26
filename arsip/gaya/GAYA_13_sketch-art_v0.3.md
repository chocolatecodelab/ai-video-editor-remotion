---
id: G13
nama: sketch-art
versi: 0.3
status: draft
tokens: [platform@0.3, sketch-art@0.2]
konteks: [zona-aman@0.1, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.1]
ciri: [pensil grafit, garis tipis, biru pensil]
teks_di_video: panel
---

# G13 — Gaya: sketch-art (Sketch Art)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Buku sketsa: pensil grafit, garis tipis, biru pensil warna; tenang dan berpikir.

**Ciri pengenal:** pensil grafit, garis tipis, biru pensil.

## Tipografi
Segoe Print (tulisan pensil) untuk semua peran; ukuran lebih kecil karena huruf lebar.

## Warna
Abu grafit; biru pensil (`aksen`) untuk kata kunci, merah bata (`aksen-2`) untuk koreksi.

## Gerak
Masuk `turun` 24 px, 0,45 s, motion blur hanya untuk gerak besar (ambang 30 px, K05.4).

## Elemen khas
Kertas sketsa hampir opak, garis grafit 70%, bayangan tipis (3, 4).

Teks/judul langsung di atas video: `"latar": "panel"` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Larangan
- Warna jenuh/neon.
- Panel solid gelap.
- Bounce/overshoot.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G13.1 | Tampilan terbaca sebagai Sketch Art (pensil grafit, garis tipis, biru pensil) tanpa melihat nama preset. | manual |
| G13.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
