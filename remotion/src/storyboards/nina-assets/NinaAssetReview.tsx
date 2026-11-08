import React,{useLayoutEffect} from 'react';
import {AbsoluteFill,Easing,Img,cancelRender,continueRender,delayRender,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {pakaiFontToken} from '../../lib/font';
import type {ReviewProps,SceneContext} from './types';
import {OpeningScene} from './OpeningScene';
import {DirectoryScene} from './DirectoryScene';
import {FundingScene} from './FundingScene';
import {SummerScene} from './SummerScene';
import {ComparisonScene} from './ComparisonScene';
import {StudentScene} from './StudentScene';
import {SelectionScene} from './SelectionScene';
import {PlanningScene} from './PlanningScene';
import {ClosingScene} from './ClosingScene';

const components:Record<string,React.FC<{c:SceneContext}>>={opening:OpeningScene,directory:DirectoryScene,funding:FundingScene,
  summer:SummerScene,comparison:ComparisonScene,student:StudentScene,selection:SelectionScene,planning:PlanningScene,closing:ClosingScene};

/** Project props own the timeline, words and asset paths; these scenes are also the production source after approval. */
export const NinaAssetReview:React.FC<ReviewProps>=(p)=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame/fps,tok=pakaiFontToken(p.tokens);
 const s=p.scenes.find(x=>t>=x.start&&t<x.end)??p.scenes[p.scenes.length-1];
 const c:SceneContext={p,s,t,frame,gold:String(tok.warna.aksen),light:String(tok.warna['aksen-2']),darkGold:String(tok.warna.peringatan),
  white:String(tok.warna['teks-utama']),family:tok.font.judul.family,body:tok.font.isi.family,
  move:(anchor,duration=.7)=>interpolate(t,[anchor,anchor+duration],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)})};
 const SceneComponent=components[s.kind];
 const page=p.captions.find(x=>t>=x.start&&t<x.end);
 const gradient=`linear-gradient(100deg,${c.gold},${c.light} 48%,${c.darkGold})`;
 const titleEnter=c.move(s.start,.65);
 useLayoutEffect(()=>{
  if(!p.auditFrames.includes(frame))return;
  const handle=delayRender('nina assets layout audit');let done=false;
  document.fonts.ready.then(()=>requestAnimationFrame(()=>{
   const items=Array.from(document.querySelectorAll('[data-check] , [data-art-label]')).map(el=>{
    const r=el.getBoundingClientRect();return {text:el.textContent??'logo',x:r.x,y:r.y,w:r.width,h:r.height,
      size:parseFloat(getComputedStyle(el).fontSize),overflow:el.scrollWidth>el.clientWidth+2};});
   console.log('SCHOLARSHIP_QA '+JSON.stringify({frame,scene:s.id,items}));done=true;continueRender(handle);
  })).catch(cancelRender);
  return()=>{if(!done){done=true;continueRender(handle);}};
 },[frame,p.auditFrames,s.id]);
 return <AbsoluteFill style={{backgroundColor:'#000',color:c.white,fontFamily:c.family}}>
  <Img src={staticFile(p.logo)} style={{position:'absolute',zIndex:20,left:(1080-235)/2,top:p.layout.logoY,width:235,height:72,objectFit:'contain'}}/>
  <div data-check style={{position:'absolute',zIndex:20,left:p.layout.side,top:350,fontFamily:c.body,fontWeight:600,fontSize:26,letterSpacing:4,color:c.light}}>{s.kicker}</div>
  <div style={{position:'absolute',zIndex:20,left:p.layout.side,top:p.layout.titleY,width:p.layout.textWidth,fontWeight:800,
    fontSize:s.mode==='full'?88:84,letterSpacing:-3.2,lineHeight:1.03,transform:`translateY(${18*(1-titleEnter)}px)`}}>
   {s.title.map((line,i)=><div data-check key={line} style={{whiteSpace:'nowrap',...(i===s.title.length-1?{backgroundImage:gradient,backgroundClip:'text',WebkitBackgroundClip:'text',color:'transparent'}:{})}}>{line}</div>)}
  </div>
  <div style={{position:'absolute',inset:0,height:p.layout.talentBottom,overflow:'hidden'}}>
   {SceneComponent&&<SceneComponent c={c}/>}
  </div>
  {page&&<div style={{position:'absolute',left:p.layout.side,top:p.layout.captionY,width:p.layout.textWidth,
    fontSize:64,fontWeight:800,lineHeight:1.14,letterSpacing:-1.1}}>
   {page.lines.map((line,index)=><div data-check key={`${page.start}-${index}`} style={{whiteSpace:'nowrap',fontFamily:index===0&&page.lines.length>1?c.body:c.family,
     fontSize:index===0&&page.lines.length>1?52:64,marginBottom:6}}>
    {line.map((w,i)=>{
     const active=t*1000>=w.startMs&&t*1000<w.endMs;
     const key=/^(terbatas|S1|S2|doktoral|peneliti|berbeda|penuh|prestasi|persyaratan|seleksi|beasiswa|bio|OTCA)[,.!?]?$/i.test(w.text);
     return <React.Fragment key={`${w.startMs}-${i}`}><span style={{position:'relative',display:'inline-block',color:key?c.light:c.white,
      borderBottom:active?`3px solid ${c.gold}`:'3px solid transparent',paddingBottom:2}}>{w.text}</span>{i<line.length-1?' ':''}</React.Fragment>;
    })}
   </div>)}
  </div>}
 </AbsoluteFill>;
};

