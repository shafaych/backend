import React from 'react';
import {C, MONO} from '../theme';

/** Dimension line with end arrowheads, extension ticks and a lettered label. p = 0..1 draw progress. */
export const Dim: React.FC<{x1: number; y1: number; x2: number; y2: number; label: string; p: number; color?: string; size?: number; labelDx?: number; labelDy?: number}> = ({
  x1, y1, x2, y2, label, p, color = C.lime, size = 28, labelDx = 0, labelDy = 0,
}) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const ax = mx + (x2 - x1) / 2 * p, ay = my + (y2 - y1) / 2 * p;
  const bx = mx - (x2 - x1) / 2 * p, by = my - (y2 - y1) / 2 * p;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const head = (x: number, y: number, dir: number) => {
    const a = ang + (dir > 0 ? 0 : Math.PI);
    const l = 14, w = 6;
    const px = x - Math.cos(a) * l, py = y - Math.sin(a) * l;
    return `${x},${y} ${px - Math.sin(a) * w},${py + Math.cos(a) * w} ${px + Math.sin(a) * w},${py - Math.cos(a) * w}`;
  };
  return (
    <g opacity={Math.min(1, p * 2)}>
      <line x1={bx} y1={by} x2={ax} y2={ay} stroke={color} strokeWidth={2.5} />
      <polygon points={head(ax, ay, 1)} fill={color} />
      <polygon points={head(bx, by, -1)} fill={color} />
      <g opacity={p > 0.8 ? 1 : 0}>
        <circle cx={mx + labelDx} cy={my + labelDy} r={size * 0.62} fill={C.carbon} stroke={color} strokeWidth={2.5} />
        <text x={mx + labelDx} y={my + labelDy + size * 0.36} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={size} fill={color}>{label}</text>
      </g>
    </g>
  );
};
