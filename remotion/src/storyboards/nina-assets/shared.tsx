import React from 'react';
import {Img,staticFile} from 'remotion';
import type {SceneContext} from './types';

export const Asset:React.FC<{c:SceneContext;name:string;x:number;y:number;w:number;angle?:number;scale?:number;opacity?:number}>=
({c,name,x,y,w,angle=0,scale=1,opacity=1})=><Img src={staticFile(c.p.assets[name])} style={{position:'absolute',left:x,top:y,width:w,height:w,
  objectFit:'contain',opacity,transform:`rotate(${angle}deg) scale(${scale})`,filter:'drop-shadow(0 20px 24px rgba(0,0,0,.65))'}}/>;

export const Talent:React.FC<{c:SceneContext;x:number;y:number;w:number}>=({c,x,y,w})=>{
  const available=c.p.cutoutFrames;
  const frame=available.includes(c.frame)?c.frame:available.reduce((best,n)=>Math.abs(n-c.frame)<Math.abs(best-c.frame)?n:best,available[0]);
  return <div data-talent style={{position:'absolute',left:0,top:0,width:1080,height:c.p.layout.talentBottom,overflow:'hidden',
    maskImage:'linear-gradient(to bottom,black 0%,black 93%,transparent 100%)'}}>
    <Img src={staticFile(`${c.p.cutoutDir}/${String(frame).padStart(6,'0')}.webp`)} style={{position:'absolute',left:x,top:y,width:w,height:w*1920/1080}}/>
  </div>;
};

export const Label:React.FC<{c:SceneContext;text:string;x:number;y:number;size?:number;accent?:boolean;opacity?:number}>=
({c,text,x,y,size=42,accent=false,opacity=1})=><div data-art-label style={{position:'absolute',left:x,top:y,fontSize:size,fontWeight:800,
  fontFamily:c.family,color:accent?c.light:c.white,letterSpacing:-.8,opacity,whiteSpace:'nowrap'}}>{text}</div>;

export const Route:React.FC<{c:SceneContext;d:string;progress:number}>=({c,d,progress})=><svg width={1080} height={1920} style={{position:'absolute',inset:0}}>
  <path d={d} fill="none" stroke={c.gold} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1-progress}/>
</svg>;

export const Calendar:React.FC<{c:SceneContext;x:number;y:number;w:number;phase:number}>=({c,x,y,w,phase})=>
<div style={{position:'absolute',left:x,top:y,width:w,height:w*1.1,transform:`perspective(1200px) rotateY(${-8+8*phase}deg) rotate(${-6+2*phase}deg)`,
  background:'#F4EFDF',borderRadius:12,boxShadow:'8px 12px 0 #82765A,14px 23px 25px #000',border:'2px solid #CFC3A4'}}>
  <div style={{position:'absolute',left:0,top:0,right:0,height:90,background:c.gold,borderRadius:'10px 10px 0 0'}}/>
  {[0,1,2,3,4,5].map(i=><div key={i} style={{position:'absolute',left:30+i*(w-60)/5,top:-18,width:9,height:46,background:'linear-gradient(90deg,#65532A,#F9E2A3,#806634)',borderRadius:8}}/>)}
  <div data-art-label style={{position:'absolute',left:24,top:27,color:'#16120B',fontSize:28,fontWeight:800,letterSpacing:2}}>{c.s.labels[0]}</div>
  <div style={{position:'absolute',left:25,right:25,top:122,display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:15}}>
    {Array.from({length:15},(_,i)=><div key={i} style={{height:28,background:i>=6&&i<=8?c.gold:'#D8D0BB',borderRadius:3,opacity:i>=6&&i<=8?.4+.6*phase:1}}/>)}
  </div>
  <div data-art-label style={{position:'absolute',left:25,bottom:30,fontSize:28,fontWeight:800,color:'#201B12'}}>{c.s.labels[1]}</div>
</div>;

export const Paper:React.FC<{c:SceneContext;x:number;y:number;w:number;angle:number;label:string;opacity?:number}>=
({c,x,y,w,angle,label,opacity=1})=><div style={{position:'absolute',left:x,top:y,width:w,height:w*1.23,background:'linear-gradient(125deg,#FBF7ED,#DCD0B5)',
  transform:`rotate(${angle}deg)`,borderRadius:3,boxShadow:'6px 9px 18px #0008',opacity,border:'1px solid #D5C8A9'}}>
  <div data-art-label style={{position:'absolute',left:22,top:30,right:22,fontSize:28,fontWeight:800,color:'#392C12'}}>{label}</div>
  {[0,1,2,3].map(i=><div key={i} style={{position:'absolute',left:22,top:100+i*20,width:w-50-i*12,height:3,background:'#B4A685'}}/>)}
  <svg style={{position:'absolute',bottom:25,left:22}} width={80} height={32}><path d="M0 24Q12 0 22 17T45 13T75 16" fill="none" stroke={c.gold} strokeWidth={3}/></svg>
</div>;
