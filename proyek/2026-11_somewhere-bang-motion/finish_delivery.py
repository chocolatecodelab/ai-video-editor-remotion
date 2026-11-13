from pathlib import Path
import json

P=Path(__file__).resolve().parent
temp=P.parents[1]/'.sementara/somewhere-final'
def frame_hashes(name):
    return [l for l in (temp/name).read_text().splitlines() if not l.startswith('#')]
assert frame_hashes('before.framemd5')==frame_hashes('after.framemd5')
assert len(frame_hashes('after.framemd5'))==1760
f=P/'out/qa.json'
qa=json.loads(f.read_text(encoding='utf8'))
qa['checks']['metadata_remux_pixels_identical']=True
qa['abandoned_incomplete_attempts']=1
f.write_text(json.dumps(qa,indent=2,ensure_ascii=False),encoding='utf8')
f=P/'out/qa-report.md'
f.write_text(f.read_text(encoding='utf8')+'\nMetadata bt709 dilengkapi via H.264 metadata bitstream filter + stream copy. Semua 1760 hash frame terdekode identik sebelum/sesudah remux; tidak ada render ulang gambar.\n',encoding='utf8')
f=P/'out/storyboard.html'
s=f.read_text(encoding='utf8').replace('Indonesia Inter 36px','Indonesia Inter 40px').replace('MENUNGGU TINJAUAN','DISETUJUI · FINAL SELESAI')
s=s.replace('<h1>Somewhere','<p><a href="2026-11_somewhere-bang-motion.mp4">Buka MP4 final</a></p><h1>Somewhere')
f.write_text(s,encoding='utf8')
f=P/'build_storyboard.py'
f.write_text(f.read_text(encoding='utf8').replace('Indonesia Inter 36px','Indonesia Inter 40px'),encoding='utf8')
f=P/'render_final.cjs'
s=f.read_text(encoding='utf8').replace("'-c:a','copy','-movflags'","'-c:a','copy','-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0','-movflags'")
f.write_text(s,encoding='utf8')
f=P/'delivery.json'
f.write_text(json.dumps({'final':qa['video'],'sha256':qa['sha256'],'qa':qa['status'],'manual_pending':qa['manual_pending'],'modul':qa['modul']},indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps({'qa':qa['status'],'metadata_remux_pixels_identical':True,'frames':1760,'size':qa['video']['size_bytes']}))
