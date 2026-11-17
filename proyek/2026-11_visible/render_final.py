"""Render approved Visible once, after preparing its complete audio mix."""
from pathlib import Path
import datetime as dt
import hashlib,json,os,re,subprocess,wave
import numpy as np
from scipy.signal import butter,sosfilt

P=Path(__file__).resolve().parent;ROOT=P.parents[1]
TMP=ROOT/'.sementara/visible-final';TMP.mkdir(exist_ok=True)
os.environ.update(TEMP=str(TMP),TMP=str(TMP),VIDEO_TEMP=str(TMP))
CLI=ROOT/'.sementara/npm-cache/_npx/702923228c2ce1e6/node_modules/hyperframes/bin/hyperframes.mjs'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
write=lambda p,d:p.write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def run(args):return subprocess.run([str(a) for a in args],capture_output=True,text=True,check=True)
def measure(path):
 r=run(['ffmpeg','-hide_banner','-nostats','-i',path,'-vn','-af','loudnorm=I=-14:TP=-2.5:LRA=11:print_format=json','-f','null','NUL'])
 return json.loads(re.findall(r'\{[\s\S]*?\}',r.stderr)[-1])

def prepare_audio(duration):
 """Small deterministic contact/brush sounds, no music bed or altered speech."""
 sr=48000;source=TMP/'source-voice.wav';rawmix=TMP/'mix-before-master.wav'
 run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',P/'hyperframes/assets/voice.m4a','-vn','-ar',str(sr),'-ac','2','-c:a','pcm_s16le',source])
 with wave.open(str(source),'rb') as w:voice=np.frombuffer(w.readframes(w.getnframes()),np.int16).reshape(-1,2).astype(np.float64)/32768
 n=round(duration*sr);mix=np.zeros((n,2),np.float64);mix[:min(n,len(voice))]=voice[:n]
 rng=np.random.default_rng(170611);events=read(P/'audio-plan.json')['sfx'];records=[]
 for idx,event in enumerate(events):
  kind=event['type'];length=.24 if 'water' in kind else (.46 if 'ceramic' in kind else .32)
  t=np.arange(round(length*sr))/sr;noise=rng.normal(0,1,len(t))
  if 'water' in kind:
   body=sosfilt(butter(2,[240,2500],fs=sr,btype='bandpass',output='sos'),noise)
   resonance=np.sin(2*np.pi*(920*t-380*t*t))*np.exp(-t*42)
   signal=(body*.65+resonance*.35)*(1-np.exp(-t*1400))*np.exp(-t*26)
   peak=.006;pan=.38
  else:
   band=[500,3100] if 'ceramic' in kind else [1300,5800]
   body=sosfilt(butter(2,band,fs=sr,btype='bandpass',output='sos'),noise)
   env=np.sin(np.pi*t/length)**2
   signal=body*env;peak=.0035;pan=0 if 'ceramic' in kind or idx==4 else -.38
  signal=signal/(np.max(np.abs(signal))+1e-12)*peak
  # A tiny early reflection softens the contact without a whoosh or chime.
  delay=round(.035*sr);signal[delay:]+=signal[:-delay]*.12
  stereo=signal[:,None]*np.array([np.sqrt((1-pan)/2),np.sqrt((1+pan)/2)])[None]
  start=round(event['time']*sr);end=min(n,start+len(stereo));mix[start:end]+=stereo[:end-start]
  records.append({**event,'duration':length,'pan':pan,'pre_master_peak_dbfs':float(20*np.log10(np.max(np.abs(stereo))+1e-12))})
 assert np.max(np.abs(mix))<.99,'Pre-master mix clipped'
 with wave.open(str(rawmix),'wb') as w:
  w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes(np.int16(np.clip(mix,-1,1)*32767).tobytes())
 first=measure(rawmix)
 filt=('loudnorm=I=-14:TP=-2.5:LRA=11:'+f"measured_I={first['input_i']}:measured_TP={first['input_tp']}:measured_LRA={first['input_lra']}:measured_thresh={first['input_thresh']}:offset={first['target_offset']}:linear=true")
 final=TMP/'audio-final.m4a'
 run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',rawmix,'-af',filt,'-t',str(duration),'-ar',str(sr),'-c:a','aac','-b:a','256k',final])
 levels=measure(final)
 write(P/'out/audio-preflight.json',{'pre_master':first,'prepared':levels,'sha256':sha(final),'prepared_before_visual_render':True,'music':False,'sfx':records,'source_speech_reordered_or_cut':False,'human_listening_verified':False})
 assert abs(float(levels['input_i'])+14)<=1 and float(levels['input_tp'])<=-2,levels
 return final

if __name__=='__main__':
 m=read(P/'manifest.json');sb=read(P/'out/storyboard.json')
 for path,key in [('hyperframes/index.html','composition_sha256'),('beat-sheet.json','beat_sheet_sha256'),('subtitles.json','subtitles_sha256'),('hyperframes/assets/talent-roto.webm','mask_asset_sha256')]:
  assert sha(P/path)==sb[key],f'{path} changed since storyboard review'
 assert read(P/'out/hyperframes-check.json')['ok']
 geom=read(P/'out/qa-geometry.json')
 assert not geom['wrap_or_safe_area_failures'] and not geom['alpha_caption_collisions'] and not geom['floating_body_frames']
 final=P/'out'/(m['proyek']+'.mp4')
 assert not final.exists(),'Final exists: inspect it instead of another visual render'
 approval=m['approval'];approval.update(storyboard=True,render=True,render_message='lanjutkan ke render final',at=dt.datetime.now().astimezone().isoformat(),storyboard_version=sb['version'],composition_sha256=sb['composition_sha256'],beat_sheet_sha256=sb['beat_sheet_sha256'],subtitles_sha256=sb['subtitles_sha256'],mask_asset_sha256=sb['mask_asset_sha256'],audio_plan_sha256=sha(P/'audio-plan.json'))
 m['status']='rendering';write(P/'manifest.json',m);write(P/'out/render-approval.json',approval)
 for name in ['out/storyboard.json','storyboard-summary.json']:
  doc=read(P/name);doc.update(storyboard_approved=True,render_approved=True,approval_message=approval['render_message']);write(P/name,doc)
 audio=prepare_audio(m['source']['duration'])
 print('Complete audio mix prepared and measured. Starting approved HyperFrames visual render.',flush=True)
 rendered=TMP/'hyperframes-render.mp4'
 cmd=['node',str(CLI),'render',str(P/'hyperframes'),'--output',str(rendered),'--fps','30','--quality','high','--format','mp4','--workers','2','--video-frame-format','png','--frames-cache-dir',str(TMP/'frame-cache'),'--strict']
 write(P/'out/render-command.json',{'command':cmd,'composition_sha256':sb['composition_sha256'],'source_alpha_sha256':sb['mask_asset_sha256']})
 with (TMP/'render.log').open('w',encoding='utf8') as log:subprocess.run(cmd,stdout=log,stderr=subprocess.STDOUT,check=True,env=os.environ)
 print('Visual render complete. Attaching prepared AAC and bt709 metadata by stream copy.',flush=True)
 run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',rendered,'-i',audio,'-map','0:v:0','-map','1:a:0','-c','copy','-t',str(m['source']['duration']),'-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart',final])
 write(P/'out/render-proof.json',{'engine':'HyperFrames 0.9.33','completed_visual_renders':1,'composition_sha256':sb['composition_sha256'],'beat_sheet_sha256':sb['beat_sheet_sha256'],'subtitles_sha256':sb['subtitles_sha256'],'mask_asset_sha256':sb['mask_asset_sha256'],'final_audio_sha256':sha(audio),'rendered_video':str(rendered),'final_path':str(final),'final_sha256':sha(final),'delivery_remux':'H264 stream copy with bt709 bitstream metadata + prepared AAC stream copy'})
 print(f'Final ready for encoded-file QA: {final}',flush=True)
