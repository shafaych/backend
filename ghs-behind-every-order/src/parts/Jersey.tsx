import React from 'react';
import {C} from '../theme';

/** Simplified front-view jersey in a 400 x 440 box. All vector, drawn from scratch. */
export const JERSEY_D =
  'M140 30 Q200 95 260 30 L350 62 L396 150 L332 184 L312 150 L322 432 L78 432 L88 150 L68 184 L4 150 L50 62 Z';

export const Jersey: React.FC<{fill?: string; stroke?: string; accent?: string; detail?: number; strokeWidth?: number}> = ({
  fill = C.graphite, stroke = C.porcelain, accent = C.lime, detail = 1, strokeWidth = 3,
}) => (
  <g>
    <path d={JERSEY_D} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    {/* side panels */}
    <path d="M118 120 Q124 280 112 432" fill="none" stroke={stroke} strokeOpacity={0.35 * detail} strokeWidth={2} strokeDasharray="6 5" />
    <path d="M282 120 Q276 280 288 432" fill="none" stroke={stroke} strokeOpacity={0.35 * detail} strokeWidth={2} strokeDasharray="6 5" />
    {/* collar trim */}
    <path d="M140 30 Q200 95 260 30" fill="none" stroke={accent} strokeWidth={strokeWidth + 3} strokeLinecap="round" />
    {/* sleeve cuffs */}
    <path d="M396 150 L332 184" stroke={accent} strokeWidth={strokeWidth + 3} strokeLinecap="round" />
    <path d="M4 150 L68 184" stroke={accent} strokeWidth={strokeWidth + 3} strokeLinecap="round" />
    {/* hem */}
    <path d="M78 424 L322 424" stroke={stroke} strokeOpacity={0.5 * detail} strokeWidth={2} strokeDasharray="3 4" />
    {/* chest print placeholder: generic geometric mark, not a brand logo */}
    <g opacity={detail}>
      <rect x={160} y={138} width={80} height={52} rx={6} fill="none" stroke={accent} strokeWidth={2.5} strokeDasharray="8 5" />
      <path d="M176 176 L200 150 L224 176" fill="none" stroke={accent} strokeWidth={3} strokeLinejoin="round" />
    </g>
    {/* shoulder seams */}
    <path d="M140 30 L50 62" stroke={stroke} strokeOpacity={0.5 * detail} strokeWidth={2} strokeDasharray="3 4" />
    <path d="M260 30 L350 62" stroke={stroke} strokeOpacity={0.5 * detail} strokeWidth={2} strokeDasharray="3 4" />
  </g>
);
