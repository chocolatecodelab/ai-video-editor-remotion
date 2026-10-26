---
id: E02
nama: couch-wall
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: eksternal
gaya_cocok: []
konteks_terkait: [zona-aman]
---

# E02 — Efek: Couch Wall

**Deskripsi:** Adegan sofa di depan dinding yang berfungsi sebagai "kanvas": dinding menampilkan teks, grafis, foto, atau video yang berganti-ganti, seperti ruang tamu sebagai set presentasi.

**Kapan dipakai:** Storytelling santai, review, podcast/vlog, konten lifestyle atau edukasi dengan nuansa hangat.

## Elemen visual
- Sofa sebagai anchor visual (bisa ilustrasi, 3D, atau foto)
- Dinding polos dengan frame, poster, atau proyeksi
- Pencahayaan hangat, tanaman, lampu lantai sebagai dekor

## Timing
Konten di dinding berganti tiap 2 - 3 detik dengan transisi fade/slide.

## Prompt
> Cozy living room with a [warna] couch against a large blank wall, warm ambient light, content appearing on the wall as framed visuals that fade in and out, locked-off camera, minimal modern decor.

## Tips
Kamera statis; biarkan konten di dinding yang bergerak agar fokus tetap pada pesan.

## Di pipeline ini (dukungan: eksternal)
Buat klip di After Effects / AI video generator (pakai **Prompt** di atas), ekspor 1080×1920, fps proyek, bt709 → `aset/broll/couch-wall.mp4`.

```json
{ "tipe": "broll", "file": "aset/broll/couch-wall.mp4", "efek": "couch-wall", "mulai": {"kata": "…"}, "sfx": true }
```

Alternatif: rekam talking-head di depan dinding polos, lalu taruh konten dinding sebagai elemen `gambar` bergantian tiap 2–3 s (`masuk: "fade"`).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E02.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E02.4 | Hasil sesuai elemen visual & tips: Kamera statis; biarkan konten di dinding yang bergerak agar fokus tetap pada pesan. | manual |

## Bukti uji
Belum ada.
