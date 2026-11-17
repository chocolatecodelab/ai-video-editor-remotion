from pathlib import Path
import json,re,html
P=Path(__file__).resolve().parent
read=lambda f:json.loads((P/f).read_text(encoding='utf8'))
write=lambda f,d:(P/f).write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf8')
m=read('manifest.json');bs=read('beat-sheet.json');w=read('cache/words-confirmed.json')['kata']
# Alignment at a crop boundary may absorb leading silence. Preserve the original
# ASR speech onset for the unchanged first word of each corrected passage.
original=read('cache/words.json')['kata']
for lo,hi in [(16.1,20.8),(32.5,37.8),(41.1,44.8)]:
 a=next(x for x in w if lo<=x['s']<hi);old=next(x for x in original if lo<=x['s']<hi)
 if a['w'].lower()==old['w'].lower():a['s']=min(a['e']-.02,max(a['s'],old['s']))
groups=[];cursor=0
clean=lambda s:re.sub(r'[^a-z0-9]','',s.lower())
for en,idtext in bs['phrases']:
 n=len(en.split());chunk=w[cursor:cursor+n]
 assert clean(' '.join(a['w'] for a in chunk))==clean(en),(en,chunk)
 groups.append({'en':en,'id':idtext,'s':chunk[0]['s'],'word_end':chunk[-1]['e'],'words':list(range(cursor,cursor+n))});cursor+=n
assert cursor==len(w)
for i,g in enumerate(groups):
 end=groups[i+1]['s'] if i+1<len(groups) else m['source']['duration']
 g['e']=end
 g['cps']=max(len(g['en']),len(g['id']))/(end-g['s'])
 assert g['cps']<=17.001,(g['en'],g['cps'])
write('subtitles.json',groups);write('cache/words-storyboard.json',{'_meta':{'dikoreksi':False,'scope':'Three confirmed phrases plus preserved original ASR onsets; whole transcript listening audit not claimed'},'kata':w})
captions=[]
for i,g in enumerate(groups):
 spans=[]
 for j,token in enumerate(g['en'].split()):
  wi=g['words'][j];spans.append(f'<span id="word-{wi}">{html.escape(token)}</span>')
 captions.append(f'<div id="cap-{i}" class="clip caption" data-start="{g["s"]}" data-duration="{g["e"]-g["s"]}" data-track-index="2"><span class="english">'+ ' '.join(spans)+f'</span><span class="indonesian">{html.escape(g["id"])}</span></div>')
template=(P/'hyperframes/composition-template.txt').read_text(encoding='utf8')
for key,value in [('MANIFEST',m),('PLAN',bs),('WORDS',w)]:template=template.replace('__'+key+'__',json.dumps(value,ensure_ascii=False))
template=template.replace('__CAPTIONS__','\n'.join(captions))
(P/'hyperframes/index.html').write_text(template,encoding='utf8')
(P/'naskah-bilingual.md').write_text('# Subtitle Visible\n\n'+'\n\n'.join(f"{g['s']:.2f}–{g['e']:.2f}s\n\n{g['en']}\n\n{g['id']}" for g in groups)+'\n\nTiga koreksi frasa dikonfirmasi pengguna; original ASR tetap tersimpan.\n',encoding='utf8')
meta=read('hyperframes/meta.json');meta.update(id='visible-before-the-surface',name='Visible — Before the Surface');write('hyperframes/meta.json',meta)
print(json.dumps({'cues':len(groups),'max_cps':max(g['cps'] for g in groups),'beats':len(bs['beats'])}))
