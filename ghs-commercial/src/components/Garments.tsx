import React from 'react';
import {C, FONT} from '../styles/brand';
import {clamp} from '../utils/anim';
import {DrawPath} from './Draw';
import {PATHS} from './Jersey';

export type Kind = 'soccer' | 'basketball' | 'football' | 'tracksuit' | 'training';
export type GPal = {main: string; alt: string; trim: string; line: string; ink: string};

type Props = {kind: Kind; pal: GPal; draw: number; fill: number};

/** Garment viewBox: 0 0 400 600 */
export const G_W = 400;
export const G_H = 600;

const mir = (s: string) => `translate(400 0) scale(-1 1)`;

const Shape: React.FC<{d: string; fill: string; pal: GPal; draw: number; fillP: number; w?: number}> = ({d, fill, pal, draw, fillP, w = 3}) => (
  <DrawPath d={d} p={draw} stroke={pal.line} width={w} fill={fill} fillOpacity={fillP} join="round" />
);

const Detail: React.FC<{d: string; stroke: string; p: number; w?: number; dash?: string; op?: number}> = ({d, stroke, p, w = 3, op = 1}) => (
  <DrawPath d={d} p={p} stroke={stroke} width={w} opacity={op} cap="butt" />
);

const Num: React.FC<{x: number; y: number; size: number; color: string; t: string; o: number}> = ({x, y, size, color, t, o}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} letterSpacing={-size * 0.04} fill={color} opacity={o}>{t}</text>
);

export const Garment: React.FC<Props> = ({kind, pal, draw, fill}) => {
  const d = draw;
  const f = fill;
  const d2 = clamp((draw - 0.4) / 0.6);
  const fo = clamp((fill - 0.3) / 0.7);

  if (kind === 'soccer') {
    return (
      <g>
        <g transform="translate(46 4) scale(0.76)">
          <Shape d={PATHS.body} fill={pal.main} pal={pal} draw={d} fillP={f} />
          <g transform="translate(0 0)">
            <Shape d={PATHS.sleeveL} fill={pal.alt} pal={pal} draw={d} fillP={f} />
            <Shape d={PATHS.sleeveR} fill={pal.alt} pal={pal} draw={d} fillP={f} />
          </g>
          <Detail d="M155 28 L200 92 L245 28" stroke={pal.trim} p={d2} w={9} />
          <Detail d="M28 134 L66 178" stroke={pal.trim} p={d2} w={5} op={fo} />
          <Detail d="M372 134 L334 178" stroke={pal.trim} p={d2} w={5} op={fo} />
          <Detail d="M97 150 C102 260 100 360 94 440" stroke={pal.trim} p={d2} w={4} />
          <Detail d="M303 150 C298 260 300 360 306 440" stroke={pal.trim} p={d2} w={4} />
          <Num x={200} y={300} size={112} color={pal.ink} t="09" o={fo} />
        </g>
        <Shape d="M102 378 L298 378 L316 552 L214 552 L200 466 L186 552 L84 552 Z" fill={pal.alt} pal={pal} draw={d} fillP={f} />
        <Detail d="M102 394 H298" stroke={pal.trim} p={d2} w={6} />
        <Detail d="M96 410 L90 540" stroke={pal.trim} p={d2} w={4} op={fo} />
        <Detail d="M304 410 L310 540" stroke={pal.trim} p={d2} w={4} op={fo} />
      </g>
    );
  }
  if (kind === 'basketball') {
    const tank = 'M128 10 L158 10 C162 82 238 82 242 10 L272 10 C274 60 300 82 306 116 L300 362 L100 362 L94 116 C100 82 126 60 128 10 Z';
    return (
      <g>
        <Shape d={tank} fill={pal.main} pal={pal} draw={d} fillP={f} />
        <Detail d="M158 10 C162 82 238 82 242 10" stroke={pal.trim} p={d2} w={7} />
        <Detail d="M128 10 C126 60 100 82 94 116" stroke={pal.trim} p={d2} w={6} />
        <Detail d="M272 10 C274 60 300 82 306 116" stroke={pal.trim} p={d2} w={6} />
        <Detail d="M100 346 H300" stroke={pal.trim} p={d2} w={6} />
        <Detail d="M120 120 L124 346 M280 120 L276 346" stroke={pal.alt} p={d2} w={10} op={fo} />
        <Num x={200} y={274} size={124} color={pal.ink} t="23" o={fo} />
        <Shape d="M104 382 L296 382 L336 548 L216 548 L200 456 L184 548 L64 548 Z" fill={pal.alt} pal={pal} draw={d} fillP={f} />
        <Detail d="M104 398 H296" stroke={pal.trim} p={d2} w={6} />
        <Detail d="M96 410 L74 540 M304 410 L326 540" stroke={pal.trim} p={d2} w={4} op={fo} />
      </g>
    );
  }
  if (kind === 'football') {
    const jersey = 'M150 20 C170 56 230 56 250 20 L336 40 L396 112 L376 200 L322 192 L314 352 L86 352 L78 192 L24 200 L4 112 L64 40 Z';
    return (
      <g>
        <Shape d={jersey} fill={pal.main} pal={pal} draw={d} fillP={f} />
        <Detail d="M12 134 L58 126 M20 160 L64 152 M388 134 L342 126 M380 160 L336 152" stroke={pal.alt} p={d2} w={9} op={fo} />
        <Detail d="M150 20 L200 86 L250 20" stroke={pal.trim} p={d2} w={7} />
        <Detail d="M86 340 H314" stroke={pal.trim} p={d2} w={6} />
        <Detail d="M78 192 L86 352 M322 192 L314 352" stroke={pal.alt} p={d2} w={10} op={fo} />
        <Num x={200} y={282} size={150} color={pal.ink} t="12" o={fo} />
        <Shape d="M112 372 L288 372 L306 560 L216 560 L200 446 L184 560 L94 560 Z" fill={pal.alt} pal={pal} draw={d} fillP={f} />
        <Detail d="M112 388 H288" stroke={pal.trim} p={d2} w={6} />
      </g>
    );
  }
  if (kind === 'tracksuit') {
    const jacket = 'M150 20 C170 50 230 50 250 20 L304 40 L358 300 L318 312 L298 150 L296 336 L104 336 L102 150 L82 312 L42 300 L96 40 Z';
    return (
      <g>
        <Shape d={jacket} fill={pal.main} pal={pal} draw={d} fillP={f} />
        <Detail d="M150 20 C158 -2 242 -2 250 20 C242 44 158 44 150 20" stroke={pal.alt} p={d2} w={4} />
        <Detail d="M200 44 V336" stroke={pal.trim} p={d2} w={5} />
        <Detail d="M98 40 L46 296" stroke={pal.trim} p={d2} w={5} op={fo} />
        <Detail d="M302 40 L354 296" stroke={pal.trim} p={d2} w={5} op={fo} />
        <Detail d="M44 300 L84 310 M356 300 L316 310" stroke={pal.alt} p={d2} w={14} />
        <Detail d="M104 322 H296" stroke={pal.alt} p={d2} w={18} />
        <Detail d="M232 120 h38" stroke={pal.alt} p={d2} w={4} />
        <Shape d="M112 352 L288 352 L304 590 L224 590 L200 428 L176 590 L96 590 Z" fill={pal.main} pal={pal} draw={d} fillP={f} />
        <Detail d="M120 372 L108 588" stroke={pal.trim} p={d2} w={5} op={fo} />
        <Detail d="M280 372 L292 588" stroke={pal.trim} p={d2} w={5} op={fo} />
        <Detail d="M112 364 H288" stroke={pal.alt} p={d2} w={14} />
      </g>
    );
  }
  // training: hoodie + shorts
  const hoodie = 'M146 40 C140 -4 260 -4 254 40 L304 58 L352 300 L312 312 L296 160 L294 340 L106 340 L104 160 L88 312 L48 300 L96 58 Z';
  return (
    <g>
      <Shape d={hoodie} fill={pal.main} pal={pal} draw={d} fillP={f} />
      <Detail d="M146 40 C164 96 236 96 254 40" stroke={pal.line} p={d2} w={3} />
      <Detail d="M152 30 C162 6 238 6 248 30" stroke={pal.alt} p={d2} w={5} op={fo} />
      <Detail d="M186 78 L182 150 M214 78 L218 150" stroke={pal.trim} p={d2} w={5} />
      <Detail d="M126 236 L274 236 L290 304 L110 304 Z" stroke={pal.line} p={d2} w={3} />
      <Detail d="M58 296 L86 304 M342 296 L314 304" stroke={pal.alt} p={d2} w={14} />
      <Detail d="M106 328 H294" stroke={pal.alt} p={d2} w={16} />
      <Detail d="M96 66 L52 288 M304 66 L348 288" stroke={pal.trim} p={d2} w={4} op={fo} />
      <Shape d="M110 366 L290 366 L312 526 L212 526 L200 440 L188 526 L88 526 Z" fill={pal.alt} pal={pal} draw={d} fillP={f} />
      <Detail d="M110 382 H290" stroke={pal.trim} p={d2} w={6} />
    </g>
  );
};

export const KIND_LABEL: Record<Kind, [string, string]> = {
  soccer: ['SOCCER', 'UNIFORM'],
  basketball: ['BASKETBALL', 'UNIFORM'],
  football: ['AMERICAN FOOTBALL', 'JERSEY'],
  tracksuit: ['TRACKSUIT', 'SET'],
  training: ['TRAINING', 'APPAREL'],
};
