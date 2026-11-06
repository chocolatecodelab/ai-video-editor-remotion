import React, {useLayoutEffect} from "react";
import {AbsoluteFill, Easing, Img, OffthreadVideo, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Tokens, rgba} from "../lib/kontrak";
import {pakaiFontToken} from "../lib/font";
import {ArtTheme, ScholarshipArt} from "./ScholarshipArt";

type Word = {w: string; s: number; e: number};
export type ScholarshipScene = {id: string; mulai: number; selesai: number; mode: string; visual: string; headline: string[]; labels: string[]; anchors: number[]; motion_config?: {entry: number; action: number; transition: number}};
export type ScholarshipProps = {
  W: number; H: number; fps: number; durasiFrame: number; tokens: Tokens;
  footage: string; logo: string; pages: Word[][]; captionBreaks?: number[]; scenes: ScholarshipScene[];
  cutout?: {dir: string};
  auditFrames?: number[];
  layout: {logoY: number; logoW: number; fullArt: [number,number,number,number]; splitArt: [number,number,number,number]; talentTop: number; talentOffset: number; captionFullY: number; captionSplitY: number};
};

/** Same frame-driven compositor for storyboard and future approved production. No still-image surrogate for talent. */
export const ScholarshipReel: React.FC<ScholarshipProps> = (p) => {
  const f=useCurrentFrame(); const {fps}=useVideoConfig();const t=f/fps;
  const tok=pakaiFontToken(p.tokens);
  const c=tok.warna;
  const theme: ArtTheme={black:String(c.latar),white:String(c["teks-utama"]),gold:String(c.aksen),light:String(c["aksen-2"]),darkGold:String(c.peringatan)};
  const scene=p.scenes.find(s=>t>=s.mulai&&t<s.selesai)??p.scenes[p.scenes.length-1];
  const previous=p.scenes[p.scenes.indexOf(scene)-1];
  const full=scene.mode==="full";const brand=scene.visual==="brand";
  const ease=Easing.bezier(...tok.easing.standar);
  const progress=(start: number,duration=.45,at=f)=>interpolate(at,[start*fps,(start+duration)*fps],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:ease});
  const phase=progress(scene.mulai,scene.motion_config?.entry??.65);
  const transition=progress(scene.mulai,scene.motion_config?.transition??.2);
  const artwork=(s: ScholarshipScene,opacity: number,outgoing=false)=>{
    const b=s.mode==="full"?p.layout.fullArt:p.layout.splitArt;
    const entry=outgoing?1:progress(s.mulai,s.motion_config?.entry??.65);
    const moves=s.anchors.map(a=>progress(a,s.motion_config?.action??.65));
    const blurConfig=tok["motion-blur"] as {aktif: boolean; "ambang-px": number};
    const blur=s.anchors.map((a,i)=>{const speed=Math.abs(moves[i]-progress(a,s.motion_config?.action??.65,f-1))*303*b[2]/920;return blurConfig?.aktif&&speed>blurConfig["ambang-px"]?Math.min(4,speed*.08):0;});
    return <div data-art-scene={s.id} style={{position:"absolute",left:b[0],top:b[1],width:b[2],height:b[3],opacity,transform:`translateY(${(1-entry)*22}px)`}}>
      <ScholarshipArt kind={s.visual} theme={theme} uid={`nina-${s.id}`} labels={s.labels} stages={moves.map(v=>s.visual==="compare"?v:.55+.45*v)} moves={moves} blur={blur} phase={entry}/>
    </div>;
  };
  const pageIndex=p.pages.findIndex((words,i)=>t>=words[0].s-.02&&t<Math.min(p.pages[i+1]?.[0].s??Infinity,words[words.length-1].e+.22));
  const page=p.pages[pageIndex];const lineBreak=p.captionBreaks?.[pageIndex]??0;
  const lines=page?(lineBreak?[page.slice(0,lineBreak),page.slice(lineBreak)]:[page]):[];
  useLayoutEffect(()=>{
    if(!p.auditFrames?.includes(f))return;
    const handle=delayRender("scholarship layout audit");let finished=false;
    document.fonts.ready.then(()=>requestAnimationFrame(()=>{
      const elements=Array.from(document.querySelectorAll("[data-caption-line],svg text,[data-heading]>div,[data-logo]"));
      const metrics=elements.map(el=>{
        let opacity=1;let ancestor: Element|null=el;
        while(ancestor){opacity*=Number(getComputedStyle(ancestor).opacity);ancestor=ancestor.parentElement;}
        const rect=el.getBoundingClientRect();
        const matrix=el instanceof SVGGraphicsElement?el.getScreenCTM():null;
        const fontSize=parseFloat(getComputedStyle(el).fontSize)*(matrix?Math.hypot(matrix.a,matrix.b):1);
        return {text:el.textContent??"logo",x:rect.x,y:rect.y,w:rect.width,h:rect.height,opacity,
          fontSize:el.hasAttribute("data-logo")?null:fontSize,
          caption:el.hasAttribute("data-caption-line"),overflow:el.scrollWidth>el.clientWidth+1&&el.hasAttribute("data-caption-line")};
      });
      console.log("SCHOLARSHIP_QA "+JSON.stringify({frame:f,scene:scene.id,mode:scene.mode,metrics}));
      finished=true;continueRender(handle);
    })).catch(cancelRender);
    return()=>{if(!finished){finished=true;continueRender(handle);}};
  },[f,p.auditFrames,scene.id,scene.mode]);
  return <AbsoluteFill style={{backgroundColor:theme.black,color:theme.white,fontFamily:tok.font.judul.family}}>
    {!full&&<AbsoluteFill style={{top:p.layout.talentTop,overflow:"hidden"}}>
      {p.cutout?<Img src={staticFile(`${p.cutout.dir}/${String(f).padStart(6,"0")}.webp`)} style={{position:"absolute",width:p.W,height:p.H,objectFit:"contain",top:p.layout.talentOffset}}/>:
        <OffthreadVideo src={staticFile(p.footage)} muted style={{position:"absolute",width:p.W,height:p.H,objectFit:"cover",top:p.layout.talentOffset}}/>}
    </AbsoluteFill>}
    {!brand&&<Img data-logo src={staticFile(p.logo)} style={{position:"absolute",width:p.layout.logoW,height:72,objectFit:"contain",left:(p.W-p.layout.logoW)/2,top:p.layout.logoY}}/>}
    {full&&!brand&&<div data-heading style={{position:"absolute",top:425,left:108,right:120,textAlign:"center",fontWeight:800,fontSize:78,letterSpacing:-1.4,lineHeight:1.12,color:theme.gold}}>{scene.headline.map((line,i)=><div key={i}>{line}</div>)}</div>}
    {previous&&transition<1&&previous.visual!=="brand"&&artwork(previous,1-transition,true)}
    {!brand&&artwork(scene,p.scenes.indexOf(scene)===0?.35+.65*phase:transition)}
    {page&&!brand&&<div style={{position:"absolute",top:full?p.layout.captionFullY:p.layout.captionSplitY,left:108,right:120,minHeight:132,padding:full?"22px 28px 24px 34px":"20px 26px",borderRadius:full?12:28,border:`1px solid ${rgba(theme.gold,.5)}`,borderLeft:full?`7px solid ${theme.gold}`:undefined,background:full?`linear-gradient(110deg,${rgba(theme.gold,.065)},${theme.black})`:rgba(theme.black,.92),boxShadow:`0 10px 25px ${rgba(theme.black,.3)}`,fontFamily:tok.font.caption.family,fontSize:56,fontWeight:700,lineHeight:1.3,textAlign:full?"left":"center",letterSpacing:-.9}}>
      {lines.map((line,j)=><div key={j} data-caption-line style={{whiteSpace:"nowrap"}}>{line.map((w,i)=><React.Fragment key={`${w.s}-${i}`}><span style={{display:"inline-block",borderRadius:7,padding:"0 5px",color:t>=w.s&&t<w.e?theme.black:theme.white,backgroundColor:t>=w.s&&t<w.e?theme.gold:"transparent"}}>{w.w}</span>{i<line.length-1?" ":""}</React.Fragment>)}</div>)}
    </div>}
    {brand&&<Img src={staticFile(p.logo)} style={{position:"absolute",width:700,height:215,objectFit:"contain",left:190,top:800,opacity:phase,filter:`drop-shadow(0 0 12px ${rgba(theme.gold,.3)})`}}/>}
  </AbsoluteFill>;
};
