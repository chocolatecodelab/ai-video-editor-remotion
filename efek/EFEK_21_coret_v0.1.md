---
id: E21
nama: coret
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: Coret
gaya_cocok: []
konteks_terkait: [zona-aman, sound-design]
---

# E21 — Efek: Coret kata

**Deskripsi:** Kartu file (ikon dokumen + nama) berisi kata/frasa; garis coret ditarik kiri→kanan, teks meredup, lencana ✕ memantul.

**Kapan dipakai:** Membantah anggapan ("bukan cuma naskahnya"), membandingkan cara lama vs baru, "salah".

## Di pipeline ini (dukungan: native — Remotion)
Composition `Coret` (remotion/src/compositions/Coret.tsx), jendela & warna dari token gaya. Jadwal gerak dihitung
`pipeline/scripts/perangkat.py` dan dipakai bersama oleh gambar & SFX (K08). Durasi terlalu pendek → render menolak
dengan durasi minimum.

Bunyi otomatis: Gores saat dicoret, ding salah saat ✕ muncul.

```json
{ "tipe": "remotion", "efek": "coret", "judul": "naskah.txt", "teks": "naskahnya", "mulai": {"kata": "naskahnya"}, "durasi": 2.5 }
```
Field: judul, teks, tunda (detik setelah mulai sebelum dicoret).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E21.4 | Perangkat dipakai karena isi kalimat (bukan hiasan berulang); tidak dipakai di dua beat berurutan. | manual |

## Bukti uji
Belum ada.
