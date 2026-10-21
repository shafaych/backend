import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, FPS} from './theme';
import {Reveal} from './Reveal';

export const BrandCard: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame() - start;
  const t = f / FPS;
  const bg = interpolate(f, [-8, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bar = interpolate(t, [0.7, 1.5], [0, 1], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const url = interpolate(t, [2.6, 3.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const endFade = interpolate(f, [4 * FPS - 14, 4 * FPS], [1, 0.0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const abs = (s: number) => start / FPS + s;
  return (
    <AbsoluteFill style={{opacity: bg * (0.0 + 1) * (f > 4 * FPS - 14 ? 1 : 1), background: `radial-gradient(ellipse at 50% 42%, ${C.graphite} 0%, ${C.carbon} 62%)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: FONT, opacity: Math.max(endFade, 0.0) * 0 + 1}}>
        <Reveal from={abs(0.15)} to={99}><div style={{fontWeight: 900, fontSize: 250, letterSpacing: -8, color: C.white, lineHeight: 0.95}}>GHS</div></Reveal>
        <div style={{width: 560 * bar, height: 10, background: C.lime, margin: '18px 0 26px'}} />
        <Reveal from={abs(0.9)} to={99}><div style={{fontWeight: 800, fontSize: 66, letterSpacing: 24, color: C.porcelain, paddingLeft: 24}}>CUSTOM GEAR</div></Reveal>
        <div style={{height: 120}} />
        <Reveal from={abs(1.6)} to={99}><div style={{fontWeight: 900, fontSize: 52, letterSpacing: 3, color: C.lime}}>YOUR VISION. OUR PRODUCTION.</div></Reveal>
        <div style={{height: 26}} />
        <Reveal from={abs(2.1)} to={99}><div style={{fontWeight: 600, fontSize: 32, letterSpacing: 1, color: C.porcelain, opacity: 0.9}}>Custom Sportswear &amp; Team Uniform Manufacturing</div></Reveal>
        <div style={{height: 90, }} />
        <div style={{opacity: url, transform: `translateY(${(1 - url) * 16}px)`, fontWeight: 800, fontSize: 46, letterSpacing: 3, color: C.white, borderBottom: `4px solid ${C.lime}`, paddingBottom: 10}}>ghscustomgear.com</div>
      </div>
    </AbsoluteFill>
  );
};
