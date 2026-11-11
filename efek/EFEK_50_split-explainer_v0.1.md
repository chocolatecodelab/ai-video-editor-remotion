---
id: E50
nama: split-explainer
versi: 0.1
status: draft
durasi: [3, 8]
stagger: null
dukungan: native
remotion: SplitExplainer
gaya_cocok: [glass-tech, apple-glass, arang-lime, bold-kinetic, minimalism, retro-brutalism]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [split explainer, 50-50 split, numbered takeaways, editorial split]
slot: [penjelasan, langkah, takeaways, ringkasan, aturan]
---

# E50 — Efek: Split Explainer (50/50 Editorial Numbered Takeaways)

**Deskripsi:** Pembagian layar 50/50 vertikal di mana paruh atas menjadi kanvas studio matte gelap untuk poin editorial dan paruh bawah membingkai penutur (*talking head*):
- **Overline Kategori:** Teks pelacak berjarak lebar (*uppercase tracking*) seperti "CARANYA", "STRATEGI", "3 ATURAN UTAMA".
- **Langkah Bernomor:** Numeral serif raksasa (Playfair Display / Bodoni) dengan warna aksen menyala (Electric Lime / Cyan) dan `fontVariantNumeric: "tabular-nums"`.
- **Judul & Deskripsi:** Judul langkah tebal dengan dukungan penekanan kata kunci (`*aksen*`) serta keterangan pelengkap abu-abu redup.
- **Animasi Mask:** Teks dan angka meluncur naik dari balik garis masker secara bertahap (*staggered slide-up*) seiring pembicara mengutarakan poinnya.
- **Drop Shadow Pemisah:** Paruh atas memancarkan bayangan gradien halus ke bawah ke arah rekaman video penutur.

**Kapan dipakai:** Menjelaskan 2-4 poin ringkasan utama, tips berurutan, aturan bisnis, atau takeaway penting dalam format explainer talking-head.

## Di pipeline ini (dukungan: native)
Overlay Remotion `SplitExplainer` di atas footage penutur.

```json
{
  "tipe": "remotion",
  "efek": "split-explainer",
  "kategori": "CARANYA",
  "rasio_split": 0.5,
  "langkah": [
    { "nomor": 1, "judul": "Kasih *datanya*", "sub": "atau sumbernya, suruh jawab dari situ aja" },
    { "nomor": 2, "judul": "Izinkan bilang *nggak tahu*", "sub": "atau suruh cek ulang dulu" },
    { "nomor": 3, "judul": "Cek sendiri *angka penting*", "sub": "terutama metrik & biaya bisnis" }
  ],
  "durasi": 5.0
}
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E50.1 | Durasi elemen ber-`efek: split-explainer` dalam rentang `durasi` (3–8 detik). | otomatis |
| E50.2 | Angka langkah wajib menggunakan `fontVariantNumeric: "tabular-nums"`. | otomatis |
| E50.3 | Tata letak paruh atas tidak menutupi wajah penutur di paruh bawah. | manual |

## Bukti uji
- Uji render still composition: `remotion still SplitExplainer --frame 60` berhasil tanpa galat (`remotion/test_splitexplainer.png`).
- Analisis referensi: `referensi/AI effect.mp4` (0:55–1:15).
