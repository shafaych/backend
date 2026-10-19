import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT, MONO, easeOut, easeInOut, easeBack, prog, mix, shake } from "../theme";
import { T, FPS } from "../timeline";
import { Flash, MaskLine, Tag, TechGrid } from "../components/Fx";
import { Jersey } from "../components/Jersey";
import { Box } from "../components/Box";

const SW = [
  { c: "#2B49D9", x: 300, at: 13.7 },
  { c: "#D7263D", x: 460, at: 14.05 },
  { c: "#E85D2A", x: 620, at: 99 },
  { c: "#333832", x: 780, at: 14.4 },
];
const JX = 170, JY = 520, JS = 1.85; // jersey screen placement (px) and scale
const toJ = (x: number, y: number) => ({ cx: (x - JX) / JS, cy: (y - JY) / JS });

const Cursor: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <g transform={`translate(${x} ${y}) scale(${1 - press * 0.12})`}>
    <path d="M0 0 L0 38 L10 29 L17 45 L25 41 L18 26 L31 26 Z" fill={C.carbon} stroke={C.white} strokeWidth="2.5" strokeLinejoin="round" />
  </g>
);

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // ---- phase values
  const arrive = prog(t, 13.0, 0.7, easeOut);
  // colour state
  const picks = SW.filter((s) => s.at < 50);
  let base = "#E4E4DE";
  let paint: { color: string; progress: number; cx: number; cy: number } | undefined;
  const started = picks.filter((p) => t >= p.at);
  if (started.length) {
    const cur = started[started.length - 1];
    const k = prog(t, cur.at, 0.5, easeInOut);
    const prev = started[started.length - 2];
    if (k >= 1) base = cur.c;
    else { base = prev ? prev.c : base; paint = { color: cur.c, progress: k, ...toJ(cur.x, 1590) }; }
  }
  const trim = t >= 14.4 ? C.white : "#CFCFC8";
  const panel = t >= 14.4 ? "#171917" : "#D7D7D0";
  const patK = prog(t, 14.5, 0.6, easeInOut);
  const numK = prog(t, 15.0, 0.18, easeBack);
  const slvK = prog(t, 15.18, 0.18, easeBack);
  const crestK = prog(t, 15.36, 0.2, easeBack);
  const stitch = prog(t, 15.45, 0.85, (x) => x);
  const labelK = prog(t, 16.15, 0.25, easeBack);

  // ---- camera (scene content): crest push, collar push, return, then packaging
  const zCrest = prog(t, 15.3, 0.35, easeInOut) - prog(t, 16.0, 0.3, easeInOut);
  const zCollar = prog(t, 16.1, 0.35, easeInOut) - prog(t, 16.7, 0.35, easeInOut);
  const crestPt = { x: JX + 262 * JS, y: JY + 118 * JS };
  const collarPt = { x: JX + 200 * JS, y: JY + 50 * JS };
  const camS = 1 + zCrest * 0.9 + zCollar * 1.75;
  const fx = crestPt.x * zCrest + collarPt.x * zCollar + 540 * (1 - zCrest - zCollar);
  const fy = crestPt.y * zCrest + collarPt.y * zCollar + 960 * (1 - zCrest - zCollar);
  const cam = `translate(540px, 960px) scale(${camS}) translate(${-fx}px, ${-fy}px)`;

  // ---- packaging: the jersey is handed from the stage into the box in box-local coordinates
  const boxIn = prog(t, 17.0, 0.6, easeOut);
  const boxY = mix(2300, 1180, boxIn) - prog(t, 19.35, 0.7, easeInOut) * 1500;
  const boxExit = prog(t, 19.35, 0.7, easeInOut);
  const BS = 1.25 + boxExit * 0.15;
  const lidOpen = 1 - prog(t, 18.05, 0.3, easeInOut);
  const tape = prog(t, 18.35, 0.3);
  const sticker = prog(t, 18.8, 0.25, easeBack);
  const dropK = prog(t, 17.45, 0.55, easeInOut);
  // jersey screen pose: starts exactly where the stage jersey sits, shrinks & drops into the box
  const jsStart = { cx: JX + 200 * JS, cy: JY + 235 * JS, w: 400 * JS };
  const jsEnd = { cx: 540 - 20 * BS, cy: 1180 + 95 * BS, w: 400 * 0.5 * BS };
  const jCx = mix(jsStart.cx, jsEnd.cx, dropK), jCy = mix(jsStart.cy, jsEnd.cy, dropK) , jW = mix(jsStart.w, jsEnd.w, dropK);
  const jsc = jW / 400 / BS;
  const jLocal = { x: (jCx - 540) / BS - 200 * jsc, y: (jCy - boxY) / BS - 235 * jsc, s: jsc };
  const inBox = t >= 17.05;
  const sh = shake(t, 18.0, 12, 10);

  // ---- headline word swap
  const word = t < T.label ? "DESIGN." : t < T.brand ? "LABEL." : "BRAND.";
  const wAt = t < T.label ? T.design : t < T.brand ? T.label : T.brand;
  const wk = prog(t, wAt, 0.5, easeOut);

  // ---- caption
  const caps: [number, string][] = [
    [13.4, "01 · COLOUR — SELECT"], [13.7, "01 · COLOUR — #2B49D9"], [14.05, "01 · COLOUR — #D7263D"], [14.4, "01 · COLOUR — #333832"],
    [14.5, "02 · PATTERN — CHEVRON / VOLT LIME"], [15.0, "03 · TEAM NUMBERS — 01–10"], [15.45, "04 · EMBROIDERY — CREST · LIME THREAD"],
    [16.15, "05 · PRIVATE-LABEL NECK BRANDING"], [17.0, "06 · PACKAGING — BRANDED BOX"], [18.8, "READY TO SHIP"],
  ];
  const cap = [...caps].reverse().find((c) => t >= c[0]) ?? caps[0];

  // cursor path
  const cpts: [number, number, number][] = [[13.3, 930, 1380], [13.68, 300, 1580], [14.03, 460, 1580], [14.38, 780, 1580], [14.8, 980, 1700]];
  let cx = cpts[0][1], cy = cpts[0][2];
  for (let i = 0; i < cpts.length - 1; i++) {
    const [t0, x0, y0] = cpts[i], [t1, x1, y1] = cpts[i + 1];
    if (t >= t0 && t <= t1) { const k = prog(t, t0, t1 - t0, easeInOut); cx = mix(x0, x1, k); cy = mix(y0, y1, k); }
    else if (t > t1) { cx = x1; cy = y1; }
  }
  const press = SW.some((s) => s.at < 50 && t > s.at - 0.05 && t < s.at + 0.12) ? 1 : 0;

  const dock = prog(t, 13.3, 0.5, easeOut) * (1 - prog(t, 14.5, 0.25, easeInOut));
  const patDock = prog(t, 14.62, 0.35, easeOut) * (1 - prog(t, 15.0, 0.25));

  // stamp rings
  const ring = (at: number, x: number, y: number) => {
    const k = prog(t, at, 0.5);
    return k > 0 && k < 1 ? <circle cx={x} cy={y} r={20 + k * 150} fill="none" stroke={C.lime} strokeWidth={5 * (1 - k)} opacity={1 - k} /> : null;
  };

  const outer = `translate(${sh.x}px, ${sh.y}px)`;

  return (
    <AbsoluteFill style={{ background: C.porcelain, overflow: "hidden", transform: outer }}>
      <TechGrid color={C.carbon} opacity={0.07} offsetY={frame * 0.6} />
      {/* ghost outline word */}
      <div style={{ position: "absolute", left: -20, top: 640, fontFamily: FONT, fontWeight: 900, fontSize: 560, letterSpacing: "-0.06em", color: "transparent", WebkitTextStroke: `2px rgba(23,25,23,.14)`, transform: `translateX(${-(t - 13) * 36}px) scaleX(.86)`, transformOrigin: "0 0", whiteSpace: "nowrap" }}>{word.replace(".", "")}</div>

      <Tag x={60} y={90} color={C.carbon} opacity={prog(t, 13.3, 0.4)}>[ 03 ] Brand studio</Tag>
      <Tag x={1020} y={90} align="right" color={C.carbon} opacity={0.9 * prog(t, 13.3, 0.4)}>Made by GHS Custom Gear</Tag>

      {/* headline: YOUR + swapping word */}
      <MaskLine t={t} at={13.2} size={190} y={150} x={56} width={1000} squeeze={0.84} color={C.carbon} dur={0.6}>YOUR</MaskLine>
      <div style={{ position: "absolute", left: 56, top: 316, height: 178, width: 1000, overflow: "hidden" }}>
        <div key={word} style={{ position: "absolute", left: 0, top: 0, display: "inline-block", background: C.carbon, width: ({ "DESIGN.": 640, "LABEL.": 500, "BRAND.": 530 } as Record<string, number>)[word], padding: "0 0 0 20px", boxSizing: "border-box", height: 176, transform: `translateY(${(1 - wk) * 110}%)`, overflow: "hidden" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 186, lineHeight: "176px", letterSpacing: "-0.045em", color: C.lime, transform: "scaleX(0.84)", transformOrigin: "0 50%", whiteSpace: "nowrap" }}>{word}</div>
        </div>
      </div>

      {/* camera group: jersey + effects */}
      <AbsoluteFill style={{ transform: cam, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: JX, top: JY, width: 400 * JS, transform: `translateY(${(1 - arrive) * 80}px) scale(${mix(0.9, 1, arrive)})`, transformOrigin: "50% 40%", opacity: inBox ? 0 : arrive, filter: "drop-shadow(0 40px 30px rgba(23,25,23,.28))" }}>
          <Jersey uid="s3" width={400 * JS} base={base} paint={paint} accent={C.lime} trim={trim} panel={panel}
            pattern="chevron" patternProgress={patK} number={t >= 15.0 ? "10" : null} numberProgress={numK} sleeveNumberProgress={slvK}
            crestProgress={crestK} blank={t < 14.4 && false} stitchProgress={stitch} neckLabel={labelK} sheen={t > 14.6 && t < 15.2 ? (t - 14.6) / 0.6 : -1} wordmark={t >= 15.36 ? "KESTREL" : ""} />
        </div>
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          {ring(15.0, 540, JY + 312 * JS)}
          {ring(15.18, JX + 48 * JS, JY + 150 * JS)}
          {ring(15.36, crestPt.x, crestPt.y)}
          {/* embroidery hoop */}
          {t > 15.3 && t < 16.2 && (
            <g opacity={prog(t, 15.3, 0.2) * (1 - prog(t, 16.0, 0.2))}>
              <circle cx={crestPt.x} cy={crestPt.y} r="82" fill="none" stroke={C.carbon} strokeWidth="5" strokeDasharray="2 0" opacity=".55" />
              <circle cx={crestPt.x} cy={crestPt.y} r="90" fill="none" stroke={C.lime} strokeWidth="2" strokeDasharray="6 8" />
            </g>
          )}
        </svg>
      </AbsoluteFill>

      {/* packaging */}
      {t > 16.95 && (
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(540 ${boxY}) scale(${BS}) rotate(${boxExit * -6})`}>
            <ellipse cx="20" cy="272" rx="260" ry="20" fill="#171917" opacity=".25" />
            <Box open={lidOpen} tape={tape} sticker={sticker}>
              <g transform={`translate(${jLocal.x} ${jLocal.y}) scale(${jLocal.s})`}>
                <Jersey uid="s3f" width={400} base="#333832" accent={C.lime} trim={C.white} panel="#171917" number="10" crestProgress={1} wordmark="KESTREL" pattern="chevron" stitchProgress={1} />
              </g>
            </Box>
          </g>
        </svg>
      )}

      {/* swatch dock */}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <g opacity={dock} transform={`translate(0 ${(1 - dock) * 60})`}>
          <line x1="180" y1="1668" x2="900" y2="1668" stroke={C.carbon} strokeWidth="2" opacity=".35" />
          {SW.map((s, i) => {
            const picked = (s.at < 50 && t >= s.at) || (t >= 14.4 && i === 3);
            return (
              <g key={i} transform={`translate(${s.x} 1590)`}>
                <circle r={picked ? 50 : 40} fill={s.c} stroke={C.carbon} strokeWidth={picked ? 4 : 0} />
                {picked && <circle r="62" fill="none" stroke={C.lime} strokeWidth="3" />}
              </g>
            );
          })}
        </g>
        {/* pattern dock */}
        <g opacity={patDock} transform={`translate(0 ${(1 - patDock) * 60})`}>
          {["chevron", "sash", "hoops"].map((p, i) => (
            <g key={p} transform={`translate(${340 + i * 200} 1590)`}>
              <rect x="-62" y="-52" width="124" height="104" rx="8" fill="#333832" stroke={i === 0 ? C.lime : "none"} strokeWidth="4" />
              {p === "chevron" && <path d="M-40 -8 L0 18 L40 -8 M-40 12 L0 38 L40 12" stroke={C.lime} strokeWidth="9" fill="none" />}
              {p === "sash" && <polygon points="-40,-34 -8,-34 40,34 8,34" fill={C.white} />}
              {p === "hoops" && [-28, 0, 28].map((y) => <rect key={y} x="-40" y={y - 7} width="80" height="14" fill={C.white} />)}
            </g>
          ))}
        </g>
        {dock > 0.1 && <Cursor x={cx} y={cy} press={press} />}
      </svg>

      {/* live spec caption */}
      <div style={{ position: "absolute", left: 60, bottom: 76, fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 1, color: C.carbon, opacity: prog(t, 13.4, 0.4) * (1 - prog(t, 19.5, 0.4)), whiteSpace: "nowrap" }}>
        <span style={{ background: C.carbon, color: C.lime, padding: "6px 10px", marginRight: 14 }}>{cap[1].split(" — ")[0]}</span>{cap[1].includes(" — ") ? cap[1].split(" — ")[1] : ""}
      </div>
      <Flash t={t} at={13.3} peak={0.0} />
      <Flash t={t} at={18.0} peak={0.1} color={C.lime} decay={14} />
    </AbsoluteFill>
  );
};
