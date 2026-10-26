---
id: G08
nama: minimalism
versi: 0.4
status: draft
tokens: [platform@0.4, minimalism@0.3]
konteks: [zona-aman@0.2, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.2]
ciri: [putih lapang, satu aksen, fade pelan]
teks_di_video: panel
---

# G08 — Gaya: minimalism (Minimalism)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Tenang, lapang, jujur. Putih, hitam, satu biru; tanpa bayangan, tanpa hiasan; fade pelan.

**Ciri pengenal:** putih lapang, satu aksen, fade pelan.

## Tipografi
Inter (ringan, lapang) — judul/depth vs isi/caption, maksimal dua keluarga font. Caption tebal + outline/bayangan; satu kata aksen per kalimat.

## Warna
Hitam-putih. Biru (`aksen`) maksimal 1 kata per video-beat.

## Gerak
Hanya `fade` 0,6 s; push-in nyaris tak terasa (1,02).

## Elemen khas
Panel putih persegi tanpa garis & tanpa bayangan, padding lebar 56.

Teks/judul langsung di atas video: `"latar": "panel"` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Motif (token `motif`, dipakai otomatis oleh perangkat, panel & generator koreografi)
- Bingkai perangkat: **minimal** — tanpa garis tepi, label kecil + garis tipis.
- Hiasan kata `*kunci*`: **garis** — garis bawah tergambar.
- Tekstur: **tanpa** · Transisi: **celup** · Reveal: **garis**.
- Judul/hook (E31 judul-gaya): masuk **masker** (naik dari balik garis masker), hiasan **none** (tanpa).
- Teks rotoscope (depth, di belakang subjek): **garis** — garis tepi saja (outline).
- Efek khas gaya ini = efek yang mencantumkan `minimalism` di `gaya_cocok` (dipilih lebih dulu oleh slot).

## Larangan
- Bayangan, garis, sudut bulat.
- Lebih dari 1 warna aksen.
- SFX keras (> −24 dB).

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G08.1 | Tampilan terbaca sebagai Minimalism (putih lapang, satu aksen, fade pelan) tanpa melihat nama preset. | manual |
| G08.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
