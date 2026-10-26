---
id: E05
nama: digital-zoom
versi: 0.2
status: draft
durasi: [1, 2]
stagger: null
dukungan: native
gaya_cocok: [bold-kinetic, arang-lime, retro-brutalism, glass-tech, rts-modern, kaca-gelap]
konteks_terkait: [zona-aman, parallax-push]
alias: [punch in, punch zoom]
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

## Di pipeline ini (dukungan: native)
Native (render.py, `tipe: kamera`): punch-in bertahap (token kamera.digital-zoom.skala) tepat di `ketukan`, guncang kecil yang meluruh, berpusat di **wajah** (cache/wajah.json) + bunyi hit per ketukan.

```json
{ "tipe": "kamera", "efek": "digital-zoom", "fungsi": "hasil", "mulai": {"kata": "…"}, "durasi": 1.6, "ketukan": [0, 0.7] }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E05.1 | Durasi elemen ber-`efek: digital-zoom` dalam rentang `durasi` (1–2 s). | otomatis |
| E05.4 | Hasil sesuai elemen visual & tips: Kombinasikan dengan suara "beep" atau whoosh digital untuk dampak maksimal. | manual |

## Bukti uji
Belum ada.
