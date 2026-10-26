---
id: E28
nama: whip
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
gaya_cocok: [arang-lime, bold-kinetic]
konteks_terkait: [gerak, sound-design]
---

# E28 — Efek: Whip Pan

**Deskripsi:** Geser cepat horizontal dengan blur arah gerak; potongan tersembunyi di puncak blur.

**Kapan dipakai:** Pindah topik cepat, energi tinggi.

## Di pipeline ini (dukungan: native)
Native (render.py, `tipe: transisi`, jenis `whip`). Default transisi gaya arang-lime.

```json
{ "tipe": "transisi", "efek": "whip", "mulai": {"beat": "solution"} }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E28.4 | Terasa khas gaya, tidak menutupi informasi penting. | manual |

## Bukti uji
Belum ada.
