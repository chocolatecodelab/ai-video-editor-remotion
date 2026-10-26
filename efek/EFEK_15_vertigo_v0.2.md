---
id: E15
nama: vertigo
versi: 0.2
status: draft
durasi: [2, 4]
stagger: null
dukungan: native
gaya_cocok: [bold-kinetic, rts-modern, kaca-gelap, retro-brutalism, glass-tech]
konteks_terkait: [zona-aman, audio]
alias: [dolly zoom, dolly-zoom]
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

## Di pipeline ini (dukungan: native)
Native (render.py, `tipe: kamera`): dolly-zoom — latar membesar (kamera.vertigo.skala-latar) sementara subjek (mask roto) tetap → ruang terasa 'tertarik'. Butuh roto.

```json
{ "tipe": "kamera", "efek": "vertigo", "fungsi": "masalah", "mulai": {"kata": "…"}, "durasi": 3 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E15.1 | Durasi elemen ber-`efek: vertigo` dalam rentang `durasi` (2–4 s). | otomatis |
| E15.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E15.4 | Hasil sesuai elemen visual & tips: Latar dengan garis perspektif jelas (lorong, tangga) membuat efek jauh lebih terlihat. | manual |

## Bukti uji
Belum ada.
