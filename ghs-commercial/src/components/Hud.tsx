import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, W, H, tint} from '../styles/brand';
import {SAFE} from '../styles/safe';
import {ease, prog} from '../utils/anim';

export const PHASES = ['IDEA', 'DESIGN', 'FABRIC', 'PRODUCTION', 'QUALITY', 'DELIVERY'];

/** Six-step journey tracker used as a constant editorial device. */
export const PhaseTracker: React.FC<{active: number; dark: boolean; start?: number}> = ({active, dark, start = 4}) => {
  const frame = useCurrentFrame();
  const ink = dark ? C.porcelain : C.carbon;
  const segW = (W - SAFE.left - SAFE.right - 5 * 10) / 6;
  return (
    <div style={{position: 'absolute', left: SAFE.left, top: SAFE.top, width: W - SAFE.left - SAFE.right, display: 'flex', gap: 10}}>
      {PHASES.map((p, i) => {
        const inP = prog(frame, start + i * 2, 16);
        const on = i === active;
        const done = i < active;
        const fillP = on ? prog(frame, start + 6, 20, ease.inOut) : done ? 1 : 0;
        return (
          <div key={p} style={{width: segW, opacity: inP, transform: `translateY(${(1 - inP) * 10}px)`}}>
            <div style={{height: 4, background: tint(ink, 0.18), position: 'relative'}}>
              <div style={{position: 'absolute', inset: 0, width: `${fillP * 100}%`, background: dark ? C.lime : C.carbon}} />
            </div>
            <div
              style={{
                marginTop: 10, fontFamily: MONO, fontSize: 16, letterSpacing: 1, fontWeight: 700,
                color: on ? (dark ? C.lime : C.carbon) : tint(ink, 0.42), whiteSpace: 'nowrap',
              }}
            >
              {String(i + 1).padStart(2, '0')} {p}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Crop / registration corner marks (full-bleed, decorative). */
export const CornerMarks: React.FC<{dark: boolean; start?: number; inset?: number}> = ({dark, start = 0, inset = 36}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 24);
  const col = tint(dark ? C.porcelain : C.carbon, 0.5);
  const L = 44 * p;
  const mk = (x: number, y: number, sx: number, sy: number) => (
    <path key={`${x}${y}`} d={`M${x} ${y + sy * L} V${y} H${x + sx * L}`} fill="none" stroke={col} strokeWidth={2} />
  );
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {mk(inset, inset, 1, 1)}
      {mk(W - inset, inset, -1, 1)}
      {mk(inset, H - inset, 1, -1)}
      {mk(W - inset, H - inset, -1, -1)}
    </svg>
  );
};
