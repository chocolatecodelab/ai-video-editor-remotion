from pathlib import Path
import json,copy,shutil,html,hashlib
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[3];P=R/'proyek/2026-11_otca-nina-beasiswa-s1';O=P/'out';O.mkdir(exist_ok=True);S=O/'storyboard-r1';S.mkdir(exist_ok=True)
W=json.loads((P/'cache/words.json').read_text(encoding='utf8'))
# Preserve ASR output; only known brand spelling is normalized in the review copy.
review=copy.deepcopy(W)
for w in review['kata']:
 if w['w']=='OTKA.':w['w']='OTCA.'
review['_meta'].update(dikoreksi=False,catatan='Ejaan brand OTKA → OTCA pada salinan tinjauan; isi/timestamp perlu pemeriksaan pengguna. ASR asli tetap di words.json.')
(P/'cache/words-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2),encoding='utf8')
scenes=[
('01',0,4.1,'split','Peluang S1','BEASISWA S1','TERBATAS','aperture',['peluang beasiswa S1 di Jerman','ternyata sangat terbatas.'],0,'Bidang pendanaan membuka sebagai celah terukur; fokus menyempit pada S1 saat “terbatas”, lalu diam. Tanpa angka peluang atau tanda tidak mungkin.','Garis celah menjadi punggung direktori program.','paper-soft'),
('02',4.1,8.1,'split','Kenali DAAD','MENGENAL','DAAD','directory',['Contohnya DAAD,','lembaga pemberi beasiswa'],1,'Direktori berputar ringan pada engsel; nama DAAD terungkap lewat mask horizontal. Nama organisasi berupa teks, bukan logo rekaan.','Tab direktori diteruskan ke kategori penerima.','page-turn'),
('03',8.1,16.5,'full','Sasaran pendanaan','SASARAN','PENDANAAN','branches',['Sebagian besar program','pendanaannya memang ditujukan'],2,'Tab DAAD melebar menjadi tiga jalur. S2, doktoral, dan peneliti mendapat fokus bergiliran mengikuti kata; tidak diberi persentase atau ukuran pangsa. Setelah tiap reveal, objek settle.','Lembar jalur terakhir menjadi lembar kalender.','soft-tick'),
('04',16.5,22.9,'split','Peluang program tertentu','KURSUS','MUSIM PANAS','calendar',['seperti kursus musim panas','bahasa Jerman.'],3,'Satu lembar kalender terlipat dan membuka halaman kursus bahasa. Ikon buku menggantikan tanggal; tidak menambahkan jadwal atau syarat yang tidak diucapkan.','Tepi halaman kalender membuka dua bidang perbandingan.','paper-soft'),
('05',22.9,27.93,'full','Bedakan cakupan','CAKUPANNYA','BERBEDA','compare',['Tetapi program ini berbeda','dari beasiswa'],4,'Halaman kursus dan lembar studi dipisahkan; tanda berbeda digambar sekali pada kata “berbeda”. Teks kursus bahasa vs kuliah S1 penuh menetap untuk dibaca. Tidak memakai tanda silang yang berarti kursusnya tidak sah.','Garis pembatas menjadi ambang kampus.','soft-swipe'),
('06',27.93,30.95,'split','Status mahasiswa','SUDAH KULIAH','DI JERMAN','campus',['Bahkan ketika sudah menjadi','mahasiswa di Jerman,'],4,'Bidang kampus terbentuk lewat reveal arsitektur sederhana; satu berkas mahasiswa masuk ke area peninjauan. Tidak ada cap lolos otomatis.','Berkas yang sama dibawa ke proses seleksi.','soft-slide'),
('07',30.95,39.7,'full','Seleksi tetap berlaku','BEASISWA','TETAP SELEKTIF','selection',['prestasi, persyaratan,','dan proses seleksi.'],5,'Berkas ditinjau melalui tiga tahap; prestasi → persyaratan → seleksi menyala pada ucapan. Pada “tidak semua”, garis berhenti di area keputusan tanpa simbol semua lolos. Tidak menggambarkan rasio penerima.','Berkas seleksi ditutup menjadi map perencanaan.','soft-tick'),
('08',39.7,45.7,'split','Rencanakan dengan matang','RENCANA STUDI','YANG MATANG','plan',['Jadi, jangan hanya','mengandalkan beasiswa'],6,'Map perencanaan membuka beberapa lembar; beasiswa menjadi salah satu lembar, tidak mengisi seluruh rencana. Tidak menambah paket layanan, harga, atau janji hasil.','Garis map mengarahkan mata ke CTA.','paper-soft'),
('09',45.7,50.3,'split','CTA sumber','KLIK LINK','DI BIO','cta',['Klik link di bio untuk mulai','persiapkan studi anak ke Jerman'],7,'Penanda link disorot satu kali saat ucapan, lalu tahan. Tanpa tombol palsu yang seolah bisa diklik dalam MP4, tanpa URL/nomor tambahan. Talent tetap hadir menyampaikan ajakan.','Cut bersih ke identitas brand setelah ucapan selesai.','soft-tap'),
('10',50.3,51.547,'full','Penutup','OTCA','', 'brand',[],7,'Logo resmi besar masuk tenang dan tahan; tidak menambah CTA/narasi. Tidak memotong akhir kata.','Selesai.','none')]
G='#CB9D31';H='#FDF1A4';B='#B3822C';WHITE='#FFFFFF';M='#D6D6D6';BLACK='#000000'
fonts=R/'pipeline/fonts'
def font(size,weight='Bold'):return ImageFont.truetype(str(fonts/f'Montserrat-{weight}.ttf'),size)
def txt(d,xy,t,size=48,fill=WHITE,weight='Bold',anchor=None):d.text(xy,t,font=font(size,weight),fill=fill,anchor=anchor)
def line(d,pts,fill=G,width=7):d.line(pts,fill=fill,width=width,joint='curve')
def rect(d,box,fill=None,outline=G,width=7,r=4):d.rounded_rectangle(box,r,fill=fill,outline=outline,width=width)
def gradient_rect(im,box):
 x,y,x2,y2=map(int,box);grad=Image.new('RGB',(x2-x,y2-y));dr=ImageDraw.Draw(grad)
 stops=[(203,157,49),(253,241,164),(179,130,44)]
 for j in range(y2-y):
  u=j/max(1,y2-y-1)*2;i=min(1,int(u));a=u-i;c=tuple(round(stops[i][k]*(1-a)+stops[i+1][k]*a) for k in range(3));dr.line((0,j,x2-x,j),fill=c)
 im.paste(grad,(x,y))
def sheet(d,x,y,w,h,label='',angle=False):
 d.polygon([(x+13,y+13),(x+w+13,y+13),(x+w+13,y+h+13),(x+13,y+h+13)],fill='#17130A')
 rect(d,(x,y,x+w,y+h),fill='#090909',outline=G,width=5)
 if label:txt(d,(x+25,y+25),label,42,G)
 for k in range(3):line(d,[(x+28,y+h*.52+k*28),(x+w-34-(k%2)*24,y+h*.52+k*28)],fill='#D6D6D6',width=4)
def graphic(im,kind,full,phase=1):
 d=ImageDraw.Draw(im);top=690 if full else 650;height=470 if full else 230
 # Native full composition uses different bounds and geometry, not a scaled split image.
 if kind=='aperture':
  x=228;y=top-5;sheet(d,x,y,500,205,'S1');rect(d,(x-12,y-14,x+54,y+222),fill=BLACK,outline=G,width=7);line(d,[(x+553,y-10),(x+553,y+220)],G,7)
 elif kind=='directory':
  x=248;y=top;d.polygon([(x-15,y-12),(x+465,y-12),(x+485,y+202),(x+5,y+202)],fill='#211B0E');sheet(d,x,y,480,198,'DAAD');line(d,[(x+20,y+158),(x+420,y+158)],G,7)
 elif kind=='branches':
  x=154;ys=[top+5,top+155,top+305];names=['S2','DOKTORAL','PENELITI']
  line(d,[(x,top+24),(x,top+390)],G,7)
  for j,(y,n) in enumerate(zip(ys,names)):
   if j >= (1 if phase<.34 else 2 if phase<.67 else 3):continue
   line(d,[(x,y+50),(x+85,y+50)],G,7);gradient_rect(im,(x+88,y,x+100,y+100));d=ImageDraw.Draw(im);txt(d,(x+135,y+13),n,62,G,'ExtraBold');txt(d,(x+135,y+88),['Lanjutan setelah S1','Studi doktoral','Kegiatan penelitian'][j],34,WHITE,'Medium')
 elif kind=='calendar':
  x=232;y=top-5;rect(d,(x,y,x+540,y+230),fill='#090909',outline=G,width=5);gradient_rect(im,(x,y,x+540,y+14));d=ImageDraw.Draw(im)
  for a in [x+65,x+475]:line(d,[(a,y-20),(a,y+22)],H,8)
  txt(d,(x+270,y+57),'KURSUS BAHASA',40,WHITE,anchor='mt');txt(d,(x+270,y+115),'Aa',78,G,'ExtraBold',anchor='mt')
 elif kind=='compare':
  for x,n,sub in [(128,'KURSUS','Bahasa Jerman'),(598,'KULIAH S1','Pendanaan penuh')]:
   sheet(d,x,top+35,335,345);txt(d,(x+167,top+75),n,42,G,anchor='mt');txt(d,(x+167,top+145),sub,34,WHITE,'Medium',anchor='mt')
  line(d,[(493,top+155),(557,top+155)],H,7);line(d,[(493,top+185),(557,top+185)],H,7);line(d,[(547,top+122),(500,top+220)],H,7)
 elif kind=='campus':
  x=300;y=top+10;d.polygon([(x,y+70),(x+225,y-15),(x+450,y+70)],outline=G,width=7)
  for j in range(5):line(d,[(x+40+j*90,y+88),(x+40+j*90,y+180)],WHITE,7)
  line(d,[(x-15,y+196),(x+465,y+196)],G,7)
 elif kind=='selection':
  ys=[top+5,top+150,top+295]
  for j,(y,n) in enumerate(zip(ys,['PRESTASI','PERSYARATAN','SELEKSI'])):
   if j >= (1 if phase<.34 else 2 if phase<.67 else 3):continue
   txt(d,(160,y+8),str(j+1).zfill(2),42,G,'ExtraBold');line(d,[(245,y),(245,y+90)],G,7);txt(d,(285,y+7),n,56,WHITE,'Bold');line(d,[(285,y+85),(900,y+85)],'#55472A',3)
 elif kind=='plan':
  x=240;y=top;d.polygon([(x-20,y+26),(x+130,y+26),(x+160,y),(x+530,y),(x+550,y+225),(x-20,y+225)],fill='#141109',outline=G,width=6)
  for j in range(3):line(d,[(x+35+j*15,y+58+j*40),(x+450,y+58+j*40)],WHITE if j!=1 else G,8)
  txt(d,(x+30,y+165),'RENCANA STUDI',36,G)
 elif kind=='cta':
  x=246;y=top;rect(d,(x,y,x+540,y+196),fill='#090909',outline=G,width=5);txt(d,(x+40,y+52),'LINK DI BIO',52,WHITE,'ExtraBold');line(d,[(x+430,y+125),(x+485,y+70),(x+440,y+70)],G,7);line(d,[(x+485,y+70),(x+485,y+115)],G,7)

def caption(im,lines,full):
 if not lines:return
 d=ImageDraw.Draw(im)
 if full:
  # Editorial body, isolated reading area. Gold block highlights actual spoken phrase.
  y=1270;gradient_rect(im,(108,y+3,115,y+171));d=ImageDraw.Draw(im)
  size=58
  while max(d.textbbox((0,0),t,font=font(size))[2] for t in lines)>760:size-=1
  for j,t in enumerate(lines):
   if j==len(lines)-1:
    width=d.textbbox((0,0),t,font=font(size))[2]
    rect(d,(138,y+j*86-3,158+width,y+j*86+size+23),fill=G,outline=None,r=8)
    txt(d,(148,y+j*86),t,size,BLACK)
   else:txt(d,(148,y+j*86),t,size,WHITE)
 else:
  y=910;rect(d,(108,y,960,y+150),fill=BLACK,outline=G,width=3,r=18)
  for j,t in enumerate(lines):
   size=47
   while d.textbbox((0,0),t,font=font(size))[2]>790:size-=1
   txt(d,(534,y+22+j*56),t,size,WHITE,anchor='mt')

def make(scene,phase=1):
 id,a,b,mode,label,title1,title2,kind,cap,source,motion,trans,sfx=scene;full=mode=='full';im=Image.new('RGB',(1080,1920),BLACK)
 if not full:
  path=P/f'cache/storyboard/talent-{source}.png'
  if path.exists():
   talent=Image.open(path).convert('RGBA').resize((1080,1920),Image.Resampling.LANCZOS)
   # Crop/reposition from source for a lower-half portrait. No text overlays the person.
   cut=talent.crop((0,400,1080,1450));im.paste(cut,(0,1010),cut)
  else:
   talent=Image.open(P/f'cache/storyboard/source-{source}.jpg').resize((1080,1920));im.paste(talent.crop((0,400,1080,1310)),(0,1010))
 logo=Image.open(P/'aset/grafis/logo-otca.png').convert('RGBA');logo.thumbnail((235,72),Image.Resampling.LANCZOS);im.paste(logo,((1080-logo.width)//2,315),logo)
 d=ImageDraw.Draw(im)
 if kind=='brand':
  big=Image.open(P/'aset/grafis/logo-otca.png').convert('RGBA');big.thumbnail((700,215));im.paste(big,((1080-big.width)//2,800),big);return im
 for j,t in enumerate([title1,title2]):
  if t:
   size=85 if full else 76
   while d.textbbox((0,0),t,font=font(size,'ExtraBold'))[2]>852:size-=1
   txt(d,(534,425+j*94),t,size,G,'ExtraBold',anchor='mt')
 graphic(im,kind,full,phase);caption(im,cap,full)
 return im
records=[]
for scene in scenes:
 id,a,b,mode,label,*_=scene;im=make(scene);im.resize((540,960),Image.Resampling.LANCZOS).save(S/f'{id}.png')
 words=[w for w in review['kata'] if a<=w['s']<b]
 records.append({'id':id,'mulai':a,'selesai':b,'mode':mode,'judul':label,'headline':[scene[5],scene[6]],'visual':scene[7],'contoh_caption':scene[8],'ucapan':' '.join(w['w'] for w in words),'motion':scene[10],'transisi':scene[11],'sfx':scene[12],'still':f'storyboard-r1/{id}.png','status':'draf-belum-disetujui'})
for index in [2,6]:
 for state,phase in [('awal',0.1),('aksi',0.5),('akhir',1)]:
  make(scenes[index],phase).resize((540,960),Image.Resampling.LANCZOS).save(S/f'{scenes[index][0]}-{state}.png')
# Full/split longest phrase example is visible as an additional design proof.
longscene=list(scenes[2]);longscene[8]=['lulusan S1 yang ingin','melanjutkan S2,'];make(tuple(longscene)).resize((540,960),Image.Resampling.LANCZOS).save(S/'caption-full.png')
longscene=list(scenes[8]);longscene[8]=['persiapkan studi anak ke Jerman','bersama tim OTCA.'];make(tuple(longscene)).resize((540,960),Image.Resampling.LANCZOS).save(S/'caption-split.png')
board={'versi':1,'proyek':P.name,'status':'draf-belum-disetujui','durasi':51.547,'fps':30,'resolusi':[1080,1920],'catatan':'Still desain konsep, bukan frame MP4 final atau bukti kualitas animasi. Subtitle ditampilkan contoh frase; final mengikuti words-review yang ditinjau.','adegan':records}
(P/'storyboard-r1.json').write_text(json.dumps(board,ensure_ascii=False,indent=2),encoding='utf8')
manifest=json.loads((P/'manifest.json').read_text(encoding='utf8'));manifest.update(proyek=P.name,judul='Beasiswa S1 di Jerman — Mbak Nina',status='storyboard-draf');manifest['token_override']['_catatan']='Brand asli: D:/KERJAAN/OTCA/BRAND GUIDELINES/Brand Guidelines OTCA New.pdf; proyek ini saja.';manifest['storyboard'].update(file='out/storyboard.html',data='storyboard-r1.json');(P/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
# Contact sheet with clear review labels, outside video artwork.
cs=Image.new('RGB',(5*270,2*532),'#121212');d=ImageDraw.Draw(cs)
for i,s in enumerate(records):
 x=i%5*270;y=i//5*532;cs.paste(Image.open(S/f"{s['id']}.png").resize((270,480)),(x,y));d.text((x+8,y+486),f"{s['id']}  {s['mulai']:.1f}-{s['selesai']:.1f}s",font=font(13),fill=WHITE);d.text((x+8,y+508),s['mode'].upper(),font=font(12),fill=G)
cs.save(O/'kontak-storyboard-r1.jpg',quality=95)
# Human review transcript grouped by actual timeline.
(P/'naskah.md').write_text('# Transkrip tinjauan — belum disetujui\n\nWhisper large-v3; ejaan OTCA dinormalisasi, tanpa mengubah suara.\n\n'+'\n\n'.join(f"## {s['id']} · {s['mulai']:.2f}–{s['selesai']:.2f} detik\n\n{s['ucapan']}" for s in records if s['ucapan']),encoding='utf8')
print('10 design stills, 2 caption proofs, contact sheet, storyboard data and transcript written')
