from pathlib import Path
p=Path(__file__).parent/'build_storyboard.py'
s=p.read_text(encoding='utf-8').replace('<g stroke="#718A83" stroke-width="5">','<g fill="none" stroke="#718A83" stroke-width="5">')
# Follow the branch curve, rather than translating the marker along a straight chord.
s=s.replace('x:-225,y:-240,duration:3.4,ease:"sine.inOut"','keyframes:[{attr:{cx:345,cy:318}},{attr:{cx:255,cy:260}},{attr:{cx:175,cy:150}}],duration:3.4,ease:"sine.inOut"')
s=s.replace('x:225,y:-280,duration:3.7,ease:"sine.inOut"','keyframes:[{attr:{cx:400,cy:390}},{attr:{cx:455,cy:318}},{attr:{cx:545,cy:260}},{attr:{cx:625,cy:150}}],duration:3.7,ease:"sine.inOut"')
p.write_text(s,encoding='utf-8')
