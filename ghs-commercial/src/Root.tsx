import React from 'react';
import {Composition} from 'remotion';
import {Commercial} from './Commercial';
export const FPS = 30;
export const DURATION = 22 * FPS;
export const Root: React.FC = () => (
  <Composition id="GHS" component={Commercial} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
);
