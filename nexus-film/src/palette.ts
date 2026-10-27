export const C = {
  burgundy: '#6b1426', burgundyHi: '#8a2236', burgundyLo: '#3f0a16',
  cream: '#e9dcc0', creamLo: '#bfae8a', gold: '#c9a24b',
  skin: '#b98262', skinLo: '#8d5c43', hair: '#16110f',
  hoodie: '#35383d', hoodieLo: '#1f2125', jeans: '#1b2231', jeansLo: '#10141e',
  sneaker: '#e8dcc4', sole: '#f4efe2',
  ivory: '#f3ecdd', ink: '#1d1612',
};
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rng = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
