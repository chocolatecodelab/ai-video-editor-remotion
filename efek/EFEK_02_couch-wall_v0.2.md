---
id: E02
nama: couch-wall
versi: 0.2
status: draft
durasi: null
stagger: null
dukungan: native
remotion: CouchWall
gaya_cocok: [coffee-lofi, paper-motion, kertas-tipografi, minimalism, doodle-art, sketch-art, apple-glass]
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

## Di pipeline ini (dukungan: native)
Native: klip cutaway Remotion `CouchWall` — ilustrasi ruang tamu warna token (sofa, lampu bercahaya, tanaman), bingkai dinding berganti isi tiap ±2,5 s → broll otomatis. Durasi mengikuti narasi (≥ 4 s).

```json
{ "tipe": "remotion", "efek": "couch-wall", "konten": [{"judul": "Mulai dari *satu* ide"}, {"judul": "Rekam tanpa naskah"}], "mulai": 6.0, "selesai": 12.0 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E02.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E02.4 | Hasil sesuai elemen visual & tips: Kamera statis; biarkan konten di dinding yang bergerak agar fokus tetap pada pesan. | manual |

## Bukti uji
Belum ada.
