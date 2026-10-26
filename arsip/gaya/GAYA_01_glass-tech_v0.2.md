---
id: G01
nama: glass-tech
versi: 0.2
status: draft
tokens: [platform@0.1, glass-tech@0.1]
konteks: [zona-aman@0.1, caption@0.1, depth-typography@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1]
ciri: [kaca gelap biru, cyan, presisi]
teks_di_video: panel
---

# G01 — Gaya: glass-tech

> Isi default. Ganti dengan aturan dari file guideline asli, lalu naikkan versi.

## Rasa / Mood
Jernih, teknologis, tenang. Informasi mengambang di atas panel kaca gelap; gerak halus dan presisi.

## Tipografi
- `judul` (Montserrat ExtraBold 96) untuk hook dan judul bagian, maksimal 2 baris.
- `isi` (SemiBold 48) untuk poin di kartu.
- `caption` (ExtraBold 62), huruf kapital normal, stroke tipis.
- `depth` (Black 240) untuk 1–2 kata di belakang subjek pada momen kunci.

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

## Larangan
- Lebih dari 1 warna aksen dalam satu layar.
- Panel kaca di atas wajah subjek.
- Easing `pop`/bounce yang berlebihan (itu ciri bold-kinetic).

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G01.1 | Maksimal 1 kata beraksen per elemen teks (di luar caption). | manual |
| G01.2 | Kartu tidak menutupi wajah. | manual |
