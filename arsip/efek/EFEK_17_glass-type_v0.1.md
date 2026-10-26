---
id: E17
nama: glass-type
versi: 0.1
status: draft
durasi: [2, 4]
stagger: null
dukungan: sebagian
gaya_cocok: [glass-tech]
konteks_terkait: [zona-aman, caption]
---

# E17 — Efek: Glass Type

**Deskripsi:** Tipografi bergaya kaca (glassmorphism): teks tembus pandang dengan blur, refleksi, dan tepi bercahaya.

**Kapan dipakai:** Judul modern, intro tech/premium, lower third elegan, tampilan futuristik.

## Elemen visual
- Teks tebal dengan efek kaca (frosted/transparent)
- Backdrop blur, refleksi cahaya, bevel tipis
- Latar gradien warna-warni atau bergerak

## Timing
2 - 4 detik; highlight cahaya menyapu teks (light sweep).

## Prompt
> Bold glass typography with frosted transparency and soft edge glow, light sweep passing across the letters, refractive highlights, colorful moving gradient background, premium modern look.

## Tips
Gunakan font tebal (heavy) agar efek kaca terbaca; kontras latar harus cukup tinggi.

## Di pipeline ini (dukungan: sebagian)
Sebagian native (gaya glass-tech): `judul` dengan `latar: "panel"` → panel kaca frosted (backdrop blur + tepi tipis) di belakang teks tebal.
Belum native: teks yang tembus pandang itu sendiri, refraksi, light sweep.

```json
{ "tipe": "judul", "efek": "glass-type", "teks": "Judul *Premium*", "latar": "panel", "masuk": "naik" }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E17.1 | Durasi elemen ber-`efek: glass-type` dalam rentang `durasi` (2–4 s). | otomatis |
| E17.4 | Hasil sesuai elemen visual & tips: Gunakan font tebal (heavy) agar efek kaca terbaca; kontras latar harus cukup tinggi. | manual |

## Bukti uji
Belum ada.
