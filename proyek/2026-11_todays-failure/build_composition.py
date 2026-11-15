from pathlib import Path
import json,copy,html

P=Path(__file__).resolve().parent
def read(f):return json.loads((P/f).read_text(encoding='utf8'))
def write(f,d):(P/f).write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf8')
manifest=read('manifest.json');manifest['status']='storyboard';manifest['approval'].update(style=True,style_message='setuju arah ini');write('manifest.json',manifest)
w=copy.deepcopy(read('cache/words.json')['kata'])
# The user has confirmed this phrase; source ASR is preserved separately.
i=next(i for i,a in enumerate(w) if a['w']=='who' and a['s']>40)
w[i]['s']=40.61
w.insert(i,{'w':'not','s':40.29,'e':40.61,'p':None,'review_required':False,'source':'user confirmed'})
phrases=[
('One thing I have learned','Satu hal yang kupelajari'),('about life','soal hidup'),('is that failure','kegagalan itu'),('is never the end','bukan akhir'),('of the story.','cerita.'),
('You might fail today,','Kau bisa gagal hari ini,'),('you might lose','bisa kehilangan'),('an opportunity,','kesempatan,'),('make the wrong decision,','salah mengambil keputusan,'),('or feel like','atau merasa'),('all your efforts','semua usahamu'),('were wasted.','sia-sia.'),
('And yes,','Dan ya,'),('it hurts.','itu sakit.'),('But just because','Tapi karena'),('you fail today','gagal hari ini,'),("doesn't mean",'bukan berarti'),('you will keep failing forever.','terus gagal selamanya.'),
('One bad chapter','Satu bab buruk'),("doesn't define",'tak menentukan'),('your entire story.','seluruh kisahmu.'),('Give yourself permission','Izinkan dirimu'),('to start again,','memulai lagi,'),("even if you're afraid.",'meski kau takut.'),
('Because failure','Karena kegagalan'),('is something','sesuatu'),('you experience','yang kau alami,'),('not who you are.','bukan jati dirimu.'),("Today's failure",'Gagal hari ini'),("doesn't determine",'tak menentukan'),('the rest','sisa'),('of your life.','hidupmu.')]
groups=[];cursor=0
for en,id in phrases:
 n=len(en.split());indices=list(range(cursor,cursor+n));actual=' '.join(w[j]['w'] for j in indices)
 assert actual.lower()==en.lower(),(en,actual)
 groups.append({'en':en,'id':id,'s':w[cursor]['s'],'e':w[cursor+n-1]['e']+.25,'words':indices});cursor+=n
assert cursor==len(w)
for i,g in enumerate(groups):
 end=groups[i+1]['s'] if i+1<len(groups) else 49.456
 g['e']=end if (end-g['e'])<1.1 or i==len(groups)-1 else min(end,g['e']+.35)
 # Gap holds, not retimed speech. Surface any remaining rate for review.
 minimum=max(len(g['en']),len(g['id']))/17
 if (g['e']-g['s'])<minimum:
  early=g['e']-minimum
  if g['s']-early<=.15 and (i==0 or early>=w[groups[i-1]['words'][-1]]['e']+.1):
   if i>0:groups[i-1]['e']=min(groups[i-1]['e'],early-.02)
   g['word_start']=g['s'];g['s']=early
 g['cps']=round(max(len(g['en']),len(g['id']))/(g['e']-g['s']),2)
for g in groups:
 g['cps']=round(max(len(g['en']),len(g['id']))/(g['e']-g['s']),2)
 assert g['cps']<=17.01,(g['en'],g['cps'])
write('subtitles.json',groups);write('cache/words-storyboard.json',{'kata':w,'dikoreksi':False,'review':'not who you are confirmed by user; whole transcript listening audit not claimed'})
beats=[
 {'id':'opening','s':0,'e':7.1,'layout':'A','mode':'book','title':'Not the end','shots':[1.7,4.8,6.2]},
 {'id':'setbacks','s':7.1,'e':17.7,'layout':'B','mode':'route','title':'','shots':[8.3,11.9,16]},
 {'id':'hurt','s':17.7,'e':20.3,'layout':'D','mode':'quiet','title':'','shots':[18.6]},
 {'id':'continue','s':20.3,'e':25.13,'layout':'A','mode':'route','title':'','shots':[21.4,24]},
 {'id':'chapter','s':25.13,'e':30.69,'layout':'C','mode':'book','title':'','shots':[25.7,26.7,27.6,29]},
 {'id':'restart','s':30.69,'e':36.97,'layout':'B','mode':'book','title':'Start again','shots':[32,34.8]},
 {'id':'identity','s':36.97,'e':42.83,'layout':'A','mode':'book','title':'','shots':[38.5,41.2]},
 {'id':'closing','s':42.83,'e':49.456292,'layout':'A','mode':'book','title':'','shots':[44.4,46.5,48.5]}
]
write('beat-sheet.json',{'beats':beats,'captions':'subtitles.json','words':'cache/words-storyboard.json','version':'storyboard-2-rotoscope'})
template=(P/'hyperframes/composition-template.txt').read_text(encoding='utf8')
for key,data in [('BEATS',beats),('SUBS',groups),('WORDS',w)]:template=template.replace('__'+key+'__',json.dumps(data,ensure_ascii=False))
(P/'hyperframes/index.html').write_text(template,encoding='utf8')
(P/'naskah-bilingual.md').write_text('# Caption bilingual\n\n'+'\n\n'.join(f"{g['s']:.2f}–{g['e']:.2f}s\n\n{g['en']}\n\n{g['id']}" for g in groups)+'\n\nBagian not who you are dikonfirmasi pengguna; audio sumber tidak diubah.\n',encoding='utf8')
print(json.dumps({'groups':len(groups),'beats':len(beats),'fast_cues':[(g['en'],g['cps']) for g in groups if g['cps']>17]},ensure_ascii=False))
