// Bang Motion frame-by-frame export, adapted from the skill's export-frames.mjs.
// Streams frames to ffmpeg: one visual render, no intermediate MP4.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {spawn}=require('child_process'),{once}=require('events'),{pathToFileURL}=require('url');
const puppeteer=require(path.resolve('.sementara/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core'));
const p=__dirname,read=f=>JSON.parse(fs.readFileSync(path.join(p,f),'utf8')),cfg=read('manifest.json');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
(async()=>{
 if(!cfg.approval.storyboard||!cfg.approval.final_render)throw Error('User storyboard/render approval required');
 if(cfg.approval.beat_sheet_sha256!==hash(path.join(p,'beat-sheet.json')))throw Error('Approved beat sheet changed');
 const tmp=path.resolve('.sementara/somewhere-final'),out=path.join(p,'out',cfg.proyek+'.mp4');
 const spec=read('beat-sheet.json'),subs=read('cache/caption-groups.json'),words=read('cache/words.storyboard.json').kata;
 if(spec.caption.size<40||spec.caption.translation_size<40)throw Error('Caption below minimum 40px');
 if(subs.some(g=>Math.max(g.id.length,g.words.map(i=>words[i].w).join(' ').length)/(g.e-g.s)>17.001))throw Error('Caption exceeds 17 characters per second');
 if(fs.existsSync(out))throw Error('Final already exists; refuse an accidental second visual render');
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,userDataDir:path.join(tmp,'chrome-final'),args:['--no-sandbox','--disable-gpu','--allow-file-access-from-files']});
 let encoder;
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:cfg.format.width,height:cfg.format.height,deviceScaleFactor:1});
  await page.goto(pathToFileURL(path.join(p,'komposisi/index.html')).href+'?clean=1',{waitUntil:'networkidle0'});
  await page.waitForFunction('window.OPENER && OPENER.ready');
  const total=Math.ceil(cfg.format.duration*cfg.format.fps),failures=[];
  encoder=spawn('ffmpeg',['-hide_banner','-loglevel','warning','-f','image2pipe','-vcodec','png','-framerate',String(cfg.format.fps),'-i','pipe:0','-i',path.join(tmp,'audio-final.m4a'),'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-profile:v','high','-level:v','4.1','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','copy','-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0','-movflags','+faststart','-t',String(total/cfg.format.fps),'-metadata','title=Somewhere — Tribute to my grandpa',out],{stdio:['pipe','ignore','pipe'],windowsHide:true});
  const done=once(encoder,'close');let log='';encoder.stderr.on('data',d=>{log+=d});encoder.stdin.on('error',()=>{});
  for(let i=0;i<total;i++){
   const t=i/cfg.format.fps;
   const result=await page.evaluate(t=>{
    OPENER.seek(t);
    const c=document.querySelector('#caption'),r=c.getBoundingClientRect(),visible=+getComputedStyle(c).opacity>.01;
    const mem=document.querySelector('#memory'),pr=document.querySelector('#portrait').getBoundingClientRect();
    return{bad:visible&&(r.bottom>1520.1||r.left<60||r.right>960),overlap:visible&&+getComputedStyle(mem).opacity>.15&&pr.bottom>r.top,box:{bottom:r.bottom,portraitBottom:pr.bottom}};
   },t);
   if(result.bad||result.overlap)failures.push({frame:i,t,...result});
   const png=await page.screenshot({type:'png',optimizeForSpeed:true});
   if(!encoder.stdin.write(png))await once(encoder.stdin,'drain');
   if(i%150===0)console.log(JSON.stringify({frame:i,total,percent:Math.round(i/total*100)}));
  }
  encoder.stdin.end();const [code]=await done;
  fs.writeFileSync(path.join(p,'out/render-proof.json'),JSON.stringify({engine:'bang-motion@1.19.0',frames:total,fps:cfg.format.fps,errors,failures,composition_sha256:hash(path.join(p,'komposisi/index.html')),beat_sheet_sha256:hash(path.join(p,'beat-sheet.json')),output:out,encoderCode:code,encoderLog:log,visualRenders:1,abandonedIncompleteAttempts:1,approvedMessage:cfg.approval.render_message},null,2));
  if(code||errors.length||failures.length)throw Error(`QA/render requires review: code=${code}, pageErrors=${errors.length}, layoutFailures=${failures.length}`);
  console.log(JSON.stringify({complete:true,frames:total,output:out}));
 }finally{await browser.close();if(encoder&&!encoder.killed&&encoder.exitCode===null)encoder.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
