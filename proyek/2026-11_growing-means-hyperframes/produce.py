"""Produce approved motion talent and audio before the single final HyperFrames render."""
from pathlib import Path
import json,hashlib,datetime,subprocess,sys,wave
import numpy as np,cv2,onnxruntime as ort
from PIL import Image
P=Path(__file__).parent;R=P.parents[1];A=P/'hyperframes/assets';C=P/'cache';O=P/'out'
sys.path.insert(0,str(R/'pipeline/scripts'))
from sistem import loudnorm_2pass,ukur_loudness
m=json.loads((P/'manifest.json').read_text());m['persetujuan']={'message':'ya jalankan render finalnya','revision':'bilingual storyboard','beat_sheet_sha':hashlib.sha256((P/'beat-sheet.json').read_bytes()).hexdigest(),'waktu':datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).isoformat()};m['status']='production';(P/'manifest.json').write_text(json.dumps(m,indent=2))
# A quiet original ambient bed. No downloaded/licensed music or added speech.
sr=48000;n=round(43.433*sr);t=np.arange(n)/sr
bed=np.zeros(n)
for f,g in [(130.81,1),(196,.5),(261.63,.25),(293.66,.14)]:bed+=g*np.sin(2*np.pi*f*t+.09*np.sin(2*np.pi*.12*t))
bed=bed/np.max(np.abs(bed))*.003*np.minimum(t/2,1)*np.clip((43.433-t)/3,0,1)
with wave.open(str(C/'ambient.wav'),'wb') as w:w.setparams((2,2,sr,0,'NONE','not compressed'));w.writeframes((np.column_stack([bed,bed])*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-i',str(A/'voice.wav'),'-i',str(C/'ambient.wav'),'-filter_complex','[0:a][1:a]amix=inputs=2:normalize=0:duration=first[a]','-map','[a]','-c:a','pcm_s24le',str(C/'mix.wav')],check=True)
loudnorm_2pass(C/'mix.wav',A/'master.wav',-14,-2.6,11)
(O/'audio-measurement.json').write_text(json.dumps(ukur_loudness(A/'master.wav')))
print('audio ready',flush=True)
opts=ort.SessionOptions();opts.intra_op_num_threads=4;opts.inter_op_num_threads=1
s=ort.InferenceSession(str(R/'.sementara/rvm_mobilenetv3_fp32.onnx'),sess_options=opts,providers=['CPUExecutionProvider'])
c=cv2.VideoCapture(m['source']);count=int(c.get(cv2.CAP_PROP_FRAME_COUNT));rec=[np.zeros((1,1,1,1),np.float32) for _ in range(4)]
cmd=['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s','478x456','-r','30','-i','pipe:0','-an','-c:v','libvpx-vp9','-pix_fmt','yuva420p','-lossless','1','-auto-alt-ref','0','-row-mt','1','-threads','2',str(A/'talent.webm')]
proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
for k in range(count):
    ok,bgr=c.read();assert ok
    if 198<=k<1020:
        proc.stdin.write(np.zeros((456,478,4),np.uint8).tobytes())
        continue
    if k==1020:rec=[np.zeros((1,1,1,1),np.float32) for _ in range(4)]
    rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)
    f,a,*rec=s.run(None,dict(src=rgb.transpose(2,0,1)[None].astype(np.float32)/255,**{f'r{j+1}i':v for j,v in enumerate(rec)},downsample_ratio=np.array([.4],np.float32)))
    rgba=np.dstack((np.uint8(np.clip(f[0].transpose(1,2,0),0,1)*255),np.uint8(np.clip((a[0,0]-.015)/.985,0,1)*255)))[360:816]
    proc.stdin.write(rgba.tobytes())
    if k in [0,30,90,180,1050,1110,1170,1260,1300]:
        al=rgba[:,:,3:4]/255.;im=np.uint8(rgba[:,:,:3]*al+np.array([16,24,39])*(1-al));Image.fromarray(im).save(O/f'mask-{k}.jpg')
    if k%30==0:print('mask',k,count,flush=True)
proc.stdin.close();assert proc.wait()==0;c.release()
(C/'matte.json').write_text(json.dumps({'frames':count,'fps':30,'crop':[0,360,478,456],'backend':'RVM recurrent per visible segment','downsample_ratio':.4,'visible_ranges':[[0,6.6],[35,43.4]],'warmup_second_segment':34,'hidden_frames':'transparent; talent not on screen','visible_frames_skipped':False}))
html=(P/'hyperframes/index.html').read_text(encoding='utf-8')
for key,start,end,stamp in [('grow',0,6.6,3),('become',35,43.433,39)]:
    old=f'<img class="talent" src="assets/talent-{stamp}.png" alt="Talent mask pilot">'
    new=f'<video id="talent-{key}" class="clip talent" src="assets/talent.webm" muted playsinline data-start="{start}" data-duration="{min(end,count/30)-start}" data-media-start="{start}" data-track-index="0"></video>'
    assert old in html;html=html.replace(old,new)
html=html.replace('src="assets/voice.wav"','src="assets/master.wav"')
(P/'hyperframes/index.html').write_text(html,encoding='utf-8')
print('production composition ready',flush=True)
