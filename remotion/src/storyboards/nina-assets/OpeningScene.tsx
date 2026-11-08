import React from 'react';
import type {SceneContext} from './types';
import {Asset,Talent,Route} from './shared';
export const OpeningScene:React.FC<{c:SceneContext}>=({c})=>{
  const enter=c.move(c.s.start,.9),focus=c.move(c.s.anchors[0],.65);
  return <>
    <Asset c={c} name="campus" x={35-40*(1-enter)} y={590+45*(1-enter)} w={710} angle={-3+2*focus}/>
    <Route c={c} d="M130 1250H490Q535 1250 535 1200V1140" progress={focus}/>
    <Talent c={c} x={405} y={200} w={760}/>
  </>;
};
