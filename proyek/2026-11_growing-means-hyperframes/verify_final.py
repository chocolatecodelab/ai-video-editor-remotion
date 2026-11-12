from pathlib import Path
import subprocess,json,sys,hashlib
import cv2
from PIL import Image,ImageDraw,ImageFont
P=Path(__file__).parent;O=P/'out';R=P.parents[1];F=O/'GROWING-MEANS-FINAL.mp4'
sys.path.insert(0,str(R/'pipeline/scripts'))
from sistem import ukur_loudness
def run(a):return subprocess.run(a,capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
d=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(F)]).stdout)
err=run(['ffmpeg','-v','error','-i',str(F),'-f','null','-']).stderr
a=ukur_loudness(F);v=next(x for x in d['streams'] if x['codec_type']=='video');au=next(x for x in d['streams'] if x['codec_type']=='audio')
assert (v['width'],v['height'],v['codec_name'],v['pix_fmt'])==(1080,1920,'h264','yuv420p')
assert v['avg_frame_rate']=='30/1' and au['codec_name']=='aac' and not err
assert abs(float(d['format']['duration'])-43.433)<.1
c=cv2.VideoCapture(str(F));font=ImageFont.truetype(str(P/'hyperframes/assets/DMSans.ttf'),18)
def sheet(times,name):
    im=Image.new('RGB',(810,508*((len(times)+2)//3)),'#101827');dr=ImageDraw.Draw(im)
    for i,t in enumerate(times):
        c.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,b=c.read();assert ok
        frame=Image.fromarray(cv2.cvtColor(b,cv2.COLOR_BGR2RGB));frame.thumbnail((270,480));x=i%3*270;y=i//3*508
        im.paste(frame,(x,y+28));dr.text((x+8,y+2),f'{t:.2f}s',font=font,fill='#EDEAE4')
    im.save(O/name,quality=94)
sheet([1,3,6,9,18,27,33,39,43.3],'final-contact.jpg')
sheet([.1,.5,1,35.1,36,37,39,41,43.3],'final-mask-samples.jpg')
c.release()
r={'file':str(F.resolve()),'sha256':hashlib.sha256(F.read_bytes()).hexdigest(),'bytes':F.stat().st_size,'probe':d,'audio':a,'decode_errors':err,'visual_review':'pending sampled-frame inspection','limitations':['Full real-time headphone listening and artistic playback not verified.','Fine hair constrained by 478x850 source.']}
(O/'qa-final.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
print(json.dumps({'audio':a,'duration':d['format']['duration'],'bytes':F.stat().st_size,'video':{k:v.get(k) for k in ['width','height','avg_frame_rate','color_space','color_transfer','color_primaries']}}))
