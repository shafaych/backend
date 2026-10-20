import React, {useLayoutEffect, useRef} from "react";
import {AbsoluteFill} from "remotion";
import {C, H, W, clamp, easeInOut, easeOut, lerp, prog, rng, smooth} from "../util";
import {J, SEAMS} from "../jersey";

const N = 1000, K = 34, ROWS = 26;
const R = rng(2024);
const S = Array.from({length: N}, (_, i) => ({
  th: R() * Math.PI * 2, rho: 0.35 + Math.pow(R(), 0.6) * 0.75, ph: R() * 6.28, sp: 0.6 + R() * 0.9,
  kind: R() < 0.24 ? 0 : R() < 0.4 ? 1 : 2, w: 0.5 + R() * 1.1, jit: (R() - 0.5) * 5, jit2: (R() - 0.5) * 5, tw: 0.35 + R() * 0.25,
}));
const COL: [number, number, number][] = [[200, 243, 107], [245, 245, 240], [130, 150, 130]];

const tri = (x: number) => Math.abs(((x % 2) + 2) % 2 - 1) * 2 - 1;
const lens: Record<string, number> = {};
const pathLen = (d: string) => {
  if (lens[d] === undefined) {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    lens[d] = p.getTotalLength();
  }
  return lens[d];
};

function drawThread(ctx: CanvasRenderingContext2D, f: number, a: number) {
  if (a <= 0.01) return;
  const t = f / 30;
  const Z = Math.exp(lerp(Math.log(0.22), Math.log(5.5), easeInOut(prog(f, 0, 96))));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(W / 2, 960);
  ctx.scale(Z, Z);
  ctx.translate(-W / 2, -960);
  const plies = 3;
  const steps = 110;
  const amp = 15, wl = 60;
  for (let layer = 0; layer < 2; layer++) {
    for (let j = 0; j < plies; j++) {
      const ph = (j / plies) * Math.PI * 2;
      // draw in segments for depth shading (front/back)
      for (let s = 0; s < steps; s++) {
        const x0 = -120 + (s / steps) * (W + 240), x1 = -120 + ((s + 1) / steps) * (W + 240);
        const k0 = (x0 / wl) * Math.PI * 2 + ph - t * 3, k1 = (x1 / wl) * Math.PI * 2 + ph - t * 3;
        const depth = Math.cos((k0 + k1) / 2);
        if ((layer === 0) === depth > 0) continue;
        const y0 = 960 + Math.sin(k0) * amp, y1 = 960 + Math.sin(k1) * amp;
        const lit = 0.35 + 0.65 * (depth * 0.5 + 0.5);
        ctx.strokeStyle = `rgb(${Math.round(70 + 130 * lit)},${Math.round(95 + 148 * lit)},${Math.round(90 + 17 * lit)})`;
        ctx.lineWidth = 11 + 3 * depth;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        // fibres: hairlines along the ply
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = `rgba(245,255,225,${0.2 + 0.5 * lit})`;
        for (let h = -2; h <= 2; h += 2) {
          ctx.beginPath();
          ctx.moveTo(x0, y0 + h * 1.5 + Math.sin(k0 * 3 + h) * 0.8);
          ctx.lineTo(x1, y1 + h * 1.5 + Math.sin(k1 * 3 + h) * 0.8);
          ctx.stroke();
        }
      }
    }
  }
  ctx.restore();
  // glow
  const g = ctx.createLinearGradient(0, 900, 0, 1020);
  g.addColorStop(0, "rgba(200,243,107,0)");
  g.addColorStop(0.5, `rgba(200,243,107,${0.16 * a})`);
  g.addColorStop(1, "rgba(200,243,107,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 900, W, 120);
}

function tunnelPt(i: number, k: number, t: number, spin: number, open: number): [number, number, number] {
  const s = S[i];
  const z = 0.45 * Math.exp(k * 0.118);
  const zt = z + t * 1.6;
  const cxp = Math.sin(zt * 0.33 + 0.6) * 0.26 * (1 + open) + Math.sin(zt * 0.9) * 0.05;
  const cyp = Math.cos(zt * 0.27) * 0.2 * (1 + open);
  const th = s.th + zt * s.tw * 0.55 * spin + t * 0.25;
  const rad = s.rho * (1 + 0.16 * Math.sin(zt * 0.7 + s.ph)) * (1 + 0.25 * open);
  const sc = 900 / z;
  return [W / 2 + (cxp + Math.cos(th) * rad) * sc, 960 + (cyp + Math.sin(th) * rad * 1.3) * sc, z];
}
function patA(i: number, k: number): [number, number] {
  const row = i % ROWS;
  const x = -40 + (k / (K - 1)) * (W + 80);
  return [x, 150 + row * (1620 / (ROWS - 1)) + tri(x / 150 + row * 0.15) * 34 + S[i].jit * 0.5];
}
function patB(i: number, k: number): [number, number] {
  const L = i % 34;
  const p = k / (K - 1);
  const o = -1250 + Math.floor(L / 2) * 150;
  const dir = L % 2 === 0 ? 1 : -1;
  const ox = dir > 0 ? o : o + 3200;
  return [ox + dir * p * 2600 + S[i].jit * 0.4, -300 + p * 2600 + S[i].jit2 * 0.4];
}

function drawRings(ctx: CanvasRenderingContext2D, f: number, vis: number) {
  const t = f / 30;
  const open = 0.3 * smooth(prog(f, 120, 170));
  const fade = vis * (1 - smooth(prog(f, 168, 200)));
  if (fade <= 0.01) return;
  ctx.globalCompositeOperation = "lighter";
  for (let j = 0; j < 12; j++) {
    const u = ((j + t * 1.1) % 12) / 12;
    const kf = u * (K - 1);
    const a = Math.sin(Math.PI * u) * 0.32 * fade;
    ctx.strokeStyle = `rgba(200,243,107,${a})`;
    ctx.lineWidth = 1.4 + 2.5 * (1 - u);
    ctx.beginPath();
    for (let q = 0; q <= 64; q++) {
      const th = (q / 64) * Math.PI * 2;
      const z = 0.45 * Math.exp(kf * 0.118);
      const zt = z + t * 1.6;
      const cxp = Math.sin(zt * 0.33 + 0.6) * 0.26 * (1 + open) + Math.sin(zt * 0.9) * 0.05;
      const cyp = Math.cos(zt * 0.27) * 0.2 * (1 + open);
      const rad = 0.95 * (1 + 0.25 * open) * (1 + 0.04 * Math.sin(th * 6 + zt));
      const sc = 900 / z;
      const x = W / 2 + (cxp + Math.cos(th) * rad) * sc, y = 960 + (cyp + Math.sin(th) * rad * 1.3) * sc;
      q === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawStrands(ctx: CanvasRenderingContext2D, f: number, vis: number) {
  if (vis <= 0.01) return;
  const t = f / 30;
  const open = 0.3 * smooth(prog(f, 120, 170));
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < N; i++) {
    const s = S[i];
    const row = i % ROWS;
    const mA = easeInOut(prog(f, 172 + row * 0.9, 172 + row * 0.9 + 40));
    const mB = easeInOut(prog(f, 238 + (i % 34) * 0.5, 238 + (i % 34) * 0.5 + 34));
    const c = COL[s.kind];
    const fadeOut = 1 - smooth(prog(f, 282, 300)) * 0.9;
    const pts: [number, number, number][] = [];
    for (let k = 0; k < K; k++) {
      const tp = tunnelPt(i, k, t, 1, open);
      let x = tp[0], y = tp[1];
      if (mA > 0) {
        const pa = patA(i, k);
        x = lerp(x, pa[0], mA); y = lerp(y, pa[1], mA);
      }
      if (mB > 0) {
        const pb = patB(i, k);
        x = lerp(x, pb[0], mB); y = lerp(y, pb[1], mB);
      }
      pts.push([x, y, tp[2]]);
    }
    const flat = Math.max(mA, mB);
    const baseA = lerp(0.07 + s.w * 0.04, 0.2, flat) * vis * fadeOut * (flat > 0.99 && mB > 0.99 ? 0.8 : 1);
    ctx.lineWidth = lerp(s.w, 0.9, flat);
    ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${baseA})`;
    ctx.beginPath();
    for (let k = 0; k < K; k++) k === 0 ? ctx.moveTo(pts[k][0], pts[k][1]) : ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.stroke();
    if (flat < 0.5) {
      // dim the far (vanishing-point) end so the tunnel keeps depth
      ctx.strokeStyle = `rgba(2,3,2,${0.7 * (1 - flat * 2) * vis})`;
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = ctx.lineWidth + 0.8;
      ctx.beginPath();
      for (let k = 24; k < K; k++) k === 24 ? ctx.moveTo(pts[k][0], pts[k][1]) : ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
    }
    // travelling light pulses
    if (flat < 0.98) {
      const q = ((t * 0.55 * s.sp + s.ph / 6.28) % 1) * K;
      const k0 = Math.floor(q);
      ctx.lineWidth = s.w * 1.9 * (1 - flat);
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.55 * vis * (1 - flat)})`;
      ctx.beginPath();
      const ka = Math.max(0, k0 - 2), kb = Math.min(K - 1, k0 + 2);
      for (let k = ka; k <= kb; k++) k === ka ? ctx.moveTo(pts[k][0], pts[k][1]) : ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.stroke();
    } else {
      // pulse running along woven lines
      const q = ((t * 0.9 * s.sp + s.ph / 6.28) % 1) * K;
      const k0 = Math.floor(q);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.55 * vis * fadeOut})`;
      ctx.beginPath();
      const ka = Math.max(0, k0 - 1), kb = Math.min(K - 1, k0 + 1);
      for (let k = ka; k <= kb; k++) k === ka ? ctx.moveTo(pts[k][0], pts[k][1]) : ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

const J_MAP: [string, string][] = [
  [J.front, "front"], [J.sleeveL, "sl"], [J.sleeveR, "sr"],
];

function drawSeams(ctx: CanvasRenderingContext2D, f: number) {
  const p = prog(f, 244, 296);
  if (p <= 0) return;
  ctx.save();
  ctx.translate(W / 2, 960);
  ctx.scale(1.5, 1.5);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // outlines drawn on, staggered
  const outs = [J.front, J.sleeveL, J.sleeveR];
  outs.forEach((d, i) => {
    const q = easeOut(prog(f, 244 + i * 10, 282 + i * 10));
    if (q <= 0) return;
    const L = pathLen(d);
    const path = new Path2D(d);
    ctx.setLineDash([L * q, L * 2]);
    ctx.strokeStyle = "rgba(200,243,107,0.28)"; ctx.lineWidth = 9; ctx.stroke(path);
    ctx.strokeStyle = "rgba(235,255,190,0.95)"; ctx.lineWidth = 1.8; ctx.stroke(path);
    // needle spark
    if (q < 1) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      el.setAttribute("d", d);
      const pt = el.getPointAtLength(L * q);
      ctx.setLineDash([]);
      const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 22);
      g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(200,243,107,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pt.x, pt.y, 22, 0, 7); ctx.fill();
    }
  });
  // running-stitch internal seams
  SEAMS.forEach((s, i) => {
    const q = easeOut(prog(f, 258 + i * 3, 292 + i * 3));
    if (q <= 0) return;
    const L = pathLen(s.d);
    ctx.setLineDash([9, 7]);
    ctx.lineDashOffset = -L * (1 - q);
    // reveal by clipping dash length
    ctx.save();
    ctx.strokeStyle = "rgba(200,243,107,0.95)"; ctx.lineWidth = 2.4;
    const path = new Path2D(s.d);
    ctx.setLineDash([9, 7]);
    // approximate draw-on: draw sub-path by using dash pattern then mask w/ clip rect not feasible; fade alpha instead
    ctx.globalAlpha = q;
    ctx.stroke(path);
    ctx.restore();
  });
  ctx.setLineDash([]);
  // satin-stitch emblem on chest (embroidery)
  const sp = prog(f, 266, 296);
  const n = Math.floor(sp * 70);
  ctx.lineWidth = 2.2;
  for (let i = 0; i < n; i++) {
    const u = i / 69;
    const x = -160 + u * 320;
    const yTop = (x < 0 ? -20 + (x + 160) * (90 / 160) : 70 - x * (90 / 160));
    const yBot = yTop + 34;
    ctx.strokeStyle = `rgba(245,255,215,${0.7 + 0.3 * Math.sin(i)})`;
    ctx.beginPath();
    ctx.moveTo(x - 3, yTop + 1); ctx.lineTo(x + 3, yBot - 1);
    ctx.stroke();
  }
  if (sp > 0 && sp < 1) {
    const u = n / 69, x = -160 + u * 320;
    const yTop = x < 0 ? -20 + (x + 160) * (90 / 160) : 70 - x * (90 / 160);
    const g = ctx.createRadialGradient(x, yTop + 17, 0, x, yTop + 17, 30);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(200,243,107,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, yTop + 17, 30, 0, 7); ctx.fill();
  }
  ctx.restore();
}

export const Scene3: React.FC<{frame: number}> = ({frame}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const f = frame;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#040504";
    ctx.fillRect(0, 0, W, H);
    // ambient depth glow
    const g = ctx.createRadialGradient(W / 2, 960, 0, W / 2, 960, 1100);
    g.addColorStop(0, `rgba(60,80,50,${0.18 + 0.1 * smooth(prog(f, 60, 120))})`);
    g.addColorStop(1, "rgba(4,5,4,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const tunnelVis = smooth(prog(f, 62, 104));
    drawRings(ctx, f, tunnelVis);
    drawStrands(ctx, f, tunnelVis);
    // vanishing-point depth fog + light
    if (f > 60 && f < 190) {
      const fg = ctx.createRadialGradient(W / 2, 960, 0, W / 2, 960, 330);
      fg.addColorStop(0, `rgba(4,5,4,${0.85 * tunnelVis * (1 - smooth(prog(f, 150, 190)))})`);
      fg.addColorStop(1, "rgba(4,5,4,0)");
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, W, H);
      const lg = ctx.createRadialGradient(W / 2, 960, 0, W / 2, 960, 110);
      lg.addColorStop(0, `rgba(235,255,190,${0.16 * tunnelVis})`);
      lg.addColorStop(1, "rgba(200,243,107,0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    drawThread(ctx, f, 1 - smooth(prog(f, 58, 100)));
    drawSeams(ctx, f);
    // vignette
    const vg = ctx.createRadialGradient(W / 2, 960, 500, W / 2, 960, 1250);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }, [frame]);
  return (
    <AbsoluteFill style={{background: "#040504"}}>
      <canvas ref={ref} width={W} height={H} style={{width: W, height: H}} />
    </AbsoluteFill>
  );
};
