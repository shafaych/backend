import React from 'react';
import {Composition, Still} from 'remotion';
import {Commercial} from './Commercial';
import {Cover} from './Cover';
import {Preload} from './common';
import {JerseySVG, Design} from './Jersey';
import {FPS, W, H, TOTAL} from './common';

const Bake: React.FC<{d: Design; seed: number}> = ({d, seed}) => (
  <Preload><JerseySVG d={d} cell={12} seed={seed} /></Preload>
);

export const Root: React.FC = () => (
  <>
    <Composition id="GHSCommercial" component={Commercial} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Still id="BakeVoltage" component={() => <Bake d="voltage" seed={3} />} width={W} height={H} />
    <Still id="BakeGrid" component={() => <Bake d="grid" seed={8} />} width={W} height={H} />
    <Still id="BakeContour" component={() => <Bake d="contour" seed={14} />} width={W} height={H} />
    <Still id="BakeSplit" component={() => <Bake d="split" seed={21} />} width={W} height={H} />
    <Still id="GHSCover" component={Cover} width={W} height={H} />
  </>
);
