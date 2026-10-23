import {Composition, Still} from 'remotion';
import {GHSReel, FPS, TOTAL} from './GHSReel';
import {Cover} from './Cover';

export const Root = () => (
  <>
    <Composition id="GHSReel" component={GHSReel} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
  </>
);
