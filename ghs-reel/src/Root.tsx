import {Composition} from 'remotion';
import {GHSReel} from './GHSReel';
import {FPS, H, TOTAL, W} from './theme';

export const Root = () => (
  <Composition id="GHSReel" component={GHSReel} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
