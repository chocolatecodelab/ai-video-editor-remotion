---
id: K09
nama: koreografi
versi: 0.2
status: draft
bergantung_pada: [platform@0.4]
---

# K09 — Koreografi (ritme perangkat motion)

## Tujuan
Mencegah video "AI slop": kerangka yang sama tiap beat dengan kulit berbeda. Referensi yang terasa profesional
memakai perangkat motion BERBEDA tiap bagian, dan tiap perangkat dipilih karena ISI kalimatnya (prompt saat bicara
prompt, lapisan saat menjelaskan lapisan, angka saat memberi bukti).

## Slot per fungsi (v0.2)
Koreografi v0.3 menulis **slot** (fungsi + isi generik), bukan efek tertentu. Generator `pipeline/scripts/slot.py` memilih
satu kandidat per slot dari token `slot.<fungsi>` (platform) yang:
1. isinya cukup (penghitung butuh `angka`, timeline butuh ≥ 3 `item`, coret butuh `anggapan`, …),
2. muat di durasi slot (rentang `durasi` modul efek; dipotong ke maksimum),
3. cocok dengan gaya — `gaya_cocok` efek kosong = universal (bobot 1), berisi gaya ini = **khas** (bobot 3), lainnya ditolak,
4. tidak sama dengan perangkat beat sebelumnya (K09.1); yang sudah dipakai diberi bobot kecil (variasi).
Slot khusus: `transisi` → token `motif.transisi` gaya · `reveal` → `motif.reveal` (aksen-gaya / partikel) ·
`kamera` → efek pada rekaman (digital-zoom, vertigo, phone-mockup, pull-back-reveal, frame-break, green-screen).
Seed (`--seed`, preset `"seed"`) menentukan pilihan → seed sama = hasil sama; lihat varian: `video.py varian <preset> --n 5`.

| Fungsi | Kandidat (token slot) |
|---|---|
| hook | chip, glass-type, cover-story, prompt-ui, doodle-boil, info |
| konteks | info, couch-wall, ui-world, orbit, paper-cut, headline-wall |
| masalah | info, chip-salah, coret, doodle-boil |
| membantah | coret, form-ganti, chip-salah |
| bukti | penghitung, chart-grow, grid-variasi, headline-wall, info |
| proses | terminal, timeline, ui-world, checklist |
| langkah | checklist, terminal, timeline, info, chip |
| kustomisasi | form-ganti, grid-variasi |
| hasil | chip-benar, glass-type, checklist, info, depth |
| ringkasan | checklist, timeline, info |
| ajakan | cta |

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K09.1 | Perangkat yang sama (efek remotion / info / chip-<status> / kartu / …) tidak dipakai di dua beat berurutan. | otomatis |
| K09.2 | Jumlah perangkat berbeda per video ≥ `koreografi.variasi-min` (atau `variasi_min` koreografi yang dipakai). | otomatis |
| K09.3 | Transisi (jenis apa pun) tidak di beat hook dan maksimal 1 per beat. | otomatis |
| K09.4 | Tiap perangkat mencantumkan `fungsi` dari daftar `koreografi.fungsi` (alasan perangkat ini dipakai). | otomatis |
| K09.5 | Ditonton tanpa suara: tiap bagian terasa berbeda secara visual, dan perangkatnya menjelaskan isi kalimat. | manual |
| K09.6 | Video memakai ≥ `koreografi.khas-min` (2) efek KHAS gaya (modul efek mencantumkan gaya di `gaya_cocok`; termasuk transisi & kamera) — preset tidak boleh terasa seperti gaya lain yang diganti warnanya. | otomatis |

## Parameter
`koreografi.variasi-min`, `koreografi.fungsi`, `koreografi.bukan-perangkat`, `koreografi.khas-min`, `koreografi.tutup-wajah-maks`, `slot.*`, `motif.*` (token gaya). Koreografi siap pakai: folder `koreografi/`.

## Bukti uji
Belum ada.
