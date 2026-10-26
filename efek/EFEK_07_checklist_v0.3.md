---
id: E07
nama: checklist
versi: 0.3
status: draft
durasi: null
stagger: [0.6, 1.0]
dukungan: native
remotion: Checklist
gaya_cocok: []
konteks_terkait: [zona-aman, gerak]
alias: [checklist]
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

## Di pipeline ini (dukungan: native — Remotion)
Composition `Checklist` (remotion/src/compositions/Checklist.tsx): panel → judul → item ber-stagger; tiap item
masuk 0,25 s, centang SVG tergambar 0,3 s (trim path), lalu bounce 0,25 s. Warna centang = `warna.aksen` gaya
(pustaka menyebut hijau; di sistem ini aksen mengikuti gaya). Panel dari token; kaca (backdrop blur) dikomposit Python.
`sfx_item` memberi bunyi tiap centang selesai.

```json
{ "tipe": "remotion", "efek": "checklist", "judul": "Ringkasan", "item": ["Poin 1", "Poin *2*", "Poin 3"],
  "stagger": 0.8, "posisi": "tengah", "mulai": {"kata": "ringkasnya"}, "sfx": true, "sfx_item": "pop" }
```

Alternatif tanpa Node/Remotion (sebagian): `{"tipe": "kartu", "item": [...], "penanda": "→", "stagger": 0.8}`.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E07.3 | Stagger antar item dalam rentang `stagger` (0.6–1.0 s). | otomatis |
| E07.4 | Hasil sesuai elemen visual & tips: Gunakan trim path pada stroke centang; tambahkan sedikit scale bounce saat selesai. | manual |

## Bukti uji
Belum ada.
