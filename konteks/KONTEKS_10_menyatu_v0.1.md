---
id: K10
nama: menyatu
versi: 0.1
status: draft
bergantung_pada: [tokens/TOKEN_00_platform]
---

# K10 — Grafis Menyatu dengan Rekaman

## Tujuan
Grafis yang terlalu bersih, berwarna lepas dari rekaman, dan berbayangan ke arah yang salah terlihat "ditempel". Tiga
lapisan menyatukannya: butir film yang sama, grade rekaman ke palet gaya, dan bayangan grafis searah cahaya di rekaman.
Berlaku otomatis untuk setiap proyek (Proyek menambahkannya walau gaya/manifest lama tidak mencantumkan K10).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K10.1 | Grain film ditambahkan di komposit akhir (setelah caption & transisi), jadi rekaman dan grafis berbutir sama: derau di bagian rata grafis ≥ `qa.grain-rasio-min` × derau rekaman, diukur di master. | otomatis |
| K10.2 | Rekaman & b-roll di-grade ke palet gaya (token `grade`; klip grafis Remotion tidak): ΔE rata-rata ≥ `qa.grade-de-min` (terlihat) dan ΔE di wajah ≤ `qa.grade-wajah-de-maks` (kulit tetap wajar). | otomatis |
| K10.3 | Bayangan grafis (teks & panel PIL, motif Remotion, efek kamera) jatuh menjauhi sisi wajah yang terang; keyakinan rendah → arah bawaan token. | otomatis |
| K10.4 | Setelah ekspor: warna kulit wajar, grain tidak tampak kotak-kotak/berdenyut, bayangan tidak bertentangan dengan cahaya di rekaman. | manual |

## Parameter
`grain.*` (kekuatan = simpangan baku level 8-bit, ukuran = px butir, kroma, midtone), `grade.*` (kekuatan, kontras, saturasi,
suhu, angkat, `bayangan`/`sorot` = nama warna token untuk split-tone + kekuatannya), `cahaya.*` (sampel, asimetri-penuh,
sudut-maks, keyakinan-min, sudut-batas), `bayangan.offset`, `qa.grain-rasio-min`, `qa.grade-de-min`, `qa.grade-wajah-de-maks`.
Bawaan di TOKEN_00, nilai khas per gaya di token gaya.

Per proyek (beat-sheet, menimpa token): `"grain": {"aktif": false}` / `{"kekuatan": 2}`, `"grade": {"aktif": false}` /
`{"kekuatan": 0.5, "suhu": 0.2}`, `"bayangan": {"aktif": false}` (offset token apa adanya) / `{"sudut": -25}` (manual,
derajat dari lurus ke bawah, + = ke kanan). `manifest.warna.filter` tetap untuk koreksi exposure/white balance di ingest
(K04.3); grade K10.2 diterapkan sesudahnya, saat render.

## Cara kerja
- Arah cahaya: median (terang kanan − kiri)/(kanan + kiri) pipi & dahi di `cahaya.sampel` frame (cache/wajah.json);
  tanpa wajah → sepertiga kiri vs kanan bingkai (keyakinan ×½). Sudut bayangan = −`sudut-maks` × asimetri/`asimetri-penuh`.
  Keyakinan = kesepakatan tanda antar-frame × kekuatan asimetri. Cache: cache/cahaya.json.
- Token `bayangan.offset` diputar sebesar sudut itu (panjang tetap, sudut akhir ≤ `sudut-batas`) sebelum sprite & props
  Remotion dibangun; `bayangan.putar` membawa putaran ke bayangan yang ditulis di komposisi Remotion (lib/cahaya.ts).
- Hasil di layout `menyatu` (grain, grade + ΔE terukur, bayangan).

## Contoh
Wajah lebih terang di sisi kanan bingkai (jendela di kanan) → offset glass-tech [0, 10] menjadi ±[−6, 8]: bayangan kartu
jatuh ke kiri-bawah, sama dengan bayangan hidung di rekaman.

## Anti-contoh
Grafis kaca jernih tanpa butir di atas rekaman ponsel yang berderau; rekaman hangat oranye di bawah panel biru dingin
tanpa jembatan warna; bayangan kartu ke kanan sementara cahaya juga datang dari kanan.

## Bukti uji
Belum ada.
