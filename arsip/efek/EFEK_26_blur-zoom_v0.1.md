---
id: E26
nama: blur-zoom
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
gaya_cocok: []
konteks_terkait: [gerak, sound-design]
---

# E26 — Efek: Transisi blur-zoom

**Deskripsi:** Seluruh frame (video, elemen, caption) membesar sedikit & mengabur lalu kembali tajam, berpusat di titik
potong antarbagian — seperti referensi motion graphics saat pindah langkah.

**Kapan dipakai:** Pergantian bagian/langkah (LANGKAH 1 → 2), sebelum reveal besar. Bukan di setiap beat.

## Di pipeline ini (dukungan: native — render.py)
Elemen `transisi` (bukan remotion): berpusat di `mulai`, durasi/skala/blur dari token `transisi.blur-zoom`.
Bunyi otomatis: whoosh panjang (peta `transisi`).

```json
{ "tipe": "transisi", "efek": "blur-zoom", "jenis": "blur-zoom", "mulai": {"beat": "solution"} }
```
Field: jenis (blur-zoom), durasi, skala, blur (px).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E26.4 | Transisi menandai pergantian bagian, maksimal 1 per bagian; tidak memotong kalimat penting. | manual |

## Bukti uji
Belum ada.
