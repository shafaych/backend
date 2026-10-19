import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {C, MONO, FONT, W, tint} from '../styles/brand';
import {SAFE} from '../styles/safe';
import {Backdrop} from '../components/Backdrop';
import {CornerMarks, PhaseTracker} from '../components/Hud';
import {MaskText} from '../components/MaskText';
import {ease, fmtInt, lerp, prog} from '../utils/anim';

type Fact = {value: (c: number) => string; unit?: string; label: string; slot: number; hero: number; text?: boolean};

const FACTS: Fact[] = [
  {value: (c) => `${Math.round(c * 10)}`, unit: 'PCS', label: 'LOW MOQ', slot: 150, hero: 380},
  {value: (c) => `${Math.round(c * 100)}+`, label: 'MACHINES', slot: 150, hero: 380},
  {value: (c) => `${fmtInt(c * 3000)}–${fmtInt(c * 5000)}`, label: 'PIECES / MONTH', slot: 96, hero: 124},
  {value: () => 'PRIVATE LABEL', label: 'MANUFACTURING', slot: 82, hero: 98, text: true},
];

const X = SAFE.left;
const CWD = W - SAFE.left - SAFE.right;
const Y0 = 350;
const RH = 276;
const GAP = 18;
const ZONE_H = RH * 4 + GAP * 3;

/** SCENE 05 — B2B ADVANTAGE (0:28–0:36) */
export const Scene5B2B: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Backdrop tone="light" cell={72} drift={0.3} />
      <CornerMarks dark={false} />
      <PhaseTracker active={4} dark={false} start={0} />

      <div style={{position: 'absolute', left: X, top: 290, width: CWD}}>
        <MaskText text="THE B2B ADVANTAGE" start={4} dur={18} size={24} weight={700} font={MONO} tracking={0.14} lineHeight={1.4} color={C.carbon} />
      </div>

      {FACTS.map((fact, i) => {
        const t = 8 + i * 52;
        const a = prog(frame, t, 18, ease.outExpo) - prog(frame, t + 40, 16, ease.inOut);
        const shown = frame >= t;
        const c = prog(frame, t + 8, 34, ease.outQuart);
        const slotY = Y0 + i * (RH + GAP);
        const y = lerp(slotY, Y0, a);
        const h = lerp(RH, ZONE_H, a);
        const bg = interpolateColors(a, [0, 1], [C.white, C.carbon]);
        const ink = interpolateColors(a, [0, 1], [C.carbon, C.porcelain]);
        const size = lerp(fact.slot, fact.hero, a);
        const heroTop = Y0 + ZONE_H / 2 - size * 0.62;
        const top = lerp(slotY + 30, heroTop, a);
        const labelTop = top + size * 1.02 + lerp(0, 8, a);
        const padX = lerp(36, 52, a);
        const born = prog(frame, t - 6, 14, ease.outExpo);
        const ticks = Array.from({length: 26});
        return (
          <div key={i} style={{position: 'absolute', left: X, top: y, width: CWD, height: h, zIndex: i + (a > 0.01 ? 10 : 0)}}>
            {/* empty slot until it is this fact's turn */}
            <div style={{position: 'absolute', inset: 0, border: `2px dashed ${tint(C.carbon, 0.25)}`, opacity: shown ? 0 : 1}} />
            <div
              style={{
                position: 'absolute', inset: 0, background: bg, border: `2px solid ${tint(C.carbon, 0.9)}`,
                boxShadow: `12px 14px 0 ${tint(C.carbon, 0.07 * (1 - a))}`,
                clipPath: `inset(0 ${(1 - born) * 100}% 0 0)`, overflow: 'hidden',
              }}
            >
              {/* lime index block */}
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: C.lime}} />
              {/* ruler ticks (hero) */}
              <svg width={CWD} height={h} style={{position: 'absolute', inset: 0, opacity: a}}>
                {ticks.map((_, k) => {
                  const ty = 40 + k * ((h - 80) / 25);
                  const long = k % 5 === 0;
                  return <line key={k} x1={CWD - 28} x2={CWD - (long ? 80 : 54)} y1={ty} y2={ty} stroke={tint(C.porcelain, long ? 0.5 : 0.25)} strokeWidth={2} />;
                })}
                <line x1={padX} x2={padX + (CWD - padX * 2 - 90) * c} y1={h - 56} y2={h - 56} stroke={C.lime} strokeWidth={5} />
              </svg>
              <div style={{position: 'absolute', right: 26 + (1 - a) * 0, top: 20, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: tint(ink, 0.5)}}>
                0{i + 1}
              </div>
            </div>
            {shown && (
              <div style={{position: 'absolute', left: padX + 14, top: top - y, width: CWD - padX - 40, color: ink, fontFamily: FONT, fontWeight: 900, whiteSpace: 'nowrap'}}>
                {fact.text ? (
                  <MaskText text={fact.value(1)} chars start={t + 8} stagger={1.1} dur={18} size={size} color={ink} tracking={-0.045} lineHeight={1} />
                ) : (
                  <div style={{fontSize: size, lineHeight: 1, letterSpacing: '-0.045em', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'baseline', gap: size * 0.12}}>
                    <span style={{color: a > 0.5 ? C.lime : C.carbon}}>{fact.value(c)}</span>
                    {fact.unit && <span style={{fontSize: size * 0.36, letterSpacing: '0.02em', color: ink}}>{fact.unit}</span>}
                  </div>
                )}
              </div>
            )}
            {shown && (
              <div style={{position: 'absolute', left: padX + 14, top: labelTop - y, width: CWD - padX * 2}}>
                <MaskText text={fact.label} start={t + 14} dur={18} size={lerp(34, 48, a)} weight={800} font={MONO} tracking={0.1} lineHeight={1.2} color={ink} />
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
