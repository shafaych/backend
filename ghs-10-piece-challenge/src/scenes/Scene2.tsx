import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT, MONO, easeOut, easeBack, easeInOut, prog, mix, rand, shake } from "../theme";
import { T, FPS } from "../timeline";
import { Flash, MaskLine, Tag, TechGrid } from "../components/Fx";
import { BigTen } from "../components/BigTen";
import { Jersey, Pattern } from "../components/Jersey";

type Way = { base: string; accent: string; trim: string; panel?: string; pattern: Pattern };
// Ten coordinated colourways of one fictional collection ("KESTREL" — illustrative, not a real brand)
export const WAYS: Way[] = [
  { base: "#333832", accent: C.lime, trim: C.white, panel: "#171917", pattern: "chevron" },
  { base: "#F5F5F0", accent: "#171917", trim: "#171917", panel: C.lime, pattern: "chevron" },
  { base: "#C8F36B", accent: "#171917", trim: "#171917", panel: "#333832", pattern: "chevron" },
  { base: "#2B49D9", accent: C.white, trim: C.white, panel: "#18237A", pattern: "sash" },
  { base: "#171917", accent: "#D7263D", trim: C.white, panel: "#333832", pattern: "sash" },
  { base: "#E85D2A", accent: "#171917", trim: C.white, panel: "#171917", pattern: "hoops" },
  { base: "#0F5C5A", accent: C.lime, trim: C.porcelain, panel: "#0A3B3A", pattern: "hoops" },
  { base: "#D9C9A3", accent: "#333832", trim: "#171917", panel: "#333832", pattern: "shards" },
  { base: "#D7263D", accent: C.white, trim: C.white, panel: "#8E1424", pattern: "shards" },
  { base: C.white, accent: "#2B49D9", trim: "#171917", panel: "#2B49D9", pattern: "sash" },
];
// 3-4-3 staggered grid
const SLOTS: { x: number; y: number }[] = [
  ...[0, 1, 2].map((i) => ({ x: (i - 1) * 262, y: -318 })),
  ...[0, 1, 2, 3].map((i) => ({ x: (i - 1.5) * 262, y: 0 })),
  ...[0, 1, 2].map((i) => ({ x: (i - 1) * 262, y: 318 })),
];

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const e = t - T.s2;

  // camera: slow orbit + push
  const cam = prog(t, T.s2 + 0.4, 6.6, (x) => x * (2 - x));
  const rotX = mix(52, 30, prog(t, T.s2 + 0.2, 1.4, easeInOut)) - cam * 4;
  const rotZ = mix(-22, -9, prog(t, T.s2 + 0.2, 2.0, easeInOut)) + cam * 5;
  const rotY = mix(10, -8, cam);
  const zoom = mix(0.86, 0.97, cam);
  const sh = shake(t, T.burst, 26, 8);

  // big "10" shatter
  const shat = prog(t, T.burst, 0.55, easeInOut);
  const tenOpacity = 1 - prog(t, T.burst + 0.15, 0.5);

  return (
    <AbsoluteFill style={{ background: C.carbon, overflow: "hidden" }}>
      <TechGrid opacity={0.05} offsetY={-frame} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 62%, rgba(200,243,107,${0.10 + 0.05 * Math.sin(t * 2)}) 0%, rgba(23,25,23,0) 60%)` }} />
      <Tag x={60} y={90} color={C.lime} opacity={prog(t, 6.5, 0.4)}>[ 02 ] First collection</Tag>
      <Tag x={1020} y={90} align="right" opacity={0.5 * prog(t, 6.5, 0.4)}>10 pcs · 10 colourways</Tag>

      {/* 10 breaking apart */}
      {t < T.burst + 0.8 && <BigTen scale={mix(1, 1.5, shat)} opacity={tenOpacity} slice={shat} blur={shat * 14} glow={0.8} qOpacity={1 - shat} />}

      {/* perspective grid */}
      <AbsoluteFill style={{ perspective: 2200, perspectiveOrigin: "50% 58%", transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        <div style={{ position: "absolute", left: 540, top: 1170, transformStyle: "preserve-3d", transform: `scale(${zoom}) rotateX(${rotX}deg) rotateZ(${rotZ}deg) rotateY(${rotY}deg)` }}>
          {/* floor plate */}
          <div style={{ position: "absolute", left: -640, top: -610, width: 1280, height: 1220, borderRadius: 30, border: "1.5px solid rgba(200,243,107,.28)", background: "linear-gradient(160deg, rgba(255,255,255,.05), rgba(255,255,255,0))", opacity: prog(t, 6.3, 0.8), transform: "translateZ(-40px)" }} />
          {SLOTS.map((s, i) => {
            const t0 = T.jerseyStart + i * 0.17;
            const k = prog(t, t0, 0.85, easeOut);
            const kb = prog(t, t0, 0.9, easeBack);
            const w = WAYS[i];
            const phase = i * 0.9;
            const float = Math.sin(t * 1.6 + phase) * 7 * k;
            const sway = Math.sin(t * 2.1 + phase) * 0.5 * prog(t, t0 + 0.6, 0.6);
            const sheenP = (t - (10.0 + i * 0.13)) / 0.9;
            const sheen = sheenP >= 0 && sheenP <= 1 ? sheenP : -1;
            // fly from the "10" centre
            const fromX = -s.x * 0.9, fromY = -s.y * 0.9 - 40;
            const px = mix(fromX, 0, k), py = mix(fromY, 0, k);
            const tz = mix(500, 0, kb);
            const rz = (1 - k) * (rand(i + 3) * 160 - 80);
            return (
              <div key={i} style={{ position: "absolute", left: s.x - 125, top: s.y - 146, width: 250, transformStyle: "preserve-3d", transform: `translate3d(${px}px, ${py + float}px, ${tz + 20 + Math.sin(t * 1.6 + phase) * 8}px) rotateZ(${rz}deg) rotateX(${-rotX * 0.25 * (1 - k)}deg) scale(${mix(0.2, 1, kb)})`, opacity: Math.min(1, k * 4), filter: "drop-shadow(0 28px 26px rgba(0,0,0,.45))" }}>
                <Jersey uid={`s2-${i}`} width={250} {...w} number={String(i + 1)} sway={sway} sheen={sheen} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* headline */}
      <MaskLine t={t} at={T.headline2} size={188} y={150} x={56} dur={0.7} squeeze={0.82} width={1000}>YOUR FIRST</MaskLine>
      <MaskLine t={t} at={T.headline2 + 0.12} size={188} y={322} x={56} dur={0.7} squeeze={0.82} width={1000} color={C.lime}>COLLECTION.</MaskLine>
      <div style={{ position: "absolute", left: 60, top: 560, transform: `scaleX(${prog(t, T.sub2, 0.5)})`, transformOrigin: "0 50%", background: C.lime, color: C.carbon, fontFamily: FONT, fontWeight: 900, fontSize: 38, letterSpacing: 4, padding: "14px 26px", opacity: prog(t, T.sub2, 0.2) }}>STARTING AT JUST 10 PIECES.</div>

      {/* spec strip */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1672, height: 2, background: C.lime, opacity: 0.55, transform: `scaleX(${prog(t, 10.2, 0.8)})`, transformOrigin: "0 50%" }} />
      {["RIB COLLAR", "FLATLOCK SEAMS", "PANEL BLOCKING"].map((txt, i) => (
        <div key={txt} style={{ position: "absolute", left: 60 + i * 335, top: 1696, fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: 3, color: C.white, opacity: prog(t, 10.5 + i * 0.5, 0.4), transform: `translateY(${(1 - prog(t, 10.5 + i * 0.5, 0.5)) * 14}px)` }}>
          <span style={{ color: C.lime }}>0{i + 1}</span>&nbsp;&nbsp;{txt}
        </div>
      ))}
      <Tag x={60} y={1830} size={18} opacity={0.5 * prog(t, 9.7, 0.5)} spacing={2}>Fictional brand shown for illustration only.</Tag>
      <Flash t={t} at={T.burst} peak={0.35} color={C.lime} decay={10} />
    </AbsoluteFill>
  );
};
