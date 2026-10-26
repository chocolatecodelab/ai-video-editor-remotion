---
id: G03
nama: apple-glass
versi: 0.4
status: draft
tokens: [platform@0.4, apple-glass@0.3]
konteks: [zona-aman@0.2, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.2]
ciri: [kaca terang, biru sistem, halus]
teks_di_video: panel
---

# G03 — Gaya: apple-glass (Apple Glass)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Terang, bersih, premium. Panel kaca putih buram ala antarmuka Apple; gerak halus tanpa kejutan.

**Ciri pengenal:** kaca terang, biru sistem, halus.

## Tipografi
Inter (satu keluarga, gaya sistem) — judul/depth vs isi/caption, maksimal dua keluarga font. Caption tebal + outline/bayangan; satu kata aksen per kalimat.

## Warna
Biru sistem (`aksen`) hanya untuk 1 kata kunci; ungu (`aksen-2`) untuk ikon/garis. Selebihnya hitam-abu.

## Gerak
Masuk `naik` 40 px, easing ease-in-out Apple, push-in sangat tipis (1,04).

## Elemen khas
Panel kaca putih radius 44, blur 36, garis putih 70%, bayangan lembut jauh.

Teks/judul langsung di atas video: `"latar": "panel"` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Motif (token `motif`, dipakai otomatis oleh perangkat, panel & generator koreografi)
- Bingkai perangkat: **jendela** — jendela macOS (3 titik), kaca terang.
- Hiasan kata `*kunci*`: **kilau** — kilau cahaya melintas.
- Tekstur: **tanpa** · Transisi: **blur-zoom** · Reveal: **kilau**.
- Judul/hook (E31 judul-gaya): masuk **masker** (naik dari balik garis masker), hiasan **gradien** (warna mengalir di kata aksen).
- Teks rotoscope (depth, di belakang subjek): **gradien** — gradien warna aksen.
- Efek khas gaya ini = efek yang mencantumkan `apple-glass` di `gaya_cocok` (dipilih lebih dulu oleh slot).

## Larangan
- Stroke tebal atau warna neon.
- Lebih dari 1 kata beraksen per layar.
- Gerak pop/bounce.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G03.1 | Tampilan terbaca sebagai Apple Glass (kaca terang, biru sistem, halus) tanpa melihat nama preset. | manual |
| G03.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
