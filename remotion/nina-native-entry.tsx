import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {NinaNativeReview} from './src/storyboards/NinaNativeReview';
import type {ReviewProps} from './src/storyboards/nina-assets/types';
import props from '../proyek/2026-11_otca-nina-referensi-08/storyboard-props-r3.json';
const Root:React.FC=()=> <Composition id="OtcaNinaNative" component={NinaNativeReview} width={1080} height={1920} fps={30} durationInFrames={1547} defaultProps={props as unknown as ReviewProps}/>;
registerRoot(Root);
