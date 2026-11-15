from pathlib import Path
import json,textwrap,html
from PIL import Image,ImageOps,ImageDraw,ImageFont

P=Path(__file__).resolve().parent;ROOT=P.parents[1]
NAVY='#101827';SLATE='#26364C';SAND='#C5B69A';IVORY='#EDEAE4';SAGE='#718A83'
fontpath=str(ROOT/'pipeline/fonts/Inter-Variable.ttf')
font=lambda n:ImageFont.truetype(fontpath,n)
src=Image.open(P/'cache/source-03.png').convert('RGB')
cards=[]
for mode in ('right','left','full'):
    im=Image.new('RGB',(1080,1920),NAVY);d=ImageDraw.Draw(im)
    if mode!='full':
        panel=ImageOps.fit(src,(560,1920),centering=(.5,.5))
        im.paste(panel,(520 if mode=='right' else 0,0));d=ImageDraw.Draw(im)
        x=70 if mode=='right' else 610
        d.text((x,280),'A new chapter',font=font(48),fill=IVORY)
        # Illustration is a layout sketch, not a claimed native animation.
        d.rectangle((x,1020,x+360,1062),fill=SAND)
        d.polygon([(x+10,1000),(x+160,1020),(x+160,750),(x+10,725)],fill=SLATE,outline=SAND)
        d.polygon([(x+170,1020),(x+320,1000),(x+320,725),(x+170,750)],fill=SLATE,outline=SAND)
        for y in (790,830,870):d.line((x+195,y,x+295,y-10),fill=SAGE,width=3)
        d.line((x,1065,x+360,1065),fill=SAGE,width=3)
        d.text((x,1290),'failure is never\nthe end',font=font(44),fill=IVORY,spacing=12)
        d.text((x,1430),'gagal bukan\nakhir cerita',font=font(40),fill=SAND,spacing=10)
    else:
        d.rectangle((0,1100,1080,1920),fill=SLATE)
        d.line((0,1100,1080,1100),fill=SAGE,width=4)
        d.polygon([(160,1060),(520,1100),(520,560),(160,510)],fill=NAVY,outline=SAND)
        d.polygon([(540,1100),(900,1060),(900,510),(540,560)],fill=NAVY,outline=SAND)
        for y in (640,720,800):d.line((600,y,840,y-25),fill=SAGE,width=7)
        d.text((100,280),'One chapter. Not your whole story.',font=font(46),fill=IVORY)
        d.text((150,1320),'One bad chapter',font=font(60),fill=IVORY)
        d.text((150,1410),'Satu bab yang buruk',font=font(46),fill=SAND)
    # Permanent watermark makes its pre-production status unambiguous.
    d.rectangle((0,1760,1080,1920),fill=NAVY)
    d.text((60,1790),'SKETSA FRAMING',font=font(43),fill=SAND)
    d.text((60,1850),'Bukan storyboard / hasil produksi',font=font(30),fill=IVORY)
    cards.append(im)
sheet=Image.new('RGB',(1080,730),NAVY);sd=ImageDraw.Draw(sheet)
labels=['A · Talent kanan, grafis kiri','B · Talent kiri, grafis kanan','C · Cutaway grafis penuh']
for i,(im,label) in enumerate(zip(cards,labels)):
    sheet.paste(im.resize((344,612),Image.Resampling.LANCZOS),(i*360+8,62))
    sd.text((i*360+8,16),label,font=font(19),fill=IVORY)
sheet.save(P/'out/sketsa-framing.jpg',quality=95)
segments=json.loads((P/'cache/segments.json').read_text())
(P/'naskah-asr.md').write_text('# Transkripsi sumber — belum diverifikasi dengar\n\n'+'\n\n'.join(f"{s['s']:.2f}–{s['e']:.2f}s: {s['text'].strip()}" for s in segments)+'\n\nFrasa 36.97–41.81s terdeteksi tidak lengkap: “failure is something you experience who you are”. Kemungkinan ada “not” sebelum “who you are”; belum ditetapkan sebagai teks final.\n',encoding='utf8')
beats=[
 {'time':[0,7.1],'layout':'A','voice':'failure is never the end of the story','action':'Buku berpijak pada bidang bawah-kiri. Halaman yang menutup menyisakan halaman berikutnya; kamera mengikuti engsel, bukan ikon mengambang.'},
 {'time':[7.1,17.7],'layout':'B','voice':'fail today / lose an opportunity / wrong decision / efforts wasted','action':'Talent menempel kiri. Jalur di kanan berawal dari sisi frame, satu simpang berhenti lalu tersambung ke arah baru. Tiap frasa mengubah keadaan, bukan menambah empat kartu.'},
 {'time':[17.7,20.3],'layout':'full talking head','voice':'And yes, it hurts.','action':'Kembali ke footage asli yang memenuhi frame; hentikan dekorasi untuk memberi jeda emosional. Subtitle ditata pada bidang khusus; crop/area tubuh diperiksa dalam storyboard.'},
 {'time':[20.3,25.1],'layout':'A','voice':'fail today / not failing forever','action':'Talent di kanan. Jalur yang terhenti di kiri tersambung ke halaman berikut; tidak memakai grafik capaian atau janji keberhasilan.'},
 {'time':[25.1,30.7],'layout':'C','voice':'one bad chapter / entire story','action':'Grafis penuh: engsel buku membuka, satu lembar beraksen bergerak melewati lembar-lembar lainnya. Buku tetap menyentuh bidang bawah; suara sumber terus berjalan.'},
 {'time':[30.7,37],'layout':'B','voice':'permission to start again / even if afraid','action':'Talent menempel kiri. Di kanan, halaman kosong menerima garis pertama; aksi kecil kemudian menjadi jalur. Tekankan kesempatan memulai, bukan pertumbuhan yang dijamin.'},
 {'time':[37,42.8],'layout':'A','voice':'failure / experience / who you are','action':'Pisahkan label kejadian dari ruang identitas melalui halaman yang dilepas dari sampul. Teks persis menunggu pemeriksaan frasa ASR yang hilang.'},
 {'time':[42.8,49.456],'layout':'full talking head / edge panel','voice':"Today's failure doesn't determine the rest of your life.",'action':'Cutback ke talent untuk penutup. Pertahankan buku/jalur yang telah terbuka di satu sisi; tahan kalimat terakhir tanpa CTA tambahan.'}
]
(P/'rundown.json').write_text(json.dumps({'status':'usulan arah; belum storyboard produksi','beats':beats},indent=2),encoding='utf8')
(P/'manifest.json').write_text(json.dumps({'proyek':'2026-11_todays-failure','judul':"Today's Failure",'status':'style-review','engines':{'bang-motion':'1.19.0','bang-motion-commit':'c1aa65e921c970d858705fcb4a53a8294d1a4131','latest_verified':'git fetch origin main / already up to date / 2026-11-15','hyperframes-local':'0.9.33'},'brand':'NazarVerse 1.0','source':{'file':'aset/source.mp4','duration':49.456292,'width':478,'height':850,'black_bar_crop':[478,766,0,42]},'subtitle':['en','id'],'format':[1080,1920,30],'approval':{'style':False,'storyboard':False,'render':False},'reference_role':'aset/reference-avoid.png adalah contoh masalah framing, bukan desain yang ditiru'},indent=2),encoding='utf8')
html_beats=''.join(f"<article><h2>{b['time'][0]:.1f}–{b['time'][1]:.1f}s · {html.escape(b['layout'])}</h2><p>{html.escape(b['voice'])}</p><p>{html.escape(b['action'])}</p></article>" for b in beats)
(P/'out/arah-edit.html').write_text('''<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Today’s Failure · Arah edit</title><style>body{margin:40px auto;padding:0 24px;max-width:1100px;background:#101827;color:#edeae4;font:17px/1.7 system-ui}h1,h2{color:#c5b69a}img{width:100%;display:block}article{border-top:1px solid #26364c;padding:20px 0}a{color:#c5b69a}.note{padding:20px;background:#26364c}</style><h1>Today’s Failure</h1><p>Arah edit untuk tinjauan. Belum storyboard produksi atau MP4 edit.</p><div class="note">Prioritas terbaru: talent menyatu dengan sisi/bawah frame, motion memanfaatkan kiri/kanan/bawah dan cutaway penuh. Bukan potongan dada melayang di tengah. Sketsa mempertahankan latar sumber sebagai kolom footage; belum ada mask video yang diklaim bersih.</div><img src="sketsa-framing.jpg"><p>Rekomendasi: A dan B bergantian menurut narasi; C pada kalimat bab buruk. Semua panel video menyentuh sisi dan bagian bawah komposisi. Contoh subtitle pada sketsa adalah fragmen ucapan asli, bukan subtitle final yang telah disinkronkan.</p>'''+html_beats+'''<article><h2>Versi dan batas pemeriksaan</h2><p>Bang-motion 1.19.0 diverifikasi terbaru melalui git fetch repo resmi. HyperFrames lokal 0.9.33; komposisi akan mengikuti kontrak runtime HyperFrames, bukan HTML bang-motion yang dianggap langsung kompatibel. Baca brief.md untuk style brief lengkap.</p><p>Transkripsi 36.97–41.81s perlu cek khusus, kemungkinan “not who you are”. Sketsa belum membuktikan mask, keluwesan, sinkron suara, font final, atau QA ekspor. Persetujuan arah diperlukan sebelum komposisi; storyboard nyata diperlukan sebelum render penuh.</p></article></html>''',encoding='utf8')
print('Direction packet created: framing sketch, rundown, source transcript, version provenance.')
