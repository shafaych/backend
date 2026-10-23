import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const TOTAL = 450;
export const sec = (s: number) => Math.round(s * FPS);

export const C = {
  carbon: '#171917',
  graphite: '#333832',
  lime: '#C8F36B',
  porcelain: '#F5F5F0',
  white: '#FFFFFF',
};

export const ease = Easing.bezier(0.16, 0.8, 0.12, 1);
export const easeIO = Easing.bezier(0.65, 0, 0.25, 1);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lerp = (f: number, a: number, b: number, from: number, to: number, e = (x: number) => x) =>
  interpolate(f, [from, to], [a, b], {...clamp, easing: e});

export const tex = (n: string) => staticFile(`tex/${n}`);

const IMAGES = [
  'knit_carbon.jpg', 'knit_graphite.jpg', 'knit_porcelain.jpg', 'knit_lime.jpg', 'rib_carbon.jpg', 'rib_lime.jpg',
  'mesh_carbon.jpg', 'mesh_porcelain.jpg', 'satin_lime.jpg', 'satin_porcelain.jpg', 'knit_tile_overlay.png',
  'knit_tile_fine.png', 'grain.png',
].map(tex);
const FONTS: [string, string, string][] = [
  ['Inter', '300', 'inter-latin-300-normal.woff2'], ['Inter', '500', 'inter-latin-500-normal.woff2'],
  ['Inter', '600', 'inter-latin-600-normal.woff2'], ['Inter', '700', 'inter-latin-700-normal.woff2'],
  ['Barlow Condensed', '600', 'barlow-condensed-latin-600-normal.woff2'],
  ['Barlow Condensed', '700', 'barlow-condensed-latin-700-normal.woff2'],
];

/** Blocks rendering until every texture and typeface is decoded, so SVG <image> never pops in. */
export const Preload: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [handle] = useState(() => delayRender('assets'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const imgs = IMAGES.map(
      (src) => new Promise<void>((res) => { const i = new Image(); i.onload = () => res(); i.onerror = () => res(); i.src = src; }),
    );
    const fonts = FONTS.map(async ([family, weight, file]) => {
      const f = new FontFace(family, `url(${staticFile('fonts/' + file)})`, {weight});
      await f.load(); document.fonts.add(f);
    });
    Promise.all([...imgs, ...fonts]).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  return ready ? <>{children}</> : null;
};

/** Large macro plate with a drifting camera and a cheap depth-of-field (blurred copy + masked sharp copy). */
export const Plate: React.FC<{
  src: string; zoom: number; x?: number; y?: number; rot?: number; blur?: number; focus?: string; sharp?: boolean;
}> = ({src, zoom, x = 0, y = 0, rot = 0, blur = 9, focus, sharp = true}) => {
  const style: React.CSSProperties = {
    position: 'absolute', left: (W - 1620) / 2, top: (H - 2880) / 2, width: 1620, height: 2880,
    transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${zoom})`, transformOrigin: '50% 50%',
  };
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {focus ? <Img src={src} style={{...style, filter: `blur(${blur}px)`}} /> : null}
      <Img src={src} style={{...style, ...(focus ? {WebkitMaskImage: focus, maskImage: focus} : {})}} />
    </AbsoluteFill>
  );
};

/** Soft raking highlight that glides across the fabric. */
export const LightSweep: React.FC<{p: number; angle?: number; strength?: number}> = ({p, angle = 18, strength = 0.5}) => (
  <AbsoluteFill style={{mixBlendMode: 'soft-light', opacity: strength, overflow: 'hidden'}}>
    <div style={{
      position: 'absolute', left: -600 + p * 1800, top: -600, width: 700, height: 3200,
      transform: `rotate(${angle}deg)`,
      background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.95) 50%, rgba(255,255,255,0))',
      filter: 'blur(40px)',
    }} />
  </AbsoluteFill>
);

/** Scrim that keeps lower-third typography readable without hiding the garment. */
export const Scrim: React.FC<{strength?: number; height?: number}> = ({strength = 0.7, height = 760}) => (
  <div style={{
    position: 'absolute', left: 0, right: 0, bottom: 0, height,
    background: `linear-gradient(180deg, rgba(10,11,10,0), rgba(10,11,10,${strength}))`,
  }} />
);

/** Line of type revealed through a clipped mask. */
export const MaskLine: React.FC<{
  text: string; at: number; out?: number; size: number; weight?: number; track?: number; color?: string;
  font?: string; style?: React.CSSProperties;
}> = ({text, at, out, size, weight = 500, track = 0.2, color = C.porcelain, font = 'Inter', style}) => {
  const f = useCurrentFrame();
  const inY = lerp(f, 105, 0, at, at + 14, ease);
  const outY = out !== undefined ? lerp(f, 0, -105, out, out + 10, easeIO) : 0;
  const op = f < at ? 0 : 1;
  return (
    <div style={{overflow: 'hidden', paddingBottom: size * 0.12, paddingTop: size * 0.05, opacity: op, ...style}}>
      <div style={{
        fontFamily: font, fontSize: size, fontWeight: weight, letterSpacing: `${track}em`, color, lineHeight: 1.05,
        transform: `translateY(${inY + outY}%)`, whiteSpace: 'nowrap',
      }}>{text}</div>
    </div>
  );
};

/** Film finishing: vignette, warm highlights / neutral-cool shadows, and animated grain. */
export const Grade: React.FC<{children: React.ReactNode; vignette?: number}> = ({children, vignette = 0.55}) => {
  const f = useCurrentFrame();
  const gx = (f * 137) % 400, gy = (f * 91) % 600;
  return (
    <AbsoluteFill style={{filter: 'contrast(1.07) saturate(0.93)'}}>
      {children}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${vignette}) 100%)`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,236,205,0.07), rgba(40,60,70,0.10))', mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{
        backgroundImage: `url(${tex('grain.png')})`, backgroundSize: '1080px 1920px', backgroundPosition: `${gx}px ${gy}px`,
        mixBlendMode: 'overlay', opacity: 0.28,
      }} />
    </AbsoluteFill>
  );
};

/**
 * Fabric-inspired directional wipe: a band of dark knit with a stitched leading edge sweeps across.
 * The picture cut happens at `cut`, hidden fully under the band.
 */
export const FabricWipe: React.FC<{cut: number; dir?: 1 | -1; len?: number; toBlack?: boolean}> = ({cut, dir = 1, len = 14, toBlack}) => {
  const f = useCurrentFrame();
  const a = cut - len / 2;
  if (f < a || f > a + len + (toBlack ? 0 : 0)) return null;
  const p = easeIO((f - a) / len);
  const bandW = 1900;
  const x = dir === 1 ? -bandW + p * (W + bandW * 1.0 + 200) : W + 200 - p * (W + bandW + 200);
  const edge = dir === 1 ? {right: 0} : {left: 0};
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: x, top: -300, width: bandW, height: H + 600, transform: 'rotate(8deg)', transformOrigin: '50% 50%'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: toBlack ? 'none' : `url(${tex('knit_carbon.jpg')})`, backgroundColor: toBlack ? '#080908' : undefined, backgroundSize: '1620px 2880px', backgroundPosition: `${-p * 500}px 0`}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, rgba(0,0,0,.55))'}} />
        {/* running stitch along the leading edge */}
        <div style={{position: 'absolute', top: 0, bottom: 0, width: 4, ...(dir === 1 ? {right: 46} : {left: 46}),
          backgroundImage: `repeating-linear-gradient(180deg, ${C.lime} 0 22px, transparent 22px 40px)`, opacity: 0.9, filter: 'drop-shadow(0 0 2px rgba(0,0,0,.6))'}} />
        <div style={{position: 'absolute', top: 0, bottom: 0, width: 90, ...edge, background: dir === 1 ? 'linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,.65))' : 'linear-gradient(270deg, rgba(0,0,0,0), rgba(0,0,0,.65))'}} />
      </div>
    </AbsoluteFill>
  );
};

/** Lime thread capsule with simple volume shading. */
export const StitchDefs: React.FC<{id: string; color?: string}> = ({id, color = C.lime}) => (
  <defs>
    <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity=".75" />
      <stop offset=".35" stopColor={color} />
      <stop offset="1" stopColor="#000" stopOpacity=".55" />
    </linearGradient>
    <filter id={`${id}-f`} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="4" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
      <feDropShadow dx="2" dy="4" stdDeviation="2.5" floodColor="#000" floodOpacity=".65" />
    </filter>
  </defs>
);
