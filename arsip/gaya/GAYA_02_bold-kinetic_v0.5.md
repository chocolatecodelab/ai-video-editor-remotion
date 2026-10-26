---
id: G02
nama: bold-kinetic
versi: 0.5
status: draft
tokens: [platform@0.4, bold-kinetic@0.3]
konteks: [zona-aman@0.2, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.2]
ciri: [teks menghentak, kuning, cepat]
teks_di_video: stroke
---

# G02 — Gaya: bold-kinetic

> Isi default. Revisi lalu naikkan versi.

## Rasa / Mood
Tegas, cepat, berenergi. Teks besar menghentak mengikuti ucapan; cocok untuk hook dan opini.

## Tipografi
Anton + Montserrat ExtraBold — judul/depth vs isi/caption, maksimal dua keluarga font. Caption tebal + outline/bayangan; satu kata aksen per kalimat.

## Warna
- Kuning `aksen` untuk kata kunci & kata aktif caption; `aksen-2` (pink) hanya untuk kontras "salah vs benar".
- Panel hampir solid (`panel-opasitas` 0,92), tanpa blur.

## Gerak
- Masuk default `pop` (skala 0,6 → 1) dengan `easing.standar` yang overshoot-free tapi cepat (0,22 s).
- Push-in tegas (`gerak.push-in` = 1,12) pada beat Agitasi/Solution.
- Whoosh pada setiap pergantian beat.

## Elemen khas
`judul` kinetik, `kartu` solid bersudut kecil, push-in.

## Motif (token `motif`, dipakai otomatis oleh perangkat, panel & generator koreografi)
- Bingkai perangkat: **kinetik** — pita judul blok warna aksen, bayangan keras, sedikit miring.
- Hiasan kata `*kunci*`: **kotak** — kotak highlight warna aksen, huruf warna latar.
- Tekstur: **tanpa** · Transisi: **zoom-tembus** · Reveal: **stempel**.
- Judul/hook (E31 judul-gaya): masuk **pop** (pop memantul), hiasan **none** (tanpa).
- Teks rotoscope (depth, di belakang subjek): **padat** — warna aksen padat.
- Efek khas gaya ini = efek yang mencantumkan `bold-kinetic` di `gaya_cocok` (dipilih lebih dulu oleh slot).

## Larangan
- Teks panjang > 8 kata dalam satu elemen.
- Panel kaca blur (itu ciri glass-tech).

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G02.1 | Elemen judul ≤ 8 kata. | manual |
| G02.2 | Ada perubahan visual (cut/push/elemen baru) minimal tiap 3 detik. | manual |
