import React from 'react';
import type {SceneContext} from './types';
import {Asset,Label,Route} from './shared';
export const FundingScene:React.FC<{c:SceneContext}>=({c})=>{
 const p=c.move(c.s.start,1.2),a=c.s.anchors.map(t=>c.move(t,.8));
 return <>
  <Asset c={c} name="study" x={80} y={690+65*(1-p)} w={580} angle={-5+4*p}/>
  <Route c={c} d="M340 800V700Q340 660 390 660H780" progress={a[0]}/>
  <Route c={c} d="M640 850H860V930" progress={a[1]}/>
  <Route c={c} d="M350 1160V1260H760" progress={a[2]}/>
  <Label c={c} text={c.s.labels[0]} x={640} y={595} size={44} accent opacity={a[0]}/>
  <Label c={c} text={c.s.labels[1]} x={680} y={947} size={44} accent opacity={a[1]}/>
  <Label c={c} text={c.s.labels[2]} x={620} y={1270} size={46} accent opacity={.25+.75*a[2]}/>
 </>;
};
