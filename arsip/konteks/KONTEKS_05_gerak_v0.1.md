---
id: K05
nama: gerak
versi: 0.1
status: draft
bergantung_pada: [K00]
---

# K05 — Gerak & Animasi

## Tujuan
Gerak yang terasa disengaja: ber-easing, berurutan, dan selaras dengan ucapan/beat.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K05.1 | Tidak ada gerak linear; setiap animasi memakai kurva dari `easing.*`. | otomatis |
| K05.2 | Elemen berisi beberapa item muncul dengan stagger ≥ `durasi.stagger`. | otomatis |
| K05.3 | Teks tampil penuh (di luar animasi masuk/keluar) ≥ `durasi.tahan-min`. | otomatis |
| K05.4 | Gerak cepat (> `motion-blur.ambang-px` per frame) diberi motion blur. | otomatis (render) |
| K05.5 | Gerak besar (judul, kartu, push) dimulai dalam ±0,15 detik dari awal kata atau beat. | otomatis (peringatan) |

## Parameter
`easing.*`, `durasi.*`, `gerak.*`, `motion-blur.*`.

## Bukti uji
Belum ada.
