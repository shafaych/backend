import React from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, interpolate, Easing, useCurrentFrame} from 'remotion';
import {useFonts} from './fonts';
import {CLIPS, C, start, WIPE_START, WIPE_END, BRAND_START, FOOTAGE_END, TOTAL, PRE} from './timeline';
import {T1, T2, T3, TechFrame} from './captions';
import {BrandCard} from './brand';

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const WHIPS = new Set(['c04', 'c08', 'c10']); // scene boundaries get a directional whip
const DIRS: Record<string, number> = {c04: 1, c08: -1, c10: 1};

const Shot: React.FC<{clip: (typeof CLIPS)[number]; idx: number}> = ({clip, idx}) => {
  const f = useCurrentFrame();
  // restrained push-in / drift, alternating direction for rhythm
  const p = f / clip.frames;
  const scale = 1.0 + 0.055 * p;
  const dx = (idx % 2 ? -1 : 1) * 14 * p;
  const whip = WHIPS.has(clip.id);
  const wp = whip ? interpolate(f, [0, 6], [1, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}) : 0;
  const slide = wp * 260 * (DIRS[clip.id] ?? 1);
  const blur = wp * 26;
  return (
    <AbsoluteFill style={{background: C.carbon}}>
      {whip && (
        <svg width="0" height="0" style={{position: 'absolute'}}>
          <filter id={`mb-${clip.id}`}><feGaussianBlur stdDeviation={`${blur} 0`} /></filter>
        </svg>
      )}
      <AbsoluteFill style={{transform: `translateX(${slide + dx}px) scale(${scale})`, filter: whip && blur > 0.5 ? `url(#mb-${clip.id})` : undefined}}>
        <OffthreadVideo src={staticFile(clip.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Cloth-fold wipe: a soft wavy, slanted edge sweeps right-to-left with a hairline lime trace.
const FoldWipe: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [WIPE_START, WIPE_END], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1)});
  if (p <= 0) return null;
  const W = 1080, H = 1920, N = 48;
  const edge: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const slant = (1 - s) * 220;
    const wave = Math.sin(s * Math.PI * 3.2 + p * 2.4) * 28 + Math.sin(s * Math.PI * 8 + p) * 7;
    edge.push([W + 260 - p * (W + 560) - slant + wave, s * H]);
  }
  const line = `M ${edge.map((e) => e.join(',')).join(' L ')}`;
  const poly = `${line} L ${W + 400},${H} L ${W + 400},0 Z`;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <path d={poly} fill={C.carbon} />
        <path d={line} stroke={C.lime} strokeWidth={2} fill="none" opacity={interpolate(p, [0, 0.1, 0.85, 1], [0, 1, 1, 0])} />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette = () => (
  <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 50% 45%, rgba(23,25,23,0) 55%, rgba(23,25,23,0.38) 100%)', pointerEvents: 'none'}} />
);

const OpenFade = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [PRE, PRE + 3], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return o > 0 ? <AbsoluteFill style={{background: C.carbon, opacity: o}} /> : null;
};

export const Main: React.FC = () => {
  useFonts();
  const last = CLIPS[CLIPS.length - 1];
  return (
    <AbsoluteFill style={{background: C.carbon}}>
      {CLIPS.map((c, i) => (
        <Sequence key={c.id} from={c.start} durationInFrames={c.frames} name={`${c.id} ${c.label}`}>
          <Shot clip={c} idx={i} />
        </Sequence>
      ))}
      {/* hold the container's last frame under the wipe */}
      <Sequence from={FOOTAGE_END} durationInFrames={WIPE_END - FOOTAGE_END + 1} name="container hold">
        <Freeze frame={last.frames - 1}>
          <AbsoluteFill><OffthreadVideo src={staticFile(last.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.055) translateX(-14px)'}} /></AbsoluteFill>
        </Freeze>
      </Sequence>
      <Vignette />
      {/* scene 03 technical line work */}
      <Sequence from={start('c08')} durationInFrames={start('c10') - start('c08') + 10}><TechFrame /></Sequence>
      <Sequence from={PRE + 5} durationInFrames={start('c04') - PRE - 5}><T1 /></Sequence>
      <Sequence from={start('c04') + 4} durationInFrames={start('c08') - start('c04') - 2}><T2 /></Sequence>
      <Sequence from={start('c08') + 2} durationInFrames={start('c11') - start('c08') + 6}><T3 /></Sequence>
      <FoldWipe />
      <Sequence from={BRAND_START - 2} durationInFrames={TOTAL - BRAND_START + 2}><BrandCard /></Sequence>
      <OpenFade />
    </AbsoluteFill>
  );
};
