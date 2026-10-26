---
id: E14
nama: doodle-boil
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: eksternal
gaya_cocok: [bold-kinetic]
konteks_terkait: [zona-aman]
---

# E14 — Efek: Doodle Boil

**Deskripsi:** Garis coretan tangan yang bergetar/"mendidih" (boil) karena tiap frame digambar sedikit berbeda.

**Kapan dipakai:** Penjelasan santai, anotasi, highlight, konten edukatif yang playful.

## Elemen visual
- Garis tepi tidak rapi, bergetar halus
- Panah, lingkaran, bintang, garis bawah ala coretan
- Warna terbatas (2 - 3 warna)

## Timing
Boil 8 - 12 fps; elemen muncul dengan efek "digambar" (draw-on).

## Prompt
> Hand-drawn doodle annotations with a wobbling line-boil effect, arrows, circles and underlines drawing on, marker texture, limited color palette, playful feel.

## Tips
Di After Effects: Turbulent Displace dengan Evolution diatur via expression `wiggle` per beberapa frame (mis. `posterizeTime(10)`).

## Di pipeline ini (dukungan: eksternal)
Buat klip di After Effects / AI video generator (pakai **Prompt** di atas), ekspor 1080×1920, fps proyek, bt709 → `aset/broll/doodle-boil.mp4`.

```json
{ "tipe": "broll", "file": "aset/broll/doodle-boil.mp4", "efek": "doodle-boil", "mulai": {"kata": "…"}, "sfx": true }
```

Untuk anotasi di atas talking-head dibutuhkan overlay ber-alpha (ProRes 4444) — belum didukung render.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E14.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E14.4 | Hasil sesuai elemen visual & tips: Di After Effects: Turbulent Displace dengan Evolution diatur via expression `wiggle` per beberapa frame (mis. `posterizeTime(10)`). | manual |

## Bukti uji
Belum ada.
