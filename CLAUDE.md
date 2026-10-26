# video-system

Selalu baca `INDEX.md` dulu. Kalau pengguna menyebut nama pendek (gaya, template, konteks K00–K07), cari file-nya di INDEX.
Untuk pekerjaan video, ikuti `pipeline/skill/SKILL.md` (skill video-editor) — termasuk kewajiban QA LULUS sebelum menyerahkan hasil.
Jalankan pipeline dengan `.venv\Scripts\python` — jangan pip install ke Python global (merusak TensorFlow pengguna).
Remotion ada di `remotion/` (npm lokal, jangan install global); lihat remotion/README.md.
Sebelum menulis/mengubah TSX di `remotion/`, pakai skill `remotion-best-practices` (resmi Remotion, `.claude/skills/`) bersama aturan proyek: token gaya (`motif`), K05 gerak, K09 koreografi. Bila bertentangan, kontrak proyek (`src/lib/kontrak.ts`, render ber-alpha dari pipeline) yang menang.
Validasi struktur setelah mengubah modul: `.venv\Scripts\python pipeline/scripts/video.py cek`.
Setelah mengubah skrip pipeline: `.venv\Scripts\python -m unittest discover -s pipeline/tests` + `.venv\Scripts\python -m ruff check pipeline` (dan `npm run cek-tipe` + `npm run lint` di remotion/ bila mengubah TSX).
