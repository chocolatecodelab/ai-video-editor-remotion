---
id: E55
nama: zoom-potong
versi: 0.1
status: draft
durasi: [0.8, 30]
stagger: null
dukungan: native
gaya_cocok: []
konteks_terkait: [zona-aman, parallax-push]
alias: [zoom cut, jump zoom, punch-in otomatis]
slot: []
param: {skala: 1.12, kalimat-min: 1.2, jeda: 0.45}
---

# E55 — Efek: Zoom Potong (punch-in otomatis)

**Deskripsi:** Bingkai talking-head berganti lebar ↔ rapat secara bergantian per kalimat. Ganti bingkainya seketika,
tepat di awal kata pertama kalimat, berpusat di wajah. Hasilnya terasa seperti video yang direkam dua kamera.

**Kapan dipakai:** Otomatis di setiap video dengan rekaman. Teknik ini cara paling murah membuat talking-head tidak
monoton tanpa menutup wajah.

## Elemen visual
- Bingkai lebar (rekaman asli) dan bingkai rapat (skala `skala`, berpusat di tengah wajah dari cache/wajah.json)
- Tanpa gerak transisi dan tanpa bunyi: perubahannya adalah potongan, bukan zoom bergerak

## Timing
- Satu kalimat = satu bingkai. Kalimat dipecah di tanda akhir kalimat atau jeda > `jeda` detik.
- Kalimat < `kalimat-min` detik digabung dengan kalimat sesudahnya ("Keep learning. Keep growing." = satu bingkai),
  jadi tidak ada potongan beruntun.
- Bingkai berakhir saat cutaway, efek kamera, transisi, teks depth, PiP atau push manual dimulai. Satuan yang dimulai
  di dalamnya tetap lebar. Sesudahnya pola dimulai dari bingkai rapat (penonton kembali ke wajah dengan bingkai baru).

## Prompt
> Talking-head edit alternating between a wide and a tight framing on each new sentence, hard cut on the first word,
tight shot centered on the face, no zoom motion.

## Tips
Skala 1,08–1,15 terbaca sebagai "kamera kedua". Di atas 1,15 terlihat seperti zoom digital dan kualitas gambar turun.

## Di pipeline ini (dukungan: native)
Otomatis (render.py `_zoom_potong`, perencana `zoom_potong.py`); tidak perlu elemen di beat-sheet. Bingkai rapat
manual tetap bisa ditulis sebagai push tanpa gerak:

```json
{ "tipe": "push", "efek": "zoom-potong", "mulai": {"kata": "…"}, "durasi": 2.4, "skala": 1.12, "gerak": 0 }
```

Parameter otomatis: `param` modul < token `kamera.zoom-potong` < beat-sheet `zoom_potong`. Matikan dengan:

```json
{ "zoom_potong": { "aktif": false } }
```

Teks UI tidak ikut terskala (seperti push). Rentang bingkai rapat tercatat di layout.json `push` dengan `potong: true`.
Aturan K03 (push bergerak) tidak berlaku untuknya.

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E55.5 | Skala bingkai rapat ≤ 1,15, dimulai tepat di awal kata, dan tidak bertumpuk dengan cutaway, efek kamera atau transisi. | otomatis |
| E55.4 | Potongan terasa sebagai ganti kamera: wajah tetap utuh di sepertiga atas, tidak ada potongan di tengah kata. | manual |

## Bukti uji
Belum ada.
