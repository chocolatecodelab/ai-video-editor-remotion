---
id: E03
nama: ui-world
versi: 0.2
status: draft
durasi: [4, 6]
stagger: [0.05, 0.1]
dukungan: native
remotion: UIWorld
gaya_cocok: [glass-tech, apple-glass, kaca-gelap, rts-modern, arang-lime]
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

## Di pipeline ini (dukungan: native)
Native: klip cutaway Remotion `UIWorld` — panel UI 3D (grafik, daftar, progres) di kedalaman berbeda, kamera dolly menembus, berakhir di panel judul → broll otomatis.

```json
{ "tipe": "remotion", "efek": "ui-world", "judul": "Semua *terhubung*", "sub": "data · tim", "mulai": 3.0, "selesai": 8.0 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E03.1 | Durasi elemen ber-`efek: ui-world` dalam rentang `durasi` (4–6 s). | otomatis |
| E03.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E03.3 | Stagger antar item dalam rentang `stagger` (0.05–0.1 s). | otomatis |
| E03.4 | Hasil sesuai elemen visual & tips: Gunakan spring animation (overshoot kecil) agar terasa responsif dan hidup. | manual |

## Bukti uji
Belum ada.
