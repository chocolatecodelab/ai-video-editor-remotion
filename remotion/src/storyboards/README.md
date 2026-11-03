# EditorialReview — v0.1

Komposisi campuran split talking-head dan cutaway motion graphics layar penuh.
Memakai ulang PUSTAKA adegan; teks, timing, pusat ilustrasi, skala, dan mode dari
`editorial` pada props. Pada mode full, talent tidak dirender dan suara tetap
ditangani pipeline audio.

Sumber props produksi harus memiliki persetujuan SHA-256 di manifest. Ini
mencegah render revisi layout yang belum disetujui. Entry composition dipilih
melalui split.json: `editorial_entry`, `editorial_composition`, `editorial_props`.
Pintu produksi tetap `video.py render|qa|semua <folder-proyek>`.

Contoh teruji: proyek/2026-11_otca-sertifikat-premium/production-props.json.
Font Montserrat dimuat melalui kontrak font yang sama dengan SplitReel.

QA menambahkan bukti dari video final, bukan gambar storyboard: sembilan sampel
adegan dan frame sebelum/saat/setelah delapan cut, serta contact sheet final.
Review HP/headphone dan pemeriksaan visual manusia tetap dicatat terpisah.
