---
id: E32
nama: lower-third
versi: 0.1
status: draft
durasi: [2.5, 5]
stagger: null
dukungan: native
remotion: LowerThird
gaya_cocok: []
konteks_terkait: [zona-aman, gerak, sound-design]
---

# E32 — Efek: Lower Third

**Deskripsi:** Memperkenalkan pembicara atau topik di awal video: pita aksen menyapu, nama + peran naik dari masker, di atas pita caption.

**Kapan dipakai:** grafis penjelas talking head (referensi "Motion graphic penjelas"); bingkai, font & hiasan kata mengikuti gaya.

## Di pipeline ini (dukungan: native)
Composition Remotion `LowerThird` (remotion/src/compositions/Penjelas.tsx). Generator slot: isi.nama, isi.peran → slot hook/konteks.

```json
{ "tipe": "remotion", "efek": "lower-third", "nama": "Rina *Pratama*", "peran": "Konten kreator edukasi" }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E32.1 | Durasi elemen ber-`efek: lower-third` dalam rentang `durasi`. | otomatis |
| E32.4 | Tidak menutupi wajah; teks singkat & terbaca. | manual |

## Bukti uji
Belum ada.
