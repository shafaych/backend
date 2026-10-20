import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../Scene';
import {C, CUES, MONO, SANS, clamp, easeOut, prog} from '../theme';

const QUESTIONS = [
  ['CAN I TRUST THIS', 'MANUFACTURER?'],
  ['WHO IS MAKING', 'MY PRODUCTS?'],
  ['WHAT HAPPENS', 'AFTER I ORDER?'],
];

export const S1Questions: React.FC = () => {
  const t = useT();
  const q = CUES.s1.q;
  const head = CUES.s1.head;
  const headP = prog(t, head, 0.9);
  const cardsOut = 1 - prog(t, head - 0.45, 0.35);
  const labelP = prog(t, 0.2, 0.8);

  return (
    <AbsoluteFill>
      {/* faint grid, barely there */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.5 * clamp(t / 2)}}>
        {Array.from({length: 17}).map((_, i) => (
          <line key={i} x1={i * 72 + 36} y1={0} x2={i * 72 + 36} y2={1920} stroke={C.graphite} strokeOpacity={0.35} />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 80, top: 250, fontFamily: MONO, fontSize: 30, letterSpacing: 4, color: C.mute, opacity: labelP * cardsOut}}>
        QUESTIONS BUYERS OFTEN ASK
      </div>
      {QUESTIONS.map((lines, i) => {
        const p = prog(t, q[i], 0.7);
        const older = i < 2 && t > q[i + 1] ? 0.4 : 1;
        const y = 350 + i * 330 + (1 - p) * 40;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: 80, width: 920, top: y, height: 270,
              opacity: p * older * cardsOut,
              border: `2px solid ${C.graphite}`, borderLeft: `8px solid ${C.lime}`,
              background: 'rgba(51,56,50,0.35)', borderRadius: 6,
              padding: '48px 56px', boxSizing: 'border-box',
            }}
          >
            <div style={{fontFamily: MONO, fontSize: 28, color: C.lime, letterSpacing: 4, marginBottom: 22}}>0{i + 1}</div>
            {lines.map((l, k) => (
              <div key={k} style={{fontFamily: SANS, fontWeight: 800, fontSize: 70, lineHeight: 1.08, color: C.porcelain, letterSpacing: -1}}>
                {l}
              </div>
            ))}
          </div>
        );
      })}
      {/* resolution */}
      <div style={{position: 'absolute', left: 80, right: 80, top: 640, opacity: headP}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 132, lineHeight: 1.02, color: C.white, letterSpacing: -3, transform: `translateY(${(1 - headP) * 30}px)`}}>
          YOU<br />DESERVE<br />
          <span style={{color: C.lime}}>CLEAR<br />ANSWERS.</span>
        </div>
        <div style={{height: 8, background: C.lime, marginTop: 50, width: 920 * easeOut((t - head - 0.4) / 0.8)}} />
      </div>
    </AbsoluteFill>
  );
};
