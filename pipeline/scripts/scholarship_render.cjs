const path=require('node:path');
const fs=require('node:fs');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'../..');
const req=createRequire(path.join(root,'remotion/package.json'));
const {bundle}=req('@remotion/bundler');
const {openBrowser,selectComposition,renderMedia,renderStill}=req('@remotion/renderer');
const job=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const inputProps=JSON.parse(fs.readFileSync(job.props,'utf8'));
process.env.TEMP=process.env.TMP=path.join(root,'.sementara/tmp');
const metrics=[];
const onBrowserLog=log=>{const prefix='SCHOLARSHIP_QA ';const index=log.text.indexOf(prefix);if(index>=0){metrics.push(JSON.parse(log.text.slice(index+prefix.length)));}};
(async()=>{
 const serveUrl=await bundle({entryPoint:job.entry,rootDir:path.join(root,'remotion'),enableCaching:true});
 const browser=await openBrowser('chrome',{logLevel:'error'});
 try{
  const composition=await selectComposition({serveUrl,id:job.composition,inputProps,puppeteerInstance:browser});
  if(job.mode==='still'){
   for(const frame of job.frames){await renderStill({composition,serveUrl,inputProps,puppeteerInstance:browser,frame,scale:.5,imageFormat:'png',output:path.join(job.work,`check-${frame}.png`),onBrowserLog,logLevel:'error'});console.log('CHECK',frame);}
  }else{
   let reported=-1;
   await renderMedia({composition,serveUrl,inputProps,puppeteerInstance:browser,outputLocation:path.join(job.work,'picture.mp4'),codec:'h264',crf:15,concurrency:2,muted:true,pixelFormat:'yuv420p',colorSpace:'bt709',imageFormat:'jpeg',jpegQuality:96,onBrowserLog,logLevel:'error',onProgress:progress=>{const tenth=Math.floor(progress.progress*10);if(tenth>reported){reported=tenth;fs.writeFileSync(path.join(job.work,'progress.json'),JSON.stringify({percent:tenth*10,updated:new Date().toISOString()}));console.log(`PICTURE ${tenth*10}%`);}}});
  }
 }finally{fs.writeFileSync(path.join(job.work,job.mode==='still'?'dom-check.json':'dom-qa.json'),JSON.stringify(metrics,null,2));await browser.close({silent:true});}
})().catch(error=>{console.error(error);process.exitCode=1});
