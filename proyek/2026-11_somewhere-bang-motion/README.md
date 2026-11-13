# Somewhere — Tribute to my grandpa

English VO sumber, subtitle English–Indonesia, gambar kenangan pengguna, brand NazarVerse.

Persetujuan: arah “Jalankan, tribut to my grandpa”; storyboard bilingual dan render “ya jalankan”, 13 November 2026. Bukti persetujuan dan hash beat-sheet ada di manifest.json.

## Berkas utama

- `out/2026-11_somewhere-bang-motion.mp4`: satu MP4 final.
- `out/qa-report.md`, `out/qa.json`: hasil pemeriksaan dan batas verifikasi.
- `out/kontak-final.jpg`: frame dari MP4 yang telah di-encode.
- `komposisi/index.html`: komposisi bang-motion, dibuka langsung; `?debug=1` untuk scrub.
- `manifest.json`, `beat-sheet.json`, `subtitles.json`, `transcript-source.json`: spesifikasi, timing dan isi.
- `naskah-storyboard.md`: English–Indonesia per frasa.

Source footage ada di aset/SOMEWHERE.mp4. Gambar pengguna dan audio komposisi ada di komposisi/assets/. Media pribadi serta hasil tidak dimasukkan commit kode; tetap tersimpan lokal. Jangan menghapus folder proyek ketika membersihkan cache umum.

## Implementasi

Bang Motion v1.19.0, commit c1aa65e921c970d858705fcb4a53a8294d1a4131, dari https://github.com/bangtutorial/bang-motion (MIT). Rig continuous-world, kamera, determinisme, kontrol audio dan kontrak OPENER mengikuti starter-explainer. Ilustrasi khusus memakai SVG/CSS/GSAP; gambar pribadi tetap gambar kenangan, tanpa rig wajah/tubuh.

GSAP 3.12.5 disimpan lokal, header lisensi dipertahankan. Inter berasal dari pipeline/fonts; Cormorant Garamond dari Google Fonts (OFL disertakan). Palet dan keluarga font mengikuti panduan/NAZARVERSE_BRAND.md v1.0.

`build_storyboard.py` membangun HTML dan storyboard. `capture_storyboard.cjs` mengambil still saja. `render_final.cjs` menolak render tanpa persetujuan/hash beat-sheet yang cocok dan menolak menimpa MP4 yang sudah ada. Frame dialirkan ke FFmpeg; tidak ada render visual kedua atau MP4 antara. Semua temp di .sementara/somewhere-final pada drive D:.

`qa_final.py` memeriksa hasil encode, mengukur audio, dan mengekstrak frame. Tidak menganggap pemeriksaan teknis/still sebagai pemeriksaan dengar atau keluwesan playback. Checklist manual di qa-report.md tetap untuk pengguna.
