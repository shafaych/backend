import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, SCENES, WIPE} from './styles/brand';
import {Wipe, WipeKind} from './components/Wipe';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2Customization} from './scenes/Scene2Customization';
import {Scene3Manufacturing} from './scenes/Scene3Manufacturing';
import {Scene4Range} from './scenes/Scene4Range';
import {Scene5B2B} from './scenes/Scene5B2B';
import {Scene6Reveal} from './scenes/Scene6Reveal';

type Entry = {C: React.FC; from: number; dur: number; wipe: WipeKind};

/**
 * FROM CONCEPT TO GAME DAY — 45s master timeline (1,350 frames @ 30fps).
 * Each scene is a Sequence; the outgoing scene keeps rendering for WIPE frames
 * underneath the incoming scene's edge-sweep so transitions never expose a blank.
 * Scene 2 → 3 is a match-cut: the same jersey sits at the same position.
 */
const TIMELINE: Entry[] = [
  {C: Scene1Hook, ...SCENES.s1, wipe: 'none'},
  {C: Scene2Customization, ...SCENES.s2, wipe: 'right'},
  {C: Scene3Manufacturing, ...SCENES.s3, wipe: 'none'},
  {C: Scene4Range, ...SCENES.s4, wipe: 'up'},
  {C: Scene5B2B, ...SCENES.s5, wipe: 'left'},
  {C: Scene6Reveal, ...SCENES.s6, wipe: 'down'},
];

export const GHSCommercial: React.FC = () => (
  <AbsoluteFill style={{background: C.carbon}}>
    {TIMELINE.map((s, i) => {
      const last = i === TIMELINE.length - 1;
      const Comp = s.C;
      return (
        <AbsoluteFill key={i}>
          <Wipe kind={s.wipe} start={s.from} dur={WIPE}>
            <Sequence from={s.from} durationInFrames={s.dur + (last ? 0 : WIPE)} name={`Scene ${i + 1}`} layout="none">
              <AbsoluteFill>
                <Comp />
              </AbsoluteFill>
            </Sequence>
          </Wipe>
        </AbsoluteFill>
      );
    })}
  </AbsoluteFill>
);
