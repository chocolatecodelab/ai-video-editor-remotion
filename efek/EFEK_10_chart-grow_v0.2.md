---
id: E10
nama: chart-grow
versi: 0.2
status: draft
durasi: [3, 6]
stagger: null
dukungan: native
remotion: ChartGrow
gaya_cocok: []
konteks_terkait: [zona-aman, gerak]
alias: [chart grow, grafik batang]
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

## Di pipeline ini (dukungan: native)
Native: perangkat Remotion `ChartGrow` — batang (atau `bentuk: garis`) tumbuh bergantian dengan angka menghitung, batang `sorot` beraksen, catatan muncul terakhir; tick SFX per batang (jadwal perangkat.py).

```json
{ "tipe": "remotion", "efek": "chart-grow", "judul": "retensi", "nilai": [22, 31, 54, 73], "label": ["Jan", "Feb", "Mar", "Apr"], "akhiran": "%", "catatan": "naik *3×*" }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E10.1 | Durasi elemen ber-`efek: chart-grow` dalam rentang `durasi` (2–4 s). | otomatis |
| E10.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E10.4 | Hasil sesuai elemen visual & tips: Batasi jumlah data (maks 5 - 7) agar mudah dibaca dalam waktu singkat. | manual |

## Bukti uji
Belum ada.
