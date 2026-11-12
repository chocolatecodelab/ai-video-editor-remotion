from pathlib import Path
import json
P=Path(__file__).parent
d=json.loads((P/'cache/transcript.json').read_text())
# User confirmed lexical corrections; inserted-word timing remains estimated.
w=[dict(x,w=x['w'].strip()) for s in d for x in s['words']]
for x in w:
    if x['w']=='that' and x['s']<3:x['e']=2.38
    if x['w']=='parties':x['w']='priorities'
    if x['w']=='reducing':x['w']='choosing'
    if x['w']=='clothes,':x['w']='growth,'
    if x['w']=='head':x['w']='hate'
    if x['w']=='past':x['e']=33.52
w.extend([{'w':'not','s':2.38,'e':2.6},{'w':'to','s':33.52,'e':33.64}]);w.sort(key=lambda x:x['s'])
(P/'cache/words.json').write_text(json.dumps({'dikoreksi':True,'confirmation':'User confirmed all four corrections in chat','timing_note':'Inserted not/to timing estimated; verify with playback','kata':w},indent=2),encoding='utf-8')
phrases=[
(0,1.3,'As you grow,','Seiring kamu bertumbuh,'),
(1.4,3.4,'you realize that not everyone','kamu sadar, tidak semua orang'),
(3.4,5.99,'is meant to stay in your life forever.','akan selamanya hadir dalam hidupmu.'),
(6.78,9.5,'Some people are only part of a certain chapter,','Sebagian orang hanya hadir dalam satu bab,'),
(9.84,11.8,'not the entire story.','bukan sepanjang ceritamu.'),
(12.48,13.4,"And that’s okay.",'Dan itu tidak apa-apa.'),
(13.94,16.7,'You might have different dreams,','Mungkin impian kalian berbeda,'),
(17.1,18.8,'different priorities,','prioritas kalian berbeda,'),
(19.08,21.2,'and different directions.','begitu pula arah yang kalian tuju.'),
(22.08,25.7,"Don’t feel guilty for choosing growth,",'Jangan merasa bersalah memilih untuk bertumbuh,'),
(26.08,28.1,'even when it means walking away','meski itu berarti meninggalkan'),
(28.1,31.05,'from things that once felt familiar.','hal-hal yang dulu terasa akrab.'),
(31.88,33.64,"You don’t have to hate your past",'Kamu tak harus membenci masa lalumu'),
(33.64,34.6,'to move forward.','untuk melangkah maju.'),
(35.08,37.65,'Sometimes growing means','Terkadang, bertumbuh berarti'),
(37.65,40.62,'accepting that you no longer belong','menerima bahwa kamu tak lagi cocok'),
(40.62,43.1,'where you used to be.','di tempatmu yang dulu.')]
(P/'captions-bilingual.json').write_text(json.dumps([dict(start=s,end=e,en=en,id=id) for s,e,en,id in phrases],ensure_ascii=False,indent=2),encoding='utf-8')
m=json.loads((P/'manifest.json').read_text());m.update(status='storyboard-in-progress',transcript_confirmed=True,subtitles={'primary':'en','secondary':'id','translation':'editorial draft','user_requested':True})
(P/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
