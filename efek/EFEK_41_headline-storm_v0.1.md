---
id: E41
nama: headline-storm
versi: 0.1
status: draft
durasi: [3, 5]
stagger: null
dukungan: native
remotion: HeadlineStorm
gaya_cocok: [bold-kinetic, retro-brutalism, arang-lime, rts-modern, kolase-kertas, kaca-gelap]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [headline storm, badai berita]
slot: [hook, konteks, masalah]
---

# E41 — Efek: Headline Storm

**Deskripsi:** Badai judul berita: belasan potongan judul melesat dari segala arah (rotasi, blur gerak), layar bergetar, lalu semuanya meredup dan satu judul utama menghentak di tengah. Lebih kacau & cepat dari headline-wall.

**Kapan dipakai:** Hook kontroversi, 'semua orang membicarakan…', masalah yang membanjiri.

## Di pipeline ini (dukungan: native)
Klip cutaway Remotion `HeadlineStorm` → broll otomatis.

```json
{ "tipe": "remotion", "efek": "headline-storm", "judul_judul": ["Harga *naik* lagi", "Kreator bingung", "Algoritma berubah", "Semua panik"], "utama": "Tenang, ini *solusinya*", "durasi": 4.5 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E41.1 | Durasi elemen ber-`efek: headline-storm` dalam rentang `durasi`. | otomatis |
| E41.4 | Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca. | manual |

## Bukti uji
Belum ada.
