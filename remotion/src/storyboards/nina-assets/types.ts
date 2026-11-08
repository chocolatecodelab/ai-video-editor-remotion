import type {Tokens} from '../../lib/kontrak';

export type Word = {text:string; startMs:number; endMs:number; timestampMs:number|null; confidence:number|null};
export type CaptionPage = {start:number; end:number; lines:Word[][]};
export type Scene = {id:string; kind:string; start:number; end:number; mode:'full'|'talent'|'split';
  kicker:string; title:string[]; labels:string[]; anchors:number[]; sample:number; motion:string; transition:string};
export type ReviewProps = {tokens:Tokens; scenes:Scene[]; captions:CaptionPage[]; logo:string;
  assets:Record<string,string>; cutoutDir:string; cutoutFrames:number[]; duration:number;
  auditFrames:number[]; layout:{logoY:number; titleY:number; captionY:number; talentBottom:number; side:number; textWidth:number};};
export type SceneContext = {p:ReviewProps; s:Scene; t:number; frame:number; gold:string; light:string; darkGold:string; white:string;
  family:string; body:string; move:(anchor:number,duration?:number)=>number;};
