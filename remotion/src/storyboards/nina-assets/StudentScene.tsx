import React from 'react';
import type {SceneContext} from './types';
import {Asset,Talent} from './shared';
export const StudentScene:React.FC<{c:SceneContext}>=({c})=>{
 const push=c.move(c.s.start,2.7);
 return <><Asset c={c} name="campus" x={-70} y={560} w={920} scale={1+.035*push} opacity={.48}/>
  <Talent c={c} x={40-14*push} y={125-8*push} w={980+28*push}/></>;
};
