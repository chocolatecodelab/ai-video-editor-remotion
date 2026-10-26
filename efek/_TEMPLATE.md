---
id: ENN
nama: TODO-nama-pendek
versi: 0.1
status: draft
durasi: [2, 4]          # rentang detik elemen ber-efek ini; null = mengikuti narasi
stagger: null           # [min, maks] detik antar item, bila efek berisi daftar
dukungan: eksternal     # native | sebagian | eksternal
gaya_cocok: []
konteks_terkait: [zona-aman]
---

# ENN — Efek: TODO

**Deskripsi:**

**Kapan dipakai:**

## Elemen visual
-

## Timing

## Prompt
> (prompt siap pakai untuk AI video generator / brief editor)

## Tips

## Di pipeline ini (dukungan: eksternal)
Cara merealisasikan di beat-sheet (elemen native, atau broll dari klip eksternal) + contoh JSON.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| ENN.1 | Durasi elemen ber-`efek` ini dalam rentang `durasi`. | otomatis |
| ENN.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. (hanya eksternal) | otomatis |
| ENN.3 | Stagger antar item dalam rentang `stagger`. (hanya bila ada stagger) | otomatis |
| ENN.4 | Hasil sesuai elemen visual & tips. | manual |

## Bukti uji
Belum ada.
