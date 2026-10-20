import cues from './cues.json';

export const C = {
  carbon: '#171917',
  graphite: '#333832',
  lime: '#C8F36B',
  porcelain: '#F5F5F0',
  white: '#FFFFFF',
  // derived tints used for technical drawing depth
  graphiteLight: '#4a5149',
  graphiteDark: '#262b25',
  mute: 'rgba(245,245,240,0.55)',
};

export const SANS = "Inter, 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
export const FPS = 30;
export const CUES = cues;

// ---- timing / easing helpers (all times in absolute seconds) ----
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeInOut = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
/** 0→1 progress of `t` between start and start+dur */
export const prog = (t: number, start: number, dur: number, ease: (x: number) => number = easeOut) =>
  ease((t - start) / dur);
/** keyframed value with eased segments */
export const keyframe = (t: number, times: number[], values: number[]) => {
  if (t <= times[0]) return values[0];
  for (let i = 1; i < times.length; i++) {
    if (t <= times[i]) {
      const p = easeInOut((t - times[i - 1]) / (times[i] - times[i - 1]));
      return values[i - 1] + (values[i] - values[i - 1]) * p;
    }
  }
  return values[values.length - 1];
};
