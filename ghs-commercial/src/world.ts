import * as THREE from 'three';
import {makeFabrics, FabricSet, rng} from './textures';
import {makeMorphMaterial, makeShared, Shared} from './material';

const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const hashf = (k: number) => {
  const s = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const ease3 = (x: number) => {
  x = clamp01(x);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

// ------------------------------------------------------------------ jersey
const HS = 33, NK = 3.6, ZN = 3.4;
const wxB = (b: number) => 10.8 + 1.0 * Math.sin(Math.min(1, b * 1.3) * Math.PI / 2);
function yTop(x: number, front: boolean) {
  const ax = Math.abs(x);
  const drop = 2.2 * sstep(NK, 11, ax);
  const sc = ax < NK ? (front ? 3.2 : 0.7) * Math.sqrt(1 - (ax / NK) ** 2) : 0;
  return HS - drop - sc;
}
function bodyPoint(a: number, b: number, front: boolean, out: number[]) {
  const wx = wxB(b);
  const x = (2 * a - 1) * wx;
  const ax = Math.abs(x);
  const yt = yTop(x, front);
  const hem = 0.7 * (x / wx) ** 2;
  const y = hem + b * (yt - hem);
  const D0 = 5.6 - 0.5 * b;
  const prof = Math.pow(Math.max(0, 1 - Math.pow(ax / wx, 2.4)), 0.42);
  let zb = D0 * prof;
  const zTop = ax < NK ? ZN * Math.sqrt(1 - (x / NK) ** 2) : 0;
  const k = sstep(0.62, 1.0, b);
  let z = zb * (1 - k) + zTop * k;
  z += 0.12 * Math.sin(x * 0.8 + b * 9) * (1 - k) * prof + 0.35 * b * (1 - b) * prof * (front ? 1 : 0.3);
  out[0] = x; out[1] = y; out[2] = front ? z : -z;
}
const SL = 11, SA = (35 * Math.PI) / 180;
function sleevePoint(a: number, b: number, right: boolean, out: number[]) {
  const phi = (right ? 1 : -1) * 2 * Math.PI * a;
  const s = right ? 1 : -1;
  const r2 = 4.7 - 0.5 * b, r1 = 4.3 - 0.5 * b;
  const d = [s * Math.cos(SA), -Math.sin(SA)];
  const e2 = [s * Math.sin(SA), Math.cos(SA)];
  const S = [s * 9.6, 26.0];
  const L = SL * b + (b > 0.9 ? 0 : 0);
  out[0] = S[0] + d[0] * L + r2 * Math.cos(phi) * e2[0];
  out[1] = S[1] + d[1] * L + r2 * Math.cos(phi) * e2[1];
  out[2] = r1 * Math.sin(phi);
}
function collarPoint(a: number, v: number, out: number[]) {
  const phi = 2 * Math.PI * a;
  const c = Math.cos(phi), s = Math.sin(phi);
  const x = NK * c, z = ZN * s;
  const front = s >= 0;
  const y = HS - (front ? 3.2 : 0.7) * Math.abs(s);
  const gx = c / NK, gz = s / ZN;
  const gl = Math.hypot(gx, gz);
  const inx = -gx / gl, inz = -gz / gl;
  out[0] = x + inx * 1.0 * v;
  out[1] = y + 1.5 * Math.sin(Math.PI * v);
  out[2] = z + inz * 1.0 * v;
}

type Part = {
  name: string;
  mesh: THREE.Mesh;
  pos: Float32Array;
  pitch: Float32Array;
  loc: Float32Array;
  ab: Float32Array;
  n: number;
  delay: number;
  mat: THREE.MeshPhysicalMaterial;
  rev: [number, number];
};

function buildPart(
  name: string, nu: number, nv: number,
  fn: (a: number, b: number, out: number[]) => void,
  region: [number, number, number, number],
  mat: THREE.MeshPhysicalMaterial, delay: number, rev: [number, number]
): Part {
  const n = (nu + 1) * (nv + 1);
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3), pitch = new Float32Array(n * 2), uv = new Float32Array(n * 2);
  const loc = new Float32Array(n * 3), ab = new Float32Array(n * 2);
  const o = [0, 0, 0];
  for (let j = 0; j <= nv; j++)
    for (let i = 0; i <= nu; i++) {
      const k = j * (nu + 1) + i;
      const a = i / nu, b = j / nv;
      fn(a, b, o);
      loc[k * 3] = o[0]; loc[k * 3 + 1] = o[1]; loc[k * 3 + 2] = o[2];
      pitch[k * 2] = region[0] + a * (region[1] - region[0]);
      pitch[k * 2 + 1] = region[2] + b * (region[3] - region[2]);
      uv[k * 2] = a; uv[k * 2 + 1] = b;
      ab[k * 2] = a; ab[k * 2 + 1] = b;
    }
  const idx: number[] = [];
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('aPitch', new THREE.BufferAttribute(pitch, 2));
  geo.setIndex(idx);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return {name, mesh, pos, pitch, loc, ab, n, delay, mat, rev};
}

// ------------------------------------------------------------------ ribbons
const NS = 11;
function center(w: number, k: number, ks: number, p: number, t: number, o: number[]) {
  o[0] = (ks - 0.5) * 68 * (1 + 0.5 * p) + p * 7 * Math.sin(6.283 * 0.9 * w + k * 0.9 + t * 0.55);
  o[1] = p * (7 + 34 * Math.pow(Math.sin(Math.PI * clamp01(w)), 0.9) * (0.65 + 0.35 * Math.cos(k * 1.7 + 0.4))) + p * 2.5 * Math.sin(6.283 * (2.2 * w - 0.28 * t) + k);
  o[2] = (w - 0.5) * 105 * (1 - 0.3 * p) + p * 5 * Math.sin(6.283 * 0.7 * w + k * 1.3 + t * 0.4);
}
const _c0 = [0, 0, 0], _c1 = [0, 0, 0], _c2 = [0, 0, 0];
function ribbonPos(x: number, z: number, t: number, out: number[]) {
  const sig = (x + 34) / 68, w = (z + 52.5) / 105;
  const kf = sig * NS;
  const k = Math.min(NS - 1, Math.floor(kf));
  const q = kf - k;
  const ks = (k + 0.5) / NS;
  const delay = 1.4 * Math.abs(ks - 0.5) * 2 + 0.5 * hashf(k);
  const p = sstep(0, 1, (t - 5.0 - delay) / 1.9);
  const gap = sstep(0, 1, (t - 5.4 - delay) / 1.5);
  const s = (q - 0.5) * (68 / NS) * (1 - 0.16 * gap);
  center(w, k, ks, p, t, _c0);
  center(w + 0.004, k, ks, p, t, _c1);
  center(w - 0.004, k, ks, p, t, _c2);
  let tx = _c1[0] - _c2[0], ty = _c1[1] - _c2[1], tz = _c1[2] - _c2[2];
  const tl = Math.hypot(tx, ty, tz) || 1;
  tx /= tl; ty /= tl; tz /= tl;
  const om = p * (1.6 * Math.sin(6.283 * 0.8 * w + k * 1.1) + 0.9 * Math.sin(k * 2.3 + t * 0.7));
  const co = Math.cos(om), si = Math.sin(om);
  // ex = (1,0,0); T x ex = (0, tz, -ty); T.ex = tx
  const ex = [co + tx * tx * (1 - co), tz * si + tx * ty * (1 - co), -ty * si + tx * tz * (1 - co)];
  out[0] = _c0[0] + s * ex[0];
  out[1] = _c0[1] + s * ex[1];
  out[2] = _c0[2] + s * ex[2];
}

// ------------------------------------------------------------------ stadium
function ringSamples(hx: number, hz: number, r: number, off: number) {
  const pts: {x: number; z: number}[] = [];
  const cx = hx - r, cz = hz - r;
  const R = r + off;
  const arc = (sx: number, sz: number, a0: number, m = 14) => {
    for (let i = 0; i <= m; i++) {
      const a = a0 + (i / m) * (Math.PI / 2);
      pts.push({x: sx * cx + R * Math.cos(a) * 1, z: sz * cz + R * Math.sin(a)});
    }
  };
  const line = (x0: number, z0: number, x1: number, z1: number, m: number) => {
    for (let i = 1; i < m; i++) pts.push({x: x0 + ((x1 - x0) * i) / m, z: z0 + ((z1 - z0) * i) / m});
  };
  // CCW from right straight
  line(hx + off, -cz, hx + off, cz, 18);
  arc(1, 1, 0);
  line(cx, hz + off, -cx, hz + off, 12);
  arc(-1, 1, Math.PI / 2);
  line(-hx - off, cz, -hx - off, -cz, 18);
  arc(-1, -1, Math.PI);
  line(-cx, -hz - off, cx, -hz - off, 12);
  arc(1, -1, Math.PI * 1.5);
  return pts;
}
function loft(prof: [number, number][], hx: number, hz: number, r: number, uRep = 32, vRep = 16) {
  const rings = prof.map((p) => ringSamples(hx, hz, r, p[0]));
  const n = rings[0].length;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  // cumulative lengths
  const cum = [0];
  for (let i = 1; i <= n; i++) {
    const a = rings[0][i - 1], b = rings[0][i % n];
    cum.push(cum[i - 1] + Math.hypot(a.x - b.x, a.z - b.z));
  }
  let vc = 0;
  prof.forEach((p, j) => {
    if (j) vc += Math.hypot(p[0] - prof[j - 1][0], p[1] - prof[j - 1][1]);
    for (let i = 0; i <= n; i++) {
      const s = rings[j][i % n];
      pos.push(s.x, p[1], s.z);
      uv.push(cum[i] / uRep, vc / vRep);
    }
  });
  for (let j = 0; j < prof.length - 1; j++)
    for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function glowTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,248,230,1)');
  g.addColorStop(0.18, 'rgba(255,240,215,0.55)');
  g.addColorStop(0.5, 'rgba(255,235,200,0.12)');
  g.addColorStop(1, 'rgba(255,235,200,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------------------------ camera
type Key = [number, number, number, number, number, number, number, number]; // t, pos, tgt, fov
const JC = new THREE.Vector3(0, 52.5, 0);
const orbit = (deg: number, R: number, h: number, ty = 0): [number, number, number, number, number, number] => {
  const a = (deg * Math.PI) / 180;
  return [JC.x + R * Math.sin(a), JC.y + h, JC.z + R * Math.cos(a), JC.x, JC.y + ty, JC.z];
};
const KEYS: Key[] = [
  [0.0, 0, 150, 125, 0, 0, 5, 64],
  [1.2, 0, 70, 90, 0, 0, 6, 58],
  [2.0, 0, 38, 70, 0, 0, 2, 52],
  [3.5, -6, 22, 46, 0, 0, -3, 50],
  [5.0, 0, 13, 22, 0, 1, -8, 56],
  [6.0, 0, 16, 45, 0, 26, 0, 70],
  [7.2, -14, 18, 20, 4, 30, -15, 68],
  [8.4, 0, 42, 52, 0, 50, 0, 58],
  [9.4, 0, 54, 64, 0, 53, 0, 52],
  [10.5, 3, 69, 22, 0, 67, 0, 46],
  [11.6, -4, 66, 19, 0, 64, 0, 46],
  [12.6, -22, 58, 52, 0, 55, 0, 50],
  [13.0, ...orbit(-40, 70, 6), 50],
  [14.5, ...orbit(-12, 66, 9), 48],
  [16.0, ...orbit(16, 60, 11), 46],
  [17.0, ...orbit(30, 62, 9, 10), 46],
  [19.0, ...orbit(38, 66, 8, 17), 46],
  [22.0, ...orbit(44, 66, 8, 17), 46],
] as any;
function camAt(t: number) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const k0 = KEYS[Math.max(0, i - 1)], k1 = KEYS[i], k2 = KEYS[i + 1], k3 = KEYS[Math.min(KEYS.length - 1, i + 2)];
  const h = k2[0] - k1[0];
  const u = clamp01((t - k1[0]) / h);
  const out: number[] = [];
  for (let c = 1; c < 8; c++) {
    const m1 = (k2[c] - k0[c]) / (k2[0] - k0[0]) * h;
    const m2 = (k3[c] - k1[c]) / (k3[0] - k1[0]) * h;
    const u2 = u * u, u3 = u2 * u;
    out.push((2 * u3 - 3 * u2 + 1) * k1[c] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * k2[c] + (u3 - u2) * m2);
  }
  return out;
}

// ------------------------------------------------------------------ world
export function createWorld(canvas: HTMLCanvasElement, W: number, H: number) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const BG = new THREE.Color(0x03060a);
  scene.background = BG;
  scene.fog = new THREE.FogExp2(0x03060a, 0.0016);
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.5, 4000);

  const F: FabricSet = makeFabrics();
  const shared: Shared = makeShared(0);
  const groundShared: Shared = makeShared(1);

  // lights
  const hemi = new THREE.HemisphereLight(0x7f9bb8, 0x0a100a, 0.0);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0dc, 0);
  key.position.set(-40, 100, 90);
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xe6ffd0, 0);
  rim.position.set(60, 70, -90);
  scene.add(rim, rim.target);
  const fill = new THREE.DirectionalLight(0xbfd8ff, 0);
  fill.position.set(70, 20, 60);
  scene.add(fill, fill.target);

  // ---- ground (dark pitch footprint) + far field
  const white = document.createElement('canvas');
  white.width = white.height = 4;
  white.getContext('2d')!.fillStyle = '#fff';
  white.getContext('2d')!.fillRect(0, 0, 4, 4);
  const whiteTex = new THREE.CanvasTexture(white);
  const gGeo = new THREE.PlaneGeometry(68, 105, 1, 1);
  gGeo.rotateX(-Math.PI / 2);
  const gp = new Float32Array(4 * 2);
  for (let i = 0; i < 4; i++) {
    gp[i * 2] = gGeo.attributes.position.getX(i);
    gp[i * 2 + 1] = gGeo.attributes.position.getZ(i);
  }
  gGeo.setAttribute('aPitch', new THREE.BufferAttribute(gp, 2));
  const gMat = makeMorphMaterial(whiteTex, null, F.weave, [1, 1], groundShared, {bump: 0});
  const ground = new THREE.Mesh(gGeo, gMat);
  ground.position.y = -0.06;
  scene.add(ground);

  const apron = new THREE.Mesh(new THREE.CircleGeometry(1800, 48), new THREE.MeshStandardMaterial({color: 0x07090a, roughness: 1}));
  apron.rotation.x = -Math.PI / 2;
  apron.position.y = -0.2;
  scene.add(apron);

  // far city lights
  {
    const r = rng(5);
    const n = 700;
    const p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = 330 + r() * 900;
      p[i * 3] = Math.cos(a) * d; p[i * 3 + 1] = 1 + r() * 30; p[i * 3 + 2] = Math.sin(a) * d;
      const w = r();
      const col = w < 0.5 ? [1, 0.82, 0.55] : w < 0.85 ? [0.8, 0.9, 1] : [0.78, 0.95, 0.42];
      const b = 0.25 + r() * 0.6;
      c[i * 3] = col[0] * b; c[i * 3 + 1] = col[1] * b; c[i * 3 + 2] = col[2] * b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({size: 2.4, vertexColors: true, sizeAttenuation: false, fog: false, toneMapped: false}));
    scene.add(pts);
  }

  // ---- stadium bowl
  const HX = 46, HZ = 64.5, RR = 20;
  const seatMat = new THREE.MeshStandardMaterial({map: F.seats, emissiveMap: F.seatsEmis, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.5, roughness: 0.9, side: THREE.DoubleSide});
  const concrete = new THREE.MeshStandardMaterial({color: 0x23282b, roughness: 0.95, side: THREE.DoubleSide});
  const board = new THREE.MeshStandardMaterial({color: 0x0c0f10, roughness: 0.6, emissive: 0x1a2a05, emissiveIntensity: 0.6, side: THREE.DoubleSide});
  const bowl = new THREE.Group();
  bowl.add(new THREE.Mesh(loft([[0, 0], [0, 2.4]], HX, HZ, RR, 20, 4), board));
  const lower = new THREE.Mesh(loft([[0, 2.4], [19, 18]], HX, HZ, RR, 28, 14), seatMat);
  bowl.add(lower);
  bowl.add(new THREE.Mesh(loft([[19, 18], [19, 20.5], [23, 20.5]], HX, HZ, RR, 28, 10), concrete));
  const upper = new THREE.Mesh(loft([[23, 20.5], [47, 47]], HX, HZ, RR, 28, 16), seatMat);
  bowl.add(upper);
  bowl.add(new THREE.Mesh(loft([[47, 47], [47, 0]], HX, HZ, RR, 30, 10), new THREE.MeshStandardMaterial({color: 0x15191b, roughness: 0.7, emissive: 0x0b1204, side: THREE.DoubleSide})));
  bowl.add(new THREE.Mesh(loft([[47, 47], [47, 49.5], [36, 53], [36, 51.6], [47, 47.8]], HX, HZ, RR, 30, 10), new THREE.MeshStandardMaterial({color: 0x101315, roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide})));
  // lit ring strip on roof edge
  const ringMat = new THREE.MeshBasicMaterial({color: new THREE.Color(0.58, 0.9, 0.15).multiplyScalar(0.0), toneMapped: false});
  bowl.add(new THREE.Mesh(loft([[47.2, 49.5], [47.2, 50.2]], HX, HZ, RR, 30, 10), ringMat));
  scene.add(bowl);

  // ---- floodlight towers
  const gl = glowTex();
  const towers: any[] = [];
  const tpos: [number, number][] = [[-80, -99], [80, -99], [-80, 99], [80, 99]];
  const lampCanvas = document.createElement('canvas');
  lampCanvas.width = 96; lampCanvas.height = 64;
  {
    const x = lampCanvas.getContext('2d')!;
    x.fillStyle = '#000'; x.fillRect(0, 0, 96, 64);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) {
      const g = x.createRadialGradient(8 + i * 16, 8 + j * 16, 0, 8 + i * 16, 8 + j * 16, 7);
      g.addColorStop(0, '#fff'); g.addColorStop(0.6, '#fff3dc'); g.addColorStop(1, '#000');
      x.fillStyle = g; x.fillRect(i * 16, j * 16, 16, 16);
    }
  }
  const lampTex = new THREE.CanvasTexture(lampCanvas);
  lampTex.colorSpace = THREE.SRGBColorSpace;
  tpos.forEach(([tx, tz], i) => {
    const g = new THREE.Group();
    g.position.set(tx, 0, tz);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.6, 82, 8), new THREE.MeshStandardMaterial({color: 0x20262a, roughness: 0.6, metalness: 0.5}));
    pole.position.y = 41;
    g.add(pole);
    const rig = new THREE.Group();
    rig.position.set(0, 80, 0);
    rig.lookAt(new THREE.Vector3(-tx, 80 - 80, -tz).sub(new THREE.Vector3(0, 0, 0)).add(new THREE.Vector3(0, 80, 0)));
    const back = new THREE.Mesh(new THREE.BoxGeometry(24, 16, 1.2), new THREE.MeshStandardMaterial({color: 0x14181a, roughness: 0.5, metalness: 0.5}));
    rig.add(back);
    const lampMat = new THREE.MeshBasicMaterial({map: lampTex, color: new THREE.Color(0, 0, 0), toneMapped: false});
    const lamps = new THREE.Mesh(new THREE.PlaneGeometry(22, 14.5), lampMat);
    lamps.position.z = 0.7;
    rig.add(lamps);
    const sp = new THREE.SpriteMaterial({map: gl, color: 0xfff1d8, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, toneMapped: false, fog: false});
    const spr = new THREE.Sprite(sp);
    spr.scale.set(120, 120, 1);
    spr.position.z = 3;
    rig.add(spr);
    g.add(rig);
    scene.add(g);
    // spot
    const spot = new THREE.SpotLight(0xfff1de, 0, 0, 0.36, 0.7, 0);
    spot.position.set(tx, 80, tz);
    scene.add(spot, spot.target);
    // beam cone
    const cg = new THREE.ConeGeometry(1, 1, 40, 1, true);
    cg.translate(0, -0.5, 0);
    const bm = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
      uniforms: {uOp: {value: 0}},
      vertexShader: `varying vec3 vN; varying vec3 vV; varying float vA;
        void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vA = -position.y; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform float uOp; varying vec3 vN; varying vec3 vV; varying float vA;
        void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 1.6); float a = uOp * f * (0.9 - 0.75*vA) ; gl_FragColor = vec4(vec3(1.0,0.93,0.8)*a, a); }`,
    });
    const cone = new THREE.Mesh(cg, bm);
    cone.frustumCulled = false;
    scene.add(cone);
    towers.push({g, rig, lampMat, sp, spot, cone, bm, pos: new THREE.Vector3(tx, 80, tz)});
  });

  // ---- jersey parts
  const parts: Part[] = [];
  const wr = (w: number, h: number): [number, number] => [w / 0.9, h / 0.9];
  const mk = (base: THREE.Texture, over: THREE.Texture, rep: [number, number], axis = 0) => makeMorphMaterial(base, over, F.weave, rep, shared, {revAxis: axis});
  parts.push(buildPart('front', 112, 60, (a, b, o) => bodyPoint(a, b, true, o), [-34, 34, -52.5, -20], mk(F.frontBase, F.frontOver, wr(23.6, 33)), 0.0, [9.9, 12.2]));
  parts.push(buildPart('back', 112, 60, (a, b, o) => bodyPoint(a, b, false, o), [-34, 34, -20, 13], mk(F.backBase, F.backOver, wr(23.6, 33)), 0.3, [10.0, 12.2]));
  parts.push(buildPart('sleeveR', 56, 40, (a, b, o) => sleevePoint(a, b, true, o), [0, 34, 13, 40], mk(F.sleeveBase, F.sleeveOver, wr(28, 11)), 0.6, [11.0, 12.5]));
  parts.push(buildPart('sleeveL', 56, 40, (a, b, o) => sleevePoint(a, b, false, o), [-34, 0, 13, 40], mk(F.sleeveBase, F.sleeveOver, wr(28, 11)), 0.75, [11.0, 12.5]));
  parts.push(buildPart('collar', 200, 10, (a, b, o) => collarPoint(a, b, o), [-34, 34, 40, 52.5], mk(F.collarBase, F.collarOver, wr(22, 2.6), 1), 1.0, [10.5, 11.8]));
  parts.forEach((p) => scene.add(p.mesh));

  const _o = [0, 0, 0], _r = [0, 0, 0];
  const M = new THREE.Matrix4(), Q = new THREE.Euler(), V = new THREE.Vector3();

  function lightLevel(i: number, t: number) {
    // tower i
    let v = 0;
    if (t < 1.1) v = 1;
    else if (t < 1.16) v = 0.35;
    else if (t < 1.2) v = 0.9;
    else if (t < 1.24) v = 0.0 + (t < 1.22 ? 0.4 : 0);
    else v = 0;
    const T = 13.45 + 0.7 * i;
    const u = t - T;
    if (u >= 0) {
      if (u < 0.1) v = 0.65;
      else if (u < 0.18) v = 0.05;
      else if (u < 0.28) v = 0.85;
      else if (u < 0.34) v = 0.2;
      else v = Math.min(1, 0.75 + (u - 0.34) * 1.2);
    }
    return v;
  }

  function update(t: number) {
    // ----- global shader state
    const lit = t < 1.2 ? 1 : 0;
    const sigOn = sstep(1.2, 1.32, t);
    const spread = t < 2.0 ? 0.35 : 0.35 + 95 * Math.pow(sstep(2.0, 5.2, t), 1.25);
    const front = t < 5.2 ? 0 : 150 * Math.pow(sstep(5.2, 8.8, t), 1.0) + 0.0;
    const warp = 3.4 * sstep(2.3, 3.6, t) * (1 - sstep(4.4, 5.4, t));
    [shared, groundShared].forEach((s) => {
      s.uTime.value = t;
      s.uSig.value = sigOn * (t < 2 ? 1.0 : 1.0);
      s.uSpread.value = spread;
      s.uWarp.value = warp;
      s.uWhite.value = lit;
    });
    shared.uFront.value = front;
    groundShared.uFront.value = -100;
    groundShared.uSpread.value = t < 9 ? spread : 200;
    groundShared.uSig.value = sigOn * (t < 9 ? 1 : 0.5 + 0.5 * (1 - sstep(9, 12, t)) + 0.25);
    groundShared.uWhite.value = lit;

    // ----- lights
    let hemiI = 0.0;
    towers.forEach((tw, i) => {
      const L = lightLevel(i, t);
      tw.lampMat.color.setScalar(L * 3.2);
      tw.sp.opacity = L * 0.9;
      tw.spot.intensity = L * 1.9;
      tw.bm.uniforms.uOp.value = L * 0.2;
      hemiI += L * 0.18;
      // aim: pitch centre -> jersey centre
      const aim = new THREE.Vector3(0, 0, 0).lerp(JC, sstep(8.6, 12.5, t));
      tw.spot.target.position.copy(aim);
      tw.spot.target.updateMatrixWorld();
      const dir = aim.clone().sub(tw.pos);
      const len = dir.length();
      dir.normalize();
      const rad = Math.tan(0.36) * len * 0.95;
      tw.cone.position.copy(tw.pos);
      tw.cone.scale.set(rad, len, rad);
      tw.cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      tw.rig.lookAt(aim.x, aim.y, aim.z);
    });
    const dark = 0.012;
    hemi.intensity = dark + hemiI * 0.45;
    // cinematic lights: fade in with the world-becomes-fabric moment
    const cine = sstep(4.6, 6.2, t);
    key.intensity = cine * (1.5 - 0.5 * sstep(13, 15, t));
    rim.intensity = cine * 1.3;
    fill.intensity = cine * 0.35;
    key.target.position.copy(JC.clone().multiplyScalar(sstep(8, 10, t)));
    key.target.updateMatrixWorld();
    // stands + ring glow when floodlights are on
    const fl = (towers.reduce((s, _, i) => s + lightLevel(i, t), 0)) / 4;
    seatMat.emissiveIntensity = 0.35 + fl * 0.5;
    ringMat.color.setRGB(0.58, 0.9, 0.15).multiplyScalar(0.25 + 0.5 * sstep(2, 5, t) * 1.0 + fl * 0.4);

    // ----- jersey transform
    const yaw = 0.05 * Math.sin(0.7 * t), tilt = 0.02 * Math.sin(0.5 * t);
    M.makeRotationFromEuler(Q.set(tilt, yaw, 0));
    const bob = 0.5 * Math.sin(1.1 * t);
    const JYO = 36;
    const visible = t > 4.0;
    parts.forEach((P) => {
      P.mat.userData.own.uReveal.value = sstep(P.rev[0], P.rev[1], t) * 1.06;
      const pos = P.pos;
      for (let k = 0; k < P.n; k++) {
        const px = P.pitch[k * 2], pz = P.pitch[k * 2 + 1];
        let x: number, y: number, z: number;
        if (t < 5.0) {
          x = px; y = 0; z = pz;
        } else {
          ribbonPos(px, pz, t, _r);
          x = _r[0]; y = _r[1]; z = _r[2];
        }
        const a = P.ab[k * 2], b = P.ab[k * 2 + 1];
        const dv = 0.3 * (a * 0.5 + b * 0.5);
        const e = ease3((t - 8.9 - P.delay - dv) / 1.9);
        if (e > 0) {
          V.set(P.loc[k * 3], P.loc[k * 3 + 1], P.loc[k * 3 + 2]).applyMatrix4(M);
          const tx = V.x, ty = V.y + JYO + bob, tz = V.z;
          let mx = x + (tx - x) * e, my = y + (ty - y) * e, mz = z + (tz - z) * e;
          const dx = tx - x, dz = tz - z;
          const pl = Math.hypot(dx, dz) || 1;
          const swirl = Math.sin(Math.PI * e) * (4 + 3 * hashf(k * 0.13 + P.delay));
          mx += (-dz / pl) * swirl;
          mz += (dx / pl) * swirl;
          my += Math.sin(Math.PI * e) * 6;
          x = mx; y = my; z = mz;
        }
        pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z;
      }
      const g = P.mesh.geometry;
      (g.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      g.computeVertexNormals();
      P.mesh.visible = true;
    });
    void visible;

    // ----- camera
    const c = camAt(Math.min(t, 22));
    // impact shake
    const sh = (t0: number, amp: number) => (t >= t0 ? amp * Math.exp(-(t - t0) * 7) : 0);
    const s1 = sh(1.2, 0.9) + sh(13.0, 1.1);
    const sx = s1 * Math.sin(t * 61), sy = s1 * Math.sin(t * 47 + 1.3);
    camera.position.set(c[0] + sx * 0.5, c[1] + sy * 0.4, c[2]);
    camera.fov = c[6];
    camera.updateProjectionMatrix();
    camera.lookAt(c[3], c[4], c[5]);
    camera.rotateZ(s1 * 0.004 * Math.sin(t * 33));
    renderer.render(scene, camera);
  }
  return {update, renderer};
}
