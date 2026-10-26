---
id: E22
nama: timeline
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: Timeline
gaya_cocok: []
konteks_terkait: [zona-aman, sound-design]
---

# E22 — Efek: Timeline editor

**Deskripsi:** Jendela timeline: trek (TEKS, B-ROLL, EFEK) muncul berurutan dengan blok/wajik, playhead berjalan, lalu chip kata tampil di bawah.

**Kapan dipakai:** Menjelaskan alur kerja editing, sinkron per kata, "seluruh formatnya".

## Di pipeline ini (dukungan: native — Remotion)
Composition `Timeline` (remotion/src/compositions/Timeline.tsx), jendela & warna dari token gaya. Jadwal gerak dihitung
`pipeline/scripts/perangkat.py` dan dipakai bersama oleh gambar & SFX (K08). Durasi terlalu pendek → render menolak
dengan durasi minimum.

Bunyi otomatis: Tick per trek, pop per chip.

```json
{ "tipe": "remotion", "efek": "timeline", "chip": ["semua", "pas", "dengan", "tiap", "kata"],
  "catatan": "ditambatkan ke kata", "mulai": 2.0, "durasi": 5.5 }
```
Field: judul, trek[{nama, blok, bentuk: blok|wajik}], chip[], catatan.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E22.4 | Perangkat dipakai karena isi kalimat (bukan hiasan berulang); tidak dipakai di dua beat berurutan. | manual |

## Bukti uji
Belum ada.
