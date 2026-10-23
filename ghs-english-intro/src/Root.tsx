import React from 'react';
import {Composition} from 'remotion';
import {GHSIntro} from './GHSIntro';
import {FPS, TOTAL_FRAMES} from './timeline';

export const Root: React.FC = () => (
  <Composition
    id="GHSIntro"
    component={GHSIntro}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
