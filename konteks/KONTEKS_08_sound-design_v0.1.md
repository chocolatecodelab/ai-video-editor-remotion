---
id: K08
nama: sound-design
versi: 0.1
status: draft
bergantung_pada: [platform@0.2]
---

# K08 — Sound design (SFX motion)

## Tujuan
Setiap gerak terasa "nyata" karena berbunyi — pelan, bervariasi, dan tidak menutupi suara. Referensi: bunyi klik saat
mengetik, whoosh saat elemen berpindah/menyusut, ding saat kuis benar/salah, pop lembut saat kartu muncul.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| K08.1 | Setiap elemen visual yang masuk dengan gerak punya bunyi (otomatis dari `sfx.peta` atau eksplisit). Diam hanya bila disengaja (`"sfx": false`). | otomatis |
| K08.2 | Dua bunyi (selain klik ketik) berjarak ≥ `sfx.jarak-min` detik — tidak menumpuk. | otomatis |
| K08.3 | Level tiap bunyi ≤ −16 dB terhadap suara (kelas `sfx.level`); bus SFX tidak clipping. | otomatis |
| K08.4 | Bunyi berulang memakai varian bergilir (tidak identik berturut-turut). | otomatis |
| K08.5 | Karakter bunyi cocok dengan gaya & gerak (lembut untuk kaca/kertas/lofi, tajam untuk brutal/HUD/kinetik). | manual |
| K08.6 | Didengar dengan headphone: tidak ada bunyi yang terasa murahan, terlambat, atau mengganggu kalimat penting. | manual |

## Parameter
`sfx.otomatis`, `sfx.peta` (tipe elemen → {bunyi, kelas}), `sfx.level` (dB per kelas), `sfx.jarak-min`,
`sfx.push-gerak-maks`, `ketik.*`. Pustaka bunyi: `pipeline/scripts/sfx.py` (`python sfx.py` → lembar dengar).

## Bukti uji
Belum ada.
