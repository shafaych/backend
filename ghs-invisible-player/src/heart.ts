// shared heartbeat schedule (seconds) — mirrored in tools/mix.py
export const heartTimes = (): number[] => {
  const out: number[] = [];
  let t = 2.0;
  while (t < 11.5) {
    out.push(t);
    const k = Math.min(1, (t - 2.0) / 6);
    t += 1.05 - 0.35 * k;
  }
  return out;
};
export const heartPulse = (sec: number) => {
  let v = 0;
  for (const t of heartTimes()) {
    for (const [o, a] of [[0, 1], [0.27, 0.6]] as const) {
      const d = sec - (t + o);
      if (d >= 0 && d < 0.5) v = Math.max(v, a * Math.exp(-d * 9));
    }
  }
  return v;
};
