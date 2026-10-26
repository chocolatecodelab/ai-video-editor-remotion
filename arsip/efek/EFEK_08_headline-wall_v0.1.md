---
id: E08
nama: headline-wall
versi: 0.1
status: draft
durasi: [3, 5]
stagger: null
dukungan: sebagian
gaya_cocok: [bold-kinetic]
konteks_terkait: [zona-aman, parallax-push]
---

# E08 — Efek: Headline Wall

**Deskripsi:** Dinding berisi banyak judul berita/headline/kutipan yang tersusun rapat, lalu kamera menyorot atau memperbesar satu headline.

**Kapan dipakai:** Menunjukkan liputan media, tren, opini publik, sorotan "viral", atau bukti sosial.

## Elemen visual
- Grid headline dari berbagai sumber (gaya koran/web)
- Satu headline utama di-highlight (warna, kotak, blur sisanya)
- Efek parallax saat kamera bergerak

## Timing
3 - 5 detik; zoom menuju headline utama di detik ke-2.

## Prompt
> A dense wall of news headlines in varied fonts and layouts, the camera slowly pushing in and focusing on one highlighted headline while the rest blur softly, subtle parallax motion.

## Tips
Gunakan headline fiktif/buatan sendiri atau yang berlisensi untuk menghindari masalah hak cipta.

## Di pipeline ini (dukungan: sebagian)
Sebagian native: `gambar` grid headline (PNG yang Anda susun) + `push` dengan `fokus` ke headline utama ±2 s setelah elemen muncul.
Belum native: blur selektif & parallax antar baris.

```json
{ "tipe": "gambar", "efek": "headline-wall", "file": "aset/grafis/headlines.png", "lebar": 1.0 },
{ "tipe": "push", "efek": "headline-wall", "mulai": 2.0, "gerak": 1.5, "fokus": [0.4, 0.45] }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E08.1 | Durasi elemen ber-`efek: headline-wall` dalam rentang `durasi` (3–5 s). | otomatis |
| E08.4 | Hasil sesuai elemen visual & tips: Gunakan headline fiktif/buatan sendiri atau yang berlisensi untuk menghindari masalah hak cipta. | manual |

## Bukti uji
Belum ada.
