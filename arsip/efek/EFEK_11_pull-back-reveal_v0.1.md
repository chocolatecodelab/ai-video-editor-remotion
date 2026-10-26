---
id: E11
nama: pull-back-reveal
versi: 0.1
status: draft
durasi: [3, 5]
stagger: null
dukungan: eksternal
gaya_cocok: [glass-tech, bold-kinetic]
konteks_terkait: [zona-aman]
---

# E11 — Efek: Pull Back Reveal

**Deskripsi:** Kamera mulai dari detail dekat lalu mundur perlahan untuk mengungkap gambaran besar atau konteks yang mengejutkan.

**Kapan dipakai:** Plot twist visual, menunjukkan skala, hook yang membuat penasaran.

## Elemen visual
- Detail close-up yang ambigu di awal
- Reveal skala besar (ruangan, kota, layar, jumlah massa)
- Ease-out agar reveal terasa dramatis

## Timing
3 - 5 detik; tahan 0.5 detik di akhir agar penonton mencerna.

## Prompt
> Start on an extreme close-up of a detail, then smoothly pull the camera back to reveal the full surprising scene, slow cinematic motion, deep depth of field.

## Tips
Pilih detail awal yang membuat orang bertanya "ini apa?" supaya reveal berdampak.

## Di pipeline ini (dukungan: eksternal)
Buat klip di After Effects / AI video generator (pakai **Prompt** di atas), ekspor 1080×1920, fps proyek, bt709 → `aset/broll/pull-back-reveal.mp4`.

```json
{ "tipe": "broll", "file": "aset/broll/pull-back-reveal.mp4", "efek": "pull-back-reveal", "mulai": {"kata": "…"}, "sfx": true }
```

Kandidat native: `push` terbalik (mulai dari skala > 1 lalu kembali ke 1).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E11.1 | Durasi elemen ber-`efek: pull-back-reveal` dalam rentang `durasi` (3–5 s). | otomatis |
| E11.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E11.4 | Hasil sesuai elemen visual & tips: Pilih detail awal yang membuat orang bertanya "ini apa?" supaya reveal berdampak. | manual |

## Bukti uji
Belum ada.
