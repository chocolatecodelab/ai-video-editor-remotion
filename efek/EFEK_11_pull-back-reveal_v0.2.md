---
id: E11
nama: pull-back-reveal
versi: 0.2
status: draft
durasi: [3, 5]
stagger: null
dukungan: native
gaya_cocok: [glass-tech, apple-glass, minimalism, kaca-gelap, kertas-tipografi, coffee-lofi]
konteks_terkait: [zona-aman]
alias: [pull back reveal]
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

## Di pipeline ini (dukungan: native)
Native (render.py, `tipe: kamera`): mulai penuh, kamera mundur — rekaman mengecil jadi kartu bersudut bulat bergaris aksen di atas latar gaya (konteks terungkap).

```json
{ "tipe": "kamera", "efek": "pull-back-reveal", "fungsi": "konteks", "mulai": 20.0, "selesai": 24.0 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E11.1 | Durasi elemen ber-`efek: pull-back-reveal` dalam rentang `durasi` (3–5 s). | otomatis |
| E11.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E11.4 | Hasil sesuai elemen visual & tips: Pilih detail awal yang membuat orang bertanya "ini apa?" supaya reveal berdampak. | manual |

## Bukti uji
Belum ada.
