---
id: E46
nama: paper-cutout
versi: 0.1
status: draft
durasi: [2, 6]
stagger: null
dukungan: native
gaya_cocok: [kolase-kertas, paper-motion, doodle-art, sketch-art, coffee-lofi, kertas-tipografi]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [paper cutout, stiker subjek]
slot: [kamera]
param: {tepi-px: 16, getar-px: 3, durasi-masuk: 0.4}
---

# E46 — Efek: Paper Cutout (subjek stiker)

**Deskripsi:** Subjek menjadi potongan kertas/stiker: tepi putih tebal bertekstur + bayangan di atas latar kertas warna gaya, gerak dipatah 12 fps (getar stop-motion). Beda dengan paper-cut E13 (adegan lapisan kertas).

**Kapan dipakai:** Konten santai/kerajinan/kolase, momen lucu atau penekanan playful.

## Di pipeline ini (dukungan: native)
render.py `tipe: kamera` (render_kamera._paper_cutout), butuh mask roto.

```json
{ "tipe": "kamera", "efek": "paper-cutout", "fungsi": "reveal", "mulai": 0.6, "durasi": 3.5 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E46.1 | Durasi elemen ber-`efek: paper-cutout` dalam rentang `durasi`. | otomatis |
| E46.4 | Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca. | manual |

## Bukti uji
Belum ada.
