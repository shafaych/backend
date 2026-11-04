import {Composition} from 'remotion';
import {Film} from './Film';
import {TOTAL_FRAMES, FPS} from './timeline';
export const Root = () => (
  <Composition id="GHS" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
);
