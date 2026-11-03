# QA — 2026-11_otca-sertifikat-premium (editorial campuran split/full)

**Status: LULUS**

File: `out/2026-11_otca-sertifikat-premium.mp4` · dicek 2026-11-03 10:34

| ID | Aturan | Status | Detail |
|---|---|---|---|
| K07.2 | H.264, resolusi format, pix_fmt, tag bt709, AAC | LULUS | h264 1080x1920 yuv420p ('bt709', 'bt709', 'bt709') audio aac |
| FPS | fps = format.fps | LULUS | 30.00 |
| K06.1 | loudness terintegrasi = audio.lufs ± toleransi | LULUS | -14.7 LUFS |
| K06.2 | true peak ≤ audio.true-peak | LULUS | -2.8 dBTP |
| DUR | durasi = rekaman (±0,1 s) | LULUS | 58.67 s vs rekaman 58.67 s |
| SINK | audio & video sama panjang (±0,1 s) | LULUS | audio 58.67 s |
| K01.cps | caption ≤ qa.karakter-per-detik-maks | LULUS | terpadat 22.0 cps (“yang benar-benar”), batas 23 |
| HOOK | frame 0 panggung sudah berisi visual (roadmap #7) | LULUS | stddev luminans 15.0 |
| HOOK.1s | gerak panggung 0→0,5 s cukup kuat (roadmap #7) | LULUS | beda rata-rata 34.0 |
| STRUKTUR | split.json valid (modul, transisi, anchor, urutan adegan) | LULUS | proyek/2026-11_otca-sertifikat-premium: split 9 adegan, match cut 8/8 potongan, hook aktif; proyek/2026-11_otca-sertifikat-premium: caption vs wajah/sosok — 47 halaman, 14 digeser naik (maks 26 px) |
| MATCH | ≥1 match cut bentuk antar-adegan (roadmap #5) | LULUS | 8/8 potongan match/iris |
| KETUKAN | tempo audio dan grid visual | LULUS | 96 BPM; potongan tetap mengikuti ucapan storyboard, bukan klaim snap baru |
| K08.6 | musik di-duck di bawah ucapan | LULUS | transkrip -9 dB, 1 segmen bicara |

K07.1 (master ProRes) dilewati: aturan Zar = satu file ekspor per proyek.

## Checklist manual (dicentang Zar)
- [ ] K00 zona aman: grafis panggung tidak masuk area tombol kanan (120 px) & atas (250 px) di HP.
- [ ] K07.3 tonton di HP resolusi penuh: keterbacaan caption, sinkron bibir.
- [ ] K08.5–6 cek SFX & ducking musik dengan headphone (musik naik di jeda, tidak memompa di tengah kalimat).
- [ ] Denyut ketukan terasa halus (bukan kedip); iris/match cut terbaca sebagai satu gerak.
- [ ] G01.2 grafis tidak menutupi wajah talent; sambungan atas/bawah tidak terlihat terpotong.

## Audit editorial dari video final

**LULUS** — 9 sampel scene dan 24 frame di sekitar cut.

Full frame: area bawah tidak mengandung tekstur footage. Split: footage tetap hadir. Tidak ada frame kosong di sampel cut. Hasil rinci: editorial-audit.json; bukti: kontak.png.

Batas pemeriksaan: sampel visual tidak menggantikan review setiap frame atau tontonan di HP/headphone. K00 penempatan dan K05 kontinuitas ditinjau pada sampel; K02 depth/mask tidak digunakan; K04 sumber dan transkrip diverifikasi lewat cache/provenance.json; K06/K07 memakai pengukuran media; K08 ducking memakai timestamp transkrip; K09 memakai 9 modul berbeda; K10 tampilan kulit/grain tetap perlu review visual.

## Verifikasi tambahan

- Sinkron suara: cross-correlation segmen 10–20 detik terhadap audio sumber, lag 0 ms, korelasi 0,9715; bukan pemeriksaan seluruh durasi.
- Tes pipeline: 80 lulus. TypeScript lulus. Pemeriksaan file baru/perubahan tugas lulus. Pemeriksaan Python global menemukan 4 isu pada skrip pratinjau milik perubahan lain; tidak diubah. ESLint memiliki 8 peringatan pada komponen lama. Registry: OK.
- Modul: EditorialReview@0.1; pustaka OTCA/SplitReel; sumber transkrip WhisperX large-v3 yang telah dikoreksi; FFmpeg untuk mix, loudness, dan ekspor.
