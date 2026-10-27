import React from 'react';
import {interpolate, useCurrentFrame, AbsoluteFill} from 'remotion';
import {C, clamp, ease, lerp, rng} from './palette';
import {FilterDefs, Finish} from './Fx';
import {FigureDefs, RearFigure, Rib, JacketBack} from './Figure';

const FPS = 24;
const sec = (f: number) => f / FPS;
const shake = (f: number, a: number, sp = 0.07) => ({
  x: (Math.sin(f * sp * 3.1) + Math.sin(f * sp * 1.7 + 2)) * a,
  y: (Math.sin(f * sp * 2.3 + 1) + Math.sin(f * sp * 1.1)) * a * 0.8,
  r: Math.sin(f * sp * 1.3) * a * 0.03,
});

/* ------------------------------------------------------------------ */
/* Tiled wall helper                                                   */
const Tiles: React.FC<{x: number; y: number; w: number; h: number; size?: number; fill: string; grout: string; op?: number}> = ({x, y, w, h, size = 60, fill, grout, op = 1}) => {
  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= w / size; i++) lines.push(<rect key={'v' + i} x={x + i * size} y={y} width={2} height={h} fill={grout} />);
  for (let j = 0; j <= h / (size * 0.5); j++) lines.push(<rect key={'h' + j} x={x} y={y + j * size * 0.5} width={w} height={2} fill={grout} />);
  return <g opacity={op}><rect x={x} y={y} width={w} height={h} fill={fill} />{lines}</g>;
};

/* ------------------------------------------------------------------ */
/* SCENE 3 — THE HERO FRAME (frames 0..95 local, 4s)                    */
export const HeroScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const push = lerp(1.0, 1.13, ease(t / 4));
  const sh = shake(f, 3.5);
  // train: right-to-left pass
  const speed = 1750;
  const x0 = 1150 - Math.max(0, t - 0.15) * speed;
  const passing = x0 > -4300 && x0 < 1200;
  const trainCars = [0, 1, 2];
  const cx = (t: number) => t;
  // window light flicker on figure while train passes
  const wins: number[] = [];
  for (let c = 0; c < 3; c++) for (let w = 0; w < 6; w++) wins.push(x0 + c * 1240 + 90 + w * 190);
  const flicker = passing ? wins.reduce((a, wx) => a + Math.exp(-Math.pow((wx - 540) / 150, 2)), 0) : 0;
  return (
    <AbsoluteFill style={{background: '#06090f'}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{transform: `translate(${sh.x}px,${sh.y}px) rotate(${sh.r}deg) scale(${push})`, transformOrigin: '540px 1050px'}}>
        <FilterDefs /><FigureDefs />
        <defs>
          <linearGradient id="ceil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05080d" /><stop offset="1" stopColor="#101a24" /></linearGradient>
          <linearGradient id="wallg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#13202b" /><stop offset="1" stopColor="#223644" /></linearGradient>
          <linearGradient id="floorg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a232c" /><stop offset="1" stopColor="#0a0e14" /></linearGradient>
          <radialGradient id="lampg"><stop offset="0" stopColor="#d8f6ff" stopOpacity="0.95" /><stop offset="1" stopColor="#6bbfd8" stopOpacity="0" /></radialGradient>
        </defs>
        {/* ceiling + wall */}
        <rect width="1080" height="420" fill="url(#ceil)" />
        <rect y="380" width="1080" height="1060" fill="url(#wallg)" />
        <Tiles x={0} y={420} w={1080} h={1000} size={72} fill="#274051" grout="#0e1a22" op={0.55} />
        {/* ceiling lamp strips receding */}
        {[150, 540, 930].map((x, i) => (
          <g key={i}>
            <rect x={x - 210} y={180 + i * 4} width="420" height="14" rx="7" fill="#e6fbff" opacity="0.95" />
            <ellipse cx={x} cy={200} rx="300" ry="90" fill="url(#lampg)" opacity="0.45" />
          </g>
        ))}
        {/* far platform pillars */}
        {[-30, 360, 760, 1130].map((x, i) => (
          <g key={i}>
            <rect x={x} y={400} width="46" height="1040" fill="#0b141c" />
            <rect x={x + 40} y={400} width="6" height="1040" fill="#6fb2c6" opacity="0.28" />
          </g>
        ))}
        {/* track bed */}
        <rect y="1400" width="1080" height="110" fill="#05070a" />
        <rect y="1448" width="1080" height="5" fill="#46535e" />
        <rect y="1478" width="1080" height="4" fill="#39444d" />
        {/* the train — real motion blur via horizontal gaussian */}
        {passing && (
          <g filter="url(#motionXs)">
            {trainCars.map((c) => {
              const cxx = x0 + c * 1240;
              return (
                <g key={c}>
                  <rect x={cxx} y={640} width={1200} height={760} rx="40" fill="#8e9aa4" />
                  <rect x={cxx} y={640} width={1200} height={90} fill="#c6ced4" opacity="0.8" />
                  <rect x={cxx} y={1180} width={1200} height={150} fill="#44505a" />
                  <rect x={cxx} y={1000} width={1200} height={14} fill="#1c4a8a" opacity="0.85" />
                  {Array.from({length: 6}).map((_, w) => (
                    <rect key={w} x={cxx + 80 + w * 190} y={790} width={140} height={190} rx="14" fill="#ffe9b8" />
                  ))}
                  <rect x={cxx + 1200} y={640} width={40} height={720} fill="#0a0f14" />
                </g>
              );
            })}
          </g>
        )}
        {/* platform floor */}
        <rect y="1500" width="1080" height="420" fill="url(#floorg)" />
        <rect y="1500" width="1080" height="30" fill="#e3b52e" opacity="0.92" />
        <rect y="1500" width="1080" height="30" fill="url(#bumps)" />
        {Array.from({length: 54}).map((_, i) => <circle key={i} cx={10 + i * 20} cy={1515} r="4" fill="#9c7a12" opacity="0.7" />)}
        {/* wet reflections of lamps */}
        {[150, 540, 930].map((x, i) => <rect key={i} x={x - 40} y={1580} width="80" height="300" fill="#bfeeff" opacity="0.07" filter="url(#blur14)" />)}
        {/* pillar foreground left */}
        <rect x="-40" y="0" width="150" height="1920" fill="#080d13" />
        <rect x="104" y="0" width="6" height="1920" fill="#6fb2c6" opacity="0.3" />
        {/* contact shadow */}
        <ellipse cx="530" cy="1698" rx="260" ry="26" fill="#000" opacity="0.55" filter="url(#blur14)" />
        {/* figure, rear three-quarter */}
        <g transform="translate(322,650) scale(1.03,1.03) translate(210,0) rotate(-1.6) skewY(0) scale(0.97,1) translate(-210,0)">
          <RearFigure breath={Math.sin(t * 1.9)} head={-5} />
        </g>
        {/* train-window flicker across subject */}
        <rect width="1080" height="1920" fill="#ffe7b0" opacity={flicker * 0.05} style={{mixBlendMode: 'soft-light'}} />
      </svg>
      <Finish warm={0.18} cool={0.3} vignette={0.6} grain={0.1} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Side-view sneaker (toe → right). Origin at ankle.                    */
export const SideSneaker: React.FC<{dim?: number}> = ({dim = 0}) => (
  <g>
    <path d="M-46,-10 L-54,40 Q-54,62 -40,66 L74,66 Q114,62 114,38 Q100,10 66,6 L22,-8 Q0,-24 -22,-18 Z" fill={C.sneaker} />
    <path d="M-46,-10 L-54,40 Q-54,62 -40,66 L74,66 Q114,62 114,38 Q100,10 66,6 L22,-8 Q0,-24 -22,-18 Z" fill="#000" opacity={dim} />
    <path d="M-52,48 Q-50,64 -38,70 L78,70 Q118,66 118,46 L-52,48 Z" fill={C.sole} />
    <path d="M-52,56 L118,56" stroke={C.creamLo} strokeWidth="2" opacity="0.7" />
    <path d="M70,8 Q92,16 104,34" stroke={C.creamLo} strokeWidth="2.5" fill="none" opacity="0.6" />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M${6 + i * 15},${-8 + i * 3} l12,10`} stroke={C.creamLo} strokeWidth="3" strokeLinecap="round" />)}
    <path d="M-30,10 Q-34,34 -30,48" stroke={C.creamLo} strokeWidth="3" fill="none" opacity="0.5" />
  </g>
);

/* ------------------------------------------------------------------ */
/* SCENE 1 — THE DEPARTURE (72 frames, 3s)                              */
export const DepartureScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const T = 0.42; // seconds per step
  const step = {x: 196, y: 120};
  const v = {x: -step.x / T, y: -step.y / T};
  const sh = shake(f, 4, 0.11);
  const scroll = (t / T) % 1; // stair scroll phase 0..1 (world shifts by one step per T)
  const L = {x: 520, y: 1160};
  const foot = (off: number, far: boolean) => {
    let ph = ((t / (2 * T)) + off) % 1; if (ph < 0) ph += 1;
    if (ph < 0.5) {
      const s = ph * 2; return {x: L.x + v.x * T * s, y: L.y + v.y * T * s, lift: 0, rot: 0};
    }
    const s = (ph - 0.5) * 2; const e = ease(s);
    return {x: L.x + v.x * T + step.x * e, y: L.y + v.y * T + step.y * e - Math.sin(Math.PI * s) * 70, lift: Math.sin(Math.PI * s), rot: lerp(-18, 6, e)};
  };
  const A = foot(0, false), B = foot(0.5, true);
  // stairs sawtooth: tread tops at positions along slope
  const steps = Array.from({length: 18}).map((_, i) => i - 9);
  const hem = ease((t - 1.45) / 0.35) * (1 - ease((t - 2.15) / 0.5));
  const hemX = lerp(-700, 1500, clamp((t - 1.35) / 1.4));
  return (
    <AbsoluteFill style={{background: '#05080c'}}>
      <svg width="1080" height="1920" style={{transform: `translate(${sh.x}px,${sh.y}px) rotate(${sh.r - 5}deg) scale(1.08)`, transformOrigin: '540px 1000px'}}>
        <FilterDefs />
        <defs>
          <linearGradient id="wallS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1219" /><stop offset="1" stopColor="#1d3039" /></linearGradient>
          <linearGradient id="tread" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4d5d68" /><stop offset="1" stopColor="#222c35" /></linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#wallS)" />
        <g transform={`translate(${-scroll * step.x},${-scroll * step.y})`}>
          <Tiles x={-400} y={-400} w={2200} h={1400} size={96} fill="#1d3340" grout="#0a1319" op={0.7} />
        </g>
        {/* overhead lamps sliding along the ceiling line */}
        {Array.from({length: 7}).map((_, i) => {
          const k = i - scroll;
          const x = 900 - k * 340 - 100, y = 90 + (i - scroll) * 150 - 230;
          return <g key={i}><rect x={x} y={y} width="300" height="16" rx="8" fill="#eafcff" transform={`rotate(33 ${x} ${y})`} /><ellipse cx={x + 120} cy={y + 80} rx="260" ry="130" fill="#7ad4ec" opacity="0.2" filter="url(#blur30)" /></g>;
        })}
        {/* handrail parallel to stair slope */}
        <g transform={`rotate(33.4 540 760)`}>
          <rect x="-700" y="560" width="2600" height="12" fill="#9fb2bb" opacity="0.75" />
          <rect x="-700" y="560" width="2600" height="3" fill="#fff" opacity="0.6" />
        </g>
        {/* stair treads: sawtooth profile, world scrolls up-left */}
        <g transform={`translate(${-scroll * step.x},${-scroll * step.y})`}>
          {steps.map((i) => {
            const bx = L.x - 90 + i * step.x, by = L.y + 66 + i * step.y;
            return (
              <g key={i}>
                <path d={`M${bx},${by} L${bx + step.x},${by} L${bx + step.x},${by + step.y} L${bx},${by + step.y} Z`} fill="#10171e" />
                <rect x={bx} y={by} width={step.x} height="26" fill="url(#tread)" />
                <rect x={bx} y={by} width={step.x} height="6" fill="#dfeef2" opacity="0.5" />
                <rect x={bx + 10} y={by + 10} width={step.x - 30} height="10" fill="#bfe9f6" opacity="0.28" filter="url(#blur2)" />
                <rect x={bx} y={by + 26} width={step.x} height="14" fill="#000" opacity="0.4" filter="url(#blur6)" />
                <path d={`M${bx},${by + step.y} L${bx + step.x},${by + step.y} L${bx + step.x},${by + step.y + 2000} L${bx},${by + step.y + 2000} Z`} fill="#0b1117" />
              </g>
            );
          })}
        </g>
        {/* legs — far first */}
        {[{p: B, far: true}, {p: A, far: false}].map(({p, far}, i) => (
          <g key={i} opacity={1}>
            <path d={`M${p.x - 60},${p.y - 18} L${p.x - 130 - p.lift * 30},${-240} L${p.x + 30 - p.lift * 30},${-240} L${p.x + 50},${p.y - 12} Z`} fill={far ? '#0e1420' : C.jeans} />
            <path d={`M${p.x - 60},${p.y - 18} L${p.x - 130 - p.lift * 30},${-240} L${p.x + 30 - p.lift * 30},${-240} L${p.x + 50},${p.y - 12} Z`} fill="url(#jeansShade)" />
            <rect x={p.x - 62} y={p.y - 54} width="116" height="44" rx="6" fill="#0b1018" opacity="0.6" transform={`rotate(${p.rot} ${p.x} ${p.y})`} />
            <g transform={`translate(${p.x},${p.y}) rotate(${p.rot}) scale(${far ? 0.94 : 1.0})`}><SideSneaker dim={far ? 0.38 : 0} /></g>
          </g>
        ))}
        {/* soft foreground jacket hem passing close to the lens, out of focus */}
        <g opacity={hem} filter="url(#blur14)" transform={`translate(${hemX},0) rotate(-14 0 1500)`}>
          <rect x="-620" y="1420" width="1000" height="620" fill={C.burgundy} filter="url(#wool)" />
          <rect x="-620" y="1360" width="1000" height="70" fill={C.burgundy} />
          <rect x="-620" y="1378" width="1000" height="9" fill={C.cream} /><rect x="-620" y="1402" width="1000" height="9" fill={C.cream} />
          <rect x="-620" y="1430" width="1000" height="140" fill="#000" opacity="0.25" />
        </g>
        <rect width="1080" height="1920" fill="#7ad4ec" opacity={0.04 * Math.sin(f * 0.9)} style={{mixBlendMode: 'screen'}} />
      </svg>
      <Finish warm={0.08} cool={0.35} vignette={0.65} grain={0.11} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 2 — THE PERSONAL DETAIL (72 frames; snap lands at local f=32)  */
const Hand: React.FC<{pinch: number}> = ({pinch}) => {
  // origin = pinch point; hand extends to +x (towards wrist), arm goes off to the right
  const g = pinch; // 0 open .. 1 pinched
  const open = (1 - g) * 26;
  return (
    <g>
      <defs>
        <linearGradient id="skinG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cf9a78" /><stop offset="1" stopColor="#8f5e45" /></linearGradient>
      </defs>
      {/* sleeve + cuff */}
      <path d="M470,-130 L1500,-230 L1500,260 L470,150 Z" fill={C.cream} filter="url(#leather)" />
      <path d="M470,-130 L1500,-230 L1500,260 L470,150 Z" fill="url(#sleeveShadeL)" opacity="0.7" />
      <path d="M470,-130 Q500,0 470,150" stroke={C.creamLo} strokeWidth="5" fill="none" />
      <g transform="translate(0,0)"><Rib x={400} y={-128} w={74} h={278} vertical /></g>
      {/* back of hand */}
      <path d="M410,-70 Q300,-96 190,-70 Q120,-60 60,-44 L60,24 Q130,44 200,70 Q320,100 410,84 Z" fill="url(#skinG)" />
      {/* curled fingers (behind) */}
      {[0, 1, 2].map((i) => <ellipse key={i} cx={150 + i * 4} cy={20 + i * 26} rx={78} ry={19} fill="#8a5a42" transform={`rotate(${6 + i * 3} 150 ${40 + i * 26})`} />)}
      {/* index finger (top) */}
      <g transform={`rotate(${-open * 0.5} 0 -6)`}>
        <path d="M250,-72 Q120,-80 22,-40 Q0,-30 0,-14 Q6,-2 24,-6 Q120,-26 250,-14 Z" fill="url(#skinG)" />
        <path d="M6,-18 Q16,-30 32,-26 L40,-10 Q22,-4 6,-12 Z" fill="#e0b79c" opacity="0.9" />
        <path d="M150,-70 Q154,-50 150,-30" stroke="#6f4430" strokeWidth="2.5" fill="none" opacity="0.6" />
        <path d="M80,-60 Q84,-44 80,-30" stroke="#6f4430" strokeWidth="2.5" fill="none" opacity="0.5" />
      </g>
      {/* thumb (bottom) */}
      <g transform={`rotate(${open * 0.7} 0 10)`}>
        <path d="M300,40 Q160,70 30,28 Q4,20 4,6 Q16,-4 40,2 Q150,28 300,10 Z" fill="url(#skinG)" />
        <path d="M10,10 Q24,0 44,6 L40,22 Q24,24 10,16 Z" fill="#e0b79c" opacity="0.9" />
      </g>
      {/* knuckle highlights */}
      <path d="M300,-60 Q330,-20 304,40" stroke="#e8c3a6" strokeWidth="3" fill="none" opacity="0.4" />
    </g>
  );
};

export const SnapScene: React.FC = () => {
  const f = useCurrentFrame();
  const sh = shake(f, 2.5, 0.06);
  const push = lerp(1.22, 1.34, f / 72);
  // flap offset: open until f22, then pulled closed by f32, tiny overshoot
  const mv = ease((f - 20) / 12);
  let ox = lerp(-86, 0, mv);
  if (f > 32) ox += Math.exp(-(f - 32) / 3) * Math.sin((f - 32) * 1.5) * 4;
  const approach = ease(f / 16);
  const pinch = ease((f - 12) / 8) * (1 - ease((f - 44) / 10));
  const retreat = ease((f - 44) / 26);
  const cap = {x: 470 + ox, y: 930};
  const handX = cap.x + (1 - approach) * 360 + retreat * 330;
  const handY = cap.y - 4 + (1 - approach) * 130 + retreat * 190;
  const flash = f >= 32 ? Math.exp(-(f - 32) / 3.2) : 0;
  const rot = lerp(14, 20, retreat);
  return (
    <AbsoluteFill style={{background: '#1a0a10'}}>
      <svg width="1080" height="1920" style={{transform: `translate(${sh.x}px,${sh.y}px) scale(${push})`, transformOrigin: '560px 980px'}}>
        <FilterDefs /><FigureDefs />
        <defs>
          <radialGradient id="capG" cx="35%" cy="30%"><stop offset="0" stopColor="#fff2b8" /><stop offset="0.35" stopColor="#d9b552" /><stop offset="1" stopColor="#7a5a1a" /></radialGradient>
          <linearGradient id="foldL" x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity="0.35" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
        </defs>
        {/* under panel (right), lining visible in the gap */}
        <rect width="1080" height="1920" fill={C.burgundyLo} />
        <rect x="560" width="600" height="1920" fill={C.burgundy} filter="url(#wool)" />
        <rect x="560" width="600" height="1920" fill="url(#bodyShade)" opacity="0.8" />
        {/* stud on under panel */}
        <ellipse cx="560" cy="930" rx="30" ry="30" fill="url(#capG)" />
        <ellipse cx="560" cy="930" rx="14" ry="14" fill="#5b4012" opacity="0.5" />
        {/* wearer's left chest: small chenille N, soft focus */}
        <g filter="url(#blur6)" opacity="0.9">
          <g filter="url(#chenille)"><text x="880" y="470" textAnchor="middle" fontFamily="Alfa" fontSize="150" fill={C.cream} stroke={C.creamLo} strokeWidth="3" paintOrder="stroke">N</text></g>
        </g>
        {/* top flap (left), moves with ox */}
        <g transform={`translate(${ox},0)`}>
          <rect x="-100" width="680" height="1920" fill={C.burgundy} filter="url(#wool)" />
          <rect x="-100" width="680" height="1920" fill="url(#bodyShade)" />
          <rect x="540" width="40" height="1920" fill="url(#foldL)" transform="translate(40,0) scale(-1,1) translate(-1120,0) translate(-1100,0)" opacity="0" />
          <path d="M580,0 L580,1920" stroke={C.burgundyLo} strokeWidth="6" />
          <path d="M572,0 L572,1920" stroke="#fff" strokeWidth="2" opacity="0.12" />
          {/* placket edge stitching */}
          <path d="M548,0 L548,1920" stroke={C.burgundyLo} strokeWidth="2" strokeDasharray="14 9" opacity="0.8" />
          {/* snap cap on flap */}
          <ellipse cx="470" cy="944" rx="40" ry="40" fill="#000" opacity="0.35" filter="url(#blur6)" />
          <ellipse cx="470" cy="930" rx="38" ry="38" fill="url(#capG)" />
          <ellipse cx="470" cy="930" rx="38" ry="38" fill="none" stroke="#5a3f10" strokeWidth="3" opacity="0.8" />
          <ellipse cx="470" cy="930" rx="22" ry="22" fill="none" stroke="#fff3c0" strokeWidth="2" opacity="0.5" />
          <circle cx="458" cy="918" r="8" fill="#fff" opacity={0.55 + flash * 0.45} />
        </g>
        {/* snap glint */}
        <g opacity={flash} style={{mixBlendMode: 'screen'}}>
          <circle cx={470 + ox} cy="930" r={70 + flash * 30} fill="#ffe9a3" opacity="0.35" filter="url(#blur14)" />
        </g>
        {/* finger shadows on fabric */}
        <g transform={`translate(${handX + 18},${handY + 46}) rotate(${rot})`} opacity="0.4" filter="url(#blur14)"><rect x="0" y="-50" width="520" height="130" fill="#000" /></g>
        <g transform={`translate(${handX},${handY}) rotate(${rot})`}><Hand pinch={pinch} /></g>
        {/* depth-of-field bloom in corners */}
        <ellipse cx="900" cy="1700" rx="300" ry="200" fill="#ffb060" opacity="0.1" filter="url(#blur30)" />
      </svg>
      <Finish warm={0.25} cool={0.15} vignette={0.7} grain={0.12} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Side-profile figure, facing right. Local coords ≈ 520 x 760.         */
const ProfileFigure: React.FC<{head: number; inhale: number}> = ({head, inhale}) => (
  <g>
    {/* hoodie back/hood + hem */}
    <path d="M96,270 Q70,330 96,420 L150,420 L170,290 Z" fill={C.hoodie} filter="url(#wool)" />
    {/* torso — jacket body in profile */}
    <g transform={`translate(0,${-inhale * 5}) scale(1,${1 + inhale * 0.014})`} style={{transformOrigin: '220px 640px'}}>
      <path d="M108,292 Q92,430 108,650 L336,650 Q348,470 326,340 Q250,262 108,292 Z" fill={C.burgundy} filter="url(#wool)" />
      <path d="M108,292 Q92,430 108,650 L336,650 Q348,470 326,340 Q250,262 108,292 Z" fill="url(#profShade)" />
      {/* front placket + gold snaps, small N peeking on the chest */}
      <path d="M326,342 Q344,480 338,650" stroke={C.burgundyLo} strokeWidth="5" fill="none" />
      {[420, 500, 580].map((y, i) => <g key={i}><circle cx={331 + i * 0.5} cy={y} r="11" fill="url(#capG2)" /><circle cx={331} cy={y} r="11" fill="none" stroke="#5a3f10" strokeWidth="1.5" /></g>)}
      <g transform="translate(300,392) skewY(14) scale(0.5,1)" filter="url(#chenille)"><text textAnchor="middle" fontFamily="Alfa" fontSize="46" fill={C.cream} stroke={C.creamLo} strokeWidth="1.4" paintOrder="stroke">N</text></g>
      {/* hem rib */}
      <Rib x={108} y={628} w={230} h={52} />
      {/* near arm: cream leather sleeve, rib cuff, relaxed hand */}
      <path d="M150,300 Q256,292 270,350 L292,560 L208,572 Q182,440 150,300 Z" fill={C.cream} filter="url(#leather)" />
      <path d="M150,300 Q256,292 270,350 L292,560 L208,572 Q182,440 150,300 Z" fill="url(#sleeveShadeR)" opacity="0.7" />
      <path d="M156,306 Q192,420 208,572" stroke={C.creamLo} strokeWidth="3" fill="none" />
      <g transform="rotate(-4 250 566)"><Rib x={206} y={562} w={88} h={46} /></g>
      <path d="M212,606 Q214,690 244,704 Q290,706 296,606 Z" fill={C.skin} />
      <path d="M240,704 Q262,718 286,700 L292,640 L250,640 Z" fill="#a9714f" />
      <path d="M232,660 L234,700 M250,664 L252,706 M268,664 L270,704" stroke="#7d4a35" strokeWidth="2" opacity="0.6" />
    </g>
    {/* neck + hoodie collar */}
    <g transform={`rotate(${head} 220 262)`}>
      <path d="M176,236 L172,300 Q222,322 268,296 L262,236 Z" fill={C.skinLo} />
      <path d="M172,246 Q132,262 130,320 Q220,360 290,312 Q300,270 262,250 Q222,282 172,246 Z" fill={C.hoodie} filter="url(#wool)" />
      {/* head */}
      <path d="M118,92 Q118,22 200,16 Q286,18 302,92 L310,114 Q316,126 308,136 L326,172 Q330,184 314,188 L308,198 Q314,206 306,214 Q302,224 306,234 Q300,266 268,276 L216,266 Q150,252 130,192 Q114,142 118,92 Z" fill={C.skin} />
      <path d="M118,92 Q118,22 200,16 Q286,18 302,92 L310,114 Q316,126 308,136 L326,172 Q330,184 314,188 L308,198 Q314,206 306,214 Q302,224 306,234 Q300,266 268,276 L216,266 Q150,252 130,192 Q114,142 118,92 Z" fill="url(#faceShade)" />
      {/* ear */}
      <path d="M172,112 Q158,116 160,138 Q164,160 184,156 Q192,140 188,120 Z" fill="#a9714f" />
      {/* hair */}
      <path d="M112,110 Q96,20 200,8 Q300,6 308,86 Q282,52 236,56 Q190,58 176,98 Q170,70 150,74 Q150,120 148,170 Q116,150 112,110 Z" fill={C.hair} />
      {/* brow + eye + lips */}
      <path d="M268,98 Q286,90 304,98" stroke="#1d1410" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M272,116 Q286,106 300,116 Q286,124 272,116 Z" fill="#f0e6dc" />
      <circle cx="289" cy="116" r="5.5" fill="#201511" />
      <path d="M300,202 Q312,206 305,214" stroke="#7d4a3a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M296,212 L306,212" stroke="#5e362b" strokeWidth="2.5" />
    </g>
  </g>
);

/* ------------------------------------------------------------------ */
/* SCENE 4 — THE DECISION (72 frames)                                   */
export const DecisionScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const sh = shake(f, 3, 0.08);
  const push = lerp(1.0, 1.06, f / 72);
  const trainV = 900 * Math.pow(1 - ease(f / 22), 2); // px/s while braking
  const trainX = f < 22 ? ((Array.from({length: Math.floor(f)}).reduce((a: number, _, i) => a + 900 * Math.pow(1 - ease(i / 22), 2) / 24, 0))) : 900 * 22 / 24 * 0.35;
  const head = lerp(5, -9, ease((f - 6) / 22)) + lerp(0, 7, ease((f - 44) / 14));
  const inh = ease((f - 18) / 18) * (1 - ease((f - 40) / 14));
  const door = ease((f - 50) / 18);
  const stepX = ease((f - 58) / 14) * 46;
  const bob = f > 58 ? Math.abs(Math.sin((f - 58) * 0.35)) * 6 : 0;
  const winOff = (trainX * 1) % 360;
  return (
    <AbsoluteFill style={{background: '#070b10'}}>
      <svg width="1080" height="1920" style={{transform: `translate(${sh.x}px,${sh.y}px) rotate(${sh.r}deg) scale(${push})`, transformOrigin: '600px 800px'}}>
        <FilterDefs /><FigureDefs />
        <defs>
          <linearGradient id="profShade" x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity="0.28" /><stop offset="0.6" stopOpacity="0" /><stop offset="1" stopColor="#ffb060" stopOpacity="0.28" /></linearGradient>
          <linearGradient id="faceShade" x1="0" x2="1"><stop offset="0" stopColor="#6fa8ff" stopOpacity="0.2" /><stop offset="0.5" stopOpacity="0" /><stop offset="1" stopColor="#ffb060" stopOpacity="0.38" /></linearGradient>
          <radialGradient id="capG2" cx="35%" cy="30%"><stop offset="0" stopColor="#fff2b8" /><stop offset="0.4" stopColor="#d9b552" /><stop offset="1" stopColor="#7a5a1a" /></radialGradient>
          <linearGradient id="trainBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#aab4bc" /><stop offset="1" stopColor="#59656f" /></linearGradient>
          <linearGradient id="warmIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe3a6" /><stop offset="1" stopColor="#d9964a" /></linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="#0d1822" />
        <Tiles x={0} y={0} w={1080} h={600} size={90} fill="#1a2c38" grout="#0a141b" op={0.6} />
        {/* stopped train, out of focus */}
        <g filter="url(#blur6)">
          <rect x="-40" y="360" width="1200" height="1000" fill="url(#trainBody)" />
          <rect x="-40" y="360" width="1200" height="70" fill="#d8dfe3" opacity="0.85" />
          <rect x="-40" y="1010" width="1200" height="14" fill="#1c4a8a" opacity="0.85" />
          <rect x="-40" y="1130" width="1200" height="230" fill="#3c4750" />
          {/* windows scrolling with braking train */}
          <g transform={`translate(${-winOff},0)`}>
            {Array.from({length: 6}).map((_, i) => <rect key={i} x={-300 + i * 360} y={500} width={230} height={290} rx="18" fill="#ffe2a0" opacity="0.9" />)}
          </g>
          {/* door pair on the right */}
          <rect x="730" y="470" width="330" height="800" fill="#2a343c" />
          <rect x={780 + 0} y="490" width="230" height="760" fill="url(#warmIn)" opacity={0.25 + door * 0.75} />
          <rect x={730 - door * 0} y="470" width={165 - door * 150} height="800" fill="#8e9aa4" />
          <rect x={895 + door * 150} y="470" width={165 - door * 150} height="800" fill="#8e9aa4" />
          <rect x="730" y="470" width="330" height="22" fill="#1d252b" />
          <rect x={730} y="1220" width="330" height="50" fill="#222b32" />
        </g>
        {/* door glow spilling onto platform + subject */}
        <ellipse cx="900" cy="1500" rx="420" ry="190" fill="#ffc46e" opacity={0.15 + door * 0.22} filter="url(#blur30)" />
        {/* platform */}
        <rect y="1340" width="1080" height="580" fill="#0e151c" />
        <rect y="1360" width="1080" height="26" fill="#e3b52e" opacity="0.9" />
        <rect y="1386" width="1080" height="12" fill="#000" opacity="0.4" />
        {/* shadow */}
        <ellipse cx={420 + stepX} cy="1890" rx="360" ry="40" fill="#000" opacity="0.5" filter="url(#blur14)" />
        <g transform={`translate(${-30 + stepX},${180 - bob}) scale(2.0)`}>
          <ProfileFigure head={head} inhale={inh} />
        </g>
        <rect width="1080" height="1920" fill="#ffd9a0" opacity={door * 0.05} style={{mixBlendMode: 'soft-light'}} />
      </svg>
      <Finish warm={0.3} cool={0.3} vignette={0.62} grain={0.1} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Street (blue hour) rendered with a small perspective projector       */
const F = 900, YH = 800, HC = 1.3;
const P = (X: number, Y: number, z: number): [number, number] => [540 + (X * F) / z, YH - ((Y - HC) * F) / z];
const poly = (pts: [number, number][]) => pts.map((p) => p.join(',')).join(' ');
const wallQuad = (X: number, za: number, zb: number, y0: number, y1: number) => poly([P(X, y1, za), P(X, y1, zb), P(X, y0, zb), P(X, y0, za)]);

const Street: React.FC<{cam: number; t: number}> = ({cam, t}) => {
  const els: React.ReactNode[] = [];
  const near = 1.6;
  // buildings along both sides
  const side = (X: number, dir: number, seed: number, tone: string[]) => {
    for (let i = -1; i < 12; i++) {
      const za = i * 9 + 3 + (X < 0 ? 0 : 4), zb = za + 8.6;
      const a = za - cam, b = zb - cam;
      if (b < near) continue;
      const aa = Math.max(a, near);
      const h = 11 + rng(i + seed) * 9;
      const col = tone[Math.floor(rng(i * 3 + seed) * tone.length)];
      els.push(<polygon key={`w${X}${i}`} points={wallQuad(X, aa, b, 0, h)} fill={col} />);
      // windows
      for (let fl = 1; fl < Math.min(7, h / 3.2); fl++) {
        for (let bay = 0; bay < 3; bay++) {
          const wa = za + 0.9 + bay * 2.6 - cam, wb = wa + 1.5;
          if (wb < near || wa < near) continue;
          const lit = rng(i * 17 + fl * 5 + bay * 3 + seed) > 0.62;
          els.push(<polygon key={`wi${X}${i}${fl}${bay}`} points={wallQuad(X, wa, wb, fl * 3.1 + 0.5, fl * 3.1 + 2.3)} fill={lit ? '#f2b869' : '#0b1626'} opacity={lit ? 0.9 : 0.8} />);
        }
      }
      // storefront shutters
      els.push(<polygon key={`sf${X}${i}`} points={wallQuad(X * 0.995, aa, b, 0, 3.3)} fill="#0a121c" opacity="0.85" />);
    }
  };
  side(-3.6, -1, 3, ['#27374f', '#35384a', '#2b3d52', '#3b3140']);
  side(4.4, 1, 21, ['#1b2a40', '#25304a', '#1f2d3d']);
  // the corner deli, left side
  const dz0 = 7.2 - 0 + 0, dz1 = 14.2;
  const a = dz0 - cam, b = dz1 - cam;
  const deli = b > near ? (() => {
    const aa = Math.max(a, near);
    return (
      <g>
        <polygon points={wallQuad(-3.6, aa, b, 0, 3.6)} fill="#2a1f1a" />
        <polygon points={wallQuad(-3.58, aa, b, 0.3, 3.0)} fill="url(#deliWarm)" />
        {[0.5, 2.1, 3.7, 5.3].map((k, i) => {
          const wa = dz0 + 0.4 + k * 1.2 - cam, wb = wa + 1.1; if (wa < near) return null;
          return <polygon key={i} points={wallQuad(-3.57, wa, wb, 0.7, 2.7)} fill="#ffd89a" opacity="0.95" />;
        })}
        <polygon points={wallQuad(-3.55, aa, b, 3.0, 3.6)} fill="#1d4a3a" />
        {Array.from({length: 7}).map((_, i) => { const wa = dz0 + i * 1.0 - cam, wb = wa + 0.5; if (wa < near) return null; return <polygon key={i} points={wallQuad(-3.54, wa, wb, 3.0, 3.6)} fill="#efe3c6" opacity="0.9" />; })}
      </g>
    );
  })() : null;
  // lamp posts
  const lamps: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const z = 6 + i * 11 - cam; if (z < near) continue;
    const [bx, by] = P(3.0, 0, z), [tx, ty] = P(3.0, 5.2, z);
    lamps.push(<g key={i}><line x1={bx} y1={by} x2={tx} y2={ty} stroke="#06090f" strokeWidth={Math.max(2, 120 / z)} /><circle cx={tx} cy={ty} r={Math.max(8, 240 / z)} fill="#ffbe6a" opacity="0.9" /><circle cx={tx} cy={ty} r={Math.max(30, 800 / z)} fill="#ffb25a" opacity="0.22" filter="url(#blur14)" /></g>);
  }
  // warm spill on pavement from the deli + lamps
  const spill = (cx: number, cz: number, rx: number, rz: number, op: number, col = '#ffb25a') => {
    const pts: [number, number][] = [];
    for (let k = 0; k < 28; k++) { const ang = (k / 28) * Math.PI * 2; const zz = Math.max(near * 0.8, cz - cam + Math.sin(ang) * rz); pts.push(P(cx + Math.cos(ang) * rx, 0, zz)); }
    return <polygon points={poly(pts)} fill={col} opacity={op} filter="url(#blur30)" />;
  };
  return (
    <g>
      <rect width="1080" height={YH + 4} fill="url(#skyBH)" />
      {/* far skyline */}
      {Array.from({length: 18}).map((_, i) => { const w = 34 + rng(i) * 40, h = 90 + rng(i + 5) * 220; const x = 360 + i * 20 - 40; return <rect key={i} x={x} y={YH - h * 0.55} width={w} height={h * 0.55 + 4} fill="#16233a" opacity="0.9" />; })}
      {/* ground */}
      <rect y={YH} width="1080" height={1920 - YH} fill="url(#groundBH)" />
      {els}
      {deli}
      {/* curb line + wet pavement sheen */}
      <polygon points={poly([P(2.8, 0, near), P(2.8, 0, 60), P(3.0, 0, 60), P(3.0, 0, near)])} fill="#8e9bb0" opacity="0.25" />
      {spill(-1.4, 10.5, 3.6, 4.8, 0.5)}
      {spill(-1.4, 10.5, 2.0, 2.8, 0.45, '#ffd08a')}
      {lamps}
      {/* wet reflections: warm vertical streaks of deli + lamps */}
      <g filter="url(#blur14)" opacity="0.5">{lamps.length > 0 && Array.from({length: 4}).map((_, i) => <rect key={i} x={120 + i * 70} y={YH + 60} width="40" height={420} fill="#ffc47a" opacity={0.25 - i * 0.04} />)}</g>
      {/* atmosphere haze at the horizon */}
      <ellipse cx="540" cy={YH} rx="520" ry="160" fill="#e9a86f" opacity="0.18" filter="url(#blur30)" />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 5 — THE NEXT CHAPTER (96 frames). Match cut at local f=9.      */
export const ChapterScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const cut = 9;
  const phase = (Math.PI * (f - 2.4)) / 12.5;
  const zoomP = ease((f - 16) / 58);
  const z = lerp(3.4, 1.0, zoomP);
  const ty = -420 * (1 - zoomP);
  const sh = shake(f, f < 16 ? 2.4 : 3.2, 0.1);
  const cam = Math.max(0, (f - 12) / 24) * 1.6;
  const fx = 311, fy = 545, fs = 1.09;
  const inTrain = f < cut;
  return (
    <AbsoluteFill style={{background: '#060a12'}}>
      <svg width="1080" height="1920" style={{transform: `translate(${sh.x}px,${sh.y + ty}px) rotate(${sh.r}deg) scale(${z})`, transformOrigin: '540px 1600px'}}>
        <FilterDefs /><FigureDefs />
        <defs>
          <linearGradient id="skyBH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1530" /><stop offset="0.55" stopColor="#1d3a63" /><stop offset="0.9" stopColor="#7b8fa8" /><stop offset="1" stopColor="#e7a56e" /></linearGradient>
          <linearGradient id="groundBH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b4458" /><stop offset="0.25" stopColor="#1b2332" /><stop offset="1" stopColor="#0b0f18" /></linearGradient>
          <linearGradient id="deliWarm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffcf86" /><stop offset="1" stopColor="#f2a850" /></linearGradient>
          <linearGradient id="carFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9eef0" /><stop offset="1" stopColor="#aab5ba" /></linearGradient>
        </defs>
        {inTrain ? (
          <g>
            {/* car interior ahead, cool fluorescent, door sill gap in front of him */}
            <rect width="1080" height="1920" fill="#0d151d" />
            <rect y="0" width="1080" height="1560" fill="url(#carFloor)" />
            <rect y="0" width="1080" height="640" fill="#f4f8f9" />
            <rect x="0" y="560" width="1080" height="80" fill="#c9d3d8" />
            {[110, 330, 760, 980].map((x, i) => <rect key={i} x={x - 90} y="640" width="180" height="520" rx="14" fill="#c97a35" opacity="0.55" />)}
            <rect x="700" y="0" width="22" height="1560" fill="#dfe6ea" /><rect x="704" y="0" width="5" height="1560" fill="#fff" />
            <ellipse cx="540" cy="140" rx="620" ry="200" fill="#cfeaff" opacity="0.5" filter="url(#blur30)" />
            <rect y="1380" width="1080" height="180" fill="#f1ede2" />
            {/* sill + gap */}
            <rect y="1560" width="1080" height="46" fill="#3a4148" />
            <rect y="1606" width="1080" height="34" fill="#05070a" />
            {/* platform floor */}
            <rect y="1640" width="1080" height="400" fill="#10171e" />
            <rect y="1644" width="1080" height="12" fill="#e3b52e" opacity="0.85" />
          </g>
        ) : (
          <Street cam={cam} t={t} />
        )}
        <ellipse cx="540" cy="1522" rx="300" ry="28" fill="#000" opacity="0.5" filter="url(#blur14)" />
        <g transform={`translate(${fx},${fy}) scale(${fs})`}><RearFigure phase={phase} walk={1} head={-1} /></g>
        {!inTrain && <ellipse cx="170" cy="1100" rx="300" ry="520" fill="#ffb25a" opacity="0.13" style={{mixBlendMode: 'soft-light'}} filter="url(#blur30)" />}
        {/* landing: small ripple on wet pavement */}
        {f >= 15 && f < 30 && <ellipse cx="500" cy="1625" rx={40 + (f - 15) * 9} ry={8 + (f - 15) * 1.6} fill="none" stroke="#ffd9a0" strokeWidth="3" opacity={0.5 * (1 - (f - 15) / 15)} />}
      </svg>
      <Finish warm={0.3} cool={inTrain ? 0.15 : 0.35} vignette={0.6} grain={0.11} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 6 — THE SIGNATURE (72 frames)                                  */
const rise = (f: number, a: number, b: number) => ({opacity: ease((f - a) / (b - a)), transform: `translateY(${(1 - ease((f - a) / (b - a))) * 22}px)`});
export const SignatureScene: React.FC = () => {
  const f = useCurrentFrame();
  const base: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center', color: C.ink};
  return (
    <AbsoluteFill style={{background: C.ivory}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #f8f3e6 0%, #ece3cf 100%)'}} />
      <div style={{...base, top: 560, ...rise(f, 0, 8), fontFamily: 'Fraunces', fontWeight: 500, fontSize: 112, letterSpacing: '-0.01em', lineHeight: 1}}>LAST TRAIN.</div>
      <div style={{...base, top: 690, ...rise(f, 5, 13), fontFamily: 'Fraunces', fontWeight: 500, fontSize: 112, letterSpacing: '-0.01em', lineHeight: 1}}>FIRST CHAPTER.</div>
      <div style={{position: 'absolute', left: 440, width: 200, top: 880, height: 2, background: C.burgundy, opacity: ease((f - 16) / 10), transform: `scaleX(${ease((f - 16) / 12)})`}} />
      <div style={{...base, top: 960, ...rise(f, 10, 18), fontFamily: 'InterX', fontWeight: 600, fontSize: 40, letterSpacing: '0.46em', paddingLeft: '0.46em'}}>NEXUS JACKET</div>
      <div style={{...base, top: 1050, ...rise(f, 28, 38), fontFamily: 'Fraunces', fontStyle: 'italic', fontWeight: 400, fontSize: 58, color: C.burgundy}}>Make it yours.</div>
      <div style={{...base, top: 1440, ...rise(f, 44, 54), fontFamily: 'InterX', fontWeight: 500, fontSize: 30, letterSpacing: '0.16em', opacity: 0.7 * ease((f - 44) / 10)}}>nexusjacket.com</div>
      <Finish grain={0.07} vignette={0.12} />
    </AbsoluteFill>
  );
};
