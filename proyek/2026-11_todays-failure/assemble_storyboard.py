from pathlib import Path
import json,html,hashlib
from PIL import Image,ImageOps,ImageDraw,ImageFont
P=Path(__file__).resolve().parent;ROOT=P.parents[1]
read=lambda f:json.loads((P/f).read_text(encoding='utf-8-sig'))
snap=read('out/snapshots.json');beats=read('beat-sheet.json')['beats'];subs=read('subtitles.json');run=read('rundown.json')['beats'];check=read('out/hyperframes-check.json')
assert snap['ok'] and check['ok']
frames={round(f['time'],3):Path(f['path']) for f in snap['frames']}
font=lambda n:ImageFont.truetype(str(ROOT/'pipeline/fonts/Inter-Variable.ttf'),n)
sheet=Image.new('RGB',(1080,1400),'#101827');d=ImageDraw.Draw(sheet)
selected=[1.7,8.3,18.6,27.6,34.8,44.4]
for i,t in enumerate(selected):
 im=ImageOps.contain(Image.open(frames[t]).convert('RGB'),(344,612));x=i%3*360+8;y=i//3*700+45
 sheet.paste(im,(x,y));b=next(b for b in beats if b['s']<=t<b['e']);d.text((x,y-30),f'{t:.1f}s · {b["id"]}',font=font(21),fill='#EDEAE4');d.text((x,y+624),f'Layout {b["layout"]}',font=font(18),fill='#C5B69A')
sheet.save(P/'out/kontak-storyboard.jpg',quality=95)
phases=Image.new('RGB',(1080,540),'#101827');d=ImageDraw.Draw(phases)
for i,t in enumerate([25.7,26.7,27.6,29]):
 im=ImageOps.contain(Image.open(frames[t]).convert('RGB'),(262,466));x=i*270+4;phases.paste(im,(x,40));d.text((x,6),f'{t:.1f}s',font=font(22),fill='#EDEAE4')
phases.save(P/'out/fase-buku.jpg',quality=95)
warnings=[{'code':x.get('code'),'text':x.get('text',x.get('message'))} for x in check.get('craft',{}).get('findings',[])]
summary={k:{'ok':v.get('ok'),'errors':v.get('errorCount',0),'warnings':v.get('warningCount',0)} for k,v in check.items() if isinstance(v,dict) and 'ok' in v}
sha=hashlib.sha256((P/'hyperframes/index.html').read_bytes()).hexdigest()
qa={'stage':'storyboard','version':'storyboard-1','style_approved':True,'storyboard_approved':False,'render_approved':False,'composition_sha256':sha,'engines':{'bang-motion':'1.19.0','hyperframes':'0.9.33'},'snapshot_count':len(frames),'hyperframes':summary,'caption_groups':len(subs),'max_cps':max(g['cps'] for g in subs),'source_review_pending':['Kalimat 36.97–41.81s: apakah terdapat not who you are?'],'craft_warnings':warnings,'manual_unverified':['playback keluwesan/ritme','pemeriksaan dengar dan sinkronisasi','audio mix/loudness final','seluruh frame ekspor']}
(P/'out/storyboard.json').write_text(json.dumps(qa,indent=2,ensure_ascii=False),encoding='utf8')
esc=html.escape
cards=[]
for b,rv in zip(beats,run):
 imgs=''.join(f'<figure><img src="storyboard/{frames[t].name}" loading="lazy"><figcaption>{t:.2f}s</figcaption></figure>' for t in b['shots'])
 cu=[g for g in subs if b['s']<=g['s']<b['e']]
 lines=''.join(f'<li><strong>{g["s"]:.2f}s</strong> {esc(g["en"])}<br><span>{esc(g["id"])}</span></li>' for g in cu)
 cards.append(f'<article><h2>{b["s"]:.2f}–{b["e"]:.2f}s · {esc(b["id"])} · {b["layout"]}</h2><p>{esc(rv["action"])}</p><div class="strip">{imgs}</div><details><summary>Ucapan dan terjemahan pada bagian ini</summary><ul>{lines}</ul></details></article>')
doc='''<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Today’s Failure · Storyboard produksi</title><style>*{box-sizing:border-box}body{background:#101827;color:#edeae4;font:17px/1.65 system-ui;margin:0;padding:40px 4vw}main{max-width:1350px;margin:auto}h1{font-size:48px;line-height:1.1}h2,a{color:#c5b69a}article{border-top:1px solid #26364c;padding:24px 0}.strip{display:flex;gap:15px;overflow:auto}figure{margin:0;flex:0 0 245px}img{display:block;width:100%}figcaption,li span{color:#c5b69a}.note{padding:22px;background:#26364c;max-width:1000px}.overview{max-width:1000px}.status{color:#718a83;letter-spacing:.1em;font-size:13px}li{margin:16px 0}</style><main><p class="status">NAZARVERSE · STORYBOARD PRODUKSI 1 · ARAH DISETUJUI</p><h1>Today’s Failure</h1><p>Still nyata dari runtime HyperFrames, bukan sketsa. Kolom footage menyatu dengan sisi dan bawah frame, grafis memakai kiri/kanan serta bidang bawah. Cutaway buku memberi jeda visual dari talking head. Subtitle English–Indonesia dipisahkan dari talent.</p><p><a href="kontak-storyboard.jpg">Lembar kontak</a> · <a href="fase-buku.jpg">Empat fase halaman</a> · <a href="../naskah-bilingual.md">Naskah bilingual</a> · <a href="qa-storyboard.md">QA dan batas pemeriksaan</a></p><div class="note"><strong>Perlu konfirmasi:</strong> bagian sekitar 37–42s dipasang sebagai usulan “Because failure is something you experience, not who you are”. Dua backend transkripsi tidak menangkap bagian “not who you are” dengan konsisten. Audio sumber tidak diubah. Ejaan belum dianggap terverifikasi dengar.<br><strong>Persetujuan:</strong> arah telah disetujui; storyboard dan render penuh belum. Setelah storyboard cocok, beri instruksi “setuju storyboard, render final”.</div><img class="overview" src="kontak-storyboard.jpg">'''+''.join(cards)+'''<article><h2>Bidang tumpuan dan kontinuitas</h2><p>Buku memiliki sampul, punggung, lembar berengsel, tulisan, dan bayangan kontak yang terpisah. Halaman bergerak dari kanan, melewati tepi, lalu settle di kiri. Jalur berawal dari bidang bawah, bertemu cabang yang berhenti, lalu menyambung ke arah berikutnya. Cut pada jeda kalimat dipilih sesuai arahan pengguna; bukan wipe/slide berulang.</p><img class="overview" src="fase-buku.jpg"></article><article><h2>QA dan batas</h2><p>HyperFrames lint, runtime, layout, motion dan contrast tidak menemukan error pada pemeriksaan yang tercatat. Ada peringatan craft untuk durasi beberapa potongan caption; teks tetap mengikuti word timestamp, ukuran EN ≥44px / ID 40px, maksimum dua baris per bahasa dirancang untuk kolom dan laju baca ≤17 karakter/detik. Peringatan dicatat terbuka, tidak dihapus agar seolah tidak ada.</p><p>Still menilai crop, bidang tumpuan dan fase mekanisme; belum membuktikan keluwesan pada playback, sinkronisasi dengar, atau loudness hasil akhir. Sumber 478×850 memiliki keterbatasan detail. Belum ada MP4 edit atau hasil encode yang diuji.</p><p>Bang-motion 1.19.0, diverifikasi di origin/main; HyperFrames 0.9.33 dipin untuk proyek ini. Tidak memakai Studio dan tidak merender video pratinjau. Produksi final setelah persetujuan: siapkan audio dahulu, satu MP4 1080×1920 H.264/AAC bt709, −14 LUFS ±1 dan master true peak ≤−2 dBTP.</p></article></main></html>'''
(P/'out/storyboard.html').write_text(doc,encoding='utf8')
report=f'''# QA storyboard produksi 1

## Brief pengguna

SESUAI pada 21 still runtime HyperFrames: footage menyentuh sisi dan bawah frame, berganti kanan/kiri; grafis penuh pada kalimat chapter; English–Indonesia berada di kolom terpisah. Screenshot masalah dipakai sebagai referensi negatif. Arah “setuju arah ini” dicatat; belum persetujuan storyboard/render. Bukti kontak-storyboard.jpg dan semua out/storyboard/frame-*.png.

## Brand

SESUAI pada sampel: navy/slate, sand/ivory/sage dari NazarVerse 1.0; font Inter lokal. Warna sumber ruangan/baju dipertahankan. Tidak mengklaim wordmark konsep sebagai logo resmi. Cormorant tidak diperlukan pada komposisi ini. Tidak ada cover empat brand karena proyek NazarVerse.

## Artistik / gerak

Still 1.7/8.3/18.6/34.8/44.4s diperiksa untuk crop dan tata letak. Kepala diperlonggar dibanding iterasi pertama; tubuh berlanjut ke bawah frame, tidak berhenti sebagai potongan mengambang di tengah. Cutaway 25.7/26.7/27.6/29s menggunakan geometri halaman berengsel yang berbeda, dengan sampul dan bayangan kontak pada bidang. Footage disembunyikan melalui opacity parent agar media runtime tidak memunculkannya kembali.

Perbaikan diketahui sudah diterapkan: crop terlalu dekat, footage yang bocor ke cutaway, origin SVG yang menempatkan buku di luar frame, serta jarak antar halaman dan sampul. Batas: fase still tidak membuktikan keluwesan/bobot/ritme pada kecepatan normal. Tinjauan dengar dan playback BELUM TERVERIFIKASI.

## Teknis

Laporan resmi: hyperframes-check.json. Ringkasan: {json.dumps(summary,ensure_ascii=False)}. Snapshot resmi: snapshots.json, {len(frames)} frame. Laju caption maksimum {qa['max_cps']:.2f} karakter/detik. Teks informasi EN44/52px dan ID40px; metadata asli ASR dipertahankan. Craft warnings: {json.dumps(warnings,ensure_ascii=False)}. Peringatan bersifat heuristik minimum hold; perlu pemeriksaan pengguna dalam konteks ucapan dan tidak disebut seluruhnya lulus.

BELUM TERVERIFIKASI: bagian ASR 36.97–41.81s, seluruh frame footage/crop, audio mix/loudness, format final dan QA ekspor. Satu matte sumber pernah diuji tetapi tidak dipakai, sehingga tidak ada klaim mask video bersih. Sampel tidak menyiratkan resolusi sumber menjadi lebih detail setelah upscale.

## Status persetujuan

Arah: DISETUJUI. Storyboard 1: MENUNGGU. Render final: BELUM DIIZINKAN. Pertanyaan konfirmasi kalimat “not who you are” sudah diajukan. Persetujuan hanya dari pengguna. Komposisi SHA-256 {sha}.

Peningkatan nyata: talent terhubung dengan frame, objek memiliki bidang kontak, dan lokasi grafis mengikuti isi. Modul: bang-motion 1.19.0; HyperFrames 0.9.33; NazarVerse 1.0; K11–K14 0.1.
'''
(P/'out/qa-storyboard.md').write_text(report,encoding='utf8')
print(json.dumps({'frames':len(frames),'check_ok':check['ok'],'check_summary':summary,'storyboard':'out/storyboard.html','max_cps':qa['max_cps']},ensure_ascii=False))
