"""Prepare real foreground video with continuous recurrent matting; no final render."""
from pathlib import Path
import json,os,sys,subprocess,time,hashlib,shutil
import cv2,numpy as np,onnxruntime as ort
from PIL import Image
P=Path(__file__).resolve().parent;ROOT=P.parents[1];TMP=ROOT/'.sementara/visible'
os.environ.update(TEMP=str(TMP),TMP=str(TMP),VIDEO_TEMP=str(TMP))
sys.path.insert(0,str(ROOT/'pipeline/scripts'))
from split import bersihkan_alpha
cv2.setNumThreads(1)
A=P/'hyperframes/assets'
for name in ['Inter.ttf','Inter-OFL.txt','gsap.min.js']:shutil.copy2(ROOT/'proyek/2026-11_todays-failure/hyperframes/assets'/name,A/name)
src=P/'aset/source.mp4';talent=A/'talent.mp4';asset=A/'talent-roto.webm'
assert not asset.exists(),'Existing matte must be reviewed before overwrite'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-an','-vf','crop=478:766:0:42','-c:v','libx264','-crf','15','-preset','fast','-threads','2','-pix_fmt','yuv420p',str(talent)],check=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-vn','-c:a','copy',str(A/'voice.m4a')],check=True)
cap=cv2.VideoCapture(str(talent));n=int(cap.get(cv2.CAP_PROP_FRAME_COUNT));fps=cap.get(cv2.CAP_PROP_FPS)
opts=ort.SessionOptions();opts.intra_op_num_threads=2;opts.inter_op_num_threads=1
model=ROOT/'.sementara/rvm/rvm_mobilenetv3_fp32.onnx';session=ort.InferenceSession(str(model),sess_options=opts,providers=['CPUExecutionProvider'])
rec=[np.zeros([1,1,1,1],np.float32) for _ in range(4)]
sampledir=P/'out/mask-review';sampledir.mkdir(exist_ok=True)
samples={round(t*fps):t for t in [2,8,13,19,25,31,37,43.5]};areas=[];top=[]
log=(TMP/'matte-encode.log').open('w')
enc=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','warning','-f','rawvideo','-pix_fmt','rgba','-s','478x766','-r',str(fps),'-i','pipe:0','-an','-vf','scale=out_color_matrix=bt709:out_range=tv','-c:v','libvpx-vp9','-lossless','1','-deadline','good','-cpu-used','4','-row-mt','1','-threads','2','-auto-alt-ref','0','-pix_fmt','yuva420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-metadata:s:v:0','alpha_mode=1',str(asset)],stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=log)
tic=time.monotonic()
try:
 for i in range(n):
  ok,bgr=cap.read();assert ok,('Missing source frame',i)
  rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)
  x=np.ascontiguousarray(rgb.transpose(2,0,1)[None].astype('float32')/255)
  fg,pha,*rec=session.run(None,{'src':x,'r1i':rec[0],'r2i':rec[1],'r3i':rec[2],'r4i':rec[3],'downsample_ratio':np.array([512/766],np.float32)})
  alpha=np.clip(pha[0,0],0,1);alpha[alpha<.008]=0;alpha[alpha>.992]=1
  rgba=bersihkan_alpha(np.clip(fg[0].transpose(1,2,0)*255,0,255).astype('uint8'),alpha,feather=.35,kikis=0)
  enc.stdin.write(np.ascontiguousarray(rgba).tobytes());areas.append(float((rgba[:,:,3]>127).mean()))
  top.append(int(np.where(rgba[:,:,3]>32)[0].min()))
  if i in samples:
   t=samples[i];im=Image.fromarray(rgba);im.save(sampledir/f'cutout-{t:.1f}.png')
   for color,label in [('#101827','navy'),('#EDEAE4','ivory')]:
    bg=Image.new('RGBA',im.size,color);bg.alpha_composite(im);bg.convert('RGB').save(sampledir/f'{label}-{t:.1f}.jpg',quality=95)
  if i%180==0:print(json.dumps({'frame':i,'total':n,'seconds':round(time.monotonic()-tic,1)}),flush=True)
finally:cap.release();enc.stdin.close()
assert enc.wait()==0;log.close()
report={'model':'RobustVideoMatting mobilenetv3 fp32 ONNX','model_sha256':hashlib.sha256(model.read_bytes()).hexdigest(),'frames':n,'fps':fps,'source_crop':[478,766,0,42],'method':'Continuous recurrent state for the entire clip; no per-frame or segment reset','whole_clip_processed':True,'asset':'hyperframes/assets/talent-roto.webm','asset_sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'min_head_y':min(top),'head_y':top,'area_fractions':areas,'feather_source_px':.35,'erosion_source_px':0,'full_playback_verified':False}
(P/'cache/roto.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({'complete':True,'frames':n,'seconds':round(time.monotonic()-tic,1)}),flush=True)
