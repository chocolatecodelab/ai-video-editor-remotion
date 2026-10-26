---
id: G06
nama: rts-modern
versi: 0.2
status: draft
tokens: [platform@0.2, rts-modern@0.2]
konteks: [zona-aman@0.1, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1]
ciri: [HUD taktis, mono, neon hijau]
teks_di_video: panel
---

# G06 — Gaya: rts-modern (RTS Modern)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Antarmuka HUD game strategi modern: panel bergaris neon, huruf mono, informasi taktis; gerak patah-patah presisi.

**Ciri pengenal:** HUD taktis, mono, neon hijau.

## Tipografi
OCR A Extended untuk judul (kesan terminal), Consolas Bold untuk isi & caption KAPITAL.

## Warna
Hijau neon (`aksen`) untuk status/kata kunci, oranye (`aksen-2`) untuk peringatan/ancaman.

## Gerak
Masuk `geser` 40 px 0,16 s motion blur hanya untuk gerak besar (ambang 30 px, K05.4) — terasa seperti UI game.

## Elemen khas
Panel gelap bergaris hijau 75%, sudut 2 px, blur tipis 10.

Teks/judul langsung di atas video: `"latar": "panel"` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Larangan
- Sudut membulat besar.
- Font tulisan tangan/serif.
- Gerak lambat > 0,3 s.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G06.1 | Tampilan terbaca sebagai RTS Modern (HUD taktis, mono, neon hijau) tanpa melihat nama preset. | manual |
| G06.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
