---
id: E16
nama: cover-story
versi: 0.2
status: draft
durasi: [3, 4]
stagger: null
dukungan: native
remotion: CoverStory
gaya_cocok: [kertas-tipografi, bold-kinetic, retro-brutalism, kolase-kertas, minimalism]
konteks_terkait: [zona-aman, gerak]
alias: [magazine cover, sampul majalah]
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

## Di pipeline ini (dukungan: native)
Native: overlay Remotion `CoverStory` — masthead raksasa, baris sampul, judul utama, edisi, barcode. `bagian: "masthead"` + `"belakang": true` menaruh masthead di balik kepala (mask roto).

```json
{ "tipe": "remotion", "efek": "cover-story", "masthead": "KREATOR", "judul_utama": "Rahasia *retensi*", "baris": ["3 hook", "audio jernih"] }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E16.1 | Durasi elemen ber-`efek: cover-story` dalam rentang `durasi` (3–4 s). | otomatis |
| E16.4 | Hasil sesuai elemen visual & tips: Batasi maksimal 2 font; jadikan satu elemen sebagai fokus utama. | manual |

## Bukti uji
Belum ada.
