# remotion/ — mesin render motion graphics (React)

Bagian hibrid video-system:

| Python (pipeline/scripts) | Remotion (di sini) |
|---|---|
| ingest, transkrip, roto, timing (anchor kata), komposit akhir, audio, ekspor, QA | elemen motion yang sulit di Python: centang tergambar, chart, light sweep, layout kompleks |

## Alur
1. Beat-sheet: `{"tipe": "remotion", "efek": "checklist", …}` (atau `"komposisi": "Checklist"` langsung).
2. render.py menyusun props → `remotion_jembatan.render_overlay()` → `render-server.mjs` (satu proses Node per run
   pipeline: bundle webpack sekali, di-cache di `.bundle/<kunci>`, + satu browser untuk semua overlay) →
   overlay ProRes 4444 ber-alpha, ruang warna **bt709 bertanda**, di `proyek/<id>/cache/remotion/<Komposisi>-<hash>.mov`.
   Hash = props + isi `src/` + package-lock + render-server.mjs → revisi hanya me-render ulang overlay yang berubah.
   Setelan render (codec, alpha, warna) ada di `render-server.mjs`; `remotion.config.ts` hanya berlaku untuk CLI/Studio.
   Log server: `.bundle/server.log`.
3. render.py mengkomposit overlay per frame (+ backdrop blur bila `kaca`, karena Remotion tidak melihat video),
   mengukur kotak elemen dari alpha (≥ 50%) dan kontras dari latar efektif → `out/layout.json` → QA.

## Kontrak props (`src/lib/kontrak.ts`)
```
W, H, fps, durasiFrame, skala, zona [x0,y0,x1,y1],
tokens   : token GABUNGAN proyek (platform + gaya dari manifest) → ganti gaya tanpa ubah kode
elemen   : field elemen beat-sheet + durasi_masuk, durasi_keluar, easing, easing_keluar, masuk, keluar, posisi
           (+ item, stagger). masuk/keluar = jenis gerak (naik/turun/geser/pop/fade/tidak) dari elemen atau token gerak.*-default
```
Aturan komponen (bersama skill resmi `remotion-best-practices` di `.claude/skills/`):
- Semua warna/font/ukuran/easing dari `props.tokens`, ukuran dikali `skala`. Tidak ada angka gaya di kode.
- Gerak lewat `useCurrentFrame()` + `interpolate()` ber-clamp dengan easing token (`kurva(t, "standar"|"tegas"|"keluar")`,
  `naik()` dari `pakaiDasar`). Tidak ada gerak linear (K05.1) kecuali disengaja dan diberi komentar (mis. push-in kamera).
  Tanpa CSS `transition`/`animation`; acak lewat `random(seed)`.
- Animasi skala lewat `skalaPersepsi(p, dari, ke)` (lib/kontrak.ts, `output: "perceptual-scale"`), kecuali mulai dari 0.
- Perangkat dibungkus `<Wadah wadah={wadah}>` (atau `<SediaMotif wadah={wadah}>`) dari `pakaiDasar`: komponen tingkat modul,
  jangan mendefinisikan komponen di dalam hook/render (dibongkar-pasang tiap frame). `<Wadah>` menjalankan masuk/keluar
  dengan rumus yang SAMA dengan Animator Python (`render_dasar.py`), jadi perangkat masuk seperti judul/kartu gaya itu.
  Composition yang menganimasikan masuknya sendiri (JudulGaya, LiquidGlass) memanggil `pakaiDasar(props, pos, { masukSendiri: true })`.
- Gerak diam (terus bergerak setelah masuk) hanya bila: inti efeknya (orbit, kertas stop-motion), motif gaya (HUD pindai,
  `boil` lewat `pakaiBoil`, hiasan judul dari token), atau latar layar penuh. Bukan denyut/napas/kedip pada elemen UI biasa;
  penarik perhatian cukup berdenyut terbatas lalu diam (Callout: 2 denyut).
- Waktu yang juga dipakai bunyi (SFX) atau QA berasal dari `elemen.jadwal` (perangkat.py) — gambar tiba tepat di detik itu.
- Latar transparan; elemen di dalam `zona` (zona aman). Waktu internal ikut `elemen` (sudah di-resolve Python).
- Jangan `background-image: url(…)` (tidak ditunggu Remotion) — tekstur pakai `<LapisTekstur>` (lib/motif.tsx).
- Font token gagal dimuat saat render = render dihentikan (lib/font.ts), bukan diam-diam memakai font cadangan.
- Bila teks memakai peran ukuran/warna lain dari `isi` + `teks-utama`/`aksen`, daftarkan di
  `KONTRAK_TEKS` (pipeline/scripts/render_perangkat.py) agar QA K01.4/K01.8 mengecek yang benar.

## Menambah Composition
1. `src/compositions/Nama.tsx` (pakai `PropsDasar<E>`, `pakaiDasar`, `kurva`, `skalaPersepsi`, `warna`, `rgba`, `<Teks>`
   dari `src/lib/`; ikuti skill `remotion-best-practices` + aturan di atas).
2. Daftarkan di `src/Root.tsx` dengan `calculateMetadata={dariProps<Props>()}` + `defaultProps` untuk Studio.
3. Modul efek terkait: frontmatter `remotion: Nama`, `dukungan: native`, naikkan versi modul.
4. `npm run cek-tipe` + `npm run lint` lalu `.venv\Scripts\python pipeline/scripts/video.py cek` (memastikan Composition terdaftar).

| Composition | Efek | Catatan |
|---|---|---|
| Checklist | E07 checklist@0.2 | centang tergambar 0,3 s + bounce, stagger dari elemen; `sfx_item` di beat-sheet |
| Uji | — | uji instalasi |

## Perintah
```
cd remotion
npm install          # sekali; lokal di node_modules/ (tidak global)
npm run studio       # pratinjau interaktif (defaultProps glass-tech)
npm run cek-tipe     # TypeScript
npm run lint         # ESLint + aturan resmi Remotion (@remotion/eslint-plugin)
```
Versi semua paket `remotion`/`@remotion/*` harus sama persis (`npx remotion versions`).
Lisensi: gratis untuk individu & perusahaan ≤ 3 orang; selain itu butuh company license (remotion.dev/license).
