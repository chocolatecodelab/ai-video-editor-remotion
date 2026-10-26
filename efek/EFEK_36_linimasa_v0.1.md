---
id: E36
nama: linimasa
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: Linimasa
gaya_cocok: []
konteks_terkait: [zona-aman, gerak, sound-design]
---

# E36 — Efek: Linimasa (timeline tahun)

**Deskripsi:** Menceritakan perjalanan/urutan waktu: garis tergambar, titik tahun + label muncul bergantian.

**Kapan dipakai:** grafis penjelas talking head (referensi "Motion graphic penjelas"); bingkai, font & hiasan kata mengikuti gaya.

## Di pipeline ini (dukungan: native)
Composition Remotion `Linimasa` (remotion/src/compositions/Penjelas.tsx). Generator slot: isi.linimasa [{tahun, label}] → slot konteks/bukti.

```json
{ "tipe": "remotion", "efek": "linimasa", "titik": [{"tahun": "2022", "label": "Mulai"}, {"tahun": "2026", "label": "Skala"}] }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E36.4 | Tidak menutupi wajah; teks singkat & terbaca. | manual |

## Bukti uji
Belum ada.
