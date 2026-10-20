import React from "react";
import {C, FPS, H, W, clamp, easeInOut, lerp, prog, rgba, rng, smooth} from "../util";
import {heartPulse} from "../heart";

const F = 1000;
const HY = 790;

export const camAt = (frame: number) => {
  const p = prog(frame, 0, 238);
  const e = lerp(p, easeInOut(p), 0.55);
  return {z: lerp(-80, -3.4, e), y: lerp(2.6, 1.3, e), x: Math.sin(frame / 90) * 0.35 * (1 - p * 0.8)};
};

type Cam = ReturnType<typeof camAt>;
const proj = (cam: Cam, X: number, Y: number, Z: number): [number, number, number] | null => {
  const d = Z - cam.z;
  if (d < 0.35) return null;
  const s = F / d;
  return [W / 2 + (X - cam.x) * s, HY + (cam.y - Y) * s, s];
};

const LAMPS: [number, number, number, number, number][] = [
  [-38, 34, 54, -9, 4],
  [38, 34, 54, 9, 4],
  [-54, 32, 16, 8, -6],
  [54, 32, 16, -8, 10],
  [-22, 36, 76, 0, -10],
  [22, 36, 76, 0, 14],
];

const R = rng(7);
const CROWD = Array.from({length: 620}, () => {
  const row = Math.floor(R() * 14);
  return {x: (R() - 0.5) * 150, y: 2 + row * 1.5, z: 84 + row * 2.2, ph: R() * 6.28, sp: 0.04 + R() * 0.12, br: 0.3 + R() * 0.7, c: R() < 0.2};
});
const DUST = Array.from({length: 170}, () => ({x: (R() - 0.5) * 36, y: 0.4 + R() * 11, z: -78 + R() * 100, ph: R() * 6.28, sp: 0.01 + R() * 0.03}));
const HAZE = Array.from({length: 16}, () => ({x: (R() - 0.5) * 40, y: 0.5 + R() * 5, z: -70 + R() * 130, r: 9 + R() * 14, ph: R() * 6.28}));

const pitchLines = (): [number, number][][] => {
  const L: [number, number][][] = [];
  const hw = 34, hl = 52.5;
  L.push([[-hw, -hl], [hw, -hl], [hw, hl], [-hw, hl], [-hw, -hl]]);
  L.push([[-hw, 0], [hw, 0]]);
  const circ: [number, number][] = [];
  for (let i = 0; i <= 48; i++) circ.push([Math.cos((i / 48) * 6.2832) * 9.15, Math.sin((i / 48) * 6.2832) * 9.15]);
  L.push(circ);
  for (const sg of [-1, 1]) {
    L.push([[-20.16, sg * hl], [-20.16, sg * (hl - 16.5)], [20.16, sg * (hl - 16.5)], [20.16, sg * hl]]);
    L.push([[-9.16, sg * hl], [-9.16, sg * (hl - 5.5)], [9.16, sg * (hl - 5.5)], [9.16, sg * hl]]);
  }
  return L;
};
const LINES = pitchLines();

export const StadiumBG: React.FC<{frame: number; stretch?: number; lights?: number; sec?: number; uid?: string}> = ({frame, stretch = 0, lights, sec, uid = "st"}) => {
  const cam = camAt(Math.min(frame, 239));
  const t = (sec ?? frame / FPS);
  const pulse = heartPulse(t);
  const on = lights ?? 1;
  const ramp = (a: number, b: number) => smooth(prog(t, a, b)) * on;
  const nodes: React.ReactNode[] = [];

  // sky/stands base
  nodes.push(
    <defs key="defs">
      <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#050605" />
        <stop offset="0.35" stopColor="#0a0d0a" />
        <stop offset="0.41" stopColor="#141914" />
        <stop offset="1" stopColor="#070907" />
      </linearGradient>
      <radialGradient id={`${uid}-glow`}>
        <stop offset="0" stopColor="#fff" stopOpacity="1" />
        <stop offset="0.25" stopColor={C.lime} stopOpacity="0.45" />
        <stop offset="1" stopColor={C.lime} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-haze`}>
        <stop offset="0" stopColor="#c9d6c0" stopOpacity="0.09" />
        <stop offset="1" stopColor="#c9d6c0" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-pool`}>
        <stop offset="0" stopColor="#e8f7d0" stopOpacity="0.2" />
        <stop offset="1" stopColor="#e8f7d0" stopOpacity="0" />
      </radialGradient>
      <filter id={`${uid}-blur`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
    </defs>,
  );
  nodes.push(<rect key="bg" width={W} height={H} fill={`url(#${uid}-sky)`} />);

  // ground stripes
  const stripes: React.ReactNode[] = [];
  for (let z = -70, i = 0; z < 70; z += 7, i++) {
    const z0 = Math.max(z, cam.z + 0.5), z1 = z + 7;
    if (z1 <= cam.z + 0.5) continue;
    const a = proj(cam, -40, 0, z0), b = proj(cam, 40, 0, z0), c = proj(cam, 40, 0, z1), d = proj(cam, -40, 0, z1);
    if (!a || !b || !c || !d) continue;
    stripes.push(<polygon key={i} points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`} fill={i % 2 ? "#151a15" : "#101410"} />);
  }
  nodes.push(<g key="stripes" opacity={0.35 + 0.65 * ramp(0.6, 5)}>{stripes}</g>);

  // pools of light
  const pools: React.ReactNode[] = [];
  LAMPS.forEach((l, i) => {
    const p = proj(cam, l[3], 0, l[4]);
    if (!p) return;
    const rx = 15 * p[2];
    const q = proj(cam, l[3], 0, l[4] + 14), q2 = proj(cam, l[3], 0, Math.max(l[4] - 14, cam.z + 0.6));
    const ry = q && q2 ? Math.abs(q2[1] - q[1]) / 2 : rx * 0.1;
    pools.push(<ellipse key={i} cx={p[0]} cy={p[1]} rx={rx} ry={Math.min(ry, rx)} fill={`url(#${uid}-pool)`} opacity={ramp(0.7 + i * 0.5, 3.2 + i * 0.6) * (1 + pulse * 0.25)} />);
  });
  nodes.push(<g key="pools">{pools}</g>);

  // pitch lines
  const lineEls: React.ReactNode[] = [];
  LINES.forEach((pl, i) => {
    const pts: string[] = [];
    const pieces: string[][] = [];
    pl.forEach(([x, z]) => {
      const p = proj(cam, x, 0, z);
      if (p) pts.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`);
      else if (pts.length) { pieces.push([...pts]); pts.length = 0; }
    });
    if (pts.length) pieces.push(pts);
    pieces.forEach((pc, j) => {
      if (pc.length < 2) return;
      const sMid = proj(cam, 0, 0, clamp(pl[0][1], cam.z + 2, 60));
      const sw = clamp(0.13 * (sMid ? sMid[2] : 10), 1, 7);
      lineEls.push(<polyline key={`${i}-${j}`} points={pc.join(" ")} fill="none" stroke={i === 1 ? C.lime : C.porcelain} strokeWidth={sw} strokeOpacity={i === 1 ? 0.85 : 0.5} strokeLinejoin="round" />);
    });
  });
  nodes.push(<g key="lines" opacity={ramp(1.2, 4.5)}>{lineEls}</g>);

  // stands + crowd
  const sA = proj(cam, -75, 0, 84), sB = proj(cam, 75, 0, 84), sC = proj(cam, 75, 24, 118), sD = proj(cam, -75, 24, 118);
  if (sA && sB && sC && sD) nodes.push(<polygon key="stand" points={`${sA[0]},${sA[1]} ${sB[0]},${sB[1]} ${sC[0]},${sC[1]} ${sD[0]},${sD[1]}`} fill="#0c100c" />);
  const crowd = CROWD.map((c, i) => {
    const p = proj(cam, c.x, c.y, c.z);
    if (!p) return null;
    const flick = 0.45 + 0.55 * Math.sin(t * 60 * c.sp * 2 + c.ph);
    const op = c.br * clamp(flick, 0, 1) * ramp(0.4, 3.5) * (0.55 + 0.45 * Math.sin(t * 0.9 + c.ph));
    return <circle key={i} cx={p[0]} cy={p[1]} r={Math.max(0.8, p[2] * 0.09)} fill={c.c ? C.lime : "#dfe8dc"} opacity={op * 0.9} />;
  });
  nodes.push(<g key="crowd">{crowd}</g>);

  // beams
  const beams: React.ReactNode[] = [];
  LAMPS.forEach((l, i) => {
    const lp = proj(cam, l[0], l[1], l[2]);
    if (!lp) return;
    const w = (3.6 + (i % 3)) * (1 - 0.93 * stretch);
    const a = proj(cam, l[3] - w, 0, l[4]), b = proj(cam, l[3] + w, 0, l[4]);
    if (!a || !b) return;
    const inten = ramp(0.8 + i * 0.55, 3.0 + i * 0.7) * (1 + pulse * 0.4) * smooth(clamp((l[4] - cam.z - 5) / 10));
    const gid = `${uid}-b${i}`;
    // extended hairlines for time-stop stretch
    const ex = (k: number) => [lp[0] + (a[0] + b[0] - 2 * lp[0]) / 2 * k, lp[1] + ((a[1] + b[1]) / 2 - lp[1]) * k];
    beams.push(
      <g key={i} opacity={inten}>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={lp[0]} y1={lp[1]} x2={(a[0] + b[0]) / 2} y2={(a[1] + b[1]) / 2}>
          <stop offset="0" stopColor="#f4ffd8" stopOpacity={0.34} />
          <stop offset="0.7" stopColor="#d9f5a0" stopOpacity={0.07} />
          <stop offset="1" stopColor={C.lime} stopOpacity={0.12} />
        </linearGradient>
        <polygon points={`${lp[0]},${lp[1]} ${a[0]},${a[1]} ${b[0]},${b[1]}`} fill={`url(#${gid})`} />
        {stretch > 0 && (
          <>
            <line x1={lp[0]} y1={lp[1]} x2={ex(3.4)[0]} y2={ex(3.4)[1]} stroke="#f4ffd8" strokeOpacity={0.55 * stretch} strokeWidth={1.4} />
            <line x1={lp[0]} y1={lp[1]} x2={ex(3.4)[0] + (a[0] - b[0]) * 0.5} y2={ex(3.4)[1] + (a[1] - b[1]) * 0.5} stroke={C.lime} strokeOpacity={0.4 * stretch} strokeWidth={1} />
            <line x1={lp[0] - 1600} y1={lp[1]} x2={lp[0] + 1600} y2={lp[1]} stroke="#f4ffd8" strokeOpacity={0.5 * stretch} strokeWidth={1.2} />
          </>
        )}
        <circle cx={lp[0]} cy={lp[1]} r={clamp(lp[2] * 2.6, 14, 150) * (1 + pulse * 0.25)} fill={`url(#${uid}-glow)`} opacity={0.9} />
      </g>,
    );
  });
  nodes.push(<g key="beams" style={{mixBlendMode: "screen"}}>{beams}</g>);

  // haze
  const haze = HAZE.map((h, i) => {
    const hz = h.z + (stretch > 0 ? 0 : 0);
    const p = proj(cam, h.x + Math.sin(t * 0.25 + h.ph) * 3, h.y, hz);
    if (!p) return null;
    const d = hz - cam.z;
    const fade = clamp((d - 2) / 10) * clamp(1 - d / 140);
    const r = h.r * p[2];
    return <ellipse key={i} cx={p[0]} cy={p[1]} rx={Math.min(r, 1600)} ry={Math.min(r * 0.35, 520)} fill={`url(#${uid}-haze)`} opacity={fade * ramp(0.3, 3) * 1.4} />;
  });
  nodes.push(<g key="haze">{haze}</g>);

  // dust
  const dust = DUST.map((d, i) => {
    const zz = d.z;
    const p = proj(cam, d.x + Math.sin(t * d.sp * 8 + d.ph) * 0.6, d.y + Math.cos(t * d.sp * 6 + d.ph) * 0.4, zz);
    if (!p) return null;
    const dd = zz - cam.z;
    const f = clamp((dd - 1.2) / 5) * clamp(1 - dd / 85);
    return <circle key={i} cx={p[0]} cy={p[1]} r={Math.max(0.7, p[2] * 0.012)} fill="#eef8d8" opacity={f * 0.55 * ramp(1.5, 4)} />;
  });
  nodes.push(<g key="dust">{dust}</g>);

  return <g>{nodes}</g>;
};

export const stadiumProject = (frame: number, X: number, Y: number, Z: number) => proj(camAt(Math.min(frame, 239)), X, Y, Z);
