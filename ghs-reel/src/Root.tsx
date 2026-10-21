import React from 'react';
import {Composition} from 'remotion';
import {GhsReel} from './GhsReel';
import {FPS, TOTAL} from './theme';

export const Root: React.FC = () => (
  <Composition id="GhsReel" component={GhsReel} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
);
