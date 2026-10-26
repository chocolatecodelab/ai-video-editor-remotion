---
id: E13
nama: paper-cut
versi: 0.1
status: draft
durasi: [3, 5]
stagger: null
dukungan: eksternal
gaya_cocok: []
konteks_terkait: [zona-aman]
---

# E13 — Efek: Paper Cut

**Deskripsi:** Gaya animasi bertekstur kertas berlapis, dengan bayangan antar layer sehingga terasa handmade dan 3D.

**Kapan dipakai:** Konten anak, storytelling hangat, edukasi kreatif, branding yang ramah.

## Elemen visual
- Layer kertas warna-warni dengan tepi bergerigi
- Bayangan lembut antar layer (drop shadow)
- Gerakan stop-motion (12 fps) yang sedikit patah

## Timing
3 - 5 detik; gunakan 12 fps untuk karakter handmade.

## Prompt
> Layered paper cut-out scene with handmade texture, soft drop shadows between layers, gentle stop-motion movement at 12 fps, warm pastel color palette.

## Tips
Tambahkan tekstur kertas (grain) dan serat halus di atas semua layer untuk kesan autentik.

## Di pipeline ini (dukungan: eksternal)
Buat klip di After Effects / AI video generator (pakai **Prompt** di atas), ekspor 1080×1920, fps proyek, bt709 → `aset/broll/paper-cut.mp4`.

```json
{ "tipe": "broll", "file": "aset/broll/paper-cut.mp4", "efek": "paper-cut", "mulai": {"kata": "…"}, "sfx": true }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E13.1 | Durasi elemen ber-`efek: paper-cut` dalam rentang `durasi` (3–5 s). | otomatis |
| E13.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E13.4 | Hasil sesuai elemen visual & tips: Tambahkan tekstur kertas (grain) dan serat halus di atas semua layer untuk kesan autentik. | manual |

## Bukti uji
Belum ada.
