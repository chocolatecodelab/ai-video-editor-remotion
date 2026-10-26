---
id: E16
nama: cover-story
versi: 0.1
status: draft
durasi: [3, 4]
stagger: null
dukungan: sebagian
gaya_cocok: [bold-kinetic]
konteks_terkait: [zona-aman, gerak]
---

# E16 — Efek: Cover Story

**Deskripsi:** Layout bergaya sampul majalah: judul besar, subjudul, foto utama, dan teks kecil yang tertata editorial.

**Kapan dipakai:** Intro video, thumbnail bergerak, opening seri, atau highlight tema utama.

## Elemen visual
- Masthead (nama channel/brand) di atas
- Headline besar bergaya serif/sans tebal
- Foto subjek, nomor edisi, barcode, teks kecil ala majalah

## Timing
3 - 4 detik; elemen masuk berurutan: foto → judul → detail kecil.

## Prompt
> A magazine cover layout animating in: bold masthead, large headline, hero photo, small editorial text and issue number, elegant typography, subtle paper texture, slow push-in.

## Tips
Batasi maksimal 2 font; jadikan satu elemen sebagai fokus utama.

## Di pipeline ini (dukungan: sebagian)
Sebagian native: `gambar` (foto utama) → `judul` (masthead/headline) → `teks` kecil, masuk berurutan lewat `mulai` bertahap + `push` pelan.
Belum native: font serif kedua, barcode, tekstur kertas.

```json
{ "tipe": "gambar", "efek": "cover-story", "file": "aset/grafis/foto.png", "mulai": 0.0 },
{ "tipe": "judul", "efek": "cover-story", "teks": "JUDUL *UTAMA*", "posisi": "atas", "mulai": 0.4 },
{ "tipe": "teks", "efek": "cover-story", "teks": "Edisi 01", "posisi": "bawah", "mulai": 0.9 }
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E16.1 | Durasi elemen ber-`efek: cover-story` dalam rentang `durasi` (3–4 s). | otomatis |
| E16.4 | Hasil sesuai elemen visual & tips: Batasi maksimal 2 font; jadikan satu elemen sebagai fokus utama. | manual |

## Bukti uji
Belum ada.
