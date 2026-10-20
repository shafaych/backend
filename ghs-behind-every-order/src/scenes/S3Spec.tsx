import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../Scene';
import {C, CUES, MONO, SANS, easeInOut, prog} from '../theme';
import {Jersey} from '../parts/Jersey';
import {Dim} from '../parts/Dim';

const ROWS = ['FABRIC SELECTION', 'SIZE SPECIFICATIONS', 'CUSTOM COLORS', 'ARTWORK PLACEMENT', 'BRANDING OPTIONS', 'ORDER QUANTITY'];
const BARS = [0.62, 0.5, 0.7, 0.56, 0.66, 0.42];
const LEGEND = ['A  CHEST WIDTH', 'B  BODY LENGTH', 'C  SHOULDER WIDTH', 'D  SLEEVE LENGTH'];

export const S3Spec: React.FC = () => {
  const t = useT();
  const s = CUES.s3;
  const docP = prog(t, s.doc, 0.8);
  const gP = prog(t, s.garment, 1.4, easeInOut);
  const aP = (i: number) => prog(t, s.arrows + i * 0.18, 0.7, easeInOut);
  const headP = prog(t, s.head, 0.8);
  const subP = prog(t, s.sub, 0.7);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.35}}>
        {Array.from({length: 28}).map((_, i) => <line key={i} x1={0} x2={1080} y1={i * 72} y2={i * 72} stroke={C.graphite} />)}
      </svg>

      {/* specification sheet */}
      <div style={{
        position: 'absolute', left: 80, width: 920, top: 150, height: 640, boxSizing: 'border-box', background: C.porcelain,
        borderRadius: 10, padding: '30px 44px', opacity: docP, transform: `translateY(${(1 - docP) * 120}px)`,
        boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `3px solid ${C.carbon}`, paddingBottom: 14}}>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 44, color: C.carbon, letterSpacing: -1}}>ORDER SPECIFICATION</div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.graphite, letterSpacing: 1}}>TEMPLATE</div>
        </div>
        <div style={{fontFamily: MONO, fontSize: 27, color: C.graphite, margin: '10px 0 8px', letterSpacing: 1}}>ILLUSTRATIVE FORMAT. NOT A REAL ORDER.</div>
        {ROWS.map((r, i) => {
          const p = prog(t, s.rows[i], 0.5);
          const chk = prog(t, s.rows[i] + 0.2, 0.35);
          return (
            <div key={r} style={{display: 'flex', alignItems: 'center', height: 76, borderBottom: `1.5px solid rgba(23,25,23,0.18)`, opacity: 0.25 + 0.75 * p}}>
              <svg width={44} height={44} style={{flex: 'none'}}>
                <circle cx={22} cy={22} r={19} fill={C.lime} fillOpacity={chk} stroke={C.carbon} strokeWidth={2.5} />
                <path d="M12 23 L19 30 L32 15" fill="none" stroke={C.carbon} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - chk)} />
              </svg>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: C.carbon, marginLeft: 22, width: 470, letterSpacing: -0.5}}>{r}</div>
              <div style={{flex: 1, height: 14, borderRadius: 7, background: 'rgba(23,25,23,0.16)', overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${BARS[i] * 100 * p}%`, background: C.graphite, opacity: 0.55}} />
              </div>
            </div>
          );
        })}
      </div>

      {/* garment spec diagram */}
      <svg width={1080} height={700} style={{position: 'absolute', left: 0, top: 800}} viewBox="0 800 1080 700">
        <g transform="translate(150 840) scale(1.15)">
          <g opacity={gP}>
            <Jersey fill={C.graphiteDark} detail={gP} />
          </g>
          {/* extension guides */}
          <g stroke={C.lime} strokeOpacity={0.45 * aP(0)} strokeDasharray="5 6" strokeWidth={1.5}>
            <line x1={88} y1={200} x2={88} y2={250} /><line x1={312} y1={200} x2={312} y2={250} />
            <line x1={50} y1={62} x2={50} y2={0} /><line x1={350} y1={62} x2={350} y2={0} />
          </g>
          <Dim x1={88} y1={240} x2={312} y2={240} label="A" p={aP(0)} />
          <Dim x1={-34} y1={30} x2={-34} y2={432} label="B" p={aP(1)} labelDx={0} />
          <Dim x1={50} y1={10} x2={350} y2={10} label="C" p={aP(2)} />
          <Dim x1={332} y1={184} x2={396} y2={150} label="D" p={aP(3)} labelDx={42} labelDy={26} />
        </g>
        {/* legend */}
        <g opacity={aP(0)}>
          <text x={690} y={900} fontFamily={MONO} fontSize={27} fill={C.porcelain} letterSpacing={0}>MEASUREMENT POINTS</text>
          <text x={690} y={930} fontFamily={MONO} fontSize={27} fill={C.porcelain} letterSpacing={0}>(ILLUSTRATIVE)</text>
          {LEGEND.map((l, i) => (
            <g key={l} opacity={aP(i)}>
              <circle cx={706} cy={990 + i * 62} r={19} fill="none" stroke={C.lime} strokeWidth={2.5} />
              <text x={706} y={999 + i * 62} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={C.lime}>{l[0]}</text>
              <text x={742} y={999 + i * 62} fontFamily={MONO} fontWeight={700} fontSize={28} fill={C.porcelain}>{l.slice(3)}</text>
            </g>
          ))}
        </g>
      </svg>

      <div style={{position: 'absolute', left: 80, right: 80, top: 1490, opacity: headP, transform: `translateY(${(1 - headP) * 30}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 112, lineHeight: 1.0, color: C.white, letterSpacing: -3}}>
          CLARITY BEFORE<br /><span style={{color: C.lime}}>PRODUCTION.</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 1760, fontFamily: MONO, fontWeight: 700, fontSize: 33, letterSpacing: 1, color: C.porcelain, opacity: subP}}>
        DESIGN • MATERIALS • SIZING • BRANDING
      </div>
    </AbsoluteFill>
  );
};
