---
id: G14
nama: coffee-lofi
versi: 0.4
status: draft
tokens: [platform@0.4, coffee-lofi@0.3]
konteks: [zona-aman@0.2, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.2]
ciri: [cokelat kopi, karamel, santai]
teks_di_video: panel
---

# G14 — Gaya: coffee-lofi (Coffee Lofi)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Hangat, santai, cozy. Cokelat kopi, krem, karamel & sage; semua bergerak pelan seperti musik lofi.

**Ciri pengenal:** cokelat kopi, karamel, santai.

## Tipografi
DM Serif Display + Poppins Bold — judul/depth vs isi/caption, maksimal dua keluarga font. Caption tebal + outline/bayangan; satu kata aksen per kalimat.

## Warna
Karamel (`aksen`) untuk kata kunci, sage (`aksen-2`) untuk ikon/garis. Krem untuk teks.

## Gerak
Masuk `naik` 24 px dalam 0,7 s, stagger 0,15; push-in 1,03 pelan.

## Elemen khas
Panel cokelat kopi 84%, blur 14, radius 22, bayangan lembut.

Teks/judul langsung di atas video: `"latar": "panel"` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Motif (token `motif`, dipakai otomatis oleh perangkat, panel & generator koreografi)
- Bingkai perangkat: **kertas** — kartu kertas, sudut terlipat, bayangan lembut, sedikit miring.
- Hiasan kata `*kunci*`: **garis** — garis bawah tergambar.
- Tekstur: **grain** · Transisi: **celup** · Reveal: **uap**.
- Judul/hook (E31 judul-gaya): masuk **ketik** (mesin ketik + kursor), hiasan **none** (tanpa).
- Teks rotoscope (depth, di belakang subjek): **padat** — warna aksen padat.
- Efek khas gaya ini = efek yang mencantumkan `coffee-lofi` di `gaya_cocok` (dipilih lebih dulu oleh slot).

## Larangan
- Gerak cepat < 0,4 s.
- Warna dingin/neon.
- SFX keras.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G14.1 | Tampilan terbaca sebagai Coffee Lofi (cokelat kopi, karamel, santai) tanpa melihat nama preset. | manual |
| G14.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
