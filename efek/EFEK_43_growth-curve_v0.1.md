---
id: E43
nama: growth-curve
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: GrowthCurve
gaya_cocok: [glass-tech, apple-glass, kaca-gelap, rts-modern, minimalism, arang-lime, kertas-tipografi]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [growth curve, kurva pertumbuhan]
slot: [bukti, hasil]
---

# E43 — Efek: Growth Curve

**Deskripsi:** Kurva pertumbuhan eksponensial tergambar dengan cahaya + isian gradien; titik ujung membawa gelembung angka yang menghitung naik; penanda tonggak menyala saat dilewati.

**Kapan dipakai:** Pertumbuhan pengikut/omzet/retensi, 'dari 0 ke …'.

## Di pipeline ini (dukungan: native)
Composition `GrowthCurve` (bingkai gaya); tick SFX di tiap tonggak.

```json
{ "tipe": "remotion", "efek": "growth-curve", "judul": "penonton per minggu", "ke": 12000, "label_x": ["Jan", "Jun"], "tonggak": [{"x": 0.4, "label": "konsisten"}, {"x": 0.75, "label": "viral"}], "catatan": "naik *12×*", "posisi": "bawah", "durasi": 4.5 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E43.4 | Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca. | manual |

## Bukti uji
Belum ada.
