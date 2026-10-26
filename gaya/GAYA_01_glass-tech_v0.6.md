---
id: G01
nama: glass-tech
versi: 0.6
status: draft
tokens: [platform@0.4, glass-tech@0.3]
konteks: [zona-aman@0.2, caption@0.2, depth-typography@0.2, ingest@0.1, gerak@0.2, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.2]
ciri: [kaca gelap biru, cyan, presisi]
teks_di_video: panel
---

# G01 — Gaya: glass-tech

> Isi default. Ganti dengan aturan dari file guideline asli, lalu naikkan versi.

## Rasa / Mood
Jernih, teknologis, tenang. Informasi mengambang di atas panel kaca gelap; gerak halus dan presisi.

## Tipografi
Montserrat ExtraBold + Inter — judul/depth vs isi/caption, maksimal dua keluarga font. Caption tebal + outline/bayangan; satu kata aksen per kalimat.

## Warna
- Netral (`teks-utama`, `teks-sekunder`) untuk sebagian besar teks.
- `aksen` (cyan) hanya untuk 1 kata kunci per layar dan kata aktif caption.
- `aksen-2` (violet) untuk garis/ikon sekunder, bukan untuk teks isi.

## Gerak
- Masuk default `naik` (60 px) dengan `easing.standar`, keluar `fade`.
- Item dalam kartu muncul ber-stagger `durasi.stagger`.
- Push-in halus (`gerak.push-in` = 1,06) pada momen kunci.

## Elemen khas
`kartu` panel kaca (radius 36, garis tipis 22% putih), `depth`, `chip` label kecil.

## Motif (token `motif`, dipakai otomatis oleh perangkat, panel & generator koreografi)
- Bingkai perangkat: **kaca** — panel kaca berkilau tepi atas, label tab mono (tanpa titik macOS).
- Hiasan kata `*kunci*`: **kilau** — kilau cahaya melintas.
- Tekstur: **tanpa** · Transisi: **blur-zoom** · Reveal: **partikel**.
- Judul/hook (E31 judul-gaya): masuk **fade** (fade naik), hiasan **neon** (cahaya neon aksen).
- Teks rotoscope (depth, di belakang subjek): **gradien** — gradien warna aksen.
- Efek khas gaya ini = efek yang mencantumkan `glass-tech` di `gaya_cocok` (dipilih lebih dulu oleh slot).

## Larangan
- Lebih dari 1 warna aksen dalam satu layar.
- Panel kaca di atas wajah subjek.
- Easing `pop`/bounce yang berlebihan (itu ciri bold-kinetic).

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G01.1 | Maksimal 1 kata beraksen per elemen teks (di luar caption). | manual |
| G01.2 | Kartu tidak menutupi wajah. | manual |
