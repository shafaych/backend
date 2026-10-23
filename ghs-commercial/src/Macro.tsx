import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, LightSweep, Plate, StitchDefs, clamp, ease, lerp, tex} from './common';

const FOCUS = 'radial-gradient(ellipse 80% 44% at 50% 52%, #000 38%, transparent 100%)';

/** Ladder / lockstitch capsules laid along a line, drawn in the line's own rotated space. */
const StitchRun: React.FC<{id: string; len: number; every: number; sLen: number; th: number; x0?: number; y?: number; reveal?: number}> = ({
  id, len, every, sLen, th, x0 = -1700, y = 0, reveal = 1,
}) => {
  const n = Math.floor(len / every);
  return (
    <g filter={`url(#${id}-f)`}>
      {Array.from({length: n}).map((_, i) => {
        const x = x0 + i * every;
        if ((i / n) > reveal) return null;
        return <rect key={i} x={x} y={y - th / 2} width={sLen} height={th} rx={th / 2} fill={`url(#${id}-g)`} />;
      })}
    </g>
  );
};

/** 01 — Opening: dark knit, raking light, a single lime thread pulled taut at the end. */
export const FabricOpen: React.FC = () => {
  const f = useCurrentFrame();
  const z = lerp(f, 1.35, 1.58, 0, 60);
  const thread = lerp(f, 0, 1, 34, 58, ease);
  return (
    <AbsoluteFill style={{background: '#0b0c0b'}}>
      <Plate src={tex('knit_graphite.jpg')} zoom={z} x={lerp(f, -40, 30, 0, 60)} y={lerp(f, 60, -50, 0, 60)} rot={-9} focus="radial-gradient(ellipse 70% 38% at 50% 46%, #000 30%, transparent 100%)" blur={16} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 50% at 50% 48%, rgba(0,0,0,0) 20%, rgba(0,0,0,.72) 100%)'}} />
      <LightSweep p={lerp(f, 0, 1, 0, 60)} angle={22} strength={0.85} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <StitchDefs id="o" />
        <g transform="rotate(-9 540 1000)" opacity={f > 34 ? 1 : 0}>
          <g filter="url(#o-f)">
            <rect x={-200} y={990} width={thread * 1500} height={9} rx={4.5} fill="url(#o-g)" />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Two fabrics meeting at a flat seam with a ladder of lime stitches. */
export const Seam: React.FC<{a: string; b: string; angle: number; len: number; thread?: string; flip?: boolean; drift?: number}> = ({
  a, b, angle, len, thread = C.lime, flip, drift = 1,
}) => {
  const f = useCurrentFrame();
  const z = lerp(f, 1.2, 1.32, 0, len);
  const x = lerp(f, -50 * drift, 50 * drift, 0, len);
  const reveal = lerp(f, 0, 1.15, 0, Math.min(10, len), ease);
  const id = 's' + angle;
  const rad = (angle * Math.PI) / 180;
  const nx = Math.cos(rad), ny = Math.sin(rad);
  // half-plane clip for the second fabric (line through centre at `angle`)
  const R = 3000;
  const p = (s: number, t: number) => `${540 + nx * s - ny * t}px ${960 + ny * s + nx * t}px`;
  const poly = `polygon(${p(-R, 0)}, ${p(R, 0)}, ${p(R, R)}, ${p(-R, R)})`;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Plate src={tex(a)} zoom={z} x={x} rot={flip ? 4 : -3} focus={FOCUS} blur={8} />
      <AbsoluteFill style={{clipPath: poly}}>
        <Plate src={tex(b)} zoom={z} x={x} y={40} rot={flip ? 4 : -3} focus={FOCUS} blur={8} />
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <StitchDefs id={id} color={thread} />
        <defs>
          <linearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity=".6" />
            <stop offset=".18" stopColor="#fff" stopOpacity=".16" />
            <stop offset=".5" stopColor="#000" stopOpacity=".12" />
            <stop offset=".82" stopColor="#fff" stopOpacity=".1" />
            <stop offset="1" stopColor="#000" stopOpacity=".7" />
          </linearGradient>
          <filter id={`${id}-blur`}><feGaussianBlur stdDeviation="14" /></filter>
        </defs>
        <g transform={`translate(540 960) rotate(${angle - 90 + 90})`}>
          {/* cast shadow either side of the raised flatlock band */}
          <rect x={-2200} y={-26} width={4400} height={140} fill="#000" opacity=".45" filter={`url(#${id}-blur)`} />
          <rect x={-2200} y={-46} width={4400} height={92} fill={`url(#${id}-band)`} />
          <rect x={-2200} y={-46} width={4400} height={3} fill="#000" opacity=".55" />
          {/* ladder stitches across the band + two straight chain lines */}
          <g transform="rotate(90)" />
          <g>
            {Array.from({length: 120}).map((_, i) => {
              const xx = -1900 + i * 36;
              if (xx > -1900 + reveal * 3800) return null;
              return <g key={i} filter={`url(#${id}-f)`}><rect x={xx} y={-36} width={11} height={72} rx={5.5} transform={`rotate(-14 ${xx} 0)`} fill={`url(#${id}-g)`} /></g>;
            })}
          </g>
        </g>
      </svg>
      <LightSweep p={lerp(f, 0.2, 1, 0, len)} angle={20} strength={0.55} />
    </AbsoluteFill>
  );
};

/** Ribbed crew collar with taped neck seam and double topstitch. */
export const Collar: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const z = lerp(f, 1.18, 1.3, 0, len);
  const y = lerp(f, 30, -30, 0, len);
  const reveal = lerp(f, 0, 1, 0, 9, ease);
  const band = 'M -150 760 Q 540 1290 1230 760';
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Plate src={tex('knit_graphite.jpg')} zoom={z} y={y} rot={0} focus={FOCUS} blur={9} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <StitchDefs id="c" />
        <defs>
          <pattern id="ribP" patternUnits="userSpaceOnUse" x={-270} y={-480} width={1620} height={2880}>
            <image href={tex('rib_carbon.jpg')} width={1620} height={2880} />
          </pattern>
          <filter id="cshadow" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="26" /></filter>
        </defs>
        <g transform={`translate(540 960) scale(${1 + (z - 1.18) * 0.4}) translate(-540 ${-960 + y * 0.4})`}>
          <path d={band} stroke="#000" strokeWidth={300} fill="none" opacity={0.65} transform="translate(0 40)" filter="url(#cshadow)" />
          {/* neck tape (lime) inside edge */}
          <path d={band} stroke={C.lime} strokeWidth={262} fill="none" transform="translate(0 30)" opacity={0.85} />
          <path d={band} stroke="#000" strokeWidth={286} fill="none" transform="translate(0 52)" opacity={0.0} />
          <path d={band} stroke="url(#ribP)" strokeWidth={246} fill="none" />
          {/* rib highlights/shadows rolling over the band curvature */}
          <path d={band} stroke="url(#cg)" strokeWidth={246} fill="none" />
          <defs>
            <linearGradient id="cg" gradientUnits="userSpaceOnUse" x1="0" y1="640" x2="0" y2="1100">
              <stop offset="0" stopColor="#fff" stopOpacity=".18" />
              <stop offset=".5" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity=".55" />
            </linearGradient>
          </defs>
          {/* topstitch rows */}
          <g transform="translate(0 0)">
            {[-116, 118].map((o, k) => (
              <path key={k} d={band} transform={`translate(0 ${o})`} stroke="url(#c-g)" strokeWidth={8} fill="none"
                strokeDasharray="26 12" strokeLinecap="round" filter="url(#c-f)" pathLength={100} style={{strokeDashoffset: 0}} opacity={reveal > 0.2 ? 1 : 0} />
            ))}
          </g>
        </g>
      </svg>
      <LightSweep p={lerp(f, 0, 1, 0, len)} angle={-20} strength={0.55} />
    </AbsoluteFill>
  );
};

/** Sublimated all-over print: chevron speed pattern dyed into the knit. */
export const Print: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const z = lerp(f, 1.15, 1.28, 0, len);
  const shift = lerp(f, 0, 60, 0, len);
  return (
    <AbsoluteFill style={{background: C.carbon, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z}) translate(${-shift * 0.5}px, 0)`, transformOrigin: '50% 50%'}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: -200, width: 1480, height: 2320}} viewBox="-200 -200 1480 2320">
          <defs>
            <linearGradient id="pfade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={C.lime} /><stop offset=".55" stopColor="#8fb04a" /><stop offset="1" stopColor={C.graphite} />
            </linearGradient>
          </defs>
          <rect x={-200} y={-200} width={1480} height={2320} fill="#1b1d1b" />
          {Array.from({length: 22}).map((_, i) => {
            const y0 = -200 + i * 140;
            return (
              <g key={i}>
                <polyline points={`-200,${y0 + 240} 540,${y0} 1280,${y0 + 240}`} fill="none" stroke="url(#pfade)" strokeWidth={i % 3 === 0 ? 70 : 28} opacity={i % 3 === 0 ? 0.95 : 0.55} />
                {i % 4 === 0 ? <polyline points={`-200,${y0 + 300} 540,${y0 + 60} 1280,${y0 + 300}`} fill="none" stroke={C.porcelain} strokeWidth={6} opacity={0.85} /> : null}
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
      {/* knit relief printed through the dye: multiply + screen so the pattern stays in the yarn */}
      <AbsoluteFill style={{mixBlendMode: 'multiply'}}>
        <Plate src={tex('knit_porcelain.jpg')} zoom={z * 1.05} x={-shift * 0.5} focus={FOCUS} blur={6} />
      </AbsoluteFill>
      <AbsoluteFill style={{mixBlendMode: 'soft-light', opacity: 0.6}}>
        <Plate src={tex('knit_porcelain.jpg')} zoom={z * 1.05} x={-shift * 0.5} focus={FOCUS} blur={6} />
      </AbsoluteFill>
      <LightSweep p={lerp(f, 0, 1, 0, len)} angle={-15} strength={0.5} />
    </AbsoluteFill>
  );
};

/** Embroidered-style satin-stitch GHS mark, raised with specular relief. */
export const Emblem: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const z = lerp(f, 1.0, 1.1, 0, len);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Plate src={tex('knit_carbon.jpg')} zoom={1.25} focus={FOCUS} blur={10} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <pattern id="satin" patternUnits="userSpaceOnUse" width={1620} height={2880} x={-270} y={-480}>
            <image href={tex('satin_lime.jpg')} width={1620} height={2880} />
          </pattern>
          <filter id="emb" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4.5" result="b" />
            <feDiffuseLighting in="b" surfaceScale="9" diffuseConstant="1.15" lightingColor="#fff" result="d"><feDistantLight azimuth="235" elevation="52" /></feDiffuseLighting>
            <feComposite in="d" in2="SourceAlpha" operator="in" result="d2" />
            <feBlend in="SourceGraphic" in2="d2" mode="multiply" result="m" />
            <feComponentTransfer in="m" result="m2"><feFuncR type="linear" slope="1.35" /><feFuncG type="linear" slope="1.35" /><feFuncB type="linear" slope="1.35" /></feComponentTransfer>
            <feSpecularLighting in="b" surfaceScale="8" specularConstant="1.1" specularExponent="26" lightingColor="#fff" result="sp"><feDistantLight azimuth="235" elevation="46" /></feSpecularLighting>
            <feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2" />
            <feComposite in="m2" in2="sp2" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0" />
          </filter>
          <filter id="eshadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="6" dy="14" stdDeviation="9" floodColor="#000" floodOpacity=".8" /></filter>
        </defs>
        <g transform={`translate(540 940) scale(${z}) translate(-540 -940)`}>
          <g filter="url(#eshadow)">
            <g filter="url(#emb)">
              <text x={540} y={1060} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={700} fontSize={560} letterSpacing={14} fill="url(#satin)">GHS</text>
            </g>
          </g>
          {/* running-stitch baseline */}
          <line x1={150} y1={1150} x2={930} y2={1150} stroke={C.porcelain} strokeWidth={5} strokeDasharray="18 11" strokeLinecap="round" opacity={0.85} />
          <text x={540} y={1250} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={600} fontSize={92} letterSpacing={34} fill={C.porcelain} opacity={0.9} filter="url(#eshadow)">CUSTOM GEAR</text>
        </g>
      </svg>
      <LightSweep p={lerp(f, 0, 1, 0, len)} angle={20} strength={0.6} />
    </AbsoluteFill>
  );
};

/** Twin-needle hem on porcelain jersey. */
export const Hem: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const z = lerp(f, 1.18, 1.3, 0, len);
  const y = lerp(f, -30, 30, 0, len);
  const reveal = lerp(f, 0, 1.1, 0, 10, ease);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Plate src={tex('knit_porcelain.jpg')} zoom={z} y={y} rot={-4} focus={FOCUS} blur={8} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <StitchDefs id="h" color="#2b2f2b" />
        <defs>
          <linearGradient id="fold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset=".45" stopColor="#000" stopOpacity=".32" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".22" /><stop offset="1" stopColor="#000" stopOpacity=".55" />
          </linearGradient>
          <filter id="hb"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        <g transform="translate(540 980) rotate(-4)">
          <rect x={-1400} y={-30} width={2800} height={120} fill="#000" opacity=".4" filter="url(#hb)" />
          <rect x={-1400} y={-6} width={2800} height={1300} fill="url(#fold)" />
          <rect x={-1400} y={-6} width={2800} height={1300} fill="#000" opacity=".12" />
          {[110, 190].map((o) => (
            <g key={o} transform={`translate(0 ${o})`}><StitchRun id="h" len={3200} every={26} sLen={21} th={6.5} x0={-1500} reveal={reveal} /></g>
          ))}
        </g>
      </svg>
      <LightSweep p={lerp(f, 0.1, 1, 0, len)} angle={-18} strength={0.5} />
    </AbsoluteFill>
  );
};
