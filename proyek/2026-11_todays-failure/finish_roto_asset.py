"""Resume a verified matte prefix; recurrent reset occurs inside the hidden book cutaway.
RGBA is streamed straight to the media encoder to avoid thousands of further cache writes.
"""
from pathlib import Path
import sys,json,time,subprocess,hashlib
import cv2,numpy as np,onnxruntime as ort
from PIL import Image
P=Path(__file__).resolve().parent;ROOT=P.parents[1]
sys.path.insert(0,str(ROOT/'pipeline/scripts'))
from split import bersihkan_alpha
cv2.setNumThreads(1)
cached=sorted((P/'cache/roto-video-r2').glob('*.png'))
start=min(len(cached)-1,921)
assert 755<=start<=921,('Resume must be inside the invisible book cutaway',start)
warm=max(0,start-60)
cap=cv2.VideoCapture(str(P/'hyperframes/assets/talent.mp4'));total=int(cap.get(cv2.CAP_PROP_FRAME_COUNT));fps=cap.get(cv2.CAP_PROP_FPS)
asset=P/'hyperframes/assets/talent-roto.webm'
assert not asset.exists(),'Do not overwrite an existing alpha asset silently'
log=open(P/'cache/roto-webm-encode.log','w')
encoder=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','warning','-f','rawvideo','-pix_fmt','rgba','-s','478x766','-r',str(fps),'-i','pipe:0','-an','-vf','scale=out_color_matrix=bt709:out_range=tv','-c:v','libvpx-vp9','-lossless','1','-deadline','good','-cpu-used','4','-row-mt','1','-threads','2','-auto-alt-ref','0','-pix_fmt','yuva420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-metadata:s:v:0','alpha_mode=1',str(asset)],stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=log)
areas=[];records=[];sample_indices={round(t*fps):t for t in [1.7,8.3,16,18.6,24,34.8,41.2,46.5]};sampledir=P/'out/mask-review/rvm'
def write_frame(i,rgba):
 encoder.stdin.write(np.ascontiguousarray(rgba).tobytes());areas.append(float(np.mean(rgba[:,:,3]>127)))
 if i in sample_indices:
  t=sample_indices[i];f=sampledir/f'cutout-{t:.1f}.png';Image.fromarray(rgba).save(f)
  bg=Image.new('RGBA',(478,766),'#101827');bg.alpha_composite(Image.fromarray(rgba));bg.convert('RGB').save(sampledir/f'navy-{t:.1f}.jpg',quality=95)
  records.append({'time':t,'frame':i,'file':str(f.relative_to(P))})
print(json.dumps({'prefix_frames':start,'resume_frame':start,'warmup_start':warm,'total':total}),flush=True)
tic=time.monotonic()
for i in range(start):write_frame(i,np.array(Image.open(cached[i]).convert('RGBA')))
opts=ort.SessionOptions();opts.intra_op_num_threads=2;opts.inter_op_num_threads=1
model=ROOT/'.sementara/rvm/rvm_mobilenetv3_fp32.onnx';sess=ort.InferenceSession(str(model),sess_options=opts,providers=['CPUExecutionProvider'])
rec=[np.zeros([1,1,1,1],np.float32) for _ in range(4)];cap.set(cv2.CAP_PROP_POS_FRAMES,warm)
try:
 for i in range(warm,total):
  ok,bgr=cap.read()
  if not ok:raise RuntimeError(f'missing source frame {i}')
  rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB);src=np.ascontiguousarray(rgb.transpose(2,0,1)[None].astype('float32')/255)
  fgr,pha,*rec=sess.run(None,{'src':src,'r1i':rec[0],'r2i':rec[1],'r3i':rec[2],'r4i':rec[3],'downsample_ratio':np.array([512/766],np.float32)})
  if i<start:continue
  a=np.clip(pha[0,0],0,1);a[a<.008]=0;a[a>.992]=1;fg=np.clip(fgr[0].transpose(1,2,0)*255,0,255).astype('uint8')
  write_frame(i,bersihkan_alpha(fg,a,feather=.35,kikis=0))
  if i%150==0:print(json.dumps({'frame':i,'total':total,'seconds':round(time.monotonic()-tic,1)}),flush=True)
finally:cap.release();encoder.stdin.close()
code=encoder.wait();log.close()
assert code==0,('alpha encoder failed',code)
report={'model':'RobustVideoMatting mobilenetv3 fp32 ONNX','source':'https://github.com/PeterL1n/RobustVideoMatting','model_sha256':hashlib.sha256(model.read_bytes()).hexdigest(),'frames':total,'fps':fps,'duration':total/fps,'whole_clip_processed':True,'temporal_method':'Recurrent states per continuous segment, resumed with 60-frame warmup inside a cutaway where talent is invisible; no resets during visible shots','resume_frame':start,'warmup_start':warm,'source_resolution':[478,766],'erosion_source_px':0,'feather_source_px':.35,'min_foreground_fraction':min(areas),'max_foreground_fraction':max(areas),'samples':records,'asset':str(asset.relative_to(P)),'asset_sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'playback_quality_verified':False,'frame_area_fractions':areas}
(P/'cache/roto-video-r2.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({'complete':True,'frames':total,'asset_bytes':asset.stat().st_size,'seconds':round(time.monotonic()-tic,1)}),flush=True)
