"""Align only the three user-confirmed corrections against the source audio."""
from pathlib import Path
import os,json,wave
import numpy as np
P=Path(__file__).resolve().parent;ROOT=P.parents[1]
os.environ.update(TEMP=str(ROOT/'.sementara/visible'),TMP=str(ROOT/'.sementara/visible'))
from faster_whisper import WhisperModel
from faster_whisper.tokenizer import Tokenizer
from faster_whisper.transcribe import merge_punctuations
models=[p for p in (ROOT/'.sementara/whisper-models/models--Systran--faster-whisper-base.en/snapshots').glob('*') if (p/'model.bin').exists()]
model=WhisperModel(str(models[0]),device='cpu',compute_type='int8',cpu_threads=2)
tok=Tokenizer(model.hf_tokenizer,model.model.is_multilingual,task='transcribe',language='en')
with wave.open(str(P/'cache/audio.wav'),'rb') as wav:audio=np.frombuffer(wav.readframes(wav.getnframes()),dtype=np.int16).astype(np.float32)/32768
parts=[(16.1,20.8,"It's frustrating. But here's something worth remembering."),
       (32.5,37.8,"So, don't underestimate the little steps you're taking today,"),
       (41.1,44.8,"doesn't mean you're not moving forward.")]
data=json.loads((P/'cache/words.json').read_text(encoding='utf8'));words=data['kata'];proof=[]
for start,end,text in parts:
 clip=audio[round(start*16000):round(end*16000)]
 features=model.feature_extractor(clip)[:,:model.feature_extractor.nb_max_frames]
 enc=model.encode(features)
 alignment=model.find_alignment(tok,[tok.encode(' '+text)],enc,round(len(clip)/160))[0]
 merge_punctuations(alignment,"\"'“¿([{-","\"'.。,，!！?？:：”)]}、")
 aligned=[{'w':a['word'].strip(),'s':round(start+float(a['start']),3),'e':round(start+float(a['end']),3),'p':round(float(a['probability']),3),'text_source':'user-confirmed phrase','timing_source':'Whisper attention alignment against actual audio'} for a in alignment if a['word'].strip()]
 words=[w for w in words if not start<=w['s']<end]+aligned;proof.append({'start':start,'end':end,'text':text,'words':aligned})
words.sort(key=lambda w:w['s'])
(P/'cache/words-confirmed.json').write_text(json.dumps({'_meta':{'dikoreksi':False,'scope':'Three phrases confirmed by user; rest original ASR, no full listening audit claimed'},'kata':words},indent=2),encoding='utf8')
(P/'caption-confirmation.json').write_text(json.dumps({'user_reply':'Ya, ketiganya benar','date':'2026-11-17','parts':proof,'storyboard_or_render_approval':False},indent=2),encoding='utf8')
print(json.dumps(proof,ensure_ascii=False))
