---
id: E24
nama: form-ganti
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: FormGanti
gaya_cocok: []
konteks_terkait: [zona-aman, sound-design]
---

# E24 — Efek: Form ganti nilai

**Deskripsi:** Formulir konfigurasi: baris bergantian disorot, nilai lama bergeser keluar diganti nilai baru, lencana "✓ diganti" muncul.

**Kapan dipakai:** Kustomisasi ("ganti apa pun yang kamu mau"), sebelum→sesudah pengaturan, template yang bisa diubah.

## Di pipeline ini (dukungan: native — Remotion)
Composition `FormGanti` (remotion/src/compositions/FormGanti.tsx), jendela & warna dari token gaya. Jadwal gerak dihitung
`pipeline/scripts/perangkat.py` dan dipakai bersama oleh gambar & SFX (K08). Durasi terlalu pendek → render menolak
dengan durasi minimum.

Bunyi otomatis: Tick saat nilai berganti, pop saat lencana muncul.

```json
{ "tipe": "remotion", "efek": "form-ganti", "baris": [{"label": "host", "lama": "Host asli", "baru": "Host kamu"},
  {"label": "bahasa", "lama": "English", "baru": "Indonesia"}], "mulai": 1.0, "durasi": 4.0 }
```
Field: judul, baris[{label, lama, baru}], lencana, stagger.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E24.4 | Perangkat dipakai karena isi kalimat (bukan hiasan berulang); tidak dipakai di dua beat berurutan. | manual |

## Bukti uji
Belum ada.
