import React from 'react';
import {Composition} from 'remotion';
import {GHSCommercial} from './GHSCommercial';
import {W, H, FPS, TOTAL} from './styles/brand';

import manifest from './audio/manifest.json';

// Final deliverable uses real VO recordings when they exist (audio/vo/vo_NN.wav → npm run audio:vo), otherwise music + SFX only.
const finalVo = 'real' in manifest ? 'real' : 'none';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="GHSCommercial" component={GHSCommercial} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{voMode: finalVo as 'real' | 'none'}} />
    {/* Timing/ducking preview with a robotic scratch voice. NOT a deliverable voice-over. */}
    <Composition id="GHSCommercial-ScratchVO" component={GHSCommercial} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{voMode: 'scratch' as const}} />
  </>
);
