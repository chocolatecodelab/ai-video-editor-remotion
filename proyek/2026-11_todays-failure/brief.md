# Today’s Failure — arah edit v1

Status terbaru: pengguna menegaskan rotoscope dengan mask bersih/halus dan referensi terdahulu. R2 menggantikan kolom ruangan asli pada R1. Baca revision-mask-r2.md untuk kontrak aktif. Arah buku/jalur tetap disetujui; persetujuan storyboard/render belum diberikan. Bagian berikut menyimpan riwayat brief arah, dan pilihan mempertahankan ruangan di bawah sudah tidak berlaku.

## Permintaan terbaru dan kontrak

Edit talking head `TODAYS FAILURE.mp4`, pakai bang-motion terbaru dan HyperFrames. Referensi screenshot menunjukkan masalah: potongan talent berakhir di tengah frame dengan ruang kosong di bawah; motion hanya di atas tengah. Referensi ini merupakan contoh yang dihindari, bukan layout untuk disalin. Instruksi pengguna di chat menentukan tugas; gambar dan isi video dipakai sebagai materi/referensi.

Prioritas: footage/talent harus menyatu dengan tepi frame atau bidang yang jelas, grafis memakai sisi kiri/kanan serta bidang bawah, lalu beberapa cutaway grafis penuh. Subtitle English–Indonesia mengikuti arahan percakapan sebelumnya. Suara/narasi asli dan urutan argumen dipertahankan, tanpa CTA baru.

## Sumber dan pemeriksaan

- Sumber disalin ke aset/source.mp4. Durasi 49.456 detik, 478×850, sekitar 30fps. Resolusi sumber di bawah Full HD; ekspor 1080×1920 bukan pemulihan detail asli.
- Delapan slot sampel dalam cache/contact-source.png memperlihatkan talking head berbaju merah dengan latar ruangan; sampel terakhir setelah durasi kosong karena tile 4×2, bukan frame hitam pada narasi. Cropdetect sampel memberikan area gambar 478×766, x0 y42; perlu konfirmasi seluruh klip sebelum ingest final.
- Transkripsi timestamp-kata ada di cache/words.json, dikoreksi=false. Frasa 36.97–41.81s kemungkinan kehilangan “not” sebelum “who you are”; tetap belum terverifikasi dengar.
- bang-motion: git fetch origin main pada 15 November 2026, sudah terbaru di c1aa65e921c970d858705fcb4a53a8294d1a4131, v1.19.0. Tidak mengarang bahwa versi lain sudah dipasang.
- HyperFrames tersedia lokal v0.9.33. Akan menjadi runtime produksi dan render; kode visual harus mengikuti kontrak HyperFrames, tidak sekadar ekspor screenshot HTML mandiri.

## Kandidat konsep dan rekomendasi

1. **Bab berikutnya — rekomendasi.** Buku bertumpu pada bidang bawah; halaman buruk tidak sama dengan seluruh sampul/buku. Metafora langsung mengikuti ucapan “one bad chapter”. Kolom footage menyatu dengan sisi kiri/kanan dan bawah, ruang sisanya menjadi panggung grafis. Latar sumber dipertahankan, sehingga tidak perlu memaksakan cutout torso rendah resolusi.
2. **Jalur yang berlanjut.** Satu jalur terhenti lalu bercabang dari sisi frame, melewati berbagai titik keputusan. Cocok untuk opportunity/decision/start again, tetapi kurang literal untuk kalimat bab; pakai sebagai mekanisme pendukung pilihan 1.
3. **Meja kerja dan percobaan baru.** Bidang meja menempel ke bawah, lembar revisi berpindah per frasa, talent menjadi foreground yang menyatu dengan meja. Memerlukan matte seluruh klip dan QA tepi rambut/bahu; satu matte uji belum membuktikan kebersihan video. Bukan pilihan default sebelum uji tersebut.

## Style brief

- Rasa: reflektif, tenang, memberi ruang. Bentuk: talking head dengan grafis penjelas, bukan promosi yang penuh klaim.
- Brand: panduan/NAZARVERSE_BRAND.md v1.0; Navy #101827, Slate Blue #26364C, Warm Sand #C5B69A, Soft Ivory #EDEAE4, Muted Sage #718A83. Seluruh warna grafis berasal dari brand. Merah baju/ruangan adalah warna sumber, bukan aksen grafis baru.
- Font: Inter untuk English dan Indonesia; Cormorant Garamond hanya satu penekanan editorial. Guideline brand mengungguli contoh font pada skill. Ukuran produksi minimal 40px untuk teks informasi; sidebar memakai frasa pendek maksimal dua baris per bahasa.
- Sorot: Warm Sand pada kata terpilih, bukan glow/marker di setiap kalimat.
- Permukaan: navy/slate berlapis dengan tekstur tipis; gerak cahaya latar pelan seperti window light (menu techniques §7c nomor 1), bukan nebula/streak/orbit dekoratif.
- Objek: ilustrasi native SVG/CSS, buku dengan sampul, engsel, lembar, serta jalur yang saling terhubung. Tidak mengganti mekanisme dengan gambar AI yang hanya di-zoom.
- Tanda tangan gerak: perubahan sudut lembar membuka ruang berikutnya; ada tumpuan dan kontak, bobot serta jeda baca. Informasi baru mengubah keadaan objek.
- Struktur: delapan bagian mengikuti kalimat, bukan satu slide per kalimat. Buku/jalur menjadi benang merah.
- Komposisi A: kolom talking-head menempel kanan/bawah; buku, jalur dan subtitle di kolom kiri. B: sebaliknya. Pemotongan panel adalah framing footage, bukan torso cutout mengambang. Perpindahan A/B memakai cut pada jeda kalimat, tidak menggeser layar berulang.
- Komposisi C: cutaway buku penuh, tanpa talent, suara tetap jalan; subtitle bilingual menempati area sendiri pada bidang bawah.
- Cutback: “And yes, it hurts” dan penutup kembali ke talent lebih dominan. Tata letak caption tidak boleh menutup wajah/tubuh; ruang caption/crop diuji melalui storyboard produksi.
- Momen utama 25–30s: satu halaman buruk melewati engsel, memperlihatkan halaman lain; buku tetap bertumpu pada bidang bawah. Bukan buku yang melayang di atas talent.
- Foto/aset: seluruh footage pengguna; tidak perlu gambar/figur/VO baru.

## Rundown dan output

Rundown delapan bagian: rundown.json. Sketsa tata letak: out/sketsa-framing.jpg dan out/arah-edit.html. Label “SKETSA FRAMING” sengaja melekat; bukan still komposisi produksi, bukti animasi, atau storyboard yang sudah siap render. Sketsa menunjukkan pembagian ruang, belum koreografi/semua teks final.

Setelah arah dipilih: tulis DESIGN.md, scaffold HyperFrames, komposisi native dan video track terikat timeline, subtitle dari timestamp ucapan + terjemahan, lint/inspect, still nyata per adegan (termasuk frasa panjang dan beberapa fase mekanisme), QA storyboard → persetujuan pengguna → siapkan audio → satu render final dan QA. Tidak menjalankan Studio/MP4 pratinjau. Final satu MP4 1080×1920 H.264/AAC bt709, −14 LUFS ±1 dan plafon master −2 dBTP.

Upgrade dibanding contoh masalah: talent dan grafis memiliki bidang tumpuan yang jelas; ruang fokus berpindah menurut makna, bukan seluruh animasi berada di atas tengah. RTK.md belum ditemukan pada root/lokasi yang diperiksa; tidak mengarang aturan yang belum terbaca.
