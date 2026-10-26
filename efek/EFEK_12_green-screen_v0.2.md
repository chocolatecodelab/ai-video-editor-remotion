---
id: E12
nama: green-screen
versi: 0.2
status: draft
durasi: null
stagger: null
dukungan: native
gaya_cocok: []
konteks_terkait: [depth-typography, ingest]
alias: [green screen, ganti latar]
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

## Di pipeline ini (dukungan: native)
Native (render.py, `tipe: kamera`): latar di balik subjek diganti latar gaya (gradien token + cahaya aksen) memakai mask roto — tanpa green screen saat rekaman. Untuk hasil terbaik tetap rekam di latar polos.

```json
{ "tipe": "kamera", "efek": "green-screen", "mulai": 0, "selesai": 6 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E12.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E12.4 | Hasil sesuai elemen visual & tips: Pencahayaan latar hijau harus rata, jarak subjek 1.5 - 2 m dari layar untuk mengurangi green spill. | manual |

## Bukti uji
Belum ada.
