---
id: K05
nama: gerak
versi: 0.2
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
| K05.6 | Setelah masuk, elemen diam: tidak ada gerak berulang (denyut, napas, kedip, goyang, kilau berulang) pada elemen UI. Pengecualian: inti efek (orbit, kertas stop-motion), motif gaya dari token (`motif.boil`, bingkai `hud`, `motif.judul.hiasan`) dan latar layar penuh. Penarik perhatian boleh berdenyut terbatas (≤ 2 kali) lalu diam. | manual (storyboard; kode: remotion/README.md) |

## Parameter
`easing.*`, `durasi.*`, `gerak.*`, `motion-blur.*`.

Perangkat Remotion masuk/keluar dengan `gerak.masuk-default`, `gerak.keluar-default`, `gerak.skala-pop` dan `durasi.*`
lewat `<Wadah>` (remotion/src/lib/dasar.tsx) — rumus sama dengan Animator Python, jadi semua elemen satu video bergerak
dengan bahasa yang sama. Animasi skala memakai perceptual-scale (skill resmi Remotion).

## Bukti uji
Belum ada.
