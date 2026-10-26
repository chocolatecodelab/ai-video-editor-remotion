---
id: E10
nama: chart-grow
versi: 0.1
status: draft
durasi: [2, 4]
stagger: null
dukungan: eksternal
gaya_cocok: [glass-tech, bold-kinetic]
konteks_terkait: [zona-aman, gerak]
---

# E10 — Efek: Chart Grow

**Deskripsi:** Grafik (bar, line, pie) yang tumbuh/terbentuk secara animasi untuk menyajikan data.

**Kapan dipakai:** Laporan, edukasi, bisnis, statistik, pertumbuhan channel.

## Elemen visual
- Sumbu dan label bersih
- Batang naik dari nol / garis tergambar / irisan terbuka
- Angka yang menghitung naik (count-up) dan highlight pada puncak

## Timing
2 - 4 detik; batang naik berurutan (stagger) dengan ease-out.

## Prompt
> Animated bar chart growing from zero with staggered bars, numbers counting up above each bar, the tallest bar highlighted in an accent color, clean minimal design.

## Tips
Batasi jumlah data (maks 5 - 7) agar mudah dibaca dalam waktu singkat.

## Di pipeline ini (dukungan: eksternal)
Buat klip di After Effects / AI video generator (pakai **Prompt** di atas), ekspor 1080×1920, fps proyek, bt709 → `aset/broll/chart-grow.mp4`.

```json
{ "tipe": "broll", "file": "aset/broll/chart-grow.mp4", "efek": "chart-grow", "mulai": {"kata": "…"}, "sfx": true }
```

Kandidat native: data dari beat-sheet → batang ber-stagger + count-up, warna dari token.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E10.1 | Durasi elemen ber-`efek: chart-grow` dalam rentang `durasi` (2–4 s). | otomatis |
| E10.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E10.4 | Hasil sesuai elemen visual & tips: Batasi jumlah data (maks 5 - 7) agar mudah dibaca dalam waktu singkat. | manual |

## Bukti uji
Belum ada.
