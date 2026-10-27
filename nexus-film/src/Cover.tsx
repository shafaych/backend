import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {HeroScene} from './Scenes';
import {C} from './palette';
import {FontFaces} from './Fx';

export const Cover = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces />
    <Sequence from={-62}><HeroScene /></Sequence>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,8,14,0.85) 0%, rgba(4,8,14,0) 22%, rgba(4,8,14,0) 80%, rgba(4,8,14,0.8) 100%)'}} />
    <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center', color: C.ivory, fontFamily: 'Fraunces', fontWeight: 500, fontSize: 84, lineHeight: 1.05}}>LAST TRAIN.<br />FIRST CHAPTER.</div>
    <div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', color: C.ivory, fontFamily: 'InterX', fontWeight: 600, fontSize: 32, letterSpacing: '0.46em', paddingLeft: '0.46em'}}>NEXUS JACKET</div>
  </AbsoluteFill>
);
