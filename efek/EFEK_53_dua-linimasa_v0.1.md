---
id: E53
nama: dua-linimasa
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: DuaLinimasa
gaya_cocok: [kertas-tipografi, minimalism, coffee-lofi, kaca-gelap, apple-glass, paper-motion, kolase-kertas, sketch-art, doodle-art]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [two timelines, your own timeline, linimasa sendiri]
slot: []
---

# E53 — Efek: dua-linimasa

**Deskripsi:** Adegan metafora cutaway: dua linimasa vertikal berdampingan — milik mereka lurus dengan tonggak berjarak sama yang tercentang cepat; milikmu berkelok dengan tonggak di tempat & tempo sendiri; ditutup cap "on your time".

**Kapan dipakai:** "Jangan ikuti linimasa orang lain", tempo hidup berbeda, perbandingan pencapaian.

## Di pipeline ini (dukungan: native)
Composition `DuaLinimasa` (cutaway). `titik_a` = tonggak mereka (2–4), `titik_b` = tonggakmu (2–5), opsional `label_a`, `label_b`, `cap`. Belum dipilih otomatis oleh generator slot (isi harus ditulis dari ucapan) — pasang manual di beat-sheet.

```json
{ "tipe": "remotion", "efek": "dua-linimasa", "judul": "Your *own* timeline", "sub": "not someone else's", "label_a": "theirs", "label_b": "yours", "titik_a": ["degree", "job", "house"], "titik_b": ["learn", "fail", "grow", "bloom"], "mulai": 0.4, "durasi": 4.4 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E53.4 | Kontras dua tempo terbaca dalam sekali lihat; label tidak terpotong tepi. | manual |

## Bukti uji
Belum ada.
