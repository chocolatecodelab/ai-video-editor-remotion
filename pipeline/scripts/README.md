# Scripts (v0.6)

Satu pintu: `python pipeline/scripts/video.py <perintah> <proyek>` — `<proyek>` = path, atau nama folder di `proyek/`.

| Perintah | Input | Output | Aturan |
|---|---|---|---|
| `baru <nama> --gaya --template` | proyek/_template-proyek | proyek/YYYY-MM_nama/ + baris INDEX | — |
| `baru <nama> --preset <p>` | preset/PRESET_NN_p_vX.Y.json | sama + manifest & beat-sheet awal dari preset (`--gaya/--template` menimpa); bila preset punya `aset` → aset/PERLU.md (file, spesifikasi, prompt dari modul efek) | — |
| `preset [nama\|gaya]` | preset/ | daftar preset per gaya (ciri, palet) / detail satu preset | — |
| `katalog [gaya]` | gaya + token | gaya/katalog/<gaya>.png (judul, kartu, CTA di atas latar gradien) + katalog.png | — |
| `pratinjau [preset] [--sumber <proyek>]` | preset + footage contoh | preset/pratinjau/<preset>.mp4 (540p, dengan suara) · .gif · .png (1 frame per beat); `--sumber` sekali untuk footage talking head | — |
| `pratinjau-efek [efek] [--gaya g] [--paksa]` | modul efek (contoh ```json) + footage contoh | efek/pratinjau/<efek>.gif · .png (7 s, satu efek di atas footage contoh; gaya = gaya_cocok pertama atau glass-tech); yang sudah mutakhir dilewati | — |
| `build_katalog.py [--keluar ../vorta] [--paksa]` (skrip sendiri) | INDEX + semua modul aktif + pratinjau | ../vorta/public/katalog.json + public/pratinjau/ (gif/png terkompres, tanpa mp4) untuk web Vorta; gagal bila ID ganda / rujukan rusak | — |
| `varian <preset> [--n 5] [--seed 0] [--gaya g]` | preset + koreografi ber-slot | pilihan perangkat per slot untuk tiap seed (tanpa render) | K09 |
| `referensi <video> [--nama n]` | video contoh | referensi/<n>/analisis.md·json (segmen = potongan keras + peristiwa, gerak, area teks, wajah, warna, tebakan slot), kontak.png, ritme.png, koreografi-draf.json | — |
| `cek` | semua modul | laporan pola nama, versi, INDEX, nama ganda | — |
| `status <p>` | manifest | modul ter-resolve + status cache | — |
| `ingest <p>` | aset.rekaman | cache/ingest.mp4, cache/audio.wav | K04 |
| `transkrip <p>` | cache/audio.wav | cache/words.json, words.srt | K01.1–2 |
| `roto <p>` | cache/ingest.mp4 + elemen depth / remotion `belakang` / kamera frame-break·vertigo·green-screen | cache/masks/NNNNNN.png | K02 |
| `wajah <p>` | cache/ingest.mp4 | cache/wajah.json (kotak wajah 5 fps, MediaPipe BlazeFace) | K00.3 |
| `pasang <p> [--kering]` | beat-sheet berdetik (preset) + words.json (+ wajah.json) | beat-sheet.json ber-anchor kata, posisi menghindari wajah, `_ucapan`/`_kata_kunci` per beat (salinan: beat-sheet.sebelum-pasang.json) | — |
| `still <p> 1.5,8` | semua di atas | out/still_*.png | — |
| `storyboard <p> [--buka]` | beat-sheet + cache | out/storyboard.html — lembar kontak per bagian (frame, ucapan + kata pemicu, elemen dalam bahasa pengguna, pra-QA per elemen), catatan revisi → permintaan revisi siap salin, tombol setujui, linimasa lengkap; storyboard.json | semua kecuali K02.1, K06.1–2, K07.1–2 |
| `setuju <p>` | storyboard.json | manifest.persetujuan (sha beat-sheet) | — |
| `render <p> [--pekerja N]` | beat-sheet + token + cache | out/master.mov, out/layout.json — komposit paralel per rentang frame (default ½ inti maks 4, env `VIDEO_PEKERJA`; `--pekerja 1` = berurutan, hasil identik) | K00–K06 |
| `ekspor <p>` | out/master.mov | out/<proyek>.mp4 (satu platform) atau out/<proyek>_<platform>.mp4 | K07 |
| `qa <p>` | out/* + modul | out/qa-report.md, out/qa.json (exit 1 = GAGAL) + laporan & kontak-sheet | semua |
| `laporan <p>` | out/layout.json + master + wajah.json | out/laporan-perangkat.md·json (per elemen: efek, fungsi, waktu, luas layar, % wajah tertutup), out/kontak.png (3 frame/beat + kotak elemen & wajah) | K00.3 |
| `semua <p>` | | ingest → transkrip → roto → wajah → render → ekspor → qa + laporan. **Ditolak** bila beat-sheet saat ini belum disetujui (`setuju`); `--tanpa-setuju` hanya atas keputusan pengguna (dicatat di manifest) | |
| `arsip <p>` | qa LULUS | manifest.terpakai, INDEX, git commit + tag | — |

Semua tahap ber-cache: ingest (sidik jari sumber + setelan), transkrip (sha audio), roto (per frame).
Revisi beat-sheet hanya mengulang render → ekspor → qa.

## Susunan render
`render.py` = orkestrator (bangun lapisan, per frame, render berurutan/paralel, layout.json). Bagiannya:
`render_dasar` (easing, sprite, pembaca video/overlay, lapisan) · `render_teks` · `render_panel` (motif bingkai, ikon) ·
mixin Renderer: `render_elemen` (judul/kartu/info/chip/…), `render_depth`, `render_perangkat` (Remotion), `render_kamera`
(transisi & kamera), `render_audio` (SFX & loudness). Nama lama tetap bisa diimpor dari `render`.

## Dependensi & venv
Pipeline dijalankan dari venv proyek `.venv/` — **jangan pasang whisperx/mediapipe ke Python global**: keduanya
menarik numpy 2 & protobuf 7 yang merusak TensorFlow 2.15 / google-cloud di lingkungan global.

```
python -m venv .venv
.venv\Scripts\python -m pip install -r pipeline/requirements.txt
.venv\Scripts\python pipeline/scripts/video.py <perintah> …
```
Versi persis teruji: `pipeline/requirements.lock`. Test: `.venv\Scripts\python -m unittest discover -s pipeline/tests`.
Wajib juga: FFmpeg di PATH (libx264, prores_ks, loudnorm, ebur128).
Model diunduh otomatis saat pertama dipakai: WhisperX (cache HuggingFace/torch di folder pengguna),
mediapipe selfie_segmenter → `pipeline/models/`. Transkrip CPU: `model` "base"/"small" cepat, "large-v3" paling akurat.
Font dicari di `pipeline/fonts/`, lalu folder font sistem.

## manifest.json
| Field | Isi |
|---|---|
| proyek, judul, status | identitas |
| gaya, template | `nama@versi` (tanpa versi = terbaru) |
| preset | `nama@versi` preset asal (catatan saja; null bila dibuat tanpa preset) |
| konteks | daftar `nama@versi`; kosong = ikut frontmatter gaya |
| platform | kunci dari `ekspor.platform` token: reels, tiktok, shorts. Bawaan `["reels"]` → satu file `<proyek>.mp4` untuk semua platform vertikal; isi beberapa kunci bila memang butuh file per platform |
| aset.rekaman | path video talking-head (kosong = video grafis saja, latar warna) |
| aset.potong | rough cut: `[[mulai, selesai], …]` bagian sumber yang DISIMPAN |
| aset.crop | `{"x": 0.5}` posisi crop horizontal 0–1 (sumber landscape) / `{"y": …}` |
| aset.musik | `"path"`, `"bawaan:pulsa"`/`"bawaan:lembut"`/`"bawaan:lofi"` (sintesis `musik.py`), atau `{"file": …, "db": -22, "fade_masuk": 0.3, "fade_keluar": 1.5}` — di-loop, di-duck terhadap suara, fade masuk/keluar (selesai tepat di akhir video) |
| koreografi | `nama@versi` koreografi asal preset (QA K09 memakai `variasi_min`-nya) |
| warna.filter | filter ffmpeg color correction, mis. `"eq=brightness=0.02:saturation=1.05,colortemperature=5600"` |
| transkrip | `{"bahasa": "id", "model": "large-v3", "backend": opsional}` |
| roto | `{"backend": "mediapipe" / "rembg" / "eksternal", "halus": 0.3}` |
| token_override | timpa token khusus proyek ini (hindari; lebih baik versi gaya baru) |
| terpakai, riwayat | diisi `arsip` |

## beat-sheet.json
```json
{
  "caption": { "aktif": true, "posisi": "bawah", "kecuali": ["hook", [20.0, 22.5]] },
  "beats": [
    { "id": "hook", "beat": "Hook", "mulai": 0, "selesai": 3.0, "elemen": [ … ] }
  ]
}
```
**Waktu**: detik, atau anchor `{"kata": "sertifikat", "ke": 1, "ujung": "mulai"|"selesai", "offset": -0.1}`,
atau `{"beat": "problem", "ujung": "selesai"}`. Elemen tanpa waktu mewarisi batas beat. `durasi` boleh ganti `selesai`.
Beat tanpa `mulai`/`selesai` menyambung ke beat sebelum/sesudahnya.

**Teks**: `*kata*` = warna aksen, `\n` = pindah baris.

| tipe | Field khusus |
|---|---|
| `judul` | teks, posisi (atas/tengah/bawah) atau x/y (0–1), lebar (0–1), ukuran, warna (nama token), `stroke` (true/px), `latar: "panel"`. Gaya ber-`motif.judul` → dirender E31 judul-gaya (efek teks khas gaya); `"efek_teks": false` atau x/y → judul PIL |
| `teks` | sama dengan judul; `peran`: isi/subjudul (default isi) |
| `kartu` | judul, teks, item[], penanda ("•"), stagger, posisi, lebar — panel dari token (kaca/solid) |
| `cta` | teks, posisi — chip warna aksen |
| `depth` | teks (≤2 kata); corak dari token `motif.depth` (gradien · padat · garis) atau `gradien`/`corak`; posisi DITATA OTOMATIS di atas kepala dari mask (dasar huruf tertutup ≤ 25 %, hindari teks lain, kecilkan/urutkan bila perlu); `y` = petunjuk tanpa mask, `tetap: true` = pakai `y` apa adanya — butuh roto |
| `gambar` | file (PNG), lebar, posisi |
| `info` | judul, sub, ikon (orang, hati, kalender, gambar, teks, video, ide, cek, …; daftar: `IKON` di render_panel.py), x/y atau posisi, lebar, opasitas (panel; naikkan di atas latar terang) — kartu kontekstual, taruh dekat bagian yang dibicarakan |
| `chip` | teks, status (benar · salah · nomor · info), nomor, x/y atau posisi — pil status/kuis/langkah |
| `transisi` | `efek` atau `jenis` (default = token `motif.transisi` gaya): blur-zoom (E26), zoom-tembus (E09), whip (E28), glitch (E29), celup (E30), kertas (E13, sapuan Remotion), coretan (E14); durasi — berpusat di `mulai` (titik potong) |
| `kamera` | `efek`: digital-zoom (ketukan[], skala[]), phone-mockup, frame-break, pull-back-reveal, vertigo, green-screen, snap-zoom, frame-escape, studio-reveal, paper-cutout; parameter token `kamera.<efek>` boleh ditimpa — mengolah rekaman (frame-break/vertigo/green-screen butuh roto) |
| `latar` | warna (nama token, default latar), opasitas, blur — cutaway kaca buram layar penuh di atas video; taruh paling awal di beat agar perangkat besar tampil tanpa menutupi wajah |
| `broll` | file, dari (detik sumber) — mengganti latar penuh. `jendela: true` / `efek: broll-overlay` → jendela PiP di atas rekaman (lebar, rasio, posisi/sisi atau x/y) |
| `push` | skala (default `gerak.push-in`), gerak (detik ramp), fokus [x, y], easing |
| `sfx` | file (nama bawaan whoosh/riser/pop atau path), db, offset |
| `remotion` | `efek` (modul ber-frontmatter `remotion`) atau `komposisi`; field lain diteruskan ke Composition (mis. judul, item, stagger, posisi, lebar); `kaca` (backdrop blur, default ikut `blur.panel`); `belakang: true` (overlay di balik subjek, butuh roto); `sfx_item` (bunyi per item). Komposisi cutaway (orbit, couch-wall, ui-world, headline-wall, paper-cut) otomatis jadi broll layar penuh. Butuh Node + `npm install` di remotion/. Lihat remotion/README.md |

Semua elemen (termasuk push & broll): `efek` = nama pendek modul di `efek/` (mis. `"checklist"`,
`"orbit@0.1"`). Nama tak dikenal ditolak saat beat-sheet dimuat; QA lalu mengecek aturan efek itu (durasi, stagger,
format klip broll) + checklist manualnya. Resep tiap efek: bagian "Di pipeline ini" di modulnya.

Semua elemen visual: `masuk` (naik/turun/geser/pop/fade/tidak), `keluar` (fade/naik/pop/tidak), `durasi_masuk`,
`durasi_keluar`, `easing`, `easing_keluar` (nama dari token), `sfx` (true = `sfx.transisi`, nama, objek, atau `false` = diam).

## Perangkat & efek native (Remotion, E01–E27)
`{"tipe": "remotion", "efek": "<nama>", …}` — prompt-ui, penghitung, terminal, coret, timeline, grid-variasi, form-ganti,
partikel, chart-grow, glass-type, cover-story, doodle-boil, aksen-gaya, judul-gaya, lower-third, langkah, sebelum-sesudah, callout, linimasa; cutaway: orbit, couch-wall, ui-world, headline-wall, paper-cut.
**Motif gaya** (token `motif`): `bingkai` (kaca, jendela, kinetik, hud, kertas, minimal, brutal, editorial, kolase, spidol, pensil) membentuk
jendela/kartu semua perangkat (remotion/src/lib/motif.tsx) DAN panel PIL (judul ber-panel, kartu, info, chip — render_panel.py `hias_panel`);
`aksen` (kilau, stabilo, garis, lingkar, target, selotip, arsir) menghias kata `*kunci*`; `tekstur`, `boil` (garis bergetar), `transisi`, `reveal`.
Font perangkat dimuat dari file token (remotion/public/fonts, disalin otomatis) → sama dengan render.py. Font Google (pipeline/fonts/, lisensi di lisensi/) termasuk variable font: token `wght` memilih berat. Jadwal gerak dihitung `perangkat.py` dan dipakai bersama oleh gambar & SFX; field tiap perangkat: modul efeknya.
Jendela mock UI memakai opasitas panel ≥ `perangkat.opasitas-min` (atau field `opasitas`). Partikel = dekoratif.

## Modul efek: param · props · slot · alias
Frontmatter efek boleh membawa `param` (bawaan efek kamera/transisi, ditimpa token `kamera.<efek>` lalu field elemen), `props` (bawaan props Remotion), `slot` (fungsi yang dilayani → kandidat generator slot) dan `alias` (nama lain untuk `efek`, mis. "dolly zoom" → vertigo). Efek baru tidak perlu menaikkan versi token platform.

## Koreografi (K09)
**v0.3 ber-slot**: elemen `{"slot": "<fungsi>", "isi": {…}, "mulai", "selesai"}` dirakit `slot.py` jadi perangkat konkret sesuai gaya
(kandidat per fungsi = token `slot`; efek dengan gaya di `gaya_cocok` = khas, bobot 3; seed → varian). Field `isi` generik:
judul, sub, teks, chip, status, nomor, kata (≤ 2 kata), item[], angka{ke, akhiran, label}, seri[], label_seri[], ganti[{label, lama, baru}],
perintah, app, hasil, anggapan, file, berita[], ikon, masthead, label, lampiran. Opsional: `kandidat` (batasi), `kecuali`, `wajib`.
Slot `transisi`/`reveal`/`kamera` khusus. `video.py cek` merakit tiap preset (seed 0–2) lalu mengecek K09.1–K09.4 + K09.6.
Koreografi berisi CONTOH isi nyata (bukan TODO) — ganti dengan isi videomu. `konteks_tambahan` (mis. depth-typography untuk
rotoscope) otomatis ikut ke manifest proyek & cek preset, jadi gaya apa pun bisa memakai koreografi itu.
Preset = gaya × koreografi (`koreografi/KOREO_NN_*.json`): urutan perangkat per bagian, tiap perangkat ber-`fungsi`
(hook, bukti, membantah, masalah, proses, langkah, kustomisasi, hasil, reveal, ringkasan, ajakan, konteks).
Aturan ritme dicek `video.py cek` (koreografi) dan QA (proyek): perangkat tidak berulang di beat berurutan, jumlah perangkat
berbeda ≥ variasi_min, transisi tidak di hook & ≤ 1 per beat.

## Loudness akhir (K06)
Setelah loudnorm, render mengukur ulang; bila meleset (video tanpa suara/musik) → koreksi gain + limiter oversampling 4×
sampai −14 LUFS & true-peak ≤ −1,5 dBTP (`audio.akhir` di layout.json).

## Suara (K08)
Elemen **tanpa** field `sfx` otomatis berbunyi menurut token `sfx.peta` (tipe elemen → {bunyi, kelas}); level per kelas
di `sfx.level`, varian bergilir, bunyi otomatis tidak menumpuk (`sfx.jarak-min`). Item kartu, prompt-ui (klik per huruf,
lampiran, kirim, ciut) dan chip benar/salah punya bunyi sendiri. Semua SFX dirakit jadi satu bus (`cache/sfx_bus.wav`).
Pustaka bunyi: `pipeline/scripts/sfx.py` — `python sfx.py` membuat semua bunyi + lembar dengar `pipeline/aset-bawaan/sfx/v2/_semua.wav`.
Bunyi: klik-ketik, tick, pop, ketuk, whoosh-pendek, whoosh-panjang, swoosh-balik, ding-benar, ding-salah, riser, hit, glitch.

## Caption
`caption.mode` di token gaya: `aktif` (kata yang diucapkan berwarna aksen) atau `karaoke` (kata berikutnya diredupkan `caption.redup`).
Selama teks kinetik (E51) tampil, caption disembunyikan otomatis: kata yang dibawakan teks kinetik dibuang dari caption, dan
sisanya hanya tampil bila masih terbaca (K01.5).

## Ketukan musik
Video bermusik latar otomatis sinkron dengan ketukannya (`ketukan.py`, `render_ketukan.py`). Ucapan tidak pernah digeser:
1. Grid ketukan: musik bawaan punya tempo pasti (`musik.BPM`); file musik dideteksi (onset + autokorelasi), ber-cache di
   `cache/ketukan.json`.
2. Titik mulai musik dipilih agar ketukan jatuh paling banyak di potongan berbobot (transisi & cutaway 3, efek kamera 2,
   judul/overlay/depth 1); musik diputar mulai dari ofset itu (`atrim`).
3. Potongan yang tinggal dekat ketukan digeser tepat ke ketukan (≤ 0,16 s untuk cutaway/transisi/efek kamera, ≤ 0,1 s untuk
   reveal); elemen yang mulai/berakhir di titik yang sama ikut. Musik < 100 BPM juga memakai ½ ketukan. Teks kinetik tidak digeser.
4. Riser berpuncak tepat di potongan masuk cutaway ≥ 2,5 s (jarak antar-riser ≥ 6 s).
Hasil di layout `ketukan` dan detail K06.3; ketukan dihitung titik sinkron sah di K05.5/K03.3. Beat-sheet:
`"ketukan": {"aktif": false}` mematikan; `toleransi`, `toleransi_potong`, `riser` dapat diatur.

## Zoom potong (E55)
Otomatis pada video berekaman: bingkai lebar ↔ rapat bergantian per kalimat, dipotong di awal kata pertama, berpusat di
wajah (lihat `efek/EFEK_55_zoom-potong_v0.1.md`). Beat-sheet `"zoom_potong": {"aktif": false}` mematikannya; field lain
(`skala`, `kalimat-min`, `jeda`) menimpa `param` modul dan token `kamera.zoom-potong`. Tercatat di layout `push` dengan
`potong: true`; K00.3 dan kontak-sheet mengukur wajah dalam ukuran yang tampil saat bingkai rapat.

## Struktur proyek
```
proyek/<id>/
  manifest.json  brief.md  naskah.md  beat-sheet.json  catatan.md
  aset/{rekaman,broll,grafis,audio}/
  cache/   ingest.mp4 audio.wav words.json words.srt masks/ *.meta.json   (tidak di-commit)
  out/     master.mov <id>_<platform>.mp4 layout.json qa-report.md qa.json terpakai.json still_*.png
```

## Menambah cek QA
1. Tulis aturan di tabel modul: `| K0N.n | pernyataan ya/tidak | otomatis |`.
2. Tambah fungsi `@cek("K0N.n")` di qa.py yang mengembalikan `(status, [detail])`, ukur dari layout.json/ffprobe.
3. Aturan otomatis tanpa fungsi akan muncul sebagai 🚧 BELUM DIIMPLEMENTASI di laporan.

## preset/*.json
| Field | Isi |
|---|---|
| _meta | id (= nama pendek `<gaya>-<format>`), versi, status, catatan |
| label, format | nama tampilan ("Kaca Gelap · Tips 30–45 s") & format (tips, explainer, teks, …) |
| deskripsi, kapan | ditampilkan `video.py preset` |
| gaya, template | `nama@versi` (dikunci) |
| efek | daftar `nama@versi` yang dipakai beat_sheet (dicek: semua terpakai) |
| butuh | `rekaman`, `roto` (= ada elemen depth), `remotion` (= ada elemen remotion) |
| aset | klip/grafis yang harus dibuat: `{file, efek, keterangan, rasio}` — `rasio` wajib untuk PNG (`gambar`) |
| manifest | digabung ke manifest proyek (platform, warna.filter, transkrip, roto, aset.rekaman, …) |
| beat_sheet | beat-sheet awal proyek |

`video.py cek` memvalidasi preset: gaya ∈ `gaya_cocok` template, `beat_wajib` lengkap, efek ada (info bila efek tidak
mencantumkan gaya preset di `gaya_cocok`), depth ↔ konteks depth-typography, remotion ↔ Composition, daftar `aset` =
file broll/gambar di beat_sheet, gambar muat tinggi zona aman (lebar × rasio), teks/judul di atas video punya
`stroke` atau `latar: "panel"` (K01.4), aturan video tanpa rekaman.

