"""Recurrent local video matting. Writes source-resolution assets, never final video."""
from pathlib import Path
import sys,json,time,hashlib
import cv2,numpy as np,onnxruntime as ort
from PIL import Image
P=Path(__file__).resolve().parent;ROOT=P.parents[1]
sys.path.insert(0,str(ROOT/'pipeline/scripts'))
from split import bersihkan_alpha
model=ROOT/'.sementara/rvm/rvm_mobilenetv3_fp32.onnx'
options=ort.SessionOptions();options.intra_op_num_threads=4;options.inter_op_num_threads=1
sess=ort.InferenceSession(str(model),sess_options=options,providers=['CPUExecutionProvider'])
rec=[np.zeros([1,1,1,1],np.float32) for _ in range(4)]
cap=cv2.VideoCapture(str(P/'hyperframes/assets/talent.mp4'))
total=int(cap.get(cv2.CAP_PROP_FRAME_COUNT));fps=cap.get(cv2.CAP_PROP_FPS)
dest=P/'cache/roto-video-r2';dest.mkdir(exist_ok=True)
sample_indices={round(t*fps):t for t in [1.7,8.3,16,18.6,24,34.8,41.2,46.5]}
sampledir=P/'out/mask-review/rvm';sampledir.mkdir(exist_ok=True)
tic=time.monotonic();areas=[];records=[]
print(json.dumps({'model':'RVM mobilenetv3 fp32','frames':total,'fps':fps}),flush=True)
for i in range(total):
 ok,bgr=cap.read()
 if not ok:raise RuntimeError(f'Frame missing: {i}')
 rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)
 src=np.ascontiguousarray(rgb.transpose(2,0,1)[None].astype(np.float32)/255)
 fgr,pha,*rec=sess.run(None,{'src':src,'r1i':rec[0],'r2i':rec[1],'r3i':rec[2],'r4i':rec[3],'downsample_ratio':np.array([min(512/max(rgb.shape[:2]),1)],np.float32)})
 a=np.clip(pha[0,0],0,1);a[a<.008]=0;a[a>.992]=1
 fg=np.clip(fgr[0].transpose(1,2,0)*255,0,255).astype(np.uint8)
 rgba=bersihkan_alpha(fg,a,feather=.35,kikis=0)
 Image.fromarray(rgba).save(dest/f'{i:06}.png',compress_level=1)
 area=float(np.mean(rgba[:,:,3]>127));areas.append(area)
 if i in sample_indices:
  t=sample_indices[i];f=sampledir/f'cutout-{t:.1f}.png';Image.fromarray(rgba).save(f)
  bg=Image.new('RGBA',(rgb.shape[1],rgb.shape[0]),'#101827');bg.alpha_composite(Image.fromarray(rgba));bg.convert('RGB').save(sampledir/f'navy-{t:.1f}.jpg',quality=95)
  records.append({'time':t,'frame':i,'file':str(f.relative_to(P))})
 if i%150==0:print(json.dumps({'frame':i,'total':total,'seconds':round(time.monotonic()-tic,1)}),flush=True)
cap.release()
report={'model':'RobustVideoMatting mobilenetv3 fp32 ONNX','source':'https://github.com/PeterL1n/RobustVideoMatting','model_sha256':hashlib.sha256(model.read_bytes()).hexdigest(),'frames':total,'fps':fps,'duration':total/fps,'whole_clip_processed':True,'temporal_method':'Recurrent states propagated in order, no per-frame model resets','source_resolution':[478,766],'erosion_source_px':0,'feather_source_px':.35,'min_foreground_fraction':min(areas),'max_foreground_fraction':max(areas),'samples':records,'elapsed_seconds':round(time.monotonic()-tic,2),'playback_quality_verified':False,'frame_area_fractions':areas}
(P/'cache/roto-video-r2.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({'complete':True,'frames':total,'seconds':report['elapsed_seconds']}),flush=True)
