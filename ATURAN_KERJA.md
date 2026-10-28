# Aturan Kerja — Video System

Aturan tetap dari Zar untuk setiap sesi (Claude Code di laptop maupun sesi cloud).
Ringkasannya ada di `CLAUDE.md`; file ini detailnya. Bila bertentangan dengan permintaan Zar di percakapan, permintaan Zar yang menang.

## 1. Alur edit terkunci (disetujui Zar, 2026-10-28)

1. **Desain (boleh di cloud):** transkripsi, konsep, hook 3 detik, naskah/beat-sheet, lalu **storyboard** — still per adegan + VO, timing, SFX, musik (`video.py storyboard <proyek> --buka`).
2. **Persetujuan storyboard dari Zar.** Tunggu. Revisi beat-sheet = storyboard & persetujuan ulang.
3. **Produksi di laptop:** bangun/port komposisi ke repo ini (modul yang bisa dipakai ulang, bukan kode sekali pakai), buka **Remotion Studio** agar Zar bisa pratinjau.
4. **Render final** setelah Zar setuju pratinjau → `video.py semua <proyek>`.
5. **QA:** `out/qa-report.md` harus **LULUS** (kode K00–K10), tunjukkan `out/kontak.png`.
6. **Commit** ke repo ini. Repo `video-system` adalah sumber kebenaran tunggal: pekerjaan yang hanya ada di cloud harus masuk ke repo.

Larangan: tidak ada render final sebelum storyboard + pratinjau Studio disetujui.

## 2. Ekspor

- Satu file saja per proyek: `proyek/<proyek>/out/<proyek>.mp4`, dipakai untuk Reels/TikTok/Shorts.
- 1080x1920 (9:16), H.264, AAC, tag warna bt709 (K07.2).
- Loudness −14 LUFS terintegrasi, plafon true-peak master −2 dBTP (K06.2, agar lolos setelah encode AAC).

## 3. File sementara

- Semua file sementara (Remotion, Chrome, ffmpeg, tempfile) di `<repo>/.sementara` (D:). Override dengan env `VIDEO_TEMP` — tetap di D:.
- Uji manual & salinan proyek juga di D:, mis. `.sementara\uji`. Jangan memakai C: atau `%TEMP%` (drive C: cepat penuh).
- Hapus cache besar yang tidak dipakai lagi setelah proyek selesai (tanya Zar dulu untuk arsip).

## 4. Git & sesi paralel

- Beberapa sesi bisa mengubah file yang sama bersamaan (mis. proyek lain sedang diedit).
- Stage hanya hunk milik pekerjaan Anda: `git add -p <file>` atau path spesifik. Jangan `git add -A`/`git add .`, `git stash`, `git checkout -- <file>`, atau `git reset --hard`.
- Commit lokal dengan pesan jelas berawalan area (`pipeline:`, `remotion:`, `modul:`, `proyek:`, `docs:`). Push ke `origin master` hanya setelah Zar setuju.

## 5. Klien OTCA (konsultan studi ke Jerman, audiens orang tua)

- Warna: hitam #000 dominan; Solid Gold #CB9D31; Gradient Gold #CB9D31 → #FDF1A4 → #B3822C; putih #FFF.
- Font Montserrat (ExtraBold judul; Bold/SemiBold/Medium isi).
- Pola: garis gradien emas tebal 7, persegi gradien emas; desain tetap dominan hitam.
- Logo 235x72 di atas untuk Reels/Story; varian logo glow untuk pemakaian besar.
- **Split layout talking-head:** separuh atas frame 9:16 (dari tengah ke atas) = motion graphics/ilustrasi yang merepresentasikan apa yang diucapkan talent (ikon/adegan, bukan teks), sinkron ke timestamp kata; talent di separuh bawah.
- Sumber Remotion OTCA versi cloud: `hasil/otca-video-remotion-src.zip` (file proyek). Port menjadi modul repo sebelum dipakai lagi; video OTCA yang sudah jadi tidak di-render ulang.

## 6. Roadmap premium — diterapkan per video

Item 1–3, 6, 8 sudah ada di pipeline. Di setiap edit baru, terapkan:

| # | Item | Praktiknya |
|---|---|---|
| 4 | Bahasa gerak per gaya | Easing, durasi, dan overshoot mengikuti token gaya + K05; jangan campur karakter gerak antar-gaya. |
| 5 | Match cut | Sambung adegan lewat bentuk/posisi/warna yang sama (shape match cut), bukan potong polos. |
| 7 | Hook visual 1–2 detik pertama | Gerakan/visual terkuat di detik pertama, sebelum kalimat pertama selesai. |
| 9 | Review gerak frame-by-frame | Periksa transisi & reveal di Studio per frame sebelum render final (tidak ada pop, kedip, atau tabrakan zona aman). |
| 10 | Modul pustaka adegan | Adegan yang bagus disimpan sebagai modul pakai-ulang (daftar di `INDEX.md`), bukan ditulis ulang tiap video. |

Ide yang sudah disetujui untuk edit berikutnya: musik latar dengan auto-ducking, shape match cut, parallax 2.5D + sapuan cahaya emas pada ikon utama, hook visual lebih kuat di 1 detik pertama, modul adegan pakai-ulang.

Setiap kali menyerahkan hasil, akhiri dengan daftar singkat ide upgrade ("jangan pernah merasa puas").
