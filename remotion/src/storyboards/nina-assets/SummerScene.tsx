import React from 'react';
import type {SceneContext} from './types';
import {Asset,Calendar,Talent} from './shared';
export const SummerScene:React.FC<{c:SceneContext}>=({c})=>{
 const page=c.move(c.s.anchors[0],.85);
 return <><Asset c={c} name="study" x={565} y={900} w={370} angle={8}/>
  <Calendar c={c} x={515} y={625} w={390} phase={page}/>
  <Talent c={c} x={-100} y={210} w={770}/></>;
};
