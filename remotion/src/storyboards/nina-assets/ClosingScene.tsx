import React from 'react';
import type {SceneContext} from './types';
import {Talent,Route} from './shared';
export const ClosingScene:React.FC<{c:SceneContext}>=({c})=>{
 const focus=c.move(c.s.anchors[0],.7);
 return <><Talent c={c} x={55} y={210} w={940}/>
  <Route c={c} d="M810 845V690H670" progress={focus}/>
  <div data-art-label style={{position:'absolute',left:235,top:630,width:610,padding:'28px 32px',boxSizing:'border-box',textAlign:'center',
    color:'#171006',background:`linear-gradient(100deg,${c.gold},${c.light},${c.darkGold})`,fontSize:56,fontWeight:800,
    borderRadius:5,boxShadow:'0 8px 0 #6B501C',transform:`translateY(${16*(1-focus)}px)`}}>{c.s.labels[0]}</div>
 </>;
};
