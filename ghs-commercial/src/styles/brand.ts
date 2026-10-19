export const C = {
  carbon: '#171917',
  graphite: '#333832',
  lime: '#C8F36B',
  porcelain: '#F5F5F0',
  white: '#FFFFFF',
} as const;

/** Tints of brand colours only (no new hues). */
export const tint = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const FONT = `"Inter Display", Inter, "Helvetica Neue", Helvetica, Arial, "Segoe UI", system-ui, sans-serif`;
export const MONO = `ui-monospace, "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", "Liberation Mono", monospace`;

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const TOTAL = 1350;

/** Scene timing (frames). `dur` is the nominal scene length. */
export const SCENES = {
  s1: {from: 0, dur: 150},
  s2: {from: 150, dur: 210},
  s3: {from: 360, dur: 240},
  s4: {from: 600, dur: 240},
  s5: {from: 840, dur: 240},
  s6: {from: 1080, dur: 270},
} as const;

/** Frames the outgoing scene keeps rendering underneath an incoming wipe. */
export const WIPE = 18;
