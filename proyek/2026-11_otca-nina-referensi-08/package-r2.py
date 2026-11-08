import json, shutil, hashlib, html
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root=Path.cwd(); p=root/'proyek/2026-11_otca-nina-referensi-08'; out=p/'out/r2'
props=json.loads((p/'storyboard-props-r2.json').read_text(encoding='utf-8-sig'))
notes=[
 ('Kampus sebagai konteks, wajah sebagai pembuka.', 'Kampus masuk dengan putaran kecil; garis penekanan muncul pada kata “terbatas”.', 'Masuk ke berkas program saat DAAD disebut.'),
 ('Berkas program menjadi objek utama di samping talent.', 'Lembar PROGRAM ditarik naik dari dossier, mengikuti pembahasan lembaga pendanaan.', 'Beralih dari contoh lembaga ke jenjang penerima.'),
 ('Layar penuh: buku dan topi wisuda, tiga jenjang terbaca terpisah.', 'Jalur S2, doktoral, lalu peneliti terbentuk bertahap mengikuti ucapan. Jangan muncul sekaligus.', 'Objek studi diteruskan sebagai pendukung pada adegan kursus.'),
 ('Kalender menjelaskan program yang berlangsung pada periode tertentu.', 'Kalender menghadap penonton; tiga sel periode menguat saat “kursus musim panas”.', 'Pisahkan cakupan kursus dari pembiayaan kuliah.'),
 ('Layar penuh: objek studi dan kampus dipisahkan secara visual.', 'Kedua objek bergeser menjauh, garis pembatas tumbuh saat narasi menyatakan perbedaan.', 'Kampus kembali menjadi latar konteks mahasiswa di Jerman.'),
 ('Talent kembali dominan untuk menjaga ritme penjelasan.', 'Dorongan kamera sangat pelan; kampus redup sebagai konteks, bukan objek yang terus berputar.', 'Berkas aplikasi mengambil alih saat persyaratan dibahas.'),
 ('Layar penuh: berkas aplikasi dan tiga kriteria.', 'Lembar aplikasi terangkat; penanda prestasi, persyaratan, dan seleksi aktif berurutan.', 'Kembali ke talent setelah penjelasan bahwa beasiswa tidak otomatis.'),
 ('Talent menyampaikan inti saran, kampus dan buku sebagai pendukung.', 'Buku bergeser menuju posisi rencana studi; perhatian tetap pada wajah dan kalimat sumber.', 'Pindahkan fokus ke ajakan asli.'),
 ('Penutup asli, dengan penanda LINK DI BIO yang jelas.', 'Bidang CTA masuk satu kali mengikuti ucapan; hindari kedipan dan pantulan berulang.', 'Tahan penutup hingga ucapan tim OTCA selesai.')]

fontpath=root/'pipeline/fonts/Montserrat-ExtraBold.ttf'
f=ImageFont.truetype(str(fontpath),21); small=ImageFont.truetype(str(fontpath),15)
sheet=Image.new('RGB',(1020,1990),'#111111'); draw=ImageDraw.Draw(sheet)
draw.text((24,18),'OTCA / NINA — STORYBOARD REVISI 02',font=f,fill='#F7EEAC')
cards=[]
for i,s in enumerate(props['scenes']):
 frame=round(s['sample']*30); filename=f'check-{frame}.png'
 im=Image.open(out/filename).convert('RGB');im.thumbnail((312,555))
 x=24+(i%3)*332;y=80+(i//3)*630
 sheet.paste(im,(x,y));draw.text((x,y+565),f"{s['id']}  {s['start']:.1f}–{s['end']:.1f}s",font=f,fill='white')
 draw.text((x,y+593),'LAYAR PENUH' if s['mode']=='full' else 'TALENT + ASET',font=small,fill='#C9AC63')
 s['motion']=notes[i][1];s['transition']=notes[i][2];s['design']=notes[i][0];s['image']=filename
 vo=' '.join(w['text'] for page in props['captions'] for line in page['lines'] for w in line if s['start']<=w['startMs']/1000<s['end'])
 esc=html.escape
 cards.append(f'<article id="s{s["id"]}"><a href="{filename}"><img loading="lazy" src="{filename}" alt="Adegan {s["id"]}"></a><div><p class="tag">ADEGAN {s["id"]} · {s["start"]:.2f}–{s["end"]:.2f} detik · {"LAYAR PENUH" if s["mode"]=="full" else "TALENT + ASET"}</p><h2>{esc(" ".join(s["title"]))}</h2><p>{esc(notes[i][0])}</p><h3>Rencana gerak</h3><p>{esc(notes[i][1])}</p><h3>Sambungan adegan</h3><p>{esc(notes[i][2])}</p><details><summary>Ucapan sumber</summary><p>{esc(vo)}</p></details></div></article>')
sheet.save(out/'storyboard-kontak.jpg',quality=94)
old=root/'proyek/2026-11_otca-nina-beasiswa-s1/out'
thumbs=[]
for name in ['thumbnail.png','thumbnail-grid.png']:
 if (old/name).exists():shutil.copy2(old/name,out/name);thumbs.append(f'<a href="{name}"><img src="{name}" alt="{name}"></a>')
phases=''.join(f'<figure><img src="check-{frame}.png"><figcaption>{label}</figcaption></figure>' for frame,label in [(348,'11,6 dtk · sebelum jenjang disebut'),(411,'13,7 dtk · S2'),(477,'15,9 dtk · tiga jenjang'),(990,'33,0 dtk · berkas awal'),(1047,'34,9 dtk · kriteria berkembang'),(1122,'37,4 dtk · seleksi')])
page='''<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OTCA Nina · Storyboard revisi 02</title><style>body{margin:0;background:#101010;color:#eee;font:17px/1.65 system-ui}main{max-width:1150px;margin:auto;padding:40px 24px}h1{font-size:42px;line-height:1.15}h2{font-size:27px}h3{font-size:17px;color:#e5c86e;margin-bottom:4px}p{margin-top:8px}.tag{color:#e5c86e;font-size:13px;letter-spacing:1px}nav{display:flex;gap:12px;flex-wrap:wrap;position:sticky;top:0;background:#101010;padding:16px 0;z-index:2}a{color:#e5c86e}nav a{padding:6px 12px;border:1px solid #55482a;text-decoration:none}article{display:grid;grid-template-columns:340px 1fr;gap:40px;padding:40px 0;border-bottom:1px solid #333;scroll-margin-top:80px}article img{width:100%;height:auto}details{padding:15px;background:#1b1b1b;margin-top:20px;cursor:pointer}.phases{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}figure{margin:0}figure img{width:100%}figcaption{font-size:14px}.thumbs{display:flex;gap:24px}.thumbs img{width:260px}.note{padding:20px;border-left:3px solid #d9b95d;background:#1b1914}@media(max-width:700px){article{grid-template-columns:1fr}.phases{grid-template-columns:repeat(2,1fr)}.thumbs{flex-wrap:wrap}h1{font-size:32px}}</style><main><p class="tag">OFFICIAL OTCA · REVISI 02 · MENUNGGU PERSETUJUAN</p><h1>Lebih banyak objek.<br>Pesan tetap dari suara asli.</h1><p>9 adegan · sekitar 51,55 detik · hitam, emas, putih · Montserrat.</p><p class="note">Ini gambar yang dirender dari komposisi Remotion, bukan video final. Gambar menilai tata letak dan tahapan aksi; keluwesan, tempo, audio, dan transisi belum dinyatakan lulus. Tidak ada render video final pada revisi ini.</p><p>Aset kampus, buku/topi wisuda, dan berkas merupakan ilustrasi buatan, bukan kampus atau dokumen resmi DAAD. Tata letak talent di samping objek pada beberapa adegan merupakan alternatif yang diajukan di revisi ini; mohon tinjau bersama pilihan grafis atas + talent bawah.</p><p>Subtitle editorial: maksimal dua baris, hierarki 52/64 px pada kanvas 1080 px, aksen kata penting dan garis kata aktif. Gaya yang sama diterapkan pada layar penuh maupun talent.</p>'''
page+='<nav>'+''.join(f'<a href="#s{s["id"]}">{s["id"]}</a>' for s in props['scenes'])+'<a href="#gerak">Tahapan gerak</a><a href="#cover">Cover</a></nav>'+''.join(cards)
page+='<h2 id="gerak">Tahapan gerak yang diajukan</h2><p>Baca dari kiri ke kanan. Ini sampel posisi objek pada beberapa waktu, bukan bukti animasi sudah halus.</p><div class="phases">'+phases+'</div><h2 id="cover">Thumbnail OTCA</h2><p>Cover dari proyek Nina yang sama, mengikuti template terkunci v1.2. Termasuk dalam tinjauan ini; tidak diubah mengikuti gaya adegan video.</p><div class="thumbs">'+''.join(thumbs)+'</div><h2>Yang perlu diputuskan</h2><p>Tinjau komposisi, kepadatan aset, gaya subtitle, dan layout talent. Sebut nomor adegan jika ingin revisi. Persetujuan desain belum diberikan; render final tetap ditahan.</p></main></html>'
(out/'storyboard.html').write_text(page,encoding='utf-8')
(p/'storyboard-r2.json').write_text(json.dumps(dict(status='belum-disetujui',jenis='still Remotion',final_render=False,scenes=props['scenes']),ensure_ascii=False,indent=2),encoding='utf-8')
audit=json.loads((out/'dom-check.json').read_text()); issues=[dict(frame=a['frame'],item=i) for a in audit for i in a['items'] if i['overflow'] or i['x']<0 or i['x']+i['w']>1080]
(out/'review-notes.json').write_text(json.dumps(dict(layout_issues=issues,caption_words_preserved=True,caption_max_lines=max(len(x['lines']) for x in props['captions']),motion_quality='belum diverifikasi melalui playback',approval='pending'),indent=2),encoding='utf-8')
assets=[]
for name,description in [('campus','Generic fictional German university; ivory limestone, slate roof, three-quarter view; no text or logos.'),('study','Black mortarboard, brass tassel, open cream books; tactile materials; no text.'),('dossier','Charcoal linen folder, brass corners, ivory ruled papers, gold clip and fountain pen; no official markings.')]:
 path=p/'aset/r2'/f'{name}.png';assets.append(dict(file=str(path.relative_to(root)),tool='imagegen',prompt_summary=description,transparent_background=True,sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
(p/'asset-provenance-r2.json').write_text(json.dumps(assets,indent=2),encoding='utf-8')
print(f'Packaged 9 scenes; {len(issues)} DOM boundary/overflow issues; approval pending.')
