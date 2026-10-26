---
id: G09
nama: retro-brutalism
versi: 0.3
status: draft
tokens: [platform@0.3, retro-brutalism@0.2]
konteks: [zona-aman@0.1, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.1]
ciri: [bayangan keras, garis hitam, potong patah]
teks_di_video: stroke
---

# G09 — Gaya: retro-brutalism (Retro Brutalism)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Kasar, berani, jujur. Kotak putih bergaris hitam tebal dengan bayangan keras; potongan tanpa transisi.

**Ciri pengenal:** bayangan keras, garis hitam, potong patah.

## Tipografi
Arial Black KAPITAL untuk judul & caption, Courier New Bold (mesin ketik) untuk isi.

## Warna
Oranye (`aksen`) & biru elektrik (`aksen-2`) blok penuh; teks hitam murni di putih.

## Gerak
Masuk `pop` 0,12 s motion blur hanya untuk gerak besar (ambang 30 px, K05.4), keluar dipotong (`tidak`).

## Elemen khas
Kotak putih bergaris hitam penuh, sudut 0, bayangan hitam solid geser 14 px.

Teks/judul langsung di atas video: `"stroke": true` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Larangan
- Gradien, blur, kaca.
- Sudut bulat.
- Easing halus/panjang.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G09.1 | Tampilan terbaca sebagai Retro Brutalism (bayangan keras, garis hitam, potong patah) tanpa melihat nama preset. | manual |
| G09.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
