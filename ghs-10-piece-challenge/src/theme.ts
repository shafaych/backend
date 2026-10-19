import { Easing, interpolate } from "remotion";

export const C = {
  carbon: "#171917",
  graphite: "#333832",
  lime: "#C8F36B",
  porcelain: "#F5F5F0",
  white: "#FFFFFF",
};
export const FONT = `"Inter Display", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif`;
export const MONO = `"DejaVu Sans Mono", "SF Mono", Menlo, Consolas, monospace`;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.83, 0, 0.17, 1);
export const easeSoft = Easing.bezier(0.45, 0, 0.15, 1);
export const easeBack = Easing.bezier(0.34, 1.56, 0.64, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

/** 0→1 progress of time `t` (seconds) across [start, start+dur]. */
export const prog = (t: number, start: number, dur: number, ease: (x: number) => number = easeOut) =>
  interpolate(t, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

export const rand = (seed: number) => {
  let x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Decaying camera shake after an impact at `hit` seconds. */
export const shake = (t: number, hit: number, amp: number, decay = 9) => {
  const d = t - hit;
  if (d < 0) return { x: 0, y: 0, r: 0 };
  const e = amp * Math.exp(-d * decay);
  return { x: Math.sin(d * 97) * e, y: Math.cos(d * 83) * e, r: Math.sin(d * 61) * e * 0.012 };
};
