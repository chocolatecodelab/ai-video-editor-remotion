---
id: E01
nama: orbit
versi: 0.1
status: draft
durasi: [3, 5]
stagger: null
dukungan: eksternal
gaya_cocok: [glass-tech]
konteks_terkait: [zona-aman]
---

# E01 — Efek: Orbit

**Deskripsi:** Kamera atau objek berputar mengelilingi subjek utama dalam lintasan melingkar (360° atau sebagian).

**Kapan dipakai:** Memamerkan produk, karakter, atau objek dari semua sisi; intro yang dramatis.

## Elemen visual
- Subjek di tengah (produk/orang/logo 3D)
- Latar polos atau gradien
- Elemen pendukung (teks, ikon) ikut mengorbit dengan kecepatan berbeda (efek parallax)

## Timing
3 - 5 detik, rotasi halus dan konstan, ease-in-out di awal dan akhir.

## Prompt
> Smooth 360-degree orbit camera around a [subjek] centered in frame, soft studio lighting, clean [warna] background, subtle depth of field, slow and cinematic motion.

## Tips
Tambah bayangan lantai dan refleksi agar terasa 3D. Di After Effects: gunakan 3D layer + camera null rotate.

## Di pipeline ini (dukungan: eksternal)
Buat klip di After Effects / AI video generator (pakai **Prompt** di atas), ekspor 1080×1920, fps proyek, bt709 → `aset/broll/orbit.mp4`.

```json
{ "tipe": "broll", "file": "aset/broll/orbit.mp4", "efek": "orbit", "mulai": {"kata": "…"}, "sfx": true }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E01.1 | Durasi elemen ber-`efek: orbit` dalam rentang `durasi` (3–5 s). | otomatis |
| E01.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E01.4 | Hasil sesuai elemen visual & tips: Tambah bayangan lantai dan refleksi agar terasa 3D. Di After Effects: gunakan 3D layer + camera null rotate. | manual |

## Bukti uji
Belum ada.
