---
id: E33
nama: langkah
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: Langkah
gaya_cocok: []
konteks_terkait: [zona-aman, gerak, sound-design]
---

# E33 — Efek: Langkah Berurutan

**Deskripsi:** Menjelaskan proses 2–4 tahap di pita atas: lingkaran bernomor, garis penghubung terisi, langkah aktif menyala.

**Kapan dipakai:** grafis penjelas talking head (referensi "Motion graphic penjelas"); bingkai, font & hiasan kata mengikuti gaya.

## Di pipeline ini (dukungan: native)
Composition Remotion `Langkah` (remotion/src/compositions/Penjelas.tsx). Generator slot: isi.langkah / item (≤ 14 huruf) → slot proses/langkah/ringkasan.

```json
{ "tipe": "remotion", "efek": "langkah", "item": ["Ide", "Skrip", "*Render*"], "posisi": "atas" }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E33.4 | Tidak menutupi wajah; teks singkat & terbaca. | manual |

## Bukti uji
Belum ada.
