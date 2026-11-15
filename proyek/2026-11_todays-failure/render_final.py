"""Guarded HyperFrames final delivery; prepare audio before the single visual render."""
from pathlib import Path
import datetime as dt
import hashlib
import json
import os
import re
import subprocess

P = Path(__file__).resolve().parent
ROOT = P.parents[1]
TMP = ROOT / '.sementara/todays-failure-final'
TMP.mkdir(parents=True, exist_ok=True)
os.environ.update(TEMP=str(TMP), TMP=str(TMP), VIDEO_TEMP=str(TMP))
CLI = ROOT / '.sementara/npm-cache/_npx/702923228c2ce1e6/node_modules/hyperframes/bin/hyperframes.mjs'
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
write = lambda p, x: p.write_text(json.dumps(x, indent=2, ensure_ascii=False), encoding='utf8')
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def run(args):
    return subprocess.run([str(a) for a in args], capture_output=True, text=True, check=True)

def measure(path):
    r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-vn', '-af',
             'loudnorm=I=-14:TP=-2.5:LRA=11:print_format=json', '-f', 'null', 'NUL'])
    return json.loads(re.findall(r'\{[\s\S]*?\}', r.stderr)[-1])

if __name__ == '__main__':
    m = read(P / 'manifest.json')
    sb = read(P / 'out/storyboard-r2.json')
    assert sb['composition_sha256'] == sha(P / 'hyperframes/index.html'), 'Composition changed since R2 review'
    assert read(P / 'out/hyperframes-check-r2.json')['ok']
    assert read(P / 'cache/roto-video-r2.json')['whole_clip_processed']
    geom = read(P / 'out/mask-review/alpha-geometry-check.json')
    assert not geom['caption_foreground_collisions'] and not geom['foreground_not_touching_bottom']
    approval = m['approval']
    approval.update(storyboard=True, render=True, render_message='jalankan render',
                    storyboard_version='storyboard-2-rotoscope',
                    at=dt.datetime.now().astimezone().isoformat(),
                    composition_sha256=sb['composition_sha256'],
                    beat_sheet_sha256=sha(P / 'beat-sheet.json'),
                    subtitles_sha256=sha(P / 'subtitles.json'))
    m['status'] = 'rendering'
    write(P / 'manifest.json', m)
    sb.update(storyboard_approved=True, render_approved=True, approval_message='jalankan render')
    write(P / 'out/storyboard-r2.json', sb)
    write(P / 'out/render-approval.json', approval)
    # The project uses the explicitly requested HyperFrames engine, whose composition
    # schema differs from video.py's Remotion manifest. Preserve an equivalent hash gate.
    final = P / 'out' / (m['proyek'] + '.mp4')
    if final.exists():
        raise SystemExit('Final already exists; inspect it instead of rerendering.')
    duration = m['source']['duration']
    source = P / 'hyperframes/assets/voice.m4a'
    first = measure(source)
    filt = ('loudnorm=I=-14:TP=-2.5:LRA=11:'
            f"measured_I={first['input_i']}:measured_TP={first['input_tp']}:"
            f"measured_LRA={first['input_lra']}:measured_thresh={first['input_thresh']}:"
            f"offset={first['target_offset']}:linear=true:print_format=json")
    audio = TMP / 'voice-final.m4a'
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', source,
         '-vn', '-af', filt, '-t', str(duration), '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', audio])
    levels = measure(audio)
    write(P / 'out/audio-preflight.json', {'source': first, 'prepared': levels,
                                          'sha256': sha(audio), 'prepared_before_visual_render': True})
    assert abs(float(levels['input_i']) + 14) <= 1 and float(levels['input_tp']) <= -2
    print('Audio prepared and measured; starting approved HyperFrames render.', flush=True)
    rendered = TMP / 'hyperframes-render.mp4'
    cmd = ['node', str(CLI), 'render', str(P / 'hyperframes'), '--output', str(rendered),
           '--fps', '30', '--quality', 'high', '--format', 'mp4', '--workers', '2',
           '--video-frame-format', 'png', '--frames-cache-dir', str(TMP / 'frame-cache'), '--strict']
    write(P / 'out/render-command.json', {'command': cmd, 'composition_sha256': sb['composition_sha256'],
                                         'source_alpha_sha256': sha(P / 'hyperframes/assets/talent-roto.webm')})
    with (TMP / 'render.log').open('w', encoding='utf8') as log:
        subprocess.run(cmd, stdout=log, stderr=subprocess.STDOUT, check=True, env=os.environ)
    print('Visual render complete; attaching prepared audio and bt709 tags by stream copy.', flush=True)
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', rendered, '-i', audio,
         '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-t', str(duration),
         '-bsf:v', 'h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0',
         '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
         '-movflags', '+faststart', final])
    write(P / 'out/render-proof.json', {'engine': 'HyperFrames 0.9.33', 'completed_visual_renders': 1,
          'composition_sha256': sb['composition_sha256'], 'beat_sheet_sha256': approval['beat_sheet_sha256'],
          'subtitles_sha256': approval['subtitles_sha256'], 'final_audio_sha256': sha(audio),
          'rendered_video': str(rendered), 'final_path': str(final), 'final_sha256': sha(final),
          'delivery_remux': 'H264 stream copy; prepared AAC stream copy; bt709 metadata bitstream filter'})
    print(f'Final MP4 ready for QA: {final}', flush=True)
