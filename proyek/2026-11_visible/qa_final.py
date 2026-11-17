"""Test the encoded Visible deliverable; no additional visual render."""
from pathlib import Path
import json,math
import cv2,numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageOps
from render_final import read,write,run,measure,sha
P=Path(__file__).resolve().parent;ROOT=P.parents[1];O=P/'out'
m=read(P/'manifest.json');proof=read(O/'render-proof.json');plan=read(P/'beat-sheet.json')
video=O/(m['proyek']+'.mp4');subs=read(P/'subtitles.json');geometry=read(O/'qa-geometry.json')
probe=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-count_frames','-of','json',video]).stdout)
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
decode=run(['ffmpeg','-hide_banner','-v','error','-i',video,'-f','null','NUL']);levels=measure(video)
expected=math.ceil(m['source']['duration']*m['format']['fps'])
frames=O/'final-frames';frames.mkdir(exist_ok=True);comparisons=[]
for sample in read(O/'snapshots.json')['frames']:
 t=sample['time'];idx=min(math.floor(t*30),expected-1);seek=max(0,(idx-.01)/30);path=frames/f'{t:.3f}.png'
 run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(seek),'-i',video,'-frames:v','1',path])
 ref=cv2.imread(sample['path']);actual=cv2.imread(str(path));assert ref is not None and actual is not None
 ref=cv2.resize(ref,(540,960),interpolation=cv2.INTER_AREA);actual=cv2.resize(actual,(540,960),interpolation=cv2.INTER_AREA)
 comparisons.append({'time':t,'rgb_mae_0_255':float(np.abs(ref.astype(float)-actual.astype(float)).mean()),'file':str(path.relative_to(P))})
write(O/'final-snapshot-comparison.json',comparisons)
print('Encoded snapshot comparisons complete.',flush=True)
# Warm photographic skin pixels distinguish the actual speaker from this
# episode's navy/sage/sand artwork. This detects missing/extra foreground only;
# it does not grade skin, edge beauty or temporal stability.
cap=cv2.VideoCapture(str(video));i=0;foreground_failures=[];min_skin=10**9;max_cutaway_skin=0
while True:
 ok,bgr=cap.read()
 if not ok:break
 t=i/30;beat=next((b for b in plan['beats'] if b['s']<=t<b['e']),plan['beats'][-1])
 small=cv2.resize(bgr,(270,480),interpolation=cv2.INTER_AREA)[120:430]
 B,G,R=[z.astype(float) for z in cv2.split(small)]
 count=int(((R>G*1.18)&(G>B*1.10)&(R>100)).sum())
 visible=plan['layouts'][beat['layout']]['talent_opacity']>0
 if visible:
  min_skin=min(min_skin,count)
  if count<400:foreground_failures.append({'frame':i,'skin_pixels':count,'expected':'visible talent'})
 else:
  max_cutaway_skin=max(max_cutaway_skin,count)
  if count>250:foreground_failures.append({'frame':i,'skin_pixels':count,'expected':'cutaway without talent'})
 i+=1
cap.release()
write(O/'final-foreground-check.json',{'decoded_frames':i,'minimum_visible_skin_pixels':min_skin,'maximum_cutaway_skin_pixels':max_cutaway_skin,'failures':foreground_failures,'scope':'Foreground presence by source/brand colour separation only, not a beauty or temporal quality pass'})
def hashes(path):
 r=run(['ffmpeg','-hide_banner','-loglevel','error','-i',path,'-an','-f','framemd5','-'])
 return [line for line in r.stdout.splitlines() if line and not line.startswith('#')]
before=hashes(proof['rendered_video']);after=hashes(video)
check=read(O/'hyperframes-check.json');audio=read(O/'audio-preflight.json')
checks={
 'user_approved':m['approval']['storyboard'] and m['approval']['render'],
 'approved_composition':sha(P/'hyperframes/index.html')==proof['composition_sha256']==m['approval']['composition_sha256'],
 'approved_beats':sha(P/'beat-sheet.json')==proof['beat_sheet_sha256'],
 'approved_subtitles':sha(P/'subtitles.json')==proof['subtitles_sha256'],
 'approved_matte':sha(P/'hyperframes/assets/talent-roto.webm')==proof['mask_asset_sha256'],
 'approved_audio_plan':sha(P/'audio-plan.json')==m['approval']['audio_plan_sha256'],
 'size_1080x1920':(v['width'],v['height'])==(1080,1920),
 'h264_aac':v['codec_name']=='h264' and a['codec_name']=='aac',
 'yuv420p':v['pix_fmt']=='yuv420p',
 'bt709':all(v.get(k)=='bt709' for k in ['color_space','color_transfer','color_primaries']),
 '30fps':v['r_frame_rate']=='30/1',
 'all_frames_encoded':int(v['nb_read_frames'])==expected==i,
 'duration_matches':abs(float(probe['format']['duration'])-m['source']['duration'])<.1,
 'audio_length_matches':abs(float(v['duration'])-float(a['duration']))<.12,
 'decode_no_errors':not decode.stderr.strip(),
 'loudness':abs(float(levels['input_i'])+14)<=1,
 'true_peak':float(levels['input_tp'])<=-2,
 'audio_prepared_before_visual_render':audio['prepared_before_visual_render'],
 'planned_sfx_events_prepared':len(audio['sfx'])==len(read(P/'audio-plan.json')['sfx'])==6,
 'foreground_present_all_frames':not foreground_failures,
 'reviewed_snapshot_match':all(c['rgb_mae_0_255']<12 for c in comparisons),
 'metadata_remux_pixels_identical':before==after and len(after)==expected,
 'single_completed_visual_render':proof['completed_visual_renders']==1,
 'caption_reading_rate':all(max(len(s['en']),len(s['id']))/(s['e']-s['s'])<=17.001 for s in subs),
 'caption_geometry':not geometry['alpha_caption_collisions'] and not geometry['floating_body_frames'] and not geometry['wrap_or_safe_area_failures'],
 'caption_minimum_font':geometry['minimum_font_px']>=40,
 'composition_check':check['ok'],
}
write(O/'ffprobe.json',probe)
font=lambda n:ImageFont.truetype(str(ROOT/'pipeline/fonts/Inter-Variable.ttf'),n)
for filename,times in [('kontak-final.jpg',[2,8.4,12.8,16.7,23.4,29.5,40.5,44.4]),('fase-final.jpg',[19.2,21.5,23.4,26.6,34.5,37.4,38.7,40.5])]:
 sheet=Image.new('RGB',(1440,1400),'#101827');d=ImageDraw.Draw(sheet)
 for n,t in enumerate(times):
  im=ImageOps.contain(Image.open(frames/f'{t:.3f}.png').convert('RGB'),(344,612));x=n%4*360+8;y=n//4*700+43;sheet.paste(im,(x,y));d.text((x,y-30),f'{t:.1f}s · encoded',font=font(20),fill='#EDEAE4')
 sheet.save(O/filename,quality=96)
qa={'status':'LULUS' if all(checks.values()) else 'GAGAL','scope':'Encoded-file technical checks; human playback/listening remain separate','checks':checks,
    'audio':{'integrated_lufs':float(levels['input_i']),'true_peak_dbtp':float(levels['input_tp']),'sfx_events':6,'music':False},
    'video':{'duration':float(probe['format']['duration']),'frames':i,'width':v['width'],'height':v['height'],'size_bytes':video.stat().st_size},
    'sha256':sha(video),'max_snapshot_mae':max(c['rgb_mae_0_255'] for c in comparisons),
    'modul':{'bang-motion':'1.19.0','hyperframes':'0.9.33','NazarVerse':'1.0','K11-K14':'0.1'},
    'manual_pending':['Normal-speed playback: hair/shoulder matte stability, native motion rhythm and continuity.','Listen on phone: voice/SFX comfort and subtitle/lip timing.']}
write(O/'qa.json',qa)
summary='\n'.join(f'- {key}: {"LULUS" if value else "GAGAL"}' for key,value in checks.items())
report=f'''# QA final Visible — {qa['status']}

Cakupan: pemeriksaan teknis pada MP4 hasil encode. Pengguna menyetujui storyboard dan produksi melalui pesan “lanjutkan ke render final”. Bukan penilaian keluwesan otomatis.

{summary}

## Hasil terukur
Durasi {qa['video']['duration']:.3f}s; {i} frame @30fps; 1080×1920 H.264/AAC yuv420p bt709. Sumber matte terdiri dari 1392 frame; pembulatan durasi audio ke frame 30fps mempertahankan pose terakhir pada ekor pendek, tanpa mengubah narasi.
Audio {qa['audio']['integrated_lufs']:.2f} LUFS; true peak {qa['audio']['true_peak_dbtp']:.2f} dBTP. Suara asli dan jeda dipertahankan; enam kontak air/tanah/keramik/daun pelan sesuai audio-plan.json. Tidak ada musik latar. Campuran lengkap disiapkan dan diukur sebelum render visual.

Satu render visual HyperFrames selesai. MP4 final memakai stream copy video/AAC dan metadata bt709. Seluruh hash frame terdekode sebelum/sesudah mux identik: {checks['metadata_remux_pixels_identical']}. {len(comparisons)} frame hasil encode dibandingkan dengan snapshot storyboard; MAE RGB maksimum {qa['max_snapshot_mae']:.3f}/255. Kehadiran talent diperiksa pada semua frame menggunakan pemisahan warna fotografis dari palet grafis; ini bukan ukuran mutu mask. Laporan rinci: render-proof.json, final-snapshot-comparison.json, final-foreground-check.json, audio-preflight.json dan ffprobe.json.

## Bukti visual
kontak-final.jpg, fase-final.jpg dan final-frames/ berasal dari MP4 final. Tepi matte pada navy/ivory ada di mask-review/edges.jpg; pemeriksaan visual akhir dicatat terpisah setelah file dibuka. Komposisi, beat-sheet, subtitle dan media alpha sama dengan storyboard yang disetujui. Full check komposisi sebelumnya tidak memiliki galat/peringatan.

## Checklist manual yang belum dicentang
- [ ] Tonton kecepatan normal: kestabilan rambut/bahu, ritme, keluwesan dan kontinuitas.
- [ ] Dengar seluruh video di HP: kejernihan vokal, kenyamanan efek suara dan sinkron bibir/subtitle.

Still, pixel delta, tes keberadaan talent dan nama model tidak membuktikan mask bebas flicker atau gerak premium. Detail sumber 478×850 tetap membatasi rambut; bagian bahu di luar rekaman tidak diciptakan. Pemeriksaan dengar independen tidak diklaim.

Modul: bang-motion1.19.0, HyperFrames0.9.33, NazarVerse1.0, K11–K14v0.1. Engine HyperFrames mengikuti pilihan percakapan, dengan gerbang hash per storyboard karena skemanya berbeda dari Remotion/video.py. Hanya satu MP4 hasil; media antara tetap di D: .sementara.
'''
(O/'qa-report.md').write_text(report,encoding='utf8')
m['status']='selesai' if qa['status']=='LULUS' else 'qa_failed';m['final']={'path':'out/'+video.name,'sha256':qa['sha256'],'qa_technical':qa['status'],'duration':qa['video']['duration']};write(P/'manifest.json',m)
print(json.dumps(qa,ensure_ascii=False))
if qa['status']!='LULUS':raise SystemExit(1)
