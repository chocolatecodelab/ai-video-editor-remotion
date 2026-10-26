---
id: E35
nama: callout
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: Callout
gaya_cocok: []
konteks_terkait: [zona-aman, gerak, sound-design]
---

# E35 — Efek: Callout Lingkaran

**Deskripsi:** Menunjuk bagian layar (tutorial/demo): lingkaran berdenyut di (x, y) + garis penunjuk ke label.

**Kapan dipakai:** grafis penjelas talking head (referensi "Motion graphic penjelas"); bingkai, font & hiasan kata mengikuti gaya.

## Di pipeline ini (dukungan: native)
Composition Remotion `Callout` (remotion/src/compositions/Penjelas.tsx). Generator slot: isi.callout {x, y, teks} → slot masalah/langkah.

```json
{ "tipe": "remotion", "efek": "callout", "x": 0.7, "y": 0.6, "teks": "Klik *di sini*" }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E35.4 | Tidak menutupi wajah; teks singkat & terbaca. | manual |

## Bukti uji
Belum ada.
