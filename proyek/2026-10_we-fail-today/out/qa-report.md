# QA — 2026-10_we-fail-today

**Status: ✅ LULUS** · 2026-10-27T09:38:53

lulus 44 · gagal 0 · peringatan 0 · lewat 2 · belum diimplementasi 0

## Modul yang dibaca

| Lapisan | Ref | File |
|---|---|---|
| gaya | glass-tech@0.6 | gaya/GAYA_01_glass-tech_v0.6.md |
| template | explainer@0.2 | template/TEMPLATE_01_explainer_v0.2.md |
| konteks | zona-aman@0.2 | konteks/KONTEKS_00_zona-aman_v0.2.md |
| konteks | caption@0.2 | konteks/KONTEKS_01_caption_v0.2.md |
| konteks | depth-typography@0.2 | konteks/KONTEKS_02_depth-typography_v0.2.md |
| konteks | ingest@0.1 | konteks/KONTEKS_04_ingest_v0.1.md |
| konteks | gerak@0.2 | konteks/KONTEKS_05_gerak_v0.2.md |
| konteks | audio@0.1 | konteks/KONTEKS_06_audio_v0.1.md |
| konteks | ekspor@0.1 | konteks/KONTEKS_07_ekspor_v0.1.md |
| konteks | sound-design@0.1 | konteks/KONTEKS_08_sound-design_v0.1.md |
| konteks | koreografi@0.2 | konteks/KONTEKS_09_koreografi_v0.2.md |
| tokens | platform@0.4 | tokens/TOKEN_00_platform_v0.4.json |
| tokens | glass-tech@0.3 | tokens/TOKEN_01_glass-tech_v0.3.json |
| efek | green-screen@0.2 | efek/EFEK_12_green-screen_v0.2.md |
| efek | ui-world@0.2 | efek/EFEK_03_ui-world_v0.2.md |
| efek | blur-zoom@0.2 | efek/EFEK_26_blur-zoom_v0.2.md |
| efek | paper-cutout@0.1 | efek/EFEK_46_paper-cutout_v0.1.md |
| efek | digital-zoom@0.2 | efek/EFEK_05_digital-zoom_v0.2.md |
| efek | checklist@0.3 | efek/EFEK_07_checklist_v0.3.md |
| efek | aksen-gaya@0.1 | efek/EFEK_27_aksen-gaya_v0.1.md |
| skill | video-editor@0.3 | pipeline/skill/SKILL.md |
| scripts | scripts@0.6 | pipeline/scripts/ |

## Cek otomatis

| | ID | Aturan | Detail |
|---|---|---|---|
| ✅ | E03.1 | Durasi elemen ber-`efek: ui-world` dalam rentang `durasi` (4–6 s). | 2 elemen dalam 4–6s |
| ✅ | E03.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | konteks/1-remotion: 1080x1920@30.00 |
| ✅ | E05.1 | Durasi elemen ber-`efek: digital-zoom` dalam rentang `durasi` (1–2 s). | 1 elemen dalam 1–2s |
| ✅ | E07.3 | Stagger antar item dalam rentang `stagger` (0.6–1.0 s). | 1 kartu |
| ✅ | E27.1 | Durasi elemen ber-`efek: aksen-gaya` dalam rentang `durasi`. | 1 elemen dalam 1.2–1.8s |
| ✅ | E46.1 | Durasi elemen ber-`efek: paper-cutout` dalam rentang `durasi`. | 1 elemen dalam 2–6s |
| ✅ | K00.1 | Kotak pembatas setiap elemen teks/grafis berada di dalam zona aman pada setiap frame saat ia tampil, termasuk  | 46 elemen di dalam zona aman [60, 250, 960, 1760] |
| ✅ | K00.2 | Dua elemen teks tidak tumpang tindih pada waktu yang sama (kecuali caption di atas teks depth). |  |
| ✅ | K00.3 | Elemen informasi tidak menutupi wajah: kotak teks elemen menutup ≤ `koreografi.tutup-wajah-maks` (10 %) kotak  | 16 elemen ≤ 10% wajah tertutup |
| ✅ | K01.1 | Timing caption berasal dari transkrip ber-timestamp per kata (`cache/words.json`, WhisperX / forced alignment) | backend faster-whisper, 27 potongan |
| ✅ | K01.2 | `words.json` sudah dikoreksi manual (`"dikoreksi": true`): ejaan, nama, istilah. |  |
| ✅ | K01.3 | Satu potongan caption ≤ `caption.baris-maks` baris dan ≤ `caption.karakter-maks-baris` karakter per baris. | 27 potongan ≤ 2 baris × 18 karakter |
| ✅ | K01.4 | Kontras setiap teks (caption, judul, kartu, CTA) terhadap latar efektifnya (panel, stroke, atau video di belak | 35 teks ≥ ambang kontras |
| ✅ | K01.5 | Setiap potongan tampil ≥ 0,3 detik; kecepatan baca ≤ `qa.karakter-per-detik-maks`. |  |
| ✅ | K01.6 | Kata yang sedang diucapkan terlihat: mode `aktif` → disorot `caption.warna-aktif`; mode `karaoke` → kata yang  | karaoke: kata berikutnya diredupkan 40% |
| ✅ | K01.8 | Ukuran font setiap teks ≥ `qa.ukuran-min-px`. | semua teks ≥ 40 px |
| ✅ | K02.1 | Elemen `depth` hanya dirender bila mask subjek tersedia untuk seluruh rentang waktunya (`cache/masks/`). | 1 depth + 2 kamera ber-mask, mask lengkap |
| ✅ | K02.2 | Feather tepi mask 1–2 px (`mask.feather-px`). | 1.5 px |
| ✅ | K02.3 | Teks depth maksimal 2 kata dan tetap TERBACA: bagian huruf yang tertutup subjek rata-rata ≤ `depth.qa-tutup-ra | poin-1/0-depth 'NOT OVER': tertutup rata-rata 12%, maks 15% |
| ✅ | K02.6 | Teks depth tidak bertumpuk dengan teks/panel lain yang tampil bersamaan (penataan otomatis menghindari pita te | 1 teks depth bebas tumpuk |
| ✅ | K04.1 | Rekaman hasil ingest: resolusi = `format.resolusi`, fps = `format.fps`, tinggi sumber ≥ `ingest.tinggi-min`. | 1080x1920@30 |
| ✅ | K04.4 | Audio dibersihkan (highpass + denoise) dan dinormalisasi ke `audio.lufs` saat ingest. | audio.wav -14.3 LUFS (sumber -29.44) |
| ✅ | K05.1 | Tidak ada gerak linear; setiap animasi memakai kurva dari `easing.*`. |  |
| ✅ | K05.2 | Elemen berisi beberapa item muncul dengan stagger ≥ `durasi.stagger`. | 1 kartu ber-stagger |
| ✅ | K05.3 | Teks tampil penuh (di luar animasi masuk/keluar) ≥ `durasi.tahan-min`. |  |
| ✅ | K05.4 | Gerak cepat (> `motion-blur.ambang-px` per frame) diberi motion blur. | dipakai di 14 lapisan-frame |
| ✅ | K05.5 | Gerak besar (judul, kartu, push) dimulai dalam ±0,15 detik dari awal kata atau beat. |  |
| ✅ | K06.1 | Loudness terintegrasi hasil akhir = `audio.lufs` ± `audio.lufs-toleransi` (−14 LUFS untuk media sosial). | 2026-10_we-fail-today_reels.mp4: -14.1 LUFS, TP -1.3 dBTP |
| ✅ | K06.2 | True peak ≤ `audio.true-peak` dBTP. | 2026-10_we-fail-today_reels.mp4: -14.1 LUFS, TP -1.3 dBTP |
| ✅ | K06.3 | Whoosh/riser pada transisi di level `sfx.level-db` (rendah); musik di-duck terhadap suara (sidechain). | 18 sfx ≤ -18 dB |
| ✅ | K07.1 | Master tersimpan (`out/master.mov`, ProRes 422 HQ). | prores HQ |
| ✅ | K07.2 | Versi platform: H.264, `format.resolusi`, `ekspor.pix_fmt`, tag warna bt709 (primaries/trc/matrix), AAC. | 2026-10_we-fail-today_reels.mp4: h264 1080x1920 bt709 aac ✓ |
| ✅ | K08.1 | Setiap elemen visual yang masuk dengan gerak punya bunyi (otomatis dari `sfx.peta` atau eksplisit). Diam hanya | 18 bunyi |
| ✅ | K08.2 | Dua bunyi (selain klik ketik) berjarak ≥ `sfx.jarak-min` detik — tidak menumpuk. | jarak ≥ 0.06s |
| ✅ | K08.3 | Level tiap bunyi ≤ −16 dB terhadap suara (kelas `sfx.level`); bus SFX tidak clipping. | bus SFX puncak -20.0 dBFS |
| ✅ | K08.4 | Bunyi berulang memakai varian bergilir (tidak identik berturut-turut). | varian bergilir |
| ✅ | K09.1 | Perangkat yang sama (efek remotion / info / chip-<status> / kartu / …) tidak dipakai di dua beat berurutan. | 7 beat tanpa perangkat berulang berurutan |
| ✅ | K09.2 | Jumlah perangkat berbeda per video ≥ `koreografi.variasi-min` (atau `variasi_min` koreografi yang dipakai). | 11 perangkat berbeda (min 4): aksen-gaya, checklist, chip-info, cta, depth, digital-zoom, green-screen, info, kartu, paper-cutout, ui-world |
| ✅ | K09.3 | Transisi (jenis apa pun) tidak di beat hook dan maksimal 1 per beat. |  |
| ✅ | K09.4 | Tiap perangkat mencantumkan `fungsi` dari daftar `koreografi.fungsi` (alasan perangkat ini dipakai). |  |
| ✅ | K09.6 | Video memakai ≥ `koreografi.khas-min` (2) efek KHAS gaya (modul efek mencantumkan gaya di `gaya_cocok`; termas | 3 efek khas glass-tech: ui-world, digital-zoom, blur-zoom (min 2) |
| ✅ | T01.1 | Semua `beat_wajib` ada di beat-sheet. | 7 beat |
| ✅ | T01.2 | Durasi akhir 60–90 s (± `qa.durasi-toleransi-s`). | 56.8s (template 60–90s ±4) |
| ✅ | T01.3 | Beat hook berakhir ≤ `hook_maks` detik. | hook selesai 3.23s (maks 3.5) |
| ➖ | E03.3 | Stagger antar item dalam rentang `stagger` (0.05–0.1 s). |  |
| ➖ | E12.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | dukungan native: tidak memakai klip broll |

## Checklist manual (centang sebelum diserahkan)

- [ ] **K00.4** Wajah subjek (mata) berada di sepertiga atas area aman.
- [ ] **K01.7** Caption tidak dipecah di tengah frasa nama/angka (mis. "Rp 5 juta").
- [ ] **K02.4** Tepi rambut, hijab, dan tangan yang bergerak cepat diperiksa per frame; tidak ada "halo" atau potongan hilang.
- [ ] **K02.5** Exposure & white balance subjek sudah disamakan dengan latar sebelum compositing (lihat K04.3).
- [ ] **K04.2** Rough cut (potong jeda & kesalahan) selesai sebelum beat-sheet dikunci; potongan dicatat di `manifest.aset.potong`.
- [ ] **K04.3** Exposure & white balance disamakan sebelum compositing (`manifest.warna.filter`).
- [ ] **K05.6** Setelah masuk, elemen diam: tidak ada gerak berulang (denyut, napas, kedip, goyang, kilau berulang) pada elemen UI. Pengecualian: inti efek (orbit, kertas stop-motion), motif gaya dari token (`motif.boil`, bingkai `hud`, `motif.judul.hiasan`) dan latar layar penuh. Penarik perhatian boleh berdenyut terbatas (≤ 2 kali) lalu diam.
- [ ] **K06.4** Tidak ada clipping, napas keras, atau noise yang terdengar di HP.
- [ ] **K07.3** Ditonton di HP pada resolusi penuh sebelum diunggah (zona aman, keterbacaan, sinkron bibir).
- [ ] **K08.5** Karakter bunyi cocok dengan gaya & gerak (lembut untuk kaca/kertas/lofi, tajam untuk brutal/HUD/kinetik).
- [ ] **K08.6** Didengar dengan headphone: tidak ada bunyi yang terasa murahan, terlambat, atau mengganggu kalimat penting.
- [ ] **K09.5** Ditonton tanpa suara: tiap bagian terasa berbeda secara visual, dan perangkatnya menjelaskan isi kalimat.
- [ ] **G01.1** Maksimal 1 kata beraksen per elemen teks (di luar caption).
- [ ] **G01.2** Kartu tidak menutupi wajah.
- [ ] **E12.4** Hasil sesuai elemen visual & tips: Pencahayaan latar hijau harus rata, jarak subjek 1.5 - 2 m dari layar untuk mengurangi green spill.
- [ ] **E03.4** Hasil sesuai elemen visual & tips: Gunakan spring animation (overshoot kecil) agar terasa responsif dan hidup.
- [ ] **E26.4** Transisi menandai pergantian bagian, maksimal 1 per bagian; tidak memotong kalimat penting.
- [ ] **E46.4** Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca.
- [ ] **E05.4** Hasil sesuai elemen visual & tips: Kombinasikan dengan suara "beep" atau whoosh digital untuk dampak maksimal.
- [ ] **E07.4** Hasil sesuai elemen visual & tips: Gunakan trim path pada stroke centang; tambahkan sedikit scale bounce saat selesai.
- [ ] **E27.4** Terasa khas gaya, tidak menutupi informasi penting.
