// Still-only capture. No MP4 and no approval mutation.
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const puppeteer=require(path.resolve('.sementara/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core'));
const p=__dirname,cfg=JSON.parse(fs.readFileSync(path.join(p,'manifest.json'))),beats=JSON.parse(fs.readFileSync(path.join(p,'beat-sheet.json')));
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,userDataDir:path.resolve('.sementara/somewhere-chrome'),args:['--no-sandbox','--disable-gpu','--allow-file-access-from-files']});
 try{
 const page=await browser.newPage();await page.setViewport({width:1080,height:1920,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(p,'komposisi/index.html')).href+'?clean=1',{waitUntil:'networkidle0'});
 await page.waitForFunction('window.OPENER && OPENER.ready');
 const out=path.join(p,'out/storyboard');fs.mkdirSync(out,{recursive:true});let checks=[];
 for(const t of beats.beats.flatMap(b=>b.still)){
  await page.evaluate(t=>{OPENER.seek(t)},t);
  await page.screenshot({path:path.join(out,`t${t.toFixed(2)}.png`)});
  checks.push(await page.evaluate(t=>{
   const box=id=>{const a=document.querySelector(id),r=a.getBoundingClientRect(),s=getComputedStyle(a);return{x:r.x,y:r.y,w:r.width,h:r.height,opacity:+s.opacity,text:a.textContent,font:s.fontFamily}};
   return{t,caption:box('#caption'),dedication:box('#dedication'),last:box('#last'),portrait:box('#portrait'),fontsLoaded:document.fonts.check('44px Inter')&&document.fonts.check('57px Cormorant')};
  },t));
 }
 // Seek repeatability: same timestamp must produce the same pixels after a nonsequential seek.
 await page.evaluate(()=>OPENER.seek(29.5));const a=await page.screenshot();await page.evaluate(()=>OPENER.seek(2));await page.evaluate(()=>OPENER.seek(29.5));const b=await page.screenshot();
 const groups=JSON.parse(fs.readFileSync(path.join(p,'cache/caption-groups.json')));const captionChecks=[];
 for(const g of groups){
  const t=Math.min(g.e-.03,g.s+.5);await page.evaluate(t=>OPENER.seek(t),t);
  captionChecks.push(await page.evaluate(t=>{
   const bounds=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height,text:e.textContent}};
   const en=bounds('#caption .enline'),id=bounds('#caption .idline');
   const rects=[...document.querySelectorAll('#caption span')].map(e=>e.getBoundingClientRect());
   return{t,en,id,englishLines:new Set(rects.map(r=>Math.round(r.top))).size,indonesianLines:id?Math.round(id.height/parseFloat(getComputedStyle(document.querySelector('#caption .idline')).lineHeight)):0,insideSafeArea:!id||(id.bottom<=1520.1&&id.right<=960&&id.x>=60),closing:!!document.querySelector('#last').textContent};
  },t));
 }
 const qa={errors,checks,captionChecks,repeatableAt29_5:Buffer.compare(a,b)===0,stillsOnly:true};fs.writeFileSync(path.join(p,'out/browser-check.json'),JSON.stringify(qa,null,2));
 console.log(JSON.stringify({frames:checks.length,errors,repeatable:qa.repeatableAt29_5,captionOverflow:captionChecks.filter(c=>!c.insideSafeArea||c.englishLines>2||c.indonesianLines>2)}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
