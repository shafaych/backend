import React from 'react';
import {C, MONO, FONT} from '../styles/brand';
import {clamp, lerp, prog, ease} from '../utils/anim';
import {DrawPath} from './Draw';
import {GHSMark} from './GHSMark';

export const JW = 400;
export const JH = 480;

export const PATHS = {
  outline:
    'M150 22 L200 92 L250 22 L316 48 L392 118 L350 166 L312 138 C306 240 310 340 320 430 L80 430 C90 340 94 240 88 138 L50 166 L8 118 L84 48 Z',
  body: 'M150 22 L200 92 L250 22 L316 48 L312 138 C306 240 310 340 320 430 L80 430 C90 340 94 240 88 138 L84 48 Z',
  sleeveL: 'M84 48 L8 118 L50 166 L88 138 Z',
  sleeveR: 'M316 48 L392 118 L350 166 L312 138 Z',
  collar: 'M150 22 L200 92 L250 22 L240 14 L200 70 L160 14 Z',
  neckEdge: 'M150 22 L200 92 L250 22',
  armholeL: 'M84 48 L88 138',
  armholeR: 'M316 48 L312 138',
  hem: 'M88 416 L312 416',
};

/** Mirror helper: x -> 400 - x */
export const MIRROR = 'translate(400 0) scale(-1 1)';

export type PieceKey = 'body' | 'sleeveL' | 'sleeveR' | 'collar';
export const PIECES: Record<PieceKey, {d: string; c: [number, number]; off: {x: number; y: number; r: number}}> = {
  body: {d: PATHS.body, c: [200, 230], off: {x: 0, y: 0, r: 0}},
  sleeveL: {d: PATHS.sleeveL, c: [48, 118], off: {x: -78, y: -26, r: -9}},
  sleeveR: {d: PATHS.sleeveR, c: [352, 118], off: {x: 78, y: -26, r: 9}},
  collar: {d: PATHS.collar, c: [200, 50], off: {x: 0, y: -74, r: 0}},
};
export const pieceTransform = (k: PieceKey, split: number) => {
  const p = PIECES[k];
  return `translate(${p.off.x * split} ${p.off.y * split}) rotate(${p.off.r * split} ${p.c[0]} ${p.c[1]})`;
};

type Pal = {base: string; panel: string; trim: string; num: string; mark: string; seam: string; collar: string; sleeve: string};
export const PAL: Pal[] = [
  {base: C.carbon, panel: C.graphite, trim: C.lime, num: C.lime, mark: C.porcelain, seam: 'rgba(245,245,240,0.55)', collar: C.lime, sleeve: C.carbon},
  {base: C.white, panel: C.carbon, trim: C.lime, num: C.carbon, mark: C.carbon, seam: 'rgba(23,25,23,0.5)', collar: C.carbon, sleeve: C.white},
  {base: C.graphite, panel: C.porcelain, trim: C.lime, num: C.porcelain, mark: C.porcelain, seam: 'rgba(245,245,240,0.5)', collar: C.lime, sleeve: C.graphite},
];
export const DESIGN_ORDER = [0, 1, 2, 0]; // layers: D0 (base), D1, D2, back to D0

/** Fabric mesh pattern (procedural) + clip definitions. */
export const JerseyDefs: React.FC<{uid: string}> = ({uid}) => (
  <defs>
    <clipPath id={`${uid}-outline`}><path d={PATHS.outline} /></clipPath>
    <clipPath id={`${uid}-body`}><path d={PATHS.body} /></clipPath>
    <clipPath id={`${uid}-sl`}><path d={PATHS.sleeveL} /></clipPath>
    <clipPath id={`${uid}-sr`}><path d={PATHS.sleeveR} /></clipPath>
    <pattern id={`${uid}-mesh`} width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <path d="M0 6 H12" stroke="currentColor" strokeWidth={1} />
      <circle cx={6} cy={0} r={1.3} fill="currentColor" />
      <circle cx={0} cy={6} r={1.3} fill="currentColor" />
    </pattern>
    <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity={0.2} />
      <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.16} />
    </linearGradient>
  </defs>
);

const mirrorX = (x: number) => 400 - x;

/** Body fabric art for design k, in jersey coordinates. `pat` = panel/pattern reveal. */
export const BodyArt: React.FC<{uid: string; k: number; pat: number}> = ({uid, k, pat}) => {
  const pal = PAL[k];
  const slide = (1 - pat) * 90;
  const meshColor = k === 1 ? C.carbon : C.porcelain;
  const leftPanel = 'M40 0 L118 70 L132 250 L148 480 L40 480 Z';
  const rightPanel = `M${mirrorX(40)} 0 L${mirrorX(118)} 70 L${mirrorX(132)} 250 L${mirrorX(148)} 480 L${mirrorX(40)} 480 Z`;
  return (
    <g>
      <rect x={-20} y={0} width={440} height={500} fill={pal.base} />
      {k === 0 && (
        <g>
          <g transform={`translate(${-slide} 0)`}><path d={leftPanel} fill={pal.panel} /></g>
          <g transform={`translate(${slide} 0)`}><path d={rightPanel} fill={pal.panel} /></g>
          <g opacity={pat}>
            <path d="M118 70 L132 250 L148 480" fill="none" stroke={C.lime} strokeWidth={3.5} />
            <path d={`M${mirrorX(118)} 70 L${mirrorX(132)} 250 L${mirrorX(148)} 480`} fill="none" stroke={C.lime} strokeWidth={3.5} />
          </g>
        </g>
      )}
      {k === 1 && (
        <g transform={`translate(${slide * 1.6} 0)`}>
          <path d="M-20 372 L420 262 L420 342 L-20 452 Z" fill={pal.panel} />
          <path d="M-20 464 L420 354" stroke={C.lime} strokeWidth={5} />
          <path d="M-20 360 L420 250" stroke={C.graphite} strokeWidth={2} />
        </g>
      )}
      {k === 2 && (
        <g transform={`translate(0 ${slide * 0.8})`}>
          <rect x={-20} y={322} width={440} height={26} fill={pal.panel} />
          <rect x={-20} y={362} width={440} height={26} fill={pal.panel} />
          <rect x={-20} y={351} width={440} height={5} fill={C.lime} />
          <path d="M0 0" stroke={C.carbon} strokeWidth={0} />
        </g>
      )}
      <g style={{color: meshColor}} opacity={pat}>
        <rect x={-20} y={0} width={440} height={500} fill={`url(#${uid}-mesh)`} opacity={k === 1 ? 0.25 : 0.4} />
      </g>
    </g>
  );
};

/** Left-sleeve fabric art; right sleeve renders it mirrored. */
export const SleeveArt: React.FC<{k: number; pat: number}> = ({k, pat}) => {
  const pal = PAL[k];
  return (
    <g>
      <rect x={-10} y={30} width={140} height={170} fill={pal.sleeve} />
      {k === 0 && (
        <g opacity={pat}>
          <path d="M8 118 L50 166 L64 153 L22 105 Z" fill={C.graphite} />
          <path d="M24 102 L66 150" stroke={C.lime} strokeWidth={3.5} />
        </g>
      )}
      {k === 1 && (
        <g opacity={pat}>
          <path d="M8 118 L50 166 L66 151 L24 103 Z" fill={C.carbon} />
          <path d="M27 100 L69 148" stroke={C.lime} strokeWidth={4} />
        </g>
      )}
      {k === 2 && (
        <g opacity={pat}>
          <path d="M8 118 L50 166 L62 155 L20 107 Z" fill={C.porcelain} />
          <path d="M26 96 L68 144" stroke={C.lime} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

export type Build = {
  /** silhouette: outline stroke + fill rising from the hem */
  body: number;
  sleeves: number;
  pattern: number;
  seams: number;
  number: number;
  logo: number;
  /** 0..3: sweeps through layers [D0, D1, D2, D0] */
  design: number;
  outline: number;
};
export const BUILT: Build = {body: 1, sleeves: 1, pattern: 1, seams: 1, number: 1, logo: 1, design: 0, outline: 1};

export const sweepClipPoints = (s: number) => {
  const e = lerp(-150, 520, s);
  return `-220,-60 ${e + 90},-60 ${e - 90},560 -220,560`;
};

/** Top overlay for a design layer: collar, seams, number, chest mark. */
const Overlay: React.FC<{k: number; uid: string; b: Build; numberText: string}> = ({k, b, numberText}) => {
  const pal = PAL[k];
  const collarP = clamp((b.seams - 0.0) / 0.5);
  const seamP = clamp((b.seams - 0.35) / 0.65);
  const np = ease.outExpo(b.number);
  const logoP = b.logo;
  return (
    <g>
      <DrawPath d={PATHS.collar} p={collarP} stroke={pal.collar} width={2} fill={pal.collar} fillOpacity={clamp((collarP - 0.6) / 0.4)} join="round" />
      <DrawPath d={PATHS.armholeL} p={seamP} stroke={pal.seam} width={2.5} />
      <DrawPath d={PATHS.armholeR} p={seamP} stroke={pal.seam} width={2.5} />
      <DrawPath d="M88 416 L312 416" p={seamP} stroke={pal.seam} width={2} />
      <DrawPath d="M88 410 L312 410" p={seamP} stroke={pal.seam} width={1} opacity={0.6} />
      {b.number > 0 && (
        <g transform={`translate(200 ${248 - 6 * (1 - np)}) scale(${1 + 0.16 * (1 - np)}) translate(-200 -248)`} opacity={clamp(b.number * 2.2)}>
          <text x={200} y={282} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={138} letterSpacing={-6} fill={pal.num}>
            {numberText}
          </text>
          <rect x={92} y={300} width={216} height={4} fill={pal.num} opacity={0.0} />
        </g>
      )}
      {logoP > 0 && (
        <g transform="translate(214 118) scale(0.1)" opacity={clamp(logoP * 3)}>
          <GHSMark draw={1} weight={1} width={480} color={pal.mark} guideColor={pal.mark} />
        </g>
      )}
    </g>
  );
};

type JerseyProps = {uid: string; b: Build; numberText?: string; stroke?: string};

/** The hero vector jersey — constructed from independent, animatable layers. */
export const Jersey: React.FC<JerseyProps> = ({uid, b, numberText = '07', stroke = C.graphite}) => {
  const bodyRise = ease.inOut(b.body);
  const slide = 1 - ease.outExpo(b.sleeves);
  const layers = DESIGN_ORDER.map((k, i) => ({k, i, s: i === 0 ? 1 : clamp(b.design - (i - 1))}));
  const patFor = (i: number) => (i === 0 ? b.pattern : 1);

  return (
    <g>
      <JerseyDefs uid={uid} />
      {/* body fabric: rises from hem */}
      <g clipPath={`url(#${uid}-body)`}>
        <clipPath id={`${uid}-rise`}><rect x={-50} y={JH - JH * bodyRise} width={500} height={JH * bodyRise + 40} /></clipPath>
        <g clipPath={`url(#${uid}-rise)`}>
          {layers.map(({k, i, s}) =>
            s <= 0 ? null : (
              <g key={i} clipPath={i === 0 ? undefined : `url(#${uid}-sw${i})`}>
                {i > 0 && <clipPath id={`${uid}-sw${i}`}><polygon points={sweepClipPoints(s)} /></clipPath>}
                <BodyArt uid={uid} k={k} pat={patFor(i)} />
              </g>
            ),
          )}
        </g>
      </g>
      {/* sleeves slide in from shoulder offsets */}
      {(['sleeveL', 'sleeveR'] as const).map((key) => {
        const left = key === 'sleeveL';
        const o = PIECES[key].off;
        const f = slide;
        const tr = `translate(${o.x * f} ${o.y * f}) rotate(${o.r * f} ${PIECES[key].c[0]} ${PIECES[key].c[1]})`;
        return (
          <g key={key} transform={tr} opacity={clamp(b.sleeves * 4)}>
            <g clipPath={`url(#${uid}-${left ? 'sl' : 'sr'})`}>
              {layers.map(({k, i, s}) =>
                s <= 0 ? null : (
                  <g key={i} clipPath={i === 0 ? undefined : `url(#${uid}-sw${i}-${key})`}>
                    {i > 0 && <clipPath id={`${uid}-sw${i}-${key}`}><polygon points={sweepClipPoints(s)} /></clipPath>}
                    <g transform={left ? undefined : MIRROR}>
                      <SleeveArt k={k} pat={patFor(i)} />
                    </g>
                  </g>
                ),
              )}
            </g>
            <DrawPath d={PIECES[key].d} p={b.outline} stroke={stroke} width={2.5} />
          </g>
        );
      })}
      {/* gloss + overlays (collar, seams, number, chest mark) */}
      <g clipPath={`url(#${uid}-outline)`} opacity={bodyRise}>
        <rect x={-20} y={0} width={440} height={500} fill={`url(#${uid}-gloss)`} />
      </g>
      <g clipPath={`url(#${uid}-outline)`}>
        {layers.map(({k, i, s}) =>
          s <= 0 ? null : (
            <g key={i} clipPath={i === 0 ? undefined : `url(#${uid}-ov${i})`}>
              {i > 0 && <clipPath id={`${uid}-ov${i}`}><polygon points={sweepClipPoints(s)} /></clipPath>}
              <Overlay k={k} uid={uid} b={b} numberText={numberText} />
            </g>
          ),
        )}
      </g>
      {/* sweeping light edge while designs transition */}
      {layers.map(({i, s}) =>
        i === 0 || s <= 0 || s >= 1 ? null : (
          <g key={`e${i}`} clipPath={`url(#${uid}-outline)`}>
            <polyline points={(() => { const e = lerp(-150, 520, s); return `${e + 90},-60 ${e - 90},560`; })()} stroke={C.white} strokeWidth={5} opacity={0.75} fill="none" />
          </g>
        ),
      )}
      <DrawPath d={PATHS.outline} p={b.outline} stroke={stroke} width={3} join="round" />
    </g>
  );
};

/** Technical outline-only jersey used by the hook (lime wireframe). */
export const JerseyWire: React.FC<{p: number; color: string; width?: number; guides?: number}> = ({p, color, width = 2.4, guides = 0}) => (
  <g>
    <DrawPath d={PATHS.outline} p={p} stroke={color} width={width} />
    <DrawPath d={PATHS.armholeL} p={clamp((p - 0.4) / 0.6)} stroke={color} width={width * 0.7} />
    <DrawPath d={PATHS.armholeR} p={clamp((p - 0.4) / 0.6)} stroke={color} width={width * 0.7} />
    <DrawPath d={PATHS.neckEdge} p={clamp((p - 0.3) / 0.7)} stroke={color} width={width * 0.7} />
    <DrawPath d={PATHS.collar} p={clamp((p - 0.5) / 0.5)} stroke={color} width={width * 0.7} />
    <DrawPath d="M200 92 V430" p={clamp((p - 0.55) / 0.45)} stroke={color} width={1.2} opacity={0.7} />
    <DrawPath d="M88 416 L312 416" p={clamp((p - 0.6) / 0.4)} stroke={color} width={1.2} opacity={0.8} />
    {/* construction guides */}
    <g opacity={0.9}>
      <DrawPath d="M-30 22 H430" p={guides} stroke={color} width={0.9} opacity={0.55} />
      <DrawPath d="M-30 430 H430" p={guides} stroke={color} width={0.9} opacity={0.55} />
      <DrawPath d="M8 -30 V510" p={guides} stroke={color} width={0.9} opacity={0.55} />
      <DrawPath d="M392 -30 V510" p={guides} stroke={color} width={0.9} opacity={0.55} />
      <DrawPath d="M200 -30 V510" p={guides} stroke={color} width={0.9} opacity={0.4} />
    </g>
  </g>
);

export {MONO, prog};
