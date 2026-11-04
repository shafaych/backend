import React from 'react';
import {AbsoluteFill, interpolate, Easing, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from './timeline';

const out = Easing.bezier(0.16, 1, 0.3, 1);
const M = 72; // consistent outer margin
const cond: React.CSSProperties = {fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', color: C.porcelain};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const exit = (f: number, dur: number, n = 7) => interpolate(f, [dur - n, dur], [1, 0], clamp);

const Scrim: React.FC<{side: 'top' | 'bottom'; o: number}> = ({side, o}) => (
  <AbsoluteFill style={{background: `linear-gradient(${side === 'top' ? '180deg' : '0deg'}, rgba(23,25,23,${0.62 * o}) 0%, rgba(23,25,23,0) 42%)`}} />
);

// SCENE 01 — two stacked lines rise out of masks while tracking tightens; the full stop lands last in lime.
export const T1: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const o = exit(f, D);
  const line = (txt: string, delay: number, dot?: boolean) => {
    const p = out(interpolate(f, [delay, delay + 16], [0, 1], clamp));
    const dotP = interpolate(f, [delay + 14, delay + 20], [0, 1], clamp);
    return (
      <div style={{overflow: 'hidden', height: 190, lineHeight: '190px'}}>
        <div style={{transform: `translateY(${(1 - p) * 110}%)`, letterSpacing: `${(1 - p) * 0.14 + 0.005}em`, fontSize: 218, fontWeight: 700, whiteSpace: 'nowrap'}}>
          {txt}
          {dot && <span style={{color: C.lime, opacity: dotP}}>.</span>}
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Scrim side="bottom" o={1} />
      <div style={{...cond, position: 'absolute', left: M, bottom: 250, transform: `translateY(${(1 - o) * -14}px)`}}>
        {line('BEFORE', 0)}
        {line('THE GAME', 5, true)}
      </div>
    </AbsoluteFill>
  );
};

// SCENE 02 — right-aligned at the top; words arrive sideways with a clearing blur, staggered.
export const T2: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const o = interpolate(f, [D - 6, D], [1, 0], clamp);
  const word = (w: string, i: number, lime = false) => {
    const p = out(interpolate(f, [i * 5, i * 5 + 14], [0, 1], clamp));
    return (
      <span style={{display: 'inline-block', marginLeft: 26, opacity: p, transform: `translateX(${(1 - p) * -70}px)`, filter: `blur(${(1 - p) * 10}px)`, color: lime ? C.lime : C.porcelain}}>{w}</span>
    );
  };
  return (
    <AbsoluteFill style={{opacity: o, transform: `translateX(${(1 - o) * 40}px)`}}>
      <Scrim side="top" o={1} />
      <div style={{...cond, position: 'absolute', right: M, top: 190, textAlign: 'right', fontSize: 150, fontWeight: 600, lineHeight: 0.95, letterSpacing: '0.01em'}}>
        <div>{word("THERE'S", 0)}{word('THE', 1)}</div>
        <div>{word('WORK', 2)}<span style={{color: C.lime, display: 'inline-block', opacity: out(interpolate(f, [16, 22], [0, 1], clamp))}}>.</span></div>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 03 — small tracked caps, letters resolve in sequence along a hairline that draws itself.
export const T3: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const o = exit(f, D, 8);
  const txt = 'BUILT WITH PURPOSE.';
  const lineW = out(interpolate(f, [0, 22], [0, 1], clamp));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Scrim side="bottom" o={1} />
      <div style={{position: 'absolute', left: M, right: M, bottom: 235, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{height: 2, width: `${lineW * 100}%`, background: `linear-gradient(90deg, ${C.lime}, rgba(200,243,107,0.15))`, marginBottom: 34, transformOrigin: 'left'}} />
        <div style={{...cond, fontSize: 86, fontWeight: 600, letterSpacing: '0.17em', whiteSpace: 'nowrap', paddingLeft: '0.17em'}}>
          {txt.split('').map((ch, i) => {
            const p = interpolate(f, [6 + i * 0.9, 6 + i * 0.9 + 7], [0, 1], clamp);
            return <span key={i} style={{opacity: p, color: ch === '.' ? C.lime : C.porcelain, display: 'inline-block', whiteSpace: 'pre'}}>{ch}</span>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Restrained technical line work: corner brackets and two guide hairlines. No numbers or specs.
export const TechFrame: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const o = interpolate(f, [0, 6, D - 8, D], [0, 1, 1, 0], clamp);
  const draw = out(interpolate(f, [0, 20], [0, 1], clamp));
  const L = 90 * draw;
  const col = 'rgba(245,245,240,0.78)';
  const b = (style: React.CSSProperties) => <div style={{position: 'absolute', ...style}} />;
  const e = 54;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {b({left: e, top: e, width: L, height: 2, background: col})}{b({left: e, top: e, width: 2, height: L, background: col})}
      {b({right: e, top: e, width: L, height: 2, background: col})}{b({right: e, top: e, width: 2, height: L, background: col})}
      {b({left: e, bottom: e, width: L, height: 2, background: col})}{b({left: e, bottom: e, width: 2, height: L, background: col})}
      {b({right: e, bottom: e, width: L, height: 2, background: col})}{b({right: e, bottom: e, width: 2, height: L, background: col})}
      {b({left: e, top: 640, height: 1, width: draw * 160, background: 'rgba(245,245,240,0.4)'})}
      {b({right: e, top: 1260, height: 1, width: draw * 160, background: 'rgba(245,245,240,0.4)'})}
      {b({left: e - 4, top: 636, width: 9, height: 9, background: C.lime, opacity: draw})}
    </AbsoluteFill>
  );
};
