---
id: K04
nama: ingest
versi: 0.1
status: draft
bergantung_pada: [tokens/TOKEN_00_platform]
---

# K04 — Ingest, Rough Cut, Color Correction

## Tujuan
Bahan mentah seragam (resolusi, fps, loudness, warna) sebelum efek ditambahkan, agar tidak ada animasi yang terbuang.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K04.1 | Rekaman hasil ingest: resolusi = `format.resolusi`, fps = `format.fps`, tinggi sumber ≥ `ingest.tinggi-min`. | otomatis |
| K04.2 | Rough cut (potong jeda & kesalahan) selesai sebelum beat-sheet dikunci; potongan dicatat di `manifest.aset.potong`. | manual |
| K04.3 | Exposure & white balance disamakan sebelum compositing (`manifest.warna.filter`). | manual |
| K04.4 | Audio dibersihkan (highpass + denoise) dan dinormalisasi ke `audio.lufs` saat ingest. | otomatis |

## Parameter
`format.*`, `ingest.*`, `audio.*`.

## Bukti uji
Belum ada.
