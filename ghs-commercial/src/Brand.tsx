import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, LightSweep, MaskLine, Plate, ease, easeIO, lerp, tex} from './common';

/** One glyph that rises through a hard mask. */
const Glyph: React.FC<{ch: string; at: number; size: number; weight?: number; color?: string}> = ({ch, at, size, weight = 700, color = C.porcelain}) => {
  const f = useCurrentFrame();
  const y = lerp(f, 112, 0, at, at + 16, ease);
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', height: size * 0.98, verticalAlign: 'top', opacity: f < at ? 0 : 1}}>
      <span style={{display: 'block', fontFamily: 'Inter', fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: '0.02em', color, transform: `translateY(${y}%)`}}>{ch}</span>
    </span>
  );
};

/** GHS + CUSTOM GEAR as a type-set wordmark (no existing logo is reproduced). */
export const Wordmark: React.FC<{at: [number, number, number]; sub: number; scale?: number; showSub?: boolean}> = ({at, sub, scale = 1, showSub = true}) => {
  const f = useCurrentFrame();
  const rule = lerp(f, 0, 1, sub - 4, sub + 14, ease);
  return (
    <div style={{textAlign: 'center', transform: `scale(${scale})`, transformOrigin: '50% 50%'}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 14}}>
        {['G', 'H', 'S'].map((c, i) => <Glyph key={c} ch={c} at={at[i]} size={340} />)}
      </div>
      <div style={{width: 640 * rule, height: 3, background: C.lime, margin: '26px auto 30px', opacity: showSub ? 1 : 0}} />
      <div style={{display: 'flex', justifyContent: 'center', paddingLeft: '0.62em'}}>
        <MaskLine text="CUSTOM GEAR" at={sub} size={54} weight={300} track={0.62} style={{opacity: showSub ? 1 : 0}} />
      </div>
    </div>
  );
};

const Atmos: React.FC<{base: string; knit: number}> = ({base, knit}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: base}}>
      <div style={{position: 'absolute', inset: 0, opacity: knit}}>
        <Plate src={tex('knit_graphite.jpg')} zoom={1.3} x={lerp(f, -30, 30, 0, 90)} y={lerp(f, 20, -20, 0, 90)} rot={-6} />
      </div>
      <LightSweep p={lerp(f, 0, 1, 0, 90)} angle={20} strength={0.35} />
    </AbsoluteFill>
  );
};

/** 04 — near-black, masked letter build timed to the sonic logo (G 9.55s, H 9.80s, S 10.05s). */
export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Atmos base="#080908" knit={0.1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1920, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(-30px)'}}>
        <Wordmark at={[16, 24, 31]} sub={40} />
      </div>
    </AbsoluteFill>
  );
};

/** 05 — carbon black signature. The wordmark glides up from the reveal position into the lockup. */
export const Lockup: React.FC = () => {
  const f = useCurrentFrame();
  const t = ease(Math.min(1, f / 26));
  const y = lerp(f, 0, -250, 0, 26, easeIO);
  const sc = lerp(f, 1, 0.8, 0, 26, easeIO);
  return (
    <AbsoluteFill>
      <Atmos base={C.carbon} knit={0.06} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${-30 + y}px)`}}>
        <Wordmark at={[-100, -100, -100]} sub={-100} scale={sc} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <MaskLine text="MADE WITH INTENTION." at={15} size={50} weight={500} track={0.14} />
        <div style={{height: 28}} />
        <MaskLine text="CUSTOM SPORTSWEAR MANUFACTURING" at={30} size={25} weight={500} track={0.3} color="rgba(245,245,240,.72)" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1330, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <MaskLine text="ghscustomgear.com" at={45} size={50} weight={500} track={0.04} color={C.lime} />
        <div style={{width: 360 * lerp(f, 0, 1, 52, 72, ease), height: 2, background: C.lime, opacity: 0.8, marginTop: 6}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1560, display: 'flex', justifyContent: 'center'}}>
        <MaskLine text="Product visuals are digitally created concepts." at={58} size={22} weight={400} track={0.06} color="rgba(245,245,240,.55)" />
      </div>
    </AbsoluteFill>
  );
};
