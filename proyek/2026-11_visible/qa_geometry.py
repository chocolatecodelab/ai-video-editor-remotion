"""Conservative caption layout + actual encoded alpha geometry; not aesthetic QA."""
from pathlib import Path
import json,math,subprocess
import numpy as np
from PIL import ImageFont
P=Path(__file__).resolve().parent;ROOT=P.parents[1]
read=lambda f:json.loads((P/f).read_text(encoding='utf8'))
plan=read('beat-sheet.json');subs=read('subtitles.json');m=read('manifest.json')
fontpath=str(P/'hyperframes/assets/Inter.ttf')
def lines(text,size,spacing):
 font=ImageFont.truetype(fontpath,size);result=[];line=''
 for word in text.split():
  probe=(line+' '+word).strip()
  width=font.getlength(probe)+spacing*(len(probe)-1)
  if width>m['type']['width'] and line:result.append(line);line=word
  else:line=probe
 if line:result.append(line)
 return result
caption_boxes=[];failures=[]
for beat in plan['beats']:
 l=plan['layouts'][beat['layout']]
 for cue in subs:
  if cue['s']>=beat['e'] or cue['e']<=beat['s']:continue
  en=lines(cue['en'],l['en'],-.035*l['en']);idtext=lines(cue['id'],l['id'],-.025*l['id'])
  height=len(en)*l['en']*1.18+20+len(idtext)*l['id']*1.24
  box={'beat':beat['id'],'s':max(beat['s'],cue['s']),'e':min(beat['e'],cue['e']),'en':en,'id':idtext,'x':100,'y':l['caption_top'],'width':880,'height':height,'talent':bool(l['talent_opacity'])}
  caption_boxes.append(box)
  if max(len(en),len(idtext))>2 or box['y']+height>1520 or box['y']<250:failures.append(box)
proc=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-threads','2','-c:v','libvpx-vp9','-i',str(P/'hyperframes/assets/talent-roto.webm'),'-an','-vf','alphaextract','-f','rawvideo','-pix_fmt','gray','pipe:1'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
collisions=[];floating=[];n=0;checked=0
while True:
 data=proc.stdout.read(478*766)
 if not data:break
 assert len(data)==478*766
 alpha=np.frombuffer(data,np.uint8).reshape(766,478);t=n/30
 beat=next(b for b in plan['beats'] if b['s']<=t<b['e']);l=plan['layouts'][beat['layout']]
 if l['talent_opacity']:
  if not (alpha[-1]>128).any():floating.append(n)
  for box in caption_boxes:
   if not box['s']<=t<box['e']:continue
   scale=l['talent_width']/478;top=1920-766*scale
   x1=max(0,math.floor((100-l['talent_left'])/scale));x2=min(478,math.ceil((980-l['talent_left'])/scale))
   y1=max(0,math.floor((box['y']-top)/scale));y2=min(766,math.ceil((box['y']+box['height']-top)/scale))
   checked+=1
   if x2>x1 and y2>y1 and (alpha[y1:y2,x1:x2]>32).any():collisions.append({'frame':n,'beat':beat['id']})
 n+=1
assert proc.wait()==0,proc.stderr.read().decode()
report={'encoded_alpha_frames':n,'caption_talent_frames_checked':checked,'caption_boxes':caption_boxes,'wrap_or_safe_area_failures':failures,'alpha_caption_collisions':collisions,'floating_body_frames':floating,'minimum_font_px':min(m['type'][k] for k in ['en','id','full_en','full_id']),'max_cps':max(g['cps'] for g in subs),'scope':'Actual encoded alpha intersection, conservative font metrics and bottom contact. Does not prove edge beauty, temporal stability or movement quality.'}
(P/'out/qa-geometry.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k not in ['caption_boxes','scope']}))
if failures or collisions or floating:raise SystemExit(1)
