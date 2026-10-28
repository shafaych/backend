import React from 'react';
import {Composition} from 'remotion';
import {GhsReel, TOTAL_FRAMES} from './Reel';

export const Root: React.FC = () => (
  <Composition id="GhsReel" component={GhsReel} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
);
