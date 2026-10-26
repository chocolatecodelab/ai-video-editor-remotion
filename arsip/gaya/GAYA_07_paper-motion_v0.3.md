---
id: G07
nama: paper-motion
versi: 0.3
status: draft
tokens: [platform@0.3, paper-motion@0.2]
konteks: [zona-aman@0.1, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.1]
ciri: [kertas krem, memantul, ramah]
teks_di_video: stroke
---

# G07 — Gaya: paper-motion (Paper Motion)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Ceria, ramah, taktil. Kartu kertas krem terangkat dengan bayangan lembut; masuk memantul.

**Ciri pengenal:** kertas krem, memantul, ramah.

## Tipografi
Gliker Bold (display bulat) untuk judul & caption, Nunito Bold untuk isi.

## Warna
Tomat (`aksen`) untuk kata kunci, biru (`aksen-2`) untuk kontras kedua. Teks gelap di kertas.

## Gerak
Masuk `pop` 0,7 → 1 dengan overshoot (easing 1,56) — seperti kertas ditempel.

## Elemen khas
Kartu kertas opak radius 8, garis krem, bayangan cokelat lembut turun 14 px.

Teks/judul langsung di atas video: `"stroke": true` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Larangan
- Panel transparan/kaca.
- Warna neon.
- Font mono.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G07.1 | Tampilan terbaca sebagai Paper Motion (kertas krem, memantul, ramah) tanpa melihat nama preset. | manual |
| G07.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
