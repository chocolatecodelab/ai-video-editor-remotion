---
id: E17
nama: glass-type
versi: 0.2
status: draft
durasi: [2, 4]
stagger: null
dukungan: native
remotion: GlassType
gaya_cocok: [glass-tech, apple-glass, kaca-gelap]
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

## Di pipeline ini (dukungan: native)
Native: overlay Remotion `GlassType` — huruf raksasa kaca (isi tipis, tepi terang, kilau melintas) naik bergantian; video di balik huruf di-blur render.py → kaca sungguhan.

```json
{ "tipe": "remotion", "efek": "glass-type", "teks": "FOKUS", "y": 0.3 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E17.1 | Durasi elemen ber-`efek: glass-type` dalam rentang `durasi` (2–4 s). | otomatis |
| E17.4 | Hasil sesuai elemen visual & tips: Gunakan font tebal (heavy) agar efek kaca terbaca; kontras latar harus cukup tinggi. | manual |

## Bukti uji
Belum ada.
