# QA — 2026-10_lonely-now-stronger (layout split)

**Status: LULUS**

File: `out/2026-10_lonely-now-stronger.mp4` · dicek 2026-10-28 19:41

| ID | Aturan | Status | Detail |
|---|---|---|---|
| K07.2 | H.264, resolusi format, pix_fmt, tag bt709, AAC | LULUS | h264 1080x1920 yuv420p ('bt709', 'bt709', 'bt709') audio aac |
| FPS | fps = format.fps | LULUS | 30.00 |
| K06.1 | loudness terintegrasi = audio.lufs ± toleransi | LULUS | -14.1 LUFS |
| K06.2 | true peak ≤ audio.true-peak | LULUS | -1.9 dBTP |
| DUR | durasi = rekaman (±0,1 s) | LULUS | 55.73 s vs rekaman 55.80 s |
| SINK | audio & video sama panjang (±0,1 s) | LULUS | audio 55.74 s |
| K01.cps | caption ≤ qa.karakter-per-detik-maks | LULUS | terpadat 22.5 cps (“part of the”), batas 23 |
| HOOK | frame 0 panggung sudah berisi visual (roadmap #7) | LULUS | stddev luminans 27.5 |

K07.1 (master ProRes) dilewati: aturan Zar = satu file ekspor per proyek.

## Checklist manual (dicentang Zar)
- [ ] K00 zona aman: grafis panggung tidak masuk area tombol kanan (120 px) & atas (250 px) di HP.
- [ ] K07.3 tonton di HP resolusi penuh: keterbacaan caption, sinkron bibir.
- [ ] K08.5–6 cek SFX & ducking musik dengan headphone.
- [ ] G01.2 grafis tidak menutupi wajah talent; sambungan atas/bawah tidak terlihat terpotong.
