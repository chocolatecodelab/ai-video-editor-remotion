---
id: E47
nama: layer-explosion
versi: 0.1
status: draft
durasi: [3, 6]
stagger: null
dukungan: native
remotion: LayerExplosion
gaya_cocok: [glass-tech, apple-glass, arang-lime, rts-modern, bold-kinetic]
konteks_terkait: [zona-aman, gerak, sound-design, depth-typography]
alias: [layer explosion, ledakan layer, rotoscope 3d deconstruction, stack deconstruction]
slot: [solusi, demonstrasi, konteks, hasil]
---

# E47 — Efek: Layer Explosion (Dekonstruksi Layer 3D Rotoscope)

**Deskripsi:** Dekonstruksi tumpukan visual rotoscope dalam perspektif 3D isometrik: 4 bidang transparan melayang di sumbu Z yang saling merekah keluar (spring physics), memperlihatkan anatomi layering video:
1. `❶ Latar Plate`: Footage latar belakang video asli dengan grid cetak biru teknis.
2. `❷ Teks Depth`: Tipografi tebal yang terselip di balik subjek dengan pendaran neon.
3. `❸ Subjek Roto`: Siluet matte subjek bergaris kontur neon dengan titik jangkar vektor (bézier control anchors).
4. `❹ Caption / UI`: Lapisan teks terdepan (speech subtitle pill) dengan visualisator gelombang audio.
Dilengkapi garis proyeksi sudut putus-putus, bidikan crosshair HUD di 4 sudut bidang, dan badge pil bercahaya untuk tiap layer.

**Kapan dipakai:** Menjelaskan cara kerja depth typography, mengedukasi teknik rotoscoping, membedah alur produksi video pendek, demonstrasi "rahasia di balik layar" (behind-the-scenes), transisi b-roll penjelas konsep teknis.

## Di pipeline ini (dukungan: native)
Klip cutaway Remotion `LayerExplosion` → broll otomatis layar penuh dengan latar dinamis gaya aktif.

```json
{
  "tipe": "remotion",
  "efek": "layer-explosion",
  "judul": "DEKONSTRUKSI *LAYER*",
  "sub": "Struktur kedalaman rotoscope 3D",
  "teks_layer": "ROTOSCOPE",
  "caption_layer": "Memisahkan *subjek* dari latar belakang",
  "durasi": 4.5
}
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E47.1 | Durasi elemen ber-`efek: layer-explosion` dalam rentang `durasi` (3–6 detik). | otomatis |
| E47.2 | Bidang layer merekah secara organik (spring physics) tanpa jitter; teks di layer tengah tetap terbaca jelas. | manual |
| E47.3 | Warna pendaran dan aksen mengikuti token gaya proyek yang aktif (`w.aksen`, `w.aksen2`, `w.utama`). | otomatis |
| E47.4 | SFX merekah (`ui-dolly`) dan pop badge tiap layer sinkron dengan pergerakan frame visual. | otomatis |

## Bukti uji
- Uji render still composition: `remotion still LayerExplosion --frame 45` berhasil tanpa galat.
- Analisis referensi: `referensi/rotoscope-ref/` (0:08–0:13).
