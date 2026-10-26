---
id: G11
nama: kolase-kertas
versi: 0.5
status: draft
tokens: [platform@0.4, kolase-kertas@0.3]
konteks: [zona-aman@0.2, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.2, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.2]
ciri: [kolase zine, slab serif, jatuh]
teks_di_video: stroke
---

# G11 — Gaya: kolase-kertas (Kolase Kertas)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Kolase zine: potongan kertas ditempel, slab serif, warna pink & toska; elemen jatuh ke tempatnya.

**Ciri pengenal:** kolase zine, slab serif, jatuh.

## Tipografi
Bangers + Poppins Bold — judul/depth vs isi/caption, maksimal dua keluarga font. Caption tebal + outline/bayangan; satu kata aksen per kalimat.

## Warna
Pink (`aksen`) & toska (`aksen-2`) bergantian per beat; teks hitam di potongan putih.

## Gerak
Masuk `turun` 80 px dengan sedikit overshoot — seperti potongan dijatuhkan; stagger 0,14.

## Elemen khas
Potongan kertas putih opak, sudut 2, bayangan cokelat miring (8, 12).

Teks/judul langsung di atas video: `"stroke": true` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Motif (token `motif`, dipakai otomatis oleh perangkat, panel & generator koreografi)
- Bingkai perangkat: **kolase** — tepi sobek + 2 selotip, miring acak.
- Hiasan kata `*kunci*`: **selotip** — selotip di belakang kata.
- Tekstur: **kertas** · Transisi: **kertas** · Reveal: **selotip**.
- Judul/hook (E31 judul-gaya): masuk **stiker** (stiker miring + pop), hiasan **long-shadow** (bayangan panjang (stiker 3D)).
- Teks rotoscope (depth, di belakang subjek): **gradien** — gradien warna aksen.
- Efek khas gaya ini = efek yang mencantumkan `kolase-kertas` di `gaya_cocok` (dipilih lebih dulu oleh slot).

## Larangan
- Kaca/blur.
- Sudut bulat besar.
- Font sans tipis.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G11.1 | Tampilan terbaca sebagai Kolase Kertas (kolase zine, slab serif, jatuh) tanpa melihat nama preset. | manual |
| G11.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
