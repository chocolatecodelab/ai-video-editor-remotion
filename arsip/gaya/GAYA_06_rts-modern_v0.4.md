---
id: G06
nama: rts-modern
versi: 0.4
status: draft
tokens: [platform@0.4, rts-modern@0.3]
konteks: [zona-aman@0.2, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.2]
ciri: [HUD taktis, mono, neon hijau]
teks_di_video: panel
---

# G06 — Gaya: rts-modern (RTS Modern)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Antarmuka HUD game strategi modern: panel bergaris neon, huruf mono, informasi taktis; gerak patah-patah presisi.

**Ciri pengenal:** HUD taktis, mono, neon hijau.

## Tipografi
Bebas Neue + Consolas (HUD) — judul/depth vs isi/caption, maksimal dua keluarga font. Caption tebal + outline/bayangan; satu kata aksen per kalimat.

## Warna
Hijau neon (`aksen`) untuk status/kata kunci, oranye (`aksen-2`) untuk peringatan/ancaman.

## Gerak
Masuk `geser` 40 px 0,16 s motion blur hanya untuk gerak besar (ambang 30 px, K05.4) — terasa seperti UI game.

## Elemen khas
Panel gelap bergaris hijau 75%, sudut 2 px, blur tipis 10.

Teks/judul langsung di atas video: `"latar": "panel"` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Motif (token `motif`, dipakai otomatis oleh perangkat, panel & generator koreografi)
- Bingkai perangkat: **hud** — sudut terpotong + braket sudut, garis pindai, label kode mono.
- Hiasan kata `*kunci*`: **target** — braket kunci target.
- Tekstur: **scanline** · Transisi: **glitch** · Reveal: **target**.
- Judul/hook (E31 judul-gaya): masuk **ketik** (mesin ketik + kursor), hiasan **glitch** (pisah RGB sesaat).
- Teks rotoscope (depth, di belakang subjek): **garis** — garis tepi saja (outline).
- Efek khas gaya ini = efek yang mencantumkan `rts-modern` di `gaya_cocok` (dipilih lebih dulu oleh slot).

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
