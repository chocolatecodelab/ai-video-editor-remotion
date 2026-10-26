---
id: E18
nama: prompt-ui
versi: 0.1
status: draft
durasi: null
stagger: null
dukungan: native
remotion: PromptUI
gaya_cocok: []
konteks_terkait: [zona-aman, sound-design]
---

# E18 — Efek: Prompt UI (mengetik)

**Deskripsi:** Kotak prompt ala aplikasi AI/terminal: label seri di atas, chip lampiran, teks diketik huruf per huruf
dengan kursor berkedip, tombol kirim menyala, lalu kotak menyusut menjadi pil berisi kata kunci.

**Kapan dipakai:** Hook "1 hari 1 prompt", tutorial perintah/command, memperkenalkan istilah, menunjukkan input ke AI/tools.

## Elemen visual
- Label kecil di atas kotak (seri/episode)
- Kotak panel (token gaya: kaca/solid), chip file lampiran kanan atas
- Teks diketik, kata `*aksen*` berwarna aksen; kursor tegak berkedip
- Baris bawah: ikon + titik "mengetik", tombol kirim bulat
- Opsional: menyusut (morph) menjadi pil kata kunci

## Timing
Kecepatan ketik `ketik.cps` (default 22 huruf/detik). Durasi minimum = masuk + jeda + huruf/cps + kirim (+ ciut + tahan) + keluar;
render menolak dengan pesan jelas bila elemen terlalu pendek.

## Di pipeline ini (dukungan: native — Remotion)
Composition `PromptUI` (remotion/src/compositions/PromptUI.tsx). Jadwal tiap huruf dihitung render.py dan dikirim ke
Remotion; SFX memakai jadwal yang sama (K08): `prompt-masuk`, `prompt-lampiran`, klik per huruf (`prompt-ketik`),
`prompt-kirim`, `prompt-ciut` dari token `sfx.peta`.

```json
{ "tipe": "remotion", "efek": "prompt-ui", "label": "1 Hari 1 Kata Prompt · #4",
  "teks": "Editkan, pakai *rotoscope*.", "lampiran": "video-kamu.mp4", "posisi": "atas",
  "mulai": 0.2, "selesai": 6.4, "ciut": true, "kata_ciut": "rotoscope" }
```
Field opsional: `cps`, `ciut` (default true), `kata_ciut` (default kata beraksen pertama), `lebar`, `label`, `lampiran`.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E18.2 | Bila memakai klip broll: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E18.4 | Teks yang diketik terbaca utuh sebelum kotak menyusut; kata kunci di pil sama dengan kata yang disorot. | manual |

## Bukti uji
Belum ada.
