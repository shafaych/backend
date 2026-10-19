import React from "react";
import { AbsoluteFill } from "remotion";
import { C, easeInOut, easeOut, prog } from "../theme";

let n = 0;
/** Column "blinds" reveal: children are revealed through staggered vertical bars with a lime leading edge. */
export const BarsReveal: React.FC<{ t: number; at: number; children: React.ReactNode; bars?: number; stagger?: number; dur?: number }> = ({ t, at, children, bars = 9, stagger = 0.04, dur = 0.5 }) => {
  const id = React.useMemo(() => `bars-${n++}`, []);
  const w = 1080 / bars;
  const done = t > at + dur + stagger * bars + 0.2;
  return (
    <AbsoluteFill>
      {!done && (
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <clipPath id={id}>
            {Array.from({ length: bars }, (_, i) => <rect key={i} x={i * w - 0.5} y={0} width={w + 1} height={1920 * prog(t, at + i * stagger, dur, easeInOut)} />)}
          </clipPath>
        </svg>
      )}
      {!done && Array.from({ length: bars }, (_, i) => {
        const hh = 1920 * prog(t, at + i * stagger - 0.07, dur, easeInOut);
        const h2 = 1920 * prog(t, at + i * stagger, dur, easeInOut);
        return hh > 0 && h2 < 1919 ? <div key={i} style={{ position: "absolute", left: i * w, top: 0, width: w, height: hh, background: C.lime }} /> : null;
      })}
      <AbsoluteFill style={{ clipPath: done ? undefined : `url(#${id})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Circular iris reveal from (cx, cy). */
export const IrisReveal: React.FC<{ t: number; at: number; cx?: number; cy?: number; dur?: number; children: React.ReactNode; ring?: string }> = ({ t, at, cx = 540, cy = 960, dur = 0.8, children, ring = C.lime }) => {
  const k = prog(t, at, dur, easeInOut);
  const r = k * 2300;
  const done = k >= 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: done ? undefined : `circle(${r}px at ${cx}px ${cy}px)` }}>{children}</AbsoluteFill>
      {!done && k > 0 && <div style={{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${Math.max(2, 26 * (1 - k))}px solid ${ring}`, boxSizing: "border-box", opacity: 1 - k * 0.6 }} />}
    </AbsoluteFill>
  );
};

/** Slit reveal: a thin horizontal line opens to full frame. */
export const SlitReveal: React.FC<{ t: number; at: number; dur?: number; children: React.ReactNode; line?: string }> = ({ t, at, dur = 0.7, children, line = C.lime }) => {
  const k = prog(t, at, dur, easeInOut);
  const done = k >= 1;
  const half = 960 * k;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: done ? undefined : `inset(${960 - half}px 0 ${960 - half}px 0)` }}>{children}</AbsoluteFill>
      {!done && k > 0 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 960 - half - 3, height: 6, background: line }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 960 + half - 3, height: 6, background: line }} />
        </>
      )}
    </AbsoluteFill>
  );
};
