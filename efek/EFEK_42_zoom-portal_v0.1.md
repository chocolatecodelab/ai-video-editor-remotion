---
id: E42
nama: zoom-portal
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
gaya_cocok: [apple-glass, glass-tech, kaca-gelap, minimalism, rts-modern]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [zoom portal, portal]
slot: [transisi]
---

# E42 — Efek: Zoom Portal

**Deskripsi:** Transisi portal: kamera masuk ke lingkaran bercahaya di tengah (luar meredup & membesar), lalu adegan baru muncul di dalam lingkaran yang membesar sampai penuh sementara adegan lama membeku di luar.

**Kapan dipakai:** Masuk ke bagian baru/penjelasan mendalam, 'mari kita lihat lebih dalam'.

## Di pipeline ini (dukungan: native)
render.py `tipe: transisi` jenis `portal` (render_kamera._portal); dipilih slot transisi untuk gaya di gaya_cocok.

```json
{ "tipe": "transisi", "efek": "zoom-portal", "mulai": {"beat": "solution"} }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E42.4 | Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca. | manual |

## Bukti uji
Belum ada.
