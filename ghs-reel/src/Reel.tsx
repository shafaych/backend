import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Freeze,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

export const TOTAL_FRAMES = 540; // 18.0s @ 30fps

const C = {carbon: '#171917', graphite: '#333832', lime: '#C8F36B', porcelain: '#F5F5F0', white: '#FFFFFF'};
const W = 1080;
const H = 1920;
const FONT = "'Barlow Condensed', 'Arial Narrow', sans-serif";

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const outQuart = Easing.out(Easing.poly(4));
const inOut = Easing.inOut(Easing.cubic);

// ---------- fonts ----------
const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all(
      [600, 700, 800].map((w) =>
        new FontFace('Barlow Condensed', `url(${staticFile(`fonts/barlow-condensed-latin-${w}-normal.woff2`)})`, {
          weight: String(w),
        })
          .load()
          .then((f) => document.fonts.add(f)),
      ),
    )
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
};

// ---------- camera / clip ----------
// The 576x1024 source maps 1:1 (aspect) onto the 1080x1920 frame. A camera places source point (fx,fy)
// at screen point (ax,ay) (all 0..1) at scale s.
type Cam = {s: number; fx: number; fy: number; ax: number; ay: number};
const lerpCam = (a: Cam, b: Cam, t: number): Cam => ({
  s: a.s + (b.s - a.s) * t,
  fx: a.fx + (b.fx - a.fx) * t,
  fy: a.fy + (b.fy - a.fy) * t,
  ax: a.ax + (b.ax - a.ax) * t,
  ay: a.ay + (b.ay - a.ay) * t,
});
const cam = (s: number, fx: number, fy: number, ax = fx, ay = fy): Cam => ({s, fx, fy, ax, ay});

type ClipProps = {
  from: number; // source seconds
  rate: number;
  start: number; // global frame
  dur: number;
  a: Cam;
  b?: Cam;
  freeze?: boolean;
  bright?: number;
  punch?: number; // extra scale that settles in first frames of the shot (cut percussion)
  ease?: (t: number) => number;
};

const Clip: React.FC<ClipProps> = ({from, rate, start, dur, a, b, freeze, bright = 1, punch = 0.05, ease = inOut}) => (
  <Sequence from={start} durationInFrames={dur} layout="none">
    <ClipInner from={from} rate={rate} dur={dur} a={a} b={b ?? a} freeze={freeze} bright={bright} punch={punch} ease={ease} />
  </Sequence>
);

const ClipInner: React.FC<{
  from: number;
  rate: number;
  dur: number;
  a: Cam;
  b: Cam;
  freeze?: boolean;
  bright: number;
  punch: number;
  ease: (t: number) => number;
}> = ({from, rate, dur, a, b, freeze, bright, punch, ease}) => {
  const f = useCurrentFrame();
  const c = lerpCam(a, b, ease(interpolate(f, [0, Math.max(1, dur - 1)], [0, 1], clamp)));
  const pk = 1 + punch * (1 - outQuart(interpolate(f, [0, 6], [0, 1], clamp)));
  const s = c.s * pk;
  // keep the source covering the frame (never reveal empty edges)
  const tx = Math.min(0, Math.max(W - s * W, c.ax * W - s * c.fx * W));
  const ty = Math.min(0, Math.max(H - s * H, c.ay * H - s * c.fy * H));
  const video = (
    <OffthreadVideo
      src={staticFile('source.mp4')}
      startFrom={Math.round(from * 30)}
      playbackRate={rate}
      muted
      style={{width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})`}}
    />
  );
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.carbon, filter: `contrast(1.07) saturate(1.05) brightness(${bright})`}}>
      {freeze ? <Freeze frame={0}>{video}</Freeze> : video}
    </AbsoluteFill>
  );
};

// ---------- typography ----------
const textBase: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 800,
  textTransform: 'uppercase',
  color: C.porcelain,
  lineHeight: 0.9,
  letterSpacing: 1,
  whiteSpace: 'nowrap',
  textShadow: '0 4px 28px rgba(0,0,0,0.45)',
};

// Slanted mask reveal that travels in the direction of the scissors (left -> right), with a lime cut line on its edge.
const Reveal: React.FC<{at: number; dur?: number; skew?: number; children: React.ReactNode; style?: React.CSSProperties; line?: boolean}> = ({
  at,
  dur = 9,
  skew = 14,
  children,
  style,
  line = true,
}) => {
  const f = useCurrentFrame();
  const p = outQuart(interpolate(f, [at, at + dur], [0, 1], clamp));
  if (f < at) return null;
  const E = p * (100 + skew);
  const lw = 3.2;
  return (
    <div style={{position: 'relative', display: 'inline-block', ...style}}>
      <div style={{clipPath: `polygon(0 0, ${E}% 0, ${E - skew}% 100%, 0 100%)`}}>{children}</div>
      {line && p < 0.98 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: C.lime,
            clipPath: `polygon(${E - lw}% 0, ${E}% 0, ${E - skew}% 100%, ${E - skew - lw}% 100%)`,
          }}
        />
      ) : null}
    </div>
  );
};

const Scrim: React.FC<{from: number; to: number; strength?: number; top?: boolean}> = ({from, to, strength = 0.85, top}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 6, to - 4, to], [0, 1, 1, 0], clamp) * strength;
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        background: top
          ? `linear-gradient(to bottom, ${C.carbon} 0%, rgba(23,25,23,0.55) 25%, rgba(23,25,23,0) 55%)`
          : `linear-gradient(to top, ${C.carbon} 0%, rgba(23,25,23,0.72) 28%, rgba(23,25,23,0) 62%)`,
      }}
    />
  );
};

const Small: React.FC<{children: React.ReactNode; size?: number; color?: string; weight?: number; track?: number}> = ({
  children,
  size = 38,
  color = C.porcelain,
  weight = 700,
  track = 5,
}) => <div style={{...textBase, fontWeight: weight, fontSize: size, letterSpacing: track, color, lineHeight: 1}}>{children}</div>;

// Lime heartbeat dot + tagline, pulses on every beat (120 BPM = 15 frames)
const Chrome: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const beat = (f % 15) / 15;
  const pulse = 1 + 0.55 * Math.pow(1 - beat, 3);
  const o = interpolate(f, [from, from + 8, to - 8, to], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 80, top: 290, display: 'flex', alignItems: 'center', gap: 18, opacity: o}}>
      <div style={{width: 20, height: 20, borderRadius: 20, background: C.lime, transform: `scale(${pulse})`}} />
      <Small size={32} track={6}>
        THE ORDER IS ALIVE
      </Small>
    </div>
  );
};

// Lime corner brackets, a registration mark around the detail being inspected (never touches the artwork)
const Brackets: React.FC<{at: number; to: number; x: number; y: number; w: number; h: number}> = ({at, to, x, y, w, h}) => {
  const f = useCurrentFrame();
  if (f < at || f >= to) return null;
  const p = outQuart(interpolate(f, [at, at + 8], [0, 1], clamp));
  const pad = 40 * (1 - p);
  const L = 70;
  const t = 6;
  const corner = (cx: number, cy: number, sx: number, sy: number) => (
    <>
      <div style={{position: 'absolute', left: cx - (sx < 0 ? L : 0), top: cy - (sy < 0 ? t : 0), width: L, height: t, background: C.lime}} />
      <div style={{position: 'absolute', left: cx - (sx < 0 ? t : 0), top: cy - (sy < 0 ? L : 0), width: t, height: L, background: C.lime}} />
    </>
  );
  return (
    <div style={{position: 'absolute', inset: 0, opacity: p}}>
      {corner(x - pad, y - pad, 1, 1)}
      {corner(x + w + pad, y - pad, -1, 1)}
      {corner(x - pad, y + h + pad, 1, -1)}
      {corner(x + w + pad, y + h + pad, -1, -1)}
    </div>
  );
};

// ---------- scenes (global frame numbers) ----------
const S = {
  s1: 0,
  s2: 90,
  s3: 180,
  s4: 300,
  s5: 420,
};

const Footage: React.FC = () => (
  <>
    {/* SCENE 01 — THE FIRST CUT. Tight on real scissors (src 0.50-0.95s), micro-freeze on the snip, then slow-mo pull-back. */}
    <Clip start={0} dur={15} from={0.5} rate={0.9} a={cam(2.9, 0.3, 0.33, 0.45, 0.42)} b={cam(2.95, 0.3, 0.335, 0.45, 0.42)} bright={1.03} punch={0} />
    <Clip start={15} dur={5} from={0.95} rate={1} freeze a={cam(2.95, 0.3, 0.335, 0.45, 0.42)} b={cam(3.05, 0.3, 0.335, 0.45, 0.42)} bright={1.03} punch={0} />
    <Clip
      start={20}
      dur={70}
      from={0.95}
      rate={0.5}
      a={cam(3.05, 0.3, 0.335, 0.45, 0.42)}
      b={cam(1.35, 0.4, 0.42, 0.5, 0.48)}
      bright={1.03}
      punch={0}
      ease={Easing.inOut(Easing.quad)}
    />

    {/* SCENE 02 — THE ORDER REVEAL. Widest view, travelling up the rows of garments. */}
    <Clip start={90} dur={90} from={6.0} rate={1} a={cam(1.0, 0.5, 0.78, 0.5, 0.78)} b={cam(1.3, 0.5, 0.3, 0.5, 0.36)} bright={1.04} ease={Easing.inOut(Easing.sin)} />

    {/* SCENE 03 — THE PERSONALIZATION. Precision punch-ins on real names / numbers / marks. */}
    <Clip start={180} dur={30} from={0.0} rate={0.5} a={cam(2.3, 0.4, 0.47, 0.5, 0.42)} b={cam(2.5, 0.4, 0.47, 0.5, 0.42)} bright={1.0} />
    <Clip start={210} dur={30} from={5.0} rate={0.5} a={cam(2.2, 0.27, 0.52, 0.5, 0.42)} b={cam(2.4, 0.27, 0.52, 0.5, 0.42)} bright={1.02} />
    <Clip start={240} dur={25} from={2.55} rate={0.6} a={cam(2.0, 0.78, 0.86, 0.5, 0.42)} b={cam(2.2, 0.78, 0.86, 0.5, 0.42)} bright={1.0} />
    <Clip start={265} dur={35} from={8.0} rate={0.5} a={cam(1.8, 0.4, 0.55, 0.5, 0.42)} b={cam(2.0, 0.4, 0.55, 0.5, 0.42)} bright={1.03} />

    {/* SCENE 04 — THE HANDS. Close match-cut on the scissors, then wide on the working team. */}
    <Clip start={300} dur={30} from={4.3} rate={0.6} a={cam(1.9, 0.33, 0.8, 0.45, 0.42)} b={cam(2.2, 0.33, 0.8, 0.45, 0.42)} bright={1.03} punch={0.04} />
    <Clip start={330} dur={102} from={10.5} rate={1} a={cam(1.4, 0.7, 0.16, 0.65, 0.34)} b={cam(1.18, 0.7, 0.22, 0.6, 0.38)} bright={1.05} ease={Easing.inOut(Easing.sin)} />
  </>
);

// SCENE 05 wipe: the real fabric edge (live footage, freeze) leads a carbon-black slab across the frame.
const Wipe: React.FC = () => {
  const f = useCurrentFrame();
  const a = 408;
  const b = 436;
  if (f < a) return null;
  const p = inOut(interpolate(f, [a, b], [0, 1], clamp));
  const skew = 22;
  const band = 26;
  const E = p * (100 + skew + band) - band * 0; // leading edge position of the fabric band
  const slabE = E - band;
  return (
    <>
      <AbsoluteFill style={{background: C.carbon, clipPath: `polygon(0 0, ${slabE}% 0, ${slabE - skew}% 100%, 0 100%)`}} />
      {p < 1 ? (
        <AbsoluteFill style={{clipPath: `polygon(${slabE}% 0, ${E}% 0, ${E - skew}% 100%, ${slabE - skew}% 100%)`, background: C.porcelain}}>
          <Clip start={a} dur={80} from={13.1} rate={1} freeze a={cam(3.4, 0.5, 0.86, 0.5, 0.5)} bright={1.04} punch={0} />
        </AbsoluteFill>
      ) : null}
    </>
  );
};

const CutLine: React.FC<{at: number; y: number}> = ({at, y}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = outQuart(interpolate(f, [at, at + 10], [0, 1], clamp));
  return <div style={{position: 'absolute', left: 0, top: y, height: 6, width: W * p, background: C.lime, boxShadow: `0 0 24px rgba(200,243,107,0.45)`}} />;
};

const pop = (f: number, at: number, d = 8) => outQuart(interpolate(f, [at, at + d], [0, 1], clamp));

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 436) return null;
  const lineY = 466;
  const split = outQuart(interpolate(f, [446, 466], [0, 1], clamp)); // halves close along the cut line
  const off = (1 - split) * 56;
  const markOpacity = interpolate(f, [446, 452], [0, 1], clamp);
  const wordmark = (
    <div style={{width: 920}}>
      <div style={{...textBase, fontSize: 330, lineHeight: 0.86, letterSpacing: 2, textShadow: 'none'}}>GHS</div>
      <div style={{...textBase, fontSize: 142, lineHeight: 1, letterSpacing: 10, textShadow: 'none', color: C.lime}}>CUSTOM GEAR</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(120% 70% at 20% 28%, ${C.graphite} 0%, ${C.carbon} 62%)`, opacity: interpolate(f, [436, 452], [0, 1], clamp)}} />
      {/* wordmark, cut along the line */}
      <div style={{position: 'absolute', left: 80, top: 250, opacity: markOpacity}}>
        <div style={{position: 'absolute', clipPath: 'inset(0 0 50% 0)', transform: `translateY(${-off}px)`}}>{wordmark}</div>
        <div style={{position: 'absolute', clipPath: 'inset(50% 0 0 0)', transform: `translateY(${off}px)`}}>{wordmark}</div>
        <div style={{visibility: 'hidden'}}>{wordmark}</div>
      </div>
      <CutLine at={438} y={lineY - 3} />
      {/* lockup */}
      <div style={{position: 'absolute', left: 80, top: 660, display: 'flex', flexDirection: 'column', gap: 34}}>
        <div style={{opacity: pop(f, 458), transform: `translateY(${(1 - pop(f, 458)) * 24}px)`}}>
          <div style={{...textBase, fontSize: 92, lineHeight: 0.95}}>YOUR VISION.</div>
          <div style={{...textBase, fontSize: 92, lineHeight: 0.95, color: C.lime}}>OUR PRODUCTION.</div>
        </div>
        <div style={{opacity: pop(f, 464), transform: `translateY(${(1 - pop(f, 464)) * 20}px)`}}>
          <Small size={42} track={6} color="rgba(245,245,240,0.82)">
            CUSTOM SPORTSWEAR MANUFACTURING
          </Small>
        </div>
        <div style={{opacity: pop(f, 470), transform: `translateY(${(1 - pop(f, 470)) * 20}px)`, marginTop: 14}}>
          <div style={{display: 'inline-block', border: `4px solid ${C.lime}`, padding: '16px 30px 12px'}}>
            <Small size={50} track={4} color={C.lime} weight={800}>
              MOQ STARTING AT 10 PIECES
            </Small>
          </div>
        </div>
      </div>
      {/* URL + CTA, kept inside the Reels-safe lower margin */}
      <div style={{position: 'absolute', left: 80, top: 1230, opacity: pop(f, 474), transform: `translateY(${(1 - pop(f, 474)) * 20}px)`}}>
        <Small size={64} track={3} weight={600} color={C.porcelain}>
          <span style={{textTransform: 'none'}}>ghscustomgear.com</span>
        </Small>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 1330,
          opacity: pop(f, 478, 7),
          transform: `scale(${0.94 + 0.06 * pop(f, 478, 7)})`,
          transformOrigin: '0 50%',
          background: C.lime,
          padding: '30px 44px 24px',
        }}
      >
        <div style={{...textBase, fontSize: 64, letterSpacing: 3, color: C.carbon, textShadow: 'none', lineHeight: 1}}>START YOUR CUSTOM ORDER</div>
      </div>
    </AbsoluteFill>
  );
};

export const GhsReel: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.carbon}}>
      <Footage />

      <Scrim from={S.s1} to={S.s2 + 2} strength={0.9} />
      <Scrim from={S.s2 + 2} to={S.s3} strength={0.9} />
      <Scrim from={S.s3} to={S.s4} strength={0.92} />
      <Scrim from={S.s4} to={434} strength={0.92} />

      <Chrome from={S.s2 + 4} to={S.s4 + 100} />

      {/* SCENE 01 */}
      {f < 90 ? (
      <div style={{position: 'absolute', left: 70, top: 1130, display: 'flex', flexDirection: 'column', gap: 14, opacity: interpolate(f, [82, 90], [1, 0], clamp)}}>
        <Reveal at={15} dur={10} style={{}}>
          <div style={{...textBase, fontSize: 146}}>ANOTHER ORDER.</div>
        </Reveal>
        <Reveal at={48} dur={10}>
          <div style={{...textBase, fontSize: 146, color: C.lime}}>IN THE MAKING.</div>
        </Reveal>
      </div>
      ) : null}

      {/* SCENE 02 */}
      {f >= 94 && f < 182 ? (
        <div style={{position: 'absolute', left: 80, top: 1180, opacity: interpolate(f, [172, 180], [1, 0], clamp)}}>
          <Reveal at={96} dur={10}>
            <div style={{...textBase, fontSize: 176}}>CUSTOM</div>
            <div style={{...textBase, fontSize: 176}}>TEAMWEAR.</div>
          </Reveal>
          <div style={{marginTop: 26, opacity: pop(f, 110), transform: `translateX(${(1 - pop(f, 110)) * -30}px)`}}>
            <Small size={34} track={5} color="rgba(245,245,240,0.9)">
              REAL PRODUCTION — <span style={{color: C.lime}}>GHS CUSTOM GEAR</span>
            </Small>
          </div>
        </div>
      ) : null}

      {/* SCENE 03 */}
      {f >= 180 && f < 302 ? (
        <div style={{position: 'absolute', left: 80, top: 1170, display: 'flex', flexDirection: 'column', gap: 12, opacity: interpolate(f, [292, 300], [1, 0], clamp)}}>
          {[
            {t: 'EVERY NAME.', at: 182, until: 210},
            {t: 'EVERY NUMBER.', at: 212, until: 267},
            {t: 'EVERY DETAIL.', at: 267, until: 999},
          ].map((l, i) => {
            const dim = i === 2 ? 1 : interpolate(f, [l.until, l.until + 6], [1, 0.28], clamp);
            return (
              <div key={l.t} style={{opacity: dim}}>
                <Reveal at={l.at} dur={8}>
                  <div style={{...textBase, fontSize: 128, color: i === 2 ? C.lime : C.porcelain}}>{l.t}</div>
                </Reveal>
              </div>
            );
          })}
        </div>
      ) : null}
      <Brackets at={182} to={210} x={190} y={460} w={700} h={460} />
      <Brackets at={212} to={240} x={190} y={460} w={700} h={460} />
      <Brackets at={242} to={265} x={190} y={460} w={700} h={460} />
      <Brackets at={267} to={300} x={190} y={460} w={700} h={460} />

      {/* SCENE 04 */}
      {f >= 304 && f < 436 ? (
        <div style={{position: 'absolute', left: 80, top: 1250, opacity: interpolate(f, [410, 420], [1, 0], clamp)}}>
          <Reveal at={306} dur={10}>
            <div style={{...textBase, fontSize: 150}}>MADE BY</div>
            <div style={{...textBase, fontSize: 150}}>REAL HANDS.</div>
          </Reveal>
          <div style={{marginTop: 26, opacity: pop(f, 322), transform: `translateX(${(1 - pop(f, 322)) * -30}px)`}}>
            <Small size={36} track={5} color={C.porcelain}>
              IN-HOUSE SPORTSWEAR <span style={{color: C.lime}}>MANUFACTURING</span>
            </Small>
          </div>
        </div>
      ) : null}

      <Wipe />
      <EndCard />

      <Audio src={staticFile('audio/mix.wav')} />
    </AbsoluteFill>
  );
};
