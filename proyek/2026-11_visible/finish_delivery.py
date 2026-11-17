"""Expose the final local deliverable after encoded technical QA passes."""
from pathlib import Path
import json,re
P=Path(__file__).resolve().parent
read=lambda f:json.loads((P/f).read_text(encoding='utf8'))
write=lambda f,d:(P/f).write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf8')
qa=read('out/qa.json');m=read('manifest.json');assert qa['status']=='LULUS'
name=m['proyek']+'.mp4'
write('delivery.json',{'final':m['final'],'video':qa['video'],'audio':qa['audio'],'modul':qa['modul'],'manual_pending':qa['manual_pending'],'approval':m['approval'],'qa_report':'out/qa-report.md'})
f=P/'out/storyboard.html';doc=f.read_text(encoding='utf8')
if 'id="final-delivery"' not in doc:
 doc=doc.replace('<main>',f'<main><section id="final-delivery"><div class="tag">VISIBLE · FINAL</div><h1>Video final selesai.</h1><video controls playsinline preload="metadata" src="{name}" style="display:block;width:100%;max-width:430px;max-height:76vh;background:#101827"></video><p><a href="{name}">Buka MP4 final</a> · <a href="qa-report.md">QA teknis MP4</a> · <a href="kontak-final.jpg">Frame hasil encode</a></p><p>Storyboard dan produksi disetujui melalui pesan “lanjutkan ke render final”. QA teknis LULUS. Suara akhir sudah dicampur dan diukur; tinjauan playback/dengar manual tetap terpisah.</p></section>')
doc=re.sub(r'<article><h2>Status</h2>.*?</article>','<article><h2>Status</h2><p>Storyboard dan render disetujui pengguna. Satu render visual HyperFrames selesai dan MP4 final telah lolos QA teknis. Kestabilan tepi mask, keluwesan, kenyamanan suara serta sinkron pada playback normal tetap belum diklaim lulus hanya dari still.</p></article>',doc,flags=re.S)
doc=doc.replace('Campuran suara akhir belum dibuat.','Campuran suara akhir sudah dibuat sebelum render; player narasi di bawah ini mempertahankan sumber awal untuk arsip storyboard. Video final memakai campuran lengkap.')
f.write_text(doc,encoding='utf8')
f=P/'out/qa-storyboard.md';doc=f.read_text(encoding='utf8')
doc+='\n## Pembaruan produksi\nPengguna menyetujui storyboard dan render dengan “lanjutkan ke render final”. Render dan QA teknis MP4 selesai. Status sebelum persetujuan di bagian atas merupakan arsip tahap storyboard; lihat qa-report.md untuk bukti final dan batas verifikasi manual.\n'
f.write_text(doc,encoding='utf8')
f=P/'hyperframes/DESIGN.md';doc=f.read_text(encoding='utf8').replace('Full render approval has not been granted for this video. Three transcript corrections were confirmed separately and do not approve a storyboard.','Storyboard and final render were approved by the user with “lanjutkan ke render final”. The three earlier transcript confirmations remain separate records; final approval hashes are in out/render-approval.json.');f.write_text(doc,encoding='utf8')
f=P/'README.md';doc=f.read_text(encoding='utf8')
doc+='''
## Final delivery
User approved the storyboard and final render with “lanjutkan ke render final”. render_final.py prepares six subtle contact/brush SFX with the uncut source voice, measures the complete AAC mix, runs the pinned HyperFrames CLI once, then remuxes video/AAC with bt709 metadata. No visual rerender is used for the delivery mux. Intermediate files: D: .sementara/visible-final. qa_final.py checks the actual encoded file; finish_delivery.py exposes the local result after technical QA passes. Do not rebuild historical storyboard output over this delivery without a new revision.
'''
doc+=f'\nFinal: out/{name}, {qa["video"]["duration"]:.3f}s, {qa["video"]["frames"]} frames, 1080×1920/30fps; QA teknis LULUS. Audio {qa["audio"]["integrated_lufs"]:.2f} LUFS, {qa["audio"]["true_peak_dbtp"]:.2f} dBTP. Manual playback/listening remains pending. Evidence: out/qa-report.md, out/kontak-final.jpg, out/fase-final.jpg and delivery.json.\n'
f.write_text(doc,encoding='utf8')
sb=read('storyboard-summary.json');sb.update(final=m['final'],audio_mix_prepared=True,encoded_technical_qa='LULUS',manual_unverified=qa['manual_pending']);write('storyboard-summary.json',sb)
print(json.dumps({'final':str(P/'out'/name),'qa':qa['status']}))
