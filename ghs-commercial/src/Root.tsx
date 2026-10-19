import React from 'react';
import {Composition} from 'remotion';
import {GHSCommercial} from './GHSCommercial';
import {W, H, FPS, TOTAL} from './styles/brand';

export const RemotionRoot: React.FC = () => (
  <Composition id="GHSCommercial" component={GHSCommercial} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
