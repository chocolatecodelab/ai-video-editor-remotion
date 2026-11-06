import React from "react";
import {Composition, registerRoot} from "remotion";
import {ScholarshipReel, ScholarshipProps} from "./src/storyboards/ScholarshipReel";
import data from "../proyek/2026-11_otca-nina-beasiswa-s1/storyboard-props-r2.json";
const Root: React.FC = () => <Composition id="OtcaNinaScholarship" component={ScholarshipReel}
  width={1080} height={1920} fps={30} durationInFrames={1547}
  defaultProps={data as unknown as ScholarshipProps}
  calculateMetadata={({props}: {props: ScholarshipProps})=>({width:props.W,height:props.H,fps:props.fps,durationInFrames:props.durasiFrame})}/>;
registerRoot(Root);
