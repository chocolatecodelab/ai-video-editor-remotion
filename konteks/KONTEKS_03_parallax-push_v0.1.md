---
id: K03
nama: parallax-push
versi: 0.1
status: draft
bergantung_pada: [K00]
---

# K03 — Parallax Push

## Tujuan
Gerak kamera virtual (push-in) yang menegaskan momen penting tanpa membuat pusing.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K03.1 | Skala push ≤ `gerak.push-in` dan ≤ 1,15. | otomatis |
| K03.2 | Durasi push ≥ 0,6 detik dan memakai easing (bukan linear). | otomatis |
| K03.3 | Push dimulai pada kata kunci atau beat audio (`mulai: {"kata": …}`). | otomatis (peringatan) |
| K03.4 | Lapisan teks bergerak lebih lambat dari latar (parallax), bukan ikut terskala sama. | otomatis (render) |
| K03.5 | Push tidak membuat elemen keluar zona aman (lihat K00.1). | otomatis |

## Parameter
`gerak.push-in`, `easing.standar`.

## Bukti uji
Belum ada.
