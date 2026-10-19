import React from 'react';
import {getLength, getPointAtLength} from '@remotion/paths';

type DrawProps = {
  d: string;
  /** 0..1 draw progress */
  p: number;
  stroke?: string;
  width?: number;
  fill?: string;
  fillOpacity?: number;
  opacity?: number;
  cap?: 'butt' | 'round' | 'square';
  join?: 'miter' | 'round' | 'bevel';
  transform?: string;
};

/** Self-drawing SVG path (normalised with pathLength=1). */
export const DrawPath: React.FC<DrawProps> = ({
  d, p, stroke = 'currentColor', width = 2, fill = 'none', fillOpacity = 1, opacity = 1,
  cap = 'round', join = 'round', transform,
}) => {
  const showStroke = p > 0.0005;
  return (
    <path
      d={d}
      transform={transform}
      pathLength={1}
      fill={fill}
      fillOpacity={fillOpacity}
      opacity={opacity}
      stroke={showStroke ? stroke : 'none'}
      strokeWidth={width}
      strokeLinecap={cap}
      strokeLinejoin={join}
      strokeDasharray={p >= 0.9995 ? undefined : `${p} 2`}
    />
  );
};

/** Pre-computed length cache so geometry is only measured once. */
const lengthCache = new Map<string, number>();
export const pathLen = (d: string) => {
  let l = lengthCache.get(d);
  if (l === undefined) {
    l = getLength(d);
    lengthCache.set(d, l);
  }
  return l;
};

export const pointAt = (d: string, p: number) => getPointAtLength(d, pathLen(d) * Math.min(1, Math.max(0, p)));

/** Dash string that reveals a stitched (dashed) line up to progress p. */
const stitchDash = (len: number, p: number, on: number, off: number) => {
  const target = len * p;
  const unit = on + off;
  const full = Math.floor(target / unit);
  const rest = target - full * unit;
  const parts: string[] = [];
  for (let i = 0; i < full; i++) parts.push(`${on} ${off}`);
  parts.push(`${Math.min(on, rest)} ${len * 2}`);
  return parts.join(' ');
};

type StitchProps = {
  d: string;
  p: number;
  stroke: string;
  width?: number;
  on?: number;
  off?: number;
  transform?: string;
  opacity?: number;
  cap?: 'butt' | 'round' | 'square';
};

/** Dashed stitch line that is progressively sewn along the path. */
export const StitchPath: React.FC<StitchProps> = ({d, p, stroke, width = 2, on = 6, off = 5, transform, opacity = 1, cap = 'round'}) => {
  if (p <= 0.0005) return null;
  const len = pathLen(d);
  return (
    <path
      d={d}
      transform={transform}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap={cap}
      opacity={opacity}
      strokeDasharray={p >= 0.9995 ? `${on} ${off}` : stitchDash(len, p, on, off)}
    />
  );
};

/** Needle / cutter head riding a path. */
export const Head: React.FC<{d: string; p: number; r?: number; fill: string; ring: string; transform?: string}> = ({
  d, p, r = 7, fill, ring, transform,
}) => {
  if (p <= 0.001 || p >= 0.999) return null;
  const pt = pointAt(d, p);
  if (!pt) return null;
  return (
    <g transform={transform}>
      <circle cx={pt.x} cy={pt.y} r={r} fill={fill} stroke={ring} strokeWidth={r * 0.35} />
    </g>
  );
};
