---
id: K06
nama: audio
versi: 0.1
status: draft
bergantung_pada: [tokens/TOKEN_00_platform]
---

# K06 — Audio & Sound Design

## Tujuan
Suara jelas dan keras-lembutnya setara dengan konten lain di feed; SFX mendukung, tidak mengganggu.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K06.1 | Loudness terintegrasi hasil akhir = `audio.lufs` ± `audio.lufs-toleransi` (−14 LUFS untuk media sosial). | otomatis |
| K06.2 | True peak ≤ `audio.true-peak` dBTP. | otomatis |
| K06.3 | Whoosh/riser pada transisi di level `sfx.level-db` (rendah); musik di-duck terhadap suara (sidechain). | otomatis (render) |
| K06.4 | Tidak ada clipping, napas keras, atau noise yang terdengar di HP. | manual |

## Parameter
`audio.*`, `sfx.*`.

## Bukti uji
Belum ada.
