from pathlib import Path
import json
P=Path(__file__).parent;O=P/'out';q=json.loads((O/'qa-final.json').read_text())
q['visual_review']='Reviewed actual-export final-contact.jpg and final-mask-samples.jpg: bilingual captions separated from talent; six approved scenes present; changing talent poses confirm moving footage rather than storyboard PNGs. No room visible in inspected compositions. Fine hair edge remains source-limited.'
q['technical_qa']='passed' if -14.6<=q['audio']['lufs']<=-13.4 and q['audio']['true_peak']<=-2 else 'needs-review'
(O/'qa-final.json').write_text(json.dumps(q,indent=2),encoding='utf-8')
m=json.loads((P/'manifest.json').read_text());m.update(status='rendered',production_pending=[],final={'file':'out/GROWING-MEANS-FINAL.mp4','sha256':q['sha256'],'technical_qa':q['technical_qa'],'manual_playback':'not fully verified','report':'out/qa-final.json','render_count':1});(P/'manifest.json').write_text(json.dumps(m,indent=2)+'\n',encoding='utf-8')
(O/'qa-final.md').write_text(f'''# GROWING MEANS — final

User approved bilingual storyboard and final render. Single HyperFrames MP4 render; no picture-only MP4 in output.

Technical: H.264/AAC, 1080×1920, 30 fps, 43.433333s, BT.709, {q['bytes']} bytes. Full decode: no errors. Audio: {q['audio']['lufs']} LUFS / {q['audio']['true_peak']} dBTP. Production HyperFrames check: 0 errors, 0 warnings.

Brand/brief: NazarVerse navy/ivory/sand/sage, DM Sans; English primary, Indonesian secondary. Four confirmed transcript corrections retained. Six illustrated scenes, simple cuts and no repeated slides/wipes. Original narration with quiet original synthesized ambient bed.

Visual: final-contact.jpg and final-mask-samples.jpg reviewed from the actual export. Talent moves at beginning/end; middle uses component graphics. Caption lane separate from talent. Recurrent masks process all visible frames with ending warmup at 34s. Hidden frames are transparent.

Limits: no claim of perfect hair edges, complete real-time artistic playback or headphone listening. Fine edge quality is limited by 478×850 source. Approval is from user; automated QA alone is not artistic approval.

SHA256: {q['sha256']}
''',encoding='utf-8')
print(q['technical_qa'])
