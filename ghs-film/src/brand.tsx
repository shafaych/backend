import React from 'react';
import {AbsoluteFill, interpolate, Easing, useCurrentFrame} from 'remotion';
import {C} from './timeline';

const out = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const BrandCard: React.FC = () => {
  const f = useCurrentFrame();
  const rise = (delay: number, dist = 36) => {
    const p = out(interpolate(f, [delay, delay + 22], [0, 1], clamp));
    return {opacity: p, transform: `translateY(${(1 - p) * dist}px)`} as React.CSSProperties;
  };
  const ghsP = out(interpolate(f, [6, 30], [0, 1], clamp));
  const lineP = out(interpolate(f, [22, 50], [0, 1], clamp));
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 55% at 50% 42%, ${C.graphite} 0%, ${C.carbon} 70%)`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Barlow Condensed', sans-serif", color: C.porcelain, textTransform: 'uppercase', marginTop: -40}}>
        {/* wordmark: GHS settles from wide tracking */}
        <div style={{overflow: 'hidden', height: 300, lineHeight: '300px'}}>
          <div style={{fontSize: 330, fontWeight: 700, letterSpacing: `${(1 - ghsP) * 0.35 + 0.02}em`, paddingLeft: '0.02em', opacity: ghsP, transform: `translateY(${(1 - ghsP) * 40}%)`}}>GHS</div>
        </div>
        <div style={{height: 2, width: 560 * lineP, background: C.lime, margin: '18px 0 26px'}} />
        <div style={{fontSize: 104, fontWeight: 600, letterSpacing: '0.28em', paddingLeft: '0.28em', ...rise(26, 24)}}>CUSTOM GEAR</div>

        <div style={{fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 44, letterSpacing: '0.04em', marginTop: 112, ...rise(46)}}>YOUR DESIGN. OUR PRODUCTION.</div>
        <div style={{fontSize: 33, fontWeight: 500, letterSpacing: '0.3em', paddingLeft: '0.3em', marginTop: 30, color: 'rgba(245,245,240,0.7)', ...rise(56, 26)}}>CUSTOM SPORTSWEAR MANUFACTURING</div>

        <div style={{marginTop: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
          <div style={{fontFamily: "'Barlow', sans-serif", textTransform: 'none', fontWeight: 600, fontSize: 46, letterSpacing: '0.06em', color: C.lime, ...rise(70, 22)}}>ghscustomgear.com</div>
          <div style={{fontSize: 28, fontWeight: 500, letterSpacing: '0.26em', paddingLeft: '0.26em', border: '1.5px solid rgba(200,243,107,0.55)', padding: '12px 26px 12px 32px', borderRadius: 2, ...rise(80, 16)}}>MOQ STARTING AT 10 PIECES</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
