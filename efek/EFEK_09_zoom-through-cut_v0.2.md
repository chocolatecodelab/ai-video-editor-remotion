---
id: E09
nama: zoom-through-cut
versi: 0.2
status: draft
durasi: [0.6, 1.2]
stagger: null
dukungan: native
gaya_cocok: [bold-kinetic, arang-lime]
konteks_terkait: [parallax-push, audio]
alias: [zoom through, zoom tembus]
---

# E09 — Efek: Zoom Through Cut

**Deskripsi:** Transisi di mana kamera zoom menembus objek/lubang/layar dan langsung menjadi adegan berikutnya.

**Kapan dipakai:** Transisi antar bagian video yang mulus dan energik.

## Elemen visual
- Objek "portal" (layar, jendela, lubang, huruf O)
- Motion blur radial saat menembus
- Adegan kedua sudah siap di balik portal

## Timing
0.6 - 1.2 detik; akselerasi cepat, hard cut tersembunyi di puncak blur.

## Prompt
> Camera rapidly zooming through a [objek portal], radial motion blur, seamless match cut into the next scene, high energy.

## Tips
Sembunyikan cut tepat saat layar penuh blur/putih; sinkronkan dengan beat atau whoosh.

## Di pipeline ini (dukungan: native)
Native (render.py, `tipe: transisi`, jenis `zoom-tembus`): zoom masuk menembus titik tengah + blur, potong, keluar dari skala besar. Transisi default gaya bold-kinetic (motif.transisi).

```json
{ "tipe": "transisi", "efek": "zoom-through-cut", "mulai": {"beat": "solution"} }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E09.1 | Durasi elemen ber-`efek: zoom-through-cut` dalam rentang `durasi` (0.6–1.2 s). | otomatis |
| E09.4 | Hasil sesuai elemen visual & tips: Sembunyikan cut tepat saat layar penuh blur/putih; sinkronkan dengan beat atau whoosh. | manual |

## Bukti uji
Belum ada.
