import React from 'react';
import type {SceneContext} from './types';
import {Asset,Label,Paper,Route} from './shared';
export const SelectionScene:React.FC<{c:SceneContext}>=({c})=>{
 const a=c.s.anchors.map(t=>c.move(t,.65));
 return <>
  <Asset c={c} name="dossier" x={40} y={710} w={500} angle={-5}/>
  <Paper c={c} x={270+45*a[0]} y={780-125*a[0]} w={265} angle={-12+8*a[0]} label={c.s.labels[3]}/>
  <Route c={c} d="M590 790H830V1180" progress={a[1]}/>
  {c.s.labels.slice(0,3).map((label,i)=><React.Fragment key={label}>
   <div style={{position:'absolute',left:807,top:810+i*145,width:44,height:44,border:`3px solid ${c.gold}`,borderRadius:50,
     background:a[i]>.7?c.gold:'#000',transform:`scale(${.85+.15*a[i]})`}}/>
   <Label c={c} text={label} x={550} y={869+i*145} size={42} accent opacity={.3+.7*a[i]}/>
  </React.Fragment>)}
 </>;
};
