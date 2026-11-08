import React from 'react';
import type {SceneContext} from './types';
import {Asset,Label,Route} from './shared';
export const ComparisonScene:React.FC<{c:SceneContext}>=({c})=>{
 const apart=c.move(c.s.anchors[0],1);
 return <>
  <Asset c={c} name="study" x={140-65*apart} y={600} w={480} angle={-8*apart}/>
  <Asset c={c} name="campus" x={395+55*apart} y={850} w={500} angle={4*apart}/>
  <Route c={c} d="M180 1190L840 760" progress={apart}/>
  <Label c={c} text={c.s.labels[0]} x={108} y={1110} size={38} accent/>
  <Label c={c} text={c.s.labels[1]} x={610} y={805} size={38} accent/>
 </>;
};
