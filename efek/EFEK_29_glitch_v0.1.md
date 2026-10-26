---
id: E29
nama: glitch
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
gaya_cocok: [rts-modern, retro-brutalism]
konteks_terkait: [gerak, sound-design]
---

# E29 — Efek: Glitch

**Deskripsi:** Pergeseran kanal RGB, irisan horizontal bergeser, garis pindai — sinyal 'terganggu' singkat.

**Kapan dipakai:** Gaya HUD/teknis, kejutan, koreksi mitos.

## Di pipeline ini (dukungan: native)
Native (render.py, `tipe: transisi`, jenis `glitch`). Default transisi gaya rts-modern & retro-brutalism.

```json
{ "tipe": "transisi", "efek": "glitch", "mulai": {"beat": "problem"} }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E29.4 | Terasa khas gaya, tidak menutupi informasi penting. | manual |

## Bukti uji
Belum ada.
