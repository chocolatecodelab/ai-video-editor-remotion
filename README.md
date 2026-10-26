# Video System

Sistem modular untuk produksi video pendek vertikal (Reels/TikTok/Shorts) yang bisa diotomatisasi dan direproduksi.
Arsitektur hibrid: **Python** (ingest, transkrip, rotoscope, timing, komposit, audio, ekspor, QA) + **Remotion**
(motion graphics React). Semua nilai visual berasal dari token, semua timing dan teks berasal dari beat-sheet — tidak ada yang ditulis di kode.

| Folder | Isi | Format |
|---|---|---|
| tokens/ | nilai mentah: platform (zona aman, loudness, ekspor, ambang QA) + per gaya (warna, font, easing, motif) | JSON |
| konteks/ | aturan teknis universal (K00–K09), tiap aturan ber-ID dan bertanda otomatis/manual | MD |
| gaya/ | identitas visual = tokens + daftar konteks (14 gaya; contoh visual di gaya/katalog/) | MD |
| template/ | struktur cerita, beat wajib, rentang durasi | MD |
| efek/ | pustaka motion per beat (E01–E36): resep, timing, aturan QA | MD |
| koreografi/ | urutan perangkat per fungsi isi (mitos-fakta, tutorial-langkah, …), ber-slot | JSON |
| preset/ | resep siap pilih = gaya × koreografi (+ pratinjau di preset/pratinjau/) | JSON |
| pipeline/ | skill/SKILL.md (pintu masuk agen), scripts/ (otomasi), tests/ | MD + PY |
| remotion/ | mesin render motion graphics berbasis React, membaca tokens/ yang sama | TSX |
| proyek/ | satu folder per video: manifest.json, beat-sheet.json, aset, cache, out | JSON + media |
| referensi/ | analisis video contoh (`video.py referensi`) | MD + JSON |
| arsip/ | versi modul lama + CHANGELOG.md | — |
| INDEX.md | buku acuan nama pendek → file, versi, status | MD |

## Persiapan (sekali)
```
python -m venv .venv
.venv\Scripts\python -m pip install -r pipeline/requirements.lock   # versi persis teruji (requirements.txt = rentang versi)
cd remotion && npm install                                            # lokal, jangan global
```
Butuh FFmpeg dan Node.js di PATH. Jangan memasang paket ke Python global, karena bisa merusak TensorFlow pengguna.
Model WhisperX dan MediaPipe diunduh otomatis saat pertama dipakai.

## Cara memakai lewat Claude Code (skill video-editor)
Kirim footage, lalu sebutkan isi dan suasana yang diinginkan. Agen akan mengikuti [pipeline/skill/SKILL.md](pipeline/skill/SKILL.md):

> Footage: `D:\rekaman\take1.mp4`. Isinya membantah anggapan X. Suasana tegas & profesional. Pakai rotoscope.

> Footage: `…`. Preset kaca-gelap-mitos-fakta, tunjukkan 3 varian dulu. Di penutup pakai checklist.

> Footage: `…`. Gaya glass-tech, koreografi tutorial-langkah, sesuaikan dengan brand guideline `D:\…\brand.pdf` untuk video ini saja.

- **Preset = gaya × koreografi.** Koreografi dipilih menurut isi (mitos-fakta, tutorial-langkah, kata-prompt,
  minimal-quote, bukti-sosial), gaya menurut suasana. Gaya apa pun bisa dipakai dengan koreografi apa pun.
  Variasi susunan efek diatur lewat `--seed`.
- **Efek** dipilih otomatis per slot (efek khas gaya didahulukan). Efek tertentu bisa diminta per bagian video, misalnya
  "coret kata 'sertifikat'" atau "checklist di ringkasan".
- **Brand per proyek** (warna, font, highlight, margin) diterapkan lewat `manifest.token_override`, sehingga tidak
  mengubah gaya atau proyek lain. Logo dipasang sebagai elemen `gambar`.
- **Storyboard wajib disetujui pengguna** sebelum render penuh, dan hasil hanya diserahkan bila QA **LULUS**.

## Alur perintah
`<proyek>` = nama folder di `proyek/` atau path.
```
.venv\Scripts\python pipeline/scripts/video.py preset                      # daftar preset per gaya
.venv\Scripts\python pipeline/scripts/video.py varian <preset> --n 5      # pilihan susunan efek per seed
.venv\Scripts\python pipeline/scripts/video.py baru nama-video --preset <preset> [--gaya g] [--template t] [--seed N]
#   taruh rekaman di aset/rekaman/ (atau set manifest aset.rekaman)
.venv\Scripts\python pipeline/scripts/video.py ingest <proyek>            # crop 9:16, warna, audio −14 LUFS
.venv\Scripts\python pipeline/scripts/video.py transkrip <proyek>         # WhisperX per kata → koreksi cache/words.json
.venv\Scripts\python pipeline/scripts/video.py wajah <proyek>             # kotak wajah (hindari menutupi wajah, fokus zoom)
.venv\Scripts\python pipeline/scripts/video.py pasang <proyek>            # beat-sheet preset → anchor kata + hindari wajah
#   ganti teks contoh di beat-sheet.json dengan isi ucapan
.venv\Scripts\python pipeline/scripts/video.py roto <proyek>              # mask subjek (depth / efek kamera ber-mask)
.venv\Scripts\python pipeline/scripts/video.py storyboard <proyek> --buka # pratinjau + timestamp + pra-QA
.venv\Scripts\python pipeline/scripts/video.py setuju <proyek>            # HANYA setelah pengguna menyetujui
.venv\Scripts\python pipeline/scripts/video.py semua <proyek>             # render → ekspor → QA (+ laporan, kontak.png)
.venv\Scripts\python pipeline/scripts/video.py arsip <proyek>             # setelah QA LULUS + checklist manual
```
Review cepat tanpa render penuh: `video.py still <proyek> 1.5,8,20`. Detail perintah, field manifest dan beat-sheet:
[pipeline/scripts/README.md](pipeline/scripts/README.md).

### Hal penting
- **Gerbang persetujuan:** `semua` dan `render` menolak bila beat-sheet saat ini belum disetujui. Revisi beat-sheet berarti
  storyboard dan persetujuan ulang. `--tanpa-setuju` hanya atas keputusan pengguna, dan pelewatannya dicatat di manifest.
- **Ekspor:** `manifest.platform` menentukan file keluaran. Isi `["reels"]` saja bila satu file 1080×1920 cukup untuk semua
  platform.
- **Rotoscope:** MediaPipe (cepat, CPU). Bila tepi mask kurang rapi, set `"roto": {"backend": "eksternal"}` dan isi
  `cache/masks/` dengan mask yang sudah diperbaiki (Roto Brush, Magic Mask, atau skrip pembersih per proyek).
  Efek vertigo butuh latar tanpa orang (clean plate); tanpa itu subjek tampil ganda.
- **Render paralel:** komposit dibagi ke beberapa proses (default ½ inti CPU, maks 4) dengan hasil identik per frame.
  Atur lewat `render.py --pekerja N` atau env `VIDEO_PEKERJA`; `1` = berurutan.
- **Remotion** dirender lewat satu proses `remotion/render-server.mjs` per run (bundle sekali, satu browser) menjadi overlay
  ProRes 4444 bt709 yang ber-cache. Revisi hanya me-render ulang overlay yang berubah.
- **Transkrip** yang sudah `"dikoreksi": true` tidak pernah ditimpa (juga dengan `--paksa`); hasil baru masuk ke `words.baru.json`.

## Menyebut modul di prompt
- Nama pendek: "Gaya glass-tech, template explainer, konteks 00 dan 02, efek checklist di ringkasan."
- Path / @-mention: `@konteks/KONTEKS_00_zona-aman_v0.2.md`
- Manifest (paling otomatis): "Baca proyek/<proyek>/manifest.json lalu kerjakan."

## Perawatan
```
.venv\Scripts\python pipeline/scripts/video.py cek                 # validasi modul, INDEX, preset & koreografi
.venv\Scripts\python -m unittest discover -s pipeline/tests        # test pipeline
cd remotion && npm run cek-tipe && npm run lint                    # TypeScript + ESLint (aturan resmi Remotion)
```
Perubahan modul: naikkan versi, pindahkan versi lama ke `arsip/`, lalu catat di [arsip/CHANGELOG.md](arsip/CHANGELOG.md).

## Membuat modul baru
Salin `_TEMPLATE.*` di lapisan terkait menjadi `JENIS_NN_nama_v0.1.ext`, isi frontmatter, daftarkan di INDEX.md,
lalu jalankan `video.py cek`. Gaya baru = 1 file token + 1 file gaya. Composition Remotion baru: lihat
[remotion/README.md](remotion/README.md).
