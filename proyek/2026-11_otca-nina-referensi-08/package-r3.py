from pathlib import Path
import json, html, shutil, hashlib
from PIL import Image, ImageDraw, ImageFont

r=Path.cwd();p=r/'proyek/2026-11_otca-nina-referensi-08';o=p/'out/r3'
d=json.loads((p/'storyboard-props-r3.json').read_text(encoding='utf-8-sig'))
notes=[
('Peluang yang terbatas','Cabang program terbentuk; titik bergerak menuju peluang S1, jalur lain meredup. Tanpa angka peluang rekaan.'),
('Direktori program','Lembar DAAD terangkat keluar dari map; sampul dan lembar adalah objek terpisah. Label pendanaan menyusul setelah lembar terbaca.'),
('Sasaran pendanaan','Tiga cabang tersambung berurutan ke S2, doktoral, dan penelitian sesuai ucapan. Buku di setiap cabang memberi konteks jenjang.'),
('Kursus musim panas','Lembar kalender berputar pada engsel atas. Sel periode tersorot saat kursus disebut; buku bahasa menjadi pasangan ilustrasinya.'),
('Perbedaan cakupan','Buku kursus dan kampus bergerak menjauh; pembatas tumbuh di antaranya. Panjang garis tidak mewakili durasi atau biaya.'),
('Status mahasiswa','Figur memasuki konteks kampus. Pesan visual: status mahasiswa belum menjamin beasiswa. Talent kembali menjadi pusat penjelasan.'),
('Proses seleksi','Berkas terangkat; garis pemeriksa melintasi dokumen. Jalur dan indikator prestasi, persyaratan, seleksi aktif berurutan. Indikator berarti tahap dibahas, bukan pelamar pasti lolos.'),
('Rencana studi','Buku, lembar rencana, dan kampus tersusun di jalur persiapan. Gerak mereda untuk memberi ruang pada saran talent.'),
('Ajakan asli','Penunjuk mendekati link di bio; tombol merespons tekanan singkat dan lingkaran respons meluruh. Penutup mengikuti sumber.')]
font=ImageFont.truetype(str(r/'pipeline/fonts/Montserrat-ExtraBold.ttf'),21)
small=ImageFont.truetype(str(r/'pipeline/fonts/Montserrat-Bold.ttf'),15)
sheet=Image.new('RGB',(1020,1990),'#111111');dr=ImageDraw.Draw(sheet)
dr.text((24,20),'OTCA / NINA — NATIVE REMOTION · R3',font=font,fill='#FDF1A4')
cards=[]
for i,s in enumerate(d['scenes']):
 name=f"check-{round(s['sample']*30)}.png";im=Image.open(o/name).convert('RGB');im.thumbnail((312,555))
 x=24+(i%3)*332;y=80+(i//3)*630;sheet.paste(im,(x,y));dr.text((x,y+565),f"{s['id']}  {s['start']:.1f}–{s['end']:.1f}s",font=font,fill='white')
 dr.text((x,y+593),'LAYAR PENUH' if s['mode']=='full' else 'GRAFIS ATAS · TALENT BAWAH',font=small,fill='#C9AC63')
 s['motion']=notes[i][1];s['image']=name
 vo=' '.join(w['text'] for page in d['captions'] for line in page['lines'] for w in line if s['start']<=w['startMs']/1000<s['end'])
 cards.append(f'<article id="s{s["id"]}"><a href="{name}"><img src="{name}" alt="Adegan {s["id"]}"></a><div><p class="tag">ADEGAN {s["id"]} / {s["start"]:.2f}–{s["end"]:.2f} DETIK</p><h2>{notes[i][0]}</h2><p>{notes[i][1]}</p><details><summary>Ucapan sumber</summary><p>{html.escape(vo)}</p></details></div></article>')
sheet.save(o/'storyboard-kontak.jpg',quality=94)
phasecards=[]
for title,frames in [('Lembar keluar dari map',[165,177,193]),('Halaman kalender berputar',[603,613,627]),('Pemeriksaan aplikasi bertahap',[990,1047,1122])]:
 phase=Image.new('RGB',(990,700),'#121212');pd=ImageDraw.Draw(phase);pd.text((20,15),title,font=font,fill='#FDF1A4')
 snippets=[]
 for j,f in enumerate(frames):
  im=Image.open(o/f'check-{f}.png').convert('RGB');im.thumbnail((300,534));phase.paste(im,(15+j*330,65));pd.text((15+j*330,615),f'{f/30:.2f} detik',font=font,fill='white')
  snippets.append(f'<figure><a href="check-{f}.png"><img src="check-{f}.png"></a><figcaption>{f/30:.2f} detik</figcaption></figure>')
 name=f'fase-{frames[0]}.jpg';phase.save(o/name,quality=94);phasecards.append(f'<h3>{title}</h3><div class="phases">'+''.join(snippets)+'</div>')
for name in ['thumbnail.png','thumbnail-grid.png']:shutil.copy2(p/'out/r2'/name,o/name)
css='body{margin:0;background:#101010;color:#eee;font:17px/1.65 system-ui}main{max-width:1100px;margin:auto;padding:40px 24px}h1{font-size:42px;line-height:1.15}h2{font-size:29px}.tag,h3{color:#e5c86e}.tag{font-size:13px;letter-spacing:1px}nav{display:flex;gap:12px;flex-wrap:wrap;position:sticky;top:0;background:#101010;padding:16px 0;z-index:2}a{color:#e5c86e}nav a{padding:5px 12px;border:1px solid #55482a;text-decoration:none}article{display:grid;grid-template-columns:340px 1fr;gap:40px;padding:40px 0;border-bottom:1px solid #333;scroll-margin-top:80px}article img{width:100%}details{padding:15px;background:#1b1b1b;margin-top:20px;cursor:pointer}.phases{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}figure{margin:0}figure img{width:100%}figcaption{font-size:14px}.thumbs{display:flex;gap:24px}.thumbs img{width:260px}.note{padding:20px;border-left:3px solid #d9b95d;background:#1b1914}@media(max-width:700px){article{grid-template-columns:1fr}.phases{gap:6px}.thumbs{flex-wrap:wrap}h1{font-size:32px}}'
page=f'<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OTCA · Native Remotion R3</title><style>{css}</style><main><p class="tag">REVISI 03 · MENUNGGU PERSETUJUAN</p><h1>Grafis yang bekerja.<br>Objek yang merespons.</h1><p>9 adegan / 51,55 detik / SVG & React di Remotion.</p><p class="note">Semua ilustrasi di sini dibangun dari kode; tidak memakai aset ImageGen revisi sebelumnya. Logo resmi dan rekaman talent tetap media sumber. Ini storyboard gambar, bukan video final. Keluwesan gerak dan transisi belum dinilai melalui playback.</p><p>Grafis emas di atas dan talent di bawah, bergantian dengan tiga adegan layar penuh. Subtitle Montserrat editorial, maksimal dua baris; ucapan dan CTA tetap dari video sumber.</p>'
page+='<nav>'+''.join(f'<a href="#s{s["id"]}">{s["id"]}</a>' for s in d['scenes'])+'<a href="#fase">Fase aksi</a><a href="#cover">Cover</a></nav>'+''.join(cards)
page+='<h2 id="fase">Periksa aksi, bukan hanya pose</h2><p>Urutan kiri ke kanan menunjukkan perubahan objek pada waktu berbeda. Buka gambar untuk memperbesar.</p>'+''.join(phasecards)
page+='<h2 id="cover">Cover OTCA</h2><p>Template OTCA v1.2 dari proyek Nina yang sama; headline maksimal tiga baris, subheadline maksimal dua.</p><div class="thumbs"><a href="thumbnail.png"><img src="thumbnail.png"></a><a href="thumbnail-grid.png"><img src="thumbnail-grid.png"></a></div><h2>Persetujuan</h2><p>Sebut nomor adegan dan bagian yang ingin direvisi. Video final tetap ditahan sampai Anda menyetujui arah ini. Tahap berikutnya memoles kontinuitas, bobot gerak, masking talent, dan audio.</p></main></html>'
(o/'storyboard.html').write_text(page,encoding='utf-8')
(p/'storyboard-r3.json').write_text(json.dumps(dict(status='belum-disetujui',imagegen=False,final_render=False,scenes=d['scenes']),ensure_ascii=False,indent=2),encoding='utf-8')
src=r/'remotion/src/storyboards/NinaNativeReview.tsx'
(o/'review-notes.json').write_text(json.dumps(dict(status='pending-user-review',native_art='SVG/React',imagegen_assets_used=False,caption_max_lines=max(len(x['lines']) for x in d['captions']),source_sha256=hashlib.sha256(src.read_bytes()).hexdigest(),motion_playback_review=False,final_render=False),indent=2),encoding='utf-8')
print('R3: 9 scenes + 3 action sequences, approval pending.')
