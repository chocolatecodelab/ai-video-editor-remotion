---
id: E27
nama: aksen-gaya
versi: 0.1
status: draft
durasi: [1.2, 1.8]
stagger: null
dukungan: native
remotion: AksenGaya
gaya_cocok: []
konteks_terkait: [gerak, sound-design]
---

# E27 — Efek: Aksen Gaya (reveal khas gaya)

**Deskripsi:** Hiasan reveal tanpa teks di titik (x, y) sesuai `motif.reveal` gaya: kilau, target (kunci HUD), stempel, selotip, doodle (bintang + lingkar spidol), uap, garis.

**Kapan dipakai:** Momen 'aha', angka terungkap, akhir CTA — penanda visual khas gaya.

## Di pipeline ini (dukungan: native)
Native: overlay Remotion `AksenGaya` (dekoratif). Generator slot memakai ini untuk slot `reveal` bila motif.reveal ≠ partikel.

```json
{ "tipe": "remotion", "efek": "aksen-gaya", "jenis": "stempel", "x": 0.5, "y": 0.2, "durasi": 1.6 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E27.1 | Durasi elemen ber-`efek: aksen-gaya` dalam rentang `durasi`. | otomatis |
| E27.4 | Terasa khas gaya, tidak menutupi informasi penting. | manual |

## Bukti uji
Belum ada.
