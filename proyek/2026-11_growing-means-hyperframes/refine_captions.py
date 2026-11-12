from pathlib import Path
import json
P=Path(__file__).parent
d=json.loads((P/'captions-bilingual.json').read_text(encoding='utf-8'))
d[5]['end']=13.94
if len(d)==17:
    d[12]['en']+=' '+d[13]['en'];d[12]['id']+=' '+d[13]['id'];d[12]['end']=35.08;d.pop(13)
(P/'captions-bilingual.json').write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
p=P/'build_storyboard.py';s=p.read_text(encoding='utf-8').replace('class="caption" id=', 'class="clip caption" id=').replace('<div class="en">','<span class="en">').replace('</div><div class="id">','</span><span class="id">').replace('{E(c["id"])}</div></div>','{E(c["id"])}</span></div>').replace('font-size:25px;letter-spacing:5px','font-size:30px;letter-spacing:5px')
s=s.replace('<div class="brand">NAZARVERSE</div>','<div class="brand">NAZARVERSE</div><audio id="voice" class="clip" src="assets/voice.wav" data-start="0" data-duration="43.433" data-track-index="9"></audio>')
p.write_text(s,encoding='utf-8')
