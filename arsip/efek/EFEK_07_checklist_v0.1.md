---
id: E07
nama: checklist
versi: 0.1
status: draft
durasi: null
stagger: [0.6, 1.0]
dukungan: sebagian
gaya_cocok: [glass-tech, bold-kinetic]
konteks_terkait: [zona-aman, gerak]
---

# E07 — Efek: Checklist

**Deskripsi:** Daftar poin yang dicentang satu per satu dengan animasi centang (check) yang memuaskan.

**Kapan dipakai:** Ringkasan fitur, langkah-langkah, keunggulan, syarat, atau rekap di akhir video.

## Elemen visual
- 3 - 6 baris teks
- Kotak centang yang terisi dengan animasi stroke
- Warna aksen (hijau) untuk centang

## Timing
Satu item per 0.6 - 1 detik; centang selesai dalam 0.3 detik.

## Prompt
> A clean checklist animation: text lines appear one by one, each followed by a green checkmark drawing itself inside a rounded box, soft pop and subtle sound cue, minimal background.

## Tips
Gunakan trim path pada stroke centang; tambahkan sedikit scale bounce saat selesai.

## Di pipeline ini (dukungan: sebagian)
Sebagian native: `kartu` dengan `item` (3–6) dan `stagger` 0,6–1,0 s → item muncul satu per satu.
Belum native: kotak centang yang tergambar (stroke draw-on) + bounce. Font Montserrat tidak punya glyph ✓, jadi penanda sementara `→`.

```json
{ "tipe": "kartu", "efek": "checklist", "judul": "Ringkasan", "item": ["Poin 1", "Poin 2", "Poin 3"], "penanda": "→", "stagger": 0.8, "sfx": "pop" }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E07.3 | Stagger antar item dalam rentang `stagger` (0.6–1.0 s). | otomatis |
| E07.4 | Hasil sesuai elemen visual & tips: Gunakan trim path pada stroke centang; tambahkan sedikit scale bounce saat selesai. | manual |

## Bukti uji
Belum ada.
