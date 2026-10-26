---
id: K02
nama: depth-typography
versi: 0.2
status: draft
bergantung_pada: [K00]
---

# K02 — Depth Typography (teks di belakang subjek)

## Tujuan
Teks besar diletakkan di antara latar dan subjek agar terasa berlapis. Butuh mask subjek yang bersih.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K02.1 | Elemen `depth` hanya dirender bila mask subjek tersedia untuk seluruh rentang waktunya (`cache/masks/`). | otomatis |
| K02.2 | Feather tepi mask 1–2 px (`mask.feather-px`). | otomatis |
| K02.3 | Teks depth maksimal 2 kata dan tetap TERBACA: bagian huruf yang tertutup subjek rata-rata ≤ `depth.qa-tutup-rata` (30 %) dan puncak ≤ `depth.qa-tutup-maks` (45 %) — diukur per frame dari mask saat render. Render menata otomatis teks DI ATAS kepala (dasar huruf tertutup ≤ `depth.tutup-maks` 25 %), memakai titik tertinggi kepala selama teks tampil. | otomatis |
| K02.4 | Tepi rambut, hijab, dan tangan yang bergerak cepat diperiksa per frame; tidak ada "halo" atau potongan hilang. | manual |
| K02.6 | Teks depth tidak bertumpuk dengan teks/panel lain yang tampil bersamaan (penataan otomatis menghindari pita teks lain; ruang kurang → huruf dikecilkan hingga 60 %). | otomatis |
| K02.5 | Exposure & white balance subjek sudah disamakan dengan latar sebelum compositing (lihat K04.3). | manual |

## Parameter
`font.depth`, `ukuran.depth`, `mask.feather-px`.

## Alat
- Otomatis: `pipeline/scripts/roto.py` (backend mediapipe / rembg), hasil di-cache.
- Kualitas tinggi: Roto Brush 3 (After Effects) atau Magic Mask (DaVinci) → ekspor PNG alpha ke `cache/masks/` dengan nama `000001.png …`.

## Bukti uji
Belum ada.
