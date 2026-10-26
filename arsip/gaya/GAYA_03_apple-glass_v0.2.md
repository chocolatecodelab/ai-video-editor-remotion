---
id: G03
nama: apple-glass
versi: 0.2
status: draft
tokens: [platform@0.2, apple-glass@0.2]
konteks: [zona-aman@0.1, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1]
ciri: [kaca terang, biru sistem, halus]
teks_di_video: panel
---

# G03 — Gaya: apple-glass (Apple Glass)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Terang, bersih, premium. Panel kaca putih buram ala antarmuka Apple; gerak halus tanpa kejutan.

**Ciri pengenal:** kaca terang, biru sistem, halus.

## Tipografi
Segoe UI Bold untuk judul (pengganti SF Pro yang tersedia lokal), Semibold untuk isi. Teks gelap di atas kaca terang.

## Warna
Biru sistem (`aksen`) hanya untuk 1 kata kunci; ungu (`aksen-2`) untuk ikon/garis. Selebihnya hitam-abu.

## Gerak
Masuk `naik` 40 px, easing ease-in-out Apple, push-in sangat tipis (1,04).

## Elemen khas
Panel kaca putih radius 44, blur 36, garis putih 70%, bayangan lembut jauh.

Teks/judul langsung di atas video: `"latar": "panel"` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Larangan
- Stroke tebal atau warna neon.
- Lebih dari 1 kata beraksen per layar.
- Gerak pop/bounce.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G03.1 | Tampilan terbaca sebagai Apple Glass (kaca terang, biru sistem, halus) tanpa melihat nama preset. | manual |
| G03.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
