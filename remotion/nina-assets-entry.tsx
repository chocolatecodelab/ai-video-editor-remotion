import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {NinaAssetReview} from './src/storyboards/nina-assets/NinaAssetReview';
import type {ReviewProps} from './src/storyboards/nina-assets/types';
import data from '../proyek/2026-11_otca-nina-referensi-08/storyboard-props-r2.json';

const Root:React.FC=()=> <Composition id="OtcaNinaAssets" component={NinaAssetReview}
 width={1080} height={1920} fps={30} durationInFrames={1547}
 defaultProps={data as unknown as ReviewProps}/>;
registerRoot(Root);
