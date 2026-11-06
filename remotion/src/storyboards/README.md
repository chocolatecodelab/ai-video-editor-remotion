# EditorialReview — v0.1

## ScholarshipReel — v0.1, OTCA Nina

`ScholarshipReel.tsx` + `ScholarshipArt.tsx` memakai ilustrasi objek vektor
berlapis, talent RGBA di atas hitam, dan caption dengan pemenggalan dari props. Entry terpisah
`remotion/nina-scholarship-entry.tsx` menjaga proyek lain. Contoh:
`proyek/2026-11_otca-nina-beasiswa-s1/production-props.json`.
`split.json` dengan `renderer: scholarship` merutekan `video.py render|qa|semua`
ke `pipeline/scripts/scholarship.py`. Gerbang memeriksa hash props/sumber,
caption sumber, serta kelengkapan cutout. Audio memakai bus split dan ducking.
QA memeriksa metadata/loudness, layout DOM bertimestamp, font efektif,
tabrakan teks/sosok, latar hitam, dan bukti perubahan gambar. Kontak dari MP4
final; penilaian estetika dan cek HP/headphone tetap terpisah. Contoh produksi
6 November 2026: QA otomatis LULUS, catatan `produksi-final.md` di proyek.
Schema ini berbeda dari EditorialReview di bawah.

## Jalur produksi EditorialReview

Komposisi campuran split talking-head dan cutaway motion graphics layar penuh.
Memakai ulang PUSTAKA adegan; teks, timing, pusat ilustrasi, skala, dan mode dari
`editorial` pada props. Pada mode full, talent tidak dirender dan suara tetap
ditangani pipeline audio.

Sumber props produksi harus memiliki persetujuan SHA-256 di manifest. Ini
mencegah render revisi layout yang belum disetujui. Entry composition dipilih
melalui split.json: `editorial_entry`, `editorial_composition`, `editorial_props`.
Pintu produksi tetap `video.py render|qa|semua <folder-proyek>`.

Contoh teruji: proyek/2026-11_otca-sertifikat-premium/production-props.json.
Font Montserrat dimuat melalui kontrak font yang sama dengan SplitReel.

QA menambahkan bukti dari video final, bukan gambar storyboard: sembilan sampel
adegan dan frame sebelum/saat/setelah delapan cut, serta contact sheet final.
Review HP/headphone dan pemeriksaan visual manusia tetap dicatat terpisah.
