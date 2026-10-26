---
id: E39
nama: snap-zoom
versi: 0.1
status: draft
durasi: [0.8, 2.5]
stagger: null
dukungan: native
gaya_cocok: [bold-kinetic, arang-lime, retro-brutalism, kolase-kertas, doodle-art, paper-motion, rts-modern]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [snap zoom, zoom kilat]
slot: [kamera]
param: {skala: 1.45, durasi-masuk: 0.16, durasi-keluar: 0.14}
---

# E39 — Efek: Snap Zoom

**Deskripsi:** Zoom kilat ke wajah dalam ±0,16 s dengan zoom-blur dan kilatan putih singkat, tahan, lalu kembali kilat. Lebih agresif dari digital-zoom (punch-in bertahap).

**Kapan dipakai:** Punchline, reaksi, kata kunci yang ditekan keras.

## Di pipeline ini (dukungan: native)
render.py `tipe: kamera` (render_kamera._snap_zoom), fokus ke wajah (cache/wajah.json) + bunyi hit.

```json
{ "tipe": "kamera", "efek": "snap-zoom", "fungsi": "hasil", "mulai": 0.6, "durasi": 1.8 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E39.1 | Durasi elemen ber-`efek: snap-zoom` dalam rentang `durasi`. | otomatis |
| E39.4 | Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca. | manual |

## Bukti uji
Belum ada.
