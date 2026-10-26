---
id: K01
nama: caption
versi: 0.1
status: draft
bergantung_pada: [K00]
---

# K01 — Caption & Keterbacaan

## Tujuan
Caption terbaca dalam sekali lirik, sinkron dengan ucapan per kata, dan tidak menutupi area penting.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K01.1 | Timing caption berasal dari transkrip ber-timestamp per kata (`cache/words.json`, WhisperX / forced alignment), bukan perkiraan. | otomatis |
| K01.2 | `words.json` sudah dikoreksi manual (`"dikoreksi": true`): ejaan, nama, istilah. | otomatis (peringatan) |
| K01.3 | Satu potongan caption ≤ `caption.baris-maks` baris dan ≤ `caption.karakter-maks-baris` karakter per baris. | otomatis |
| K01.4 | Kontras setiap teks (caption, judul, kartu, CTA) terhadap latar efektifnya (panel, stroke, atau video di belakangnya, persentil terburuk) ≥ `qa.kontras-min` (≥ `qa.kontras-min-besar` untuk teks ≥ `qa.ukuran-besar-px`). Teks depth dikecualikan. | otomatis |
| K01.5 | Setiap potongan tampil ≥ 0,3 detik; kecepatan baca ≤ `qa.karakter-per-detik-maks`. | otomatis |
| K01.6 | Kata yang sedang diucapkan disorot dengan `caption.warna-aktif`. | otomatis (render) |
| K01.7 | Caption tidak dipecah di tengah frasa nama/angka (mis. "Rp 5 juta"). | manual |
| K01.8 | Ukuran font setiap teks ≥ `qa.ukuran-min-px`. | otomatis |

## Parameter
`ukuran.caption`, `font.caption`, `caption.*`, `qa.kontras-min`, `qa.karakter-per-detik-maks`, `zona-aman.bawah`.

## Contoh
Potongan baru dimulai saat jeda antar kata > `caption.jeda-pecah` atau jumlah kata mencapai `caption.kata-maks`.

## Anti-contoh
Satu kalimat penuh 2 baris × 30 karakter dalam 1,2 detik (25 cps).

## Bukti uji
Belum ada.
