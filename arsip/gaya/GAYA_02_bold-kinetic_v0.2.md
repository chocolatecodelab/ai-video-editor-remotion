---
id: G02
nama: bold-kinetic
versi: 0.2
status: draft
tokens: [platform@0.1, bold-kinetic@0.1]
konteks: [zona-aman@0.1, caption@0.1, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1]
ciri: [teks menghentak, kuning, cepat]
teks_di_video: stroke
---

# G02 — Gaya: bold-kinetic

> Isi default. Revisi lalu naikkan versi.

## Rasa / Mood
Tegas, cepat, berenergi. Teks besar menghentak mengikuti ucapan; cocok untuk hook dan opini.

## Tipografi
- `judul` (Montserrat Black 112), huruf kapital, maksimal 3 kata per baris.
- `caption` (Black 72), KAPITAL, 1–3 kata per potongan, stroke tebal.
- `isi` (Bold 52) untuk poin singkat.

## Warna
- Kuning `aksen` untuk kata kunci & kata aktif caption; `aksen-2` (pink) hanya untuk kontras "salah vs benar".
- Panel hampir solid (`panel-opasitas` 0,92), tanpa blur.

## Gerak
- Masuk default `pop` (skala 0,6 → 1) dengan `easing.standar` yang overshoot-free tapi cepat (0,22 s).
- Push-in tegas (`gerak.push-in` = 1,12) pada beat Agitasi/Solution.
- Whoosh pada setiap pergantian beat.

## Elemen khas
`judul` kinetik, `kartu` solid bersudut kecil, push-in.

## Larangan
- Teks panjang > 8 kata dalam satu elemen.
- Panel kaca blur (itu ciri glass-tech).

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G02.1 | Elemen judul ≤ 8 kata. | manual |
| G02.2 | Ada perubahan visual (cut/push/elemen baru) minimal tiap 3 detik. | manual |
