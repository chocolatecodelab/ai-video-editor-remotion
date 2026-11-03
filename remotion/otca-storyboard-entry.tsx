import React from "react";
import { Composition, registerRoot } from "remotion";
import { EditorialReview, EditorialReviewProps } from "./src/storyboards/EditorialReview";
import storyboard from "../proyek/2026-11_otca-sertifikat-premium/production-props.json";

const Root: React.FC = () => <Composition id="OtcaEditorialReview" component={EditorialReview}
  width={1080} height={1920} fps={30} durationInFrames={1760}
  defaultProps={storyboard as unknown as EditorialReviewProps}
  calculateMetadata={({props}: {props: EditorialReviewProps}) => ({width:props.W,height:props.H,fps:props.fps,durationInFrames:props.durasiFrame})} />;
registerRoot(Root);
