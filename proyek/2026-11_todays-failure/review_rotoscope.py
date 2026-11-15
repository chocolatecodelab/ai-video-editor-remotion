"""Sample roto + reference evidence. Never creates a fake full-video mask."""
from pathlib import Path
import os,sys,json,time
import cv2,numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageOps
import onnxruntime as ort

P=Path(__file__).resolve().parent;ROOT=P.parents[1]
os.environ['U2NET_HOME']=str(ROOT/'.sementara/u2net')
os.environ['TEMP']=os.environ['TMP']=str(ROOT/'.sementara')
sys.path.insert(0,str(ROOT/'pipeline/scripts'))
from split import bersihkan_alpha
from rembg import new_session
opts=ort.SessionOptions();opts.intra_op_num_threads=4;opts.inter_op_num_threads=1
opts.graph_optimization_level=ort.GraphOptimizationLevel.ORT_ENABLE_ALL
model=os.environ.get('ROTO_MODEL','birefnet-portrait')
print(f'Loading local {model} model...',flush=True)
session=new_session(model,sess_opts=opts,providers=['CPUExecutionProvider'])
cache=P/('cache/roto-r2' if model=='birefnet-portrait' else 'cache/roto-r2-u2net');cache.mkdir(exist_ok=True)
out=P/'out/mask-review';out.mkdir(exist_ok=True)
cap=cv2.VideoCapture(str(P/'hyperframes/assets/talent.mp4'))
def frame(n):
 cap.set(cv2.CAP_PROP_POS_FRAMES,n);ok,bgr=cap.read()
 if not ok:raise RuntimeError(n)
 return cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)
def mask(n,rgb):
 f=cache/f'alpha-{n:05}.png'
 if f.exists():return np.asarray(Image.open(f),np.float32)/255
 a=np.asarray(session.predict(Image.fromarray(rgb))[0],np.float32)/255
 Image.fromarray((a*255).astype('uint8')).save(f)
 return a
times=[1.7,8.3,16.,18.6,24.,34.8,41.2,46.5]
records=[]
for t in times:
 tic=time.monotonic();n=round(t*30);rgb=frame(n);alpha=mask(n,rgb)
 gray=cv2.cvtColor(rgb,cv2.COLOR_RGB2GRAY);total=alpha*.6;weight=np.full(alpha.shape,.6,np.float32)
 for delta in (-1,1):
  nrgb=frame(n+delta);na=mask(n+delta,nrgb)
  flow=cv2.calcOpticalFlowFarneback(gray,cv2.cvtColor(nrgb,cv2.COLOR_RGB2GRAY),None,.5,3,17,3,5,1.2,0)
  xx,yy=np.meshgrid(np.arange(gray.shape[1]),np.arange(gray.shape[0]));mx=(xx+flow[:,:,0]).astype('float32');my=(yy+flow[:,:,1]).astype('float32')
  warped=cv2.remap(na,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT)
  wrgb=cv2.remap(nrgb,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT)
  confidence=np.exp(-np.mean(np.abs(wrgb.astype('float32')-rgb),axis=2)/18.)*.2
  total+=warped*confidence;weight+=confidence
 alpha=total/weight;alpha[alpha<.015]=0;alpha[alpha>.985]=1
 rgba=bersihkan_alpha(rgb,alpha,feather=.45,kikis=.65)
 dest=cache/f'cutout-{t:.1f}.png';Image.fromarray(rgba).save(dest)
 # Cleaned and original are both retained; no silent replacement of the source.
 records.append({'time':t,'frame':n,'file':str(dest.relative_to(P)),'neighbors':[n-1,n,n+1],'seconds':round(time.monotonic()-tic,2)})
 print(f'{t:.1f}s sample ready ({records[-1]["seconds"]}s)',flush=True)
cap.release()
font=lambda n:ImageFont.truetype(str(ROOT/'pipeline/fonts/Inter-Variable.ttf'),n)
sheet=Image.new('RGB',(4*300,2*540),'#101827');d=ImageDraw.Draw(sheet)
for i,r in enumerate(records):
 im=Image.open(P/r['file']).convert('RGBA');im.thumbnail((290,465))
 bg=Image.new('RGBA',(290,465),'#101827' if i%2==0 else '#EDEAE4')
 bg.alpha_composite(im,((290-im.width)//2,465-im.height))
 x=i%4*300+5;y=i//4*540+42;sheet.paste(bg.convert('RGB'),(x,y));d.text((x,y-31),f'{r["time"]:.1f}s / sample',font=font(20),fill='#C5B69A')
sheet.save(out/'mask-samples.jpg',quality=95)
# Close-up validation on navy, ivory and checkerboard, same edge pixels.
detail=Image.new('RGB',(1200,900),'#101827');dd=ImageDraw.Draw(detail)
for row,index in enumerate([0,3,7]):
 rgba=Image.open(P/records[index]['file']).convert('RGBA');a=np.asarray(rgba)[:,:,3]
 ys,xs=np.where(a>32);top=int(ys.min());cx=int(np.median(xs[ys<top+110]));box=(max(0,cx-110),max(0,top-12),min(rgba.width,cx+110),min(rgba.height,top+185))
 crop=rgba.crop(box).resize((360,252),Image.Resampling.LANCZOS)
 for col,color in enumerate(['#101827','#EDEAE4',None]):
  bg=Image.new('RGBA',crop.size,color or '#26364C')
  if color is None:
   bd=ImageDraw.Draw(bg)
   for y in range(0,252,16):
    for x in range(0,360,16):
     if (x//16+y//16)%2:bd.rectangle((x,y,x+15,y+15),fill='#C5B69A')
  bg.alpha_composite(crop);x=col*400+10;y=row*300+38;detail.paste(bg.convert('RGB'),(x,y));dd.text((x,y-29),f'{records[index]["time"]:.1f}s · hair edge',font=font(19),fill='#EDEAE4')
detail.save(out/'hair-edge-detail.jpg',quality=96)
(out/'mask-evidence.json').write_text(json.dumps({'model':model+' local ONNX','operation':'center +/-1 frame, flow-aligned confidence-weighted smoothing; clean alpha via pipeline split.bersihkan_alpha','erosion_source_px':.65,'feather_source_px':.45,'samples':records,'whole_clip_processed':False,'playback_verified':False,'note':'Sample proof only; no claim of a finished full-video mask.'},indent=2),encoding='utf8')
print('Sample evidence assembled.',flush=True)
