---
id: E44
nama: studio-reveal
versi: 0.1
status: draft
durasi: [3, 6]
stagger: null
dukungan: native
remotion: StudioSet
gaya_cocok: [apple-glass, glass-tech, kaca-gelap, minimalism, rts-modern, bold-kinetic]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [studio reveal]
slot: [kamera]
param: {lubang: [0.2, 0.12, 0.8, 0.72], durasi-masuk: 1.2, durasi-keluar: 0.6}
---

# E44 — Efek: Studio Reveal

**Deskripsi:** Kamera mundur dari layar: rekaman ternyata tampil di layar besar sebuah studio virtual warna gaya (strip LED aksen, softbox, meja, lantai mengkilap).

**Kapan dipakai:** Pembuka segmen, 'selamat datang di…', memberi kesan produksi besar.

## Di pipeline ini (dukungan: native)
render.py `tipe: kamera` (render_kamera._studio_reveal) + set Remotion `StudioSet` berlubang layar.

```json
{ "tipe": "kamera", "efek": "studio-reveal", "fungsi": "konteks", "mulai": 0.6, "durasi": 4.2, "judul": "STUDIO" }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E44.1 | Durasi elemen ber-`efek: studio-reveal` dalam rentang `durasi`. | otomatis |
| E44.4 | Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca. | manual |

## Bukti uji
Belum ada.
