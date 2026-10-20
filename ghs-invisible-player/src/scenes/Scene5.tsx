import React from "react";
import {AbsoluteFill} from "remotion";
import {C, FONT_BODY, FONT_HEAD, H, W, clamp, easeInOut, easeOut, lerp, prog, rng, smooth} from "../util";
import {ATHS, CENTER, HazeBG, Symbol} from "./World";
import {Constellation} from "./Scene4";
import {LETTERS, SW} from "../Wordmark";
import {KLines} from "../Kinetic";

const WC: [number, number] = [540, 800];
const ptCache: Record<string, SVGPathElement> = {};
const ptAt = (d: string, p: number): [number, number] => {
  if (!ptCache[d]) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    el.setAttribute("d", d);
    ptCache[d] = el;
  }
  const el = ptCache[d];
  const pt = el.getPointAtLength(el.getTotalLength() * clamp(p));
  return [pt.x, pt.y];
};
const R = rng(5);
const COPIES = Array.from({length: 9}, (_, i) => ({dx: (R() - 0.5) * 120, dy: (R() - 0.5) * 120, r: (R() - 0.5) * 0.3, d: i * 0.025, w: 1 + R() * 1.4, col: i % 3 === 0 ? C.lime : i % 3 === 1 ? C.white : "#cfe6a8"}));

export const Scene5: React.FC<{frame: number}> = ({frame}) => {
  const f = frame;
  const t4 = 300 + f;
  const athFade = 1 - 0.82 * smooth(prog(f, 8, 50));
  const worldK = lerp(1.1, 0.78, easeInOut(prog(f, 0, 140)));
  const symDraw = 1;
  const symOut = 1 - smooth(prog(f, 36, 58));
  const symGlow = 1 + prog(f, 0, 40);
  // letter timing
  const starts = [44, 66, 88];
  const prs = starts.map((s) => easeInOut(prog(f, s, s + 40)));
  const cam = prog(f, 44, 100);
  const camX = lerp(-275, 275, smooth(cam)) * (1 - smooth(prog(f, 100, 136))) + 0;
  const camS = lerp(2.7, 1.0, easeInOut(prog(f, 40, 140)));
  const wmScale = camS;
  const impact = 126;
  const solid = smooth(prog(f, impact - 4, impact + 8));
  const flash = clamp(1 - (f - impact) / 10) * (f >= impact ? 1 : 0);
  const shock = prog(f, impact, impact + 30);
  const brackets = easeOut(prog(f, impact, impact + 24));
  const climax = smooth(prog(f, 262, 290));
  const outFlash = clamp((f - 286) / 5) * clamp((300 - f) / 3 + 1);
  const wmTransform = `translate(${WC[0]} ${WC[1]}) scale(${wmScale}) translate(${-camX * (1 - smooth(prog(f, 100, 136)) * 0 ) * (camS > 1.02 ? 1 : 0)} 0)`;
  const screen = (x: number, y: number): [number, number] => [WC[0] + (x - (camS > 1.02 ? camX : 0)) * wmScale, WC[1] + y * wmScale];
  const wmVis = smooth(prog(f, 40, 48)) * (1 - 0);
  const dissolve = 1 - smooth(prog(f, 272, 298));

  const tips: React.ReactNode[] = [];
  const threads: React.ReactNode[] = [];
  LETTERS.forEach((L, i) => {
    const p = prs[i];
    if (p > 0 && p < 1) {
      const [lx, ly] = ptAt(L.d, p);
      const [sx, sy] = screen(L.x + lx, ly);
      tips.push(
        <g key={L.k}>
          <circle cx={sx} cy={sy} r={34} fill="url(#s5-tip)" />
          <path d={`M${CENTER[0]} ${CENTER[1]} Q ${(CENTER[0] + sx) / 2 + 80} ${(CENTER[1] + sy) / 2 - 40} ${sx} ${sy}`} fill="none" stroke="#f4ffd8" strokeWidth={1.6} opacity={0.7} />
        </g>,
      );
    }
  });

  return (
    <AbsoluteFill style={{background: "#040504"}}>
      <svg width={W} height={H} style={{position: "absolute"}}>
        <defs>
          <radialGradient id="s5-tip"><stop offset="0" stopColor="#fff" /><stop offset="0.35" stopColor={C.lime} stopOpacity={0.7} /><stop offset="1" stopColor={C.lime} stopOpacity={0} /></radialGradient>
          <radialGradient id="s5-halo"><stop offset="0" stopColor={C.lime} stopOpacity={0.35} /><stop offset="1" stopColor={C.lime} stopOpacity={0} /></radialGradient>
        </defs>
        <HazeBG f={t4} id="s5" />
        <circle cx={WC[0]} cy={WC[1]} r={560} fill="url(#s5-halo)" opacity={smooth(prog(f, 60, 130)) * 0.8 * dissolve} />
        <g opacity={1 - smooth(prog(f, 92, 124))} transform={`translate(${CENTER[0]} ${CENTER[1]}) scale(${worldK}) translate(${-CENTER[0]} ${-CENTER[1]})`}>
          <g opacity={symOut}><Symbol f={t4} draw={symDraw} glow={symGlow} /></g>
          <Constellation f={t4} athOpacity={athFade * (1 - smooth(prog(f, 120, 150)))} showLines={true} />
        </g>
        {f > 30 && f < 60 && <circle cx={CENTER[0]} cy={CENTER[1]} r={20 + 400 * (1 - symOut)} fill="none" stroke="#f4ffd8" strokeWidth={4 * symOut} opacity={symOut} />}

        <g opacity={wmVis * dissolve}>
          {tips}
          <g transform={wmTransform} fill="none">
            {/* thread strands converging */}
            {LETTERS.map((L, i) => {
              const p = prs[i];
              const conv = smooth(prog(f, starts[i] + 10, starts[i] + 50));
              return (
                <g key={L.k} transform={`translate(${L.x} 0)`}>
                  {COPIES.map((c, ci) => (
                    <g key={ci} transform={`translate(${c.dx * (1 - conv)} ${c.dy * (1 - conv)}) rotate(${c.r * (1 - conv) * 40})`}>
                      <path d={L.d} stroke={c.col} strokeWidth={c.w} pathLength={1} strokeDasharray={`${clamp(p - c.d * 0.5)} 2`} opacity={0.9 * (1 - solid * 0.6)} />
                      {L.bar && <path d={L.bar} stroke={C.lime} strokeWidth={c.w} pathLength={1} strokeDasharray={`${clamp((p - 0.7) / 0.3)} 2`} opacity={0.9 * (1 - solid * 0.6)} />}
                    </g>
                  ))}
                  {/* stitched lime rim + solid body */}
                  <g opacity={solid}>
                    <path d={L.d} stroke={C.lime} strokeWidth={SW + 7} strokeLinejoin="miter" />
                    <path d={L.d} stroke={C.porcelain} strokeWidth={SW} strokeLinejoin="miter" />
                    <path d={L.d} stroke={C.black} strokeWidth={2.4} strokeDasharray="11 8" opacity={0.75} />
                    {L.bar && <path d={L.bar} stroke={C.lime} strokeWidth={SW} strokeLinejoin="miter" />}
                    {L.bar && <path d={L.bar} stroke={C.black} strokeWidth={2.4} strokeDasharray="11 8" opacity={0.6} />}
                  </g>
                </g>
              );
            })}
            {/* precision marks */}
            <g opacity={brackets} stroke={C.lime} strokeWidth={3} strokeLinecap="square">
              {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
                <path key={i} d={`M${sx * (440 - 40 * (1 - brackets))} ${sy * (230 - 30 * (1 - brackets)) - sy * -0} h${-sx * 60} M${sx * (440 - 40 * (1 - brackets))} ${sy * (230 - 30 * (1 - brackets))} v${-sy * 60}`} />
              ))}
              <path d="M-440 262 H440" strokeWidth={1.2} strokeDasharray="2 10" />
              {Array.from({length: 11}, (_, i) => <path key={i} d={`M${-440 + i * 88} 255 v14`} strokeWidth={i % 5 === 0 ? 3 : 1.4} />)}
            </g>
            <circle r={60 + shock * 900} stroke="#f4ffd8" strokeWidth={4 * (1 - shock)} opacity={shock > 0 && shock < 1 ? 1 : 0} />
          </g>
        </g>

        <rect width={W} height={H} fill="#fff" opacity={Math.min(1, flash * 0.95 + outFlash)} />
      </svg>

      <div style={{position: "absolute", left: 64, top: 1560, width: 960, opacity: 1 - clamp(f / 18)}}>
        <KLines frame={300 + f} start={168} size={118} lines={[{t: "Behind the team."}]} color={C.porcelain} />
        <KLines frame={300 + f} start={214} size={118} lines={[{t: "Behind the uniform.", c: C.lime}]} />
      </div>
      <div style={{position: "absolute", left: 0, top: 1120, width: W, display: "flex", flexDirection: "column", alignItems: "center", opacity: dissolve, transform: `scale(${1 + 0.04 * climax})`}}>
        <KLines frame={f} start={150} size={104} align="center" lines={[{t: "GHS Custom Gear", ls: 3}]} color={C.porcelain} />
        <div style={{height: 10}} />
        <KLines frame={f} start={176} size={38} align="center" lines={[{t: "Custom Sportswear Manufacturing", font: "body", weight: 500, ls: 7, c: "#d9dcd2"}]} />
        <div style={{height: 56}} />
        <KLines frame={f} start={212} size={78} align="center" lines={[{t: "Your Vision. Our Production.", c: C.lime, ls: 2}]} />
      </div>
    </AbsoluteFill>
  );
};
