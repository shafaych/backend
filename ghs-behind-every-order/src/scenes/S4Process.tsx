import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../Scene';
import {C, CUES, MONO, SANS, clamp, easeInOut, keyframe, prog} from '../theme';

const STAGES = [
  ['REQUIREMENTS', 'Designs, sizes, quantities'],
  ['CONFIRMATION', 'Order details reviewed together'],
  ['PRODUCTION', 'Cutting, sewing, decoration'],
  ['INSPECTION', 'Checked before packing'],
  ['DISPATCH', 'Shipping details discussed'],
];
const MESSAGE = 'Example update: sewing stage in progress. Inspection is next.';
const Y0 = 215, STEP = 168;

export const S4Process: React.FC = () => {
  const t = useT();
  const s = CUES.s4;
  const tokenY = keyframe(t, [s.stages[0] - 0.4, ...s.stages], [Y0 + 70, ...STAGES.map((_, i) => Y0 + 70 + i * STEP)]);
  const panelP = prog(t, s.panel, 0.7, easeInOut);
  const typed = Math.floor(clamp((t - s.panel - 0.5) / 1.4) * MESSAGE.length);
  const k1 = prog(t, s.k1, 0.7), k2 = prog(t, s.k2, 0.7);
  const lineH = clamp((t - (s.stages[0] - 0.4)) / (s.stages[4] - s.stages[0] + 0.4)) * 4 * STEP;

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 80, top: 140, fontFamily: MONO, fontSize: 28, letterSpacing: 4, color: C.lime}}>ILLUSTRATIVE ORDER FLOW</div>

      {/* rail */}
      <div style={{position: 'absolute', left: 80 + 45 - 2, top: Y0 + 70, width: 4, height: 4 * STEP, background: C.graphite}} />
      <div style={{position: 'absolute', left: 80 + 45 - 2, top: Y0 + 70, width: 4, height: lineH, background: C.lime}} />

      {STAGES.map(([name, desc], i) => {
        const a = prog(t, s.stages[i], 0.5);
        const cur = t >= s.stages[i] && (i === 4 || t < s.stages[i + 1]);
        return (
          <div key={name} style={{
            position: 'absolute', left: 80, width: 920, top: Y0 + i * STEP, height: 140, boxSizing: 'border-box',
            border: `2px solid ${a > 0 ? C.lime : C.graphite}`, borderRadius: 10,
            background: `rgba(200,243,107,${0.13 * a * (cur ? 1 : 0.5)})`,
            display: 'flex', alignItems: 'center', paddingLeft: 24, opacity: 0.45 + 0.55 * a,
            transform: `translateX(${(1 - a) * 20 * 0}px)`,
          }}>
            <div style={{width: 90, height: 90, borderRadius: 45, background: a > 0.5 ? C.lime : 'transparent', border: `3px solid ${C.lime}`, color: a > 0.5 ? C.carbon : C.lime,
              fontFamily: MONO, fontWeight: 800, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
              {i + 1}
            </div>
            <div style={{marginLeft: 36}}>
              <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 54, color: C.white, letterSpacing: -1, lineHeight: 1}}>{name}</div>
              <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 31, color: C.mute, marginTop: 10}}>{desc}</div>
            </div>
            {i < 4 ? <div style={{position: 'absolute', right: 34, fontFamily: MONO, fontSize: 36, color: C.lime, opacity: a}}>→</div> : null}
          </div>
        );
      })}
      {/* order token */}
      <div style={{position: 'absolute', left: 80 + 45 - 13, top: tokenY - 13, width: 26, height: 26, background: C.white, transform: 'rotate(45deg)', boxShadow: `0 0 24px ${C.lime}`, opacity: clamp((t - (s.stages[0] - 0.4)) / 0.3), zIndex: 3}} />

      {/* communication panel */}
      <div style={{
        position: 'absolute', left: 80, width: 920, top: 1075, height: 360, boxSizing: 'border-box', borderRadius: 14,
        background: C.graphiteDark, border: `2px solid ${C.graphite}`, overflow: 'hidden',
        opacity: panelP, transform: `translateY(${(1 - panelP) * 50}px)`,
      }}>
        <div style={{height: 64, background: C.graphite, display: 'flex', alignItems: 'center', padding: '0 26px', gap: 14}}>
          <div style={{width: 14, height: 14, borderRadius: 7, background: C.lime}} />
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.porcelain, letterSpacing: 1}}>PRODUCTION UPDATE. CONCEPT ONLY</div>
        </div>
        <div style={{padding: '26px 30px'}}>
          <div style={{background: C.porcelain, color: C.carbon, borderRadius: '16px 16px 16px 4px', padding: '22px 26px', fontFamily: SANS, fontWeight: 600, fontSize: 36, lineHeight: 1.25, minHeight: 112}}>
            {MESSAGE.slice(0, typed)}<span style={{opacity: typed < MESSAGE.length ? 1 : 0, color: C.lime}}>▌</span>
          </div>
          <div style={{fontFamily: MONO, fontSize: 24, color: C.mute, marginTop: 24, lineHeight: 1.4, opacity: prog(t, s.panel + 2.0, 0.6)}}>
            Format and frequency of updates to be<br />agreed with your GHS contact.
          </div>
        </div>
      </div>

      <div style={{position: 'absolute', left: 80, right: 80, top: 1500}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 86, color: C.white, letterSpacing: -2, opacity: k1, transform: `translateY(${(1 - k1) * 24}px)`}}>KNOW THE PROCESS.</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 86, lineHeight: 1.02, color: C.lime, letterSpacing: -2, opacity: k2, transform: `translateY(${(1 - k2) * 24}px)`, marginTop: 8}}>
          ASK THE RIGHT<br />QUESTIONS.
        </div>
      </div>
    </AbsoluteFill>
  );
};
