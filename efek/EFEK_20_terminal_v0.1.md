---
id: E20
nama: terminal
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: Terminal
gaya_cocok: []
konteks_terkait: [zona-aman, sound-design]
---

# E20 — Efek: Terminal mengetik

**Deskripsi:** Jendela terminal: perintah diketik setelah "›", Enter, lalu baris keluaran muncul satu per satu; baris "✓ …" berwarna aksen.

**Kapan dipakai:** Tutorial command/CLI, "kasih ke AI agent", menunjukkan proses otomatis langkah demi langkah.

## Di pipeline ini (dukungan: native — Remotion)
Composition `Terminal` (remotion/src/compositions/Terminal.tsx), jendela & warna dari token gaya. Jadwal gerak dihitung
`pipeline/scripts/perangkat.py` dan dipakai bersama oleh gambar & SFX (K08). Durasi terlalu pendek → render menolak
dengan durasi minimum.

Bunyi otomatis: Klik per huruf, tick per baris, ding saat baris ✓ terakhir.

```json
{ "tipe": "remotion", "efek": "terminal", "judul": "Claude Code", "perintah": "klon reel ini jadi workflow",
  "keluaran": ["membaca reel.mp4", "memetakan tiap potongan", "✓ workflow siap"], "mulai": 1.0, "durasi": 4.5 }
```
Field: judul, perintah, keluaran[], cps, stagger.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E20.4 | Perangkat dipakai karena isi kalimat (bukan hiasan berulang); tidak dipakai di dua beat berurutan. | manual |

## Bukti uji
Belum ada.
