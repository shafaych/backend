import React from "react";
import {AbsoluteFill} from "remotion";
import {C, FONT_BODY, H, W, clamp, easeInOut, easeOut, lerp, prog, smooth} from "../util";
import {ATHS, AthleteFig, CENTER, HazeBG, Symbol, anchorOf, lightFrame, strandPath} from "./World";
import {KLines} from "../Kinetic";

export const Constellation: React.FC<{f: number; athOpacity?: number; showLines?: boolean}> = ({f, athOpacity = 1, showLines = true}) => {
  return (
    <g>
      {ATHS.map((a, i) => {
        const lf = lightFrame(i);
        const lit = easeOut(prog(f, lf, lf + 16));
        const appear = smooth(prog(f, 14 + i * 8, 56 + i * 8));
        const [ax, ay] = anchorOf(a);
        const top = a.fy - 520;
        return (
          <g key={a.k}>
            {lit > 0 && (
              <g style={{mixBlendMode: "screen"}} opacity={lit * athOpacity}>
                <defs>
                  <linearGradient id={`cone${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4ffd8" stopOpacity={0.32} /><stop offset="1" stopColor={C.lime} stopOpacity={0.02} /></linearGradient>
                  <radialGradient id={`pool${i}`}><stop offset="0" stopColor="#e6f9b8" stopOpacity={0.5} /><stop offset="1" stopColor={C.lime} stopOpacity={0} /></radialGradient>
                </defs>
                <polygon points={`${ax - 24},${top} ${ax + 24},${top} ${ax + 190},${a.fy + 6} ${ax - 190},${a.fy + 6}`} fill={`url(#cone${i})`} />
                <ellipse cx={a.fx} cy={a.fy + 4} rx={190} ry={30} fill={`url(#pool${i})`} />
              </g>
            )}
            <AthleteFig a={a} lit={lit} appear={appear} opacity={athOpacity} idx={i} />
            {lit > 0 && lit < 1 && (
              <circle cx={ax} cy={ay} r={20 + 190 * lit} fill="none" stroke="#f4ffd8" strokeWidth={3 * (1 - lit)} opacity={1 - lit} />
            )}
          </g>
        );
      })}
      {ATHS.map((a, i) => {
        const lf = lightFrame(i);
        const appear = smooth(prog(f, 14 + i * 8, 56 + i * 8));
        return (
          <text key={a.k} x={a.fx} y={a.fy + 58} textAnchor="middle" fill={C.porcelain} fontFamily={FONT_BODY} fontWeight={600} fontSize={24} letterSpacing={7} opacity={appear * 0.85 * smooth(prog(f, lf + 10, lf + 30)) * athOpacity}>{a.label}</text>
        );
      })}
      {showLines &&
        ATHS.map((a, i) => {
          const lf = lightFrame(i);
          const d = easeInOut(prog(f, lf + 8, lf + 44));
          if (d <= 0) return null;
          const start = anchorOf(a);
          const pulse = ((f - lf) * 0.011) % 1;
          return (
            <g key={a.k}>
              {[-3, -2, -1, 0, 1, 2, 3].map((k) => {
                const dd = strandPath(start, [CENTER[0], CENTER[1]], k, a.flip ? -1 : 1);
                return (
                  <g key={k}>
                    <path d={dd} fill="none" stroke={C.lime} strokeWidth={Math.abs(k) === 0 ? 2.2 : 1.1} pathLength={1} strokeDasharray={`${d} 2`} opacity={Math.abs(k) === 0 ? 0.95 : 0.45} />
                    <path d={dd} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={`0.035 0.965`} strokeDashoffset={-((pulse + k * 0.07 + 1) % 1)} opacity={d > 0.99 ? 0.9 : 0} />
                  </g>
                );
              })}
            </g>
          );
        })}
    </g>
  );
};

export const Scene4: React.FC<{frame: number}> = ({frame}) => {
  const f = frame;
  const k = lerpS(f);
  const symDraw = easeOut(prog(f, 0, 44));
  const glow = smooth(prog(f, 40, 160));
  const fadeIn = 1 - smooth(prog(f, 0, 18));
  return (
    <AbsoluteFill style={{background: "#040504"}}>
      <svg width={W} height={H} style={{position: "absolute"}}>
        <HazeBG f={f} id="s4" />
        <g transform={`translate(${CENTER[0]} ${CENTER[1]}) scale(${k}) translate(${-CENTER[0]} ${-CENTER[1]})`}>
          <Symbol f={f} draw={symDraw} glow={glow} />
          <Constellation f={f} />
        </g>
        <rect width={W} height={H} fill="#040504" opacity={fadeIn} />
      </svg>
      <div style={{position: "absolute", left: 64, top: 1560, width: 960}}>
        <KLines frame={f} start={168} size={118} lines={[{t: "Behind the team."}]} color={C.porcelain} />
        <KLines frame={f} start={214} size={118} lines={[{t: "Behind the uniform.", c: C.lime}]} />
      </div>
    </AbsoluteFill>
  );
};
const lerpS = (f: number) => 1 + 0.1 * (f / 300);
