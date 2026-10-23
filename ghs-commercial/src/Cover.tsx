import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, Grade, Preload, Scrim} from './common';
import {JerseyShot} from './Jersey';

export const Cover: React.FC = () => (
  <Preload>
    <Grade vignette={0.55}>
      <JerseyShot d="voltage" len={1} focus={[540, 1040]} z={[1.04, 1.04]} seed={3} sweep={0.5} />
      <Scrim strength={0.75} height={700} />
      <div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter', fontWeight: 600, fontSize: 40, letterSpacing: '0.5em', paddingLeft: '0.5em', color: C.porcelain}}>GHS CUSTOM GEAR</div>
      <div style={{position: 'absolute', bottom: 330, left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter', fontWeight: 600, fontSize: 84, letterSpacing: '0.1em', color: C.porcelain, lineHeight: 1.1}}>MADE WITH<br />INTENTION.</div>
      <div style={{position: 'absolute', bottom: 270, left: '50%', width: 140, marginLeft: -70, height: 4, background: C.lime}} />
    </Grade>
  </Preload>
);
