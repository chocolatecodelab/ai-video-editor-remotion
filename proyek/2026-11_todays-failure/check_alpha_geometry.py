"""Check real encoded alpha against the caption band, not the transparent video box."""
from pathlib import Path
import json,subprocess
import numpy as np
from PIL import ImageFont
P=Path(__file__).resolve().parent;ROOT=P.parents[1]
subs=json.loads((P/'subtitles.json').read_text(encoding='utf8'));beats=json.loads((P/'beat-sheet.json').read_text(encoding='utf8'))['beats']
for key,size in [('en',52),('id',44)]:
 font=ImageFont.truetype(str(ROOT/'pipeline/fonts/Inter-Variable.ttf'),size)
 assert all(font.getlength(g[key])<840 for g in subs),'Check wrapping before using a one-line caption band'
log=open(P/'cache/alpha-geometry-decode.log','w')
proc=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','warning','-threads','2','-c:v','libvpx-vp9','-i',str(P/'hyperframes/assets/talent-roto.webm'),'-map','0:v:0','-vf','alphaextract','-f','rawvideo','-pix_fmt','gray','pipe:1'],stdout=subprocess.PIPE,stderr=log)
i=0;collisions=[];not_grounded=[];min_head_y=766;checked=0
while True:
 buf=proc.stdout.read(478*766)
 if not buf:break
 assert len(buf)==478*766
 a=np.frombuffer(buf,np.uint8).reshape(766,478);t=i/30
 b=next((b for b in beats if b['s']<=t<b['e']),beats[-1]);g=next((g for g in subs if g['s']<=t<g['e']),None)
 if b['layout']!='C':
  ys=np.where(np.any(a>32,axis=1))[0]
  if len(ys):min_head_y=min(min_head_y,int(ys[0]))
  if a[-1].max()<128:not_grounded.append(i)
  if g:
   B=b['layout']=='B';D=b['layout']=='D';sw=1250 if D else 1300 if B else 1100;scale=sw/478;left=-85 if D else -220 if B else 0;top=1920-766*scale
   x0=max(0,int(np.floor((100-left)/scale)));x1=min(478,int(np.ceil((960-left)/scale)))
   y0=max(0,int(np.floor((270-top)/scale)));y1=min(766,int(np.ceil((405.2-top)/scale)))
   count=int(np.sum(a[y0:y1,x0:x1]>32));checked+=1
   if count:collisions.append({'frame':i,'time':t,'pixels':count})
 i+=1
proc.stdout.close();code=proc.wait();log.close();assert code==0
report={'encoded_frames':i,'caption_visible_foreground_frames_checked':checked,'caption_foreground_collisions':collisions,'foreground_not_touching_bottom':not_grounded,'min_source_alpha_head_y':min_head_y,'scope':'Geometric alpha/caption and bottom-contact checks only; not a subjective edge-quality or temporal-playback pass.'}
(P/'out/mask-review/alpha-geometry-check.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({'frames':i,'caption_collisions':len(collisions),'not_grounded':len(not_grounded)}))
if collisions or not_grounded:raise SystemExit(1)
