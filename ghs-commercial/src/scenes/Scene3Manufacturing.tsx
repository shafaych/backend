import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, FONT, W, H, tint} from '../styles/brand';
import {SAFE} from '../styles/safe';
import {Backdrop} from '../components/Backdrop';
import {Jersey, BUILT, JerseyDefs, PATHS, PIECES, PieceKey, pieceTransform, BodyArt, SleeveArt, MIRROR, PAL, JH} from '../components/Jersey';
import {MaskText} from '../components/MaskText';
import {CornerMarks, PhaseTracker} from '../components/Hud';
import {Callout} from '../components/Callout';
import {DrawPath, StitchPath, Head} from '../components/Draw';
import {GHSMark, GHS_LETTERS, GHS_ORDER} from '../components/GHSMark';
import {clamp, ease, lerp, prog} from '../utils/anim';
import {STAGE} from './Scene2Customization';

const KEYS: PieceKey[] = ['body', 'sleeveL', 'sleeveR', 'collar'];
const CUT_START: Record<PieceKey, number> = {body: 18, sleeveL: 30, sleeveR: 36, collar: 42};
const STITCH: Record<PieceKey, string[]> = {
  body: ['M90 54 L94 138', 'M310 54 L306 138', 'M152 34 L200 98 L248 34', 'M92 416 L308 416'],
  sleeveL: ['M78 52 L82 136', 'M17 110 L59 158'],
  sleeveR: ['M322 52 L318 136', 'M383 110 L341 158'],
  collar: ['M155 18 L200 81 L245 18'],
};
const MAT = {x: 72, y: 640, w: 936, h: 770};
const NUM_FONT = {fontFamily: FONT, fontWeight: 900, fontSize: 138, letterSpacing: -6};

const STEPS: [number, string][] = [
  [8, '01 — CUT'],
  [58, '02 — SEPARATE'],
  [84, '03 — SUBLIMATE'],
  [108, '04 — STITCH'],
  [142, '05 — EMBROIDER'],
  [188, '06 — ASSEMBLE'],
];

const StitchSet: React.FC<{paths: string[]; p: number; color: string; w?: number}> = ({paths, p, color, w = 2.6}) => {
  const n = paths.length;
  return (
    <g>
      {paths.map((d, i) => {
        const pp = clamp(p * n - i);
        return (
          <React.Fragment key={i}>
            <StitchPath d={d} p={pp} stroke={color} width={w} />
            {pp > 0 && pp < 1 && <Head d={d} p={pp} r={6} fill={C.lime} ring={C.carbon} />}
          </React.Fragment>
        );
      })}
    </g>
  );
};

/** SCENE 03 — MANUFACTURING (0:12–0:20): the centrepiece. */
export const Scene3Manufacturing: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame;

  // ---- camera -------------------------------------------------------------
  const open = prog(f, 4, 30, ease.inOut);
  const zoom = prog(f, 130, 24, ease.inOut) - prog(f, 186, 24, ease.inOut);
  const push = prog(f, 214, 40, ease.linear);
  const s = lerp(lerp(STAGE.scale, 1.45, open), 3.6, zoom) + push * 0.1;
  const fx = lerp(STAGE.jcx, 240, zoom);
  const fy = lerp(STAGE.jcy, 124, zoom);
  const sx = 540;
  const sy = lerp(lerp(STAGE.cy, 1085, open), 1010, zoom);
  const camT = `translate(${sx} ${sy}) scale(${s}) translate(${-fx} ${-fy})`;

  // ---- piece state -------------------------------------------------------------
  const split = ease.inOut(prog(f, 58, 30, ease.linear)) * (1 - ease.inOut(prog(f, 190, 34, ease.linear)));
  const printV = f < 40 ? 1 - prog(f, 2, 14, ease.inOut) : prog(f, 84, 30, ease.inOut);
  const printing = f > 84 && f < 118;
  const stitchP = (i: number) => prog(f, 108 + i * 4, 30, ease.inOut);
  const stitchFade = 1;
  const embP = prog(f, 144, 40, ease.linear);
  const numberP = prog(f, 214, 20, ease.outQuart);
  const logoSolid = prog(f, 186, 12, ease.linear);
  const jerseyFade = 1 - prog(f, 4, 10, ease.linear);
  const glossOp = prog(f, 100, 30) * 0.9;

  // window / mat
  const win = prog(f, 2, 28, ease.inOut);
  const mx = lerp(0, MAT.x, win);
  const my = lerp(0, MAT.y, win);
  const mw = lerp(W, MAT.w, win);
  const mh = lerp(H, MAT.h, win);
  const matOp = prog(f, 12, 22);

  // projection helper for callouts
  const proj = (k: PieceKey, x: number, y: number): [number, number] => {
    const o = PIECES[k].off;
    return [(x + o.x * split - fx) * s + sx, (y + o.y * split - fy) * s + sy];
  };

  const bodyAnchorCut = proj('body', 86, 92);
  const bodyAnchorPrint = proj('body', 230, 330);
  const seamAnchor = proj('sleeveR', 318, 96);
  const chestAnchor = proj('body', 238, 126);

  const tracker = f < 108 ? 2 : f < 188 ? 3 : 4;

  const letterProg = (i: number) => clamp(embP * 3 - i);

  const renderPiece = (k: PieceKey) => {
    const piece = PIECES[k];
    const cutP = prog(f, CUT_START[k], 22, ease.inOut);
    const idx = KEYS.indexOf(k);
    const visibleH = (JH + 80) * printV;
    const clipId = k === 'body' ? 's3-body' : k === 'sleeveL' ? 's3-sl' : k === 'sleeveR' ? 's3-sr' : 's3-col';
    return (
      <g key={k} transform={pieceTransform(k, split)}>
        <clipPath id={`s3-pv-${k}`}><rect x={-60} y={-40} width={520} height={Math.max(0, visibleH)} /></clipPath>
        {/* blank fabric */}
        <path d={piece.d} fill={C.white} />
        <g clipPath={`url(#${clipId})`}>
          <g style={{color: C.carbon}} opacity={0.5}><rect x={-60} y={-40} width={520} height={560} fill="url(#s3-mesh)" opacity={0.1} /></g>
          <g clipPath={`url(#s3-pv-${k})`}>
            {k === 'body' && <BodyArt uid="s3" k={0} pat={1} />}
            {k === 'sleeveL' && <SleeveArt k={0} pat={1} />}
            {k === 'sleeveR' && <g transform={MIRROR}><SleeveArt k={0} pat={1} /></g>}
            {k === 'collar' && <rect x={100} y={0} width={200} height={110} fill={C.lime} />}
          </g>
          <rect x={-60} y={-40} width={520} height={560} fill="url(#s3-gloss)" opacity={glossOp} />
          {printing && (
            <g>
              <rect x={-60} y={-40 + visibleH - 4} width={520} height={9} fill={C.lime} stroke={C.carbon} strokeWidth={1.4} />
            </g>
          )}
        </g>
        {/* cut line (perforated) → solid edge */}
        {cutP < 1 ? (
          <>
            <StitchPath d={piece.d} p={cutP} stroke={C.carbon} width={3} on={10} off={6} cap="butt" />
            <Head d={piece.d} p={cutP} r={9} fill={C.lime} ring={C.carbon} />
          </>
        ) : (
          <path d={piece.d} fill="none" stroke={C.graphite} strokeWidth={2.6} strokeLinejoin="round" />
        )}
        {/* stitching */}
        <StitchSet paths={STITCH[k]} p={stitchP(idx)} color={k === 'collar' ? C.carbon : C.lime} />
        {k === 'body' && (
          <g>
            {/* embroidered GHS (satin stitch) */}
            <g transform="translate(214 118) scale(0.1)" opacity={1 - logoSolid}>
              {GHS_ORDER.map((l, i) => (
                <React.Fragment key={l}>
                  <StitchPath d={GHS_LETTERS[l]} p={letterProg(i)} stroke={C.lime} width={26} on={3.2} off={2.4} cap="butt" />
                  {letterProg(i) > 0 && letterProg(i) < 1 && (
                    <g>
                      <Head d={GHS_LETTERS[l]} p={letterProg(i)} r={30} fill={C.lime} ring={C.carbon} />
                      <NeedleThread d={GHS_LETTERS[l]} p={letterProg(i)} />
                    </g>
                  )}
                </React.Fragment>
              ))}
            </g>
            <g transform="translate(214 118) scale(0.1)" opacity={logoSolid}>
              <GHSMark draw={1} weight={1} width={480} color={C.porcelain} guideColor={C.porcelain} />
            </g>
            {numberP > 0 && (
              <g transform={`translate(200 ${242 - 6 * (1 - numberP)}) scale(${1 + 0.16 * (1 - numberP)}) translate(-200 -242)`} opacity={clamp(numberP * 2.2)}>
                <text x={200} y={282} textAnchor="middle" {...NUM_FONT} fill={PAL[0].num}>07</text>
              </g>
            )}
          </g>
        )}
      </g>
    );
  };

  return (
    <AbsoluteFill>
      <Backdrop tone="light" cell={72} drift={0.25} />
      <CornerMarks dark={false} start={0} />
      <PhaseTracker active={tracker} dark={false} start={0} />

      {/* stage */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="s3-window"><rect x={mx} y={my} width={mw} height={mh} /></clipPath>
          <clipPath id="s3-col"><path d={PATHS.collar} /></clipPath>
          <pattern id="s3-grid" width={36} height={36} patternUnits="userSpaceOnUse">
            <path d="M36 0 H0 V36" fill="none" stroke={tint(C.carbon, 0.07)} strokeWidth={1} />
          </pattern>
        </defs>
        {/* shadow under mat */}
        <rect x={mx + 10} y={my + 14} width={mw} height={mh} fill={tint(C.carbon, 0.1 * matOp)} />
        <rect x={mx} y={my} width={mw} height={mh} fill={C.white} fillOpacity={matOp} stroke={tint(C.carbon, 0.9 * matOp)} strokeWidth={2.5} />
        <rect x={mx} y={my} width={mw} height={mh} fill="url(#s3-grid)" opacity={matOp} />
        <g clipPath="url(#s3-window)">
          <g transform={camT}>
            <JerseyDefs uid="s3" />
            <ellipse cx={200} cy={440} rx={210} ry={16} fill={tint(C.carbon, 0.16)} opacity={1 - jerseyFade} />
            {/* S2 hand-off: the finished jersey, exactly as it ended */}
            <g opacity={jerseyFade}>{jerseyFade > 0.001 && <Jersey uid="s3j" b={{...BUILT, design: 3}} />}</g>
            {f > 3 && (
              <g>
                <path d={PATHS.outline} fill="none" stroke={C.graphite} strokeWidth={2.6} opacity={1 - prog(f, 56, 6, ease.linear)} />
                {KEYS.map(renderPiece)}
              </g>
            )}
          </g>
        </g>
        {/* mat corner ticks */}
        {[[mx, my, 1, 1], [mx + mw, my, -1, 1], [mx, my + mh, 1, -1], [mx + mw, my + mh, -1, -1]].map(([x, y, a, b], i) => (
          <path key={i} d={`M${x} ${y + b * 34} V${y} H${x + a * 34}`} fill="none" stroke={C.carbon} strokeWidth={4} opacity={matOp} />
        ))}

        {/* annotations */}
        <Callout frame={f} start={22} end={70} ax={bodyAnchorCut[0]} ay={bodyAnchorCut[1]} lx={SAFE.left} ly={1458} index="01" label="PRECISION CUTTING" />
        <Callout frame={f} start={90} end={132} ax={bodyAnchorPrint[0]} ay={bodyAnchorPrint[1]} lx={W - SAFE.right - 330} ly={1458} index="02" label="SUBLIMATION" />
        <Callout frame={f} start={114} end={150} ax={seamAnchor[0]} ay={seamAnchor[1]} lx={W - SAFE.right - 470} ly={1458} index="03" label="QUALITY CONSTRUCTION" />
        <Callout frame={f} start={146} end={198} ax={chestAnchor[0]} ay={chestAnchor[1]} lx={SAFE.left} ly={1458} index="04" label="EMBROIDERY" />
      </svg>

      {/* step ticker */}
      <div style={{position: 'absolute', left: SAFE.left, top: 596, height: 34, width: 700}}>
        {STEPS.map(([st, label], i) => {
          const next = STEPS[i + 1]?.[0] ?? 999;
          return (
            <div key={label} style={{position: 'absolute', left: 0, top: 0}}>
              <MaskText text={label} start={st} size={24} weight={700} font={MONO} tracking={0.08} lineHeight={1.4} dur={14} color={C.carbon} exitStart={next - 11} exitDur={9} />
            </div>
          );
        })}
      </div>

      {/* headline */}
      <div style={{position: 'absolute', left: SAFE.left, top: 312, width: W - SAFE.left - SAFE.right}}>
        <MaskText text="MANUFACTURED" start={10} dur={22} size={108} color={C.carbon} tracking={-0.04} />
        <MaskText text="WITH PURPOSE." start={18} dur={22} size={108} color={C.carbon} tracking={-0.04} />
      </div>
    </AbsoluteFill>
  );
};

/** Thread feeding the embroidery needle. */
const NeedleThread: React.FC<{d: string; p: number}> = ({d, p}) => <PointLine d={d} p={p} />;

import {pointAt} from '../components/Draw';
const PointLine: React.FC<{d: string; p: number}> = ({d, p}) => {
  const q = pointAt(d, p);
  if (!q) return null;
  return (
    <g>
      <line x1={q.x} y1={q.y} x2={q.x + 40} y2={q.y - 260} stroke={C.porcelain} strokeWidth={5} opacity={0.85} />
      <line x1={q.x} y1={q.y} x2={q.x + 14} y2={q.y - 80} stroke={C.carbon} strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};
