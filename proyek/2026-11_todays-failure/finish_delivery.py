"""Publish local delivery links only after encoded-file QA passes."""
from pathlib import Path
import json
import re

P=Path(__file__).resolve().parent
read=lambda f:json.loads((P/f).read_text(encoding='utf8'))
qa=read('out/qa.json')
assert qa['status']=='LULUS'
m=read('manifest.json')
delivery={'final':m['final'],'video':qa['video'],'audio':qa['audio'],
          'modul':qa['modul'],'manual_pending':qa['manual_pending'],
          'approval':m['approval'],'qa_report':'out/qa-report.md'}
(P/'delivery.json').write_text(json.dumps(delivery,indent=2,ensure_ascii=False),encoding='utf8')
name=m['proyek']+'.mp4'
for filename in ['out/storyboard-r2.html','out/storyboard.html']:
    f=P/filename
    doc=f.read_text(encoding='utf8')
    if 'id="final-delivery"' not in doc:
        doc=doc.replace('<main>',f'<main><section id="final-delivery"><h1>Video final selesai</h1><video controls playsinline preload="metadata" src="{name}" style="display:block;width:100%;max-width:420px;max-height:75vh;background:#101827"></video><p><a href="{name}">Buka MP4 final</a> · <a href="qa-report.md">QA teknis hasil encode</a></p><p>R2 dan render disetujui pengguna: “jalankan render”. QA teknis LULUS. Pemeriksaan playback/suara manual tetap terpisah.</p></section>')
    doc=re.sub(r'<article><h2>Status</h2>.*?</article>',
               '<article><h2>Status</h2><p>Storyboard R2 dan render disetujui melalui pesan “jalankan render”. Satu render visual HyperFrames selesai, QA teknis pada MP4 LULUS. Pemeriksaan dengar dan kestabilan tepi mask pada playback normal tetap belum diklaim lulus hanya dari still.</p></article>',doc,flags=re.S)
    f.write_text(doc,encoding='utf8')
f=P/'out/qa-storyboard-r2.md'
doc=f.read_text(encoding='utf8')
doc=doc.replace('Storyboard R2: MENUNGGU persetujuan pengguna. Render final: belum diizinkan.',
                'Storyboard R2 dan render final disetujui pengguna melalui pesan “jalankan render”; laporan encode final terpisah di qa-report.md.')
f.write_text(doc,encoding='utf8')
f=P/'README.md'
doc=f.read_text(encoding='utf8')
if '## Hasil final' not in doc:
    doc+=f'\n## Hasil final\n\nout/{name}: {qa["video"]["duration"]:.3f}s, {qa["video"]["frames"]} frames, 1080×1920/30fps. QA teknis LULUS; audio {qa["audio"]["integrated_lufs"]:.2f} LUFS dan {qa["audio"]["true_peak_dbtp"]:.2f} dBTP. Bukti: out/qa-report.md, out/kontak-final.jpg, delivery.json. Playback dan dengar manual tetap belum dicentang. Jangan menjalankan ulang assembler storyboard historis di atas status final tanpa revisi baru.\n'
f.write_text(doc,encoding='utf8')
print(json.dumps({'final':str(P/'out'/name),'qa':qa['status']}))
