---
id: E03
nama: ui-world
versi: 0.1
status: draft
durasi: [4, 6]
stagger: [0.05, 0.1]
dukungan: eksternal
gaya_cocok: [glass-tech]
konteks_terkait: [zona-aman, gerak]
---

# E03 — Efek: UI World

**Deskripsi:** Dunia/ruang yang seluruhnya terbuat dari elemen antarmuka (tombol, kartu, toggle, kursor, notifikasi) yang melayang atau tersusun sebagai lanskap.

**Kapan dipakai:** Video produk SaaS/aplikasi, tutorial teknologi, penjelasan fitur, promosi startup.

## Elemen visual
- Kartu UI, tombol, slider, ikon melayang dalam ruang 3D
- Kursor animasi yang "mengklik" elemen
- Warna konsisten dengan brand

## Timing
4 - 6 detik; elemen muncul bertahap dengan stagger 0.05 - 0.1 detik.

## Prompt
> A floating 3D world made of modern UI components: buttons, cards, toggles, notifications, and a cursor clicking through them, soft gradients, glassy surfaces, smooth camera drift, clean tech aesthetic.

## Tips
Gunakan spring animation (overshoot kecil) agar terasa responsif dan hidup.

## Di pipeline ini (dukungan: eksternal)
Buat klip di After Effects / AI video generator (pakai **Prompt** di atas), ekspor 1080×1920, fps proyek, bt709 → `aset/broll/ui-world.mp4`.

```json
{ "tipe": "broll", "file": "aset/broll/ui-world.mp4", "efek": "ui-world", "mulai": {"kata": "…"}, "sfx": true }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E03.1 | Durasi elemen ber-`efek: ui-world` dalam rentang `durasi` (4–6 s). | otomatis |
| E03.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E03.3 | Stagger antar item dalam rentang `stagger` (0.05–0.1 s). | otomatis |
| E03.4 | Hasil sesuai elemen visual & tips: Gunakan spring animation (overshoot kecil) agar terasa responsif dan hidup. | manual |

## Bukti uji
Belum ada.
