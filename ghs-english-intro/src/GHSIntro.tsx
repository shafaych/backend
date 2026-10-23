import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {CLIPS, END_CARD_START, END_CARD_SECONDS, FPS, INTRO_SECONDS, SEGMENTS, SHOTS, f, ClipId, Tag} from './timeline';

export const C = {black: '#171917', graphite: '#333832', lime: '#C8F36B', porcelain: '#F5F5F0', white: '#FFFFFF'};
const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const XF = 6; // crossfade frames

const FontFace: React.FC = () => (
  <style>{[500, 700, 800].map((w) => `@font-face{font-family:'Inter';font-weight:${w};src:url(${staticFile(`fonts/inter-latin-${w}-normal.woff2`)}) format('woff2');}`).join('')}</style>
);

// Natural grade: gentle contrast/saturation, no tint shifts, skin tones untouched.
const GRADE = 'contrast(1.05) saturate(1.04) brightness(1.01)';

const Footage: React.FC<{clip: ClipId; from: number; dur: number; push?: number}> = ({clip, from, dur, push = 0.04}) => {
  const frame = useCurrentFrame();
  const c = CLIPS[clip];
  const scale = 1 + push * (frame / Math.max(1, dur));
  const src = staticFile(c.file);
  if (!c.landscape) {
    return (
      <AbsoluteFill style={{overflow: 'hidden', background: C.black}}>
        <AbsoluteFill style={{transform: `scale(${scale})`, filter: GRADE}}>
          <OffthreadVideo src={src} startFrom={f(from)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  // Landscape source: centre-cropped (~1.5x, no stretching) over a blurred, darkened copy of itself.
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.black}}>
      <AbsoluteFill style={{filter: 'blur(40px) brightness(0.55) saturate(1.1)', transform: 'scale(1.25)'}}>
        <OffthreadVideo src={src} startFrom={f(from)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', filter: GRADE}}>
        <div style={{width: 1080, height: 880, overflow: 'hidden', transform: `scale(${scale})`, boxShadow: '0 20px 80px rgba(0,0,0,.5)'}}>
          <OffthreadVideo src={src} startFrom={f(from)} muted style={{width: 1080, height: 880, objectFit: 'cover'}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.38) 100%)', pointerEvents: 'none'}} />
);

const LowerThird: React.FC<{tag: Tag; dur: number}> = ({tag, dur}) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [4, 18], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp', easing: Easing.out(Easing.cubic)});
  const out = interpolate(frame, [dur - 12, dur - 2], [1, 0], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  const cap = tag.kind === 'capability';
  return (
    <div style={{position: 'absolute', left: 64, top: 250, opacity: inP * out, transform: `translateX(${(1 - inP) * -40}px)`, fontFamily: FONT}}>
      <div style={{display: 'flex', alignItems: 'stretch'}}>
        <div style={{width: 10, background: C.lime}} />
        <div style={{background: 'rgba(23,25,23,.88)', padding: '18px 30px 18px 26px'}}>
          <div style={{fontWeight: 800, fontSize: 44, letterSpacing: 2.5, color: C.white}}>{tag.text}</div>
          {tag.sub && <div style={{fontWeight: 600, fontSize: 25, letterSpacing: cap ? 4 : 1.2, color: cap ? C.lime : C.porcelain, marginTop: 6}}>{tag.sub}</div>}
        </div>
      </div>
    </div>
  );
};

const split = (text: string, max = 5): string[] => {
  const sentences = text.match(/[^.!?:]+[.!?:]?/g)!.map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  sentences.forEach((s) => {
    const w = s.split(/\s+/);
    const n = Math.ceil(w.length / max);
    const size = Math.ceil(w.length / n);
    for (let i = 0; i < w.length; i += size) out.push(w.slice(i, i + size).join(' '));
  });
  return out;
};

const Subtitles: React.FC = () => (
  <>
    {SEGMENTS.map((s) => {
      const chunks = split(s.text);
      const total = chunks.reduce((a, c) => a + c.split(/\s+/).length, 0);
      let t = s.start;
      return chunks.map((c, i) => {
        const d = ((s.speechEnd - s.start) * c.split(/\s+/).length) / total;
        const from = f(t);
        const dur = Math.max(1, f(t + d) - from);
        t += d;
        return (
          <Sequence key={`${s.id}-${i}`} from={from} durationInFrames={dur}>
            <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 330}}>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 54, lineHeight: 1.22, color: C.white, textAlign: 'center', maxWidth: 940, padding: '14px 28px', background: 'rgba(23,25,23,.72)', borderRadius: 10, textShadow: '0 2px 6px rgba(0,0,0,.5)'}}>
                {c}
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      });
    })}
  </>
);

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = f(INTRO_SECONDS);
  const ti = interpolate(frame, [10, 28], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp', easing: Easing.out(Easing.cubic)});
  const to = interpolate(frame, [dur - 14, dur - 2], [1, 0], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill>
      <Footage clip="talkinghead" from={0} dur={dur} push={0} />
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(23,25,23,.85) 0%, rgba(23,25,23,0) 38%)'}} />
      <div style={{position: 'absolute', left: 64, bottom: 300, opacity: ti * to, transform: `translateY(${(1 - ti) * 24}px)`, fontFamily: FONT}}>
        <div style={{width: 120, height: 8, background: C.lime, marginBottom: 22}} />
        <div style={{fontWeight: 800, fontSize: 84, letterSpacing: 3, color: C.white, lineHeight: 1}}>GHS CUSTOM GEAR</div>
        <div style={{fontWeight: 600, fontSize: 36, color: C.porcelain, marginTop: 18, letterSpacing: 1}}>Custom Sportswear Manufacturer</div>
        <div style={{fontWeight: 600, fontSize: 36, color: C.lime, marginTop: 6, letterSpacing: 1}}>Sialkot, Pakistan</div>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = (d: number) => interpolate(frame, [d, d + 9], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp', easing: Easing.out(Easing.cubic)});
  const line = interpolate(frame, [2, 18], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.black, fontFamily: FONT, justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 14, background: C.lime}} />
      <div style={{opacity: a(2), fontWeight: 800, fontSize: 96, letterSpacing: 4, color: C.white}}>GHS CUSTOM GEAR</div>
      <div style={{height: 8, width: 420 * line, background: C.lime, margin: '30px 0'}} />
      <div style={{opacity: a(8), fontWeight: 800, fontSize: 52, letterSpacing: 5, color: C.lime}}>YOUR VISION. OUR PRODUCTION.</div>
      <div style={{opacity: a(14), fontWeight: 500, fontSize: 38, color: C.porcelain, marginTop: 56, padding: '0 80px', lineHeight: 1.3}}>Custom Sportswear & Private Label Manufacturing</div>
      <div style={{opacity: a(20), fontWeight: 700, fontSize: 44, color: C.white, marginTop: 28, border: `3px solid ${C.lime}`, padding: '12px 30px'}}>MOQ Starting at 10 Pieces</div>
      <div style={{opacity: a(26), fontWeight: 700, fontSize: 46, color: C.porcelain, marginTop: 64, letterSpacing: 1}}>ghscustomgear.com</div>
      <div style={{opacity: a(32), marginTop: 70, background: C.lime, color: C.black, fontWeight: 800, fontSize: 42, letterSpacing: 2, padding: '26px 44px'}}>LET'S DISCUSS YOUR NEXT ORDER.</div>
    </AbsoluteFill>
  );
};

export const GHSIntro: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.black}}>
      <FontFace />
      <Sequence from={0} durationInFrames={f(INTRO_SECONDS) + XF}>
        <Intro />
      </Sequence>
      {SHOTS.map((sh, i) => {
        const seg = SEGMENTS[sh.seg - 1];
        const len = seg.end - seg.start;
        const start = f(seg.start + len * sh.frac0);
        const end = f(seg.start + len * sh.frac1);
        const isFirst = i === 0;
        const from = isFirst ? f(INTRO_SECONDS) : start;
        const dur = end - from + XF;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <FadeIn>
              <Footage clip={sh.clip} from={sh.from + (isFirst ? 0 : 0)} dur={dur} push={sh.push} />
              <Vignette />
              {sh.tag && <LowerThird tag={sh.tag} dur={dur} />}
            </FadeIn>
          </Sequence>
        );
      })}
      <Subtitles />
      <Sequence from={f(END_CARD_START)} durationInFrames={f(END_CARD_SECONDS)}>
        <FadeIn><EndCard /></FadeIn>
      </Sequence>
    </AbsoluteFill>
  );
};

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, XF], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
