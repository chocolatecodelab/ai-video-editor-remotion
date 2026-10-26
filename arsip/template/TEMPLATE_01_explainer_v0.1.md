---
id: T01
nama: explainer
versi: 0.1
status: draft
durasi: [60, 90]
rasio: 9:16
hook_maks: 3.5
gaya_cocok: [glass-tech, bold-kinetic]
beat_wajib: [hook, konteks, poin-1, ringkasan, cta]
---

# T01 — Template: Explainer (talking head)

## Kapan dipakai
Menjelaskan satu konsep dalam 2–3 poin, pembicara di depan kamera, 60–90 detik.

## Struktur beat
| id | Beat | Durasi | Isi | Visual | Elemen |
|---|---|---|---|---|---|
| hook | Hook | 0–3s | Pertanyaan/klaim yang memancing | talking head + judul, push-in | judul, depth (opsional) |
| konteks | Konteks | 3–15s | Kenapa ini penting | talking head + caption | caption |
| poin-1 | Poin 1 | ±15s | Poin + contoh | kartu / B-roll | kartu |
| poin-2 | Poin 2 | ±15s | Poin + contoh | kartu / B-roll | kartu |
| poin-3 | Poin 3 (opsional) | ±15s | Poin + contoh | kartu / B-roll | kartu |
| ringkasan | Ringkasan | 5–8s | 1 kalimat inti | kartu daftar (stagger) | kartu |
| cta | CTA | akhir 3–5s | Satu ajakan | talking head + cta | cta |

## Aturan naskah
- 2,3–2,8 kata per detik (bahasa Indonesia santai).
- Kalimat ≤ 15 kata; satu ide per kalimat.
- Hook selesai diucapkan ≤ 3 detik.

## Checklist QA
| ID | Aturan | Cek |
|---|---|---|
| T01.1 | Semua `beat_wajib` ada di beat-sheet. | otomatis |
| T01.2 | Durasi akhir 60–90 s (± `qa.durasi-toleransi-s`). | otomatis |
| T01.3 | Beat hook berakhir ≤ `hook_maks` detik. | otomatis |
