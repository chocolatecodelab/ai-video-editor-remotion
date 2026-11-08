import React from 'react';
import type {SceneContext} from './types';
import {Asset,Talent,Route} from './shared';
export const PlanningScene:React.FC<{c:SceneContext}>=({c})=>{
 const arrange=c.move(c.s.anchors[0],1.1);
 return <><Asset c={c} name="campus" x={540} y={655} w={430} angle={4-4*arrange}/>
  <Asset c={c} name="study" x={560} y={990-45*arrange} w={330} angle={-6+5*arrange}/>
  <Route c={c} d="M690 1030V920H790" progress={arrange}/>
  <Talent c={c} x={-80} y={145} w={860}/></>;
};
