---
id: E15
nama: vertigo
versi: 0.1
status: draft
durasi: [2, 4]
stagger: null
dukungan: eksternal
gaya_cocok: [bold-kinetic]
konteks_terkait: [zona-aman, audio]
---

# E15 — Efek: Vertigo

**Deskripsi:** Efek dolly zoom (Hitchcock): kamera maju sambil zoom out (atau sebaliknya) sehingga latar terdistorsi sementara subjek tetap.

**Kapan dipakai:** Momen shock, realisasi, ketegangan, atau perasaan pusing/tidak nyaman.

## Elemen visual
- Subjek ukuran konstan di tengah
- Perspektif latar yang meregang/menyempit
- Musik atau drone suara yang naik

## Timing
2 - 4 detik; perubahan perlahan lalu intens.

## Prompt
> Dolly zoom vertigo effect on a subject, the background stretching and warping while the subject stays the same size, tense atmosphere, cinematic lighting.

## Tips
Latar dengan garis perspektif jelas (lorong, tangga) membuat efek jauh lebih terlihat.

## Di pipeline ini (dukungan: eksternal)
Butuh rekaman dolly sungguhan atau efek di After Effects.

Buat klip di After Effects / AI video generator (pakai **Prompt** di atas), ekspor 1080×1920, fps proyek, bt709 → `aset/broll/vertigo.mp4`.

```json
{ "tipe": "broll", "file": "aset/broll/vertigo.mp4", "efek": "vertigo", "mulai": {"kata": "…"}, "sfx": true }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E15.1 | Durasi elemen ber-`efek: vertigo` dalam rentang `durasi` (2–4 s). | otomatis |
| E15.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E15.4 | Hasil sesuai elemen visual & tips: Latar dengan garis perspektif jelas (lorong, tangga) membuat efek jauh lebih terlihat. | manual |

## Bukti uji
Belum ada.
