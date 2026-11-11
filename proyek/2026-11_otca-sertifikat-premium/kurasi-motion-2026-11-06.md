# Audit kurasi motion OTCA — 6 November 2026

Lingkup: screenshot pengguna, EditorialReview.tsx, AdeganOtca.tsx, alat.ts,
production-props.json, K05/K09/K11, dan skill motion-design-craft.
Audit ini belum menonton ulang video/audio. Tidak ada render atau perubahan
komponen. Temuan kode adalah risiko, kecuali perilakunya eksplisit dalam rumus.
PDF brand asli tidak ditemukan pada lokasi terdahulu; pembandingan brand memakai
ATURAN_KERJA §5. Jangan menyebut audit ini verifikasi PDF brand lengkap.

## Layak dipertahankan sebagai konsep

- Tangga level untuk progres; timbangan untuk perbedaan bobot sertifikat dan
  kemampuan; perjalanan/peta untuk tujuan studi. Relevan secara semantik,
  namun pilihan bentuk dan koreografinya tetap perlu tinjauan hasil.
- Anchor kata melalui a.t dan helper berbasis frame adalah fondasi timing yang baik.
- Palet OTCA dan penggunaan ilustrasi penjelas dapat dipertahankan; tidak perlu
  mengubah semuanya menjadi 3D, kaca, atau ilustrasi rumit.

## Prioritas revisi

1. **Tangga level:** AdeganOtca.tsx, OtcaTangga memakai floor(idxP) pada py,
   sementara px bergerak kontinu. Ada perubahan y diskret; tinjau apakah terasa
   sebagai teleport. Rancang lintasan naik per anak tangga dengan kontak/pendaratan
   yang jelas, atau pindahkan fokus lewat sorot tahap tanpa bola pendaki.
   Jangan memaksakan perpindahan fisik bila cukup menonjolkan level saat disebut.
2. **Pengulangan gerak:** Lencana memakai scale/fade, cahaya, riak dan drift;
   beberapa adegan lain mengulang vocabulary tersebut. Kurangi dekorasi bersama,
   bedakan aksi berdasarkan pesan. Riak sekali bukan pelanggaran dengan sendirinya.
3. **Gerak menetap:** drift() menghasilkan sinus x/y; banyak panggilan menggeser
   grup ilustrasi. Ini belum membuktikan parallax berlapis. Tanda tanya juga
   memakai sinus; timbangan menambah sinus tanpa peluruhan. Hentikan UI setelah
   settle dan gunakan gerak sekunder hanya bila ada sebab visual/naratif.
4. **Full frame:** EditorialReview meletakkan artwork split melalui transform
   scale/translate dengan judul, label dan caption terpisah. Buat komposisi full
   khusus melalui props; atur fokus dan keseimbangan ruang, bukan hanya pembesaran.
5. **Subtitle:** blok teks full frame belum menerapkan kualitas K11. Screenshot
   menunjukkan frasa berakhir dengan satu kata di baris kedua. Rancang pemenggalan
   dan penekanan editorial; hindari duplikasi pesan judul/label/caption.
6. **Material dan kontras:** glow pada sertifikat/kampus, banyak garis dan efek
   cahaya berisiko membuat semua elemen sama penting. Periksa bentuk tanpa glow;
   pulihkan keterbacaan label nonaktif tanpa menghilangkan hierarki tahap aktif.

## Rancangan aksi tangga untuk storyboard berikutnya

- Awal: bentuk tangga terbaca, label jelas, satu fokus.
- Perubahan: tahap yang relevan disorot mengikuti ucapan; bila penanda digunakan,
  lintasannya terhubung dan memiliki tujuan. Jangan mengesankan capaian faktual
  atau target tertentu bila sumber hanya menjelaskan fungsi sertifikat.
- Tahan: diagram stabil saat kalimat dibaca, caption premium pada area tersendiri.
- Keluar: sambungan berdasarkan objek/makna berikutnya bila cocok; cut bersih
  lebih tepat daripada match cut yang dipaksakan.

## Status

Desain statis screenshot: revisi. Risiko kode gerak: perlu revisi/tinjauan terarah.
Kehalusan, ritme final, match cut antaradegan, sinkron audio: belum diverifikasi.
Pedoman lanjutan: konteks/KONTEKS_12_kurasi-motion-premium_v0.1.md.
