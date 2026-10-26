---
id: E04
nama: frame-break
versi: 0.2
status: draft
durasi: [1.5, 3]
stagger: null
dukungan: native
gaya_cocok: [bold-kinetic, retro-brutalism, kolase-kertas, arang-lime, paper-motion, sketch-art, glass-tech]
konteks_terkait: [zona-aman, depth-typography]
alias: [frame break]
---

# E04 — Efek: Frame Break

**Deskripsi:** Subjek atau elemen "keluar" dari batas frame/bingkai, memecah batas antara layar dan dunia di luarnya.

**Kapan dipakai:** Momen klimaks, penekanan, hook di awal video, atau transisi yang mengejutkan.

## Elemen visual
- Bingkai (frame foto/layar/kotak) berisi adegan
- Objek yang melewati tepi bingkai ke area luar (efek 3D pop-out)
- Bayangan dan masking agar ilusi kuat

## Timing
1.5 - 3 detik; objek keluar dengan ease-out + sedikit overshoot.

## Prompt
> A subject bursting out of a rectangular frame, breaking the border with a pop-out 3D effect, dynamic shadow, slight camera shake, bold contrasting background.

## Tips
Pisahkan subjek ke layer sendiri, duplikasi bingkai di atas subjek (masking) untuk ilusi tembus.

## Di pipeline ini (dukungan: native)
Native (render.py, `tipe: kamera`): rekaman mengecil ke dalam bingkai di atas latar gaya, lalu **subjek (mask roto) digambar di atas tepi bingkai** → menembus keluar. Butuh roto (otomatis dari `butuh_mask`).

```json
{ "tipe": "kamera", "efek": "frame-break", "fungsi": "reveal", "mulai": {"kata": "…"}, "durasi": 2.5 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E04.1 | Durasi elemen ber-`efek: frame-break` dalam rentang `durasi` (1.5–3 s). | otomatis |
| E04.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E04.4 | Hasil sesuai elemen visual & tips: Pisahkan subjek ke layer sendiri, duplikasi bingkai di atas subjek (masking) untuk ilusi tembus. | manual |

## Bukti uji
Belum ada.
