# Catatan — 2026-10_otca-sertifikat-jerman

- Sumber: `D:/KERJAAN/OTCA/CONTOH VIDEO.MOV` (4K portrait, 58,7 s) → `aset/rekaman/take1.mov`.
- Brand OTCA (`D:/KERJAAN/OTCA/Brand Guidelines OTCA New.pdf`) diterapkan HANYA lewat `manifest.token_override`
  (hitam/emas/putih, gradien emas untuk depth, Montserrat, highlight pil emas, margin kiri 108 px). Modul lain tidak diubah.
- Brief: `D:/KERJAAN/OTCA/MOTION_GRAPHIC.md`. Belum didukung pipeline: transisi "3D exploded layer" isometrik 4 lapis.
- Logo: diekstrak dari halaman 3 PDF (versi tanpa glow), latar hitam → transparan → `aset/grafis/logo-otca.png`.
  Ganti dengan PNG resmi bila ada (nama file sama).
- Gaya dasar glass-tech (kertas-tipografi dibatalkan: bertentangan dengan brand & preset tak bisa dirakit). Template explainer
  (video utuh 58,7 s) dengan alur mitos→fakta dari koreografi mitos-fakta seed 1 (`beat-sheet.preset.json`).
- Mask: MediaPipe dipertajam `skrip/bersihkan_mask.py` (halo kanan kepala) → roto backend `eksternal`; asli di cache/masks_mediapipe.
- Transkrip: 2 salah dengar dibetulkan (dibutuhkan, berangkat); `dikoreksi` menunggu cek pengguna.
- Revisi storyboard: cutaway kaca dihapus (menutupi pembicara ±31 s) → perangkat di pita atas; + depth "KULIAH";
  checklist tanpa judul (K00.3 wajah tertutup 23 % → lolos); caption maks 2 kata (Montserrat lebih lebar, K01.3).
- Revisi 1 (setelah render 1): vertigo 20–23 s → pull-back-reveal (vertigo menampilkan subjek ganda: latar yang
  diperbesar masih memuat orangnya, tanpa clean plate). Mask: + erosi 9 px & guided filter berpanduan frame
  (tepi depth bergerigi/ber-pita batu karena mask MediaPipe 256 px).
