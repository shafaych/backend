import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, MONO, easeIn, easeOut, prog, shake, rand, mix } from "../theme";
import { T, FPS } from "../timeline";
import { Flash, Glitch, MaskLine, Tag, TechGrid } from "../components/Fx";
import { BigTen } from "../components/BigTen";

const fmt = (n: number) => (n >= 1000 ? `${Math.floor(n / 1000)},${String(Math.round(n % 1000)).padStart(3, "0")}` : String(Math.round(n)));

const Slam: React.FC<{ text: string; size: number; k: number; color?: string; qColor?: string; y?: number; frame: number; gl?: number }> = ({ text, size, k, color = C.white, qColor = C.lime, y = 900, frame, gl = 0 }) => {
  const body = text.endsWith("?") ? text.slice(0, -1) : text;
  return (
    <div style={{ position: "absolute", left: 0, top: y - size * 0.55, width: 1080, textAlign: "center", transform: `scale(${mix(2.4, 1, k)})`, opacity: Math.min(1, k * 6) }}>
      <Glitch frame={frame} intensity={gl}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: "-0.055em", color, display: "inline-block", transform: "scaleX(0.88)", whiteSpace: "nowrap" }}>
          {body}<span style={{ color: qColor }}>?</span>
        </div>
      </Glitch>
    </div>
  );
};

/** Scrolling "red tape" rows of minimum-order jargon. */
const Tape: React.FC<{ frame: number; opacity: number; rows?: number }> = ({ frame, opacity, rows = 26 }) => (
  <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
    {Array.from({ length: rows }, (_, i) => {
      const dir = i % 2 ? 1 : -1;
      const txt = i % 3 === 0 ? "MOQ 500 PCS  ·  MOQ 1,000 PCS  ·  MOQ 2,500 PCS  ·  " : i % 3 === 1 ? "MINIMUM ORDER  ·  SETUP FEES  ·  BULK ONLY  ·  " : "TOO MANY PIECES  ·  TOO MUCH STOCK  ·  TOO MUCH RISK  ·  ";
      return <div key={i} style={{ position: "absolute", top: 20 + i * 74, left: 0, whiteSpace: "nowrap", fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: i % 5 === 0 ? C.lime : C.white, opacity: i % 5 === 0 ? 0.5 : 0.22, transform: `translateX(${dir * frame * (6 + (i % 4) * 3) - 1200 * (dir > 0 ? 1 : 0)}px)` }}>{txt.repeat(8)}</div>;
    })}
  </AbsoluteFill>
);

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // ---- phases
  const inA = t < 1.5;            // "500?" + rush
  const inB = t >= 1.5 && t < 2.55;
  const inC = t >= 2.55 && t < 3.6;
  const inD = t >= 3.7;

  // camera
  const sh = shake(t, T.n500, 18, 10);
  const sh2 = shake(t, T.n1000, 28, 9);
  const sh3 = shake(t, T.tooMany, 40, 6);
  const sh4 = shake(t, T.ten, 46, 7);
  const cam = {
    x: sh.x + sh2.x + sh3.x + sh4.x, y: sh.y + sh2.y + sh3.y + sh4.y, r: sh.r + sh2.r + sh3.r + sh4.r,
  };

  // "500?" slam then rush to 1000
  const k500 = prog(t, T.n500, 0.22);
  const rush = prog(t, 1.0, 0.5, easeIn);
  const value = rush > 0 ? mix(500, 1000, rush) : 500;
  const slam1000 = prog(t, T.n1000, 0.2);
  const glRush = t >= 0.95 && t < 1.5 ? 0.5 + 0.5 * rush : t >= 1.5 && t < 1.95 ? Math.max(0, 1 - (t - 1.5) / 0.45) * 0.9 : 0;
  const pulse = 1 + 0.015 * Math.sin(t * 9);

  // TOO MANY — pressure
  const kTM = prog(t, T.tooMany, 0.18);
  const press = prog(t, T.tooMany, 1.0, (x) => x * x);
  const glTM = t >= T.tooMany && t < 2.9 ? 1 - (t - T.tooMany) / 0.35 : press * 0.55 * (rand(frame) > 0.4 ? 1 : 0.2);

  // WHAT IF → 10
  const kTen = prog(t, T.ten, 0.28, easeOut);
  const settle = t > T.ten ? 1 + 0.02 * Math.sin((t - T.ten) * 3.2) : 1;
  const push = 1 + 0.07 * prog(t, T.ten + 0.3, 1.5, (x) => x);
  const tenScale = mix(3.2, 1, kTen) * settle;

  const flashOpacity = 0;

  return (
    <AbsoluteFill style={{ background: C.carbon, overflow: "hidden" }}>
      <TechGrid opacity={0.05} offsetY={frame * 2} />

      <AbsoluteFill style={{ transform: `translate(${cam.x}px,${cam.y}px) rotate(${cam.r}rad) scale(${inC ? 1 + press * 0.3 : 1})` }}>
        {/* section tag */}
        <Tag x={60} y={90} color={C.lime} size={22} opacity={prog(t, 0.1, 0.3) * (inD ? 0.8 : 1)}>[ 01 ] Minimum order quantity</Tag>
        <Tag x={1020} y={90} align="right" color={C.white} size={22} opacity={0.5 * prog(t, 0.1, 0.3)}>Sportswear · Start-up</Tag>

        {/* ---- 500? / 1,000? */}
        {inA && t >= T.n500 && (
          <>
            <Tape frame={frame} opacity={0.35 * prog(t, 0.9, 0.5)} />
            {/* echo outlines */}
            {t > T.n500 + 0.15 && [1, 2, 3, 4].map((i) => (
              <div key={i} style={{ position: "absolute", left: 0, top: 900 - 260, width: 1080, textAlign: "center", opacity: 0.22 / i, transform: `scale(${1 + i * 0.16 * Math.min(1, (t - T.n500) * 1.4)})` }}>
                <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 470, letterSpacing: "-0.055em", color: "transparent", WebkitTextStroke: `3px ${C.white}`, display: "inline-block", transform: "scaleX(0.88)" }}>{t > 1 ? "1,000?" : "500?"}</span>
              </div>
            ))}
            <Slam text={t >= 1.0 ? `${fmt(value)}?` : "500?"} size={t >= 1.0 && value >= 999 ? 360 : t >= 1 ? mix(470, 380, rush) : 470} k={k500} frame={frame} gl={glRush} />
          </>
        )}
        {inB && (
          <>
            <Tape frame={frame} opacity={0.4} />
            <Slam text="1,000?" size={380} k={1} frame={frame} gl={glRush} y={900 + (slam1000 < 1 ? (1 - slam1000) * 40 : 0)} />
            <div style={{ position: "absolute", left: 60, top: 1180, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: C.white, opacity: 0.55 * prog(t, 1.8, 0.3) }}>— BULK RUNS. LONG LEAD TIMES. NO ROOM TO TEST.</div>
          </>
        )}

        {/* ---- TOO MANY? */}
        {inC && (
          <>
            {/* typographic pile */}
            <AbsoluteFill style={{ overflow: "hidden", opacity: 0.25 + press * 0.55 }}>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} style={{ position: "absolute", top: -60 + i * 230, left: 0, whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 900, fontSize: 240, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: `2px ${i % 4 === 1 ? C.lime : "rgba(255,255,255,.55)"}`, transform: `translateX(${(i % 2 ? 1 : -1) * (t - T.tooMany) * (260 + i * 40) - 600}px) scaleX(0.88)`, transformOrigin: "0 50%" }}>{"TOO MANY? ".repeat(6)}</div>
              ))}
            </AbsoluteFill>
            <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, rgba(23,25,23,${0.9 - press * 0.3}) 0%, rgba(23,25,23,0) 70%)` }} />
            <div style={{ position: "absolute", left: 0, top: 640, width: 1080, textAlign: "center", transform: `scale(${mix(2.6, 1, kTM)})`, opacity: Math.min(1, kTM * 6) }}>
              <Glitch frame={frame} intensity={Math.max(0, glTM)} slices={11}>
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 320, lineHeight: 0.86, letterSpacing: "-0.06em", color: C.white, transform: "scaleX(0.86)", display: "inline-block" }}>
                  TOO<br /><span style={{ color: C.lime }}>MANY?</span>
                </div>
              </Glitch>
            </div>
          </>
        )}

        {/* ---- WHAT IF YOU COULD START WITH 10? */}
        {inD && (
          <>
            <MaskLine t={t} at={3.7} size={132} y={290} x={64} dur={0.55}>WHAT IF</MaskLine>
            <MaskLine t={t} at={3.82} size={132} y={420} x={64} dur={0.55}>YOU COULD</MaskLine>
            <MaskLine t={t} at={3.94} size={132} y={550} x={64} dur={0.55} color={C.lime}>START WITH</MaskLine>
            {t >= T.ten && (
              <div style={{ transform: `scale(${push})`, transformOrigin: "50% 60%" }}>
                {/* shock rings */}
                {[0, 1, 2].map((i) => {
                  const kk = prog(t, T.ten + i * 0.09, 0.9);
                  return <div key={i} style={{ position: "absolute", left: 540 - 700 * kk, top: 1130 - 700 * kk, width: 1400 * kk, height: 1400 * kk, borderRadius: "50%", border: `${6 - i * 1.5}px solid ${C.lime}`, opacity: (1 - kk) * 0.7 }} />;
                })}
                <BigTen scale={tenScale} glow={0.5 + 0.5 * Math.exp(-(t - T.ten) * 3)} y={1130} qOpacity={prog(t, T.ten + 0.35, 0.3)} />
              </div>
            )}
            {t >= 5.0 && (
              <>
                <Tag x={0} y={1720} align="center" color={C.lime} size={26} opacity={prog(t, 5.0, 0.4)} spacing={7}>MINIMUM ORDER · 10 PIECES</Tag>
                <div style={{ position: "absolute", left: 60, right: 60, top: 1690, height: 2, background: C.lime, opacity: 0.6, transform: `scaleX(${prog(t, 5.0, 0.7)})`, transformOrigin: "0 50%" }} />
              </>
            )}
          </>
        )}
      </AbsoluteFill>

      <Flash t={t} at={T.n500} peak={0.25} decay={14} />
      <Flash t={t} at={T.n1000} peak={0.4} decay={12} />
      <Flash t={t} at={T.tooMany} peak={0.7} decay={11} />
      <Flash t={t} at={T.ten} peak={0.9} color={C.white} decay={8} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,.6) 100%)` }} />
    </AbsoluteFill>
  );
};
