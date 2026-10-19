import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT, MONO, easeOut, easeInOut, easeBack, prog, mix } from "../theme";
import { T, FPS } from "../timeline";
import { Flash, Tag, TechGrid } from "../components/Fx";
import { bodyPath } from "../components/Jersey";
import { Crest } from "../components/Crest";

const TAGS = [
  { at: T.tag1, text: "IN-HOUSE MANUFACTURING" },
  { at: T.tag2, text: "CUSTOM TEAMWEAR" },
  { at: T.tag3, text: "PRIVATE LABEL" },
  { at: T.tag4, text: "LOW MOQ — 10 PIECES" },
];
const GX = 190, GY = 470, GS = 1.7; // garment placement in the camera group
const SEAMS = ["M100 46 L100 146", "M300 46 L300 146", "M100 146 L100 436", "M300 146 L300 436", "M140 150 L140 436", "M260 150 L260 436", "M24 104 L60 174", "M376 104 L340 174"];

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const draw = prog(t, 27.2, 1.4, easeInOut);
  const seamK = prog(t, 28.0, 1.0, easeInOut);
  const fillK = prog(t, 28.0, 1.2);

  const active = [...TAGS].reverse().find((g) => t >= g.at);
  const idx = active ? TAGS.indexOf(active) : -1;
  const k = (i: number) => prog(t, TAGS[i].at, 0.5, easeOut);

  // camera keyframes (focus point in garment units, zoom)
  const kf = [
    { t: 27.0, fx: 200, fy: 235, z: 1.0 }, { t: 28.4, fx: 200, fy: 235, z: 1.08 }, { t: 29.3, fx: 200, fy: 200, z: 1.25 },
    { t: 30.3, fx: 200, fy: 200, z: 1.25 }, { t: 30.85, fx: 200, fy: 60, z: 1.9 }, { t: 31.3, fx: 200, fy: 60, z: 1.9 },
    { t: 31.8, fx: 200, fy: 400, z: 1.5 }, { t: 33.0, fx: 200, fy: 300, z: 1.12 },
  ];
  let c = kf[0];
  for (let i = 0; i < kf.length - 1; i++) {
    if (t >= kf[i].t) {
      const kk = prog(t, kf[i].t, kf[i + 1].t - kf[i].t, easeInOut);
      c = { t, fx: mix(kf[i].fx, kf[i + 1].fx, kk), fy: mix(kf[i].fy, kf[i + 1].fy, kk), z: mix(kf[i].z, kf[i + 1].z, kk) };
    }
  }
  if (t >= kf[kf.length - 1].t) c = kf[kf.length - 1];
  const gx = (u: number) => GX + u * GS, gy = (v: number) => GY + v * GS;
  const cam = `translate(540px, 915px) scale(${c.z}) rotateY(${Math.sin(t * 0.5) * 5}deg) translate(${-gx(c.fx)}px, ${-gy(c.fy)}px)`;
  const d = bodyPath(0);
  const march = -frame * 1.2;

  return (
    <AbsoluteFill style={{ background: C.graphite, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, #3e443d 0%, #262a25 75%)" }} />
      <TechGrid opacity={0.09} step={60} offsetY={frame * 0.4} />
      <Tag x={60} y={90} color={C.lime} opacity={prog(t, 27.3, 0.4)}>[ 05 ] Manufacturing partner</Tag>
      <Tag x={1020} y={90} align="right" opacity={0.5 * prog(t, 27.3, 0.4)}>GHS Custom Gear</Tag>
      <div style={{ position: "absolute", left: 60, top: 150, fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 0.95, letterSpacing: "-0.04em", color: C.white, transform: "scaleX(.88)", transformOrigin: "0 0", opacity: prog(t, 27.4, 0.5), whiteSpace: "nowrap" }}>
        <span style={{ display: "block", overflow: "hidden", height: 90 }}><span style={{ display: "block", transform: `translateY(${(1 - prog(t, 27.4, 0.6)) * 100}%)` }}>YOUR MANUFACTURING</span></span>
        <span style={{ display: "block", overflow: "hidden", height: 90 }}><span style={{ display: "block", color: C.lime, transform: `translateY(${(1 - prog(t, 27.55, 0.6)) * 100}%)` }}>PARTNER.</span></span>
      </div>

      {/* camera group with 3D perspective */}
      <AbsoluteFill style={{ perspective: 1800, perspectiveOrigin: "50% 50%", clipPath: "inset(440px 0 530px 0)" }}>
        <div style={{ position: "absolute", inset: 0, transform: cam, transformOrigin: "0 0" }}>
          <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <g transform={`translate(${GX} ${GY}) scale(${GS})`}>
              {/* registration ring + scan sweep: gives the opening seconds of the drawing purposeful motion */}
              <g transform="translate(200 235)" opacity={0.4 * prog(t, 27.2, 0.6)}>
                <circle r="285" fill="none" stroke={C.lime} strokeWidth="1" strokeDasharray="3 9" transform={`rotate(${t * 14})`} />
                <circle r="250" fill="none" stroke={C.white} strokeWidth="0.6" strokeOpacity=".5" />
                <path d="M-300 0 H-262 M262 0 H300 M0 -300 V-262 M0 262 V300" stroke={C.lime} strokeWidth="1.4" />
              </g>
              {t > 27.4 && t < 29.6 && (
                <g opacity={Math.sin(prog(t, 27.4, 2.2, (x) => x) * Math.PI)}>
                  <rect x="-30" y={-20 + prog(t, 27.4, 2.2, easeInOut) * 500} width="460" height="3" fill={C.lime} />
                  <rect x="-30" y={-20 + prog(t, 27.4, 2.2, easeInOut) * 500 - 36} width="460" height="36" fill="url(#scanG)" />
                </g>
              )}
              <defs><linearGradient id="scanG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={C.lime} stopOpacity="0" /><stop offset="1" stopColor={C.lime} stopOpacity=".28" /></linearGradient></defs>
              <path d={d} fill={`rgba(255,255,255,${0.05 * fillK})`} />
              <path d={d} fill="none" stroke={C.white} strokeWidth="1.6" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} strokeLinejoin="round" />
              <g stroke={C.white} strokeOpacity=".5" strokeWidth="1.1" fill="none">
                {SEAMS.map((s, i) => <path key={i} d={s} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - seamK} />)}
                <path d="M148 31 Q200 98 252 31" strokeWidth="9" strokeOpacity=".35" />
                <path d="M100 424 Q200 440 300 424" strokeDasharray="4 3" />
              </g>
              {/* measurement guides */}
              <g stroke={C.lime} strokeWidth="1" fill="none" opacity={0.55 * prog(t, 28.2, 0.6)}>
                <path d="M100 -12 L300 -12 M100 -18 L100 -6 M300 -18 L300 -6" />
                <path d="M-10 46 L-10 436 M-16 46 L-4 46 M-16 436 L-4 436" />
                <text x="200" y="-20" textAnchor="middle" fontFamily={MONO} fontSize="9" fill={C.lime} stroke="none" letterSpacing="2">A</text>
                <text x="-24" y="245" fontFamily={MONO} fontSize="9" fill={C.lime} stroke="none" letterSpacing="2">B</text>
              </g>

              {/* 1 — in-house: stitched outline marches */}
              {idx >= 0 && (
                <path d={d} fill="none" stroke={C.lime} strokeWidth={idx === 0 ? 3 : 1.4} strokeDasharray="7 5" strokeDashoffset={march} opacity={(idx === 0 ? 1 : 0.35) * k(0)} />
              )}
              {idx >= 0 && idx === 0 && SEAMS.slice(0, 6).map((s, i) => <path key={i} d={s} stroke={C.lime} strokeWidth="2" strokeDasharray="5 4" strokeDashoffset={march} fill="none" opacity={k(0)} />)}

              {/* 2 — custom teamwear: number + crest */}
              {idx >= 1 && (
                <g opacity={k(1)}>
                  <text x="200" y="312" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="118" letterSpacing="-4" fill="none" stroke={C.white} strokeWidth="2">10</text>
                  <g transform="translate(262 118)"><Crest size={38} fill="none" ink={C.lime} /><polygon points="0,-20 17.3,-10 17.3,10 0,20 -17.3,10 -17.3,-10" fill="none" stroke={C.lime} strokeWidth="2" /></g>
                  <text x="200" y="176" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="15" letterSpacing="4" fill={C.white} opacity=".8">YOUR BRAND</text>
                </g>
              )}
              {/* 3 — private label tag */}
              {idx >= 2 && (
                <g transform="translate(200 41)" opacity={k(2)}>
                  <rect x="-31" y="-11" width="62" height="23" fill={C.porcelain} />
                  <text y="-0.5" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="7.2" letterSpacing="1.2" fill="#171917">YOUR BRAND</text>
                  <text y="8" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="3.6" letterSpacing="0.6" fill="#171917">PRIVATE LABEL · M</text>
                  <circle r={22 + 12 * ((t * 1.3) % 1)} fill="none" stroke={C.lime} strokeWidth="1.2" opacity={1 - ((t * 1.3) % 1)} />
                </g>
              )}
              {/* 4 — low MOQ badge on hem */}
              {idx >= 3 && (
                <g transform={`translate(200 ${400}) scale(${prog(t, T.tag4, 0.4, easeBack)})`}>
                  <rect x="-70" y="-24" width="140" height="48" fill={C.lime} />
                  <text y="12" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="34" fill={C.carbon} letterSpacing="-1">MOQ 10</text>
                </g>
              )}
            </g>
          </svg>
        </div>
      </AbsoluteFill>

      {/* capability list */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1400 }}>
        {TAGS.map((g, i) => {
          const kk = Math.max(0.3 * prog(t, 27.6 + i * 0.1, 0.5, easeOut), prog(t, g.at, 0.5, easeOut));
          const on = idx === i;
          return (
            <div key={g.text} style={{ height: 90, borderTop: `2px solid rgba(255,255,255,${0.18 * kk})`, display: "flex", alignItems: "center", gap: 26, opacity: kk, transform: `translateX(${(1 - kk) * -60}px)` }}>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.lime, width: 54 }}>0{i + 1}</span>
              <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 56, letterSpacing: "-0.03em", color: on ? C.lime : C.white, opacity: t < g.at ? 0.5 : on ? 1 : 0.55, transform: "scaleX(.9)", transformOrigin: "0 50%", whiteSpace: "nowrap" }}>{g.text}</span>
            </div>
          );
        })}
      </div>
      <Tag x={60} y={1780} size={24} opacity={0.7} spacing={1}>Illustrative technical drawing.</Tag>
      <Flash t={t} at={27.0} peak={0.3} color={C.lime} decay={10} />
    </AbsoluteFill>
  );
};
