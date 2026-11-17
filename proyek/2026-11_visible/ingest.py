from pathlib import Path
import json,os,shutil,subprocess,wave
import numpy as np
import cv2
from PIL import Image,ImageOps,ImageDraw,ImageFont

P=Path(__file__).resolve().parent;ROOT=P.parents[1]
TMP=ROOT/'.sementara/visible';TMP.mkdir(exist_ok=True)
os.environ.update(TEMP=str(TMP),TMP=str(TMP),HF_HOME=str(ROOT/'.sementara/huggingface'),XDG_CACHE_HOME=str(TMP))
for d in ['aset','cache','out','out/source-frames','hyperframes/assets']:(P/d).mkdir(parents=True,exist_ok=True)
src=Path('D:/KERJAAN/CONTENT CREATOR/NAZARVERSE/VISIBLE.mp4')
if not (P/'aset/source.mp4').exists():shutil.copy2(src,P/'aset/source.mp4')
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(src)]))
(P/'cache/source-probe.json').write_text(json.dumps(probe,indent=2),encoding='utf8')
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-vn','-ar','16000','-ac','1',str(P/'cache/audio.wav')],check=True)
cap=cv2.VideoCapture(str(src));sheet=Image.new('RGB',(1200,1120),'#101827');d=ImageDraw.Draw(sheet)
font=ImageFont.truetype(str(ROOT/'pipeline/fonts/Inter-Variable.ttf'),20)
for i,t in enumerate([.5,6,12,18,24,30,36,44]):
 cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,bgr=cap.read();assert ok
 im=Image.fromarray(cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB));im.save(P/f'out/source-frames/{t:.1f}.jpg',quality=95)
 thumb=ImageOps.contain(im,(288,512));x=i%4*300+6;y=i//4*560+35;sheet.paste(thumb,(x,y));d.text((x,y-28),f'{t:.1f}s',font=font,fill='#EDEAE4')
cap.release();sheet.save(P/'out/contact-source.jpg',quality=94)
print('Source and contact sheet ready',flush=True)
from faster_whisper import WhisperModel
modelroot=ROOT/'.sementara/whisper-models/models--Systran--faster-whisper-base.en/snapshots'
models=[p for p in modelroot.glob('*') if (p/'model.bin').exists()]
assert models,'Local Whisper model not found'
model=WhisperModel(str(models[0]),device='cpu',compute_type='int8',cpu_threads=4)
with wave.open(str(P/'cache/audio.wav'),'rb') as wav:
 audio=np.frombuffer(wav.readframes(wav.getnframes()),dtype=np.int16).astype(np.float32)/32768
segments,info=model.transcribe(audio,language='en',word_timestamps=True,vad_filter=True,beam_size=5)
words=[];lines=[]
for seg in segments:
 lines.append({'s':seg.start,'e':seg.end,'text':seg.text})
 for w in seg.words or []:words.append({'w':w.word.strip(),'s':round(w.start,3),'e':round(w.end,3),'p':round(w.probability,3)})
result={'_meta':{'backend':'faster-whisper','model':'base.en','language':'en','dikoreksi':False},'kata':words,'segments':lines}
assert not (P/'cache/words.json').exists(),'Never overwrite a transcript'
(P/'cache/words.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf8')
(P/'naskah-asr.md').write_text('# Transkrip otomatis, belum koreksi dengar\n\n'+'\n\n'.join(f"{s['s']:.2f}–{s['e']:.2f}s: {s['text']}" for s in lines),encoding='utf8')
print(json.dumps(lines,ensure_ascii=False),flush=True)
