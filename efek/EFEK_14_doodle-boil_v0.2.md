---
id: E14
nama: doodle-boil
versi: 0.2
status: draft
durasi: null
stagger: null
dukungan: native
remotion: DoodleBoil
gaya_cocok: [doodle-art, sketch-art, paper-motion, kolase-kertas, coffee-lofi]
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

## Di pipeline ini (dukungan: native)
Native: overlay Remotion `DoodleBoil` (alpha) — anotasi tangan (lingkar, panah+label, garis, bintang, kurung) tergambar lalu bergetar (boil = motif.boil gaya); + transisi `coretan` (spidol menutup layar).

```json
{ "tipe": "remotion", "efek": "doodle-boil", "anotasi": [{"jenis": "panah", "x": 0.64, "y": 0.34, "arah": 35, "teks": "ini!"}] }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E14.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E14.4 | Hasil sesuai elemen visual & tips: Di After Effects: Turbulent Displace dengan Evolution diatur via expression `wiggle` per beberapa frame (mis. `posterizeTime(10)`). | manual |

## Bukti uji
Belum ada.
