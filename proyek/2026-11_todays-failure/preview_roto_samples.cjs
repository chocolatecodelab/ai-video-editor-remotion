// Temporary still diagnostic using exact masked sample frames; not a final runtime proof.
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const puppeteer=require(path.resolve('.sementara/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core'));
const p=__dirname;
(async()=>{const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,userDataDir:path.resolve('.sementara/todays-roto-preview'),args:['--no-sandbox','--allow-file-access-from-files']});try{
 const page=await browser.newPage();await page.setViewport({width:1080,height:1920,deviceScaleFactor:1});
 await page.goto(pathToFileURL(path.join(p,'hyperframes/index.html')).href,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>{const old=document.querySelector('#talent');const img=document.createElement('img');img.id='talent';old.replaceWith(img)});
 for(const t of [1.7,8.3]){
  const url=pathToFileURL(path.join(p,`out/mask-review/rvm/cutout-${t.toFixed(1)}.png`)).href;
  await page.evaluate(async({t,url})=>{__review.seek(t);const im=document.querySelector('#talent');im.src=url;await im.decode()}, {t,url});
  await page.screenshot({path:path.join(p,`out/mask-review/layout-test-${t.toFixed(1)}.jpg`),type:'jpeg',quality:95});
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
