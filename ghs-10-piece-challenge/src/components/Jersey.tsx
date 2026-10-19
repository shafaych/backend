import React from "react";
import { C, FONT } from "../theme";
import { Crest } from "./Crest";

export type Pattern = "none" | "chevron" | "sash" | "hoops" | "shards";

export type JerseyProps = {
  uid: string;
  width?: number;
  base: string;
  accent: string;
  trim: string;
  panel?: string; // side-panel colour
  pattern?: Pattern;
  patternProgress?: number; // 0..1 diagonal wipe
  number?: string | null;
  numberProgress?: number;
  sleeveNumberProgress?: number;
  crestProgress?: number;
  wordmark?: string;
  stitchProgress?: number; // embroidery stroke around crest
  sway?: number; // -1..1 cloth swing
  sheen?: number; // 0..1 position of light sweep, <0 = off
  line?: number; // 0..1 technical line-art mode (0 = solid fabric)
  paint?: { color: string; progress: number; cx: number; cy: number }; // circular dye-in
  blank?: boolean;
  neckLabel?: number; // 0..1 private-label tag inside the collar
};

export const JERSEY_VB = { w: 400, h: 470 };

export const bodyPath = (s: number) => {
  const sx = s * 5, sy = s * 4;
  const L = (x: number, y: number) => `${x} ${y}`;
  return (
    `M150 30 L100 46 L${24 - sx} ${104 + sy} L${60 - sx} ${174 + sy} L100 146 L100 436 Q200 452 300 436 L300 146 ` +
    `L${340 + sx} ${174 + sy} L${376 + sx} ${104 + sy} L300 46 L250 30 Q200 92 150 30 Z`
  );
};

export const Jersey: React.FC<JerseyProps> = (p) => {
  const {
    uid, width = 300, base, accent, trim, panel, pattern = "chevron", patternProgress = 1,
    number = null, numberProgress = 1, sleeveNumberProgress = 0, crestProgress = 1, wordmark = "KESTREL",
    stitchProgress = 0, sway = 0, sheen = -1, line = 0, paint, blank = false, neckLabel = 0,
  } = p;
  const sx = sway * 5, sy = sway * 4;
  const d = bodyPath(sway);
  const pc = panel ?? accent;
  const id = (n: string) => `${n}-${uid}`;
  const fabric = line > 0.5 ? "none" : base;
  const sw = (x: number) => x; // readability
  // diagonal wipe window for pattern reveal
  const wipeX = -520 + patternProgress * 1040;

  return (
    <svg width={width} height={(width * JERSEY_VB.h) / JERSEY_VB.w} viewBox={`0 0 ${JERSEY_VB.w} ${JERSEY_VB.h}`} style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={id("body")}><path d={d} /></clipPath>
        <clipPath id={id("wipe")}>
          <polygon points={`${wipeX - 260},-80 ${wipeX + 80},-80 ${wipeX - 80},560 ${wipeX - 420},560`} />
        </clipPath>
        <linearGradient id={id("shade")} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".34" />
          <stop offset=".22" stopColor="#000" stopOpacity=".05" />
          <stop offset=".55" stopColor="#fff" stopOpacity=".10" />
          <stop offset=".78" stopColor="#000" stopOpacity=".06" />
          <stop offset="1" stopColor="#000" stopOpacity=".36" />
        </linearGradient>
        <linearGradient id={id("hem")} x1="0" x2="0" y1="0" y2="1">
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".32" />
        </linearGradient>
        <linearGradient id={id("sheenG")} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <pattern id={id("mesh")} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="1.5" cy="1.5" r="0.95" fill="#000" opacity=".20" />
          <circle cx="4.5" cy="4.5" r="0.95" fill="#fff" opacity=".12" />
        </pattern>
        <clipPath id={id("paint")}>
          {paint && <circle cx={paint.cx} cy={paint.cy} r={paint.progress * 620} />}
        </clipPath>
      </defs>

      {/* drop shadow */}
      {line < 0.5 && <ellipse cx="200" cy="462" rx="120" ry="9" fill="#000" opacity=".28" />}

      {/* fabric base */}
      <path d={d} fill={fabric} />
      {paint && line < 0.5 && <path d={d} fill={paint.color} clipPath={`url(#${id("paint")})`} />}

      <g clipPath={`url(#${id("body")})`} style={{ opacity: 1 - line }}>
        {/* side panels */}
        <rect x="100" y="140" width="40" height="320" fill={pc} opacity={blank ? 0 : 0.95} />
        <rect x="260" y="140" width="40" height="320" fill={pc} opacity={blank ? 0 : 0.95} />
        {/* sleeve cuffs */}
        <polygon points={`${24 - sx},${104 + sy} ${60 - sx},${174 + sy} ${72.4 - sx},${167.6 + sy} ${36.4 - sx},${97.6 + sy}`} fill={trim} />
        <polygon points={`${376 + sx},${104 + sy} ${340 + sx},${174 + sy} ${327.6 + sx},${167.6 + sy} ${363.6 + sx},${97.6 + sy}`} fill={trim} />
        {/* patterns, revealed by a diagonal wipe */}
        <g clipPath={`url(#${id("wipe")})`}>
          {pattern === "chevron" && [0, 1, 2].map((i) => (
            <path key={i} d={`M100 ${196 + i * 46} L200 ${254 + i * 46} L300 ${196 + i * 46}`} stroke={accent} strokeWidth={i === 1 ? 14 : 22} fill="none" opacity={1 - i * 0.18} strokeLinejoin="miter" />
          ))}
          {pattern === "sash" && <polygon points="100,170 168,170 300,318 300,396 232,396 100,248" fill={accent} />}
          {pattern === "hoops" && [0, 1, 2, 3].map((i) => <rect key={i} x="100" y={190 + i * 56} width="200" height="26" fill={accent} />)}
          {pattern === "shards" && (
            <g fill={accent}>
              <polygon points="100,436 100,300 190,436" />
              <polygon points="300,436 300,330 232,436" opacity=".85" />
              <polygon points="100,210 100,170 160,170" opacity=".9" />
            </g>
          )}
        </g>
        {/* texture + light */}
        <rect x="0" y="0" width="400" height="470" fill={`url(#${id("mesh")})`} />
        <rect x="0" y="0" width="400" height="470" fill={`url(#${id("shade")})`} />
        <rect x="0" y="0" width="400" height="470" fill={`url(#${id("hem")})`} />
        {/* seams */}
        <g stroke="#000" strokeOpacity=".4" strokeWidth="1.2" fill="none">
          <path d={`M100 46 L100 146 M300 46 L300 146`} />
          <path d="M100 146 L100 436 M300 146 L300 436" />
          <path d="M140 150 L140 436 M260 150 L260 436" strokeDasharray="4 3" strokeOpacity=".28" />
          <path d={`M${24 - sx + 6} ${104 + sy + 2} L100 146 M${376 + sx - 6} ${104 + sy + 2} L300 146`} strokeOpacity=".22" strokeDasharray="3 3" />
        </g>
        <g stroke="#fff" strokeOpacity=".16" strokeWidth="1" fill="none">
          <path d="M102 46 L102 146 M298 46 L298 146 M102 150 L102 436 M298 150 L298 436" />
        </g>
        {/* hem band */}
        <path d="M100 420 Q200 436 300 420 L300 436 Q200 452 100 436 Z" fill={trim} opacity={blank ? 0.5 : 1} />
        {/* chest graphics */}
        {!blank && wordmark && crestProgress > 0.01 && (
          <text x="200" y="176" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="13" letterSpacing="4" fill={trim} opacity={crestProgress * 0.75}>{wordmark}</text>
        )}
        {number && (
          <g transform={`translate(200 ${312 - (1 - numberProgress) * 0}) scale(${1 + (1 - numberProgress) * 0.5})`} opacity={numberProgress} style={{ transformOrigin: "200px 312px" }}>
            <text x="0" y="0" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={number.length > 1 ? 118 : 130} letterSpacing="-4" fill={trim} stroke={base} strokeWidth="0" >{number}</text>
          </g>
        )}
        {sleeveNumberProgress > 0 && (
          <text x={48 - sx} y={150 + sy} fontFamily={FONT} fontWeight={900} fontSize="30" fill={trim} opacity={sleeveNumberProgress} transform={`rotate(-54 ${48 - sx} ${150 + sy})`} textAnchor="middle">{number ?? "10"}</text>
        )}
        <g transform="translate(262 118)">
          <Crest size={32} fill={trim} ink={base} progress={crestProgress} />
          {stitchProgress > 0 && (
            <polygon points="0,-24 20.8,-12 20.8,12 0,24 -20.8,12 -20.8,-12" fill="none" stroke={C.lime} strokeWidth="2.2" strokeDasharray="5 3.5" pathLength={1}
              style={{ strokeDasharray: `${stitchProgress * 140} 400` }} />
          )}
        </g>
        {/* light sheen */}
        {sheen >= 0 && (
          <g transform={`translate(${-320 + sheen * 860} 0) skewX(-18)`} opacity=".7">
            <rect x="0" y="0" width="120" height="480" fill={`url(#${id("sheenG")})`} />
          </g>
        )}
      </g>

      {/* collar */}
      <g style={{ opacity: 1 - line }}>
        <path d="M150 30 Q200 92 250 30 Q200 12 150 30 Z" fill="#000" opacity=".55" />
        {neckLabel > 0 && (
          <g transform={`translate(200 41) scale(${neckLabel})`} opacity={Math.min(1, neckLabel * 2)}>
            <rect x="-31" y="-11" width="62" height="23" fill={C.porcelain} />
            <rect x="-29" y="-9" width="58" height="19" fill="none" stroke="#171917" strokeWidth=".6" strokeDasharray="1.6 1.2" />
            <text x="0" y="-0.5" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="8.4" letterSpacing="1.4" fill="#171917">KESTREL</text>
            <text x="0" y="8" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="3.6" letterSpacing="0.6" fill="#171917">PRIVATE LABEL · M</text>
          </g>
        )}
        <path d="M148 31 Q200 98 252 31" stroke={trim} strokeWidth="13" fill="none" strokeLinecap="butt" />
        <path d="M146 34 Q200 102 254 34" stroke="#000" strokeOpacity=".18" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
      </g>

      {/* technical line-art mode */}
      {line > 0 && (
        <g fill="none" stroke={C.lime} strokeWidth="2" opacity={line}>
          <path d={d} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - line} strokeLinejoin="round" style={{ strokeDasharray: 1 }} />
        </g>
      )}
    </svg>
  );
};
