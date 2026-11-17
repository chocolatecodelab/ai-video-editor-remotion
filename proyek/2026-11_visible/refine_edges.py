"""Remove low-confidence hair background haze; preserve source and initial matte."""
from pathlib import Path
import json,shutil,subprocess,hashlib,os,time
import numpy as np,cv2
from PIL import Image
P=Path(__file__).resolve().parent;ROOT=P.parents[1];T=ROOT/'.sementara/visible'
src=P/'hyperframes/assets/talent-roto.webm';backup=T/'roto-initial.webm'
assert not backup.exists(),'Do not overwrite the reviewed initial matte'
shutil.copy2(src,backup)
dst=T/'roto-refined.webm';log=(T/'refined-encode.log').open('w');cv2.setNumThreads(1)
dec=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-threads','2','-c:v','libvpx-vp9','-i',str(backup),'-an','-f','rawvideo','-pix_fmt','rgba','pipe:1'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
enc=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','warning','-f','rawvideo','-pix_fmt','rgba','-s','478x766','-r','30','-i','pipe:0','-an','-vf','scale=out_color_matrix=bt709:out_range=tv','-c:v','libvpx-vp9','-lossless','1','-deadline','good','-cpu-used','4','-row-mt','1','-threads','2','-auto-alt-ref','0','-pix_fmt','yuva420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-metadata:s:v:0','alpha_mode=1',str(dst)],stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=log)
out=P/'out/mask-review/refined';out.mkdir(exist_ok=True)
samples={round(t*30):t for t in [2,8,13,19,25,31,37,43.5]}
y=np.arange(766,dtype=np.float32)[:,None];weight=np.clip((500-y)/70,0,1);weight=weight*weight*(3-2*weight)
n=0;tic=time.monotonic()
while True:
 data=dec.stdout.read(478*766*4)
 if not data:break
 assert len(data)==478*766*4
 rgba=np.frombuffer(data,np.uint8).reshape(766,478,4).copy();a=rgba[:,:,3].astype(np.float32)/255
 z=np.clip((a-.55)/(.97-.55),0,1);z=z*z*(3-2*z)
 z=cv2.GaussianBlur(z,(0,0),.35);a=a*(1-weight)+z*weight;a[a<.008]=0;a[a>.992]=1
 rgba[:,:,3]=np.uint8(np.clip(a*255,0,255));enc.stdin.write(rgba.tobytes())
 if n in samples:
  t=samples[n];im=Image.fromarray(rgba);im.save(out/f'cutout-{t:.1f}.png')
  for color,label in [('#101827','navy'),('#EDEAE4','ivory')]:
   bg=Image.new('RGBA',im.size,color);bg.alpha_composite(im);bg.convert('RGB').save(out/f'{label}-{t:.1f}.jpg',quality=96)
 n+=1
 if n%360==0:print(json.dumps({'frame':n,'seconds':round(time.monotonic()-tic,1)}),flush=True)
enc.stdin.close();assert dec.wait()==0;assert enc.wait()==0;log.close();assert n==1392
os.replace(dst,src)
report=json.loads((P/'cache/roto.json').read_text())
report.update(asset_sha256=hashlib.sha256(src.read_bytes()).hexdigest(),refinement={'head_alpha_low':.55,'head_alpha_high':.97,'feather_source_px':.35,'full_weight_above_source_y':430,'blend_to_original_until_y':500,'body_and_hands_below_y500':'original recurrent matte unchanged','initial_matte_backup':str(backup),'scope':'Hair haze removal from recurrent matte, no temporal processing or playback pass claimed'})
(P/'cache/roto.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({'refined_frames':n,'seconds':round(time.monotonic()-tic,1)}),flush=True)
