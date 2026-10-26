---
id: TNN
nama: TODO-nama-pendek
versi: 0.1
status: draft
durasi: [30, 45]
rasio: 9:16
hook_maks: 3.5
gaya_cocok: []
beat_wajib: [hook, cta]
---

# TNN — Template: TODO

## Kapan dipakai
1–2 kalimat.

## Struktur beat
`id` beat di tabel ini harus sama dengan `id` di beat-sheet.json (dicek QA, aturan TNN.1).

| id | Beat | Durasi | Isi | Visual | Elemen |
|---|---|---|---|---|---|
| hook | Hook | 0–3s | | | judul |
| cta | CTA | akhir 3–5s | | | cta |

## Aturan naskah
Panjang kalimat, gaya bahasa, kata per detik.

## Checklist QA
| ID | Aturan | Cek |
|---|---|---|
| TNN.1 | Semua `beat_wajib` ada di beat-sheet. | otomatis |
| TNN.2 | Durasi akhir dalam rentang `durasi` (± `qa.durasi-toleransi-s`). | otomatis |
| TNN.3 | Beat hook berakhir ≤ `hook_maks` detik. | otomatis |
