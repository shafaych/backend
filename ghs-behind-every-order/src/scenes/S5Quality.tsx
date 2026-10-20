import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../Scene';
import {C, CUES, MONO, SANS, clamp, easeInOut, keyframe, prog} from '../theme';
import {Jersey} from '../parts/Jersey';

const JX = 190, JY = 215, JS = 1.7; // jersey placement on screen
const J = (x: number, y: number): [number, number] => [JX + x * JS, JY + y * JS];
const POINTS: [number, number][] = [J(95, 46), J(200, 200), J(200, 164), J(200, 426), [860, 870]];
const ITEMS = [
  ['STITCHING', 'Seams and thread lines'],
  ['SIZING', 'Measurements against spec'],
  ['PRINT PLACEMENT', 'Position and alignment'],
  ['FINISHING', 'Hems, trims, loose threads'],
  ['PACKAGING', 'Folding, labeling, packing'],
];
const LENS_R = 140, ZOOM = 2.3;

const Bag: React.FC = () => (
  <g transform="translate(770 790)">
    <rect x={0} y={0} width={180} height={150} rx={10} fill="rgba(245,245,240,0.10)" stroke={C.porcelain} strokeWidth={3} />
    <rect x={22} y={34} width={136} height={96} rx={4} fill={C.graphite} stroke={C.porcelain} strokeOpacity={0.6} strokeWidth={2} />
    <path d="M22 60 L158 60" stroke={C.lime} strokeWidth={5} />
    <rect x={112} y={80} width={36} height={36} fill="none" stroke={C.porcelain} strokeWidth={2.5} />
    <path d="M0 18 L180 18" stroke={C.porcelain} strokeWidth={2} strokeDasharray="4 5" />
  </g>
);

const Art: React.FC = () => (
  <g>
    <g transform={`translate(${JX} ${JY}) scale(${JS})`}><Jersey fill={C.graphiteDark} /></g>
    <Bag />
  </g>
);

export const S5Quality: React.FC = () => {
  const t = useT();
  const s = CUES.s5;
  const base = CUES.scenes[4];
  const jP = prog(t, base + 0.1, 1.0);
  const times = [s.callouts[0] - 0.5, ...s.callouts, s.head];
  const lx = keyframe(t, times, [POINTS[0][0], ...POINTS.map((p) => p[0]), POINTS[4][0]]);
  const ly = keyframe(t, times, [POINTS[0][1], ...POINTS.map((p) => p[1]), POINTS[4][1]]);
  // lens easing: moves between points in the 0.55s before each callout time
  const px = (i: number) => POINTS[i][0], py = (i: number) => POINTS[i][1];
  let cx = px(0), cy = py(0);
  for (let i = 1; i < 5; i++) {
    const m = easeInOut((t - (s.callouts[i] - 0.7)) / 0.6);
    if (m > 0) { cx = px(i - 1) + (px(i) - px(i - 1)) * m; cy = py(i - 1) + (py(i) - py(i - 1)) * m; }
  }
  void lx; void ly;
  const lensP = prog(t, s.callouts[0] - 0.4, 0.5) * (1 - prog(t, s.callouts[4] + 0.9, 0.5));
  const r = LENS_R * lensP;
  let cur = -1;
  s.callouts.forEach((ct, i) => { if (t >= ct - 0.1) cur = i; });
  const scanP = clamp((t - s.scan) / 1.5);
  const scanY = JY + scanP * 450 * JS * 0.97;
  const headP = prog(t, s.head, 0.8);
  const subP = prog(t, s.sub, 0.7);
  const pillX = Math.min(800, Math.max(280, cx));

  return (
    <AbsoluteFill>
      <svg width={1080} height={1000} style={{position: 'absolute', left: 0, top: 120}} viewBox="0 120 1080 1000">
        <defs>
          <clipPath id="lens"><circle cx={cx} cy={cy} r={r} /></clipPath>
        </defs>
        {/* rulers */}
        <g opacity={jP * 0.8} stroke={C.porcelain} strokeOpacity={0.5}>
          {Array.from({length: 33}).map((_, i) => <line key={'r' + i} x1={150} x2={i % 4 === 0 ? 120 : 135} y1={JY + i * 24} y2={JY + i * 24} />)}
          {Array.from({length: 31}).map((_, i) => <line key={'b' + i} y1={1000} y2={i % 4 === 0 ? 1030 : 1015} x1={JX + i * 24} x2={JX + i * 24} />)}
        </g>
        <g opacity={jP}><Art /></g>
        {/* scan */}
        {scanP > 0 && scanP < 1 ? (
          <g>
            <line x1={150} x2={930} y1={scanY} y2={scanY} stroke={C.lime} strokeWidth={3} />
            <rect x={150} y={scanY - 60} width={780} height={60} fill={C.lime} opacity={0.08} />
            <text x={940} y={scanY - 10} textAnchor="end" fontFamily={MONO} fontSize={24} fill={C.lime} fontWeight={700}>MEASURING</text>
          </g>
        ) : null}
        {/* lens */}
        {lensP > 0.01 ? (
          <g>
            <circle cx={cx} cy={cy} r={r} fill={C.carbon} />
            <g clipPath="url(#lens)">
              <g transform={`translate(${cx} ${cy}) scale(${ZOOM}) translate(${-cx} ${-cy})`}>
                <Art />
                {/* detail overlays visible only under magnification */}
                <g stroke={C.lime} strokeWidth={1.5} fill="none">
                  {cur === 0 ? <path d={`M${POINTS[0][0] - 40} ${POINTS[0][1] - 14} L${POINTS[0][0] + 50} ${POINTS[0][1] + 20}`} strokeDasharray="5 4" strokeWidth={3} /> : null}
                  {cur === 2 ? <g><line x1={cx - 60} x2={cx + 60} y1={cy} y2={cy} /><line y1={cy - 60} y2={cy + 60} x1={cx} x2={cx} /></g> : null}
                  {cur === 1 ? <g><line x1={cx - 112 * JS * 0.55} x2={cx + 112 * JS * 0.55} y1={cy} y2={cy} /></g> : null}
                </g>
              </g>
            </g>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.lime} strokeWidth={6} />
            <line x1={cx + r * 0.7} y1={cy + r * 0.7} x2={cx + r * 1.15} y2={cy + r * 1.15} stroke={C.lime} strokeWidth={14} strokeLinecap="round" />
            <g transform={`translate(${pillX} ${cy - r - 34 < 175 ? cy + r + 60 : cy - r - 34})`} opacity={lensP}>
              <rect x={-170} y={-30} width={340} height={52} rx={26} fill={C.lime} />
              <text x={0} y={7} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={28} fill={C.carbon}>{cur >= 0 ? `0${cur + 1} ${ITEMS[cur][0]}` : ''}</text>
            </g>
          </g>
        ) : null}
      </svg>

      {/* checklist */}
      <div style={{position: 'absolute', left: 80, width: 920, top: 1130}}>
        {ITEMS.map(([name, desc], i) => {
          const p = prog(t, s.callouts[i], 0.4);
          const active = cur === i;
          return (
            <div key={name} style={{display: 'flex', alignItems: 'center', height: 64, borderBottom: `1.5px solid ${C.graphite}`, opacity: 0.35 + 0.65 * p}}>
              <svg width={40} height={40} style={{flex: 'none'}}>
                <circle cx={20} cy={20} r={17} fill={C.lime} fillOpacity={p} stroke={C.lime} strokeWidth={2.5} />
                <path d="M11 21 L18 28 L30 13" fill="none" stroke={C.carbon} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - p)} />
              </svg>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: active ? C.lime : C.white, marginLeft: 20, width: 400, letterSpacing: -0.5}}>{name}</div>
              <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.mute}}>{desc}</div>
            </div>
          );
        })}
      </div>

      <div style={{position: 'absolute', left: 80, right: 80, top: 1500, opacity: headP, transform: `translateY(${(1 - headP) * 30}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 118, color: C.white, letterSpacing: -3, lineHeight: 1}}>DETAILS <span style={{color: C.lime}}>MATTER.</span></div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 1670, opacity: subP, transform: `translateY(${(1 - subP) * 20}px)`}}>
        <div style={{height: 4, width: 920 * subP, background: C.lime, marginBottom: 24}} />
        <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 42, color: C.porcelain, letterSpacing: 1}}>QUALITY CONTROL &amp; INSPECTION</div>
      </div>
    </AbsoluteFill>
  );
};
