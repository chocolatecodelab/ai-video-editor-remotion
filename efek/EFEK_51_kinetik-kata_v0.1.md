---
id: E51
nama: kinetik-kata
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: KinetikKata
gaya_cocok: [glass-tech, bold-kinetic, apple-glass, kaca-gelap, arang-lime, rts-modern, paper-motion, minimalism, retro-brutalism, kertas-tipografi, kolase-kertas, doodle-art, sketch-art, coffee-lofi]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [kinetic typography, kinetic text, tipografi kinetik]
slot: []
---

# E51 — Efek: kinetik-kata

**Deskripsi:** Tipografi kinetik: frasa ucapan tampil kata demi kata TEPAT saat diucapkan (waktu dari `cache/words.json`), tiap kata naik dari balik masker, kata *aksen* miring berwarna aksen + hiasan motif gaya; frasa berikutnya menggantikan frasa sebelumnya.

**Kapan dipakai:** Mengisi jeda tanpa grafis di video reflektif/motivasi; menekankan kalimat emosional ("it hurts", "keep growing"). Tulis frasa PERSIS seperti diucapkan (kata dicocokkan ke transkrip); 1–6 kata per frasa.

## Di pipeline ini (dukungan: native)
Composition `KinetikKata` (tanpa panel, teks langsung di atas video, posisi atas di atas kepala). `frasa` = daftar kalimat; elemen dimulai di kata pertama dan berakhir setelah kata terakhir + ±1 s. Belum dipilih otomatis oleh generator slot (isi harus ditulis dari ucapan) — pasang manual di beat-sheet.

```json
{ "tipe": "remotion", "efek": "kinetik-kata", "frasa": ["still trying to find *your way.*", "honestly, *it hurts.*"], "mulai": 0.6, "durasi": 4.0 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E51.4 | Kata muncul sinkron dengan ucapan (tonton dengan suara); teks tidak menutupi wajah & tidak bertumpuk dengan teks lain. | manual |

## Bukti uji
Belum ada.
