---
id: E52
nama: lintasan
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: Lintasan
gaya_cocok: [kertas-tipografi, minimalism, coffee-lofi, kaca-gelap, apple-glass, paper-motion, kolase-kertas, sketch-art, doodle-art]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [race lanes, different paths, jalur berbeda]
slot: []
---

# E52 — Efek: lintasan

**Deskripsi:** Adegan metafora cutaway: beberapa jalur lari mulai dari satu garis start lalu bercabang ke tujuan berbeda; tiap pelari punya kecepatan sendiri; jalur milikmu (*…*) berwarna aksen.

**Kapan dipakai:** "Life isn't a race", "kita tidak menuju tujuan yang sama", membandingkan diri dengan orang lain.

## Di pipeline ini (dukungan: native)
Composition `Lintasan` (cutaway layar penuh, latar gaya + tekstur). `tujuan` 2–4 label; tandai satu dengan *…*. Belum dipilih otomatis oleh generator slot (isi harus ditulis dari ucapan) — pasang manual di beat-sheet.

```json
{ "tipe": "remotion", "efek": "lintasan", "judul": "Not the same *destination*", "sub": "life isn't a race", "tujuan": ["career", "family", "*your path*", "travel"], "mulai": 0.4, "durasi": 4.5 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E52.4 | Metafora terbaca tanpa suara; label tujuan terbaca; terasa khas gaya. | manual |

## Bukti uji
Belum ada.
