---
id: E37
nama: liquid-glass
versi: 0.1
status: draft
durasi: [2, 6]
stagger: null
dukungan: native
remotion: LiquidGlass
gaya_cocok: [apple-glass, glass-tech, kaca-gelap, minimalism]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [liquid glass, kaca cair]
slot: [hook, hasil, konteks]
---

# E37 — Efek: Liquid Glass (kaca cair)

**Deskripsi:** Panel kaca cair ala Apple: video di belakang panel DIBIASKAN (tepi melengkungkan gambar, tengah sedikit membesar, aberasi kromatik halus) — bukan sekadar blur; tepi berkilau, kilau spekular melintas, panel 'morf' dari pil ke kartu.

**Kapan dipakai:** Judul/label premium, tombol ajakan, sorotan satu pesan di atas talking head bergaya kaca.

## Di pipeline ini (dukungan: native)
Remotion `LiquidGlass` menggambar bentuk + teks (isi alpha rendah); render.py (render_pip._lensa) membiaskan video di dalam bentuk tiap frame (distance transform → arah normal tepi → remap per kanal).

```json
{ "tipe": "remotion", "efek": "liquid-glass", "judul": "Efek *kaca cair*", "sub": "video di belakangnya ikut melengkung", "posisi": "atas", "opasitas": 0.24, "durasi": 3.5 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E37.1 | Durasi elemen ber-`efek: liquid-glass` dalam rentang `durasi`. | otomatis |
| E37.4 | Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca. | manual |

## Bukti uji
Belum ada.
