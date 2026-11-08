import json,hashlib,sys,shutil
from pathlib import Path
from PIL import ImageFont
root=Path.cwd();sys.path.insert(0,str(root/'pipeline/scripts'))
from sistem import tulis_json
p=root/'proyek/2026-11_otca-nina-referensi-08';old=json.loads((root/'proyek/2026-11_otca-nina-beasiswa-s1/production-props.json').read_text());draft=json.loads((p/'storyboard.json').read_text())
rows=[
('opening','talent','STUDI KE JERMAN',['BEASISWA S1','TERBATAS.'],[],[2.57],3.3),
('directory','split','CONTOH PENDANAAN',['MENGENAL','DAAD.'],['PROGRAM'],[5.47],6.2),
('funding','full','JENJANG & RISET',['SASARAN','PENDANAAN.'],['S2 / MASTER','DOKTORAL','PENELITI'],[12.29,14.09,15.3],15.9),
('summer','split','PELUANG PROGRAM',['KURSUS','MUSIM PANAS.'],['MUSIM PANAS','BAHASA JERMAN'],[20.31],21.7),
('comparison','full','PAHAMI CAKUPANNYA',['DUA CAKUPAN','BERBEDA.'],['KURSUS BAHASA','KULIAH S1'],[23.7],27.2),
('student','talent','SETELAH TIBA',['SUDAH DI','JERMAN?'],[],[28],30.3),
('selection','full','PELUANG BUKAN JAMINAN',['TETAP ADA','SELEKSI.'],['PRESTASI','PERSYARATAN','SELEKSI','APLIKASI'],[33.5,34.65,35.9],36.7),
('planning','talent','PERSIAPAN STUDI',['RENCANAKAN','SEJAK AWAL.'],[],[41.35],43.6),
('closing','split','BERSAMA TIM OTCA',['STUDI ANAK','KE JERMAN.'],['LINK DI BIO'],[45.79],46.3)]
scenes=[]
for i,(kind,mode,kicker,title,labels,anchors,sample) in enumerate(rows):
 s=draft['scenes'][i];scenes.append(dict(id=f'{i+1:02}',kind=kind,mode=mode,kicker=kicker,title=title,labels=labels,anchors=anchors,sample=sample,start=s['mulai'],end=s['selesai'],motion=s['motion'],transition='Tinjau kontinuitas aset pada storyboard; gerak belum disetujui.'))
font=ImageFont.truetype(str(root/'pipeline/fonts/Montserrat-ExtraBold.ttf'),64)
pages=[]
for i,page in enumerate(old['pages']):
 lines=[[]]
 for w in page:
  if lines[-1] and font.getlength(' '.join(x['text'] for x in lines[-1])+' '+w['w'])>820:lines.append([])
  lines[-1].append(dict(text=w['w'],startMs=round(w['s']*1000),endMs=round(w['e']*1000),timestampMs=round(w['s']*1000),confidence=w.get('p')))
 for j in range(0,len(lines),2):
  group=lines[j:j+2]
  pages.append(dict(start=group[0][0]['startMs']/1000,end=group[-1][-1]['endMs']/1000+.28,lines=group))
for i,page in enumerate(pages):
 page['end']=min(page['end'],pages[i+1]['start'] if i+1<len(pages) else 51.55)
assert [w['text'] for page in pages for line in page['lines'] for w in line]==[w['w'] for page in old['pages'] for w in page]

frames=[round(s['sample']*30) for s in scenes]+[round(t*30) for t in [11.6,13.7,33.0,34.9,37.4]]
props=dict(tokens=old['tokens'],scenes=scenes,captions=pages,logo='proyek/2026-11_otca-nina-referensi-08/r2/logo.png',assets={k:f'proyek/2026-11_otca-nina-referensi-08/r2/{k}.png' for k in ['campus','study','dossier']},cutoutDir=old['cutout']['dir'],cutoutFrames=sorted(int(x.stem) for x in (root/'remotion/public'/old['cutout']['dir']).glob('*.webp')),duration=51.55,auditFrames=frames,layout=dict(logoY=250,titleY=405,captionY=1368,talentBottom=1320,side=108,textWidth=852))
tulis_json(p/'storyboard-props-r2.json',props)
work=p/'out/r2';work.mkdir(exist_ok=True)
tulis_json(p/'render-stills-r2.json',dict(props=str(p/'storyboard-props-r2.json'),entry=str(root/'remotion/nina-assets-entry.tsx'),composition='OtcaNinaAssets',work=str(work),mode='still',frames=frames))
for peran,cfg in old['tokens']['font'].items():
 if cfg.get('file'):shutil.copy2(root/'pipeline/fonts'/cfg['file'],root/'remotion/public/fonts'/cfg['file'])
tulis_json(p/'source-r2.json',{'source':str(Path('D:/KERJAAN/OTCA/CONTOH VIDEO MBAK NINA.MOV')),'source_sha256':hashlib.sha256(Path('D:/KERJAAN/OTCA/CONTOH VIDEO MBAK NINA.MOV').read_bytes()).hexdigest(),'reference_sha256':hashlib.sha256(Path('D:/KERJAAN/OTCA/Referensi Video.mp4').read_bytes()).hexdigest(),'status':'belum-disetujui','final_render':False})
print('Props and 14 still frames prepared; caption words preserved.')
