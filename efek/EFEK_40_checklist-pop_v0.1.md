---
id: E40
nama: checklist-pop
versi: 0.1
status: draft
durasi: null
stagger: [0.4, 0.9]
dukungan: native
remotion: Checklist
gaya_cocok: [paper-motion, doodle-art, kolase-kertas, bold-kinetic, arang-lime, coffee-lofi, sketch-art]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [checklist pop]
slot: [ringkasan, langkah, hasil]
props: {pop: true}
---

# E40 — Efek: Checklist Pop

**Deskripsi:** Checklist yang lebih berenergi: tiap item memantul masuk (spring + sedikit rotasi), kotak centang terisi penuh warna aksen, percikan kecil saat tercentang.

**Kapan dipakai:** Ringkasan/tips untuk gaya playful; hindari pada gaya tenang (pakai checklist biasa).

## Di pipeline ini (dukungan: native)
Composition `Checklist` dengan `pop: true` (bawaan dari frontmatter `props` modul ini).

```json
{ "tipe": "remotion", "efek": "checklist-pop", "judul": "Ringkasnya", "item": ["Hook *3 detik*", "Audio jernih", "Ekspor rapi"], "stagger": 0.55, "posisi": "bawah", "durasi": 4 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E40.3 | Stagger antar item dalam rentang `stagger`. | otomatis |
| E40.4 | Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca. | manual |

## Bukti uji
Belum ada.
