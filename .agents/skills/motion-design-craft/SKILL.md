---
name: motion-design-craft
description: >-
  Standard and aesthetic guidelines for professional motion design, Remotion graphics,
  and tactile visual arts. Eliminates AI slop, flat placeholders, and generic math curves,
  replacing them with tangible craft, realistic physics, authentic UI metaphors, and curated taste.
---

# Motion Design Craft & Anti-AI-Slop Guidelines

Standar panduan desain gerak profesional untuk `video-system` dan `remotion/`. Menjamin setiap efek memiliki bobot estetika tinggi, rasa taktil fisik, tipografi berkelas, dan bebas dari tampilan murahan ("AI slop").

---

## 1. Identifikasi & Eliminasi "AI Slop"

| Gejala AI Slop | Pendekatan Motion Designer Profesional |
|---|---|
| **Kurva Matematika Datar:** Garis bergelombang sinus sederhana yang bergerak naik-turun tanpa bobot fisik. | **Bentuk Organik Bertingkat:** Lapisan kertas potong (die-cut cardstock) dengan bevel bayangan multi-tahap, ketebalan fisik kertas (300 gsm), dan potongan siluet yang bermakna. |
| **Kotak Warna Polos:** Kotak persegi panjang dengan radius standar tanpa kedalaman atau aksen. | **Antarmuka Otentik (Realistic UI):** Editor NLE nyata (track V1/V2/A1, waveform, playhead scrubber bergerak, timecode ruler, window controls) atau glassmorphism multi-layer dengan specular highlight. |
| **Vektor Kaku:** Lingkaran atau panah SVG sempurna dengan sedikit jitter acak. | **Karakter Hand-Drawn Organik:** Coretan pena bertumpuk (double-loop circles), goresan spidol stabilo bertekstur, panah meliuk dinamis dengan kepala pena ekspresif, dan siklus boil 3 frame otentik. |
| **Animasi Linear Monoton:** Semua elemen bergerak dengan kecepatan yang sama. | **Fisika Pegas & Stop-Motion Bertingkat:** Pemanfaatan kurva bezier tegas, spring physics dengan overshoot halus, dan pembatasan frame stop-motion (12 fps) pada elemen bertema kertas/doodle. |

---

## 2. Prinsip Desain per Kategori Efek

### A. Paper Craft & Stop-Motion (`PaperCut`, `PaperCutout`)
1. **Kedalaman Kertas Berlapis (3D Paper Diorama):**
   - Menggunakan minimal 4-5 lapisan kontur bertingkat dengan skala warna terkalibrasi (misal: Navy gelap ➔ Biru samudra ➔ Cyan ➔ Krem kertas).
   - Setiap bidang kertas memiliki bayangan bertingkat (`filter: drop-shadow(0 12px 24px rgba(0,0,0,0.25))` + inset highlight halus di tepi atas untuk kesan potongan pisau cutter).
2. **Elemen Kerajinan Tematik:**
   - Awan berombak dengan lekukan elips asimetris.
   - Benda langit (matahari berjeruji segitiga potong lipat, bulan bertekstur kawah lubang ganda, bintang kertas berpendar).
   - Roket/kendaraan kertas dengan jejak asap kertas bertumpuk.
3. **Gerak Taktil (12 FPS Stop-Motion):**
   - Kecepatan waktu dikunci ke interval 12 fps (`Math.floor(f / (fps / 12)) * (1 / 12)`).
   - Micro-wobble halus di rotasi (±1.5°) untuk mensimulasikan animasi stop-motion fisik meja potong.

---

### B. Editor Studio & Antarmuka NLE (`Timeline`, `UIWorld`, `Terminal`)
1. **Representasi Realistis Software Pengeditan Video (100% Recyclable):**
   - **Parameter Bebas (Zero Hardcoding):** Seluruh teks judul, label status, dan nama trek wajib di-pass melalui props (`el.header`, `el.sub`, `el.judul`, `el.trek`) dengan default generik yang bersih. Dilarang keras menanam string statis seperti judul video atau nama studio tertentu.
   - **Header & Badge Seri:** Pill status dinamis, penanda efek aktif (`[idx] Nama Efek`), dan progress indicator bar.
   - **Mockup Player Viewport:** Jendela aplikasi lengkap dengan traffic lights (merah, kuning, hijau), menu bar, dan monitor penampil video talking-head di tengah.
   - **Timeline Multi-Track Nyata:**
     - Trek video `V2` (klip overlay B-roll oranye), `V1` (klip utama talking-head biru), dan `A1` (trek audio dengan visualisasi waveform hijau/emerald).
     - Rulers waktu (`00:00`, `00:15`, `00:30`, `00:45`, `01:00`) dengan garis grid milidetik.
     - **Playhead Scrubber Berjalan:** Jarum playhead vertikal presisi tinggi dengan pegangan kepala scrubber di atasnya yang meluncur mulus, memicu highlight pada klip saat melewatinya.

---

### C. Doodle Art & Sketsa Tangan (`DoodleBoil`, `Coret`)
1. **Bentuk Coretan Hidup:**
   - **Lingkaran Sketsa (Double-Loop):** Menggambar elips yang berputar 1.25 putaran dengan ujung yang tumpang tindih natural seperti goresan spidol asli.
   - **Panah Meliuk Dinamis:** Busur lengkung bezier dengan variasi ketebalan ujung dan sayap mata panah tajam.
   - **Stabilo / Highlighter Strike:** Sapuan warna transparan melintang di belakang kata kunci dengan tepi sedikit bergerigi.
   - **Sparkle & Callout:** Bintang silang empat sudut (`✦`), gelembung dialog komik, dan tanda seru/tanya ekspresif.
2. **Siklus Boil 3-Frame:**
   - 3 variasi titik koordinat yang berganti bergantian setiap 3-4 frame (8–10 fps) agar goresan tampak bernapas dan berdenyut seperti animasi seluloid klasik.

---

### D. Terminal & Developer Motion Craft (`Terminal`)
1. **Modern High-End CLI Aesthetics (Warp / Raycast / Claude Code CLI):**
   - **Window Chrome:** Tombol kontrol traffic lights (merah, kuning, hijau dengan refleksi specular halus), tab bar dengan breadcrumb path (`~/workspace/pipeline`) dan pill git branch (`main ⎇`).
   - **Prompt Badge Berkelas:** Simbol shell gradien (`❯` atau vector SVG lightning), directory context pill, dan timing badge (`0.42s`).
   - **Syntax Token Highlighting:**
     - Kata perintah utama: Cyan / Emerald terang.
     - Parameter & flags (`--preset`, `-v`): Violet / Amber.
     - Argumen & string: Warna teks bersih dengan petik halus.
   - **Kursor Aktif & Animasi Mengetik:**
     - Kursor balok aksen dengan glowing glow pulse (bukan sekadar kotak mati).
     - Output line dengan icon status (success badge SVG `✓`, spinner bullet, timing stamp), staggered slide & fade-in.

---

### E. Checklist & Modern Productivity UI (`Checklist`)
1. **Linear / Notion / Apple Reminders Tactile Motion:**
   - **Struktur Kartu Terapung:** Setiap item checklist adalah kartu baris yang memiliki kedalaman (subtle glass border + ambient drop-shadow).
   - **Fisika Centang Micro-Spring:**
     - Kotak centang mengecil sesaat saat klik (`scale(0.88)`), kemudian memantul membesar (`scale(1.12)` ➔ `scale(1.0)`).
     - Jalur centang SVG digambar dengan timing elastis (`strokeDashoffset`).
     - Latar kotak terisi dengan gradien aksen menyala + partikel percikan (burst micro-sparkles) yang memancar radial.
   - **Transisi Tipografi:** Teks item yang tercentang beralih halus ke opasitas terfokus dengan garis coret bergaya stempel atau aksen sorot.

---

### F. Motion Graphic Penjelas & Broadcast HUD (`Penjelas`)
1. **LowerThird (Broadcast & Tech Creator):**
   - Kapsul kaca floating glassmorphism, avatar ring / verified badge, illuminated accent lightbar, dual-line typography dengan mask reveal berjenjang (staggered translateY).
2. **Langkah (Connected Workflow Stepper):**
   - Node bernomor yang terhubung rel cahaya. Rel terisi progresif seiring langkah aktif, node aktif memantul dengan spring bounce dan cincin denyut radar (pulse ring).
3. **SebelumSesudah (Interactive Laser Wipe Slider):**
   - Kartu perbandingan split dengan garis pemisah laser bercahaya, handle geser tengah (panah ganda `◀ ▶`), dan badge pill kontras ("SEBELUM" warm/muted dengan SVG cross `✕` vs "SESUDAH" radiant emerald/cyan dengan SVG check `✓`).
4. **Callout (Tactical HUD / Viewfinder Target):**
   - Lingkaran konsentris ganda dengan putaran dasbor berlawanan arah, 4 kurung siku sudut (corner reticle), garis penunjuk bersudut 45° dengan titik sendi bercahaya (joint node), dan panel info kaca dengan tag kategori.
5. **Linimasa (Luminous Milestone Roadmap):**
   - Rel vertikal bercahaya dengan jangkar node bulat bergelombang ping, lencana kapsul tanggal/tahun, dan kartu deskripsi yang meluncur masuk secara staggered.

---

### G. Visualisasi Data & Parallax Orbital (`ChartGrow`, `Orbit`)
1. **ChartGrow (Luminous Data Columns):**
   - Batang grafik dengan sudut atas melengkung sempurna, isian gradien vertikal dari aksen ke transparan, floating pill badge angka yang menghitung naik (tabular nums), dan garis panduan horizontal halus.
2. **Orbit (3D Planetary Parallax):**
   - Orbit elips 3D miring dengan beberapa cincin konsentris tipis, kedalaman ruang (DoF blur dan opasitas pada satelit di orbit belakang `z <= 0`), refleksi cermin bawah, dan kartu pahlawan tengah dengan specular rim lighting.

---

## 3. Standar Ikonografi (Pure Vector SVG)

1. **Zero OS Emoji & Raw Keyboard Glyphs:**
   - Dilarang keras merender emoji OS sistem (`📁`, `⚙`, `⚡`, `🚀`) atau karakter unicode mentah (`✓`, `✕`) yang menghasilkan bitmap kartun inkonsisten dan blur di resolusi tinggi.
   - Semua ikon wajib berupa **Inline Vector SVG** (`<svg viewBox="0 0 24 24">`).
2. **Spesifikasi Vektor:**
   - Stroke konsisten: `strokeWidth={2}` hingga `3.2` dengan `strokeLinecap="round"` dan `strokeLinejoin="round"`.
   - Responsif resolusi: Ukuran dikalikan pembantu `px()` agar proporsional di format video vertikal 1080×1920 maupun 4K.
   - Pewarisan tema: Menggunakan `currentColor` atau token palet `w.aksen`, `w.sekunder`, `w.peringatan`.

---

## 4. Standar Tipografi & Penulisan Teks

1. **Hierarki Token & Preloading:**
   - **Preloading Terjamin:** Menggunakan `delayRender("font token")` dan `FontFace.load()` di `font.ts` agar tidak ada font flash atau layout shift saat rendering frame.
   - **Display Judul:** Montserrat Bold/Black (`weight: 800/900`) dengan *tight tracking* (`letterSpacing: -0.02em` atau `-0.5px`) dan *line-height* padat (1.05–1.15).
   - **Subjudul & Konten:** Inter Variable yang jernih, tajam, dan memiliki keterbacaan tinggi di atas video bergerak.
   - **Tag & Kategori:** Huruf kapital (*uppercase*) dengan *wide tracking* (`letterSpacing: px(1)` hingga `px(4)`).
2. **Wajib `fontVariantNumeric: "tabular-nums"`:**
   - Setiap elemen yang memuat angka dinamis (counter, timer, chart value, progress counter) WAJIB menggunakan `fontVariantNumeric: "tabular-nums"` untuk mengeliminasi getaran horizontal (*layout jitter*).
3. **Markup Kata Aksen (`*kata*` via `HiasKata`):**
   - Parsing kata kunci otomatis dengan motif gaya proyek:
     - `kilau`: Sapuan kilau spekular melintas pada teks.
     - `kotak`: Kotak sorot solid di belakang teks dengan kontras terbalik otomatis.
     - `stabilo`: Sapuan highlighter semi-transparan.
     - `garis`: Garis bawah dinamis dari kiri ke kanan.
     - `arsir`: Garis arsir miring khas sketsa.
     - `selotip`: Washi tape bertekstur goyah.

---

## 5. Standar Bentuk, Geometri & Kedalaman (Shapes & Depth)

1. **Glassmorphism Multi-Layer:**
   - Background transparan halus (`rgba(latar, 0.2–0.45)`) dipadu `backdropFilter: blur(16–24px)`.
   - Lapisan specular highlight: Inset border atas `1.5px rgba(255,255,255,0.4–0.75)` dan inset border bawah tipis untuk efek pantulan ketebalan kaca asli.
   - Bayangan bertingkat (*layered ambient drop-shadow*): Kombinasi bayangan dekat lembut dan bayangan jauh menyebar.
2. **Border Radii Adaptif:**
   - Mengikuti token `px(t.radius.kartu)`: Kaca lengkung membulat halus, Brutalisme sudut tajam `0px`, Kapsul pill `999px`.
3. **Divider Laser & Reticle HUD:**
   - Garis pemisah laser dengan gradien transparan-ke-aksen-ke-transparan dan *box-shadow glow*.

---

## 6. Standar Koreografi Gerak & Sinkronisasi Fisika

1. **Fisika Pegas (*Spring Curves*):**
   - Menghindari kurva linier monoton. Menggunakan `spring()` dengan `damping: 11–14`, `stiffness: 120–160`, dan `mass: 0.6–0.7` untuk respon yang elastis dan tangkas.
2. **Perceptual Scaling:**
   - Menggunakan kurva skala perseptual (`skalaPersepsi`) untuk memastikan perubahan zoom/scale tampak seragam bagi mata manusia.
3. **Frame-Accurate SFX Timing:**
   - Jadwal pengetikan teks (`j.ketik`), langkah stepper, dan centang item checklist dihitung presisi pada level frame oleh Python (`perangkat.py`), sehingga suara SFX audio (klik, whoosh, pop) mendarat tepat pada frame aksi visual.
4. **100% Recyclable Architecture:**
   - Tidak ada satu pun teks, nama perusahaan, atau watermark yang di-hardcode ke dalam kode Remotion. Seluruh komponen menerima props yang dapat di-generate ulang untuk topik apa pun secara fleksibel.
