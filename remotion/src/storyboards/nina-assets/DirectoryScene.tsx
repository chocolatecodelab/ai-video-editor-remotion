import React from 'react';
import type {SceneContext} from './types';
import {Asset,Talent,Paper} from './shared';
export const DirectoryScene:React.FC<{c:SceneContext}>=({c})=>{
 const opening=c.move(c.s.start,.8),release=c.move(c.s.anchors[0],1.1);
 return <><Asset c={c} name="dossier" x={60} y={590} w={670} angle={-7+5*opening}/>
  <Paper c={c} x={200+35*release} y={690-110*release} w={250} angle={-8+12*release} label={c.s.labels[0]} opacity={release}/>
  <Talent c={c} x={420} y={265} w={730}/></>;
};
