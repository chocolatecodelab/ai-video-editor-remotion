---
id: E25
nama: partikel
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: Partikel
gaya_cocok: []
konteks_terkait: [zona-aman, sound-design]
---

# E25 — Efek: Ledakan partikel

**Deskripsi:** Titik/kotak kecil berwarna token meledak dari satu titik, melambat, jatuh pelan, memudar. Dekoratif, dijepit di zona aman.

**Kapan dipakai:** Reveal angka/nama/logo, momen "wow", penutup CTA.

## Di pipeline ini (dukungan: native — Remotion)
Composition `Partikel` (remotion/src/compositions/Partikel.tsx), jendela & warna dari token gaya. Jadwal gerak dihitung
`pipeline/scripts/perangkat.py` dan dipakai bersama oleh gambar & SFX (K08). Durasi terlalu pendek → render menolak
dengan durasi minimum.

Bunyi otomatis: Kilau (taburan nada tinggi).

```json
{ "tipe": "remotion", "efek": "partikel", "x": 0.5, "y": 0.3, "mulai": {"kata": "gratis"}, "durasi": 1.2 }
```
Field: x, y (0–1), jumlah (28), jangkau (px, 260).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E25.4 | Perangkat dipakai karena isi kalimat (bukan hiasan berulang); tidak dipakai di dua beat berurutan. | manual |

## Bukti uji
Belum ada.
