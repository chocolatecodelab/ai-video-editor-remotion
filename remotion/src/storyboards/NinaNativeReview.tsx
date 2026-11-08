import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {pakaiFontToken} from '../lib/font';
import type {ReviewProps} from './nina-assets/types';

// Every illustration is native SVG. Only the official logo and source talent use raster media.
const gold='#CB9D31',light='#FDF1A4';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(t:number,start:number,d=.7)=>{const x=clamp((t-start)/d);return x*x*(3-2*x);};
const paper=(t:number,start:number)=>spring({frame:(t-start)*30,fps:30,config:{mass:.65,damping:17,stiffness:150}});
const Ink:React.FC<{children:React.ReactNode}>=({children})=><g fill="none" stroke="url(#metal)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">{children}</g>;
const Text:React.FC<{x:number;y:number;children:React.ReactNode;size?:number;muted?:boolean}>=({x,y,children,size=24,muted=false})=><text x={x} y={y} textAnchor="middle" fill={muted?'#A79D82':light} fontSize={size} fontWeight="700" letterSpacing="1">{children}</text>;
const Book:React.FC<{x:number;y:number;scale?:number;open?:number}>=({x,y,scale=1,open=1})=><g transform={`translate(${x} ${y}) scale(${scale})`}>
 <Ink><path d="M0 12Q-60-18-120 0V133Q-60 112 0 144Q60 112 120 133V0Q60-18 0 12Z" fill="#0C0B08"/><path d="M0 12V144"/>
 {[0,1,2].map(i=><g key={i} stroke="#8C7841" strokeWidth="3"><path d={`M-98 ${37+i*26}Q-55 ${29+i*26} -22 ${44+i*26}`}/><path d={`M22 ${44+i*26}Q55 ${29+i*26} 98 ${37+i*26}`}/></g>)}</Ink>
 <path d="M0 12Q60-18 120 0V133Q60 112 0 144Z" fill="#C9AC61" opacity={.24*(1-open)} transform={`scale(${Math.cos(open*Math.PI)},1)`}/>
 </g>;
const Campus:React.FC<{x:number;y:number;scale?:number}>=({x,y,scale=1})=><g transform={`translate(${x} ${y}) scale(${scale})`}><Ink>
 <path d="M-130 0L0-65L130 0Z" fill="#171308"/><path d="M-142 150H142M-135 130H135M-122 12H122"/>
 {[-90,-30,30,90].map(x=><g key={x}><path d={`M${x-12} 15V125H${x+12}V15`}/><path d={`M${x-18} 15H${x+18}`} /></g>)}<circle cy="-23" r="9"/>
 </Ink></g>;
const Sheet:React.FC<{x:number;y:number;s?:number;rotate?:number;label?:string}>=({x,y,s=1,rotate=0,label='PROGRAM'})=><g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
 <rect x="-90" y="-120" width="180" height="240" rx="8" fill="#100F0B" stroke="url(#metal)" strokeWidth="3"/>
 <path d="M-65-65H25M-65-36H62M-65-13H62M-65 10H38" stroke="#807452" strokeWidth="4" strokeLinecap="round"/>
 <Text x={0} y={-90} size={18}>{label}</Text><circle cx="40" cy="69" r="21" fill="none" stroke={gold} strokeWidth="3"/>
 <path d="M30 69l7 7 15-18" fill="none" stroke={light} strokeWidth="3"/>
 </g>;
const Person:React.FC<{x:number;y:number}>=({x,y})=><g transform={`translate(${x} ${y})`}><Ink><circle cy="-20" r="17"/><path d="M-31 37Q-31 0 0 0Q31 0 31 37Z"/></Ink></g>;

const Artwork:React.FC<{kind:string;t:number;start:number}>=({kind,t,start})=>{
 const local=t-start;
 if(kind==='opening'){
  const focus=ease(t,2.57,.7);
  return <><Campus x={160} y={190} scale={.65}/><Ink><path d="M255 220H365M365 220L470 100M365 220H470M365 220L470 340"/></Ink>
   {[100,220,340].map((y,i)=><g key={y} opacity={i===1?1:1-focus*.8}><rect x="480" y={y-38} width="210" height="76" rx="8" stroke={gold} fill={i===1?'url(#dim)':'#060605'} strokeWidth="3"/><Text x={585} y={y+9}>{i===1?'PELUANG S1':'PROGRAM'}</Text></g>)}
   <circle cx={365+105*focus} cy="220" r="9" fill={light}/></>;
 }
 if(kind==='directory'){
  const release=paper(t,5.47),opening=ease(t,start,.8);
  return <><g transform={`translate(300 230) rotate(${-6+6*opening})`}><path d="M-190-110H-40L-15-78H200V150H-190Z" stroke="url(#metal)" strokeWidth="4" fill="#121007"/><Sheet x={35} y={-80*release} s={.85} label="DAAD"/><path d="M-190 10L-160 150H200L225 10Z" fill="#070705" stroke="url(#metal)" strokeWidth="4"/></g>
  <g opacity={ease(t,6.1,.7)}><path d="M540 230H620" stroke={gold} strokeWidth="3"/><Text x={650} y={205}>PROGRAM</Text><Text x={650} y={243} size={19} muted>PENDANAAN</Text></g></>;
 }
 if(kind==='funding'){
  const labels=['S2 / MASTER','DOKTORAL','PENELITIAN'];const anchors=[12.29,14.09,15.3];
  return <><Sheet x={150} y={270} s={1.05} label="PENDANAAN"/>
   {labels.map((label,i)=>{const q=ease(t,anchors[i],.65),y=85+i*185;return <g key={label} opacity={.18+.82*q}>
    <path d={`M245 270H310Q335 270 335 ${y+35}V${y}H450`} pathLength={1} strokeDasharray={1} strokeDashoffset={1-q} fill="none" stroke={gold} strokeWidth="4"/>
    <g transform={`translate(540 ${y-10+18*(1-q)})`}><Book x={0} y={-45} scale={.48} open={q}/><Text x={0} y={55} size={26}>{label}</Text></g><circle cx="450" cy={y} r={6+3*q} fill={light}/>
   </g>;})}</>;
 }
 if(kind==='summer'){
  const flip=paper(t,20.31),phase=ease(t,20.31,.7);
  return <><g transform="translate(120 35)"><rect width="340" height="310" rx="13" fill="#0A0906" stroke="url(#metal)" strokeWidth="4"/>
   <path d="M0 65H340" stroke={gold} strokeWidth="3"/>{[45,125,205,285].map(x=><path key={x} d={`M${x} -14V18`} stroke={light} strokeWidth="7" strokeLinecap="round"/>)}
   <Text x={170} y={45}>MUSIM PANAS</Text>
   {Array.from({length:15},(_,i)=><rect key={i} x={28+(i%5)*60} y={95+Math.floor(i/5)*57} width="40" height="36" rx="4" fill={i>=6&&i<=8?gold:'#28251B'} opacity={i>=6&&i<=8?.25+.75*phase:1}/>)}
   <g transform={`translate(0 65) scale(1,${Math.cos(Math.PI*flip)})`} opacity={1-phase}><rect width="340" height="245" fill="#151208"/><path d="M20 30H300M20 70H300M20 110H250" stroke="#5C502D" strokeWidth="4"/></g>
  </g><Book x={635} y={140} scale={.65} open={phase}/><Text x={635} y={295} size={22}>BAHASA JERMAN</Text></>;
 }
 if(kind==='comparison'){
  const q=ease(t,23.7,1.1);
  return <><g transform={`translate(${-32*q} 0)`}><Book x={235} y={140} scale={.85}/><Text x={235} y={325}>KURSUS BAHASA</Text><path d="M140 380H330" stroke={gold} strokeWidth="8"/><Text x={235} y={425} size={20} muted>PROGRAM TERTENTU</Text></g>
   <g transform={`translate(${32*q} 0)`}><Campus x={595} y={190} scale={.8}/><Text x={595} y={365}>KULIAH S1</Text><path d="M490 405H700" stroke={gold} strokeWidth="8"/><Text x={595} y={450} size={20} muted>PEMBIAYAAN PENUH</Text></g>
   <path d="M405 90L405 485" stroke="#68542A" strokeWidth="2" pathLength={1} strokeDasharray={1} strokeDashoffset={1-q}/><Text x={405} y={55} size={22}>CAKUPANNYA BERBEDA</Text></>;
 }
 if(kind==='student'){
  const q=ease(t,start,.9);
  return <><Campus x={410} y={125} scale={1}/><Person x={180+110*q} y={300}/><path d="M320 320H530" stroke={gold} strokeWidth="3" strokeDasharray="7 12"/><Text x={410} y={395} size={23}>STATUS MAHASISWA ≠ JAMINAN BEASISWA</Text></>;
 }
 if(kind==='selection'){
  const scan=ease(t,32.7,1.0);const checks=[ease(t,33.5,.6),ease(t,34.65,.6),ease(t,35.9,.6)];
  return <><Sheet x={200} y={250-35*paper(t,32.7)} s={1.35} label="APLIKASI"/>
   <path d={`M60 ${95+230*scan}H340`} stroke={light} strokeWidth="4" opacity={local<4?1:.15}/>
   {['PRESTASI','PERSYARATAN','SELEKSI'].map((label,i)=><g key={label}>
    <path d={`M330 ${150+i*110}H420`} stroke={gold} strokeWidth="3" opacity={checks[i]}/>
    <rect x="440" y={115+i*110} width="310" height="74" rx="6" stroke={checks[i]>.5?gold:'#403823'} fill="#0D0C08" strokeWidth="2"/>
    <circle cx="475" cy={152+i*110} r="12" stroke={gold} fill={checks[i]>.7?gold:'none'} strokeWidth="2"/>
    <Text x={618} y={160+i*110} size={23}>{label}</Text>
   </g>)}<Text x={420} y={490} size={23}>TIDAK OTOMATIS MENDAPAT BEASISWA</Text></>;
 }
 if(kind==='planning'){
  const q=paper(t,41.35);
  return <><path d="M170 240H660" stroke="#68542A" strokeWidth="3"/>
   {[0,1,2].map((i)=><g key={i} transform={`translate(${175+i*240} ${150+(1-q)*(30+i*16)})`}>
    {i===0?<Book x={0} y={-10} scale={.42}/>:i===1?<Sheet x={0} y={30} s={.4} label="RENCANA"/>:<Campus x={0} y={20} scale={.42}/>}
    <circle cy="90" r="8" fill={gold}/><Text x={0} y={145} size={23}>{['PERSIAPAN','RENCANA','STUDI'][i]}</Text>
   </g>)}</>;
 }
 const press=ease(t,46.0,.13)*(1-ease(t,46.18,.3));const pointer=ease(t,45.79,.45);
 return <><g transform={`translate(0 ${5*press})`}><rect x="175" y="120" width="480" height="125" rx="62" fill="url(#dim)" stroke="url(#metal)" strokeWidth="4"/><Text x={415} y={195} size={38}>LINK DI BIO</Text></g>
  <g transform={`translate(${700-100*pointer} ${320-110*pointer}) rotate(-20)`}><path d="M0 0L0 65L17 49L31 82L47 74L32 43H59Z" fill={light} stroke="#000" strokeWidth="3"/></g>
  <circle cx="600" cy="210" r={20+70*ease(t,46.1,.6)} stroke={gold} strokeWidth="3" fill="none" opacity={1-ease(t,46.1,.6)}/>
  <Text x={415} y={345} size={24}>BERSAMA TIM OTCA</Text></>;
};

export const NinaNativeReview:React.FC<ReviewProps>=(p)=>{
 const frame=useCurrentFrame(),t=frame/30,tok=pakaiFontToken(p.tokens);
 const s=p.scenes.find(s=>t>=s.start&&t<s.end)??p.scenes[p.scenes.length-1];
 const full=s.mode==='full';const page=p.captions.find(c=>t>=c.start&&t<c.end);
 const available=p.cutoutFrames;const cutout=available.includes(frame)?frame:available.reduce((a,b)=>Math.abs(a-frame)<Math.abs(b-frame)?a:b,available[0]);
 return <AbsoluteFill style={{background:'#000',color:'#FFF',fontFamily:tok.font.judul.family}}>
  <Img src={staticFile(p.logo)} style={{position:'absolute',left:422.5,top:240,width:235,height:72,objectFit:'contain'}}/>
  <div style={{position:'absolute',left:108,top:355,fontSize:25,letterSpacing:4,fontWeight:600,color:light}}>{s.kicker}</div>
  <div style={{position:'absolute',left:108,top:406,fontSize:76,lineHeight:1.03,fontWeight:800,letterSpacing:-2.6}}>
   {s.title.map((text,i)=><div key={text} style={i===1?{background:'linear-gradient(90deg,#CB9D31,#FDF1A4 48%,#B3822C)',backgroundClip:'text',color:'transparent'}:{}}>{text}</div>)}
  </div>
  <svg viewBox={full?'0 0 830 560':'0 0 830 440'} style={{position:'absolute',left:100,top:full?660:590,width:860,height:full?650:455,overflow:'visible'}}>
   <defs><linearGradient id="metal"><stop stopColor="#B3822C"/><stop offset=".48" stopColor="#FDF1A4"/><stop offset="1" stopColor="#CB9D31"/></linearGradient><linearGradient id="dim" x2="0" y2="1"><stop stopColor="#3A2E0C"/><stop offset="1" stopColor="#0A0905"/></linearGradient></defs>
   <Artwork kind={s.kind} t={t} start={s.start}/>
  </svg>
  {!full&&<div style={{position:'absolute',left:0,top:1005,width:1080,height:610,overflow:'hidden',maskImage:'linear-gradient(black 0%,black 76%,transparent 100%)'}}>
   <Img src={staticFile(`${p.cutoutDir}/${String(cutout).padStart(6,'0')}.webp`)} style={{position:'absolute',left:80,top:-500,width:920,height:920*1920/1080}}/>
  </div>}
  {page&&<div style={{position:'absolute',left:108,top:full?1390:1510,width:864,fontWeight:800,lineHeight:1.18,letterSpacing:-.8,textShadow:'0 3px 14px #000,0 2px 6px #000'}}>
   {page.lines.map((line,i)=><div key={i} style={{fontSize:i===0&&page.lines.length>1?50:62,marginBottom:7}}>{line.map((w,j)=><React.Fragment key={j}><span style={{color:/^(S1|S2|terbatas|seleksi|beasiswa|persyaratan|bio|OTCA)[,.!?]?$/i.test(w.text)?light:'#FFF',borderBottom:t*1000>=w.startMs&&t*1000<w.endMs?`3px solid ${gold}`:'3px solid transparent'}}>{w.text}</span>{j<line.length-1?' ':''}</React.Fragment>)}</div>)}
  </div>}
 </AbsoluteFill>;
};
