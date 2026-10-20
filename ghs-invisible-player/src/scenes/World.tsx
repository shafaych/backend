import React from "react";
import {C, H, W, clamp, easeOut, lerp, prog, rng, smooth} from "../util";
import {FigureSVG, POSES, Pose, solve} from "../Figure";
import T from "../timing.json";

export const CENTER: [number, number] = [540, 850];
export type Ath = {k: string; pose: Pose; fx: number; fy: number; flip: boolean; sleeve: "short" | "none" | "pads"; helmet?: boolean; ball: "soccer" | "basket" | "football" | "volley"; label: string};
export const ATHS: Ath[] = [
  {k: "soccer", pose: POSES.soccer, fx: 290, fy: 700, flip: false, sleeve: "short", ball: "soccer", label: "SOCCER"},
  {k: "basket", pose: POSES.basket, fx: 800, fy: 700, flip: true, sleeve: "none", ball: "basket", label: "BASKETBALL"},
  {k: "football", pose: POSES.football, fx: 295, fy: 1320, flip: false, sleeve: "pads", helmet: true, ball: "football", label: "FOOTBALL"},
  {k: "volley", pose: POSES.volley, fx: 795, fy: 1320, flip: true, sleeve: "none", ball: "volley", label: "VOLLEYBALL"},
];
const SC = 4.0;
export const lightFrame = (i: number) => Math.round((T.light[i] - T.scenes.s4) * 30);

export const anchorOf = (a: Ath): [number, number] => {
  const j = solve(a.pose);
  const mx = (j.neck[0] + j.pelvis[0]) / 2, my = j.neck[1] * 0.55 + j.pelvis[1] * 0.45;
  return [a.fx + (a.flip ? -1 : 1) * mx * SC, a.fy + my * SC];
};

const Ball: React.FC<{kind: Ath["ball"]; x: number; y: number; r: number}> = ({kind, x, y, r}) => {
  const rim = C.lime;
  if (kind === "football") {
    return (
      <g transform={`translate(${x} ${y}) rotate(-35)`}>
        <ellipse rx={r * 1.5} ry={r * 0.95} fill="#0b0e0b" stroke={rim} strokeWidth={0.35} />
        <path d={`M${-r * 0.5} 0 H${r * 0.5}`} stroke={rim} strokeWidth={0.3} />
        {[-0.3, 0, 0.3].map((o) => <path key={o} d={`M${r * o} ${-r * 0.22} v${r * 0.44}`} stroke={rim} strokeWidth={0.25} />)}
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#0b0e0b" stroke={rim} strokeWidth={0.4} />
      {kind === "basket" && <path d={`M${-r} 0 H${r} M0 ${-r} V${r} M${-r * 0.7} ${-r * 0.7} Q${-r * 0.2} 0 ${-r * 0.7} ${r * 0.7} M${r * 0.7} ${-r * 0.7} Q${r * 0.2} 0 ${r * 0.7} ${r * 0.7}`} stroke={rim} strokeWidth={0.25} fill="none" />}
      {kind === "soccer" && <path d={`M0 ${-r * 0.45} L${r * 0.43} ${-r * 0.14} L${r * 0.27} ${r * 0.36} L${-r * 0.27} ${r * 0.36} L${-r * 0.43} ${-r * 0.14} Z`} stroke={rim} strokeWidth={0.25} fill="none" />}
      {kind === "volley" && <path d={`M${-r} 0 Q0 ${-r * 0.5} ${r} 0 M${-r * 0.7} ${-r * 0.7} Q0 ${r * 0.1} ${r * 0.7} ${-r * 0.7}`} stroke={rim} strokeWidth={0.25} fill="none" />}
    </g>
  );
};

export const AthleteFig: React.FC<{a: Ath; lit: number; appear: number; opacity?: number; idx: number}> = ({a, lit, appear, opacity = 1, idx}) => {
  const bob = Math.sin(lit * 0 + idx) * 0;
  return (
    <g opacity={appear * opacity} transform={`translate(0 ${bob})`}>
      <ellipse cx={a.fx} cy={a.fy + 6} rx={150} ry={20} fill="#000" opacity={0.6} />
      <FigureSVG id={`ath${idx}`} pose={a.pose} x={a.fx} y={a.fy} scale={SC} flip={a.flip} rim={0.18 + 0.8 * lit} kit={{sleeve: a.sleeve, helmet: a.helmet, lit}}>
        {(j) => {
          let p: [number, number] = [0, 0], r = 5.2;
          if (a.ball === "soccer") { p = [j.toeN[0] + 5, j.toeN[1] - 2]; r = 4.6; }
          if (a.ball === "basket") { p = [j.handN[0] - 0.5, j.handN[1] - 5.5]; r = 5.4; }
          if (a.ball === "football") { p = [j.handN[0] + 1, j.handN[1] - 3]; r = 3.8; }
          if (a.ball === "volley") { p = [j.handN[0] + 3, j.handN[1] - 5]; r = 5; }
          return <Ball kind={a.ball} x={p[0]} y={p[1]} r={r} />;
        }}
      </FigureSVG>
    </g>
  );
};

/** Needle-eye production symbol */
export const Symbol: React.FC<{f: number; draw: number; glow: number}> = ({f, draw, glow}) => {
  const [cx, cy] = CENTER;
  const rot = f * 0.35;
  const ticks = Array.from({length: 36}, (_, i) => i);
  return (
    <g transform={`translate(${cx} ${cy}) scale(0.8)`}>
      <defs>
        <radialGradient id="sym-g"><stop offset="0" stopColor={C.lime} stopOpacity={0.55 * glow} /><stop offset="1" stopColor={C.lime} stopOpacity="0" /></radialGradient>
      </defs>
      <circle r={300} fill="url(#sym-g)" />
      <g transform={`rotate(${rot})`}>
        <circle r={190} fill="none" stroke={C.lime} strokeWidth={1.6} pathLength={1} strokeDasharray={`${draw} 2`} opacity={0.7} transform="rotate(-90)" />
        {ticks.map((i) => (
          <line key={i} x1={190} y1={0} x2={i % 3 === 0 ? 168 : 180} y2={0} stroke={C.lime} strokeWidth={i % 3 === 0 ? 2.4 : 1.2} opacity={0.6 * draw} transform={`rotate(${i * 10})`} />
        ))}
      </g>
      <g transform={`rotate(${-rot * 1.6})`}>
        <circle r={140} fill="none" stroke={C.porcelain} strokeWidth={1.4} strokeDasharray="10 9" opacity={0.45 * draw} />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d="M140 0 L156 -9 L156 9 Z" fill={C.lime} opacity={0.9 * draw} transform={`rotate(${a})`} />
        ))}
      </g>
      <g opacity={draw}>
        <path d="M0 -92 L80 0 L0 92 L-80 0 Z" fill="#10140f" stroke={C.lime} strokeWidth={2.4} />
        <path d="M0 -92 L80 0 L0 92 L-80 0 Z" fill="none" stroke={C.lime} strokeWidth={10} opacity={0.12 + 0.25 * glow} />
        <ellipse rx={13} ry={44} fill={C.black} stroke="#f4ffd8" strokeWidth={2.4} />
        <ellipse rx={5} ry={30} fill={C.lime} opacity={0.5 + 0.5 * glow} />
      </g>
    </g>
  );
};

export const strandPath = (a: [number, number], b: [number, number], k: number, side: number) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const c1: [number, number] = [a[0] + dx * 0.05 + side * 40 + k * 6, a[1] + dy * 0.55];
  const c2: [number, number] = [b[0] - dx * 0.35, b[1] - dy * 0.12 + k * 5];
  return `M${a[0]} ${a[1]} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${b[0]} ${b[1]}`;
};

export const HazeBG: React.FC<{f: number; id?: string}> = ({f, id = "w"}) => {
  const R = rng(99);
  const dust = Array.from({length: 90}, () => ({x: R() * W, y: R() * H, z: 0.3 + R() * 0.9, ph: R() * 6.28}));
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="44%" r="70%"><stop offset="0" stopColor="#1a211a" /><stop offset="0.6" stopColor="#0a0d0a" /><stop offset="1" stopColor="#040504" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      {dust.map((d, i) => (
        <circle key={i} cx={(d.x + f * 0.3 * d.z) % W} cy={(d.y - f * 0.45 * d.z + H * 3) % H} r={1.2 * d.z + 0.4} fill="#eaf7d2" opacity={0.2 + 0.25 * Math.sin(f / 25 + d.ph) ** 2} />
      ))}
    </g>
  );
};
