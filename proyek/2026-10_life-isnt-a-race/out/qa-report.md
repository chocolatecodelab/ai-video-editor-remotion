# QA — 2026-10_life-isnt-a-race

**Status: ✅ LULUS** · 2026-10-28T03:34:37

lulus 39 · gagal 0 · peringatan 1 · lewat 7 · belum diimplementasi 0

## Modul yang dibaca

| Lapisan | Ref | File |
|---|---|---|
| gaya | kertas-tipografi@0.5 | gaya/GAYA_10_kertas-tipografi_v0.5.md |
| template | hook-problem-solution@0.2 | template/TEMPLATE_02_hook-problem-solution_v0.2.md |
| konteks | zona-aman@0.2 | konteks/KONTEKS_00_zona-aman_v0.2.md |
| konteks | caption@0.2 | konteks/KONTEKS_01_caption_v0.2.md |
| konteks | parallax-push@0.1 | konteks/KONTEKS_03_parallax-push_v0.1.md |
| konteks | ingest@0.1 | konteks/KONTEKS_04_ingest_v0.1.md |
| konteks | gerak@0.2 | konteks/KONTEKS_05_gerak_v0.2.md |
| konteks | audio@0.1 | konteks/KONTEKS_06_audio_v0.1.md |
| konteks | ekspor@0.1 | konteks/KONTEKS_07_ekspor_v0.1.md |
| konteks | sound-design@0.1 | konteks/KONTEKS_08_sound-design_v0.1.md |
| konteks | koreografi@0.2 | konteks/KONTEKS_09_koreografi_v0.2.md |
| konteks | depth-typography@0.2 | konteks/KONTEKS_02_depth-typography_v0.2.md |
| tokens | platform@0.4 | tokens/TOKEN_00_platform_v0.4.json |
| tokens | kertas-tipografi@0.3 | tokens/TOKEN_10_kertas-tipografi_v0.3.json |
| efek | kinetik-kata@0.1 | efek/EFEK_51_kinetik-kata_v0.1.md |
| efek | paper-cutout@0.1 | efek/EFEK_46_paper-cutout_v0.1.md |
| efek | paper-cut@0.2 | efek/EFEK_13_paper-cut_v0.2.md |
| efek | celup@0.1 | efek/EFEK_30_celup_v0.1.md |
| efek | lintasan@0.1 | efek/EFEK_52_lintasan_v0.1.md |
| efek | dua-linimasa@0.1 | efek/EFEK_53_dua-linimasa_v0.1.md |
| efek | green-screen@0.2 | efek/EFEK_12_green-screen_v0.2.md |
| efek | bab-baru@0.1 | efek/EFEK_54_bab-baru_v0.1.md |
| skill | video-editor@0.3 | pipeline/skill/SKILL.md |
| scripts | scripts@0.6 | pipeline/scripts/ |

## Cek otomatis

| | ID | Aturan | Detail |
|---|---|---|---|
| ⚠️ | K00.1 | Kotak pembatas setiap elemen teks/grafis berada di dalam zona aman pada setiap frame saat ia tampil, termasuk  | problem/3-remotion: saat animasi keluar {'atas': 11} px<br>solution/3-remotion: saat animasi keluar {'atas': 10} px |
| ✅ | E13.1 | Durasi elemen ber-`efek: paper-cut` dalam rentang `durasi` (3–5 s). | 2 elemen dalam 3–5s |
| ✅ | E13.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | problem/2-remotion: 1080x1920@30.00 |
| ✅ | E46.1 | Durasi elemen ber-`efek: paper-cutout` dalam rentang `durasi`. | 1 elemen dalam 2–6s |
| ✅ | K00.2 | Dua elemen teks tidak tumpang tindih pada waktu yang sama (kecuali caption di atas teks depth). |  |
| ✅ | K00.3 | Elemen informasi tidak menutupi wajah: kotak teks elemen menutup ≤ `koreografi.tutup-wajah-maks` (10 %) kotak  | 14 elemen ≤ 10% wajah tertutup |
| ✅ | K01.1 | Timing caption berasal dari transkrip ber-timestamp per kata (`cache/words.json`, WhisperX / forced alignment) | backend whisperx, 30 potongan |
| ✅ | K01.2 | `words.json` sudah dikoreksi manual (`"dikoreksi": true`): ejaan, nama, istilah. |  |
| ✅ | K01.3 | Satu potongan caption ≤ `caption.baris-maks` baris dan ≤ `caption.karakter-maks-baris` karakter per baris. | 30 potongan ≤ 2 baris × 20 karakter |
| ✅ | K01.4 | Kontras setiap teks (caption, judul, kartu, CTA) terhadap latar efektifnya (panel, stroke, atau video di belak | 35 teks ≥ ambang kontras |
| ✅ | K01.5 | Setiap potongan tampil ≥ 0,3 detik; kecepatan baca ≤ `qa.karakter-per-detik-maks`. |  |
| ✅ | K01.6 | Kata yang sedang diucapkan terlihat: mode `aktif` → disorot `caption.warna-aktif`; mode `karaoke` → kata yang  | karaoke: kata berikutnya diredupkan 40% |
| ✅ | K01.8 | Ukuran font setiap teks ≥ `qa.ukuran-min-px`. | semua teks ≥ 40 px |
| ✅ | K02.1 | Elemen `depth` hanya dirender bila mask subjek tersedia untuk seluruh rentang waktunya (`cache/masks/`). | 1 depth + 2 kamera ber-mask, mask lengkap |
| ✅ | K02.2 | Feather tepi mask 1–2 px (`mask.feather-px`). | 1.5 px |
| ✅ | K02.3 | Teks depth maksimal 2 kata dan tetap TERBACA: bagian huruf yang tertutup subjek rata-rata ≤ `depth.qa-tutup-ra | solution/2-depth 'YOUR TIME': tertutup rata-rata 15%, maks 19% |
| ✅ | K02.6 | Teks depth tidak bertumpuk dengan teks/panel lain yang tampil bersamaan (penataan otomatis menghindari pita te | 1 teks depth bebas tumpuk |
| ✅ | K04.1 | Rekaman hasil ingest: resolusi = `format.resolusi`, fps = `format.fps`, tinggi sumber ≥ `ingest.tinggi-min`. | 1080x1920@30 |
| ✅ | K04.4 | Audio dibersihkan (highpass + denoise) dan dinormalisasi ke `audio.lufs` saat ingest. | audio.wav -14.1 LUFS (sumber -31.26) |
| ✅ | K05.1 | Tidak ada gerak linear; setiap animasi memakai kurva dari `easing.*`. |  |
| ✅ | K05.3 | Teks tampil penuh (di luar animasi masuk/keluar) ≥ `durasi.tahan-min`. |  |
| ✅ | K05.4 | Gerak cepat (> `motion-blur.ambang-px` per frame) diberi motion blur. | dipakai di 0 lapisan-frame |
| ✅ | K05.5 | Gerak besar (judul, kartu, push) dimulai dalam ±0,15 detik dari awal kata atau beat. |  |
| ✅ | K06.1 | Loudness terintegrasi hasil akhir = `audio.lufs` ± `audio.lufs-toleransi` (−14 LUFS untuk media sosial). | 2026-10_life-isnt-a-race_reels.mp4: -14.0 LUFS, TP -1.3 dBTP<br>2026-10_life-isnt-a-race_tiktok.mp4: -14.0 LUFS, TP -1.3 dBTP<br>2026-10_life-isnt-a-race_shorts.mp4: -14.0 LUFS, TP -1.3 dBTP |
| ✅ | K06.2 | True peak ≤ `audio.true-peak` dBTP. | 2026-10_life-isnt-a-race_reels.mp4: -14.0 LUFS, TP -1.3 dBTP<br>2026-10_life-isnt-a-race_tiktok.mp4: -14.0 LUFS, TP -1.3 dBTP<br>2026-10_life-isnt-a-race_shorts.mp4: -14.0 LUFS, TP -1.3 dBTP |
| ✅ | K06.3 | Whoosh/riser pada transisi di level `sfx.level-db` (rendah); musik di-duck terhadap suara (sidechain). | 33 sfx ≤ -24 dB<br>musik di-duck (sidechain) |
| ✅ | K07.1 | Master tersimpan (`out/master.mov`, ProRes 422 HQ). | prores HQ |
| ✅ | K07.2 | Versi platform: H.264, `format.resolusi`, `ekspor.pix_fmt`, tag warna bt709 (primaries/trc/matrix), AAC. | 2026-10_life-isnt-a-race_reels.mp4: h264 1080x1920 bt709 aac ✓<br>2026-10_life-isnt-a-race_tiktok.mp4: h264 1080x1920 bt709 aac ✓<br>2026-10_life-isnt-a-race_shorts.mp4: h264 1080x1920 bt709 aac ✓ |
| ✅ | K08.1 | Setiap elemen visual yang masuk dengan gerak punya bunyi (otomatis dari `sfx.peta` atau eksplisit). Diam hanya | 33 bunyi |
| ✅ | K08.2 | Dua bunyi (selain klik ketik) berjarak ≥ `sfx.jarak-min` detik — tidak menumpuk. | jarak ≥ 0.06s |
| ✅ | K08.3 | Level tiap bunyi ≤ −16 dB terhadap suara (kelas `sfx.level`); bus SFX tidak clipping. | bus SFX puncak -26.0 dBFS |
| ✅ | K08.4 | Bunyi berulang memakai varian bergilir (tidak identik berturut-turut). | varian bergilir |
| ✅ | K09.1 | Perangkat yang sama (efek remotion / info / chip-<status> / kartu / …) tidak dipakai di dua beat berurutan. | 5 beat tanpa perangkat berulang berurutan |
| ✅ | K09.2 | Jumlah perangkat berbeda per video ≥ `koreografi.variasi-min` (atau `variasi_min` koreografi yang dipakai). | 9 perangkat berbeda (min 4): bab-baru, chip-info, depth, dua-linimasa, green-screen, kinetik-kata, lintasan, paper-cut, paper-cutout |
| ✅ | K09.3 | Transisi (jenis apa pun) tidak di beat hook dan maksimal 1 per beat. |  |
| ✅ | K09.4 | Tiap perangkat mencantumkan `fungsi` dari daftar `koreografi.fungsi` (alasan perangkat ini dipakai). |  |
| ✅ | K09.6 | Video memakai ≥ `koreografi.khas-min` (2) efek KHAS gaya (modul efek mencantumkan gaya di `gaya_cocok`; termas | 7 efek khas kertas-tipografi: kinetik-kata, paper-cutout, paper-cut, lintasan, dua-linimasa, bab-baru, celup (min 2) |
| ✅ | T02.1 | Semua `beat_wajib` ada di beat-sheet. | 5 beat |
| ✅ | T02.2 | Durasi akhir 30–45 s (± `qa.durasi-toleransi-s`). | 55.9s (template 30–45s ±20) |
| ✅ | T02.3 | Beat hook berakhir ≤ `hook_maks` detik. | hook selesai 3.13s (maks 3.5) |
| ➖ | E12.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | dukungan native: tidak memakai klip broll |
| ➖ | K03.1 | Skala push ≤ `gerak.push-in` dan ≤ 1,15. |  |
| ➖ | K03.2 | Durasi push ≥ 0,6 detik dan memakai easing (bukan linear). |  |
| ➖ | K03.3 | Push dimulai pada kata kunci atau beat audio (`mulai: {"kata": …}`). |  |
| ➖ | K03.4 | Lapisan teks bergerak lebih lambat dari latar (parallax), bukan ikut terskala sama. |  |
| ➖ | K03.5 | Push tidak membuat elemen keluar zona aman (lihat K00.1). |  |
| ➖ | K05.2 | Elemen berisi beberapa item muncul dengan stagger ≥ `durasi.stagger`. |  |

## Checklist manual (centang sebelum diserahkan)

- [ ] **K00.4** Wajah subjek (mata) berada di sepertiga atas area aman.
- [ ] **K01.7** Caption tidak dipecah di tengah frasa nama/angka (mis. "Rp 5 juta").
- [ ] **K04.2** Rough cut (potong jeda & kesalahan) selesai sebelum beat-sheet dikunci; potongan dicatat di `manifest.aset.potong`.
- [ ] **K04.3** Exposure & white balance disamakan sebelum compositing (`manifest.warna.filter`).
- [ ] **K05.6** Setelah masuk, elemen diam: tidak ada gerak berulang (denyut, napas, kedip, goyang, kilau berulang) pada elemen UI. Pengecualian: inti efek (orbit, kertas stop-motion), motif gaya dari token (`motif.boil`, bingkai `hud`, `motif.judul.hiasan`) dan latar layar penuh. Penarik perhatian boleh berdenyut terbatas (≤ 2 kali) lalu diam.
- [ ] **K06.4** Tidak ada clipping, napas keras, atau noise yang terdengar di HP.
- [ ] **K07.3** Ditonton di HP pada resolusi penuh sebelum diunggah (zona aman, keterbacaan, sinkron bibir).
- [ ] **K08.5** Karakter bunyi cocok dengan gaya & gerak (lembut untuk kaca/kertas/lofi, tajam untuk brutal/HUD/kinetik).
- [ ] **K08.6** Didengar dengan headphone: tidak ada bunyi yang terasa murahan, terlambat, atau mengganggu kalimat penting.
- [ ] **K09.5** Ditonton tanpa suara: tiap bagian terasa berbeda secara visual, dan perangkatnya menjelaskan isi kalimat.
- [ ] **K02.4** Tepi rambut, hijab, dan tangan yang bergerak cepat diperiksa per frame; tidak ada "halo" atau potongan hilang.
- [ ] **K02.5** Exposure & white balance subjek sudah disamakan dengan latar sebelum compositing (lihat K04.3).
- [ ] **G10.1** Tampilan terbaca sebagai Kertas & Tipografi (serif editorial, gading, merah tua) tanpa melihat nama preset.
- [ ] **G10.2** Tidak ada pelanggaran bagian "Larangan" di atas.
- [ ] **E51.4** Kata muncul sinkron dengan ucapan (tonton dengan suara); teks tidak menutupi wajah & tidak bertumpuk dengan teks lain.
- [ ] **E46.4** Terasa khas gaya, tidak menutupi wajah/teks penting, gerak terbaca.
- [ ] **E13.4** Hasil sesuai elemen visual & tips: Tambahkan tekstur kertas (grain) dan serat halus di atas semua layer untuk kesan autentik.
- [ ] **E30.4** Terasa khas gaya, tidak menutupi informasi penting.
- [ ] **E52.4** Metafora terbaca tanpa suara; label tujuan terbaca; terasa khas gaya.
- [ ] **E53.4** Kontras dua tempo terbaca dalam sekali lihat; label tidak terpotong tepi.
- [ ] **E12.4** Hasil sesuai elemen visual & tips: Pencahayaan latar hijau harus rata, jarak subjek 1.5 - 2 m dari layar untuk mengurangi green spill.
- [ ] **E54.4** Balik halaman mulus (tanpa kedip), judul bab terbaca setelah kamera mendekat.
