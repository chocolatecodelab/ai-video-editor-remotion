---
id: E54
nama: bab-baru
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: BabBaru
gaya_cocok: [kertas-tipografi, minimalism, coffee-lofi, kaca-gelap, apple-glass, paper-motion, kolase-kertas, sketch-art, doodle-art]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [new chapter, page turn, book flip, halaman buku]
slot: []
---

# E54 — Efek: bab-baru

**Deskripsi:** Adegan metafora cutaway: buku terbuka, beberapa halaman berbalik 3D (bayangan lipatan), lalu kamera mendekat ke halaman kanan berisi kepala bab baru.

**Kapan dipakai:** Penutup reflektif: "a different chapter", awal baru, fase hidup.

## Di pipeline ini (dukungan: native)
Composition `BabBaru` (cutaway). Opsional `kepala` ("Chapter"), `nomor` ("II"), `sub`. Belum dipilih otomatis oleh generator slot (isi harus ditulis dari ucapan) — pasang manual di beat-sheet.

```json
{ "tipe": "remotion", "efek": "bab-baru", "judul": "A *different* chapter", "sub": "of your life", "kepala": "Chapter", "nomor": "II", "mulai": 0.4, "durasi": 5.0 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E54.4 | Balik halaman mulus (tanpa kedip), judul bab terbaca setelah kamera mendekat. | manual |

## Bukti uji
Belum ada.
