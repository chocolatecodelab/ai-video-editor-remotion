---
id: G12
nama: doodle-art
versi: 0.2
status: draft
tokens: [platform@0.2, doodle-art@0.2]
konteks: [zona-aman@0.1, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1]
ciri: [tulisan tangan, garis spidol, memantul]
teks_di_video: stroke
---

# G12 — Gaya: doodle-art (Doodle Art)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Main-main, spontan, hangat. Tulisan tangan, kartu bergaris spidol hitam, oranye & ungu; masuk memantul kuat.

**Ciri pengenal:** tulisan tangan, garis spidol, memantul.

## Tipografi
Ink Free (tulisan tangan) untuk judul & caption; Nunito Bold untuk isi agar tetap terbaca.

## Warna
Oranye (`aksen`) untuk kata kunci, ungu (`aksen-2`) untuk coretan/ikon.

## Gerak
Masuk `pop` 0,6 → 1 dengan overshoot kuat (1,8); motion blur hanya untuk gerak besar (ambang 30 px, K05.4).

## Elemen khas
Kartu putih bergaris hitam penuh (spidol), radius 26, tanpa bayangan. Coretan → efek doodle-boil.

Teks/judul langsung di atas video: `"stroke": true` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Larangan
- Bayangan realistis.
- Font serif formal.
- Gerak linier kaku.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G12.1 | Tampilan terbaca sebagai Doodle Art (tulisan tangan, garis spidol, memantul) tanpa melihat nama preset. | manual |
| G12.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
