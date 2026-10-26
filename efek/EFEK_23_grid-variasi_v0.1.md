---
id: E23
nama: grid-variasi
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: GridVariasi
gaya_cocok: []
konteks_terkait: [zona-aman, sound-design]
---

# E23 — Efek: Grid variasi

**Deskripsi:** "1 workflow → N variasi": penghitung mengikuti ubin berwarna yang terisi pelan → cepat → pelan dalam grid.

**Kapan dipakai:** Skala/hasil berlipat (variasi, konten, produk), "satu alur kerja, banyak variasi".

## Di pipeline ini (dukungan: native — Remotion)
Composition `GridVariasi` (remotion/src/compositions/GridVariasi.tsx), jendela & warna dari token gaya. Jadwal gerak dihitung
`pipeline/scripts/perangkat.py` dan dipakai bersama oleh gambar & SFX (K08). Durasi terlalu pendek → render menolak
dengan durasi minimum.

Bunyi otomatis: Tick bergulir saat ubin terisi, pop saat penuh.

```json
{ "tipe": "remotion", "efek": "grid-variasi", "judul": "ship", "ke": 60, "label": "variasi", "mulai": 1.0, "durasi": 4.0 }
```
Field: judul, dari_label, ke, label, kolom (12), durasi_isi.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E23.4 | Perangkat dipakai karena isi kalimat (bukan hiasan berulang); tidak dipakai di dua beat berurutan. | manual |

## Bukti uji
Belum ada.
