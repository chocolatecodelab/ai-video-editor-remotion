"""Build a review from actual HyperFrames snapshots, not synthetic mockups."""
from pathlib import Path
import json,html,hashlib,subprocess
from PIL import Image,ImageOps,ImageDraw,ImageFont
P=Path(__file__).resolve().parent;ROOT=P.parents[1]
read=lambda f:json.loads((P/f).read_text(encoding='utf-8-sig'))
write=lambda f,d:(P/f).write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf8')
shots=read('out/snapshots.json');check=read('out/hyperframes-check.json');geometry=read('out/qa-geometry.json');matte=read('cache/roto.json');plan=read('beat-sheet.json');m=read('manifest.json')
assert shots['ok'] and check['ok'] and matte['whole_clip_processed']
assert not geometry['wrap_or_safe_area_failures'] and not geometry['alpha_caption_collisions'] and not geometry['floating_body_frames']
assert not m['approval']['render'],'Do not overwrite a production delivery'
frames={round(v['time'],3):Path(v['path']) for v in shots['frames']}
font=lambda n:ImageFont.truetype(str(ROOT/'pipeline/fonts/Inter-Variable.ttf'),n)
sheet=Image.new('RGB',(1440,1400),'#101827');d=ImageDraw.Draw(sheet)
for i,t in enumerate([2,8.4,12.8,16.7,23.4,29.5,40.5,44.4]):
 im=ImageOps.contain(Image.open(frames[t]).convert('RGB'),(344,612));x=i%4*360+8;y=i//4*700+43;sheet.paste(im,(x,y));d.text((x,y-30),f'{t:.1f}s',font=font(21),fill='#EDEAE4')
sheet.save(P/'out/kontak-storyboard.jpg',quality=96)
# Decode actual final alpha media for the close-ups, rather than relying only on
# PNGs written before the VP9 encoder. Initial and refined matte evidence remains.
encoded=P/'out/mask-review/encoded';encoded.mkdir(exist_ok=True)
for t in [2,13,37,43.5]:
 out=encoded/f'{t:.1f}.png'
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-c:v','libvpx-vp9','-ss',str(t),'-i',str(P/'hyperframes/assets/talent-roto.webm'),'-frames:v','1','-pix_fmt','rgba',str(out)],check=True)
edges=Image.new('RGB',(1200,1200),'#101827');ed=ImageDraw.Draw(edges)
for row,t in enumerate([2,13,37,43.5]):
 im=Image.open(encoded/f'{t:.1f}.png').convert('RGBA')
 for col,(color,box) in enumerate([('#101827',(70,240,400,475)),('#EDEAE4',(70,240,400,475)),('#101827',(0,435,220,650))]):
  bg=Image.new('RGBA',im.size,color);bg.alpha_composite(im);crop=ImageOps.contain(bg.convert('RGB').crop(box),(384,255));x=col*400+8;y=row*300+37;edges.paste(crop,(x,y));ed.text((x,y-28),f'{t:.1f}s · '+('shoulder' if col==2 else 'hair'),font=font(19),fill='#EDEAE4')
edges.save(P/'out/mask-review/edges.jpg',quality=96)
phases=Image.new('RGB',(1440,1400),'#101827');pd=ImageDraw.Draw(phases)
for i,t in enumerate([19.2,21.5,23.4,26.6,34.5,37.4,38.7,40.5]):
 im=ImageOps.contain(Image.open(frames[t]).convert('RGB'),(344,612));x=i%4*360+8;y=i//4*700+43;phases.paste(im,(x,y));pd.text((x,y-30),f'{t:.1f}s · action phase',font=font(19),fill='#EDEAE4')
phases.save(P/'out/fase-motion.jpg',quality=95)
summary={k:{'ok':v['ok'],'errors':v.get('errorCount',0),'warnings':v.get('warningCount',0)} for k,v in check.items() if isinstance(v,dict) and 'ok' in v}
sha=lambda f:hashlib.sha256((P/f).read_bytes()).hexdigest()
qa={'version':'storyboard-1','storyboard_approved':False,'render_approved':False,'caption_phrases_confirmed':3,'composition_sha256':sha('hyperframes/index.html'),'beat_sheet_sha256':sha('beat-sheet.json'),'subtitles_sha256':sha('subtitles.json'),'mask_asset_sha256':matte['asset_sha256'],'whole_clip_masked':True,'source_matte_frames':matte['frames'],'snapshot_count':len(frames),'checks':summary,'max_cps':geometry['max_cps'],'minimum_font_px':geometry['minimum_font_px'],'manual_unverified':['Normal-speed temporal mask stability','Motion rhythm/smoothness and sound listening','Final audio mix and export']}
write('out/storyboard.json',qa)
write('storyboard-summary.json',{**qa,'modul':{'bang-motion':'1.19.0','hyperframes':'0.9.33','NazarVerse':'1.0','K11-K14':'0.1'}})
cards=[];esc=html.escape
for b in plan['beats']:
 pics=''.join(f'<figure><img loading="lazy" src="storyboard/{frames[t].name}"><figcaption>{t:.1f}s</figcaption></figure>' for t in b['shots'])
 cards.append(f'<article><div class="meta">{b["s"]:.2f}–{b["e"]:.2f}s · {b["layout"]}</div><h2>{esc(b["message"])}</h2><p>{esc(b["action"])}</p><div class="strip">{pics}</div></article>')
doc='''<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visible · Storyboard</title><style>*{box-sizing:border-box}body{margin:0;background:#101827;color:#edeae4;font:17px/1.65 Inter,system-ui,sans-serif}main{max-width:1480px;margin:auto;padding:48px 4vw}h1,h2,a{color:#c5b69a}h1{font-size:clamp(38px,6vw,76px);letter-spacing:-.06em;line-height:1.06;max-width:950px}h2{font-size:28px;letter-spacing:-.03em}p{max-width:930px}.intro{padding-bottom:36px}.tag,.meta{color:#718a83;letter-spacing:.08em;font-size:14px}.note{padding:22px;background:#26364c;max-width:950px;margin:24px 0}.overview{width:100%;max-width:1440px}.strip{display:flex;gap:20px;overflow:auto;padding-bottom:16px}figure{flex:0 0 250px;margin:0}figure img{width:250px;display:block}figcaption{padding-top:8px;font-size:14px}article{border-top:1px solid #26364c;padding:30px 0}audio{width:min(100%,700px)}</style><main><section class="intro"><div class="tag">NAZARVERSE · VISIBLE · STORYBOARD 01</div><h1>Before the surface.</h1><p>Usaha yang belum terlihat menjadi akar yang sedang bekerja. Kamera mendekat ke tanah, penampang terbuka, akar beradaptasi pada batu, lalu daun tumbuh. Suara dan narasi asli tetap menjadi pusat cerita.</p><div class="note">Talent memakai rotoscope dan menempel pada tepi frame. Animasi berpindah kiri–kanan dan layar penuh, dengan subtitle English–Indonesia pada ruang khusus. Palet navy, slate, sand, ivory dan sage mengikuti NazarVerse.</div><p><a href="mask-review/edges.jpg">Detail tepi mask</a> · <a href="fase-motion.jpg">Fase aksi utama</a> · <a href="../naskah-bilingual.md">Naskah bilingual</a> · <a href="qa-storyboard.md">Pemeriksaan dan batas verifikasi</a></p><p>Audio narasi sumber untuk meninjau ucapan:</p><audio controls preload="metadata" src="../hyperframes/assets/voice.m4a"></audio><p>Rencana suara: kontak air/tanah dan gesekan daun yang halus pada beberapa aksi; cutback emosional dibiarkan tenang. Campuran suara akhir belum dibuat.</p></section><img class="overview" src="kontak-storyboard.jpg">'''+''.join(cards)+'''<article><h2>Tepi dan gerak</h2><p>Seluruh klip diproses dengan mask video berkesinambungan. Tepi rambut yang berkabut pada uji awal diperbaiki sebelum frame storyboard ini diambil. Sampel rambut dan bahu tersedia pada latar gelap/terang. Gambar diam tidak membuktikan bahwa semua flicker saat playback sudah hilang.</p><img class="overview" src="mask-review/edges.jpg"><p>Penampang pot, percabangan akar, pertumbuhan kecil dan daun dibuat per komponen. Kestabilan saat playback, ritme, sinkron dengar dan QA ekspor tetap perlu diperiksa pada produksi.</p></article><article><h2>Status</h2><p>Storyboard siap ditinjau; belum ada render MP4 final. Konfirmasi tiga frasa subtitle sudah diterapkan. Persetujuan storyboard dan render video ini belum diberikan.</p></article></main></html>'''
(P/'out/storyboard.html').write_text(doc,encoding='utf8')
report=f'''# QA storyboard Visible

## Brief pengguna
Kebebasan motion/efek dalam NazarVerse diterapkan melalui dunia benih–akar–tunas. Native SVG/GSAP dipakai per komponen: tetes, benih, tanah, mask penampang, akar, batu, titik pertumbuhan, batang dan daun. Tidak ada gambar generatif yang menggantikan mekanisme. Talent grounded kiri/kanan, cutback dan full-frame; subtitle bilingual menyertai. Sumber tidak diubah menjadi CTA baru. Tiga frasa dikonfirmasi pengguna; source ASR tetap disimpan. Audio asli tersedia untuk tinjauan; SFX masih rencana pada audio-plan.json.

## Brand
NazarVerse v1.0 dari panduan/NAZARVERSE_BRAND.md; navy/slate/sand/ivory/sage dan Inter. Ukuran minimum {geometry['minimum_font_px']}px; kecepatan baca maksimum {geometry['max_cps']:.2f} cps. Frasa panjang dan gaya caption full/talent ditampilkan pada 44.4s / 23.4s. Tidak menciptakan logo resmi baru. Source 478×850 membatasi detail; upscale tidak mengembalikan detail rambut.

## Artistik dan bukti
Pot tetap bertumpu, akar terhubung dengan benih, jalur beradaptasi pada batu dan daun membuka pada pangkalnya. Fase 19.2/21.5/23.4/26.6/34.5/37.4/38.7/40.5s disediakan untuk menilai awal–aksi–akhir; keputusan artistik hanya berdasarkan still belum merupakan bukti keluwesan playback. Tepi rambut awal berkabut telah ditinjau dan direvisi dengan pembersihan alpha area kepala; badan/tangan bawah y500 mempertahankan matte recurrent asli. Bukti aktual: mask-review/encoded/*.png, edges.jpg, kontak-storyboard.jpg, fase-motion.jpg. Tinjauan visual terakhir dicatat setelah gambar dibuka.

## Teknis
HyperFrames: {json.dumps(summary)}. Laporan lengkap hyperframes-check.json. Alpha media terdekode diperiksa pada seluruh {geometry['encoded_alpha_frames']} frame; {geometry['caption_talent_frames_checked']} frame caption/talent aktif diuji tanpa tabrakan alpha atau badan melayang. Wrap konservatif maksimum dua baris per bahasa dan area aman diperiksa: qa-geometry.json. Semua {len(frames)} snapshot berasal dari HyperFrames runtime; tidak berasal dari sketsa rekaan. Komposisi SHA256 {qa['composition_sha256']}.

## Belum terverifikasi
Kestabilan temporal mask saat playback normal, keluwesan/ritme, pemeriksaan dengar dan sinkron bibir/subtitle, audio mix akhir, ekspor akhir. Tidak mengklaim aspek tersebut lulus dari still, pixel delta, nama model atau status teknis.

## Persetujuan
Storyboard belum disetujui; render final belum diizinkan. Kebebasan kreatif dan konfirmasi transkrip tidak dianggap persetujuan render. Menunggu pengguna meninjau hasil konkret ini sesuai ATURAN_KERJA §1. Modul: bang-motion1.19.0 / HyperFrames0.9.33 / NazarVerse1.0 / K11–K14v0.1.
'''
(P/'out/qa-storyboard.md').write_text(report,encoding='utf8')
m['status']='storyboard';m['roto'].update(whole_clip_processed=True,frames=matte['frames'],asset_sha256=matte['asset_sha256']);write('manifest.json',m)
print(json.dumps({'storyboard':str(P/'out/storyboard.html'),'source_matte_frames':matte['frames'],'runtime_stills':len(frames),'check_ok':check['ok']}))
