import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, FONT, W, H, tint} from '../styles/brand';
import {SAFE} from '../styles/safe';
import {Backdrop} from '../components/Backdrop';
import {Jersey, Build, PAL} from '../components/Jersey';
import {MaskText} from '../components/MaskText';
import {CornerMarks, PhaseTracker} from '../components/Hud';
import {ease, prog} from '../utils/anim';

/** Jersey stage used by both Scene 2 and the Scene 3 match-cut. */
export const STAGE = {cx: 540, cy: 1060, scale: 1.9, jcx: 200, jcy: 225};
export const stageTransform = (s = STAGE.scale) =>
  `translate(${STAGE.cx - STAGE.jcx * s} ${STAGE.cy - STAGE.jcy * s}) scale(${s})`;

const STEPS: [number, string][] = [
  [6, '01 — SILHOUETTE'],
  [30, '02 — SHOULDER PANELS'],
  [50, '03 — FABRIC PATTERN'],
  [76, '04 — COLLAR + SEAMS'],
  [108, '05 — TEAM NUMBER'],
  [124, '06 — GHS MARK'],
  [134, 'COLORWAY A'],
  [154, 'COLORWAY B'],
  [174, 'COLORWAY C'],
];
const CW_STARTS = [132, 152, 172];

/** SCENE 02 — CUSTOMIZATION (0:05–0:12) */
export const Scene2Customization: React.FC = () => {
  const frame = useCurrentFrame();

  const b: Build = {
    outline: prog(frame, 0, 26, ease.outQuart),
    body: prog(frame, 4, 38, ease.inOut),
    sleeves: prog(frame, 30, 30, ease.outQuart),
    pattern: prog(frame, 50, 36, ease.outQuart),
    seams: prog(frame, 76, 34, ease.inOut),
    number: prog(frame, 108, 22, ease.outQuart),
    logo: prog(frame, 124, 18, ease.outQuart),
    // layers [D0, D1, D2, D0]: three quick colourway changes, ending where Scene 3 begins
    design:
      prog(frame, CW_STARTS[0], 16, ease.inOut) + prog(frame, CW_STARTS[1], 16, ease.inOut) + prog(frame, CW_STARTS[2], 16, ease.inOut),
  };

  const yaw = (1 - prog(frame, 0, 90, ease.outQuart)) * -22;
  const settle = prog(frame, 0, 60, ease.outQuart);
  const shadow = prog(frame, 10, 40, ease.outQuart);
  const exit = prog(frame, 192, 14, ease.inExpo);
  const active = frame < CW_STARTS[0] ? -1 : frame < CW_STARTS[1] ? 0 : frame < CW_STARTS[2] ? 1 : 2;
  const ghostShift = (frame - 100) * 0.35;

  return (
    <AbsoluteFill>
      <Backdrop tone="light" cell={72} drift={0.25} />
      <CornerMarks dark={false} start={0} />
      <PhaseTracker active={1} dark={false} />

      {/* depth layer: oversized outlined numeral, drifting against the jersey */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <text
          x={540 + ghostShift} y={1290} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={820} letterSpacing={-30}
          fill="none" stroke={tint(C.carbon, 0.1)} strokeWidth={2.5} opacity={settle}
        >
          07
        </text>
        {/* contact shadow */}
        <ellipse cx={540} cy={1462} rx={350 * shadow} ry={28 * shadow} fill={tint(C.carbon, 0.2)} />
        <ellipse cx={540} cy={1462} rx={230 * shadow} ry={12 * shadow} fill={tint(C.carbon, 0.22)} />
      </svg>

      {/* jersey (3D settle) */}
      <div style={{position: 'absolute', inset: 0, perspective: 1600, perspectiveOrigin: '50% 55%'}}>
        <svg
          width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          style={{position: 'absolute', inset: 0, overflow: 'visible', transform: `rotateY(${yaw}deg)`, transformOrigin: '540px 1060px'}}
        >
          <g transform={stageTransform()}>
            <Jersey uid="s2" b={b} />
          </g>
        </svg>
      </div>

      {/* step ticker — states what is being built right now */}
      <div style={{position: 'absolute', left: SAFE.left, top: 606, height: 34, width: 600, opacity: 1 - exit}}>
        {STEPS.map(([s, label], i) => {
          const nextStart = STEPS[i + 1]?.[0] ?? 999;
          return (
            <div key={label} style={{position: 'absolute', left: 0, top: 0}}>
              <MaskText
                text={label} start={s} size={24} weight={700} font={MONO} tracking={0.08} lineHeight={1.4} dur={14}
                color={C.carbon} exitStart={nextStart - 11} exitDur={9}
              />
            </div>
          );
        })}
      </div>

      {/* colourway swatches */}
      <div style={{position: 'absolute', right: SAFE.right - 24, top: 700, opacity: prog(frame, 128, 12) * (1 - exit)}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginBottom: 14, opacity: active === i ? 1 : 0.55}}>
            <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: C.carbon}}>{String.fromCharCode(65 + i)}</span>
            <span
              style={{
                width: 44, height: 44, background: PAL[i].base, border: `3px solid ${C.carbon}`,
                outline: active === i ? `3px solid ${C.lime}` : 'none', outlineOffset: 3, transform: `scale(${active === i ? 1.1 : 1})`,
              }}
            />
          </div>
        ))}
      </div>

      {/* typography */}
      <div style={{position: 'absolute', left: SAFE.left, top: 312, width: W - SAFE.left - SAFE.right}}>
        <MaskText text="BUILT AROUND" start={8} dur={22} size={128} color={C.carbon} exitStart={190} exitDur={14} tracking={-0.04} />
        <MaskText text="YOUR VISION." start={16} dur={22} size={128} color={C.carbon} exitStart={194} exitDur={14} tracking={-0.04} />
      </div>
      <div style={{position: 'absolute', left: SAFE.left, top: 1496, width: W - SAFE.left - SAFE.right}}>
        <MaskText text="Custom Teamwear. Your Identity." start={96} dur={20} size={44} weight={700} color={C.carbon} tracking={-0.01} lineHeight={1.25} exitStart={196} exitDur={12} />
        <div style={{height: 4, marginTop: 6, width: 160 * prog(frame, 100, 24), background: C.lime, opacity: 1 - exit}} />
      </div>
    </AbsoluteFill>
  );
};
