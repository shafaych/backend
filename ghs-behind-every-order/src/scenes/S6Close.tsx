import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../Scene';
import {C, CUES, MONO, SANS, clamp, easeInOut, easeOut, prog} from '../theme';

export const S6Close: React.FC = () => {
  const t = useT();
  const s = CUES.s6;
  // lime sweep reveals the porcelain stage from the bottom
  const wipe = prog(t, s.wipe, 0.7, easeInOut);
  const draw = prog(t, s.mark, 1.4, easeInOut);
  const fillP = prog(t, s.mark + 1.1, 0.8);
  const subP = prog(t, s.mark + 1.4, 0.8);
  const barP = prog(t, s.mark + 0.9, 1.0, easeInOut);
  const tags = [
    ['REAL MANUFACTURING.'],
    ['CLEAR COMMUNICATION.'],
    ['YOUR BRAND.', 'OUR RESPONSIBILITY.'],
  ];
  const ctaP = (i: number) => prog(t, s.cta[i], 0.6);
  const panelP = prog(t, s.cta[0] - 0.3, 0.7, easeInOut);
  // final soft glow pulse on resolve
  const resolveGlow = clamp(1 - Math.abs(t - s.resolve - 0.3) / 1.2);

  return (
    <AbsoluteFill style={{background: C.porcelain}}>
      {/* sweep */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${(1 - wipe) * 100}%`, background: C.carbon, zIndex: 5}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: `${(1 - wipe) * 100}%`, height: 6, background: C.lime, zIndex: 6, opacity: wipe < 1 ? 1 : 0}} />

      {/* wordmark */}
      <svg width={1080} height={420} style={{position: 'absolute', left: 0, top: 200}}>
        <text x={540} y={230} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={250} letterSpacing={-8}
          fill={C.carbon} fillOpacity={fillP} stroke={C.carbon} strokeWidth={3}
          strokeDasharray={1800} strokeDashoffset={1800 * (1 - draw)}>
          GHS
        </text>
        <rect x={140} y={262} width={800 * barP} height={14} fill={C.lime} />
        <text x={540} y={352} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={66}
          letterSpacing={20 - 8 * subP} fill={C.carbon} opacity={subP}>
          CUSTOM GEAR
        </text>
        {/* stitch line detail */}
        <line x1={140} y1={392} x2={940} y2={392} stroke={C.graphite} strokeWidth={3} strokeDasharray="10 9" opacity={0.5 * subP} />
      </svg>

      {/* taglines */}
      <div style={{position: 'absolute', left: 80, right: 80, top: 700}}>
        {tags.map((lines, i) => {
          const p = prog(t, s.tag[i], 0.7);
          return (
            <div key={i} style={{opacity: p, transform: `translateX(${(1 - p) * -40}px)`, marginBottom: 44, display: 'flex', gap: 28, alignItems: 'flex-start'}}>
              <div style={{width: 10, alignSelf: 'stretch', background: i === 2 ? C.lime : C.carbon, borderRadius: 2}} />
              <div>
                {lines.map((l, k) => (
                  <div key={k} style={{fontFamily: SANS, fontWeight: 800, fontSize: 68, lineHeight: 1.1, color: C.carbon, letterSpacing: -1}}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* call to action panel */}
      <div style={{
        position: 'absolute', left: 80, width: 920, top: 1230, height: 520, boxSizing: 'border-box',
        background: C.carbon, borderRadius: 14, padding: '52px 60px',
        opacity: panelP, transform: `translateY(${(1 - panelP) * 40}px)`,
        boxShadow: `0 0 ${60 * resolveGlow}px rgba(200,243,107,${0.55 * resolveGlow})`,
      }}>
        <div style={{fontFamily: MONO, fontSize: 30, letterSpacing: 5, color: C.lime, opacity: ctaP(0)}}>GHS CUSTOM GEAR</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 70, lineHeight: 1.08, color: C.white, marginTop: 22, letterSpacing: -1, opacity: ctaP(0), transform: `translateY(${(1 - ctaP(0)) * 20}px)`}}>
          DISCUSS YOUR<br />CUSTOM ORDER
        </div>
        <div style={{display: 'inline-block', marginTop: 36, background: C.lime, color: C.carbon, fontFamily: SANS, fontWeight: 800, fontSize: 40, padding: '14px 28px', borderRadius: 8, opacity: ctaP(1), transform: `translateY(${(1 - ctaP(1)) * 20}px)`}}>
          MOQ STARTING AT 10 PIECES
        </div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 68, color: C.white, marginTop: 36, opacity: ctaP(2), transform: `translateY(${(1 - ctaP(2)) * 20}px)`, letterSpacing: -1}}>
          ghscustomgear.com
          <div style={{height: 6, background: C.lime, marginTop: 8, width: 700 * easeOut((t - s.cta[2] - 0.2) / 0.7)}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
