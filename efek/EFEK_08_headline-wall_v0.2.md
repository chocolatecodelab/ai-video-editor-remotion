---
id: E08
nama: headline-wall
versi: 0.2
status: draft
durasi: [3, 5]
stagger: null
dukungan: native
remotion: HeadlineWall
gaya_cocok: [bold-kinetic, kertas-tipografi, retro-brutalism, kolase-kertas, kaca-gelap]
konteks_terkait: [zona-aman, parallax-push]
alias: [headline wall]
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

## Di pipeline ini (dukungan: native)
Native: klip cutaway Remotion `HeadlineWall` — dinding kartu berita 3D miring jatuh bergantian, satu kartu (`sorot`) maju & membesar → broll otomatis.

```json
{ "tipe": "remotion", "efek": "headline-wall", "judul_judul": ["…", "…", "*…*"], "sorot": 2, "mulai": 5.0, "selesai": 9.5 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E08.1 | Durasi elemen ber-`efek: headline-wall` dalam rentang `durasi` (3–5 s). | otomatis |
| E08.4 | Hasil sesuai elemen visual & tips: Gunakan headline fiktif/buatan sendiri atau yang berlisensi untuk menghindari masalah hak cipta. | manual |

## Bukti uji
Belum ada.
