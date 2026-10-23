import React from 'react';
import {AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BODY, C, HEAD} from './brand';
import {Fonts} from './fonts';

export const FPS = 30;
export const TOTAL = 750; // 25.0 s
const s = (sec: number) => Math.round(sec * FPS);
const SRC = staticFile('ghs-factory.mp4');
const GRADE = 'contrast(1.06) saturate(0.93) brightness(1.03)';
const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Footage clip: source window cropped to (cx,cy,cw) and fitted into a w×h frame. Audio is mixed separately. */
const Clip: React.FC<{
  from: number; x?: number; y: number; w: number; h: number;
  crop: {x: number; y: number; w: number}; // crop in source pixels (16:9-agnostic, height derived from frame aspect)
  zoom?: [number, number]; dur: number; radius?: number;
}> = ({from, x = 0, y, w, h, crop, zoom = [1, 1], dur, radius = 0}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], zoom, {easing: Easing.inOut(Easing.quad), extrapolateRight: 'clamp'});
  const scale = (w / crop.w) * z;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: radius,
      boxShadow: '0 30px 80px rgba(0,0,0,.55)'}}>
      <OffthreadVideo src={SRC} startFrom={s(from)} muted style={{
        position: 'absolute', width: 1024, height: 576, left: 0, top: 0, filter: GRADE,
        transformOrigin: '0 0',
        transform: `translate(${(w / 2) - (crop.x + crop.w / 2) * scale}px, ${(h / 2) - (crop.y + (crop.w * h / w) / 2) * scale}px) scale(${scale})`,
      }} />
    </div>
  );
};

const Backdrop: React.FC<{from: number}> = ({from}) => (
  <AbsoluteFill style={{background: C.black}}>
    <OffthreadVideo src={SRC} startFrom={s(from)} muted style={{
      position: 'absolute', left: -300, top: 0, width: 1680, height: 1920, objectFit: 'cover',
      filter: 'blur(46px) brightness(.38) saturate(.8)', transform: 'scale(1.1)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(23,25,23,.7) 0%, rgba(23,25,23,.15) 40%, rgba(23,25,23,.15) 60%, rgba(23,25,23,.8) 100%)'}} />
  </AbsoluteFill>
);

const Vignette = () => (
  <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.35) 100%)'}} />
);

/** Line that wipes up from a mask. */
const Reveal: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 16], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{overflow: 'hidden', ...style}}>
      <div style={{transform: `translateY(${(1 - p) * 110}%)`, opacity: p}}>{children}</div>
    </div>
  );
};

const Head: React.FC<{color?: string; size?: number; children?: React.ReactNode}> = ({children, color = C.white, size = 112}) => (
  <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: size, lineHeight: 1.05, color, letterSpacing: 2, textTransform: 'uppercase',
    textShadow: '0 4px 24px rgba(0,0,0,.5)', textAlign: 'center'}}>{children}</div>
);
const Tag: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 34, letterSpacing: 6, color: C.black, background: C.lime,
    padding: '12px 26px', textTransform: 'uppercase', display: 'inline-block'}}>{children}</div>
);

/** Fade wrapper for scene in/out. */
const Fade: React.FC<{dur: number; inF?: number; outF?: number; children: React.ReactNode}> = ({dur, inF = 6, outF = 8, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, inF, dur - outF, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const WIDE = {x: 0, y: 0, w: 1024};

const Scene1 = () => (
  <Fade dur={s(4)} inF={1}>
    <Backdrop from={0} />
    <Clip from={0} y={640} w={1080} h={608} crop={WIDE} zoom={[1, 1.1]} dur={s(4)} />
    <Vignette />
    <Reveal at={6} style={{position: 'absolute', top: 340, left: 0, right: 0}}><Head size={124}>Not stock footage.</Head></Reveal>
    <Reveal at={44} style={{position: 'absolute', top: 1310, left: 0, right: 0}}><Head size={92} color={C.lime}>Real factory work.</Head></Reveal>
  </Fade>
);

const Scene2 = () => {
  const dur = s(5);
  return (
    <Fade dur={dur}>
      <Backdrop from={11} />
      <Sequence from={0} durationInFrames={s(2.5)}>
        <Clip from={10} y={290} w={1080} h={520} crop={{x: 0, y: 40, w: 760}} zoom={[1, 1.08]} dur={s(2.5)} />
        <Clip from={14} y={830} w={1080} h={520} crop={{x: 264, y: 40, w: 760}} zoom={[1, 1.08]} dur={s(2.5)} />
      </Sequence>
      <Sequence from={s(2.5)} durationInFrames={s(2.5)}>
        <Clip from={18} y={290} w={1080} h={520} crop={{x: 0, y: 40, w: 760}} zoom={[1.06, 1]} dur={s(2.5)} />
        <Clip from={12.5} y={830} w={1080} h={520} crop={{x: 160, y: 60, w: 700}} zoom={[1.06, 1]} dur={s(2.5)} />
      </Sequence>
      <Vignette />
      <Reveal at={6} style={{position: 'absolute', top: 1400, left: 0, right: 0}}><Head size={104}>Real people.</Head></Reveal>
      <Reveal at={30} style={{position: 'absolute', top: 1520, left: 0, right: 0}}><Head size={104} color={C.lime}>Real work.</Head></Reveal>
    </Fade>
  );
};

const Scene3 = () => {
  const dur = s(6);
  return (
    <Fade dur={dur}>
      <Backdrop from={6} />
      <Sequence from={0} durationInFrames={s(3)}>
        <Clip from={5.5} y={580} w={1080} h={720} crop={{x: 80, y: 0, w: 864}} zoom={[1.03, 1.1]} dur={s(3)} />
      </Sequence>
      <Sequence from={s(3)} durationInFrames={s(3)}>
        <Clip from={12} y={580} w={1080} h={720} crop={{x: 20, y: 0, w: 864}} zoom={[1, 1.08]} dur={s(3)} />
      </Sequence>
      <Vignette />
      <Reveal at={6} style={{position: 'absolute', top: 290, left: 0, right: 0}}><Head size={100}>Every detail<br />matters.</Head></Reveal>
      <Reveal at={34} style={{position: 'absolute', top: 1330, left: 0, right: 0, textAlign: 'center'}}><Tag>Garment finishing &amp; packing</Tag></Reveal>
    </Fade>
  );
};

const Scene4 = () => {
  const dur = s(5);
  const f = useCurrentFrame();
  const bar = interpolate(f, [8, 30], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Fade dur={dur}>
      <Backdrop from={16} />
      <Clip from={16} y={420} w={1080} h={608} crop={WIDE} zoom={[1.0, 1.05]} dur={dur} />
      <Vignette />
      <div style={{position: 'absolute', left: 60, top: 1120, width: 960}}>
        <div style={{height: 8, width: 960 * bar, background: C.lime, marginBottom: 26}} />
        <Reveal at={14}><div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 100, whiteSpace: "nowrap", color: C.white, letterSpacing: 3, lineHeight: 1.05}}>GHS CUSTOM GEAR</div></Reveal>
        <Reveal at={24}><div style={{fontFamily: BODY, fontWeight: 600, fontSize: 36, color: C.porcelain, letterSpacing: 5, marginTop: 14}}>IN-HOUSE SPORTSWEAR MANUFACTURING</div></Reveal>
        <Reveal at={32}><div style={{fontFamily: BODY, fontWeight: 600, fontSize: 36, color: C.lime, letterSpacing: 8, marginTop: 10}}>SIALKOT, PAKISTAN</div></Reveal>
      </div>
    </Fade>
  );
};

export const Wordmark: React.FC<{size?: number}> = ({size = 190}) => (
  <div style={{textAlign: 'center'}}>
    <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: size, lineHeight: 0.95, color: C.lime, letterSpacing: 6}}>GHS</div>
    <div style={{fontFamily: HEAD, fontWeight: 500, fontSize: size * 0.34, color: C.white, letterSpacing: size * 0.075, marginTop: 6}}>CUSTOM GEAR</div>
  </div>
);

const Scene5 = () => {
  const f = useCurrentFrame();
  const p = (a: number) => interpolate(f, [a, a + 18], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const row = (a: number): React.CSSProperties => ({opacity: p(a), transform: `translateY(${(1 - p(a)) * 24}px)`});
  return (
    <AbsoluteFill style={{background: C.black, opacity: interpolate(f, [0, 14], [0, 1], {extrapolateRight: 'clamp'})}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 38%, ${C.graphite} 0%, ${C.black} 62%)`}} />
      <div style={{position: 'absolute', top: 400, left: 0, right: 0, ...row(8)}}><Wordmark /></div>
      <div style={{position: 'absolute', top: 820, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{width: 160 * p(18), height: 6, background: C.lime, margin: '0 auto 34px'}} />
        <div style={{...row(22), fontFamily: HEAD, fontWeight: 700, fontSize: 78, color: C.white, letterSpacing: 3}}>YOUR VISION. OUR PRODUCTION.</div>
        <div style={{...row(34), fontFamily: BODY, fontWeight: 600, fontSize: 34, color: C.porcelain, letterSpacing: 6, marginTop: 34}}>CUSTOM SPORTSWEAR &amp; TEAMWEAR</div>
        <div style={{...row(42), fontFamily: BODY, fontWeight: 600, fontSize: 34, color: C.lime, letterSpacing: 6, marginTop: 16}}>MOQ STARTING AT 10 PIECES</div>
      </div>
      <div style={{position: 'absolute', top: 1260, left: 0, right: 0, textAlign: 'center', ...row(56)}}>
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 64, color: C.black, background: C.lime, display: 'inline-block', padding: '14px 40px', letterSpacing: 2}}>LET&apos;S DISCUSS YOUR NEXT ORDER.</div>
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 44, color: C.white, letterSpacing: 3, marginTop: 36}}>ghscustomgear.com</div>
      </div>
    </AbsoluteFill>
  );
};

export const GHSReel: React.FC = () => (
  <AbsoluteFill style={{background: C.black}}>
    <Fonts />
    <Sequence from={0} durationInFrames={s(4) + 6}><Scene1 /></Sequence>
    <Sequence from={s(4)} durationInFrames={s(5) + 6}><Scene2 /></Sequence>
    <Sequence from={s(9)} durationInFrames={s(6) + 6}><Scene3 /></Sequence>
    <Sequence from={s(15)} durationInFrames={s(5) + 6}><Scene4 /></Sequence>
    <Sequence from={s(20)} durationInFrames={s(5)}><Scene5 /></Sequence>
  </AbsoluteFill>
);
