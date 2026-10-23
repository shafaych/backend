import React from 'react';
import {Composition, Still} from 'remotion';
import {Commercial} from './Commercial';
import {Cover} from './Cover';
import {FPS, W, H, TOTAL} from './common';

export const Root: React.FC = () => (
  <>
    <Composition id="GHSCommercial" component={Commercial} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Still id="GHSCover" component={Cover} width={W} height={H} />
  </>
);
