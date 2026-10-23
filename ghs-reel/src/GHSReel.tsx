import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import {BODY, DISPLAY} from './fonts';
import {Clip} from './Clip';
import {BottomShade, BrandTag, Line, Sub} from './ui';
import {C} from './theme';

const FADE = 8;
/** Scene wrapper: crossfade in/out over the overlap frames. */
const Scene: React.FC<{from: number; dur: number; fadeIn?: boolean; fadeOut?: boolean; children: React.ReactNode}> = ({from, dur, fadeIn = true, fadeOut = true, children}) => {
  const f = useCurrentFrame() - from;
  const o = interpolate(f, [0, FADE, dur - FADE, dur], [fadeIn ? 0 : 1, 1, 1, fadeOut ? 0 : 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Sequence from={from} durationInFrames={dur}>
      <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>
    </Sequence>
  );
};

const textBlock: React.CSSProperties = {position: 'absolute', left: 72, bottom: 420, display: 'flex', flexDirection: 'column', gap: 26};

/* 01 — HOOK: black/white/purple panels */
const S1 = () => (
  <AbsoluteFill style={{background: C.carbon}}>
    <Clip start={203} rate={0.75} zoom={[1.0, 1.1]} drift={[0, -30]} />
    <BottomShade />
    <BrandTag />
    <div style={textBlock}>
      <div>
        <Line text="Not just" at={14} size={200} />
        <Line text="a jersey." at={20} size={200} />
      </div>
      <div style={{marginTop: 8}}>
        <Line text="Every detail counts." at={52} size={78} color={C.lime} />
      </div>
    </div>
  </AbsoluteFill>
);

/* 02 — FABRIC: green mesh */
const S2 = () => (
  <AbsoluteFill style={{background: C.carbon}}>
    <Clip start={100} rate={0.75} zoom={[1.12, 1.02]} drift={[-30, 0]} />
    <BottomShade />
    <BrandTag />
    <div style={textBlock}>
      <div>
        <Line text="Fabric that" at={10} size={180} />
        <Line text="speaks." at={16} size={180} color={C.lime} />
      </div>
      <Sub text="Performance Sportswear" at={34} />
    </div>
  </AbsoluteFill>
);

/* 03 — STITCHING & DESIGN: yellow collar seams */
const S3 = () => (
  <AbsoluteFill style={{background: C.carbon}}>
    <Clip start={26} rate={0.75} freezeAt={94} zoom={[1.0, 1.12]} drift={[0, 20]} total={106} focusY={0.4} />
    <BottomShade />
    <BrandTag />
    <div style={textBlock}>
      <div>
        <Line text="Details that" at={10} size={180} />
        <Line text="matter." at={16} size={180} color={C.lime} />
      </div>
      <Sub text="Custom Design & Finishing" at={34} />
    </div>
  </AbsoluteFill>
);

/* 04 — PRODUCT REVEAL: three real designs */
const Panel: React.FC<{i: number; start: number; freezeAt: number; focusY: number; src?: number}> = ({i, start, freezeAt, focusY}) => {
  const f = useCurrentFrame();
  const at = 12 + i * 7;
  const p = interpolate(f, [at, at + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.7, 0, 0.2, 1)});
  const H = 352;
  return (
    <div style={{position: 'relative', width: 1080, height: H, overflow: 'hidden', clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
      <Clip start={start} rate={0.75} freezeAt={freezeAt} width={1080} height={H} focusY={focusY} zoom={[1.0, 1.08]} total={94} />
      <div style={{position: 'absolute', left: 28, bottom: 22, fontFamily: BODY, fontWeight: 700, fontSize: 26, letterSpacing: 5, color: C.white, textShadow: '0 2px 12px rgba(0,0,0,.55)'}}>0{i + 1}</div>
    </div>
  );
};
const S4 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.carbon}}>
      <div style={{position: 'absolute', top: 150, left: 0, display: 'flex', flexDirection: 'column', gap: 18}}>
        <Panel i={0} start={0} freezeAt={90} focusY={0.28} />
        <Panel i={1} start={130} freezeAt={90} focusY={0.72} />
        <Panel i={2} start={205} freezeAt={84} focusY={0.62} />
      </div>
      <div style={{position: 'absolute', left: 72, top: 1290, display: 'flex', flexDirection: 'column', gap: 24}}>
        <div>
          <Line text="Your design." at={30} size={150} />
          <Line text="Your identity." at={37} size={150} color={C.lime} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
/** wipe from bottom with a lime leading edge */
const Wipe: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame() - from;
  const p = interpolate(f, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.7, 0, 0.2, 1)});
  if (p <= 0 || p >= 1) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top: (1 - p) * 1920 - 8, height: 16, background: C.lime}} />;
};

/* 05 — END CARD */
const Reveal: React.FC<{at: number; children: React.ReactNode; y?: number}> = ({at, children, y = 30}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * y}px)`}}>{children}</div>;
};
const S5 = () => {
  const f = useCurrentFrame();
  const line = interpolate(f, [4, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: C.carbon}}>
      <AbsoluteFill style={{background: `repeating-linear-gradient(115deg, transparent 0 90px, rgba(51,56,50,.45) 90px 92px)`}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 14, height: `${line * 100}%`, background: C.lime}} />
      <div style={{position: 'absolute', left: 80, top: 330, display: 'flex', flexDirection: 'column', gap: 0}}>
        <Line text="GHS" at={4} size={340} />
        <div style={{marginTop: 6}}><Line text="Custom Gear" at={10} size={150} color={C.lime} spacing={2} /></div>
        <div style={{marginTop: 44}}>
          <Reveal at={22}>
            <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 34, letterSpacing: 5.5, color: C.porcelain}}>CUSTOM SPORTSWEAR MANUFACTURING</div>
          </Reveal>
        </div>
        <div style={{marginTop: 34}}>
          <Reveal at={32}>
            <div style={{display: 'inline-block', background: C.lime, color: C.carbon, fontFamily: BODY, fontWeight: 700, fontSize: 36, letterSpacing: 4, padding: '20px 32px'}}>MOQ STARTING AT 10 PIECES</div>
          </Reveal>
        </div>
        <div style={{marginTop: 96}}>
          <Line text="Let's create" at={46} size={112} />
          <Line text="your next" at={52} size={112} />
          <Line text="collection." at={58} size={112} color={C.lime} />
        </div>
        <div style={{marginTop: 56}}>
          <Reveal at={70}>
            <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 46, letterSpacing: 2, color: C.white, borderBottom: `4px solid ${C.lime}`, display: 'inline-block', paddingBottom: 10}}>ghscustomgear.com</div>
          </Reveal>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const GHSReel: React.FC = () => (
  <AbsoluteFill style={{background: C.carbon}}>
    <Scene from={0} dur={94} fadeIn={false}><S1 /></Scene>
    <Scene from={86} dur={94}><S2 /></Scene>
    <Scene from={172} dur={110} fadeOut={false}><S3 /></Scene>
    {/* S4 enters on a wipe, over S3 */}
    <Sequence from={266} durationInFrames={94}>
      <WipeScene />
    </Sequence>
    <Scene from={356} dur={94} fadeOut={false}><S5 /></Scene>
    <Audio src={staticFile('audio/mix.wav')} />
  </AbsoluteFill>
);

const WipeScene = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 16], [0, 1], {extrapolateRight: 'clamp', easing: Easing.bezier(0.7, 0, 0.2, 1)});
  const o = interpolate(f, [86, 94], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{clipPath: `inset(${(1 - p) * 100}% 0 0 0)`}}>
        <S4 />
      </AbsoluteFill>
      <Wipe from={0} />
    </AbsoluteFill>
  );
};
