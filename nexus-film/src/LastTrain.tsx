import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {FontFaces} from './Fx';
import {HeroScene, DepartureScene, SnapScene, DecisionScene, ChapterScene, SignatureScene} from './Scenes';

export const FPS = 24;
export const DURATION = 480;

export const LastTrain: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces />
    <Sequence from={0} durationInFrames={72}><DepartureScene /></Sequence>
    <Sequence from={72} durationInFrames={72}><SnapScene /></Sequence>
    <Sequence from={240} durationInFrames={72}><DecisionScene /></Sequence>
    <Sequence from={312} durationInFrames={96}><ChapterScene /></Sequence>
    <Sequence from={408} durationInFrames={72}><SignatureScene /></Sequence>
    <Sequence from={144} durationInFrames={96}><HeroScene /></Sequence>
    <Audio src={staticFile('audio/mix.wav')} />
  </AbsoluteFill>
);
