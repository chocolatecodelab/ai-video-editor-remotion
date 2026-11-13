# SOMEWHERE — Tribute to my grandpa

Revisi aktif: tribute v2 bilingual. Arah disetujui melalui pesan pengguna “Jalankan, tribut to my grandpa” dan gambar `TRIBUTE TO MY GRANDPA.jpeg`. Tambahan terbaru: “jangan lupa subtitle indonesianya yang menemani”. Ini mengubah konteks narasi menjadi tribute pribadi dan meminta subtitle English–Indonesia; tidak mengotorisasi perubahan akun, publikasi, atau biografi tambahan.

## Kontrak kreatif

Sumber `aset/SOMEWHERE.mp4`, 58.662 detik, 848×478, close-up keyboard pada delapan sampel. Pertahankan English VO asli dan jeda; ganti visual utama dengan dunia motion serta gambar pribadi pengguna. Gambar asli disalin ke `komposisi/assets/grandpa.jpeg`; gambar tampil utuh, tidak dianimasikan seolah orang di dalamnya hidup. Tidak mengarang nama kakek, tanggal, atau kejadian spesifik. Penutup sesuai permintaan: “Tribute to my grandpa”.

Konsep terpilih dari brief v1: satu cahaya melintasi jarak. Enam bagian makna: horizon → jendela kenangan → jalur jarak → penunjuk waktu → kenangan dalam diam → love remains. Cahaya bertahan sebagai benang merah. Kamera dan komponen merespons makna; bukan enam halaman presentasi. Native HTML/SVG/CSS/GSAP dipilih karena pengguna secara eksplisit meminta bang-motion. Tidak memakai ImageGen.

## Brand dan tipografi

Sumber: `panduan/NAZARVERSE_BRAND.md`, guideline v1.0. Midnight Navy #101827; Slate Blue #26364C; Warm Sand #C5B69A; Soft Ivory #EDEAE4; Muted Sage #718A83. Warna gambar asli tetap dipertahankan sebagai kenangan pribadi. Inter untuk English 44px dan Indonesia 40px; Cormorant Garamond untuk judul/dedikasi/penutup. Kedua font tersedia lokal. Identitas brand mendahului contoh font/palet dalam skill eksternal.

Subtitle English dengan aksen kata aktif; terjemahan Indonesia ditempatkan di bawahnya, maksimal dua baris per bahasa. Area caption 1310–1520, terpisah dari gambar. Gambar dan bingkai dinaikkan untuk menyediakan ruang bilingual. Penutup: “Love remains / Cinta tetap ada”. Full-frame motion dan jendela kenangan dipilih; split talent tidak relevan karena sumber tidak memperlihatkan talking head pada sampel.

## Produksi dan bukti

`manifest.json` memuat spesifikasi, palet, format dan status persetujuan. `beat-sheet.json` memuat waktu serta perilaku tiap bagian. `cache/words.small.json` menyimpan ASR kedua utuh; `cache/words.storyboard.json` dan `cache/caption-review.json` menyimpan usulan caption tanpa mengklaim telah dikoreksi dengar. Frasa `routes` dan `Some we carry in silence` masih perlu konfirmasi. Terjemahan lengkap di `naskah-storyboard.md`.

Komposisi `komposisi/index.html` dibangun dari kontrak continuous world/camera/seek starter bang-motion, dengan template dan data terpisah. Skill v1.19.0, commit c1aa65e921c970d858705fcb4a53a8294d1a4131. Paket asal: `vendor/bang-motion`. Buka langsung tanpa server; `?debug=1` untuk scrub. Audio AAC sumber disalin tanpa encode ulang, belum mix final; tidak menumpuk musik baru yang belum diperiksa.

`out/storyboard.html`: 16 still nyata komposisi. `out/browser-check.json`: tidak ada page error, font dimuat, seek ulang 29.5s identik, semua 20 blok caption berada dalam batas yang diuji. Still membuktikan pose/layout; belum membuktikan keluwesan, ritme, sinkronisasi dengar, atau loudness.

## Persetujuan dan tahap berikutnya

Arah visual disetujui. Storyboard baru belum disetujui; tidak menandai persetujuan atas nama pengguna. Setelah tinjauan storyboard: selesaikan koreksi narasi, mix audio lebih dahulu, render visual final sekali, ekspor satu MP4 1080×1920 H.264/AAC bt709, ukur −14 LUFS dan master true peak ≤ −2 dBTP, lalu QA hasil. Jangan menyebut target ini sebagai hasil terukur saat ini.

Upgrade yang diterapkan: satu cahaya meneruskan perhatian di antara mekanisme yang berbeda, sementara subtitle bilingual mendapat ruang khusus. RTK.md belum ditemukan dalam lokasi yang diperiksa; tidak mengarang isi instruksi tersebut.
