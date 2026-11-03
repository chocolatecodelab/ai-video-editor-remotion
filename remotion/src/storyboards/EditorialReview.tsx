import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SplitReel, SplitReelProps } from "../split/SplitReel";
import { PUSTAKA } from "../split/Adegan";
import { ambilWarna } from "../split/Ikon";
import { pakaiFontToken } from "../lib/font";

export type EditorialScene = {
  id: string; mulai: number; selesai: number; mode: "split" | "full";
  judul: string[]; modul: string; pusat_asal: [number, number]; pusat_tujuan: [number, number];
  skala: number; caption_y: number; label?: string; logo_saja?: boolean;
};
export type EditorialReviewProps = SplitReelProps & { editorial: EditorialScene[] };

/** Storyboard composition: reuse scene artwork, explicitly compose opaque full-frame cutaways. */
export const EditorialReview: React.FC<EditorialReviewProps> = (pr) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const tok = pakaiFontToken(pr.tokens);
  const wr = ambilWarna(tok);
  const scene = pr.editorial.find((s) => t >= s.mulai && t < s.selesai);
  const full = scene?.mode === "full" ? scene : undefined;
  const a = pr.adegan.find((item) => item.modul === full?.modul && t >= item.mulai && t < item.selesai);
  const Module = full ? PUSTAKA[full.modul] : undefined;
  const pages: typeof pr.kata[] = [];
  for (const word of pr.kata) {
    const last = pages[pages.length - 1];
    if (!last || last.length >= 5 || word.s - last[last.length - 1].e > 0.35 || last.map((w) => w.w).join(" ").length + word.w.length > 38) pages.push([word]);
    else last.push(word);
  }
  const page = pages.find((words, i) => t >= words[0].s - 0.04 && t < Math.min(pages[i + 1]?.[0].s ?? Infinity, words[words.length - 1].e + 0.25));
  const reveal = full ? interpolate(frame, [full.mulai * fps, (full.mulai + 0.22) * fps], [0.35, 1], {extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.out(Easing.cubic)}) : 0;
  return <AbsoluteFill>
    {!full && <SplitReel {...pr} />}
    {full && <AbsoluteFill style={{backgroundColor:wr.latar, color:wr.teks, fontFamily:tok.font.judul.family}}>
      <svg width={0} height={0}><defs>
        <linearGradient id="ot-emas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={wr.aksen}/><stop offset="0.5" stopColor={wr.aksen2}/><stop offset="1" stopColor={wr.bahaya}/></linearGradient>
        <radialGradient id="sr-cahaya"><stop offset="0" stopColor={wr.aksen} stopOpacity={0.45}/><stop offset="1" stopColor={wr.aksen} stopOpacity={0}/></radialGradient>
        <radialGradient id="sr-cahaya2"><stop offset="0" stopColor={wr.aksen2} stopOpacity={0.45}/><stop offset="1" stopColor={wr.aksen2} stopOpacity={0}/></radialGradient>
        <filter id="sr-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs></svg>
      {/* Fully opaque scene: no talent or source wall beneath the graphics. */}
      <AbsoluteFill style={{background:`radial-gradient(ellipse at 50% 50%, ${wr.aksen}12, transparent 65%)`}} />
      <div style={{position:"absolute",inset:0,opacity:reveal}}>
        {pr.logo && <Img src={staticFile(pr.logo.src)} style={{position:"absolute",width:full.logo_saja ? 660 : 235,left:pr.W/2-(full.logo_saja?330:117.5),top:full.logo_saja ? 700 : 270}} />}
        {!full.logo_saja && <>
          <div style={{position:"absolute",left:108,right:120,top:400,textAlign:"center",fontSize:64,fontWeight:800,lineHeight:1.1,letterSpacing:-1.4}}>
            {full.judul.map((line,i)=><div key={i} style={{color:i===full.judul.length-1?wr.aksen2:wr.teks}}>{line}</div>)}
          </div>
          {Module && a && <svg width={pr.W} height={pr.H} viewBox={`0 0 ${pr.W} ${pr.H}`} style={{position:"absolute",inset:0}}>
            <g transform={`translate(${full.pusat_tujuan[0]} ${full.pusat_tujuan[1]}) scale(${full.skala}) translate(${-full.pusat_asal[0]} ${-full.pusat_asal[1]})`}>
              <Module k={{f:frame,fps,tok,a,p:{W:pr.W,tinggi:pr.H,cx:pr.W/2,atas:350,bawah:1520}}} wr={wr} font={tok.font.judul.family}/>
            </g>
          </svg>}
          {full.label && <div style={{position:"absolute",left:108,right:120,top:1310,textAlign:"center",fontFamily:tok.font.isi.family,fontSize:40,color:wr.aksen2}}>{full.label}</div>}
          {page && <div style={{position:"absolute",top:Math.min(full.caption_y, pr.H - 530),left:108,right:120,textAlign:"center",fontFamily:tok.font.caption.family,fontWeight:700,fontSize:48,lineHeight:1.25,textShadow:"0 3px 12px #000"}}>
            {page.map((w,i)=><React.Fragment key={`${w.s}-${i}`}><span style={{color:t>=w.s&&t<w.e?wr.aksen2:wr.teks}}>{w.w}</span>{" "}</React.Fragment>)}
          </div>}
        </>}
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>;
};
