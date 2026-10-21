import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {FPS} from './theme';

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Masked rise-in / rise-out text line. `from`/`to` in seconds (absolute timeline).
export const Reveal: React.FC<{from: number; to: number; children: React.ReactNode; style?: React.CSSProperties; delay?: number}> = ({from, to, children, style, delay = 0}) => {
  const f = useCurrentFrame();
  const a = from * FPS + delay * FPS;
  const b = to * FPS;
  const inP = interpolate(f, [a, a + 16], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outP = interpolate(f, [b - 9, b], [0, 1], {easing: Easing.in(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (f < a - 1 || f > b + 1) return null;
  return (
    <div style={{overflow: 'hidden', paddingBottom: 6, ...style}}>
      <div style={{transform: `translateY(${(1 - inP) * 110 - outP * 60}%)`, opacity: inP * (1 - outP)}}>{children}</div>
    </div>
  );
};
