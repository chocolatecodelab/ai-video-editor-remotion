---
id: K09
nama: koreografi
versi: 0.1
status: draft
bergantung_pada: [platform@0.3]
---

# K09 — Koreografi (ritme perangkat motion)

## Tujuan
Mencegah video "AI slop": kerangka yang sama tiap beat dengan kulit berbeda. Referensi yang terasa profesional
memakai perangkat motion BERBEDA tiap bagian, dan tiap perangkat dipilih karena ISI kalimatnya (prompt saat bicara
prompt, lapisan saat menjelaskan lapisan, angka saat memberi bukti).

## Peta fungsi → perangkat (titik awal, bukan aturan kaku)
| Fungsi kalimat | Perangkat yang cocok |
|---|---|
| hook | prompt-ui, penghitung, judul + push, depth |
| bukti | penghitung, grid-variasi, info (angka/sumber) |
| membantah / mitos | coret, chip salah |
| masalah | info (dekat bagian tubuh/objek), chip info |
| proses | timeline, terminal |
| langkah | terminal, chip nomor, kartu |
| kustomisasi | form-ganti |
| hasil | grid-variasi, chip benar, penghitung |
| reveal | partikel, transisi blur-zoom |
| ajakan | cta (+ partikel) |

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K09.1 | Perangkat yang sama (efek remotion / info / chip-<status> / kartu / …) tidak dipakai di dua beat berurutan. | otomatis |
| K09.2 | Jumlah perangkat berbeda per video ≥ `koreografi.variasi-min` (atau `variasi_min` koreografi yang dipakai). | otomatis |
| K09.3 | Transisi (blur-zoom) tidak di beat hook dan maksimal 1 per beat. | otomatis |
| K09.4 | Tiap perangkat mencantumkan `fungsi` dari daftar `koreografi.fungsi` (alasan perangkat ini dipakai). | otomatis |
| K09.5 | Ditonton tanpa suara: tiap bagian terasa berbeda secara visual, dan perangkatnya menjelaskan isi kalimat. | manual |

## Parameter
`koreografi.variasi-min`, `koreografi.fungsi`, `koreografi.bukan-perangkat`. Koreografi siap pakai: folder `koreografi/`.

## Bukti uji
Belum ada.
