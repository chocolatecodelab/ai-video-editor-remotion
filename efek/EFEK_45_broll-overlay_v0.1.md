---
id: E45
nama: broll-overlay
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
gaya_cocok: []
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [b-roll overlay, broll overlay, picture in picture, pip]
---

# E45 — Efek: B-roll Overlay (jendela)

**Deskripsi:** Klip b-roll di jendela bersudut bulat di atas talking head (picture-in-picture): muncul memantul, bingkai & bayangan mengikuti gaya (brutal: garis tebal + bayangan keras).

**Kapan dipakai:** Menunjukkan contoh/produk/layar sambil tetap melihat pembicara.

## Di pipeline ini (dukungan: native)
render.py `tipe: broll` + `jendela: true` atau `efek: broll-overlay` (render_pip). Field: file, dari, lebar, rasio, posisi/sisi atau x/y. Tidak dipilih slot otomatis (butuh file b-roll).

```json
{ "tipe": "broll", "efek": "broll-overlay", "file": "cache/ingest.mp4", "dari": 3.0, "lebar": 0.5, "rasio": "4:5", "posisi": "atas", "sisi": "kanan", "durasi": 4 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E45.4 | Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca. | manual |

## Bukti uji
Belum ada.
