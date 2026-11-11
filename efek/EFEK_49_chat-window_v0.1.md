---
id: E49
nama: chat-window
versi: 0.1
status: draft
durasi: [2.5, 6]
stagger: null
dukungan: native
remotion: ChatWindow
gaya_cocok: [glass-tech, apple-glass, arang-lime, bold-kinetic, minimalism, retro-brutalism]
konteks_terkait: [zona-aman, gerak, sound-design]
alias: [chat window, ai conversation, chat mockup, cascading chat, dialog window]
slot: [demonstrasi, solusi, perbandingan, studi-kasus]
---

# E49 — Efek: Chat Window (Simulasi Percakapan AI & Cascading Audit)

**Deskripsi:** Jendela antarmuka percakapan interaktif macOS dengan balon dialog dua arah:
- **Jendela Utama:** Kontrol window traffic lights vector SVG (`● ● ●`), judul aplikasi ("Chat dengan AI"), dan tag role ("contoh", "jawab", "audit").
- **Balon Dialog 2 Sisi:** Balon pengguna (`KAMU`) di sisi kanan dengan warna gelap kontras; balon AI (`AI`) di sisi kiri dengan warna terang/krem dan label pengirim.
- **Cascading Comparison (Jendela Kedua):** Mendukung pemunculan jendela kedua secara bertingkat di kanan bawah ("Chat 1" vs "Chat 2") untuk memvisualisasikan workflow prompt audit atau komparasi output.
- **Slanted Thought Pills:** Awan pil pertanyaan audiens bersudut miring dinamis (`rotate(-4.5deg)`, `rotate(3.2deg)`) melayang di samping jendela.
Sinkron dengan audio cue status (`ketik-klik`, `whoosh-masuk`, `pop`).

**Kapan dipakai:** Mendemonstrasikan prompt AI, percakapan ChatGPT/Claude, komparasi prompt vs audit, studi kasus software, atau visualisasi Q&A teknis.

## Di pipeline ini (dukungan: native)
Overlay Remotion `ChatWindow` di atas footage penutur.

```json
{
  "tipe": "remotion",
  "efek": "chat-window",
  "utama": {
    "judul": "Chat dengan AI",
    "tag": "contoh",
    "balon": [
      { "peran": "user", "pesan": "Stack paling bagus buat deploy website-ku apa?" },
      { "peran": "ai", "pesan": "Pakai *VPS berbayar* + paket Pro. Itu stack wajib!" }
    ]
  },
  "kedua": {
    "judul": "Audit Prompt",
    "tag": "audit",
    "balon": [
      { "peran": "user", "pesan": "Cek jawaban ini. Ada yang salah?" }
    ]
  },
  "pikiran": ["Harus bayar ini?", "Harus bayar VPS?"],
  "durasi": 5.0
}
```

## Aturan
| ID | Aturan | Cek |
|---|---|---|
| E49.1 | Durasi elemen ber-`efek: chat-window` dalam rentang `durasi` (2.5–6 detik). | otomatis |
| E49.2 | Waktu kemunculan balon bertahap sesuai urutan membaca mata penonton. | otomatis |
| E49.3 | Menggunakan vector SVG murni dan bebas dari OS emoji murahan. | otomatis |

## Bukti uji
- Uji render still composition: `remotion still ChatWindow --frame 50` berhasil tanpa galat (`remotion/test_chatwindow.png`).
- Analisis referensi: `referensi/AI effect.mp4` (0:07–0:25, 0:75–0:85).
