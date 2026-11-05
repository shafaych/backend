import * as THREE from 'three';

export const CARBON = '#171917';
export const GRAPHITE = '#333832';
export const LIME = '#C8F36B';
export const PORCELAIN = '#F5F5F0';

const cv = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};
const tex = (c: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
};

// Deterministic PRNG so every render of every frame is identical.
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** GHS wordmark drawn identically on the jersey and used as the brand mark. */
export function drawLogo(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = PORCELAIN, bar = LIME) {
  ctx.save();
  ctx.font = `${size}px Anton, Impact, 'Arial Narrow', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  // letter spacing
  const txt = 'GHS';
  const sp = size * 0.06;
  const widths = [...txt].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + sp * 2;
  let x = cx - total / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = color;
  [...txt].forEach((ch, i) => {
    ctx.fillText(ch, x, cy);
    x += widths[i] + sp;
  });
  ctx.fillStyle = bar;
  ctx.fillRect(cx - total / 2, cy + size * 0.07, total, size * 0.07);
  ctx.restore();
}

function dashedLine(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string, w: number, dash: number[]) {
  ctx.save();
  ctx.setLineDash(dash);
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.stroke();
  ctx.restore();
}

function perforation(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(8,10,8,0.55)';
  const step = 16;
  for (let y = 0; y < H; y += step)
    for (let x = ((y / step) % 2) * (step / 2); x < W; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  ctx.restore();
}

function panelPath(ctx: CanvasRenderingContext2D, W: number, H: number, side: 'L' | 'R') {
  const m = (x: number) => (side === 'L' ? x * W : W - x * W);
  ctx.beginPath();
  ctx.moveTo(m(0), 0.3 * H);
  ctx.lineTo(m(0.1), 0.38 * H);
  ctx.quadraticCurveTo(m(0.2), 0.62 * H, m(0.14), H);
  ctx.lineTo(m(0), H);
  ctx.closePath();
}

export type FabricSet = {
  frontBase: THREE.Texture; frontOver: THREE.Texture;
  backBase: THREE.Texture; backOver: THREE.Texture;
  sleeveBase: THREE.Texture; sleeveOver: THREE.Texture;
  collarBase: THREE.Texture; collarOver: THREE.Texture;
  weave: THREE.Texture;
  seats: THREE.Texture; seatsEmis: THREE.Texture;
};

function bodyBase(W: number, H: number, front: boolean) {
  const c = cv(W, H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = CARBON;
  ctx.fillRect(0, 0, W, H);
  // tone-on-tone sublimated speed stripes
  ctx.save();
  ctx.fillStyle = 'rgba(51,56,50,0.42)';
  for (let i = -6; i < 14; i++) {
    const x = i * 150;
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 64, H);
    ctx.lineTo(x + 64 + 520, 0.42 * H);
    ctx.lineTo(x + 520, 0.42 * H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  // tonal pitch rings
  ctx.strokeStyle = 'rgba(70,78,68,0.55)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.78, W * 0.2, 0, Math.PI * 2);
  ctx.stroke();
  // graphite side panels with perforation
  for (const side of ['L', 'R'] as const) {
    ctx.save();
    panelPath(ctx, W, H, side);
    ctx.fillStyle = GRAPHITE;
    ctx.fill();
    ctx.clip();
    perforation(ctx, W, H);
    ctx.restore();
  }
  // shoulder yoke
  ctx.fillStyle = GRAPHITE;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, 0.1 * H);
  ctx.lineTo(W * 0.5, front ? 0.17 * H : 0.13 * H);
  ctx.lineTo(0, 0.1 * H);
  ctx.closePath();
  ctx.fill();
  // hem band
  ctx.fillStyle = '#101210';
  ctx.fillRect(0, 0.958 * H, W, 0.042 * H);
  ctx.fillStyle = LIME;
  ctx.fillRect(0, 0.95 * H, W, 0.011 * H);
  return c;
}

function bodyOver(W: number, H: number, front: boolean) {
  const c = cv(W, H);
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  // lime piping on side panels
  for (const side of ['L', 'R'] as const) {
    ctx.save();
    ctx.strokeStyle = LIME;
    ctx.lineWidth = 9;
    ctx.lineJoin = 'round';
    const m = (x: number) => (side === 'L' ? x * W : W - x * W);
    ctx.beginPath();
    ctx.moveTo(m(0.1), 0.38 * H);
    ctx.quadraticCurveTo(m(0.2), 0.62 * H, m(0.14), 0.95 * H);
    ctx.stroke();
    ctx.restore();
  }
  // yoke piping
  ctx.strokeStyle = LIME;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0.1 * H);
  ctx.lineTo(W * 0.5, front ? 0.17 * H : 0.13 * H);
  ctx.lineTo(W, 0.1 * H);
  ctx.stroke();
  if (front) {
    // pitch-geometry graphic: halfway line + centre circle
    ctx.strokeStyle = LIME;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(W * 0.19, H * 0.8);
    ctx.lineTo(W * 0.81, H * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.8, W * 0.11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = LIME;
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.8, 10, 0, Math.PI * 2);
    ctx.fill();
    // chest branding
    drawLogo(ctx, W * 0.5, H * 0.335, 300);
  } else {
    drawLogo(ctx, W * 0.5, H * 0.3, 120);
  }
  // stitching
  const st = 'rgba(245,245,240,0.6)';
  dashedLine(ctx, [[W * 0.115, 0.4 * H], [W * 0.17, 0.62 * H], [W * 0.13, 0.95 * H]], st, 3, [14, 10]);
  dashedLine(ctx, [[W - W * 0.115, 0.4 * H], [W - W * 0.17, 0.62 * H], [W - W * 0.13, 0.95 * H]], st, 3, [14, 10]);
  dashedLine(ctx, [[0, 0.115 * H], [W * 0.5, front ? 0.185 * H : 0.145 * H], [W, 0.115 * H]], st, 3, [14, 10]);
  dashedLine(ctx, [[0, 0.935 * H], [W, 0.935 * H]], st, 3, [14, 10]);
  return c;
}

export function makeFabrics(): FabricSet {
  const frontBase = tex(bodyBase(1536, 2048, true));
  const frontOver = tex(bodyOver(1536, 2048, true));
  const backBase = tex(bodyBase(1536, 2048, false));
  const backOver = tex(bodyOver(1536, 2048, false));

  // sleeve: u around, v along (canvas top = cuff)
  const sb = cv(1024, 512);
  {
    const ctx = sb.getContext('2d')!;
    ctx.fillStyle = CARBON;
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = GRAPHITE;
    ctx.fillRect(0, 0.1 * 512, 1024 * 0.14, 0.9 * 512);
    ctx.fillRect(1024 * 0.86, 0.1 * 512, 1024 * 0.14, 0.9 * 512);
    ctx.fillStyle = '#101210';
    ctx.fillRect(0, 0, 1024, 0.1 * 512);
    ctx.fillStyle = LIME;
    ctx.fillRect(0, 0.1 * 512, 1024, 10);
    ctx.fillRect(0, 0.16 * 512, 1024, 4);
  }
  const so = cv(1024, 512);
  {
    const ctx = so.getContext('2d')!;
    dashedLine(ctx, [[0, 0.205 * 512], [1024, 0.205 * 512]], 'rgba(245,245,240,0.6)', 3, [12, 9]);
    dashedLine(ctx, [[1024 * 0.14, 0.3 * 512], [1024 * 0.14, 512]], 'rgba(245,245,240,0.6)', 3, [12, 9]);
    dashedLine(ctx, [[1024 * 0.86, 0.3 * 512], [1024 * 0.86, 512]], 'rgba(245,245,240,0.6)', 3, [12, 9]);
  }
  // collar rib
  const cb = cv(1024, 128);
  {
    const ctx = cb.getContext('2d')!;
    ctx.fillStyle = GRAPHITE;
    ctx.fillRect(0, 0, 1024, 128);
    ctx.fillStyle = CARBON;
    ctx.fillRect(0, 0, 1024, 20);
    ctx.fillRect(0, 108, 1024, 20);
    ctx.fillStyle = LIME;
    ctx.fillRect(0, 56, 1024, 16);
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth = 2;
    for (let y = 24; y < 108; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }
  }
  const co = cv(1024, 128);
  {
    const ctx = co.getContext('2d')!;
    dashedLine(ctx, [[0, 18], [1024, 18]], 'rgba(245,245,240,0.75)', 3, [10, 8]);
    dashedLine(ctx, [[0, 110], [1024, 110]], 'rgba(245,245,240,0.75)', 3, [10, 8]);
  }
  // weave bump tile (twill) -- grayscale height map
  const wv = cv(256, 256);
  {
    const ctx = wv.getContext('2d')!;
    const img = ctx.createImageData(256, 256);
    const r = rng(7);
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 256; x++) {
        const cell = 8;
        const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
        const lx = (x % cell) / cell, ly = (y % cell) / cell;
        const over = (cx + cy) % 4 < 2;
        const yarn = over ? Math.sin(Math.PI * ly) : Math.sin(Math.PI * lx);
        const v = 0.35 + 0.55 * yarn * yarn + (r() - 0.5) * 0.06;
        const g = Math.max(0, Math.min(255, v * 255));
        const i = (y * 256 + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = g;
        img.data[i + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);
  }
  const weave = tex(wv, false);
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;

  // stadium seats
  const seats = cv(512, 256);
  const seatsE = cv(512, 256);
  {
    const a = seats.getContext('2d')!;
    const b = seatsE.getContext('2d')!;
    a.fillStyle = '#1a1f24';
    a.fillRect(0, 0, 512, 256);
    b.fillStyle = '#000';
    b.fillRect(0, 0, 512, 256);
    const r = rng(11);
    const pal = ['#2a3a48', '#34495a', '#b7c0c6', '#4a2f2f', '#243038', '#8fa0ad', '#1d2a33'];
    for (let y = 0; y < 256; y += 8)
      for (let x = 0; x < 512; x += 8) {
        a.fillStyle = pal[Math.floor(r() * pal.length)];
        a.fillRect(x + 1, y + 1, 6, 5);
        if (r() < 0.035) {
          b.fillStyle = r() < 0.5 ? '#ffffff' : '#C8F36B';
          b.fillRect(x + 3, y + 2, 2, 2);
        }
      }
  }
  const seatsT = tex(seats);
  const seatsE_ = tex(seatsE);
  [seatsT, seatsE_].forEach((t) => (t.wrapS = t.wrapT = THREE.RepeatWrapping));

  return {
    frontBase, frontOver, backBase, backOver,
    sleeveBase: tex(sb), sleeveOver: tex(so),
    collarBase: tex(cb), collarOver: tex(co),
    weave, seats: seatsT, seatsEmis: seatsE_,
  };
}
