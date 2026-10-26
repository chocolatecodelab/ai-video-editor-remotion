---
id: K07
nama: ekspor
versi: 0.1
status: draft
bergantung_pada: [tokens/TOKEN_00_platform]
---

# K07 — Review & Ekspor

## Tujuan
Satu master berkualitas tinggi untuk arsip, lalu versi per platform yang sesuai spesifikasi.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K07.1 | Master tersimpan (`out/master.mov`, ProRes 422 HQ). | otomatis |
| K07.2 | Versi platform: H.264, `format.resolusi`, `ekspor.pix_fmt`, tag warna bt709 (primaries/trc/matrix), AAC. | otomatis |
| K07.3 | Ditonton di HP pada resolusi penuh sebelum diunggah (zona aman, keterbacaan, sinkron bibir). | manual |

## Parameter
`ekspor.*`, `format.*`. Durasi dicek oleh aturan template (TNN.2).

## Bukti uji
Belum ada.
