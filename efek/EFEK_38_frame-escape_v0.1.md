---
id: E38
nama: frame-escape
versi: 0.1
status: draft
durasi: [2.5, 5]
stagger: null
dukungan: native
gaya_cocok: [glass-tech, bold-kinetic, kolase-kertas, paper-motion, arang-lime, apple-glass, retro-brutalism]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [frame escape, keluar bingkai]
slot: [kamera]
param: {skala: 0.62, miring: 7, tunda: 0.35, durasi-lepas: 0.6, skala-subjek: 1.0, pusat-y: 0.45, tebal: 10, durasi-masuk: 0.5}
---

# E38 — Efek: Frame Escape

**Deskripsi:** Rekaman mengecil menjadi kartu/foto miring di atas latar gaya, lalu SUBJEK melangkah keluar dari kartu — membesar ke ukuran penuh di depan kartu dengan bayangan. Beda dengan frame-break (subjek hanya menembus tepi).

**Kapan dipakai:** Momen 'keluar dari kotak', perubahan besar, transisi dari cerita ke penjelasan langsung.

## Di pipeline ini (dukungan: native)
render.py `tipe: kamera` (render_kamera._frame_escape), butuh mask roto (otomatis).

```json
{ "tipe": "kamera", "efek": "frame-escape", "fungsi": "reveal", "mulai": 0.6, "durasi": 4 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E38.1 | Durasi elemen ber-`efek: frame-escape` dalam rentang `durasi`. | otomatis |
| E38.4 | Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca. | manual |

## Bukti uji
Belum ada.
