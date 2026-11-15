from pathlib import Path
import json,hashlib,html,subprocess
import cv2,numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageOps
P=Path(__file__).resolve().parent;ROOT=P.parents[1]
read=lambda f:json.loads((P/f).read_text(encoding='utf-8-sig'))
snap=read('out/snapshots-r2.json');check=read('out/hyperframes-check-r2.json');roto=read('cache/roto-video-r2.json');beats=read('beat-sheet.json')['beats']
assert snap['ok'] and check['ok'] and roto['whole_clip_processed']
encoded=P/'out/mask-review/encoded';encoded.mkdir(exist_ok=True)
alpha_checks=[]
for t in [1.7,8.3,16,18.6,24,34.8,41.2,46.5]:
 f=encoded/f'cutout-{t:.1f}.png'
 if not f.exists() or f.stat().st_mtime<(P/'hyperframes/assets/talent-roto.webm').stat().st_mtime:
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-c:v','libvpx-vp9','-ss',str(t),'-i',str(P/'hyperframes/assets/talent-roto.webm'),'-frames:v','1','-pix_fmt','rgba',str(f)],check=True)
 raw=np.array(Image.open(P/f'out/mask-review/rvm/cutout-{t:.1f}.png').convert('RGBA'));dec=np.array(Image.open(f).convert('RGBA'));assert dec[:,:,3].min()==0 and dec[:,:,3].max()==255
 alpha_checks.append({'time':t,'alpha_mae':float(np.mean(np.abs(raw[:,:,3].astype(float)-dec[:,:,3]))),'min_alpha':int(dec[:,:,3].min()),'max_alpha':int(dec[:,:,3].max())})
(P/'out/mask-review/encoded-alpha-check.json').write_text(json.dumps(alpha_checks,indent=2),encoding='utf8')
frames={round(a['time'],3):Path(a['path']) for a in snap['frames']}
font=lambda n:ImageFont.truetype(str(ROOT/'pipeline/fonts/Inter-Variable.ttf'),n)
sheet=Image.new('RGB',(1080,1400),'#101827');d=ImageDraw.Draw(sheet)
for i,t in enumerate([1.7,8.3,18.6,27.6,34.8,44.4]):
 im=ImageOps.contain(Image.open(frames[t]).convert('RGB'),(344,612));x=i%3*360+8;y=i//3*700+45;sheet.paste(im,(x,y));d.text((x,y-31),f'{t:.1f}s · rotoscope R2',font=font(20),fill='#EDEAE4')
sheet.save(P/'out/kontak-storyboard-r2.jpg',quality=95)
# Inspect hair and shoulder edges against both light and dark backgrounds.
edge=Image.new('RGB',(1200,930),'#101827');ed=ImageDraw.Draw(edge)
for row,t in enumerate([1.7,18.6,46.5]):
 im=Image.open(encoded/f'cutout-{t:.1f}.png').convert('RGBA');alpha=np.array(im)[:,:,3];ys,xs=np.where(alpha>64);top=int(ys.min());cx=int(np.median(xs[ys<top+100]))
 boxes=[(max(0,cx-110),max(0,top-8),min(im.width,cx+110),min(im.height,top+185)),(0,440,220,650)]
 for col,(bgcol,box) in enumerate([('#101827',boxes[0]),('#EDEAE4',boxes[0]),('#101827',boxes[1])]):
  crop=im.crop(box);crop=ImageOps.contain(crop,(380,252));bg=Image.new('RGBA',(380,252),bgcol);bg.alpha_composite(crop,((380-crop.width)//2,0));x=col*400+5;y=row*310+40;edge.paste(bg.convert('RGB'),(x,y));ed.text((x,y-29),f'{t:.1f}s · {"shoulder" if col==2 else "hair"}',font=font(19),fill='#EDEAE4')
edge.save(P/'out/mask-review/edges-r2.jpg',quality=96)
hands=Image.new('RGB',(1200,990),'#101827');hd=ImageDraw.Draw(hands);source=cv2.VideoCapture(str(P/'hyperframes/assets/talent.mp4'))
for row,t in enumerate([18.6,24,34.8]):
 source.set(cv2.CAP_PROP_POS_FRAMES,round(t*30));ok,bgr=source.read();assert ok
 original=Image.fromarray(cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)).crop((180,440,478,766))
 rgba=Image.open(encoded/f'cutout-{t:.1f}.png').convert('RGBA').crop((180,440,478,766))
 for col,color in enumerate([None,'#101827','#EDEAE4']):
  if color:
   bg=Image.new('RGBA',rgba.size,color);bg.alpha_composite(rgba);im=bg.convert('RGB')
  else:im=original
  im=ImageOps.contain(im,(380,278));x=col*400+8;y=row*330+38;hands.paste(im,(x,y));hd.text((x,y-29),f'{t:.1f}s · {"source" if col==0 else "encoded mask"}',font=font(19),fill='#EDEAE4')
source.release();hands.save(P/'out/mask-review/hands-r2.jpg',quality=96)
# Reference contact uses exact seek times, independent of fps-filter bin centering.
refpath=Path('D:/KERJAAN/CONTENT CREATOR/NAZARVERSE/referensi video 2.mp4');cap=cv2.VideoCapture(str(refpath));rs=Image.new('RGB',(900,1710),'#101827');rd=ImageDraw.Draw(rs)
for i,t in enumerate([.5,4,8,12,16,20,24,28,32]):
 cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,bgr=cap.read()
 if not ok:raise RuntimeError(f'Reference seek failed {t}')
 im=ImageOps.contain(Image.fromarray(cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)),(282,505));x=i%3*300+9;y=i//3*570+36;rs.paste(im,(x,y));rd.text((x,y-28),f'{t:.1f}s reference',font=font(19),fill='#EDEAE4')
cap.release();rs.save(P/'out/reference-contact-r2.jpg',quality=94)
summary={k:{'ok':v.get('ok'),'errors':v.get('errorCount',0),'warnings':v.get('warningCount',0)} for k,v in check.items() if isinstance(v,dict) and 'ok' in v}
qa={'version':'storyboard-2-rotoscope','style_approved':True,'storyboard_approved':False,'render_approved':False,'source_phrase_confirmed':True,'full_mask_frames':roto['frames'],'whole_clip_masked':True,'snapshots':len(frames),'checks':summary,'composition_sha256':hashlib.sha256((P/'hyperframes/index.html').read_bytes()).hexdigest(),'manual_unverified':['mask temporal stability on human playback','final audio mix/listening','final video export'],'reference':'referensi video 2.mp4'}
geometry=read('out/mask-review/alpha-geometry-check.json')
assert geometry['encoded_frames']==roto['frames'] and not geometry['caption_foreground_collisions'] and not geometry['foreground_not_touching_bottom']
qa['alpha_geometry']=geometry
qa['sampled_edge_visual_review']='Hair/shoulder edges on navy and ivory and moving hands against source reviewed; no obvious room residue or missing fingers in inspected stills. Source light rim retained. Full playback remains unverified.'
(P/'out/storyboard-r2.json').write_text(json.dumps(qa,indent=2),encoding='utf8')
e=html.escape
cards=[]
for b in beats:
 imgs=''.join(f'<figure><img src="storyboard-r2/{frames[t].name}"><figcaption>{t:.2f}s</figcaption></figure>' for t in b['shots'])
 cards.append(f'<article><h2>{b["s"]:.2f}–{b["e"]:.2f}s · {e(b["id"])}</h2><div class="strip">{imgs}</div></article>')
doc='''<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Today’s Failure · R2 rotoscope</title><style>*{box-sizing:border-box}body{margin:0;padding:40px 4vw;background:#101827;color:#edeae4;font:17px/1.7 system-ui}main{max-width:1300px;margin:auto}h1,h2,a{color:#c5b69a}.note{background:#26364c;padding:22px;max-width:1000px}.strip{display:flex;gap:16px;overflow:auto}figure{flex:0 0 240px;margin:0}img{width:100%;display:block}article{padding:24px 0;border-top:1px solid #26364c}.overview{max-width:1050px}</style><main><h1>Today’s Failure · R2 rotoscope</h1><p>Storyboard revisi terbaru, menggantikan R1 dengan ruangan asli. Talent dipisahkan dari latar, menempel bawah/sisi frame, dengan grafis yang tetap memakai ruang kiri/kanan dan bidang tumpuan.</p><div class="note"><strong>Revisi pengguna diterapkan:</strong> rotoscope dan mask tetap dipakai; referensi video 2 diperiksa ulang. Kulit hijau/kuning, grid, stiker dan CTA referensi tidak disalin. Navy, Slate Blue, Warm Sand, Soft Ivory, Muted Sage dan Inter mengikuti NazarVerse. English–Indonesia ditempatkan terpisah dari talent. Frasa “not who you are” sudah dikonfirmasi pengguna.</div><p><a href="mask-review/edges-r2.jpg">Detail tepi mask</a> · <a href="reference-contact-r2.jpg">Frame referensi</a> · <a href="qa-storyboard-r2.md">QA dan batas pemeriksaan</a></p><img class="overview" src="kontak-storyboard-r2.jpg">'''+''.join(cards)+f'''<article><h2>Mask dan referensi</h2><p>Seluruh {roto['frames']} frame sumber diproses berurutan dengan recurrent video matting lokal. Aset transparan dipakai langsung oleh komposisi HyperFrames; bukan gambar pose yang digeser sebagai pengganti video. Hasil masih harus ditinjau pada playback untuk kestabilan temporal: still tidak membuktikan semua flicker/halo sudah hilang.</p><img class="overview" src="mask-review/edges-r2.jpg"><p>Dari referensi diambil pergantian skala, cutaway, interaksi objek, dan kembali ke talent; metafora buku/jalur mengikuti ucapan video ini. Gerak tetap tenang sesuai NazarVerse.</p></article><article><h2>Status</h2><p>Belum ada render MP4 final. Storyboard R2 belum disetujui. Persetujuan arah terdahulu dan konfirmasi frasa tidak dianggap otomatis sebagai persetujuan render. Pemeriksaan dengar, keluwesan pada playback dan QA ekspor final belum diklaim lulus.</p></article></main></html>'''
doc=doc.replace('<a href="mask-review/edges-r2.jpg">Detail tepi mask</a>', '<a href="mask-review/edges-r2.jpg">Detail tepi mask</a> · <a href="mask-review/hands-r2.jpg">Perbandingan tangan dan sumber</a>')
doc=doc.replace('<img class="overview" src="mask-review/edges-r2.jpg">', '<img class="overview" src="mask-review/edges-r2.jpg"><p>Sampel rambut/bahu pada navy dan ivory serta tangan dibandingkan dengan rekaman sumber: tidak terlihat sisa ruangan atau jari hilang yang jelas pada still yang diperiksa. Cahaya terang asli pada rambut dipertahankan. Seluruh frame diuji untuk posisi caption dan kontak badan ke bawah, tanpa benturan yang terdeteksi. Pemeriksaan ini tidak menggantikan playback.</p><img class="overview" src="mask-review/hands-r2.jpg">')
(P/'out/storyboard-r2.html').write_text(doc,encoding='utf8');(P/'out/storyboard.html').write_text(doc,encoding='utf8')
report=f'''# QA storyboard R2 rotoscope

## Brief
R1 yang mempertahankan ruangan digantikan sesuai instruksi pengguna: rotoscope, mask halus, referensi terdahulu, brand NazarVerse. Frasa not who you are dikonfirmasi pengguna. Arah buku/jalur dan subtitle bilingual dipertahankan. Bukti: storyboard-r2.html, kontak-storyboard-r2.jpg, reference-contact-r2.jpg.

## Brand
Palet dan Inter tetap mengikuti NazarVerse v1.0. Referensi diperiksa sebagai sumber ritme/framing/interaksi, bukan spesifikasi hijau/kuning atau naskah/CTA baru. Source video tetap rendah resolusi, tidak mengklaim detail rambut yang tidak ada pada sumber.

## Artistik dan mask
Mask tersedia pada seluruh {roto['frames']} frame sumber, recurrent states berlanjut dan tidak di-reset setiap frame. Rambut, bahu dan tangan pada sampel 1.7/8.3/16/18.6/24/34.8/41.2/46.5s disediakan di out/mask-review/rvm. Detail rambut/bahu dibandingkan di navy/ivory pada edges-r2.jpg. Kriteria pemeriksaan: halo terang/gelap, sisa ruangan, kehilangan anggota tubuh dan tepi gerak tangan. Sumber sudah memotong sebagian bahu di tepi rekaman; jangan menyebut batas sumber sebagai mask yang mengembalikan bagian tubuh yang tidak terekam.

Frame sampel bukan pemeriksaan playback seluruh klip. Stabilitas temporal subjektif, keluwesan/ritme dan pemeriksaan dengar tetap BELUM TERVERIFIKASI. Nilai tersebut tidak disimpulkan dari pixel delta atau nama model.

## Teknis
Ringkasan HyperFrames: {json.dumps(summary)}. Teks English52/Indonesia44px; caption terpisah dari sosok dan pada cutaway berada di area bawah. Hash komposisi {qa['composition_sha256']}. Aset alpha WebM merupakan media kerja; belum MP4 final. Audio akhir dan ekspor tetap belum diuji. Mask metadata: cache/roto-video-r2.json; laporan resmi: hyperframes-check-r2.json; snapshot resmi: snapshots-r2.json.

## Persetujuan
Arahan rotoscope: diterapkan tanpa meminta ulang izin metode. Storyboard R2: MENUNGGU persetujuan pengguna. Render final: belum diizinkan. R1 hanya arsip, bukan kandidat final. Modul: bang-motion1.19.0, HyperFrames0.9.33, NazarVerse1.0, K11–K14v0.1.
'''
report+='''
## Hasil tinjauan visual dan geometri
Detail rambut dan bahu diperiksa pada navy/ivory; gerak tangan 18.6/24/34.8s dibandingkan dengan rekaman sumber. Tidak terlihat sisa ruangan atau kehilangan jari yang jelas pada still tersebut. Rim terang di rambut/bahu berasal dari pencahayaan sumber dan dipertahankan. Detail tetap dibatasi resolusi asli. Frame akhir 49.44s juga diperiksa: talent dan subtitle tetap tampil, badan menyentuh batas bawah.

Alpha WebM terdekode diperiksa untuk seluruh 1483 frame; 1307 frame dengan talent dan caption aktif diuji. Tidak ada tabrakan alpha talent dengan area caption dan tidak ada frame talent yang terlepas dari batas bawah. Seluruh baris subtitle juga muat pada lebar yang dirancang. Laporan: mask-review/alpha-geometry-check.json. Perbandingan alpha delapan sampel sebelum/sesudah encoding: MAE maksimum 0.0132 pada skala 0–255, bukan klaim identik byte.

Recurrent inference disambung dengan warmup 60 frame di dalam cutaway buku ketika talent disembunyikan; tidak ada reset model per frame. Enam peringatan craft minimum-hold tetap terbuka sebagai catatan heuristik. Hasil teknis tidak dipakai sebagai bukti keluwesan, kebersihan temporal, atau persetujuan artistik.
'''
(P/'out/qa-storyboard-r2.md').write_text(report,encoding='utf8')
m=read('manifest.json');m['status']='storyboard-r2';m['roto']={'method':roto['model'],'whole_clip_processed':True,'frames':roto['frames'],'asset':'hyperframes/assets/talent-roto.webm','full_playback_verified':False};m['approval'].update(storyboard=False,render=False);m['latest_reference']=str(refpath);m['latest_revision']='revision-mask-r2.md';(P/'manifest.json').write_text(json.dumps(m,indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps({'version':qa['version'],'masked_frames':roto['frames'],'snapshot_frames':len(frames),'check_ok':check['ok']}))
