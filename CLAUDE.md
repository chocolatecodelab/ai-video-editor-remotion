# video-system

Selalu baca `INDEX.md` dulu. Kalau pengguna menyebut nama pendek (gaya, template, konteks K00–K07), cari file-nya di INDEX.
Untuk pekerjaan video, ikuti `pipeline/skill/SKILL.md` (skill video-editor) — termasuk kewajiban QA LULUS sebelum menyerahkan hasil.
Jalankan pipeline dengan `.venv\Scripts\python` — jangan pip install ke Python global (merusak TensorFlow pengguna).
Remotion ada di `remotion/` (npm lokal, jangan install global); lihat remotion/README.md.
Sebelum menulis/mengubah TSX di `remotion/`, pakai skill `remotion-best-practices` (resmi Remotion, `.claude/skills/`) bersama aturan proyek: token gaya (`motif`), K05 gerak, K09 koreografi. Bila bertentangan, kontrak proyek (`src/lib/kontrak.ts`, render ber-alpha dari pipeline) yang menang.
Validasi struktur setelah mengubah modul: `.venv\Scripts\python pipeline/scripts/video.py cek`.
Setelah mengubah skrip pipeline: `.venv\Scripts\python -m unittest discover -s pipeline/tests` + `.venv\Scripts\python -m ruff check pipeline` (dan `npm run cek-tipe` + `npm run lint` di remotion/ bila mengubah TSX).

## Aturan kerja Zar (wajib, detail di `ATURAN_KERJA.md`)

- **Alur terkunci tiap edit video:** konsep + storyboard (still per adegan + VO/timing/SFX) → **persetujuan Zar** → pratinjau Remotion Studio → Zar setuju → render final → QA LULUS → commit. **Jangan pernah render final sebelum storyboard disetujui.**
- **Ekspor:** hanya SATU file per proyek, `proyek/<proyek>/out/<proyek>.mp4` — 1080x1920, H.264, −14 LUFS, plafon master −2 dBTP.
- **File sementara hanya di D:** `.sementara/` di repo (override env `VIDEO_TEMP`), termasuk uji manual (`.sementara\uji`). Jangan pernah ke C:/`%TEMP%`.
- **Commit hanya hunk milik pekerjaan ini** (`git add -p` / path spesifik). Sesi lain mengubah file yang sama secara paralel; jangan `git add -A`, stash, checkout, atau reset perubahan orang lain. Push hanya setelah Zar setuju.
- **Klien OTCA:** pakai brand OTCA (hitam dominan, emas #CB9D31, Montserrat) + split layout: separuh atas = motion graphics yang merepresentasikan ucapan talent (bukan teks), talent di separuh bawah.
- **Roadmap premium per video:** terapkan item 4, 5, 7, 9, 10 (lihat `ATURAN_KERJA.md`) dan akhiri tiap penyerahan dengan daftar singkat ide upgrade.
