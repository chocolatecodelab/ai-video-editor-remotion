---
id: E09
nama: zoom-through-cut
versi: 0.1
status: draft
durasi: [0.6, 1.2]
stagger: null
dukungan: sebagian
gaya_cocok: [bold-kinetic]
konteks_terkait: [parallax-push, audio]
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

## Di pipeline ini (dukungan: sebagian)
Sebagian native: `push` cepat (`gerak` 0,6–1,2 s, `easing: "tegas"`) yang berakhir tepat di batas beat (cut) + `sfx: "whoosh"`.
Belum native: motion blur radial & skala > 1,15 (dibatasi K03.1) — untuk efek 'menembus' penuh buat eksternal.

```json
{ "tipe": "push", "efek": "zoom-through-cut", "mulai": {"beat": "problem", "ujung": "selesai", "offset": -0.8}, "selesai": {"beat": "problem", "ujung": "selesai"}, "gerak": 0.8, "easing": "tegas", "sfx": "whoosh" }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E09.1 | Durasi elemen ber-`efek: zoom-through-cut` dalam rentang `durasi` (0.6–1.2 s). | otomatis |
| E09.4 | Hasil sesuai elemen visual & tips: Sembunyikan cut tepat saat layar penuh blur/putih; sinkronkan dengan beat atau whoosh. | manual |

## Bukti uji
Belum ada.
