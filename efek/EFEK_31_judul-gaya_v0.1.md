---
id: E31
nama: judul-gaya
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: JudulGaya
gaya_cocok: []
konteks_terkait: [caption, gerak, sound-design]
---

# E31 — Efek: Judul Gaya (efek teks profesional)

**Deskripsi:** Judul/hook dengan efek teks khas gaya — dari referensi "Style effect profesional": pop bouncy, mask
slide-up, mesin ketik, slam, stiker, neon glow, gradient bergerak, glitch RGB, long shadow, kotak highlight, underline draw.

**Kapan dipakai:** Otomatis untuk setiap elemen `judul` bila gaya punya token `motif.judul` (semua gaya v0.3).
`"efek_teks": false` atau `x`/`y` di elemen → judul PIL biasa.

## Pemetaan gaya (token motif.judul + motif.aksen)
| Gaya | Masuk | Hiasan | Kata aksen |
|---|---|---|---|
| glass-tech | fade naik | neon | kilau |
| bold-kinetic | pop | — | kotak highlight |
| apple-glass | mask slide-up | gradient bergerak | kilau |
| kaca-gelap | mask slide-up | — | underline draw |
| arang-lime | slam | — | kotak highlight |
| rts-modern | mesin ketik | glitch RGB | target |
| paper-motion | pop | long shadow | underline draw |
| minimalism | mask slide-up | — | underline draw |
| retro-brutalism | slam | long shadow | stabilo |
| kertas-tipografi | mask slide-up | — | underline draw |
| kolase-kertas | stiker | long shadow | selotip |
| doodle-art | pop | — | lingkar spidol |
| sketch-art | mesin ketik | — | arsir |
| coffee-lofi | mesin ketik | — | underline draw |

## Di pipeline ini (dukungan: native)
render.py mengubah elemen `judul` menjadi overlay Remotion `JudulGaya`; keterbacaan tetap dari `latar: "panel"` (bingkai
gaya) atau `stroke` (outline + bayangan). Mesin ketik: jadwal huruf dari perangkat.py → klik SFX per huruf.

```json
{ "tipe": "judul", "teks": "Jangan upload sebelum
*baca ini*", "posisi": "atas", "stroke": true }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E31.4 | Maksimal dua keluarga font, satu kata aksen per kalimat, efek tidak mengganggu keterbacaan. | manual |

## Bukti uji
Belum ada.
