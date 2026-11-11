---
id: E48
nama: validasi-badge
versi: 0.1
status: draft
durasi: [1.5, 4]
stagger: null
dukungan: native
remotion: ValidasiBadge
gaya_cocok: [glass-tech, apple-glass, bold-kinetic, arang-lime, retro-brutalism, rts-modern]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [validasi badge, salah benar pill, comparison badge, validation capsule]
slot: [masalah, solusi, perbandingan, demonstrasi]
---

# E48 — Efek: Validasi Badge (Kapsul Morfosis Salah ➔ Benar)

**Deskripsi:** Kapsul visual perbandingan metode (morphing validation badge):
- Fase 1 (`✕ Salah`): Indikator merah solid dengan silang putih, pendaran merah peringatan, dan teks penjelasan kesalahan umum (misalnya: "Teks menutupi wajah penutur").
- Transisi Morfosis (pada `jadwal.ganti`): Efek pantulan pegas (micro-spring rebound), rotasi ikon 180°, dan sapuan kilau spekular melintasi permukaan kaca.
- Fase 2 (`✓ Benar`): Berubah menjadi hijau emerald / cyan cerah dengan centang putih, label terverifikasi, dan teks solusi (misalnya: "Teks rapi di balik subjek").
Sinkron dengan audio cue status (`chip-salah` ➔ `chip-benar`).

**Kapan dipakai:** Menunjukkan kontras "cara salah" vs "cara pro", mitos vs fakta, kesalahan umum kreator pemula, validasi perbaikan teknik visual di video tutorial/edukasi.

## Di pipeline ini (dukungan: native)
Overlay Remotion `ValidasiBadge` di atas footage penutur.

```json
{
  "tipe": "remotion",
  "efek": "validasi-badge",
  "salah_teks": "Salah",
  "salah_sub": "Teks menutupi wajah penutur",
  "benar_teks": "Benar",
  "benar_sub": "Teks rapi di balik subjek (rotoscope)",
  "posisi": "atas",
  "durasi": 3.5,
  "ganti": 1.8
}
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E48.1 | Durasi elemen ber-`efek: validasi-badge` dalam rentang `durasi` (1.5–4 detik). | otomatis |
| E48.2 | Waktu `ganti` berada di antara durasi masuk dan sebelum durasi keluar. | otomatis |
| E48.3 | Bunyi `chip-salah` (ding-salah) di awal dan `chip-benar` (ding-benar) saat transisi tepat mengenai pergantian frame. | otomatis |
| E48.4 | Tidak menutupi mata atau bibir pembicara (posisi atas atau bawah zona aman). | manual |

## Bukti uji
- Uji render still composition: `remotion still ValidasiBadge --frame 30` berhasil tanpa galat.
- Analisis referensi: `referensi/rotoscope-ref/` (0:02–0:07).
