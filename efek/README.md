# Efek — pustaka motion design

Efek = pola gerak 1–6 detik yang dipasang pada **satu beat/elemen** (bukan identitas visual = gaya, bukan
struktur cerita = template). Dipakai di beat-sheet lewat field `"efek": "<nama>"` pada elemen mana pun:

```json
{ "tipe": "kartu", "efek": "checklist", "item": ["…", "…", "…"], "stagger": 0.8 }
{ "tipe": "broll", "efek": "orbit", "file": "aset/broll/orbit.mp4" }
```

QA lalu memuat modul efek yang dipakai dan mengecek aturannya (durasi, stagger, format klip) + checklist manual.

## Tingkat dukungan
| Dukungan | Arti | Efek |
|---|---|---|
| native (Remotion) | Composition Remotion; overlay alpha atau klip cutaway → broll otomatis | checklist, chart-grow, glass-type, cover-story, doodle-boil, prompt-ui, penghitung, terminal, coret, timeline, grid-variasi, form-ganti, partikel, aksen-gaya; cutaway: orbit, couch-wall, ui-world, headline-wall, paper-cut |
| native (render.py) | `tipe: kamera` (mengolah rekaman) atau `tipe: transisi` | kamera: digital-zoom, phone-mockup, frame-break, pull-back-reveal, vertigo, green-screen · transisi: blur-zoom, zoom-through-cut, whip, glitch, celup (+ sapuan paper-cut / doodle-boil) |
| eksternal (opsional) | klip AI/After Effects dari **Prompt** modul → `broll` + `file` (menggantikan versi native) | semua efek yang punya bagian Prompt |

`gaya_cocok` kosong = semua gaya; berisi = efek itu KHAS gaya tersebut dan hanya dipilih generator slot untuk gaya itu (K09.6).

## Panduan umum (dari pustaka sumber) vs aturan sistem
| Parameter | Pustaka sumber | Yang berlaku di sistem ini |
|---|---|---|
| Frame rate | 24 sinematik / 30 umum / 60 UI | `format.fps` proyek (default 30). Klip eksternal harus sama (aturan ENN.2); efek 12 fps (paper-cut, doodle-boil) di-posterize di dalam klip, bukan mengubah fps proyek. |
| Resolusi | 1080×1920 / 1920×1080 / 4K | `format.resolusi` (1080×1920). Klip boleh lebih besar, rasio harus sama. |
| Easing default | cubic-bezier(0.65, 0, 0.35, 1) | Easing dari token gaya (`easing.standar`, `easing.tegas`). Kurva sumber = referensi untuk klip eksternal. |
| Durasi per efek | 2–6 s | `durasi` di frontmatter tiap modul efek (dicek QA). |
| Safe area | margin 5–8% dari tepi | Zona aman platform K00 (atas 250, bawah 400, kiri 60, kanan 120 px) — lebih ketat, dan yang berlaku. |

## Menambah efek
Salin `_TEMPLATE.md` → `EFEK_NN_nama_v0.1.md`, isi, daftarkan di INDEX.md, jalankan `video.py cek`.
Efek "sebagian/eksternal" yang sering dipakai (≥2 proyek) → kandidat dibuat native di render.py, lalu naikkan versi modulnya.
