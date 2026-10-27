import {Composition, Still} from 'remotion';
import {LastTrain, FPS, DURATION} from './LastTrain';
import {Cover} from './Cover';

export const Root = () => (
  <>
    <Composition id="LastTrain" component={LastTrain} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
  </>
);
