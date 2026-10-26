---
id: G04
nama: kaca-gelap
versi: 0.5
status: draft
tokens: [platform@0.4, kaca-gelap@0.3]
konteks: [zona-aman@0.2, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.2, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.2]
ciri: [kaca berasap, amber, pelan]
teks_di_video: panel
---

# G04 — Gaya: kaca-gelap (Kaca Gelap)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Gelap, elegan, sinematik. Kaca berasap di atas video, aksen amber hangat; tempo pelan.

**Ciri pengenal:** kaca berasap, amber, pelan.

## Tipografi
DM Serif Display + Inter — judul/depth vs isi/caption, maksimal dua keluarga font. Caption tebal + outline/bayangan; satu kata aksen per kalimat.

## Warna
Amber (`aksen`) untuk angka & kata kunci; biru es (`aksen-2`) hanya garis/ikon.

## Gerak
Masuk `fade` 0,55 s, easing ease-out panjang, push-in 1,05 pada momen kunci.

## Elemen khas
Panel kaca gelap opasitas 55%, blur 44, garis putih 14%.

Teks/judul langsung di atas video: `"latar": "panel"` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

## Motif (token `motif`, dipakai otomatis oleh perangkat, panel & generator koreografi)
- Bingkai perangkat: **kaca** — panel kaca berkilau tepi atas, label tab mono (tanpa titik macOS).
- Hiasan kata `*kunci*`: **garis** — garis bawah tergambar.
- Tekstur: **grain** · Transisi: **celup** · Reveal: **kilau**.
- Judul/hook (E31 judul-gaya): masuk **masker** (naik dari balik garis masker), hiasan **none** (tanpa).
- Teks rotoscope (depth, di belakang subjek): **padat** — warna aksen padat.
- Efek khas gaya ini = efek yang mencantumkan `kaca-gelap` di `gaya_cocok` (dipilih lebih dulu oleh slot).

## Larangan
- Warna jenuh selain amber.
- Gerak cepat < 0,3 s.
- Huruf kapital penuh.

## Checklist QA tambahan
| ID | Aturan | Cek |
|---|---|---|
| G04.1 | Tampilan terbaca sebagai Kaca Gelap (kaca berasap, amber, pelan) tanpa melihat nama preset. | manual |
| G04.2 | Tidak ada pelanggaran bagian "Larangan" di atas. | manual |

## Bukti uji
Belum ada.
