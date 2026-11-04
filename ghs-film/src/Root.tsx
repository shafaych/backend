import {Composition} from 'remotion';
import {Main} from './Main';
import {TOTAL} from './timeline';
export const Root = () => (
  <Composition id="GHS" component={Main} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
