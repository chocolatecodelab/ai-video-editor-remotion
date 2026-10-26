# Catatan & Retrospeksi

## Keputusan khusus proyek ini
- Sumber = WhatsApp Video 478×850 (di-ingest `--paksa`, upscale ke 1080×1920). **Pengguna menerima K04.1 GAGAL** (2026-10-24)
  dan meminta hasil tetap diserahkan dari file ini.
- Bahasa ucapan Inggris → `transkrip.bahasa = "en"` (preset default "id" menerjemahkan ke Melayu).
- Rough cut: 3 jeda panjang dibuang → 53,9 s → 46,45 s (`aset.potong`), agar masuk template tips 30–45 s (±3).
- Wajah mengisi y≈450–1250 px → semua teks di pita atas, solusi = 3 teks bergantian (bukan kartu checklist preset).
- Caption dimatikan pada "we cannot change the past" (kecepatan baca > 17 kar/s; teks sama tampil sebagai judul)
  dan di akhir (bertumpuk dengan CTA).

## Kandidat promosi (muncul juga di proyek lain?)
- [ ] Preset/brief: field bahasa ucapan dipilih saat `baru` (bukan default "id").
- [ ] Tata letak "wajah besar di tengah" (pita atas + caption bawah) → varian preset glass-tech.

## Masalah pipeline
- K06.2: master −1,0 dBTP → AAC ekspor −0,9 dBTP. Diperbaiki di scripts@0.2 (MARGIN_TP_LOSSY 0,5 dB di render).
- `video.py semua` mengulang ingest tanpa `--paksa` → gagal untuk sumber < 1080; jalankan render/ekspor/qa terpisah.
- Transkrip ±41–44 s: "that we never are to control" — kemungkinan "what we were never meant to"; belum dikoreksi pengguna (K01.2).
