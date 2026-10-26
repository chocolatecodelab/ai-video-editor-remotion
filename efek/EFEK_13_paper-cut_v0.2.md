---
id: E13
nama: paper-cut
versi: 0.2
status: draft
durasi: [3, 5]
stagger: null
dukungan: native
remotion: PaperCut
gaya_cocok: [paper-motion, kolase-kertas, kertas-tipografi, coffee-lofi, doodle-art]
konteks_terkait: [zona-aman]
alias: [paper cut, kertas potong]
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

## Di pipeline ini (dukungan: native)
Native: (1) klip cutaway Remotion `PaperCut` — bukit kertas potong berlapis naik ber-parallax, gerak dipatah 12 fps, kartu judul menempel → broll otomatis; (2) transisi `kertas` (komposisi `Sapuan`): tiga lembar kertas menutup layar.

```json
{ "tipe": "remotion", "efek": "paper-cut", "judul": "Cerita *dimulai*", "mulai": 2.0, "selesai": 6.0 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E13.1 | Durasi elemen ber-`efek: paper-cut` dalam rentang `durasi` (3–5 s). | otomatis |
| E13.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E13.4 | Hasil sesuai elemen visual & tips: Tambahkan tekstur kertas (grain) dan serat halus di atas semua layer untuk kesan autentik. | manual |

## Bukti uji
Belum ada.
