"""Verify the actual encoded deliverable without another visual render."""
from pathlib import Path
import hashlib
import json
import math
import subprocess
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
from render_final import measure, run, sha, read, write

P = Path(__file__).resolve().parent
ROOT = P.parents[1]
O = P / 'out'
m = read(P / 'manifest.json')
video = O / (m['proyek'] + '.mp4')
proof = read(O / 'render-proof.json')
beats = read(P / 'beat-sheet.json')['beats']
subs = read(P / 'subtitles.json')
probe = json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-count_frames','-of','json',video]).stdout)
v = next(s for s in probe['streams'] if s['codec_type']=='video')
a = next(s for s in probe['streams'] if s['codec_type']=='audio')
decode = run(['ffmpeg','-hide_banner','-v','error','-i',video,'-f','null','NUL'])
levels = measure(video)
snap = read(O / 'snapshots-r2.json')
frames = O / 'final-frames'
frames.mkdir(exist_ok=True)
comparisons = []
for item in snap['frames']:
    t = item['time']
    path = frames / f'{t:.3f}.png'
    # Stills can seek between timestamps and retain the last frame; FFmpeg
    # emits only frames at/after the seek. Sample the containing encoded frame,
    # including the final frame, instead of seeking beyond its last timestamp.
    frame_index=min(math.floor(t*30),math.ceil(m['source']['duration']*30)-1)
    seek=max(0,(frame_index-.01)/30)
    run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(seek),'-i',video,'-frames:v','1',path])
    ref = cv2.imread(item['path'])
    actual = cv2.imread(str(path))
    assert ref is not None and actual is not None
    # Compare encoded output with the already-reviewed actual runtime snapshots.
    ref = cv2.resize(ref,(540,960),interpolation=cv2.INTER_AREA)
    actual = cv2.resize(actual,(540,960),interpolation=cv2.INTER_AREA)
    mae = float(np.abs(ref.astype(float)-actual.astype(float)).mean())
    comparisons.append({'time':t,'rgb_mae_0_255':mae,'file':str(path.relative_to(P))})
write(O / 'final-snapshot-comparison.json',comparisons)

# Check that the red-shirt foreground is actually present on all talking-head
# frames and absent during the full book cutaway. This is an existence test,
# not a beauty/edge-quality test or a prescription for other brands.
cap = cv2.VideoCapture(str(video))
i = 0
foreground_failures = []
foreground_min = 10**9
while True:
    ok,bgr = cap.read()
    if not ok: break
    t = i / 30
    beat = next((b for b in beats if b['s'] <= t < b['e']), beats[-1])
    small = cv2.resize(bgr,(270,480),interpolation=cv2.INTER_AREA)
    B,G,R = cv2.split(small[350:])
    count = int(((R.astype(float)>G*1.3)&(R.astype(float)>B*1.3)&(R>65)).sum())
    if beat['layout'] != 'C':
        foreground_min=min(foreground_min,count)
        if count<1000: foreground_failures.append({'frame':i,'red_pixels':count,'expected':'talent'})
    elif count>500:
        foreground_failures.append({'frame':i,'red_pixels':count,'expected':'no talent'})
    i+=1
cap.release()
write(O / 'final-foreground-check.json',{'decoded_frames':i,'minimum_shirt_pixels':foreground_min,
      'failures':foreground_failures,'scope':'Foreground presence only, not mask beauty or temporal edge quality'})

# Stream-copy delivery must preserve decoded visual frames; metadata does not
# authorize another visual render.
def visual_hashes(path):
    r=run(['ffmpeg','-hide_banner','-loglevel','error','-i',path,'-an','-f','framemd5','-'])
    return [line for line in r.stdout.splitlines() if line and not line.startswith('#')]
before = visual_hashes(proof['rendered_video'])
after = visual_hashes(video)
expected=math.ceil(m['source']['duration']*30)
checks={
 'user_approved':m['approval']['storyboard'] and m['approval']['render'],
 'approved_composition':sha(P/'hyperframes/index.html')==proof['composition_sha256']==m['approval']['composition_sha256'],
 'approved_beats':sha(P/'beat-sheet.json')==proof['beat_sheet_sha256'],
 'approved_subtitles':sha(P/'subtitles.json')==proof['subtitles_sha256'],
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
 'foreground_present_all_frames':not foreground_failures,
 'reviewed_snapshot_match':all(c['rgb_mae_0_255']<12 for c in comparisons),
 'metadata_remux_pixels_identical':before==after and len(after)==expected,
 'single_completed_visual_render':proof['completed_visual_renders']==1,
 'caption_reading_rate':all(max(len(s['en']),len(s['id']))/(s['e']-s['s'])<=17.001 for s in subs),
 'caption_alpha_geometry':not read(O/'mask-review/alpha-geometry-check.json')['caption_foreground_collisions'],
}
write(O/'ffprobe.json',probe)
times=[1.7,8.3,18.6,27.6,34.8,44.4]
sheet=Image.new('RGB',(1080,1400),'#101827');d=ImageDraw.Draw(sheet)
font=ImageFont.truetype(str(ROOT/'pipeline/fonts/Inter-Variable.ttf'),21)
for n,t in enumerate(times):
    im=ImageOps.contain(Image.open(frames/f'{t:.3f}.png').convert('RGB'),(344,612))
    x=n%3*360+8;y=n//3*700+42
    sheet.paste(im,(x,y));d.text((x,y-29),f'{t:.1f}s · final encoded',font=font,fill='#EDEAE4')
sheet.save(O/'kontak-final.jpg',quality=95)
qa={'status':'LULUS' if all(checks.values()) else 'GAGAL','scope':'Technical automatic QA; artistic/playback review separate',
    'checks':checks,'audio':{'integrated_lufs':float(levels['input_i']),'true_peak_dbtp':float(levels['input_tp'])},
    'video':{'frames':i,'duration':float(probe['format']['duration']),'width':v['width'],'height':v['height'],'size_bytes':video.stat().st_size},
    'sha256':sha(video),'max_snapshot_mae':max(c['rgb_mae_0_255'] for c in comparisons),
    'modul':{'bang-motion':'1.19.0','hyperframes':'0.9.33','NazarVerse':'1.0','K11-K14':'0.1'},
    'manual_pending':['Normal-speed playback: hair/hand matte stability, rhythm and motion quality.',
                      'Listen to entire clip on phone: intelligibility, comfort and subtitle/lip timing.']}
write(O/'qa.json',qa)
summary='\n'.join(f'- {k}: {"LULUS" if ok else "GAGAL"}' for k,ok in checks.items())
report=f'''# QA final — {qa['status']}

Cakupan: pengujian teknis pada MP4 hasil encode. Pengguna menyetujui storyboard R2 dan render melalui pesan “jalankan render”.

{summary}

## Bukti dan hasil
Durasi {qa['video']['duration']:.3f}s; {i} frame @30fps; 1080×1920 H.264/AAC yuv420p bt709.
Audio {qa['audio']['integrated_lufs']:.2f} LUFS; true peak {qa['audio']['true_peak_dbtp']:.2f} dBTP.
Audio disiapkan dan diukur sebelum render visual. Satu render visual HyperFrames selesai; mux final menyalin stream, bukan render visual kedua. Seluruh hash frame terdekode dibandingkan sebelum/sesudah mux: {checks['metadata_remux_pixels_identical']}.

Kehadiran talent diperiksa pada seluruh frame berdasarkan area baju merah, dengan talent absen saat cutaway buku; ini bukan ukuran mutu mask. {len(comparisons)} frame encode dibandingkan dengan snapshot R2 yang ditinjau; MAE RGB maksimum {qa['max_snapshot_mae']:.3f}/255. Laporan: final-snapshot-comparison.json, final-foreground-check.json, render-proof.json.

Bukti visual: kontak-final.jpg dan final-frames/. Tinjauan sampel rambut/bahu/tangan R2 tetap tersedia di mask-review/. Enam peringatan heuristik minimum-hold HyperFrames tetap dicatat pada QA storyboard; tidak dianggap sebagai persetujuan artistik.

## Checklist manual yang belum dicentang
- [ ] Tonton pada kecepatan normal: kestabilan tepi rambut/tangan, keluwesan, ritme dan kontinuitas.
- [ ] Dengar keseluruhan suara di HP: kejernihan, kenyamanan, sinkron bibir dan subtitle.

Still, nama model, selisih piksel dan tes kehadiran talent tidak membuktikan keluwesan atau mask bebas flicker. Sumber rendah resolusi membatasi detail rambut dan sudah memotong tepi bahu. Tidak membuat ProRes/MP4 perantara di folder hasil karena aturan pengguna meminta satu MP4 final.

Engine sesuai permintaan eksplisit pengguna: bang-motion 1.19.0 + HyperFrames 0.9.33; manifest/gerbang persetujuan HyperFrames menggunakan hash R2 karena skema berbeda dari renderer Remotion video.py. Brand NazarVerse 1.0; K11–K14 v0.1.
'''
(O/'qa-report.md').write_text(report,encoding='utf8')
m['status']='selesai' if qa['status']=='LULUS' else 'qa_failed'
m['final']={'path':'out/'+video.name,'sha256':qa['sha256'],'qa_technical':qa['status'],'duration':qa['video']['duration']}
write(P/'manifest.json',m)
print(json.dumps(qa,ensure_ascii=False))
if qa['status']!='LULUS':raise SystemExit(1)
