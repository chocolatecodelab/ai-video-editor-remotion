"""Verify the encoded final MP4 without another visual render."""
from pathlib import Path
import hashlib
import json
import subprocess
import re
from PIL import Image, ImageDraw, ImageFont, ImageOps

P=Path(__file__).resolve().parent
ROOT=P.parents[1]
cfg=json.loads((P/'manifest.json').read_text(encoding='utf8'))
out=P/'out'
video=out/(cfg['proyek']+'.mp4')
proof=json.loads((out/'render-proof.json').read_text(encoding='utf8'))
spec=json.loads((P/'beat-sheet.json').read_text(encoding='utf8'))
groups=json.loads((P/'cache/caption-groups.json').read_text(encoding='utf8'))
words=json.loads((P/'cache/words.storyboard.json').read_text(encoding='utf8'))['kata']
def run(args):
    return subprocess.run(args,capture_output=True,text=True,check=True)
probe=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-count_frames','-of','json',str(video)]).stdout)
v=next(s for s in probe['streams'] if s['codec_type']=='video')
a=next(s for s in probe['streams'] if s['codec_type']=='audio')
decode=run(['ffmpeg','-hide_banner','-v','error','-i',str(video),'-f','null','NUL'])
measure=run(['ffmpeg','-hide_banner','-nostats','-i',str(video),'-vn','-af','loudnorm=I=-14:TP=-2:LRA=11:print_format=json','-f','null','NUL'])
levels=json.loads(re.findall(r'\{[\s\S]*?\}',measure.stderr)[-1])
checks={
 'user_approved':cfg['approval']['storyboard'] and cfg['approval']['final_render'],
 'approved_beats':cfg['approval']['beat_sheet_sha256']==proof['beat_sheet_sha256'],
 'size_1080x1920':(v['width'],v['height'])==(1080,1920),
 'h264_aac':v['codec_name']=='h264' and a['codec_name']=='aac',
 'yuv420p':v['pix_fmt']=='yuv420p',
 'bt709':all(v.get(k)=='bt709' for k in ['color_space','color_transfer','color_primaries']),
 '30fps':v['r_frame_rate']=='30/1',
 'all_frames_encoded':int(v['nb_read_frames'])==proof['frames']==1760,
 'duration_matches':abs(float(probe['format']['duration'])-cfg['format']['duration'])<.1,
 'audio_length_matches':abs(float(v['duration'])-float(a['duration']))<.12,
 'decode_no_errors':not decode.stderr.strip(),
 'loudness':abs(float(levels['input_i'])+14)<=1,
 'true_peak':float(levels['input_tp'])<=-2,
 'every_frame_layout':not proof['failures'],
 'browser_no_errors':not proof['errors'],
 'single_visual_render':proof['visualRenders']==1,
 'caption_minimum_40px':spec['caption']['size']>=40 and spec['caption']['translation_size']>=40,
 'caption_reading_rate':all(max(len(g['id']),len(' '.join(words[i]['w'] for i in g['words'])))/(g['e']-g['s'])<=17.001 for g in groups),
}
times=[1.5,17.2,21.3,29.5,45,56.9]
frames=out/'final-frames';frames.mkdir(exist_ok=True)
for i,t in enumerate(times):
    run(['ffmpeg','-hide_banner','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(frames/f'{i}.png')])
font=ImageFont.truetype(str(ROOT/'pipeline/fonts/Inter-Variable.ttf'),21)
sheet=Image.new('RGB',(1080,1330),(16,24,39));d=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
    im=ImageOps.contain(Image.open(frames/f'{i}.png').convert('RGB'),(344,612))
    x=i%3*360+8;y=i//3*665+40;sheet.paste(im,(x,y));d.text((x,y-29),f'{t:04.1f}s',font=font,fill=(237,234,228))
sheet.save(out/'kontak-final.jpg',quality=94)

# Four phases around the two continuity fixes, extracted from final encoded output.
phase_times=[18.8,19.0,19.3,19.8,25.3,25.5,25.7,26.0]
phase=Image.new('RGB',(4*270,2*510),(16,24,39));pd=ImageDraw.Draw(phase)
for i,t in enumerate(phase_times):
    dest=frames/f'phase-{i}.png'
    run(['ffmpeg','-hide_banner','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(dest)])
    im=ImageOps.contain(Image.open(dest).convert('RGB'),(262,466));x=i%4*270+4;y=i//4*510+32
    phase.paste(im,(x,y));pd.text((x,y-28),f'{t:.1f}s',font=font,fill=(237,234,228))
phase.save(out/'kontak-fase-final.jpg',quality=94)

qa={'status':'LULUS' if all(checks.values()) else 'GAGAL','scope':'QA teknis otomatis; tinjauan artistik terpisah','checks':checks,'audio':{'integrated_lufs':float(levels['input_i']),'true_peak_dbtp':float(levels['input_tp']),'lra':float(levels['input_lra'])},'video':{'duration':float(probe['format']['duration']),'frames':int(v['nb_read_frames']),'width':v['width'],'height':v['height'],'size_bytes':video.stat().st_size},'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'modul':{'bang-motion':'1.19.0','brand':'NazarVerse 1.0','platform':'0.4','caption-premium-full-frame':'0.1','kurasi-motion-premium':'0.1','motion-hidup':'0.1','motion-native-brand-qa':'0.1'},'manual_pending':['Dengar keseluruhan suara dan cek timing subtitle pada HP.','Tinjau keluwesan/ritme saat playback; still dan determinisme bukan bukti gerak premium.'],'approval_message':cfg['approval']['render_message']}
(out/'qa.json').write_text(json.dumps(qa,indent=2,ensure_ascii=False),encoding='utf8')
(out/'ffprobe.json').write_text(json.dumps(probe,indent=2),encoding='utf8')
summary='\n'.join(f'- {k}: {"LULUS" if passed else "GAGAL"}' for k,passed in checks.items())
(out/'qa-report.md').write_text(f'''# QA final — {qa['status']}

Cakupan: pemeriksaan teknis otomatis pada MP4 final. Persetujuan storyboard dan render dari pengguna: “ya jalankan”.

{summary}

## Hasil terukur

- Durasi {qa['video']['duration']:.3f}s; 1760 frame @30fps; 1080×1920; H.264/AAC; yuv420p; bt709.
- Loudness {qa['audio']['integrated_lufs']:.2f} LUFS; true peak {qa['audio']['true_peak_dbtp']:.2f} dBTP.
- Semua 1760 frame diperiksa untuk batas caption dan tabrakan area gambar; hasil ada di render-proof.json.
- Satu ekspor visual final selesai, frame PNG langsung dialirkan ke encoder. Percobaan awal dihentikan sebelum selesai untuk memperbaiki ukuran/kecepatan baca subtitle Indonesia; partial disimpan di .sementara, bukan folder hasil. Audio selesai disiapkan sebelum render.
- Kata/frasa subtitle dari storyboard yang disetujui; dua usulan ejaan diterima sebagai bagian storyboard. Tidak mengklaim pemeriksaan dengar independen.

## Bukti visual dan artistik

Frame hasil encode: kontak-final.jpg. Fase sambungan: kontak-fase-final.jpg. Penilaian visual dicatat terpisah pada qa-artistik-final.md setelah gambar diperiksa. QA teknis bukan persetujuan artistik.

## Checklist manual pengguna — belum dicentang

- [ ] Dengar keseluruhan suara di HP: kejernihan, noise, kenyamanan dan sinkron subtitle.
- [ ] Tonton kecepatan normal: keluwesan gerak, ritme dan emosi tribute.
- [ ] Pastikan pemenggalan/terjemahan tetap sesuai maksud narasi.

Tidak membuat ProRes terpisah karena aturan ekspor terbaru meminta satu MP4 hasil saja. Engine bang-motion mengikuti permintaan eksplisit pengguna; bukan render standar Remotion/video.py. Sumber/komposisi lokal tetap tersimpan.

Modul: bang-motion 1.19.0; NazarVerse 1.0; platform 0.4; K11/K12/K13/K14 0.1.
Upgrade berikutnya: rekaman kenangan tambahan dapat memperkaya bagian “little things” bila nanti tersedia.
''',encoding='utf8')
cfg['status']='selesai' if qa['status']=='LULUS' else 'qa_failed'
cfg['final']={'path':'out/'+video.name,'sha256':qa['sha256'],'qa':qa['status'],'duration':qa['video']['duration']}
(P/'manifest.json').write_text(json.dumps(cfg,indent=2,ensure_ascii=False),encoding='utf8')
sb=json.loads((out/'storyboard.json').read_text());sb.update({'approved':True,'approved_message':cfg['approval']['render_message']});(out/'storyboard.json').write_text(json.dumps(sb,indent=2),encoding='utf8')
print(json.dumps({'status':qa['status'],'checks':checks,'audio':qa['audio'],'video':qa['video']},ensure_ascii=False))
if qa['status']!='LULUS':raise SystemExit(1)
