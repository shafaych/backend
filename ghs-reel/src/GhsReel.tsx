import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT, FOOTAGE_END, FPS, SRC_DURATION} from './theme';
import {Reveal} from './Reveal';
import {BrandCard} from './BrandCard';

const WIN_W = 1080;
const WIN_H = 760;
const WIN_TOP = 290;
const SRC_W = 1024; // original footage width; graded file is 1.5x lanczos pre-upscaled
const SRC_H = 576;
const RATE = SRC_DURATION / (FOOTAGE_END / FPS);

// Pan-and-scan keyframes: [time s, focus x (0-1 of source), focus y, display scale vs. original px]
const KEYS: [number, number, number, number][] = [
  [0, 0.62, 0.52, 1.3],
  [3, 0.6, 0.5, 1.42],
  [3.01, 0.72, 0.5, 1.38],
  [5, 0.62, 0.5, 1.4],
  [6.6, 0.4, 0.52, 1.4],
  [7, 0.44, 0.5, 1.34],
  [9.5, 0.5, 0.5, 1.4],
  [11.9, 0.56, 0.5, 1.46],
  [12, 0.4, 0.55, 1.34],
  [16, 0.7, 0.55, 1.42],
];

const camera = (f: number) => {
  const t = f / FPS;
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++;
  const [t0, x0, y0, s0] = KEYS[i];
  const [t1, x1, y1, s1] = KEYS[i + 1];
  const p = interpolate(t, [t0, t1], [0, 1], {easing: Easing.inOut(Easing.sin), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {fx: x0 + (x1 - x0) * p, fy: y0 + (y1 - y0) * p, s: s0 + (s1 - s0) * p};
};

const Headline: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 112, color = C.white}) => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 0.96, letterSpacing: -2, color, textTransform: 'uppercase', textShadow: '0 4px 30px rgba(0,0,0,.45)'}}>{children}</div>
);
const Sub: React.FC<{children: React.ReactNode; color?: string; size?: number; spacing?: number}> = ({children, color = C.porcelain, size = 36, spacing = 7}) => (
  <div style={{fontFamily: FONT, fontWeight: 700, fontSize: size, letterSpacing: spacing, color, textTransform: 'uppercase', textShadow: '0 2px 16px rgba(0,0,0,.5)'}}>{children}</div>
);
const Dot: React.FC = () => <span style={{display: 'inline-block', width: 18, height: 18, background: C.lime, marginRight: 18, transform: 'translateY(1px)'}} />;

const TEXT_X = 80;
const TextZone: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: TEXT_X, right: TEXT_X, top: WIN_TOP + WIN_H + 70, display: 'flex', flexDirection: 'column', gap: 22}}>{children}</div>
);

export const GhsReel: React.FC = () => {
  const f = useCurrentFrame();
  const {fx, fy, s} = camera(Math.min(f, FOOTAGE_END));
  const W = SRC_W * s;
  const H = SRC_H * s;
  const left = Math.min(0, Math.max(WIN_W - W, WIN_W / 2 - fx * W));
  const top = Math.min(0, Math.max(WIN_H - H, WIN_H / 2 - fy * H));
  const footageOpacity = interpolate(f, [FOOTAGE_END - 14, FOOTAGE_END + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeIn = interpolate(f, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const wipes = [3, 7, 12].map((t) => interpolate(f, [t * FPS, t * FPS + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}));
  const srcVol = interpolate(f, [0, 20, FOOTAGE_END - 20, FOOTAGE_END + 10], [0, 2.4, 2.4, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: C.carbon}}>
      <Audio src={staticFile('music.wav')} volume={0.95} />
      <Audio src={staticFile('kings-ghs-manufacturing.mp4')} playbackRate={RATE} volume={() => srcVol} />

      {f < FOOTAGE_END + 10 && (
        <AbsoluteFill style={{opacity: footageOpacity * fadeIn}}>
          {/* blurred, darkened background built from the same real footage */}
          <AbsoluteFill style={{overflow: 'hidden'}}>
            <OffthreadVideo src={staticFile('footage-graded.mp4')} muted playbackRate={RATE}
              style={{position: 'absolute', width: 1920 * (1536 / 864), height: 1920, left: -(1920 * (1536 / 864) - 1080) / 2, top: 0, filter: 'blur(46px) brightness(.5) saturate(1.1)', transform: 'scale(1.1)'}} />
            <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(23,25,23,.55) 0%, rgba(23,25,23,.15) 30%, rgba(23,25,23,.7) 62%, ${C.carbon} 100%)`}} />
          </AbsoluteFill>

          {/* framed real footage with animated pan & scan */}
          <div style={{position: 'absolute', left: 0, top: WIN_TOP, width: WIN_W, height: WIN_H, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.55)'}}>
            <OffthreadVideo src={staticFile('footage-graded.mp4')} muted playbackRate={RATE}
              style={{position: 'absolute', width: W, height: H, left, top}} />
            {wipes.map((p, i) => p > 0 && p < 1 && (
              <div key={i} style={{position: 'absolute', top: 0, bottom: 0, width: 6, left: `${p * 100}%`, background: C.lime, opacity: 1 - p * 0.6}} />
            ))}
          </div>
          <div style={{position: 'absolute', left: 0, width: WIN_W, top: WIN_TOP + WIN_H, height: 6, background: C.lime}} />

          {/* SCENE 1 */}
          <TextZone>
            <Reveal from={0.3} to={1.55}><Headline size={132}>Another<br />order.</Headline></Reveal>
          </TextZone>
          <TextZone>
            <Reveal from={1.6} to={2.9}><Headline size={132} color={C.lime}>Almost<br />ready.</Headline></Reveal>
          </TextZone>
          {/* SCENE 2 */}
          <TextZone>
            <Reveal from={3.2} to={6.85}><Headline size={104}>Prepared with<br />attention.</Headline></Reveal>
            <Reveal from={3.2} to={6.85} delay={0.35}><Sub color={C.lime}><Dot />GHS Custom Gear</Sub></Reveal>
          </TextZone>
          {/* SCENE 3 */}
          <TextZone>
            <Reveal from={7.2} to={11.85}><Headline size={112}>Every detail<br />matters.</Headline></Reveal>
            <Reveal from={7.2} to={11.85} delay={0.4}><Sub size={31}>Custom sportswear manufacturing</Sub></Reveal>
          </TextZone>
          {/* SCENE 4 */}
          <div style={{position: 'absolute', left: TEXT_X, right: TEXT_X, top: 150}}>
            <Reveal from={12.3} to={15.9}><Sub size={23} color={C.porcelain} spacing={4}>Real production. Real products. Real manufacturing.</Sub></Reveal>
          </div>
          <TextZone>
            <Reveal from={12.2} to={15.9}><Headline size={132}>Ready for<br />dispatch.</Headline></Reveal>
            <Reveal from={13.9} to={15.9}><Sub color={C.lime} size={34}>Prepared for our customer.</Sub></Reveal>
          </TextZone>
        </AbsoluteFill>
      )}

      {/* SCENE 5 */}
      {f >= FOOTAGE_END - 8 && <BrandCard start={FOOTAGE_END} />}
    </AbsoluteFill>
  );
};
