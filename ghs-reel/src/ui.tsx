import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BODY, DISPLAY} from './fonts';
import {C} from './theme';

/** One headline line that rises out of a mask. `at` = local frame to start. */
export const Line: React.FC<{
  text: string;
  at: number;
  size: number;
  color?: string;
  italic?: boolean;
  children?: React.ReactNode;
  spacing?: number;
}> = ({text, at, size, color = C.white, italic = true, spacing = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: {damping: 200, mass: 0.7, stiffness: 140}});
  const y = interpolate(s, [0, 1], [112, 0]);
  return (
    <div style={{overflow: 'hidden', paddingRight: 24, paddingBottom: size * 0.06, marginBottom: -size * 0.06}}>
      <div
        style={{
          transform: `translateY(${y}%)`,
          opacity: f >= at ? 1 : 0,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontStyle: italic ? 'italic' : 'normal',
          fontSize: size,
          lineHeight: 0.9,
          letterSpacing: spacing,
          textTransform: 'uppercase',
          color,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Small tracked caps line with a lime rule that draws in. */
export const Sub: React.FC<{text: string; at: number; size?: number; color?: string}> = ({text, at, size = 34, color = C.porcelain}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - at, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateX(${(1 - p) * -24}px)`}}>
      <div style={{width: 72 * p, height: 6, background: C.lime}} />
      <div style={{fontFamily: BODY, fontWeight: 700, fontSize: size, letterSpacing: size * 0.16, color, textTransform: 'uppercase'}}>{text}</div>
    </div>
  );
};

export const BrandTag: React.FC = () => (
  <div style={{position: 'absolute', left: 72, top: 236, display: 'flex', alignItems: 'center', gap: 16, opacity: 0.9}}>
    <div style={{width: 18, height: 18, background: C.lime}} />
    <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: C.white}}>GHS CUSTOM GEAR</div>
  </div>
);

export const BottomShade: React.FC<{height?: number; strength?: number}> = ({height = 1000, strength = 0.82}) => (
  <div
    style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height,
      background: `linear-gradient(to top, rgba(23,25,23,${strength}) 0%, rgba(23,25,23,${strength * 0.6}) 45%, rgba(23,25,23,0) 100%)`,
    }}
  />
);
