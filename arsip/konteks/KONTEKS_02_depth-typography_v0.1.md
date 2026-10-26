---
id: K02
nama: depth-typography
versi: 0.1
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
| K02.3 | Teks depth maksimal 2 kata dan masih terbaca ≥ 50% walau tertutup subjek. | otomatis (jumlah kata) + manual |
| K02.4 | Tepi rambut, hijab, dan tangan yang bergerak cepat diperiksa per frame; tidak ada "halo" atau potongan hilang. | manual |
| K02.5 | Exposure & white balance subjek sudah disamakan dengan latar sebelum compositing (lihat K04.3). | manual |

## Parameter
`font.depth`, `ukuran.depth`, `mask.feather-px`.

## Alat
- Otomatis: `pipeline/scripts/roto.py` (backend mediapipe / rembg), hasil di-cache.
- Kualitas tinggi: Roto Brush 3 (After Effects) atau Magic Mask (DaVinci) → ekspor PNG alpha ke `cache/masks/` dengan nama `000001.png …`.

## Bukti uji
Belum ada.
