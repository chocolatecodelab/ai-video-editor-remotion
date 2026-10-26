---
id: E05
nama: digital-zoom
versi: 0.1
status: draft
durasi: [1, 2]
stagger: null
dukungan: sebagian
gaya_cocok: [glass-tech]
konteks_terkait: [zona-aman, parallax-push]
---

# E05 — Efek: Digital Zoom

**Deskripsi:** Zoom in/out ala layar digital: pixelated, scan-line, atau glitch halus saat memperbesar detail.

**Kapan dipakai:** Menyorot detail di layar, data, kode, peta, atau bukti visual; gaya tech/hacker.

## Elemen visual
- Target zoom (kotak seleksi/reticle)
- Efek pixel/mosaic saat transisi resolusi
- HUD tipis, angka, dan garis pengarah

## Timing
1 - 2 detik; mulai lambat, cepat di tengah, melambat di akhir.

## Prompt
> Digital zoom into a screen detail with a selection box locking on target, subtle pixelation and scan lines during the zoom, HUD overlay, crisp resolve at the end.

## Tips
Kombinasikan dengan suara "beep" atau whoosh digital untuk dampak maksimal.

## Di pipeline ini (dukungan: sebagian)
Sebagian native: `push` dengan `fokus` ke target + `easing: "tegas"` (lambat–cepat–lambat) + sfx.
Belum native: pixelation, scan-line, reticle/HUD. Skala push dibatasi K03.1 (≤ 1,15) — zoom detail yang lebih dalam dibuat eksternal sebagai broll.

```json
{ "tipe": "push", "efek": "digital-zoom", "mulai": {"kata": "…"}, "gerak": 1.2, "fokus": [0.5, 0.35], "easing": "tegas", "sfx": "whoosh" }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E05.1 | Durasi elemen ber-`efek: digital-zoom` dalam rentang `durasi` (1–2 s). | otomatis |
| E05.4 | Hasil sesuai elemen visual & tips: Kombinasikan dengan suara "beep" atau whoosh digital untuk dampak maksimal. | manual |

## Bukti uji
Belum ada.
