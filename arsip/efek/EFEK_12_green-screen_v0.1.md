---
id: E12
nama: green-screen
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: eksternal
gaya_cocok: [glass-tech, bold-kinetic]
konteks_terkait: [depth-typography, ingest]
---

# E12 — Efek: Green Screen

**Deskripsi:** Subjek difilmkan di depan latar hijau lalu dikomposisikan ke latar/adegan digital apa pun.

**Kapan dipakai:** Presenter di depan grafis, dunia virtual, efek khusus, video edukasi.

## Elemen visual
- Subjek dengan pencahayaan merata
- Latar pengganti (motion graphic, foto, 3D)
- Bayangan dan color matching agar menyatu

## Timing
Mengikuti durasi narasi; ganti latar tiap topik/beat.

## Prompt
> A presenter composited over a dynamic motion-graphics background, clean keyed edges with no green spill, matched lighting and soft shadow, subtle background parallax.

## Tips
Pencahayaan latar hijau harus rata, jarak subjek 1.5 - 2 m dari layar untuk mengurangi green spill.

## Di pipeline ini (dukungan: eksternal)
Keying di DaVinci/After Effects, hasil (subjek + latar baru) dipakai sebagai `aset.rekaman`.
Kandidat native: mask subjek dari `roto` + latar pengganti dari beat-sheet (tanpa perlu layar hijau).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E12.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E12.4 | Hasil sesuai elemen visual & tips: Pencahayaan latar hijau harus rata, jarak subjek 1.5 - 2 m dari layar untuk mengurangi green spill. | manual |

## Bukti uji
Belum ada.
