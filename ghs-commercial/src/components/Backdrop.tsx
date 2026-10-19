import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, W, H, tint} from '../styles/brand';

type Props = {
  tone: 'dark' | 'light';
  /** grid cell in px */
  cell?: number;
  /** grid opacity multiplier */
  grid?: number;
  /** parallax px per frame */
  drift?: number;
  /** extra depth layer offset (px) driven by the scene camera */
  cam?: {x: number; y: number};
  children?: React.ReactNode;
};

/** Layered technical-grid backdrop with vignette + a soft moving light band. */
export const Backdrop: React.FC<Props> = ({tone, cell = 72, grid = 1, drift = 0.22, cam = {x: 0, y: 0}, children}) => {
  const frame = useCurrentFrame();
  const dark = tone === 'dark';
  const bg = dark ? C.carbon : C.porcelain;
  const line = dark ? C.porcelain : C.carbon;
  const ox = (frame * drift + cam.x * 0.4) % (cell * 4);
  const oy = (frame * drift * 0.6 + cam.y * 0.4) % (cell * 4);
  const bandX = ((frame * 5) % (W * 3)) - W;

  return (
    <AbsoluteFill style={{background: bg}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <pattern id={`g-minor-${tone}`} width={cell} height={cell} patternUnits="userSpaceOnUse" patternTransform={`translate(${-ox} ${-oy})`}>
            <path d={`M${cell} 0 H0 V${cell}`} fill="none" stroke={tint(line, (dark ? 0.05 : 0.055) * grid)} strokeWidth={1} />
          </pattern>
          <pattern id={`g-major-${tone}`} width={cell * 4} height={cell * 4} patternUnits="userSpaceOnUse" patternTransform={`translate(${-ox} ${-oy})`}>
            <path d={`M${cell * 4} 0 H0 V${cell * 4}`} fill="none" stroke={tint(line, (dark ? 0.1 : 0.11) * grid)} strokeWidth={1.4} />
            <circle cx={0} cy={0} r={4} fill={tint(line, 0.35 * grid)} />
          </pattern>
          <radialGradient id={`vig-${tone}`} cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor={dark ? C.graphite : C.white} stopOpacity={dark ? 0.55 : 0.9} />
            <stop offset="100%" stopColor={bg} stopOpacity={0} />
          </radialGradient>
          <linearGradient id={`band-${tone}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={dark ? C.porcelain : C.white} stopOpacity={0} />
            <stop offset="50%" stopColor={dark ? C.porcelain : C.white} stopOpacity={dark ? 0.045 : 0.55} />
            <stop offset="100%" stopColor={dark ? C.porcelain : C.white} stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#vig-${tone})`} />
        <rect width={W} height={H} fill={`url(#g-minor-${tone})`} />
        <rect width={W} height={H} fill={`url(#g-major-${tone})`} />
        <g transform={`translate(${bandX} 0) skewX(-18)`}>
          <rect x={0} y={-100} width={420} height={H + 200} fill={`url(#band-${tone})`} />
        </g>
      </svg>
      {children}
    </AbsoluteFill>
  );
};
