"""buat_pratinjau_struktur — buat kartu diagram visual untuk template dan koreografi (PRD/Vorta).
Semua kartu berformat PNG (540x960), 100% bebas dari objek manusia.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
FONTS = ROOT / "pipeline" / "fonts"

def get_font(name: str, size: int):
    p = FONTS / name
    if p.exists():
        return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()

def buat_latar(W, H, c_atas=(24, 34, 76), c_bawah=(11, 15, 36)):
    img = Image.new("RGB", (W, H))
    pixels = img.load()
    for y in range(H):
        t = y / (H - 1)
        r = int(c_atas[0] * (1 - t) + c_bawah[0] * t)
        g = int(c_atas[1] * (1 - t) + c_bawah[1] * t)
        b = int(c_atas[2] * (1 - t) + c_bawah[2] * t)
        for x in range(W):
            pixels[x, y] = (r, g, b)
    return img

def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)

def buat_kartu_template(id_tmpl: str, judul: str, sub: str, durasi: str, beats: list[dict], keluar: Path):
    W, H = 540, 960
    img = buat_latar(W, H, c_atas=(28, 38, 86), c_bawah=(10, 14, 34))
    draw = ImageDraw.Draw(img)

    f_tag = get_font("Montserrat-Bold.ttf", 14)
    f_title = get_font("Montserrat-ExtraBold.ttf", 26)
    f_sub = get_font("Nunito-Bold.ttf", 16)
    f_num = get_font("consolab.ttf", 15)
    f_beat_title = get_font("Montserrat-Bold.ttf", 17)
    f_beat_desc = get_font("Nunito-Regular.ttf", 14)
    f_dur = get_font("consolab.ttf", 13)

    # Top header banner
    draw_rounded_rect(draw, [W//2 - 95, 48, W//2 + 95, 80], radius=16, fill="#1B2555", outline="#F7D16A", width=2)
    draw.text((W//2, 64), "STRUKTUR CERITA", font=f_tag, fill="#F7D16A", anchor="mm")

    # Title & Sub
    draw.text((W//2, 115), judul, font=f_title, fill="#FFFBF0", anchor="mm")
    draw.text((W//2, 150), f"{sub}  ·  {durasi}", font=f_sub, fill="#9CA8D8", anchor="mm")

    # Timeline vertical track
    cx = 58
    top_y, bot_y = 205, H - 75
    draw.line([(cx, top_y), (cx, bot_y - 20)], fill="#2E3875", width=3)

    n_beats = len(beats)
    avail_h = (bot_y - top_y)
    step_h = avail_h / n_beats

    for idx, b in enumerate(beats):
        by = top_y + idx * step_h
        card_h = min(step_h - 16, 105)

        color_accent = b.get("aksen", "#F7D16A")

        # Timeline circle node
        draw.ellipse([cx - 16, by + 20 - 16, cx + 16, by + 20 + 16], fill="#141B3D", outline=color_accent, width=3)
        draw.text((cx, by + 20), str(idx + 1), font=f_num, fill="#FFFBF0", anchor="mm")

        # Beat card container
        card_box = [cx + 34, by, W - 38, by + card_h]
        draw_rounded_rect(draw, card_box, radius=14, fill="#131A3D", outline="#252F64", width=2)

        # Beat pill tag
        time_tag = b.get("waktu", "")
        draw_rounded_rect(draw, [card_box[0] + 14, by + 12, card_box[0] + 88, by + 34], radius=6, fill="#1D2654")
        draw.text((card_box[0] + 51, by + 23), b["beat"].upper(), font=f_tag, fill=color_accent, anchor="mm")

        if time_tag:
            draw.text((card_box[2] - 16, by + 23), time_tag, font=f_dur, fill="#8898D2", anchor="rm")

        # Content text
        draw.text((card_box[0] + 14, by + 45), b["judul"], font=f_beat_title, fill="#FFFBF0")
        draw.text((card_box[0] + 14, by + 72), b["deskripsi"], font=f_beat_desc, fill="#A4B1E0")

    # Bottom footer pill
    draw_rounded_rect(draw, [38, H - 56, W - 38, H - 24], radius=16, fill="#0B0E26", outline="#202A5A", width=1)
    f_bot = get_font("Nunito-Bold.ttf", 13)
    draw.text((W//2, H - 40), f"Template ID: {id_tmpl}  ·  Bebas ganti gaya visual", font=f_bot, fill="#7A89BE", anchor="mm")

    keluar.parent.mkdir(parents=True, exist_ok=True)
    img.save(keluar)
    print(f"OK template: {keluar}")

def buat_kartu_koreografi(id_koreo: str, judul: str, sub: str, durasi: str, slots: list[dict], keluar: Path):
    W, H = 540, 960
    img = buat_latar(W, H, c_atas=(22, 38, 68), c_bawah=(10, 15, 32))
    draw = ImageDraw.Draw(img)

    f_tag = get_font("Montserrat-Bold.ttf", 14)
    f_title = get_font("Montserrat-ExtraBold.ttf", 26)
    f_sub = get_font("Nunito-Bold.ttf", 15)
    f_slot_name = get_font("consolab.ttf", 15)
    f_device_title = get_font("Montserrat-Bold.ttf", 17)
    f_device_desc = get_font("Nunito-Regular.ttf", 14)
    f_perangkat = get_font("consolab.ttf", 13)

    # Top header banner
    draw_rounded_rect(draw, [W//2 - 105, 48, W//2 + 105, 80], radius=16, fill="#152B46", outline="#4FB286", width=2)
    draw.text((W//2, 64), "URUTAN KOREOGRAFI", font=f_tag, fill="#4FB286", anchor="mm")

    # Title & Sub
    draw.text((W//2, 115), judul, font=f_title, fill="#FFFBF0", anchor="mm")
    draw.text((W//2, 148), f"{sub}  ·  {durasi}", font=f_sub, fill="#9CA8D8", anchor="mm")

    # Slots
    top_y = 190
    step_y = (H - 260) / len(slots)

    for i, s in enumerate(slots):
        sy = top_y + i * step_y
        h_box = step_y - 14
        box = [36, sy, W - 36, sy + h_box]
        color_accent = s.get("aksen", "#4FB286")

        # Card container
        draw_rounded_rect(draw, box, radius=14, fill="#121D38", outline="#203058", width=2)

        # Slot pill tag
        draw_rounded_rect(draw, [box[0] + 14, sy + 14, box[0] + 110, sy + 38], radius=6, fill="#192A4E")
        draw.text((box[0] + 62, sy + 26), f"SLOT {i+1}", font=f_slot_name, fill=color_accent, anchor="mm")

        # Device badge / tag
        device_tag = s.get("perangkat", "")
        draw.text((box[2] - 16, sy + 26), device_tag, font=f_perangkat, fill="#8898D2", anchor="rm")

        # Title & Description
        draw.text((box[0] + 16, sy + 50), s["judul"], font=f_device_title, fill="#FFFBF0")
        draw.text((box[0] + 16, sy + 76), s["deskripsi"], font=f_device_desc, fill="#A4B1E0")

    # Bottom footer pill
    draw_rounded_rect(draw, [36, H - 56, W - 36, H - 24], radius=16, fill="#0B0E26", outline="#1E2A54", width=1)
    f_bot = get_font("Nunito-Bold.ttf", 13)
    draw.text((W//2, H - 40), f"Koreografi ID: {id_koreo}  ·  Kompatibel dengan semua gaya", font=f_bot, fill="#7A89BE", anchor="mm")

    keluar.parent.mkdir(parents=True, exist_ok=True)
    img.save(keluar)
    print(f"OK koreografi: {keluar}")

def main():
    tmpl_dir = ROOT / "template" / "pratinjau"
    koreo_dir = ROOT / "koreografi" / "pratinjau"

    # 1. TEMPLATES
    buat_kartu_template(
        "explainer", "Explainer", "Struktur Penjelasan Komprehensif", "60–90 s",
        [
            {"beat": "Hook", "waktu": "0–5 s", "judul": "Tarik Perhatian & Masalah Utama", "deskripsi": "Kalimat pembuka tajam & pertanyaan inti audiens.", "aksen": "#F7D16A"},
            {"beat": "Poin 1", "waktu": "5–25 s", "judul": "Konsep Dasar & Bukti Lapangan", "deskripsi": "Penjelasan poin pertama dengan visual pendukung.", "aksen": "#3A86FF"},
            {"beat": "Poin 2", "waktu": "25–50 s", "judul": "Analisis Mendalam & Contoh Nyata", "deskripsi": "Data, visualisasi, atau perbandingan langkah.", "aksen": "#00F0FF"},
            {"beat": "Ringkasan", "waktu": "50–70 s", "judul": "Checklist & Solusi Teruji", "deskripsi": "Rekap poin penting yang mudah diingat audiens.", "aksen": "#4FB286"},
            {"beat": "CTA", "waktu": "70–90 s", "judul": "Panggilan Aksi & Tindak Lanjut", "deskripsi": "Arahkan komentar, simpan, atau tautan profil.", "aksen": "#F7D16A"},
        ],
        tmpl_dir / "explainer.png"
    )

    buat_kartu_template(
        "hook-problem-solution", "Hook · Problem · Solution", "Format Singkat Padat", "30–45 s",
        [
            {"beat": "Hook", "waktu": "0–5 s", "judul": "Pernyataan Menghentak / Mitos", "deskripsi": "Patahkan asumsi umum di detik pertama.", "aksen": "#F7D16A"},
            {"beat": "Problem", "waktu": "5–20 s", "judul": "Dampak Negatif & Kebiasaan Salah", "deskripsi": "Perjelas kerugian bila masalah dibiarkan.", "aksen": "#FF4D6D"},
            {"beat": "Solution", "waktu": "20–35 s", "judul": "Jawaban Nyata & Cara Benar", "deskripsi": "Tunjukkan solusi konkret dalam 1–2 langkah.", "aksen": "#4FB286"},
            {"beat": "CTA", "waktu": "35–45 s", "judul": "Call to Action Penutup", "deskripsi": "Ajak interaksi atau bagikan ke teman.", "aksen": "#F7D16A"},
        ],
        tmpl_dir / "hook-problem-solution.png"
    )

    # 2. KOREOGRAFI
    buat_kartu_koreografi(
        "bukti-sosial", "Bukti Sosial", "Motion Graphics Tanpa Wajah", "35–40 s",
        [
            {"judul": "Headline Angka Pencapaian", "deskripsi": "Angka menghitung naik (counter) dengan bintang/metrik.", "perangkat": "penghitung", "aksen": "#00F0FF"},
            {"judul": "Anggapan Lama Dicoret", "deskripsi": "Visual coretan merah membantah naskah/asumsi keliru.", "perangkat": "coret", "aksen": "#FF4D6D"},
            {"judul": "Cutaway Format / Fitur", "deskripsi": "Jendela UI atau timeline alur kerja interaktif.", "perangkat": "timeline / terminal", "aksen": "#F7D16A"},
            {"judul": "Grid Variasi Hasil", "deskripsi": "Tampilan matriks varian atau grafik pertumbuhan.", "perangkat": "grid-variasi", "aksen": "#4FB286"},
            {"judul": "CTA Tombol Berpartikel", "deskripsi": "Reveal tombol aksi dengan partikel cahaya.", "perangkat": "partikel", "aksen": "#00F0FF"},
        ],
        koreo_dir / "bukti-sosial.png"
    )

    buat_kartu_koreografi(
        "kata-prompt", "Kata Prompt", "Eksplorasi Perintah & Jawaban", "30–40 s",
        [
            {"judul": "Hook Penegasan Kata", "deskripsi": "Teks judul dinamis menyorot problem kata kunci.", "perangkat": "judul-gaya", "aksen": "#F7D16A"},
            {"judul": "Jendela Kotak Prompt Mengetik", "deskripsi": "Mockup UI terminal/prompt mengetik instruksi.", "perangkat": "prompt-ui", "aksen": "#00F0FF"},
            {"judul": "Bantahan & Coretan Teks", "deskripsi": "Coret kata yang dilarang atau dikoreksi.", "perangkat": "coret", "aksen": "#FF4D6D"},
            {"judul": "Reveal Jawaban / Hasil AI", "deskripsi": "Munculkan hasil eksekusi dengan partikel aksen.", "perangkat": "partikel", "aksen": "#4FB286"},
            {"judul": "CTA Ajak Komen Kata Kunci", "deskripsi": "Pill ajakan komentar kata kunci tertentu.", "perangkat": "cta-pill", "aksen": "#F7D16A"},
        ],
        koreo_dir / "kata-prompt.png"
    )

    buat_kartu_koreografi(
        "tutorial-langkah", "Tutorial Langkah", "Panduan Bertahap Berurutan", "60–75 s",
        [
            {"judul": "Hook & Masalah Utama", "deskripsi": "Judul masalah yang sering dihadapi audiens.", "perangkat": "judul-gaya", "aksen": "#F7D16A"},
            {"judul": "Langkah 1 & Kartu Info", "deskripsi": "Badge langkah pertama + penjelasan singkat.", "perangkat": "langkah-1", "aksen": "#3A86FF"},
            {"judul": "Langkah 2 & Simulasi", "deskripsi": "Cutaway terminal / timeline proses kerja.", "perangkat": "terminal / timeline", "aksen": "#00F0FF"},
            {"judul": "Langkah 3 & Checklist", "deskripsi": "Animasi centang checklist item yang selesai.", "perangkat": "checklist", "aksen": "#4FB286"},
            {"judul": "Ringkasan & Call to Action", "deskripsi": "Kartu penutup berisi ringkasan aksi.", "perangkat": "cta", "aksen": "#F7D16A"},
        ],
        koreo_dir / "tutorial-langkah.png"
    )

    buat_kartu_koreografi(
        "mitos-fakta", "Mitos vs Fakta", "Bantahan Opini & Edukasi", "35–40 s",
        [
            {"judul": "Label Banner MITOS", "deskripsi": "Label tebal MITOS membuka pernyataan kontroversial.", "perangkat": "label-mitos", "aksen": "#FF4D6D"},
            {"judul": "Coret Anggapan Keliru", "deskripsi": "Efek coret dinamis di atas teks salah kaprah.", "perangkat": "coret", "aksen": "#FF4D6D"},
            {"judul": "Kartu Data Akibat / Bukti", "deskripsi": "Kartu statistik angka nyata atau grafik bukti.", "perangkat": "penghitung", "aksen": "#F7D16A"},
            {"judul": "Penegasan Chip FAKTA", "deskripsi": "Label hijau FAKTA dengan kebenaran teruji.", "perangkat": "chip-fakta", "aksen": "#4FB286"},
            {"judul": "CTA Diskusi Kolom Komentar", "deskripsi": "Ajak audiens memberikan pendapat mereka.", "perangkat": "cta", "aksen": "#00F0FF"},
        ],
        koreo_dir / "mitos-fakta.png"
    )

    buat_kartu_koreografi(
        "minimal-quote", "Minimal Quote", "Kutipan Elegan & Refleksi", "30–40 s",
        [
            {"judul": "Kutipan Pembuka Utama", "deskripsi": "Tipografi bersih berbobot menonjolkan kutipan.", "perangkat": "quote-headline", "aksen": "#FFFBF0"},
            {"judul": "Highlight Kata Kunci", "deskripsi": "Sorotan aksen atau garis penegas pada frasa inti.", "perangkat": "aksen-gaya", "aksen": "#F7D16A"},
            {"judul": "Narasi Makna & Refleksi", "deskripsi": "Paragraf penjelas yang mengalir tenang.", "perangkat": "teks-penjelas", "aksen": "#A4B1E0"},
            {"judul": "Pemberian Sumber & Tokoh", "deskripsi": "Atribusi penulis / tokoh dengan tipografi rapi.", "perangkat": "lower-third", "aksen": "#4FB286"},
            {"judul": "CTA Simpan / Bagikan", "deskripsi": "Ajak audiens menyimpan kutipan inspiratif ini.", "perangkat": "cta-minimal", "aksen": "#FFFBF0"},
        ],
        koreo_dir / "minimal-quote.png"
    )

if __name__ == "__main__":
    main()
