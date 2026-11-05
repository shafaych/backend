import * as THREE from 'three';

export type Shared = {
  uTime: { value: number };
  uFront: { value: number };
  uSpread: { value: number };
  uWarp: { value: number };
  uSig: { value: number };
  uWhite: { value: number };
  uGround: { value: number };
};

export const makeShared = (ground = 0): Shared => ({
  uTime: { value: 0 },
  uFront: { value: 0 },
  uSpread: { value: 0.35 },
  uWarp: { value: 0 },
  uSig: { value: 0 },
  uWhite: { value: 1 },
  uGround: { value: ground },
});

const COMMON = /* glsl */ `
uniform float uTime, uFront, uSpread, uWarp, uSig, uWhite, uGround;
uniform float uReveal, uRevAxis;
uniform sampler2D uOver;
varying vec2 vPitch;
vec3 gEm;
float sdBox(vec2 p, vec2 b){ vec2 d = abs(p)-b; return length(max(d,0.0)) + min(max(d.x,d.y),0.0); }
float markDist(vec2 p){
  float d = abs(sdBox(p, vec2(34.0,52.5)));
  d = min(d, abs(p.y));
  d = min(d, abs(length(p)-9.15));
  vec2 q = vec2(p.x, abs(p.y));
  d = min(d, abs(sdBox(q-vec2(0.0,52.5-8.25), vec2(20.16,8.25))));
  d = min(d, abs(sdBox(q-vec2(0.0,52.5-2.75), vec2(9.16,2.75))));
  vec2 ps = q-vec2(0.0,52.5-11.0);
  float arc = abs(length(ps)-9.15);
  if (q.y > 52.5-16.5) arc = 1e3;
  d = min(d, arc);
  d = min(d, length(ps)-0.25);
  d = min(d, length(p)-0.3);
  return d;
}
float hash21(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
`;

export function makeMorphMaterial(
  base: THREE.Texture,
  over: THREE.Texture | null,
  weave: THREE.Texture,
  weaveRepeat: [number, number],
  shared: Shared,
  opts: { revAxis?: number; bump?: number } = {}
) {
  const wv = weave.clone();
  wv.wrapS = wv.wrapT = THREE.RepeatWrapping;
  wv.repeat.set(weaveRepeat[0], weaveRepeat[1]);
  wv.needsUpdate = true;
  const mat = new THREE.MeshPhysicalMaterial({
    map: base,
    bumpMap: wv,
    bumpScale: opts.bump ?? 2.2,
    roughness: 0.82,
    metalness: 0.0,
    sheen: 0.4,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(0.35, 0.4, 0.35),
    side: THREE.DoubleSide,
  });
  const own = {
    uReveal: { value: 0 },
    uRevAxis: { value: opts.revAxis ?? 0 },
    uOver: { value: over },
  };
  (mat as any).userData.own = own;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared, own);
    sh.vertexShader = sh.vertexShader
      .replace('void main() {', 'attribute vec2 aPitch;\nvarying vec2 vPitch;\nvoid main() {\n vPitch = aPitch;')
      ;
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', COMMON + '\nvoid main() {\n gEm = vec3(0.0);')
      .replace(
        '#include <map_fragment>',
        /* glsl */ `
        #include <map_fragment>
        vec3 fabricCol = diffuseColor.rgb;
        float revC = uRevAxis < 0.5 ? vMapUv.y : vMapUv.x;
        float revMask = 1.0 - smoothstep(uReveal - 0.035, uReveal, revC);
        float revEdge = exp(-pow((revC - uReveal + 0.012)/0.014, 2.0)) * step(0.001, uReveal) * step(uReveal, 1.02);
        #ifdef HAS_OVER
        vec4 ov = texture2D(uOver, vMapUv);
        fabricCol = mix(fabricCol, ov.rgb, ov.a * revMask);
        #endif
        gEm += vec3(0.58,0.9,0.15) * revEdge * 2.6;

        // ---- procedural pitch ----
        vec2 p = vPitch;
        vec2 wp = p + vec2(sin(p.y*0.33 - uTime*2.1) * uWarp, sin(p.x*0.27 + uTime*1.5) * uWarp * 0.8);
        float stripe = mod(floor((p.y + 52.5)/7.5), 2.0);
        vec3 grass = mix(vec3(0.010,0.085,0.016), vec3(0.016,0.125,0.024), stripe);
        float gn = hash21(floor(p*7.0));
        grass *= 0.8 + 0.4*gn;
        float dm = markDist(wp);
        float line = 1.0 - smoothstep(0.10, 0.20, dm);
        vec3 pitchCol = mix(grass, vec3(0.62), line * uWhite);
        pitchCol *= mix(1.0, 0.16, uGround);
        float vis = 1.0 - smoothstep(uSpread, uSpread + 2.0, abs(wp.y));
        float core = 1.0 - smoothstep(0.07, 0.17, dm);
        float glow = exp(-dm*1.1) * 0.28 + exp(-dm*5.0)*0.5;
        float front = exp(-pow((abs(wp.y) - uSpread)/1.3, 2.0)) * step(1.0, uSpread) * step(uSpread, 100.0);
        vec2 gc = abs(fract(wp/4.0 + 0.5) - 0.5)*4.0;
        float grid = 1.0 - smoothstep(0.03, 0.09, min(gc.x, gc.y));
        float gridMask = (1.0 - smoothstep(0.0, 18.0, abs(wp.y) - uSpread + 18.0)) ;
        vec3 limeL = vec3(0.58,0.9,0.15);
        vec3 pem = limeL * ((core*2.4 + glow) * vis + front*1.6 + grid*0.16*vis) * uSig;
        pem *= mix(1.0, 0.55, uGround);
        float d0 = length(p*vec2(1.0,0.7));
        float fab = 1.0 - smoothstep(uFront - 7.0, uFront, d0);
        float ring = exp(-pow((d0 - uFront + 3.0)/1.4, 2.0)) * step(0.5, uFront) * step(uFront, 140.0);
        diffuseColor.rgb = mix(pitchCol, fabricCol, fab);
        gEm += pem * (1.0 - fab) + limeL * ring * 2.2;
        `
      )
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += gEm;');
    if (over) sh.fragmentShader = '#define HAS_OVER\n' + sh.fragmentShader;
  };
  mat.customProgramCacheKey = () => 'morph' + (over ? 'O' : 'N');
  return mat;
}
