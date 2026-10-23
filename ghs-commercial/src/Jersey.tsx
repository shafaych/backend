import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, LightSweep, clamp, ease, easeIO, lerp, tex} from './common';

export type Design = 'voltage' | 'grid' | 'contour' | 'split';

const BODY = `M 400 340 C 330 360 270 385 205 415 L 62 690 L 250 775 C 280 770 298 750 302 722
 C 296 1000 290 1250 282 1490 C 420 1522 660 1522 798 1490 C 790 1250 784 1000 778 722
 C 782 750 800 770 830 775 L 1018 690 L 875 415 C 810 385 750 360 680 340
 C 640 470 440 470 400 340 Z`;
const NECK = 'M 680 340 C 640 470 440 470 400 340';
const NECK_BACK = 'M 400 340 C 440 318 640 318 680 340 C 640 470 440 470 400 340 Z';
const SLEEVE_L = 'M 205 415 L 62 690 L 250 775 C 280 770 298 750 302 722 L 300 560 Z';
const SLEEVE_R = 'M 875 415 L 1018 690 L 830 775 C 800 770 782 750 778 722 L 780 560 Z';

type Pal = {body: string; sleeve: string; ink: string; trim: string; collar: 'carbon' | 'lime'; text: string};

const PAL: Record<Design, Pal> = {
  voltage: {body: '#191b19', sleeve: '#2c312c', ink: C.porcelain, trim: C.lime, collar: 'carbon', text: C.porcelain},
  grid: {body: '#efefe8', sleeve: '#e6e6de', ink: '#2a2e2a', trim: C.lime, collar: 'carbon', text: '#1c1e1c'},
  contour: {body: '#30352f', sleeve: '#262a25', ink: C.lime, trim: C.porcelain, collar: 'lime', text: C.lime},
  split: {body: '#171917', sleeve: '#f2f2ec', ink: C.porcelain, trim: C.lime, collar: 'lime', text: C.porcelain},
};

const NAME: Record<Design, {team: string; num: string}> = {
  voltage: {team: 'ATLAS FC', num: '07'},
  grid: {team: 'NORTH SQUAD', num: '23'},
  contour: {team: 'VOLTA', num: '11'},
  split: {team: 'HALCYON', num: '90'},
};

const Pattern: React.FC<{d: Design; id: string}> = ({d, id}) => {
  if (d === 'voltage')
    return (
      <g>
        <rect x={0} y={330} width={1080} height={1200} fill="#191b19" />
        {/* sublimated speed-lines sweeping up from the hem */}
        {Array.from({length: 18}).map((_, i) => (
          <path key={i} d={`M ${230 + i * 38} 1530 L ${620 + i * 38} ${1000 - i * 8}`} stroke={i % 6 === 0 ? C.lime : '#3b413a'} strokeWidth={i % 6 === 0 ? 14 : 5 + (i % 3) * 3} opacity={i % 6 === 0 ? 0.95 : 0.9} />
        ))}
        <path d="M 282 1490 L 282 1180 L 520 1530 Z" fill={C.lime} opacity={0.0} />
        <rect x={0} y={900} width={1080} height={700} fill={`url(#${id}-fadeD)`} />
        {/* sleeve pinstripes */}
        {Array.from({length: 9}).map((_, i) => (<path key={'l' + i} d={`M ${230 - i * 14} ${440 + i * 36} L ${340} ${600 + i * 14}`} stroke={C.porcelain} strokeWidth={2} opacity={0.35} />))}
      </g>
    );
  if (d === 'grid')
    return (
      <g>
        <rect x={0} y={330} width={1080} height={1200} fill="#efefe8" />
        {/* triangulated geometric pattern fading out down the body */}
        {Array.from({length: 11}).flatMap((_, r) =>
          Array.from({length: 9}).map((__, c) => {
            const s = 120, x = 140 + c * s + (r % 2) * (s / 2), y = 340 + r * 104;
            const a = Math.max(0, 0.95 - r * 0.09) * (((r * 7 + c * 3) % 5) / 5 + 0.25);
            return <polygon key={`${r}-${c}`} points={`${x},${y + 104} ${x + s / 2},${y} ${x + s},${y + 104}`} fill="#2a2e2a" opacity={Math.min(1, a)} />;
          }),
        )}
        <rect x={0} y={330} width={1080} height={1200} fill={`url(#${id}-fadeL)`} />
      </g>
    );
  if (d === 'contour')
    return (
      <g>
        <rect x={0} y={330} width={1080} height={1200} fill="#30352f" />
        {Array.from({length: 26}).map((_, i) => (
          <path key={i} d={`M 0 ${420 + i * 46} C 220 ${360 + i * 46 + (i % 5) * 18} 360 ${520 + i * 46 - (i % 4) * 12} 540 ${440 + i * 46} S 880 ${340 + i * 46} 1080 ${470 + i * 46}`}
            fill="none" stroke={C.lime} strokeWidth={i % 5 === 0 ? 4.5 : 2.4} opacity={i % 5 === 0 ? 0.75 : 0.38} />
        ))}
      </g>
    );
  return (
    <g>
      <polygon points="0,300 610,300 430,1560 0,1560" fill="#f2f2ec" />
      <polygon points="610,300 1080,300 1080,1560 430,1560" fill="#171917" />
      <line x1={610} y1={300} x2={430} y2={1560} stroke={C.lime} strokeWidth={10} />
    </g>
  );
};

/** Garment rendered as lit fabric: sublimated artwork -> knit relief -> form shading -> seams. */
export const JerseySVG: React.FC<{d: Design; cell: number; seed: number}> = ({d, cell, seed}) => {
  const id = `j-${d}`;
  const p = PAL[d];
  const nm = NAME[d];
  const ks = cell / 16; // knit tile cell is 16px
  const ribLime = p.collar === 'lime';
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <clipPath id={`${id}-body`}><path d={BODY} /></clipPath>
        <clipPath id={`${id}-slL`}><path d={SLEEVE_L} /></clipPath>
        <clipPath id={`${id}-slR`}><path d={SLEEVE_R} /></clipPath>
        <clipPath id={`${id}-half-l`}><polygon points="0,300 610,300 430,1560 0,1560" /></clipPath>
        <clipPath id={`${id}-half-r`}><polygon points="610,300 1080,300 1080,1560 430,1560" /></clipPath>
        <linearGradient id={`${id}-fadeD`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#191b19" stopOpacity=".95" /><stop offset=".6" stopColor="#191b19" stopOpacity="0" /></linearGradient>
        <linearGradient id={`${id}-fadeL`} x1="0" y1="0" x2="0" y2="1"><stop offset=".25" stopColor="#efefe8" stopOpacity="0" /><stop offset="1" stopColor="#efefe8" stopOpacity=".95" /></linearGradient>
        <pattern id={`${id}-knit`} patternUnits="userSpaceOnUse" width={768 * ks} height={768 * ks}><image href={tex('knit_tile_overlay.png')} width={768 * ks} height={768 * ks} /></pattern>
        <pattern id={`${id}-knitM`} patternUnits="userSpaceOnUse" width={768 * ks} height={768 * ks}><image href={tex('knit_tile_fine.png')} width={768 * ks} height={768 * ks} /></pattern>
        <pattern id={`${id}-rib`} patternUnits="userSpaceOnUse" x={0} y={0} width={1620 * 0.5} height={2880 * 0.5}>
          <image href={tex(ribLime ? 'rib_lime.jpg' : 'rib_carbon.jpg')} width={810} height={1440} />
        </pattern>
        <linearGradient id={`${id}-form`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".62" /><stop offset=".16" stopColor="#000" stopOpacity=".18" />
          <stop offset=".42" stopColor="#fff" stopOpacity=".05" /><stop offset=".6" stopColor="#fff" stopOpacity=".01" />
          <stop offset=".86" stopColor="#000" stopOpacity=".28" /><stop offset="1" stopColor="#000" stopOpacity=".7" />
        </linearGradient>
        <linearGradient id={`${id}-vert`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".05" /><stop offset=".3" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".45" />
        </linearGradient>
        <filter id={`${id}-wr`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0032 0.0075" numOctaves="3" seed={seed} result="t" />
          <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -.2" result="h" />
          <feDiffuseLighting in="h" surfaceScale="14" diffuseConstant="0.6" lightingColor="#fff"><feDistantLight azimuth="232" elevation="58" /></feDiffuseLighting>
        </filter>
        <filter id={`${id}-b20`}><feGaussianBlur stdDeviation="20" /></filter>
        <filter id={`${id}-b8`}><feGaussianBlur stdDeviation="7" /></filter>
        <filter id={`${id}-drop`} x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="46" stdDeviation="40" floodColor="#000" floodOpacity=".7" /></filter>
        <filter id={`${id}-relief`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b" />
          <feDiffuseLighting in="b" surfaceScale="3.5" diffuseConstant="1" lightingColor="#fff" result="d"><feDistantLight azimuth="232" elevation="50" /></feDiffuseLighting>
          <feComposite in="d" in2="SourceAlpha" operator="in" result="d2" />
          <feBlend in="SourceGraphic" in2="d2" mode="multiply" />
        </filter>
      </defs>

      <g filter={`url(#${id}-drop)`}>
        {/* garment */}
        <g clipPath={`url(#${id}-body)`}>
          <Pattern d={d} id={id} />
          {/* sleeves keep their own dye lots */}
          <g clipPath={`url(#${id}-slL)`}><rect x={0} y={380} width={540} height={460} fill={d === 'split' ? '#171917' : p.sleeve} />{d === 'voltage' ? Array.from({length: 11}).map((_, i) => <path key={i} d={`M ${60 + i * 18} ${700 - i * 12} L ${300} ${560 + i * 12}`} stroke={C.porcelain} strokeWidth={2} opacity={0.25} />) : null}</g>
          <g clipPath={`url(#${id}-slR)`}><rect x={540} y={380} width={540} height={460} fill={p.sleeve} />{d === 'voltage' ? Array.from({length: 11}).map((_, i) => <path key={i} d={`M ${1020 - i * 18} ${700 - i * 12} L ${780} ${560 + i * 12}`} stroke={C.porcelain} strokeWidth={2} opacity={0.25} />) : null}</g>
          {/* neck interior (back of garment) */}
          <path d={NECK_BACK} fill="#0d0e0d" />
          {/* chest wordmark + number, heat-pressed with relief */}
          <g filter={`url(#${id}-relief)`}>
            {d === 'split' ? (
              <>
                <g clipPath={`url(#${id}-half-l)`}><text x={540} y={640} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={700} fontSize={104} letterSpacing={12} fill="#171917">{nm.team}</text><text x={540} y={1060} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={700} fontSize={380} fill="#171917">{nm.num}</text></g>
                <g clipPath={`url(#${id}-half-r)`}><text x={540} y={640} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={700} fontSize={104} letterSpacing={12} fill="#f2f2ec">{nm.team}</text><text x={540} y={1060} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={700} fontSize={380} fill="#f2f2ec">{nm.num}</text></g>
              </>
            ) : (
              <>
                <text x={540} y={d === 'grid' ? 640 : 650} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={700} fontSize={d === 'grid' ? 96 : 110} letterSpacing={14} fill={p.text}>{nm.team}</text>
                <text x={540} y={1070} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={700} fontSize={400} fill={p.text} stroke={d === 'voltage' ? C.lime : 'none'} strokeWidth={d === 'voltage' ? 0 : 0}>{nm.num}</text>
              </>
            )}
          </g>
          {/* knit structure: overlay for relief, multiply for depth between stitches */}
          <rect x={0} y={300} width={1080} height={1300} fill={`url(#${id}-knitM)`} style={{mixBlendMode: 'multiply'}} opacity={0.28} />
          <rect x={0} y={300} width={1080} height={1300} fill={`url(#${id}-knit)`} style={{mixBlendMode: 'overlay'}} opacity={0.7} />
          {/* form shading + wrinkle lighting */}
          <rect x={0} y={300} width={1080} height={1300} fill={`url(#${id}-form)`} />
          <rect x={0} y={300} width={1080} height={1300} fill={`url(#${id}-vert)`} />
          <rect x={0} y={300} width={1080} height={1300} filter={`url(#${id}-wr)`} style={{mixBlendMode: 'overlay'}} opacity={1} />
          {/* drape folds under the arms and across the waist */}
          <g filter={`url(#${id}-b20)`}>
            <path d="M 300 740 C 380 820 420 900 400 1010" stroke="#000" strokeWidth={34} opacity={0.3} fill="none" />
            <path d="M 780 740 C 700 820 660 900 680 1010" stroke="#000" strokeWidth={34} opacity={0.3} fill="none" />
            <path d="M 330 1180 C 480 1230 620 1210 760 1150" stroke="#fff" strokeWidth={30} opacity={0.05} fill="none" />
            <path d="M 300 1290 C 460 1350 620 1330 790 1280" stroke="#000" strokeWidth={36} opacity={0.22} fill="none" />
          </g>
          {/* garment edge occlusion */}
          <path d={BODY} fill="none" stroke="#000" strokeWidth={26} opacity={0.5} filter={`url(#${id}-b8)`} />
        </g>

        {/* collar */}
        <g>
          <path d={NECK} stroke="#000" strokeWidth={70} fill="none" opacity={0.4} transform="translate(0 8)" filter={`url(#${id}-b8)`} />
          <path d={NECK} stroke={`url(#${id}-rib)`} strokeWidth={56} fill="none" strokeLinecap="butt" transform="translate(0 -6)" />
          <path d={NECK} stroke={`url(#${id}-vert)`} strokeWidth={56} fill="none" transform="translate(0 -6)" />
          <path d={NECK} stroke="#000" strokeWidth={5} fill="none" opacity={0.5} transform="translate(0 22)" />
          <path d={NECK} stroke={d === 'grid' ? p.trim : C.porcelain} strokeWidth={4} fill="none" strokeDasharray="14 9" opacity={0.85} transform="translate(0 28)" strokeLinecap="round" />
        </g>
        {/* seams: shoulder, armhole, side and sleeve hem topstitch */}
        <g fill="none" stroke={p.trim === C.lime && d !== 'grid' ? C.porcelain : '#2a2e2a'} strokeWidth={2.4} strokeDasharray="10 7" opacity={0.55} strokeLinecap="round">
          <path d="M 400 346 C 330 366 270 392 210 424" transform="translate(0 14)" />
          <path d="M 680 346 C 750 366 810 392 870 424" transform="translate(0 14)" />
          <path d="M 296 735 L 300 580" transform="translate(-4 0)" />
          <path d="M 784 735 L 780 580" transform="translate(4 0)" />
          <path d="M 296 1480 C 290 1250 296 1000 302 760" transform="translate(14 0)" opacity={0.7} />
          <path d="M 784 1480 C 790 1250 784 1000 778 760" transform="translate(-14 0)" opacity={0.7} />
        </g>
        <g fill="none" strokeLinecap="round">
          <path d="M 75 705 L 244 780" stroke={d === 'contour' ? C.carbon : p.trim === C.lime ? C.lime : C.porcelain} strokeWidth={14} opacity={0.95} />
          <path d="M 1005 705 L 836 780" stroke={d === 'contour' ? C.carbon : p.trim === C.lime ? C.lime : C.porcelain} strokeWidth={14} opacity={0.95} />
          <path d="M 282 1498 C 420 1530 660 1530 798 1498" stroke="#000" strokeWidth={12} opacity={0.35} />
        </g>
      </g>
    </svg>
  );
};

/** Studio set: graphite sweep, soft key from upper-left, floor falloff. */
const Studio: React.FC<{dark?: number}> = ({dark = 1}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 42% 38%, #3c423b 0%, #20241f 45%, #0d0f0d 100%)`}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,.55) 100%)', opacity: dark}} />
  </AbsoluteFill>
);

export const JerseyShot: React.FC<{
  d: Design; len: number; close?: boolean; focus: [number, number]; z: [number, number]; drift?: [number, number]; seed?: number; slide?: number; sweep?: number;
}> = ({d, len, close, focus, z, drift = [0, 0], seed = 3, slide = 0, sweep = 0.4}) => {
  const f = useCurrentFrame();
  const zz = lerp(f, z[0], z[1], 0, len);
  const cx = focus[0] + lerp(f, 0, drift[0], 0, len);
  const cy = focus[1] + lerp(f, 0, drift[1], 0, len);
  const sx = slide ? lerp(f, slide, 0, 0, 6, ease) : 0;
  const cell = Math.min(26, 10 + 6 * (zz - 1)) / zz; // keep on-screen stitch size constant as the camera pushes
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Studio />
      <AbsoluteFill style={{transform: `translate(${540 + sx}px, 960px) scale(${zz}) translate(${-cx}px, ${-cy}px)`, transformOrigin: '0 0', width: 1080, height: 1920}}>
        <JerseySVG d={d} cell={cell} seed={seed} />
      </AbsoluteFill>
      <LightSweep p={lerp(f, 0, 1, 0, len)} angle={-24} strength={sweep} />
    </AbsoluteFill>
  );
};
