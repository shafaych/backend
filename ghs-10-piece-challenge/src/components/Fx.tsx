import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT, MONO, easeOut, prog } from "../theme";

/** Animated film grain — low-res turbulence scaled up, re-seeded every other frame. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <svg width="1080" height="1920" viewBox="0 0 270 480" preserveAspectRatio="none">
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={Math.floor(f / 2)} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="270" height="480" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }} />
);

/** Technical micro-grid with registration crosses. */
export const TechGrid: React.FC<{ color?: string; opacity?: number; step?: number; offsetY?: number }> = ({ color = "#fff", opacity = 0.06, step = 90, offsetY = 0 }) => (
  <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
    <svg width="1080" height="1920">
      {Array.from({ length: 13 }, (_, i) => <line key={`v${i}`} x1={i * step} y1="0" x2={i * step} y2="1920" stroke={color} strokeWidth="1" />)}
      {Array.from({ length: 23 }, (_, i) => <line key={`h${i}`} x1="0" y1={((i * step + offsetY) % 2070)} x2="1080" y2={((i * step + offsetY) % 2070)} stroke={color} strokeWidth="1" />)}
    </svg>
  </AbsoluteFill>
);

/** Small mono caption (section tags, disclaimers). */
export const Tag: React.FC<{ children: React.ReactNode; x: number; y: number; color?: string; size?: number; opacity?: number; align?: "left" | "right" | "center"; spacing?: number }> = ({ children, x, y, color = "#fff", size = 28, opacity = 1, align = "left", spacing = 2 }) => (
  <div style={{ position: "absolute", left: align === "left" ? x : undefined, right: align === "right" ? 1080 - x : undefined, top: y, width: align === "center" ? 1080 : undefined, textAlign: align, fontFamily: MONO, fontSize: size, letterSpacing: spacing, color, opacity, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</div>
);

/** Text that rises out of a hard mask (editorial line reveal). */
export const MaskLine: React.FC<{ t: number; at: number; dur?: number; children: React.ReactNode; size: number; color?: string; x?: number; y: number; align?: "left" | "center"; width?: number; squeeze?: number; tracking?: number; weight?: number; exit?: number; lineH?: number }> = ({ t, at, dur = 0.7, children, size, color = C.white, x = 60, y, align = "left", width = 960, squeeze = 0.86, tracking = -0.045, weight = 900, exit, lineH = 0.9 }) => {
  const k = prog(t, at, dur, easeOut);
  const out = exit !== undefined ? prog(t, exit, 0.4) : 0;
  return (
    <div style={{ position: "absolute", left: align === "center" ? (1080 - width) / 2 : x, top: y, width, height: size * lineH * 1.08, overflow: "hidden", opacity: 1 - out }}>
      <div style={{ transform: `translateY(${(1 - k) * 118 + out * -60}%) rotate(${(1 - k) * 3}deg)`, transformOrigin: "0 100%", fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: lineH, letterSpacing: `${tracking}em`, color, textAlign: align, whiteSpace: "nowrap" }}>
        <span style={{ display: "inline-block", transform: `scaleX(${squeeze})`, transformOrigin: align === "center" ? "50% 50%" : "0 50%" }}>{children}</span>
      </div>
    </div>
  );
};

/** Horizontal-slice glitch: renders `children` N times, each clipped to a band and jittered. */
export const Glitch: React.FC<{ frame: number; intensity: number; slices?: number; children: React.ReactNode; split?: number }> = ({ frame, intensity, slices = 9, children, split = 14 }) => {
  if (intensity <= 0.01) return <>{children}</>;
  const rnd = (i: number) => Math.sin((frame + 1) * 12.9898 + i * 78.233) * 43758.5453 % 1;
  return (
    <div style={{ position: "relative" }}>
      {Array.from({ length: slices }, (_, i) => {
        const a = (i / slices) * 100, b = ((i + 1) / slices) * 100;
        const dx = rnd(i) * 90 * intensity;
        const on = Math.abs(rnd(i + 40)) < 0.55 + 0.4 * intensity;
        return (
          <div key={i} style={{ position: i === 0 ? "relative" : "absolute", left: 0, top: 0, clipPath: `inset(${a}% 0 ${100 - b}% 0)`, transform: `translateX(${on ? dx : 0}px)` }}>
            {children}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "screen", color: C.lime, opacity: 0.55 * intensity, transform: `translateX(${split * intensity}px)`, clipPath: `inset(${(frame * 7) % 80}% 0 ${100 - ((frame * 7) % 80) - 14}% 0)` }}>{children}</div>
    </div>
  );
};

export const Flash: React.FC<{ t: number; at: number; color?: string; peak?: number; decay?: number }> = ({ t, at, color = "#fff", peak = 0.8, decay = 9 }) => {
  const d = t - at;
  if (d < 0 || d > 1) return null;
  return <AbsoluteFill style={{ background: color, opacity: peak * Math.exp(-d * decay), pointerEvents: "none" }} />;
};
