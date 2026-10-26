---
id: K00
nama: zona-aman
versi: 0.2
status: draft
bergantung_pada: [tokens/TOKEN_00_platform]
---

# K00 — Zona Aman

## Tujuan
Teks dan grafis penting tidak boleh tertutup UI aplikasi (status bar, tab, username, caption bawaan, tombol like/komen/share) di Reels, TikTok, dan Shorts.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K00.1 | Kotak pembatas setiap elemen teks/grafis berada di dalam zona aman pada setiap frame saat ia tampil, termasuk saat animasi masuk/keluar selesai. | otomatis |
| K00.2 | Dua elemen teks tidak tumpang tindih pada waktu yang sama (kecuali caption di atas teks depth). | otomatis |
| K00.3 | Elemen informasi tidak menutupi wajah: kotak teks elemen menutup ≤ `koreografi.tutup-wajah-maks` (10 %) kotak wajah selama elemen tampil (cache/wajah.json, `video.py wajah`; hiasan dekoratif hanya peringatan). | otomatis |
| K00.4 | Wajah subjek (mata) berada di sepertiga atas area aman. | manual |

## Parameter
- `zona-aman.atas` (±250 px), `zona-aman.bawah` (±400 px), `zona-aman.kiri`, `zona-aman.kanan` — px pada `format.resolusi-referensi`, diskalakan otomatis untuk resolusi lain.
- Area aman = `[kiri, atas]` sampai `[lebar − kanan, tinggi − bawah]`.

Laporan angka per elemen (luas layar, % wajah tertutup) + kontak-sheet: `out/laporan-perangkat.md`, `out/kontak.png` (`video.py laporan`, otomatis setelah QA). `video.py pasang` memindah posisi atas/tengah yang diperkirakan menutupi wajah sebelum render.

## Contoh
Caption diletakkan dengan tepi bawah tepat di `tinggi − zona-aman.bawah` (y = 1520 px pada 1080×1920).

## Anti-contoh
CTA "Follow!" di y = 1750 → tertutup nama akun & deskripsi.

## Bukti uji
Belum ada.
