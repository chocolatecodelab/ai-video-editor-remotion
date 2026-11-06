import React from "react";

/** Object artwork, not pictograms in identical cards. Text and palette are supplied by the project. */
export type ArtTheme = {gold: string; light: string; darkGold: string; white: string; black: string};
type Material = {metal: string; edge: string; ink: string; shadow: string; theme: ArtTheme};
const Stroke: React.FC<{d: string; m: Material; width?: number; opacity?: number}> = ({d,m,width=7,opacity=1}) =>
  <path d={d} fill="none" stroke={m.metal} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={opacity}/>;

const Paper: React.FC<{m: Material; label?: string; small?: boolean; draw?: number}> = ({m,label,small,draw=1}) => <g>
  <rect x={-127} y={-162} width={270} height={342} rx={13} fill={m.theme.darkGold} opacity={0.32}/>
  <rect x={-143} y={-178} width={270} height={342} rx={13} fill={m.ink} stroke={m.metal} strokeWidth={7}/>
  <path d="M -127 -160 H 110 V 147" fill="none" stroke={m.theme.light} strokeWidth={2} opacity={0.45}/>
  <path d="M 63 -178 V -121 H 127" fill={m.edge} stroke={m.metal} strokeWidth={4}/>
  <path d="M 63 -178 L 127 -121" stroke={m.theme.light} strokeWidth={3}/>
  {!small && <g opacity={draw}><path d="M -104 -45 H 70 M -104 -8 H 47 M -104 29 H 72" fill="none" stroke={m.metal} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1-draw}/><Stroke d="M -104 74 H 4" m={m} width={3} opacity={0.5}/></g>}
  {label && <text y={-70} x={-103} fill={m.theme.light} fontSize={104} fontWeight={800}>{label}</text>}
</g>;

const Cap: React.FC<{m: Material}> = ({m}) => <g>
  <path d="M -96 -10 V 69 Q 0 122 96 69 V -10" fill={m.edge} stroke={m.metal} strokeWidth={6}/>
  <path d="M -180 -38 L 0 -124 L 180 -38 L 0 48 Z" fill={m.metal} stroke={m.theme.light} strokeWidth={3}/>
  <path d="M -180 -38 V -24 L 0 62 L 180 -24 V -38 L 0 48 Z" fill={m.theme.darkGold}/>
  <path d="M -160 -38 L 0 -111 L 160 -38" fill="none" stroke={m.theme.light} strokeWidth={3} opacity={0.55}/>
  <path d="M 0 -38 L 125 -4 V 117" fill="none" stroke={m.theme.light} strokeWidth={7}/>
  <path d="M 125 100 L 112 148 H 139 Z" fill={m.metal}/>
  <ellipse cx={0} cy={-38} rx={11} ry={5} fill={m.theme.white}/>
</g>;

const Book: React.FC<{m: Material; open?: number}> = ({m,open=1}) => <g transform={`scale(${.16+.84*open} 1)`}>
  <path d="M -140 -111 Q -68 -147 0 -104 Q 68 -147 140 -111 V 115 Q 65 80 0 124 Q -65 80 -140 115 Z" fill={m.edge} stroke={m.metal} strokeWidth={7}/>
  <path d="M -128 -123 Q -59 -153 0 -112 Q 59 -153 128 -123 V 94 Q 60 66 0 110 Q -60 66 -128 94 Z" fill={m.ink} stroke={m.metal} strokeWidth={4}/>
  <path d="M 0 -112 V 110" stroke={m.theme.light} strokeWidth={5}/>
  {[-58,-17,24,65].map(y=><path key={y} d={`M -105 ${y} Q -58 ${y-12} -25 ${y+5} M 25 ${y+5} Q 58 ${y-12} 105 ${y}`} stroke={m.theme.light} strokeWidth={4} opacity={0.6} fill="none"/>)}
</g>;

const Campus: React.FC<{m: Material}> = ({m}) => <g>
  <path d="M -180 92 L -180 -69 L 0 -165 L 180 -69 V 92 Z" fill={m.ink}/>
  <path d="M 180 -69 L 220 -43 V 118 L 180 92 Z" fill={m.edge} stroke={m.theme.darkGold} strokeWidth={5}/>
  <path d="M -192 -68 L 0 -173 L 192 -68 Z" fill={m.metal} stroke={m.theme.light} strokeWidth={4}/>
  <path d="M -145 -80 L 0 -151 L 145 -80 Z" fill={m.ink} stroke={m.theme.gold} strokeWidth={3}/>
  <path d="M -190 -62 H 190 V -39 H -190 Z" fill={m.edge} stroke={m.metal} strokeWidth={4}/>
  {[-135,-45,45,135].map(x=><g key={x}><path d={`M ${x-19} -28 H ${x+19} L ${x+15} 98 H ${x-15} Z`} fill={m.metal}/><path d={`M ${x-6} -20 V 91`} stroke={m.theme.light} strokeWidth={3} opacity={0.5}/><path d={`M ${x-26} -31 H ${x+26} M ${x-24} 100 H ${x+24}`} stroke={m.metal} strokeWidth={9}/></g>)}
  <path d="M -190 112 H 190 M -208 133 H 208 M -226 154 H 226" stroke={m.metal} strokeWidth={12}/>
  <path d="M -226 162 H 226 L 262 184 H -190 Z" fill={m.theme.darkGold} opacity={0.5}/>
</g>;

const Calendar: React.FC<{m: Material; open?: number}> = ({m,open=1}) => <g>
  <rect x={-154} y={-147} width={326} height={310} rx={18} fill={m.edge} stroke={m.theme.darkGold} strokeWidth={6}/>
  <rect x={-174} y={-165} width={326} height={310} rx={18} fill={m.ink} stroke={m.metal} strokeWidth={7}/>
  <path d="M -174 -98 H 152" stroke={m.metal} strokeWidth={7}/>
  {[-108,85].map(x=><g key={x}><rect x={x} y={-192} width={16} height={53} rx={8} fill={m.metal}/></g>)}
  <path d="M 90 145 V 85 H 152 Z" fill={m.metal}/>
  <g transform="translate(-10 26) scale(.53)"><Book m={m} open={open}/></g>
  <path d="M 66 -32 A 26 26 0 0 1 116 -32 M 91 -72 V -59 M 56 -58 L 64 -49 M 127 -58 L 119 -49" fill="none" stroke={m.theme.light} strokeWidth={5}/>
</g>;

const Lens: React.FC<{m: Material}> = ({m}) => <g>
  <circle r={80} fill={m.ink} stroke={m.edge} strokeWidth={25}/><circle r={80} fill="none" stroke={m.metal} strokeWidth={9}/>
  <path d="M -49 -33 A 60 60 0 0 1 29 -54" stroke={m.theme.light} opacity={0.6} strokeWidth={5} fill="none"/>
  <path d="M 58 63 L 132 141" stroke={m.theme.darkGold} strokeWidth={34} strokeLinecap="round"/>
  <path d="M 58 59 L 132 137" stroke={m.metal} strokeWidth={22} strokeLinecap="round"/>
</g>;

const Laurels: React.FC<{m: Material}> = ({m}) => <g>
  <Stroke d="M -10 85 C -103 72 -127 -25 -72 -86 M 10 85 C 103 72 127 -25 72 -86" m={m} width={5}/>
  {[-1,1].map(side=><g key={side} transform={`scale(${side} 1)`}>{[-55,-15,25,60].map((y,i)=><path key={y} d={`M ${78-i*3} ${y+24} Q ${129-i*3} ${y+5} ${104-i*3} ${y-23} Q ${63-i*3} ${y-12} ${78-i*3} ${y+24}`} fill={m.metal}/>)}</g>)}
  <path d="M 0 -45 L 18 -9 L 58 -3 L 29 26 L 36 65 L 0 46 L -36 65 L -29 26 L -58 -3 L -18 -9 Z" fill={m.metal}/>
</g>;

const Checks: React.FC<{m: Material; reveal?: number}> = ({m,reveal=1}) => <g><Paper m={m} small/>
  {[-70,0,70].map((y,i)=><g key={y}><path d={`M -90 ${y} L -75 ${y+17} L -48 ${y-17}`} fill="none" stroke={m.theme.light} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1-Math.max(0,Math.min(1,reveal*3-i))}/><path d={`M -15 ${y} H 70`} stroke={m.metal} strokeWidth={6}/></g>)}
</g>;

export const ScholarshipArt: React.FC<{kind: string; theme: ArtTheme; labels: string[]; stages: number[]; uid: string; phase: number; moves?: number[]; blur?: number[]}> = ({kind,theme,labels,stages,uid,phase,moves=[],blur=[]}) => {
  const action=(i: number)=>moves[i]??phase;
  const m: Material={metal:`url(#${uid}-metal)`,edge:`url(#${uid}-edge)`,ink:`url(#${uid}-ink)`,shadow:`url(#${uid}-shadow)`,theme};
  const label=(i: number,x: number,y: number,size=42)=><text x={x} y={y} textAnchor="middle" fill={theme.white} fontSize={size} fontWeight={700}>{labels[i]}</text>;
  const pedestal=(x: number,y: number,rx=155)=><ellipse cx={x} cy={y} rx={rx} ry={22} fill={theme.gold} opacity={0.08}/>;
  return <svg width="100%" height="100%" viewBox="-460 -290 920 580" overflow="visible" aria-label={kind}>
    <defs>
      <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={theme.gold}/><stop offset=".48" stopColor={theme.light}/><stop offset="1" stopColor={theme.darkGold}/></linearGradient>
      <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={theme.darkGold}/><stop offset=".6" stopColor={theme.black}/><stop offset="1" stopColor={theme.gold}/></linearGradient>
      <linearGradient id={`${uid}-ink`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={theme.black}/><stop offset=".5" stopColor={theme.black}/><stop offset="1" stopColor={theme.darkGold} stopOpacity={.24}/></linearGradient>
      {[0,1,2].map(i=><filter key={i} id={`${uid}-travel-${i}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={`${blur[i]??0} ${(blur[i]??0)*.18}`}/></filter>)}
    </defs>
    {kind==="aperture" && <>
      {pedestal(0,220,300)}
      <g transform={`translate(${-182-65*(1-phase)} ${42+45*(1-phase)}) rotate(${-13-12*(1-phase)}) scale(.8)`}><Paper m={m} label={labels[0]} draw={phase}/></g>
      <g transform={`translate(${93+38*(1-phase)} ${-42-65*(1-phase)}) rotate(${7+10*(1-phase)}) scale(1.05)`}><Cap m={m}/></g>
      <g transform={`translate(${244+48*(1-action(0))} ${143+37*(1-action(0))})`} opacity={action(0)}><circle r={68} fill={m.edge} stroke={m.metal} strokeWidth={7}/><circle r={54} fill="none" stroke={theme.gold} strokeWidth={2}/><text textAnchor="middle" y={24} fill={theme.light} fontSize={69} fontWeight={600}>€</text></g>
    </>}
    {kind==="directory" && <>
      {pedestal(5,223,277)}
      <g transform={`translate(${60+35*phase} ${-1-52*phase}) rotate(${10+5*phase})`}><Paper m={m} draw={phase}/></g>
      <path d="M -257 -138 V -191 Q -257 -204 -242 -204 H -73 L -39 -167 H 213 Q 229 -167 229 -148 V 185 H -257 Z" fill={m.edge} stroke={m.metal} strokeWidth={7}/>
      <path d={`M -258 ${-116+40*(1-phase)} H 256 L 211 207 H -290 Z`} fill={m.ink} stroke={m.metal} strokeWidth={7}/>
      <path d="M -235 -97 H 230" stroke={theme.light} strokeWidth={3} opacity={.6}/>
      <text x={-6} y={23} textAnchor="middle" fontWeight={800} fontSize={85} fill={theme.light}>{labels[0]}</text>
      <path d="M -165 89 H 133 M -165 119 H 73" stroke={m.metal} strokeWidth={5} opacity={.7}/>
    </>}
    {kind==="branches" && <>
      <path d="M -276 84 Q -276 164 0 164 Q 276 164 276 84" fill="none" stroke={m.metal} strokeWidth={5} opacity={.4}/>
      <g opacity={stages[0]} transform={`translate(${-277+26*(1-action(0))} ${-38+22*(1-action(0))}) scale(.82)`}><Cap m={m}/>{label(0,0,220,54)}</g>
      <g opacity={stages[1]} transform={`translate(0 ${28+18*(1-action(1))}) scale(.81)`}><Book m={m} open={.65+.35*action(1)}/>{label(1,0,220,54)}</g>
      <g opacity={stages[2]} transform={`translate(${267-22*(1-action(2))} ${-39+22*(1-action(2))}) scale(.77)`}><g transform="translate(-20 -10) scale(.72)"><Paper m={m}/></g><g transform={`translate(${24-30*(1-action(2))} ${30-20*(1-action(2))}) scale(.7)`}><Lens m={m}/></g>{label(2,0,240,57)}</g>
    </>}
    {kind==="calendar" && <>
      {pedestal(10,227,270)}
      <g transform={`translate(${190+50*(1-action(0))} -15) rotate(11) scale(.6)`} opacity={action(0)}><Book m={m} open={action(0)}/></g>
      <g transform={`translate(-55 ${16*(1-phase)}) rotate(${-6-7*(1-phase)})`}><Calendar m={m} open={phase}/></g>
    </>}
    {kind==="compare" && <>
      <g filter={`url(#${uid}-travel-0)`} transform={`translate(${-263*action(0)} 0) scale(${1-.22*action(0)})`}><Calendar m={m}/><g opacity={action(0)}>{label(0,0,244,56)}</g></g>
      <g filter={`url(#${uid}-travel-0)`} transform={`translate(${250+115*(1-action(0))} 7) scale(.78)`} opacity={action(0)}><g transform="scale(.75)"><Campus m={m}/></g>{label(1,0,244,56)}</g>
      <g opacity={stages[0]}><path d="M -48 -18 H 48 M -48 20 H 48 M 27 -65 L -27 66" fill="none" stroke={m.metal} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1-action(0)}/></g>
    </>}
    {kind==="campus" && <>
      {pedestal(20,219,309)}<g transform={`translate(${85*phase} -2)`}><Campus m={m}/></g>
      <g transform={`translate(${-236-75*(1-action(0))} 103) rotate(-11) scale(.54)`} opacity={action(0)}><Paper m={m} label={labels[0]} draw={action(0)}/></g>
    </>}
    {kind==="selection" && <>
      <path d="M -283 83 Q -270 160 0 160 Q 270 160 283 83" fill="none" stroke={m.metal} strokeWidth={5} opacity={.45}/>
      <g transform={`translate(${-285+90*(1-action(0))} -24) scale(.77)`} opacity={action(0)}><Laurels m={m}/>{label(0,0,229,57)}</g>
      <g transform={`translate(0 18) scale(${.84-.18*action(0)})`} opacity={Math.max(.78,stages[1])}><Checks m={m} reveal={action(1)}/><g opacity={action(1)}>{label(1,0,310,70)}</g></g>
      <g filter={`url(#${uid}-travel-2)`} transform={`translate(${-25+303*action(2)} ${-34-48*Math.sin(Math.PI*action(2))}) scale(.75)`} opacity={action(2)}><Lens m={m}/><g opacity={action(2)}>{label(2,0,248,58)}</g></g>
    </>}
    {kind==="plan" && <>
      {pedestal(0,229,307)}
      <g transform={`translate(${160-95*(1-phase)} ${-32+55*(1-phase)}) rotate(${13*phase}) scale(.88)`}><Paper m={m} draw={phase}/></g>
      <g transform={`translate(${-121+55*(1-phase)} -4) rotate(${-8*phase}) scale(.95)`}><Checks m={m} reveal={action(0)}/></g>
      <path d="M -289 128 Q -163 104 0 154 Q 163 104 289 128 V 176 Q 163 151 0 201 Q -163 151 -289 176 Z" fill={m.edge} stroke={m.metal} strokeWidth={6}/>
      <path d="M 0 154 V 201" stroke={theme.light} strokeWidth={5}/>
    </>}
    {kind==="cta" && <>
      <g transform={`translate(${-109-110*(1-phase)} ${-18-34*(1-phase)}) rotate(-34)`}><rect x={-131} y={-59} width={262} height={118} rx={59} fill={m.edge} stroke={m.metal} strokeWidth={20}/><path d="M -77 -43 H 70" fill="none" stroke={theme.light} strokeWidth={4} opacity={.7}/></g>
      <g transform={`translate(${104+110*(1-phase)} ${36+34*(1-phase)}) rotate(-34)`}><rect x={-131} y={-59} width={262} height={118} rx={59} fill={m.ink} stroke={m.metal} strokeWidth={20}/><path d="M -77 -43 H 70" fill="none" stroke={theme.light} strokeWidth={4} opacity={.7}/></g>
      <text x={0} y={225} textAnchor="middle" fill={theme.white} fontSize={54} fontWeight={800}>{labels[0]}</text>
    </>}
  </svg>;
};
