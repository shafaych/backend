import React from 'react';
import {Composition} from 'remotion';
import {BehindEveryOrder} from './BehindEveryOrder';

export const FPS = 30;
export const DURATION = 1500;

export const Root: React.FC = () => (
  <Composition
    id="BehindEveryOrder"
    component={BehindEveryOrder}
    durationInFrames={DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
