import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {rng} from './palette';

export const FontFaces = () => (
  <style>{`
  @font-face{font-family:'Alfa';src:url(${staticFile('fonts/alfa-slab-one-latin-400-normal.woff2')});}
  @font-face{font-family:'Fraunces';font-weight:400;src:url(${staticFile('fonts/fraunces-latin-400-normal.woff2')});}
  @font-face{font-family:'Fraunces';font-weight:500;src:url(${staticFile('fonts/fraunces-latin-500-normal.woff2')});}
  @font-face{font-family:'Fraunces';font-style:italic;font-weight:400;src:url(${staticFile('fonts/fraunces-latin-400-italic.woff2')});}
  @font-face{font-family:'InterX';font-weight:500;src:url(${staticFile('fonts/inter-latin-500-normal.woff2')});}
  @font-face{font-family:'InterX';font-weight:600;src:url(${staticFile('fonts/inter-latin-600-normal.woff2')});}
  `}</style>
);

/** Shared SVG filter library: wool, leather, chenille, blurs. Render once per scene SVG. */
export const FilterDefs = () => (
  <defs>
    <filter id="wool" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n" />
      <feDiffuseLighting in="n" surfaceScale="1.7" lightingColor="#fff" result="l"><feDistantLight azimuth="225" elevation="58" /></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.05" k2="0.06" k3="0" k4="0" result="m" />
      <feComposite in="m" in2="SourceAlpha" operator="in" />
    </filter>
    <filter id="leather" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.38 0.5" numOctaves="3" seed="9" result="n" />
      <feDiffuseLighting in="n" surfaceScale="1.1" lightingColor="#fff" result="l"><feDistantLight azimuth="235" elevation="62" /></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.0" k2="0.04" k3="0" k4="0" result="m" />
      <feComposite in="m" in2="SourceAlpha" operator="in" />
    </filter>
    <filter id="chenille" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="2" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n2" />
      <feDiffuseLighting in="n2" surfaceScale="3.2" lightingColor="#fff" result="l"><feDistantLight azimuth="225" elevation="48" /></feDiffuseLighting>
      <feComposite in="d" in2="l" operator="arithmetic" k1="1.15" k2="0" k3="0" k4="0" result="m" />
      <feComposite in="m" in2="d" operator="in" />
    </filter>
    <filter id="softshadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="2" /></filter>
    <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="blur14"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
    <filter id="motionX" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="46 1.2" /></filter>
    <filter id="motionXs" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="22 0.8" /></filter>
  </defs>
);

/** Film grain + vignette + gentle highlight roll-off. */
export const Finish: React.FC<{grain?: number; vignette?: number; warm?: number; cool?: number}> = ({grain = 0.1, vignette = 0.55, warm = 0.0, cool = 0.0}) => {
  const f = useCurrentFrame();
  const seed = Math.floor(rng(f) * 999);
  return (
    <>
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <svg width="1080" height="1920" style={{mixBlendMode: 'soft-light', opacity: 1}}>
          <defs>
            <linearGradient id="lg" x1="0" x2="1"><stop offset="0" stopColor="#6fb5ff" stopOpacity={cool} /><stop offset="0.5" stopOpacity="0" /><stop offset="1" stopColor="#ffb25a" stopOpacity={warm} /></linearGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#lg)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 45%, rgba(4,6,12,${vignette}) 100%)`}} />
      <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: grain}}>
        <svg width="1080" height="1920">
          <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="1080" height="1920" filter={`url(#g${seed})`} />
        </svg>
      </AbsoluteFill>
    </>
  );
};
