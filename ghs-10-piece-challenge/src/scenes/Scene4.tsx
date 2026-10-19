import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT, MONO, easeOut, easeInOut, easeBack, prog, mix, rand, shake } from "../theme";
import { T, FPS } from "../timeline";
import { Flash, MaskLine, Tag, TechGrid } from "../components/Fx";
import { Crest } from "../components/Crest";

const COUNTS = [
  { n: 10, at: T.c10 }, { n: 25, at: T.c25 }, { n: 50, at: T.c50 }, { n: 100, at: T.c100 },
];

/** Tiny folded-jersey tile. */
const Tile: React.FC<{ x: number; y: number; s: number; fill: string; ink: string; k: number }> = ({ x, y, s, fill, ink, k }) => (
  <g transform={`translate(${x} ${y}) scale(${s * k})`} opacity={Math.min(1, k * 3)}>
    <path d="M-34 -30 L-14 -38 Q0 -26 14 -38 L34 -30 L44 -6 L26 2 L26 36 L-26 36 L-26 2 L-44 -6 Z" fill={fill} />
    <path d="M-26 8 L0 22 L26 8" stroke={ink} strokeWidth="6" fill="none" />
    <path d="M-14 -38 Q0 -26 14 -38" stroke={ink} strokeWidth="4" fill="none" />
  </g>
);

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cur = [...COUNTS].reverse().find((c) => t >= c.at) ?? { n: 0, at: 99 };
  const prev = COUNTS[Math.max(0, COUNTS.indexOf(cur) - 1)];
  const roll = prog(t, cur.at, 0.5, easeOut);
  const shown = cur.n === 0 ? 0 : Math.round(mix(cur === COUNTS[0] ? 0 : prev.n, cur.n, roll));
  const sh = shake(t, T.thinkBig, 40, 7);
  const sh2 = shake(t, T.startSmall, 22, 8);

  // grid cell state
  const cellN = (i: number) => {
    // 10x10 raster, reading order from bottom-left... lit if i < current count
    const lit = i < Math.round(shown);
    const stage = i < 10 ? 0 : i < 25 ? 1 : i < 50 ? 2 : 3;
    const born = COUNTS[stage].at + (i - [0, 10, 25, 50][stage]) * 0.012;
    return { lit, k: prog(t, born, 0.35, easeBack), stage };
  };
  const colors = [C.lime, C.white, "#9AA39A", "#5C655C"];
  const gridFade = 1 - 0.78 * prog(t, T.startSmall, 0.4);
  const gridBurst = prog(t, T.thinkBig, 0.8, easeOut);

  // order-flow diagram
  const nodes = [{ x: 120, l: "DESIGN" }, { x: 330, l: "SAMPLE" }, { x: 540, l: "PRODUCE" }, { x: 750, l: "PACK" }, { x: 960, l: "SHIP" }];
  const flow = prog(t, 20.3, 0.8);
  const boxes = Math.min(5, Math.floor(shown / 10) + (shown > 0 ? 1 : 0));

  const big = prog(t, T.startSmall, 0.5, easeOut);
  return (
    <AbsoluteFill style={{ background: C.carbon, overflow: "hidden", transform: `translate(${sh.x + sh2.x}px, ${sh.y + sh2.y}px)` }}>
      <TechGrid opacity={0.05} offsetY={frame} />
      <Tag x={60} y={90} color={C.lime} opacity={prog(t, 20.3, 0.4)}>[ 04 ] Ready to grow</Tag>
      <Tag x={1020} y={90} align="right" opacity={0.5 * prog(t, 20.3, 0.4)}>Illustrative scenario</Tag>

      {/* counter */}
      <div style={{ position: "absolute", left: 50, top: 150, opacity: 1 - big * 0.85, transform: `translateY(${-big * 60}px)` }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 380, lineHeight: 0.9, letterSpacing: "-0.06em", color: C.lime, transform: "scaleX(0.9)", transformOrigin: "0 50%", textShadow: `0 0 70px rgba(200,243,107,${0.25 + 0.3 * Math.exp(-(t - cur.at) * 4)})` }}>{shown}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: C.white, marginTop: 6 }}>PIECES · ILLUSTRATIVE ORDER SIZE</div>
      </div>

      {/* 10×10 garment raster */}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: gridFade }}>
        <g transform={`translate(${90 + 45} ${545 + 45})`}>
          {Array.from({ length: 100 }, (_, i) => {
            const col = i % 10, row = 9 - Math.floor(i / 10);
            const c = cellN(i);
            const ang = rand(i + 1) * Math.PI * 2;
            const bx = Math.cos(ang) * gridBurst * (500 + rand(i) * 700), by = Math.sin(ang) * gridBurst * (700 + rand(i + 9) * 800);
            const unlit = !c.lit;
            return <Tile key={i} x={col * 90 + bx} y={row * 90 + by} s={0.98} fill={c.lit ? colors[c.stage] : "#2a2e29"} ink={c.lit ? C.carbon : "#3a3f39"} k={unlit ? Math.max(0.0, prog(t, 20.3 + i * 0.004, 0.4)) : c.k} />;
          })}
        </g>
        {/* order flow */}
        <g transform="translate(0 1630)" opacity={flow}>
          <path d="M120 0 L960 0" stroke={C.white} strokeWidth="2" strokeOpacity=".3" />
          <path d="M120 0 L960 0" stroke={C.lime} strokeWidth="4" strokeDasharray={`18 ${600}`} strokeDashoffset={-((frame * 14) % 1200)} />
          {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={120 + ((frame * 7 + i * 140) % 840)} cy="0" r="7" fill={C.lime} opacity={0.9} />)}
          {nodes.map((n, i) => (
            <g key={n.l} transform={`translate(${n.x} 0)`}>
              <circle r="20" fill={C.carbon} stroke={C.lime} strokeWidth="3" />
              <circle r="8" fill={C.lime} />
              <text y="-44" textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize="20" letterSpacing="3" fill={C.white}>{n.l}</text>
            </g>
          ))}
          {/* branded boxes multiply on the PACK node */}
          {Array.from({ length: boxes }, (_, i) => (
            <g key={i} transform={`translate(${750 + (i % 3) * 58 - 58} ${-96 - Math.floor(i / 3) * 52 + 140 * (1 - prog(t, [20.5, 21.5, 22.4, 23.3, 23.6][i], 0.35, easeBack))})`}>
              <rect x="-26" y="-22" width="52" height="44" fill="#22251f" stroke={C.lime} strokeWidth="2" />
              <g transform="scale(.6)"><Crest size={34} fill={C.lime} ink={C.carbon} /></g>
            </g>
          ))}
        </g>
      </svg>

      {/* START SMALL / THINK BIG */}
      <AbsoluteFill style={{ opacity: t >= T.startSmall ? 1 : 0 }}>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(23,25,23,${0.85 * big}) 0%, rgba(23,25,23,${0.85 * big}) 100%)` }} />
        <MaskLine t={t} at={T.startSmall} size={250} y={560} x={56} width={1000} squeeze={0.82} dur={0.5}>START</MaskLine>
        <MaskLine t={t} at={T.startSmall + 0.08} size={250} y={790} x={56} width={1000} squeeze={0.82} dur={0.5}>SMALL.</MaskLine>
        {t >= T.thinkBig && (
          <div style={{ position: "absolute", left: 0, top: 1060, width: 1080, transform: `scale(${mix(1.8, 1, prog(t, T.thinkBig, 0.35))})`, transformOrigin: "50% 30%" }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 330, lineHeight: 0.88, letterSpacing: "-0.06em", color: C.lime, transform: "scaleX(0.84)", textAlign: "center", whiteSpace: "nowrap", textShadow: "0 0 80px rgba(200,243,107,.4)" }}>THINK<br />BIG.</div>
          </div>
        )}
      </AbsoluteFill>
      <Tag x={60} y={1760} size={18} opacity={0.65 * prog(t, 20.4, 0.5)} spacing={2}>Illustrative scenario only — not a customer case study.</Tag>
      <Tag x={60} y={1790} size={18} opacity={0.65 * prog(t, 20.4, 0.5)} spacing={2}>Lead times and production capacity vary by order.</Tag>

      <Flash t={t} at={T.startSmall} peak={0.3} decay={12} />
      <Flash t={t} at={T.thinkBig} peak={0.75} decay={9} color={C.lime} />
    </AbsoluteFill>
  );
};
