---
id: E01
nama: orbit
versi: 0.2
status: draft
durasi: [3, 5]
stagger: null
dukungan: native
remotion: Orbit
gaya_cocok: [glass-tech, apple-glass, kaca-gelap, arang-lime, rts-modern, bold-kinetic]
konteks_terkait: [zona-aman]
alias: [orbit]
---

# E01 — Efek: Orbit

**Deskripsi:** Kamera atau objek berputar mengelilingi subjek utama dalam lintasan melingkar (360° atau sebagian).

**Kapan dipakai:** Memamerkan produk, karakter, atau objek dari semua sisi; intro yang dramatis.

## Elemen visual
- Subjek di tengah (produk/orang/logo 3D)
- Latar polos atau gradien
- Elemen pendukung (teks, ikon) ikut mengorbit dengan kecepatan berbeda (efek parallax)

## Timing
3 - 5 detik, rotasi halus dan konstan, ease-in-out di awal dan akhir.

## Prompt
> Smooth 360-degree orbit camera around a [subjek] centered in frame, soft studio lighting, clean [warna] background, subtle depth of field, slow and cinematic motion.

## Tips
Tambah bayangan lantai dan refleksi agar terasa 3D. Di After Effects: gunakan 3D layer + camera null rotate.

## Di pipeline ini (dukungan: native)
Native: klip cutaway Remotion `Orbit` (latar gaya + kartu pusat + chip satelit mengorbit, parallax depan/belakang, bayangan lantai & pantulan) dirender lalu **masuk sebagai broll** otomatis. Klip AI (pakai **Prompt**) tetap bisa: `tipe: broll` + `file`.

```json
{ "tipe": "remotion", "efek": "orbit", "pusat": "Reel *Kit*", "sub": "satu workflow", "satelit": ["Caption", "SFX", "B-roll"], "mulai": 4.0, "selesai": 8.0 }
```

Dipilih otomatis oleh generator slot (slot.py) bila gaya proyek ada di `gaya_cocok` (kosong = semua gaya).

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E01.1 | Durasi elemen ber-`efek: orbit` dalam rentang `durasi` (3–5 s). | otomatis |
| E01.2 | Klip broll efek ini: rasio = proyek, resolusi ≥ `format.resolusi`, fps = `format.fps`. | otomatis |
| E01.4 | Hasil sesuai elemen visual & tips: Tambah bayangan lantai dan refleksi agar terasa 3D. Di After Effects: gunakan 3D layer + camera null rotate. | manual |

## Bukti uji
Belum ada.
