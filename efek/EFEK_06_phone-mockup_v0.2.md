---
id: E06
nama: phone-mockup
versi: 0.2
status: draft
durasi: [3, 6]
stagger: null
dukungan: native
gaya_cocok: [glass-tech, apple-glass, kaca-gelap, minimalism, arang-lime, bold-kinetic]
konteks_terkait: [zona-aman]
alias: [phone mockup]
---

# E06 — Efek: Phone Mockup

**Deskripsi:** Layar ponsel berisi aplikasi/video/website yang ditampilkan dalam bingkai perangkat, bisa berputar, miring, atau bergerak.

**Kapan dipakai:** Demo aplikasi, promosi media sosial, showcase desain, tutorial.

## Elemen visual
- Bingkai ponsel (flat atau 3D)
- Konten layar bergulir (scroll) atau berganti
- Latar gradien/abstrak, callout teks di samping

## Timing
3 - 6 detik; scroll konten dengan kecepatan nyaman dibaca.

## Prompt
> A modern smartphone mockup floating at a slight angle, the screen showing an app scrolling smoothly, soft shadow, gradient background, callout labels appearing beside the device.

## Tips
Pastikan konten layar resolusinya tinggi (retina). Tambahkan refleksi kaca tipis agar realistis.

## Di pipeline ini (dukungan: native)
Native (render.py, `tipe: kamera`): rekaman masuk ke dalam bodi ponsel (bezel, notch, sudut membulat, bayangan) melayang di atas latar gaya, naik saat masuk.

```json
{ "tipe": "kamera", "efek": "phone-mockup", "fungsi": "konteks", "mulai": 10.0, "selesai": 14.0 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E06.1 | Durasi elemen ber-`efek: phone-mockup` dalam rentang `durasi` (3–6 s). | otomatis |
| E06.4 | Hasil sesuai elemen visual & tips: Pastikan konten layar resolusinya tinggi (retina). Tambahkan refleksi kaca tipis agar realistis. | manual |

## Bukti uji
Belum ada.
