import React from "react";
import {C, lerp} from "./util";

export type Pose = {
  lean: number; // torso lean from vertical (+ forward)
  head: number;
  armN: [number, number]; // [upper angle, elbow bend]
  armF: [number, number];
  legN: [number, number]; // [thigh angle, knee bend]
  legF: [number, number];
  lift: number; // airborne height (figure units)
};
export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  lean: lerp(a.lean, b.lean, t),
  head: lerp(a.head, b.head, t),
  armN: [lerp(a.armN[0], b.armN[0], t), lerp(a.armN[1], b.armN[1], t)],
  armF: [lerp(a.armF[0], b.armF[0], t), lerp(a.armF[1], b.armF[1], t)],
  legN: [lerp(a.legN[0], b.legN[0], t), lerp(a.legN[1], b.legN[1], t)],
  legF: [lerp(a.legF[0], b.legF[0], t), lerp(a.legF[1], b.legF[1], t)],
  lift: lerp(a.lift, b.lift, t),
});

export const POSES: Record<string, Pose> = {
  idle: {lean: 0.06, head: 0.05, armN: [0.12, 0.3], armF: [-0.1, 0.25], legN: [0.08, 0.05], legF: [-0.1, 0.1], lift: 0},
  crouch: {lean: 0.14, head: 0.1, armN: [0.25, 0.5], armF: [-0.2, 0.4], legN: [0.3, 0.45], legF: [-0.2, 0.35], lift: 0},
  run: {lean: 0.34, head: 0.05, armN: [-1.0, 1.5], armF: [0.95, 1.25], legN: [1.0, 0.55], legF: [-0.7, 1.7], lift: 6},
  soccer: {lean: -0.12, head: 0.2, armN: [-1.25, 0.2], armF: [1.35, 0.25], legN: [1.3, 0.12], legF: [0.0, 0.2], lift: 0},
  basket: {lean: 0.04, head: -0.1, armN: [2.85, -0.35], armF: [1.9, 1.9], legN: [0.45, 1.2], legF: [0.1, 1.5], lift: 34},
  football: {lean: -0.1, head: -0.05, armN: [2.35, 1.1], armF: [1.25, 0.6], legN: [0.7, 0.55], legF: [-0.45, 0.4], lift: 0},
  volley: {lean: -0.2, head: -0.2, armN: [2.65, 0.9], armF: [2.85, 0.1], legN: [-0.3, 1.5], legF: [-0.55, 1.7], lift: 30},
};

export const DIM = {torso: 30, neck: 4, headR: 5.6, up: 17, fore: 16, thigh: 24, shin: 24, foot: 8};
type P = [number, number];
const dirv = (a: number): P => [Math.sin(a), Math.cos(a)];
const add = (p: P, d: P, l: number): P => [p[0] + d[0] * l, p[1] + d[1] * l];

export type Joints = ReturnType<typeof solve>;
export function solve(pose: Pose, grounded = true) {
  const D = DIM;
  let pelvis: P = [0, -(D.thigh + D.shin) * 0.97];
  const td: P = [Math.sin(pose.lean), -Math.cos(pose.lean)];
  const neck = add(pelvis, td, D.torso);
  const headC = add(neck, [Math.sin(pose.lean + pose.head), -Math.cos(pose.lean + pose.head)], D.neck + D.headR);
  const sh = (o: number): P => [neck[0] - td[0] * 2 + o, neck[1] - td[1] * 2];
  const limb = (root: P, a: number, bend: number, l1: number, l2: number, sign: number) => {
    const m = add(root, dirv(a), l1);
    const e = add(m, dirv(a + sign * bend), l2);
    return {m, e};
  };
  const shN = sh(1.5), shF = sh(-1.5);
  const aN = limb(shN, pose.armN[0], pose.armN[1], D.up, D.fore, 1);
  const aF = limb(shF, pose.armF[0], pose.armF[1], D.up, D.fore, 1);
  const hipN: P = [pelvis[0] + 1, pelvis[1]], hipF: P = [pelvis[0] - 1, pelvis[1]];
  const lN = limb(hipN, pose.legN[0], pose.legN[1], D.thigh, D.shin, -1);
  const lF = limb(hipF, pose.legF[0], pose.legF[1], D.thigh, D.shin, -1);
  const shinN = pose.legN[0] - pose.legN[1], shinF = pose.legF[0] - pose.legF[1];
  const toeN = add(lN.e, [Math.sin(shinN + Math.PI / 2 - 0.15), Math.cos(shinN + Math.PI / 2 - 0.15)] as P, D.foot);
  const toeF = add(lF.e, [Math.sin(shinF + Math.PI / 2 - 0.15), Math.cos(shinF + Math.PI / 2 - 0.15)] as P, D.foot);
  const handN = add(aN.e, dirv(pose.armN[0] + pose.armN[1]), 4);
  const handF = add(aF.e, dirv(pose.armF[0] + pose.armF[1]), 4);
  let low = Math.max(lN.e[1], lF.e[1], toeN[1], toeF[1]);
  const dy = (grounded ? -low : 0) - pose.lift;
  const S = (p: P): P => [p[0], p[1] + dy];
  return {
    pelvis: S(pelvis), neck: S(neck), head: S(headC), shN: S(shN), shF: S(shF),
    elN: S(aN.m), wrN: S(aN.e), handN: S(handN), elF: S(aF.m), wrF: S(aF.e), handF: S(handF),
    hipN: S(hipN), hipF: S(hipF), knN: S(lN.m), anN: S(lN.e), toeN: S(toeN), knF: S(lF.m), anF: S(lF.e), toeF: S(toeF),
    lean: pose.lean,
  };
}

const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
export function capsule(p0: P, p1: P, r0: number, r1: number): string {
  const d = sub(p1, p0);
  const L = Math.hypot(d[0], d[1]) || 1;
  const n: P = [-d[1] / L, d[0] / L];
  const a0: P = [p0[0] + n[0] * r0, p0[1] + n[1] * r0];
  const a1: P = [p1[0] + n[0] * r1, p1[1] + n[1] * r1];
  const b1: P = [p1[0] - n[0] * r1, p1[1] - n[1] * r1];
  const b0: P = [p0[0] - n[0] * r0, p0[1] - n[1] * r0];
  const f = (v: number) => v.toFixed(2);
  return `M${f(a0[0])} ${f(a0[1])}L${f(a1[0])} ${f(a1[1])}A${f(r1)} ${f(r1)} 0 0 0 ${f(b1[0])} ${f(b1[1])}L${f(b0[0])} ${f(b0[1])}A${f(r0)} ${f(r0)} 0 0 0 ${f(a0[0])} ${f(a0[1])}Z`;
}

export type Kit = {
  sleeve: "short" | "none" | "pads" | "long";
  helmet?: boolean;
  shorts?: boolean;
  lit: number; // 0..1 illumination of the uniform
  accent?: string;
};

type Mode = "solid" | "wire";
const body = {head: 5.6, neck: 2.4, torsoTop: 6.4, torsoBot: 4.8, ua: [3.3, 2.6], fa: [2.5, 1.9], th: [5.2, 3.6], sh: [3.5, 2.4], ft: 2.2};

export function bodyShapes(j: Joints) {
  const s: {k: string; d: string; far?: boolean; kit?: string}[] = [];
  const limb = (a: P, b: P, r: number[]) => capsule(a, b, r[0], r[1]);
  s.push({k: "armF", d: limb(j.shF, j.elF, body.ua), far: true});
  s.push({k: "foreF", d: limb(j.elF, j.wrF, body.fa), far: true});
  s.push({k: "thF", d: limb(j.hipF, j.knF, body.th), far: true});
  s.push({k: "shF", d: limb(j.knF, j.anF, body.sh), far: true});
  s.push({k: "ftF", d: limb(j.anF, j.toeF, [body.ft, 1.8]), far: true});
  s.push({k: "torso", d: capsule(j.neck, j.pelvis, body.torsoTop, body.torsoBot)});
  s.push({k: "neck", d: capsule(j.neck, j.head, body.neck, body.neck - 0.4)});
  s.push({k: "thN", d: limb(j.hipN, j.knN, body.th)});
  s.push({k: "shN", d: limb(j.knN, j.anN, body.sh)});
  s.push({k: "ftN", d: capsule(j.anN, j.toeN, body.ft, 1.8)});
  s.push({k: "armN", d: limb(j.shN, j.elN, body.ua)});
  s.push({k: "foreN", d: limb(j.elN, j.wrN, body.fa)});
  return s;
}

const mid = (a: P, b: P, t: number): P => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

/** Garment shapes (kit) that sit on top of the body silhouette. */
export function kitShapes(j: Joints, kit: Kit) {
  const out: {k: string; d: string; trim?: boolean}[] = [];
  const nT = mid(j.neck, j.pelvis, 0.04);
  const pH = mid(j.neck, j.pelvis, 0.97);
  const wide = kit.sleeve === "pads" ? 1.15 : 1;
  out.push({k: "jersey", d: capsule(nT, pH, (body.torsoTop + 1.1) * wide, body.torsoBot + 1.0)});
  if (kit.sleeve === "short" || kit.sleeve === "pads") {
    out.push({k: "slN", d: capsule(j.shN, mid(j.shN, j.elN, kit.sleeve === "pads" ? 0.8 : 0.62), body.ua[0] + 1.1, body.ua[1] + 1.0)});
    out.push({k: "slF", d: capsule(j.shF, mid(j.shF, j.elF, kit.sleeve === "pads" ? 0.8 : 0.62), body.ua[0] + 1.1, body.ua[1] + 1.0)});
  }
  if (kit.sleeve === "long") {
    out.push({k: "slN", d: capsule(j.shN, j.wrN, body.ua[0] + 1.4, body.fa[1] + 1.2)});
  }
  if (kit.shorts !== false) {
    out.push({k: "shortsN", d: capsule(j.hipN, mid(j.hipN, j.knN, 0.62), body.th[0] + 1.0, body.th[1] + 1.1)});
    out.push({k: "shortsF", d: capsule(j.hipF, mid(j.hipF, j.knF, 0.62), body.th[0] + 1.0, body.th[1] + 1.1)});
  }
  return out;
}

export const FigureSVG: React.FC<{
  pose: Pose;
  x?: number;
  y?: number;
  scale?: number;
  flip?: boolean;
  kit?: Kit;
  mode?: Mode;
  rim?: number; // rim-light opacity
  rimColor?: string;
  wire?: number; // 0..1 wireframe blend
  opacity?: number;
  grounded?: boolean;
  id?: string;
  children?: (j: Joints) => React.ReactNode;
}> = ({pose, x = 0, y = 0, scale = 8, flip, kit, rim = 0.5, rimColor = C.lime, wire = 0, opacity = 1, grounded = true, id = "f", children}) => {
  const j = solve(pose, grounded);
  const shapes = bodyShapes(j);
  const kits = kit ? kitShapes(j, kit) : [];
  const lit = kit?.lit ?? 0;
  const solidO = 1 - wire;
  const headEl = (fill: string, stroke?: string) => (
    <>
      <circle cx={j.head[0]} cy={j.head[1]} r={body.head} fill={fill} stroke={stroke} strokeWidth={stroke ? 0.25 : 0} />
      {kit?.helmet && (
        <>
          <circle cx={j.head[0]} cy={j.head[1] - 0.4} r={body.head + 1.9} fill={fill} stroke={stroke} strokeWidth={stroke ? 0.25 : 0} />
          <path d={capsule([j.head[0] + 5, j.head[1] + 1], [j.head[0] + 7.5, j.head[1] + 4.5], 1, 0.6)} fill={fill} />
        </>
      )}
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} opacity={opacity}>
      {solidO > 0.01 && (
        <g opacity={solidO}>
          <g transform="translate(-0.28 -0.2)" opacity={rim}>
            {shapes.map((s) => <path key={s.k} d={s.d} fill={rimColor} />)}
            {headEl(rimColor)}
          </g>
          {shapes.map((s) => <path key={s.k} d={s.d} fill={s.far ? "#070907" : "#0b0e0b"} />)}
          {headEl("#0b0e0b")}
          {kits.map((s) => (
            <path key={s.k} d={s.d} fill={s.trim ? C.lime : `url(#${id}-kit)`} stroke="#0a0d0a" strokeWidth={0.45} opacity={s.trim ? 0.5 + lit * 0.5 : 1} />
          ))}
        </g>
      )}
      {wire > 0.01 && (
        <g opacity={wire} fill="none" stroke={C.lime} strokeWidth={0.22} strokeLinejoin="round">
          {shapes.map((s) => <path key={s.k} d={s.d} fill="rgba(200,243,107,0.04)" />)}
          <circle cx={j.head[0]} cy={j.head[1]} r={body.head} fill="rgba(200,243,107,0.04)" />
          <ellipse cx={j.head[0]} cy={j.head[1]} rx={body.head * 0.4} ry={body.head} strokeWidth={0.12} />
          <ellipse cx={j.head[0]} cy={j.head[1]} rx={body.head} ry={body.head * 0.38} strokeWidth={0.12} />
          {(
            [
              [j.neck, j.pelvis], [j.shN, j.elN], [j.elN, j.wrN], [j.shF, j.elF], [j.elF, j.wrF],
              [j.hipN, j.knN], [j.knN, j.anN], [j.hipF, j.knF], [j.knF, j.anF], [j.neck, j.head],
              [j.shN, j.shF], [j.hipN, j.hipF], [j.shN, j.hipN], [j.shF, j.hipF], [j.shN, j.pelvis], [j.shF, j.pelvis],
            ] as [P, P][]
          ).map((l, i) => (
            <line key={i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} strokeWidth={0.14} />
          ))}
          {([j.neck, j.pelvis, j.shN, j.shF, j.elN, j.elF, j.wrN, j.wrF, j.hipN, j.knN, j.knF, j.anN, j.anF, j.head] as P[]).map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={0.9} fill={C.black} stroke={C.lime} strokeWidth={0.2} />
          ))}
        </g>
      )}
      <defs>
        <linearGradient id={`${id}-kit`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mixHex("#1d231d", C.lime, lit)} />
          <stop offset="1" stopColor={mixHex("#2a3129", "#e9ffb4", lit)} />
        </linearGradient>
      </defs>
      {children?.(j)}
    </g>
  );
};

export function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, t));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
