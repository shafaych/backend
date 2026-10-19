import {Easing, interpolate, spring} from 'remotion';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const ease = {
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  outQuart: Easing.bezier(0.25, 1, 0.5, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  inOutSoft: Easing.bezier(0.45, 0, 0.2, 1),
  inExpo: Easing.bezier(0.7, 0, 0.84, 0),
  outBack: Easing.bezier(0.34, 1.35, 0.64, 1),
  linear: (t: number) => t,
};

export type EaseFn = (t: number) => number;

/** 0→1 progress between `start` and `start+dur`, clamped, eased. */
export const prog = (frame: number, start: number, dur: number, easing: EaseFn = ease.outExpo) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** In-and-out envelope: rises at inStart, falls at outStart. */
export const pulse = (
  frame: number,
  inStart: number,
  inDur: number,
  outStart: number,
  outDur: number,
  easeIn: EaseFn = ease.outExpo,
  easeOut: EaseFn = ease.inOut,
) => prog(frame, inStart, inDur, easeIn) - prog(frame, outStart, outDur, easeOut);

/** Restrained spring (no visible bounce by default). */
export const sp = (frame: number, fps: number, start: number, config: Partial<{damping: number; stiffness: number; mass: number}> = {}) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: {damping: 22, stiffness: 110, mass: 0.9, ...config},
  });

export const seeded = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');

export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');
