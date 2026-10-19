import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {C, MONO, FONT, W, H, tint} from '../styles/brand';
import {SAFE} from '../styles/safe';
import {Backdrop} from '../components/Backdrop';
import {CornerMarks, PhaseTracker} from '../components/Hud';
import {MaskText} from '../components/MaskText';
import {Garment, GPal, Kind, KIND_LABEL, G_W, G_H} from '../components/Garments';
import {ease, prog} from '../utils/anim';

const SETS: GPal[] = [
  {main: C.carbon, alt: C.graphite, trim: C.lime, line: C.carbon, ink: C.lime},
  {main: C.white, alt: C.carbon, trim: C.lime, line: C.carbon, ink: C.carbon},
  {main: C.graphite, alt: C.porcelain, trim: C.lime, line: C.carbon, ink: C.porcelain},
  {main: C.porcelain, alt: C.carbon, trim: C.lime, line: C.carbon, ink: C.carbon},
];
const mixPal = (a: GPal, b: GPal, t: number): GPal => ({
  main: interpolateColors(t, [0, 1], [a.main, b.main]),
  alt: interpolateColors(t, [0, 1], [a.alt, b.alt]),
  trim: C.lime,
  line: C.carbon,
  ink: interpolateColors(t, [0, 1], [a.ink, b.ink]),
});

const KINDS: Kind[] = ['soccer', 'basketball', 'football', 'tracksuit', 'training'];
const CW = 450;
const CH = 330;
const POS = [
  {x: SAFE.left, y: 560},
  {x: SAFE.left + CW + 36, y: 560 + 40},
  {x: SAFE.left, y: 560 + CH + 24},
  {x: SAFE.left + CW + 36, y: 560 + CH + 24 + 40},
  {x: SAFE.left + (CW + 36) / 2, y: 560 + (CH + 24) * 2},
];

/** SCENE 04 — PRODUCT RANGE (0:20–0:28) */
export const Scene4Range: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = 112;
  const cyc = prog(frame, 122, 100, ease.linear) * 3;
  const camY = -prog(frame, 0, 240, ease.linear) * 24;

  return (
    <AbsoluteFill>
      <Backdrop tone="light" cell={72} drift={0.3} cam={{x: 0, y: camY}} />
      <CornerMarks dark={false} />
      <PhaseTracker active={4} dark={false} start={0} />

      <div style={{position: 'absolute', left: SAFE.left, top: 312, width: W - SAFE.left - SAFE.right}}>
        <div style={{position: 'relative', height: 200}}>
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <MaskText text="ONE" start={8} dur={22} size={98} color={C.carbon} exitStart={swap - 6} exitDur={12} />
            <MaskText text="MANUFACTURER." start={14} dur={22} size={98} color={C.carbon} exitStart={swap - 4} exitDur={12} />
          </div>
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <MaskText text="ENDLESS" start={swap + 8} dur={22} size={98} color={C.carbon} />
            <MaskText text="POSSIBILITIES." start={swap + 14} dur={22} size={98} color={C.carbon} />
          </div>
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, transform: `translateY(${camY}px)`}}>
        {KINDS.map((k, i) => {
          const st = 26 + i * 8;
          const inP = prog(frame, st, 26, ease.outExpo);
          const draw = prog(frame, st + 4, 30, ease.inOut);
          const fill = prog(frame, st + 18, 22, ease.outQuart);
          const baseIdx = [0, 1, 2, 3, 0][i];
          const t = cyc + 0;
          const seg = Math.min(2.999, t);
          const a = Math.floor(seg);
          const local = ease.inOut(Math.min(1, Math.max(0, (seg - a - 0.72) / 0.28)));
          const ia = (baseIdx + a) % 4;
          const ib = (baseIdx + a + 1) % 4;
          const pal = mixPal(SETS[ia], SETS[ib], local);
          const tilt = (1 - inP) * -32 + Math.sin(frame / 38 + i) * 2 * prog(frame, 120, 20);
          const [l1, l2] = KIND_LABEL[k];
          const p = POS[i];
          return (
            <div
              key={k}
              style={{
                position: 'absolute', left: p.x, top: p.y, width: CW, height: CH,
                opacity: inP, transform: `translateY(${(1 - inP) * 90}px) scaleX(${Math.cos((tilt * Math.PI) / 180).toFixed(4)}) skewY(${(tilt * 0.22).toFixed(3)}deg)`, transformOrigin: 'left center',
                background: C.white, border: `2px solid ${tint(C.carbon, 0.85)}`, boxShadow: `14px 16px 0 ${tint(C.carbon, 0.08)}`,
                clipPath: `inset(0 ${(1 - inP) * 60}% 0 0)`,
              }}
            >
              <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} style={{position: 'absolute', inset: 0}}>
                <ellipse cx={120} cy={CH - 18} rx={80} ry={8} fill={tint(C.carbon, 0.14)} />
                <g transform={`translate(18 14) scale(${(CH - 40) / G_H})`}>
                  <Garment kind={k} pal={pal} draw={draw} fill={fill} />
                </g>
              </svg>
              <div style={{position: 'absolute', left: 236, top: 28, right: 14}}>
                <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: 2, color: tint(C.carbon, 0.5)}}>0{i + 1}</div>
                <div style={{width: 40, height: 5, background: C.lime, margin: '12px 0 16px', outline: `2px solid ${C.carbon}`}} />
                <div style={{fontFamily: FONT, fontWeight: 900, fontSize: l1.length >= 10 ? 25 : 34, lineHeight: 1.05, letterSpacing: '-0.02em', color: C.carbon}}>{l1}</div>
                <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: tint(C.carbon, 0.6), marginTop: 8}}>{l2}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
