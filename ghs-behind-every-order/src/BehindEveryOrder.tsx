import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Scene} from './Scene';
import {C, CUES} from './theme';
import {S1Questions} from './scenes/S1Questions';
import {S2Factory} from './scenes/S2Factory';
import {S3Spec} from './scenes/S3Spec';
import {S4Process} from './scenes/S4Process';
import {S5Quality} from './scenes/S5Quality';
import {S6Close} from './scenes/S6Close';

const [a, b, c, d, e, f, g] = CUES.scenes;

export const BehindEveryOrder: React.FC = () => (
  <AbsoluteFill style={{background: C.carbon}}>
    <Scene from={a} to={b} bg="#0c0d0c" scan={false}><S1Questions /></Scene>
    <Scene from={b} to={c}><S2Factory /></Scene>
    <Scene from={c} to={d}><S3Spec /></Scene>
    <Scene from={d} to={e}><S4Process /></Scene>
    <Scene from={e} to={f}><S5Quality /></Scene>
    <Scene from={f} to={g} bg={C.porcelain} scan={false}><S6Close /></Scene>
    <Audio src={staticFile('audio/final.wav')} />
  </AbsoluteFill>
);
