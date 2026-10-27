import React from 'react';
import {C} from './palette';

/** Rib band: burgundy with cream stripes (varsity trim). */
export const Rib: React.FC<{x: number; y: number; w: number; h: number; vertical?: boolean}> = ({x, y, w, h, vertical}) => {
  const els: React.ReactNode[] = [];
  const n = vertical ? Math.floor(h / 6) : Math.floor(w / 6);
  els.push(<rect key="b" x={x} y={y} width={w} height={h} fill={C.burgundy} />);
  // cream double stripe across the band centre (horizontal bands: stripes run along length)
  if (!vertical) {
    els.push(<rect key="s1" x={x} y={y + h * 0.3} width={w} height={h * 0.12} fill={C.cream} />);
    els.push(<rect key="s2" x={x} y={y + h * 0.58} width={w} height={h * 0.12} fill={C.cream} />);
  } else {
    els.push(<rect key="s1" x={x + w * 0.3} y={y} width={w * 0.12} height={h} fill={C.cream} />);
    els.push(<rect key="s2" x={x + w * 0.58} y={y} width={w * 0.12} height={h} fill={C.cream} />);
  }
  // knit ribs
  for (let i = 0; i < n; i++) {
    els.push(vertical
      ? <rect key={'r' + i} x={x} y={y + i * 6 + 4} width={w} height={1.4} fill="#000" opacity={0.28} />
      : <rect key={'r' + i} x={x + i * 6 + 4} y={y} width={1.4} height={h} fill="#000" opacity={0.28} />);
  }
  return <g filter="url(#wool)">{els}</g>;
};

/** Jacket back panel, local coords 0..420 x 0..560. Lettering is part of the jacket. */
export const JacketBack: React.FC<{lettering?: boolean}> = ({lettering = true}) => (
  <g>
    {/* body */}
    <path d="M118,22 Q210,48 302,22 L338,64 L330,470 L90,470 L82,64 Z" fill={C.burgundy} filter="url(#wool)" />
    <path d="M118,22 Q210,48 302,22 L338,64 L330,470 L90,470 L82,64 Z" fill="url(#bodyShade)" />
    {/* yoke seam + side seams */}
    <path d="M86,92 Q210,128 334,92" stroke={C.burgundyLo} strokeWidth="2.5" fill="none" opacity="0.8" />
    <path d="M86,92 Q210,128 334,92" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.12" transform="translate(0,2)" />
    <path d="M96,200 L92,470 M324,200 L328,470" stroke={C.burgundyLo} strokeWidth="2" opacity="0.55" />
    {/* sleeves, cream leather */}
    <path d="M82,64 Q30,66 26,126 L16,432 L84,438 L92,214 Z" fill={C.cream} filter="url(#leather)" />
    <path d="M338,64 Q390,66 394,126 L404,432 L336,438 L328,214 Z" fill={C.cream} filter="url(#leather)" />
    <path d="M82,64 Q30,66 26,126 L16,432 L84,438 L92,214 Z" fill="url(#sleeveShadeL)" />
    <path d="M338,64 Q390,66 394,126 L404,432 L336,438 L328,214 Z" fill="url(#sleeveShadeR)" />
    <path d="M82,66 Q94,150 92,214 M338,66 Q326,150 328,214" stroke={C.creamLo} strokeWidth="2.4" fill="none" opacity="0.8" />
    {/* cuffs */}
    <g transform="rotate(-0.8 50 438)"><Rib x={14} y={432} w={72} h={50} vertical /></g>
    <g transform="rotate(0.8 370 438)"><Rib x={334} y={432} w={72} h={50} vertical /></g>
    {/* hem */}
    <Rib x={90} y={466} w={240} h={56} />
    {/* collar */}
    <path d="M118,24 Q210,52 302,24 L296,4 Q210,30 124,4 Z" fill={C.burgundy} filter="url(#wool)" />
    <path d="M124,6 Q210,32 296,6" stroke={C.cream} strokeWidth="3" fill="none" opacity="0.9" />
    {lettering && (
      <>
        <g filter="url(#softshadow)" opacity="0.45" transform="translate(3,6)">
          <text x="210" y="168" textAnchor="middle" fontFamily="Alfa" fontSize="50" textLength="206" lengthAdjust="spacingAndGlyphs" fill="#000">CARTER</text>
          <text x="210" y="408" textAnchor="middle" fontFamily="Alfa" fontSize="212" textLength="150" lengthAdjust="spacingAndGlyphs" fill="#000">27</text>
        </g>
        <g filter="url(#chenille)">
          <text x="210" y="168" textAnchor="middle" fontFamily="Alfa" fontSize="50" textLength="206" lengthAdjust="spacingAndGlyphs" fill={C.cream} stroke={C.creamLo} strokeWidth="2.2" paintOrder="stroke">CARTER</text>
          <text x="210" y="408" textAnchor="middle" fontFamily="Alfa" fontSize="212" textLength="150" lengthAdjust="spacingAndGlyphs" fill={C.cream} stroke={C.creamLo} strokeWidth="4" paintOrder="stroke">27</text>
        </g>
      </>
    )}
  </g>
);

export const FigureDefs = () => (
  <defs>
    <linearGradient id="bodyShade" x1="0" x2="1">
      <stop offset="0" stopColor="#9fc4ff" stopOpacity="0.16" />
      <stop offset="0.3" stopColor="#000" stopOpacity="0" />
      <stop offset="0.75" stopColor="#000" stopOpacity="0.18" />
      <stop offset="1" stopColor="#ffb060" stopOpacity="0.2" />
    </linearGradient>
    <linearGradient id="sleeveShadeL" x1="0" x2="1"><stop offset="0" stopColor="#9fc4ff" stopOpacity="0.2" /><stop offset="1" stopColor="#000" stopOpacity="0.3" /></linearGradient>
    <linearGradient id="sleeveShadeR" x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity="0.28" /><stop offset="1" stopColor="#ffb060" stopOpacity="0.22" /></linearGradient>
    <linearGradient id="jeansShade" x1="0" x2="1"><stop offset="0" stopColor="#7fa8ff" stopOpacity="0.12" /><stop offset="0.5" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></linearGradient>
  </defs>
);

const Sneaker: React.FC<{x: number; y: number; lift: number; flip?: boolean}> = ({x, y, lift, flip}) => {
  // rear view of a sneaker: heel cup + sole; when lifted the sole tilts into view
  const tilt = Math.min(1, lift / 40);
  return (
    <g transform={`translate(${x},${y - lift}) ${flip ? 'scale(-1,1)' : ''}`}>
      <ellipse cx="0" cy={62} rx="52" ry="9" fill="#000" opacity={0.35 * (1 - tilt * 0.6)} transform={`translate(0,${lift})`} />
      <path d="M-40,0 Q-44,28 -46,52 Q0,62 46,52 Q44,28 40,0 Z" fill={C.sneaker} />
      <path d="M-40,0 Q-44,28 -46,52 Q0,62 46,52 Q44,28 40,0 Z" fill="url(#jeansShade)" />
      <path d="M-18,6 Q0,14 18,6 L16,30 Q0,36 -16,30 Z" fill={C.creamLo} opacity="0.55" />
      <path d="M-47,50 Q0,62 47,50 L48,64 Q0,74 -48,64 Z" fill={C.sole} />
      {tilt > 0 && <path d="M-46,64 Q0,74 46,64 L40,64 Q0,80 -40,64 Z" fill={C.creamLo} opacity={tilt} />}
    </g>
  );
};

/** Figure seen from behind. Local coords: width 420, height ~1020. phase drives walking. */
export const RearFigure: React.FC<{phase?: number; walk?: number; head?: number; breath?: number}> = ({phase = 0, walk = 0, head = 0, breath = 0}) => {
  const s = Math.sin(phase), c = Math.cos(phase);
  const bob = Math.abs(c) * 7 * walk;
  const sway = s * 3 * walk;
  const lL = Math.max(0, s) * 46 * walk, lR = Math.max(0, -s) * 46 * walk;
  return (
    <g transform={`translate(0,${-bob})`}>
      {/* legs */}
      {[0, 1].map((i) => {
        const lift = i === 0 ? lL : lR;
        const cx = i === 0 ? 150 : 270;
        const compress = 1 - lift * 0.0016;
        return (
          <g key={i}>
            <g transform={`translate(${cx},650) scale(1,${compress}) translate(${-cx},-650) translate(0,${-lift * 0.55})`}>
              <path d={`M${cx - 60},650 L${cx - 50},900 L${cx + 50},900 L${cx + 60},650 Z`} fill={C.jeans} />
              <path d={`M${cx - 60},650 L${cx - 50},900 L${cx + 50},900 L${cx + 60},650 Z`} fill="url(#jeansShade)" />
              <path d={`M${cx},660 L${cx},895`} stroke={C.jeansLo} strokeWidth="2" opacity="0.7" />
              <path d={`M${cx - 44},878 L${cx + 44},878 L${cx + 46},906 L${cx - 46},906 Z`} fill={C.jeansLo} opacity="0.6" />
            </g>
            <Sneaker x={cx} y={906 - lift * 0.1 + 0} lift={lift} flip={i === 1} />
          </g>
        );
      })}
      {/* hoodie hem under jacket */}
      <path d="M96,632 L324,632 L328,676 L92,676 Z" fill={C.hoodie} filter="url(#wool)" />
      <path d="M96,660 L324,660 L328,676 L92,676 Z" fill={C.hoodieLo} />
      {/* hands at sides */}
      <g transform={`translate(${sway * 0.5},0)`}>
        <ellipse cx="46" cy={668 + Math.max(0, s) * -8 * walk} rx="21" ry="32" fill={C.skin} />
        <ellipse cx="374" cy={668 + Math.max(0, -s) * -8 * walk} rx="21" ry="32" fill={C.skin} />
      </g>
      {/* torso + jacket */}
      <g transform={`translate(0,150) translate(${sway},0) scale(${1 + breath * 0.012},${1 + breath * 0.008}) rotate(${s * 0.9 * walk} 210 300)`}>
        {/* hood bunched behind collar */}
        <path d="M110,6 Q210,-34 310,6 Q300,40 210,52 Q120,40 110,6 Z" fill={C.hoodie} filter="url(#wool)" />
        <JacketBack />
      </g>
      {/* neck + head */}
      <g transform={`translate(${sway * 0.7},0) rotate(${head} 210 140)`}>
        <rect x="186" y="104" width="48" height="56" rx="14" fill={C.skinLo} />
        <ellipse cx="210" cy="64" rx="62" ry="72" fill={C.skin} />
        <ellipse cx="148" cy="76" rx="9" ry="18" fill={C.skin} />
        <ellipse cx="272" cy="76" rx="9" ry="18" fill={C.skin} />
        <path d="M146,70 Q140,-6 210,-10 Q282,-6 274,70 Q270,90 258,98 Q210,112 162,98 Q148,90 146,70 Z" fill={C.hair} />
        <path d="M168,16 Q210,0 252,16" stroke="#3a2e28" strokeWidth="3" fill="none" opacity="0.5" />
      </g>
    </g>
  );
};
