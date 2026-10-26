---
id: G04
nama: kaca-gelap
versi: 0.3
status: draft
tokens: [platform@0.3, kaca-gelap@0.2]
konteks: [zona-aman@0.1, caption@0.2, parallax-push@0.1, ingest@0.1, gerak@0.1, audio@0.1, ekspor@0.1, sound-design@0.1, koreografi@0.1]
ciri: [kaca berasap, amber, pelan]
teks_di_video: panel
---

# G04 — Gaya: kaca-gelap (Kaca Gelap)

> Isi awal v0.1 — uji di proyek nyata, isi "Bukti uji", lalu naikkan versi.

## Rasa / Mood
Gelap, elegan, sinematik. Kaca berasap di atas video, aksen amber hangat; tempo pelan.

**Ciri pengenal:** kaca berasap, amber, pelan.

## Tipografi
Poppins SemiBold/Regular — geometris tipis, terasa mahal. Hindari Black/ExtraBold.

## Warna
Amber (`aksen`) untuk angka & kata kunci; biru es (`aksen-2`) hanya garis/ikon.

## Gerak
Masuk `fade` 0,55 s, easing ease-out panjang, push-in 1,05 pada momen kunci.

## Elemen khas
Panel kaca gelap opasitas 55%, blur 44, garis putih 14%.

Teks/judul langsung di atas video: `"latar": "panel"` (K01.4).
Tekstur (butir kertas, goresan pensil, grain) belum native — bila perlu, buat sebagai aset `broll`/`gambar`.

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
