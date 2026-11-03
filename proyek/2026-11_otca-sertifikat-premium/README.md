# OTCA — Sertifikat Bahasa, premium

Storyboard revisi 2 disetujui pengguna pada 3 November 2026. Narasi dan CTA
mengikuti CONTOH VIDEO.MOV; PDF Studienkolleg hanya menjadi referensi cara
bercerita. Hasil memakai lima adegan full frame dan empat adegan split.

## Sumber kebenaran

- production-props.json: props persis storyboard revisi 2 yang disetujui.
- manifest.json: persetujuan SHA-256 dan token brand/audio.
- layout-editorial.json, beat-sheet-editorial.json: pembagian visual dan narasi.
- split.json: aset, musik, SFX dan pilihan renderer editorial.
- aset/rekaman/take1.mov: footage sumber; media/cache tidak ikut git.

## Produksi

Jalankan dari root repo dengan `.venv/Scripts/python.exe`:

```text
pipeline/scripts/video.py render proyek/2026-11_otca-sertifikat-premium
pipeline/scripts/video.py qa proyek/2026-11_otca-sertifikat-premium
```

Jalur `semua` juga memilih renderer editorial lalu QA. Jangan memakai split.py
render secara langsung karena komposisinya khusus split. Audio tetap memakai
mix_audio pipeline split, auto-ducking transkrip, dan mastering FFmpeg.

## Runtime lokal

Launcher .venv sebelumnya menunjuk Python WindowsApps yang tidak tersedia.
Interpreter Python 3.10 x64 dipulihkan ke `.venv/base-python/`, dengan paket
lama tetap digunakan. Python global tidak diubah. Jangan menghapus folder
runtime ini saat membersihkan cache. Cache sementara render berada di D:.

## Hasil

Satu MP4 di out/2026-11_otca-sertifikat-premium.mp4. QA media dan audit
editorial di out/qa-report.md, out/qa.json, out/editorial-audit.json.
Contact sheet out/kontak.png berasal dari video final, bukan storyboard.
Checklist HP/headphone tetap memerlukan tinjauan pengguna.
