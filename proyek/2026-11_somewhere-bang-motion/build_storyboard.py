"""Data-bound Bang Motion composition + storyboard. Never approves or renders MP4."""
from pathlib import Path
import json
import html
import hashlib
from PIL import Image, ImageOps, ImageDraw, ImageFont

P = Path(__file__).resolve().parent
ROOT = P.parents[1]

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def write(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

cfg, beats = read(P/'manifest.json'), read(P/'beat-sheet.json')
source = read(P/'transcript-source.json')
words = source['kata']
# Editorial proposals remain explicitly unverified; original ASR is preserved.
proposals = []
for w in words:
    if w['w'] == 'roots':
        proposals.append({'time':w['s'], 'asr':w['w'], 'proposal':'routes', 'status':'needs listening confirmation'})
        w['w'] = 'routes'
for w in words:
    if 38.6 <= w['s'] < 40.1:
        replacement={'Somewhere':'Some','I':'we','a':'in'}.get(w['w'])
        if replacement:
            proposals.append({'time':w['s'],'asr':w['w'],'proposal':replacement,'status':'needs listening confirmation'})
            w['w']=replacement
source['_meta'].update({'dikoreksi':False,'review':'draft semantic corrections; no listening verification claimed','audio_sha':hashlib.sha256((P/'cache/audio.wav').read_bytes()).hexdigest()})
write(P/'cache/words.storyboard.json',source)
write(P/'cache/caption-review.json',proposals)

subtitle_data=read(P/'subtitles.json')
phrases=[g['en'] for g in subtitle_data]
translations=[g['id'] for g in subtitle_data]
groups=[];cursor=0
for phrase,translation in zip(phrases,translations):
    n=len(phrase.split());actual=' '.join(w['w'] for w in words[cursor:cursor+n])
    assert actual.lower()==phrase.lower(), (actual,phrase)
    groups.append({'indices':list(range(cursor,cursor+n)),'id':translation});cursor+=n
assert cursor==len(words)
groups=[{'s':words[b['indices'][0]]['s'],'e':min(cfg['format']['duration'],words[b['indices'][-1]]['e']+.16),'words':b['indices'],'id':b['id']} for b in groups]
for a,b in zip(groups,groups[1:]): a['e']=min(a['e'],b['s'])
for i,g in enumerate(groups):
    max_end=groups[i+1]['s'] if i+1<len(groups) else cfg['format']['duration']
    minimum=max(len(phrases[i]),len(g['id']))/beats['caption']['max_chars_per_second']
    g['e']=min(max_end,max(g['e'],g['s']+minimum))
    if (g['e']-g['s'])<minimum:
        early=g['e']-minimum
        assert g['s']-early<=.1 and (i==0 or early>=groups[i-1]['e'])
        g['word_start']=g['s'];g['s']=early
    assert max(len(phrases[i]),len(g['id']))/(g['e']-g['s'])<=17.001
write(P/'cache/caption-groups.json',groups)

template=(P/'komposisi/template.html').read_text(encoding='utf8')
for key,data in [('CONFIG',cfg),('BEATS',beats),('WORDS',words),('GROUPS',groups)]:
    template=template.replace('__'+key+'__',json.dumps(data,ensure_ascii=False))
(P/'komposisi/index.html').write_text(template,encoding='utf8')

transcript=' '.join(w['w'] for w in words)
(P/'naskah-storyboard.md').write_text('# Caption bilingual tribute v2\n\n'+'\n\n'.join(f'{g["s"]:.2f}–{g["e"]:.2f}s\n\n{en}\n\n{id}' for g,en,id in zip(groups,phrases,translations))+'\n\nBelum diverifikasi dengar. Usulan `routes` serta `Some we carry in silence` perlu dikonfirmasi. Sumber ASR kedua disimpan utuh di cache/words.small.json.\n',encoding='utf8')

shots=P/'out/storyboard'
times=[t for b in beats['beats'] for t in b['still']]
existing=all((shots/f't{t:.2f}.png').exists() for t in times)
if not existing:
    print('Composition ready. Capture frames, then run again to assemble storyboard.')
    raise SystemExit(0)

font_path=ROOT/'pipeline/fonts/Inter-Variable.ttf'
font=ImageFont.truetype(str(font_path),21)
small=ImageFont.truetype(str(font_path),16)
selected=[1.5,17.2,21.3,29.5,45,56.9]
sheet=Image.new('RGB',(3*360,2*700),(16,24,39))
d=ImageDraw.Draw(sheet)
for i,t in enumerate(selected):
    im=Image.open(shots/f't{t:.2f}.png').convert('RGB')
    im=ImageOps.contain(im,(344,612))
    x=(i%3)*360+8;y=(i//3)*700+48
    sheet.paste(im,(x,y))
    b=next(b for b in beats['beats'] if b['mulai']<=t<b['selesai'])
    d.text((x,y-33),f'{t:05.1f}s  /  {b["id"]}',font=font,fill=(237,234,228))
    d.text((x,y+620),b['layout'].upper(),font=small,fill=(197,182,154))
sheet.save(P/'out/kontak-storyboard.jpg',quality=94)

e=html.escape
cards=[]
for b in beats['beats']:
    relevant=[w for w in words if b['mulai']<=w['s']<b['selesai']]
    imgs=''.join(f'<figure><img src="storyboard/t{t:.2f}.png"><figcaption>{t:.2f}s</figcaption></figure>' for t in b['still'])
    cards.append(f'<article><h2>{b["mulai"]:.1f}–{b["selesai"]:.1f}s · {e(b["title"])}</h2><p>{e(b["action"])}</p><div class="frames">{imgs}</div><blockquote>{e(" ".join(w["w"] for w in relevant))}</blockquote></article>')
report=f'''<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SOMEWHERE · Storyboard tribute v2</title>
<style>*{{box-sizing:border-box}}body{{background:#101827;color:#edeae4;font:16px/1.65 system-ui;margin:0;padding:40px 5vw}}main{{max-width:1300px;margin:auto}}h1{{font:48px/1.1 Georgia;margin:0}}h2{{font:28px Georgia;color:#c5b69a}}.lead{{max-width:800px}}a{{color:#c5b69a}}article{{border-top:1px solid #26364c;padding:26px 0}}.frames{{display:flex;gap:16px;overflow:auto}}figure{{margin:0;flex:0 0 236px}}img{{width:100%;display:block}}figcaption{{color:#c5b69a}}blockquote{{border-left:2px solid #718a83;margin:24px 0;padding-left:20px}}.note{{background:#26364c;padding:20px;max-width:900px}}.status{{color:#c5b69a;font-size:13px;letter-spacing:.12em}}li{{margin-bottom:9px}}</style>
<main><p class="status">NAZARVERSE · STORYBOARD TRIBUTE V2 · MENUNGGU TINJAUAN</p><h1>Somewhere<br>Tribute to my grandpa</h1><p class="lead">Gambar kenangan pengguna menjadi pusat cerita. Satu cahaya menghubungkan horizon, jarak, waktu dan kenangan. English VO asli tetap utuh, sekitar 59 detik. Subtitle English ditemani terjemahan Indonesia sesuai arahan terbaru.</p>
<p><a href="../komposisi/index.html?debug=1">Buka komposisi dengan scrub timeline</a> · <a href="kontak-storyboard.jpg">Lembar kontak</a> · <a href="../naskah-storyboard.md">Caption draft</a></p>
<div class="note"><strong>Status:</strong> arah disetujui melalui “Jalankan, tribut to my grandpa”. Ini still nyata dari komposisi HTML/GSAP produksi, belum video final. Gambar pribadi dipakai utuh; tidak membuat nama, tanggal, atau biografi. Subtitle tidak menutup wajah/tubuh pada gambar.<br><strong>Perlu dicek:</strong> kata “routes” sekitar 20.3s dan “Some we carry in silence” sekitar 38.7–40.7s adalah usulan koreksi ASR, belum terverifikasi dengar. Tidak menandai transcript corrected. Ritme gerak, sinkronisasi dan audio belum lulus hanya berdasarkan still.</div>
{''.join(cards)}
<article><h2>Subtitle, brand dan tata letak</h2><p>Subtitle bilingual: English Inter 44px, Indonesia Inter 40px di bawahnya; maksimal dua baris per bahasa. Cormorant Garamond pada judul dan penutup. Navy / Slate Blue / Warm Sand / Soft Ivory / Muted Sage mengikuti brand. Area caption 1310–1520 terpisah dari gambar. Dedikasi ditulis sesuai permintaan: “Tribute to my grandpa”. Penutup: “Love remains / Cinta tetap ada”.</p><p>Split talent tidak relevan: sumber memperlihatkan keyboard, tidak ada talking head pada sampel. Rancangan menggunakan full motion dan jendela gambar kenangan; tidak memaksakan split berulang.</p></article>
<article><h2>Audio dan render berikutnya</h2><p>Audio AAC sumber disalin tanpa encode ulang untuk komposisi. Belum ditambah musik/SFX. Mix dan pemeriksaan dengar dipastikan sebelum render final. Target satu MP4 1080×1920, H.264/AAC, bt709, −14 LUFS, true peak master ≤ −2 dBTP. Target ini belum klaim hasil terukur.</p><p>Persetujuan storyboard diperlukan sebelum render penuh sesuai aturan proyek. Tidak ada tombol yang menganggap storyboard disetujui otomatis.</p></article></main></html>'''
(P/'out/storyboard.html').write_text(report,encoding='utf8')
write(P/'out/storyboard.json',{'version':beats['version'],'manifest_sha':hashlib.sha256((P/'manifest.json').read_bytes()).hexdigest(),'beats_sha':hashlib.sha256((P/'beat-sheet.json').read_bytes()).hexdigest(),'approved':cfg['approval']['storyboard'],'approved_message':cfg['approval'].get('render_message'),'times':times,'frames':len(times),'composition':'../komposisi/index.html'})
print('Storyboard assembled: 16 production stills, contact sheet, caption review.')
