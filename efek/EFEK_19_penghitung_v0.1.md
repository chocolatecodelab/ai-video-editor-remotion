---
id: E19
nama: penghitung
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: Penghitung
gaya_cocok: []
konteks_terkait: [zona-aman, sound-design]
---

# E19 — Efek: Penghitung naik (count-up)

**Deskripsi:** Kartu/jendela dengan angka yang naik cepat lalu melambat (ease-out), bintang/ikon menyala dan angka memantul kecil saat selesai.

**Kapan dipakai:** Bukti sosial (bintang, pengikut, unduhan), statistik, pencapaian, "tembus 23 ribu".

## Di pipeline ini (dukungan: native — Remotion)
Composition `Penghitung` (remotion/src/compositions/Penghitung.tsx), jendela & warna dari token gaya. Jadwal gerak dihitung
`pipeline/scripts/perangkat.py` dan dipakai bersama oleh gambar & SFX (K08). Durasi terlalu pendek → render menolak
dengan durasi minimum.

Bunyi otomatis: Angka naik dengan tick rapat di awal & jarang di akhir; pop saat angka berhenti.

```json
{ "tipe": "remotion", "efek": "penghitung", "judul": "hypit-ai / hypit", "sub": "Clone any viral video with AI agents",
  "ke": 23877, "label": "bintang", "posisi": "tengah", "mulai": 0.3, "durasi": 3.5 }
```
Field: judul, sub, dari (0), ke, label, akhiran (mis. "+"), bintang (true), durasi_hitung.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E19.4 | Perangkat dipakai karena isi kalimat (bukan hiasan berulang); tidak dipakai di dua beat berurutan. | manual |

## Bukti uji
Belum ada.
