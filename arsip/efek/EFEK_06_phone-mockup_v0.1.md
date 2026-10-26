---
id: E06
nama: phone-mockup
versi: 0.1
status: draft
durasi: [3, 6]
stagger: null
dukungan: sebagian
gaya_cocok: [glass-tech, bold-kinetic]
konteks_terkait: [zona-aman]
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

## Di pipeline ini (dukungan: sebagian)
Sebagian native: `gambar` PNG mockup (layar statis) + `teks`/`kartu` sebagai callout.
Belum native: konten layar yang scroll, rotasi 3D — buat eksternal sebagai broll bila perlu.

```json
{ "tipe": "gambar", "efek": "phone-mockup", "file": "aset/grafis/mockup.png", "lebar": 0.7, "posisi": "tengah", "masuk": "naik" }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E06.1 | Durasi elemen ber-`efek: phone-mockup` dalam rentang `durasi` (3–6 s). | otomatis |
| E06.4 | Hasil sesuai elemen visual & tips: Pastikan konten layar resolusinya tinggi (retina). Tambahkan refleksi kaca tipis agar realistis. | manual |

## Bukti uji
Belum ada.
