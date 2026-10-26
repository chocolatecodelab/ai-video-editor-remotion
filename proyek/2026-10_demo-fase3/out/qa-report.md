# QA — 2026-10_demo-fase3

**Status: ❌ GAGAL** · 2026-10-25T08:56:08

lulus 29 · gagal 1 · peringatan 1 · lewat 6 · belum diimplementasi 0

## Modul yang dibaca

| Lapisan | Ref | File |
|---|---|---|
| gaya | kaca-gelap@0.3 | gaya/GAYA_04_kaca-gelap_v0.3.md |
| template | hook-problem-solution@0.2 | template/TEMPLATE_02_hook-problem-solution_v0.2.md |
| konteks | zona-aman@0.1 | konteks/KONTEKS_00_zona-aman_v0.1.md |
| konteks | caption@0.2 | konteks/KONTEKS_01_caption_v0.2.md |
| konteks | parallax-push@0.1 | konteks/KONTEKS_03_parallax-push_v0.1.md |
| konteks | ingest@0.1 | konteks/KONTEKS_04_ingest_v0.1.md |
| konteks | gerak@0.1 | konteks/KONTEKS_05_gerak_v0.1.md |
| konteks | audio@0.1 | konteks/KONTEKS_06_audio_v0.1.md |
| konteks | ekspor@0.1 | konteks/KONTEKS_07_ekspor_v0.1.md |
| konteks | sound-design@0.1 | konteks/KONTEKS_08_sound-design_v0.1.md |
| konteks | koreografi@0.1 | konteks/KONTEKS_09_koreografi_v0.1.md |
| tokens | platform@0.3 | tokens/TOKEN_00_platform_v0.3.json |
| tokens | kaca-gelap@0.2 | tokens/TOKEN_04_kaca-gelap_v0.2.json |
| efek | blur-zoom@0.1 | efek/EFEK_26_blur-zoom_v0.1.md |
| efek | coret@0.1 | efek/EFEK_21_coret_v0.1.md |
| efek | penghitung@0.1 | efek/EFEK_19_penghitung_v0.1.md |
| efek | partikel@0.1 | efek/EFEK_25_partikel_v0.1.md |
| skill | video-editor@0.1 | pipeline/skill/SKILL.md |
| scripts | scripts@0.4 | pipeline/scripts/ |

## Cek otomatis

| | ID | Aturan | Detail |
|---|---|---|---|
| ❌ | K04.1 | Rekaman hasil ingest: resolusi = `format.resolusi`, fps = `format.fps`, tinggi sumber ≥ `ingest.tinggi-min`. | sumber 478x850 di bawah minimum (di-ingest dengan --paksa) |
| ⚠️ | K01.2 | `words.json` sudah dikoreksi manual (`"dikoreksi": true`): ejaan, nama, istilah. | words.json belum dikoreksi manual (_meta.dikoreksi=false) |
| ✅ | K00.1 | Kotak pembatas setiap elemen teks/grafis berada di dalam zona aman pada setiap frame saat ia tampil, termasuk  | 40 elemen di dalam zona aman [60, 250, 960, 1520] |
| ✅ | K00.2 | Dua elemen teks tidak tumpang tindih pada waktu yang sama (kecuali caption di atas teks depth). |  |
| ✅ | K01.1 | Timing caption berasal dari transkrip ber-timestamp per kata (`cache/words.json`, WhisperX / forced alignment) | backend whisperx, 25 potongan |
| ✅ | K01.3 | Satu potongan caption ≤ `caption.baris-maks` baris dan ≤ `caption.karakter-maks-baris` karakter per baris. | 25 potongan ≤ 2 baris × 18 karakter |
| ✅ | K01.4 | Kontras setiap teks (caption, judul, kartu, CTA) terhadap latar efektifnya (panel, stroke, atau video di belak | 32 teks ≥ ambang kontras |
| ✅ | K01.5 | Setiap potongan tampil ≥ 0,3 detik; kecepatan baca ≤ `qa.karakter-per-detik-maks`. |  |
| ✅ | K01.6 | Kata yang sedang diucapkan terlihat: mode `aktif` → disorot `caption.warna-aktif`; mode `karaoke` → kata yang  | karaoke: kata berikutnya diredupkan 40% |
| ✅ | K01.8 | Ukuran font setiap teks ≥ `qa.ukuran-min-px`. | semua teks ≥ 40 px |
| ✅ | K04.4 | Audio dibersihkan (highpass + denoise) dan dinormalisasi ke `audio.lufs` saat ingest. | audio.wav -14.3 LUFS (sumber -30.71) |
| ✅ | K05.1 | Tidak ada gerak linear; setiap animasi memakai kurva dari `easing.*`. |  |
| ✅ | K05.3 | Teks tampil penuh (di luar animasi masuk/keluar) ≥ `durasi.tahan-min`. |  |
| ✅ | K05.4 | Gerak cepat (> `motion-blur.ambang-px` per frame) diberi motion blur. | dipakai di 0 lapisan-frame |
| ✅ | K05.5 | Gerak besar (judul, kartu, push) dimulai dalam ±0,15 detik dari awal kata atau beat. |  |
| ✅ | K06.1 | Loudness terintegrasi hasil akhir = `audio.lufs` ± `audio.lufs-toleransi` (−14 LUFS untuk media sosial). | 2026-10_demo-fase3_reels.mp4: -14.2 LUFS, TP -1.4 dBTP<br>2026-10_demo-fase3_tiktok.mp4: -14.2 LUFS, TP -1.4 dBTP<br>2026-10_demo-fase3_shorts.mp4: -14.2 LUFS, TP -1.4 dBTP |
| ✅ | K06.2 | True peak ≤ `audio.true-peak` dBTP. | 2026-10_demo-fase3_reels.mp4: -14.2 LUFS, TP -1.4 dBTP<br>2026-10_demo-fase3_tiktok.mp4: -14.2 LUFS, TP -1.4 dBTP<br>2026-10_demo-fase3_shorts.mp4: -14.2 LUFS, TP -1.4 dBTP |
| ✅ | K06.3 | Whoosh/riser pada transisi di level `sfx.level-db` (rendah); musik di-duck terhadap suara (sidechain). | 14 sfx ≤ -24 dB |
| ✅ | K07.1 | Master tersimpan (`out/master.mov`, ProRes 422 HQ). | prores HQ |
| ✅ | K07.2 | Versi platform: H.264, `format.resolusi`, `ekspor.pix_fmt`, tag warna bt709 (primaries/trc/matrix), AAC. | 2026-10_demo-fase3_reels.mp4: h264 1080x1920 bt709 aac ✓<br>2026-10_demo-fase3_tiktok.mp4: h264 1080x1920 bt709 aac ✓<br>2026-10_demo-fase3_shorts.mp4: h264 1080x1920 bt709 aac ✓ |
| ✅ | K08.1 | Setiap elemen visual yang masuk dengan gerak punya bunyi (otomatis dari `sfx.peta` atau eksplisit). Diam hanya | 14 bunyi |
| ✅ | K08.2 | Dua bunyi (selain klik ketik) berjarak ≥ `sfx.jarak-min` detik — tidak menumpuk. | jarak ≥ 0.06s |
| ✅ | K08.3 | Level tiap bunyi ≤ −16 dB terhadap suara (kelas `sfx.level`); bus SFX tidak clipping. | bus SFX puncak -24.3 dBFS |
| ✅ | K08.4 | Bunyi berulang memakai varian bergilir (tidak identik berturut-turut). | varian bergilir |
| ✅ | K09.1 | Perangkat yang sama (efek remotion / info / chip-<status> / kartu / …) tidak dipakai di dua beat berurutan. | 5 beat tanpa perangkat berulang berurutan |
| ✅ | K09.2 | Jumlah perangkat berbeda per video ≥ `koreografi.variasi-min` (atau `variasi_min` koreografi yang dipakai). | 7 perangkat berbeda (min 5): chip-benar, chip-salah, coret, cta, info, partikel, penghitung |
| ✅ | K09.3 | Transisi (blur-zoom) tidak di beat hook dan maksimal 1 per beat. |  |
| ✅ | K09.4 | Tiap perangkat mencantumkan `fungsi` dari daftar `koreografi.fungsi` (alasan perangkat ini dipakai). |  |
| ✅ | T02.1 | Semua `beat_wajib` ada di beat-sheet. | 5 beat |
| ✅ | T02.2 | Durasi akhir 30–45 s (± `qa.durasi-toleransi-s`). | 46.5s (template 30–45s ±3) |
| ✅ | T02.3 | Beat hook berakhir ≤ `hook_maks` detik. | hook selesai 3.50s (maks 3.5) |
| ➖ | K03.1 | Skala push ≤ `gerak.push-in` dan ≤ 1,15. |  |
| ➖ | K03.2 | Durasi push ≥ 0,6 detik dan memakai easing (bukan linear). |  |
| ➖ | K03.3 | Push dimulai pada kata kunci atau beat audio (`mulai: {"kata": …}`). |  |
| ➖ | K03.4 | Lapisan teks bergerak lebih lambat dari latar (parallax), bukan ikut terskala sama. |  |
| ➖ | K03.5 | Push tidak membuat elemen keluar zona aman (lihat K00.1). |  |
| ➖ | K05.2 | Elemen berisi beberapa item muncul dengan stagger ≥ `durasi.stagger`. |  |

## Checklist manual (centang sebelum diserahkan)

- [ ] **K00.3** Wajah subjek (mata) berada di sepertiga atas area aman, tidak tertutup elemen.
- [ ] **K01.7** Caption tidak dipecah di tengah frasa nama/angka (mis. "Rp 5 juta").
- [ ] **K04.2** Rough cut (potong jeda & kesalahan) selesai sebelum beat-sheet dikunci; potongan dicatat di `manifest.aset.potong`.
- [ ] **K04.3** Exposure & white balance disamakan sebelum compositing (`manifest.warna.filter`).
- [ ] **K06.4** Tidak ada clipping, napas keras, atau noise yang terdengar di HP.
- [ ] **K07.3** Ditonton di HP pada resolusi penuh sebelum diunggah (zona aman, keterbacaan, sinkron bibir).
- [ ] **K08.5** Karakter bunyi cocok dengan gaya & gerak (lembut untuk kaca/kertas/lofi, tajam untuk brutal/HUD/kinetik).
- [ ] **K08.6** Didengar dengan headphone: tidak ada bunyi yang terasa murahan, terlambat, atau mengganggu kalimat penting.
- [ ] **K09.5** Ditonton tanpa suara: tiap bagian terasa berbeda secara visual, dan perangkatnya menjelaskan isi kalimat.
- [ ] **G04.1** Tampilan terbaca sebagai Kaca Gelap (kaca berasap, amber, pelan) tanpa melihat nama preset.
- [ ] **G04.2** Tidak ada pelanggaran bagian "Larangan" di atas.
- [ ] **E26.4** Transisi menandai pergantian bagian, maksimal 1 per bagian; tidak memotong kalimat penting.
- [ ] **E21.4** Perangkat dipakai karena isi kalimat (bukan hiasan berulang); tidak dipakai di dua beat berurutan.
- [ ] **E19.4** Perangkat dipakai karena isi kalimat (bukan hiasan berulang); tidak dipakai di dua beat berurutan.
- [ ] **E25.4** Perangkat dipakai karena isi kalimat (bukan hiasan berulang); tidak dipakai di dua beat berurutan.
