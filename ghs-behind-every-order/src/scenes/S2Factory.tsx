import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../Scene';
import {C, CUES, MONO, SANS, clamp, easeOut, keyframe, prog} from '../theme';

const S = 38; // world unit in px
const CX = 640, CY = 470;
const iso = (x: number, y: number, z = 0): [number, number] => [CX + (x - y) * 0.866 * S, CY + (x + y) * 0.5 * S - z * S];
const pts = (a: [number, number][]) => a.map((p) => p.join(',')).join(' ');

type BoxDef = {x: number; y: number; w: number; d: number; h: number; z?: number};
type Zone = {key: string; name: string; note: string; ox: number; oy: number; w: number; d: number; boxes: BoxDef[]};

const sewBoxes: BoxDef[] = [];
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
  sewBoxes.push({x: 0.6 + c * 1.5, y: 0.6 + r * 1.5, w: 0.9, d: 0.9, h: 0.6});
  sewBoxes.push({x: 0.85 + c * 1.5, y: 0.85 + r * 1.5, w: 0.4, d: 0.4, h: 0.45, z: 0.6});
}
const ZONES: Zone[] = [
  {key: 'cut', name: 'CUTTING', note: 'Fabric is cut to pattern', ox: 0, oy: 0, w: 5, d: 5, boxes: [
    {x: 0.6, y: 0.6, w: 3.8, d: 1.4, h: 0.5}, {x: 0.8, y: 2.6, w: 1.2, d: 1.2, h: 0.9}, {x: 2.4, y: 2.6, w: 1.2, d: 1.2, h: 0.9}, {x: 3.9, y: 2.8, w: 0.9, d: 0.9, h: 0.5}]},
  {key: 'sew', name: 'SEWING', note: 'Panels are assembled', ox: 6, oy: 0, w: 5, d: 5, boxes: sewBoxes},
  {key: 'sub', name: 'SUBLIMATION', note: 'Custom graphics are printed and heat-applied', ox: 6, oy: 6, w: 5, d: 5, boxes: [
    {x: 0.5, y: 0.6, w: 4.0, d: 1.4, h: 0.9}, {x: 0.9, y: 2.8, w: 1.6, d: 1.6, h: 0.8}, {x: 3.2, y: 3.0, w: 1.2, d: 1.2, h: 0.6}]},
  {key: 'emb', name: 'EMBROIDERY', note: 'Logos and details are stitched', ox: 0, oy: 6, w: 5, d: 5, boxes: [
    {x: 0.5, y: 0.8, w: 0.9, d: 1.3, h: 1.1}, {x: 1.6, y: 0.8, w: 0.9, d: 1.3, h: 1.1}, {x: 2.7, y: 0.8, w: 0.9, d: 1.3, h: 1.1}, {x: 3.8, y: 0.8, w: 0.9, d: 1.3, h: 1.1},
    {x: 0.5, y: 2.9, w: 2.2, d: 1.4, h: 0.5}]},
  {key: 'qc', name: 'QUALITY CONTROL', note: 'Finished pieces are checked', ox: 0, oy: 12, w: 11, d: 5, boxes: [
    {x: 0.8, y: 1.2, w: 3.6, d: 2.2, h: 0.55}, {x: 6.4, y: 1.2, w: 3.6, d: 2.2, h: 0.55}, {x: 5.0, y: 3.4, w: 1.0, d: 1.0, h: 0.6},
    {x: 0.8, y: 1.2, w: 0.15, d: 0.15, h: 1.8, z: 0.55}, {x: 4.25, y: 1.2, w: 0.15, d: 0.15, h: 1.8, z: 0.55}, {x: 0.8, y: 1.2, w: 3.6, d: 0.12, h: 0.1, z: 2.35}]},
];
const center = (z: Zone): [number, number] => iso(z.ox + z.w / 2, z.oy + z.d / 2, 0);

const Box: React.FC<{b: BoxDef; ox: number; oy: number; grow: number; active: boolean}> = ({b, ox, oy, grow, active}) => {
  const x = ox + b.x, y = oy + b.y, z = b.z ?? 0, h = b.h * grow;
  const top = [iso(x, y, z + h), iso(x + b.w, y, z + h), iso(x + b.w, y + b.d, z + h), iso(x, y + b.d, z + h)];
  const left = [iso(x, y + b.d, z), iso(x + b.w, y + b.d, z), iso(x + b.w, y + b.d, z + h), iso(x, y + b.d, z + h)];
  const right = [iso(x + b.w, y, z), iso(x + b.w, y + b.d, z), iso(x + b.w, y + b.d, z + h), iso(x + b.w, y, z + h)];
  const st = active ? C.lime : C.porcelain;
  return (
    <g strokeLinejoin="round" strokeWidth={1.4} stroke={st} strokeOpacity={0.75}>
      <polygon points={pts(left)} fill={C.graphiteDark} />
      <polygon points={pts(right)} fill={C.graphite} />
      <polygon points={pts(top)} fill={C.graphiteLight} />
    </g>
  );
};

export const S2Factory: React.FC = () => {
  const t = useT();
  const s2 = CUES.s2;
  const start = CUES.scenes[1];
  const zc = ZONES.map(center);
  const floorC = iso(5.5, 8.5, 0);
  const times = [start, ...s2.zones, 11.9, 15];
  const scale = keyframe(t, times, [1.1, 1.4, 1.4, 1.4, 1.4, 1.4, 1.0, 1.0]);
  const fx = keyframe(t, times, [zc[0][0], zc[0][0], zc[1][0], zc[2][0], zc[3][0], zc[4][0], floorC[0], floorC[0]]);
  const fy = keyframe(t, times, [zc[0][1], zc[0][1], zc[1][1], zc[2][1], zc[3][1], zc[4][1], floorC[1], floorC[1]]);
  const gridP = prog(t, start + 0.05, 1.0);
  const lineP = prog(t, s2.lines, 3.8, (x) => clamp(x));

  // sorted draw list for painter's algorithm
  type Item = {zi: number; b: BoxDef; key: number};
  const items: Item[] = [];
  ZONES.forEach((z, zi) => z.boxes.forEach((b) => items.push({zi, b, key: z.ox + b.x + b.w / 2 + z.oy + b.y + b.d / 2 + (b.z ?? 0) * 0.01})));
  items.sort((a, b) => a.key - b.key);

  const path = zc.map((p) => p.join(',')).join(' ');
  let curZone = -1;
  s2.zones.forEach((zt, i) => { if (t >= zt) curZone = i; });
  const captionIn = t < s2.t1;
  const capP = curZone >= 0 ? prog(t, s2.zones[curZone], 0.45) : 0;
  const titleOut = 1 - prog(t, s2.t1 - 0.3, 0.35);

  return (
    <AbsoluteFill>
      {/* blueprint grid */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.55 * gridP}}>
        {Array.from({length: 28}).map((_, i) => <line key={'h' + i} x1={0} x2={1080} y1={i * 72} y2={i * 72} stroke={C.graphite} strokeOpacity={0.5} />)}
        {Array.from({length: 16}).map((_, i) => <line key={'v' + i} y1={0} y2={1920} x1={i * 72} x2={i * 72} stroke={C.graphite} strokeOpacity={0.5} />)}
      </svg>

      <div style={{position: 'absolute', left: 80, top: 150, fontFamily: MONO, fontSize: 28, letterSpacing: 4, color: C.lime, opacity: gridP}}>
        ILLUSTRATIVE FACILITY SCHEMATIC
      </div>

      <svg width={1080} height={1300} style={{position: 'absolute', left: 0, top: 220, overflow: 'hidden'}} viewBox="0 220 1080 1300">
        <g transform={`translate(540 760) scale(${scale}) translate(${-fx} ${-fy})`}>
          {/* zone floors */}
          {ZONES.map((z, i) => {
            const act = t >= s2.zones[i];
            const p = prog(t, s2.zones[i], 0.5);
            const poly = [iso(z.ox, z.oy), iso(z.ox + z.w, z.oy), iso(z.ox + z.w, z.oy + z.d), iso(z.ox, z.oy + z.d)];
            const draw = prog(t, start + 0.1 + i * 0.12, 0.9);
            return (
              <polygon key={z.key} points={pts(poly)} fill={act ? C.lime : 'none'} fillOpacity={0.12 * p}
                stroke={act ? C.lime : C.porcelain} strokeOpacity={act ? 1 : 0.4 * draw} strokeWidth={act ? 3 : 1.6}
                strokeDasharray={act ? undefined : '10 8'} strokeLinejoin="round" />
            );
          })}
          {/* flow path */}
          <polyline points={path} fill="none" stroke={C.lime} strokeWidth={2.5} strokeDasharray="8 8" strokeOpacity={0.9}
            pathLength={1} style={{strokeDashoffset: -t * 20}} opacity={clamp((t - s2.lines) / 0.6)} />
          {/* boxes */}
          {items.map((it, i) => {
            const z = ZONES[it.zi];
            if (t < s2.zones[it.zi]) return null;
            const g = easeOut((t - s2.zones[it.zi] - (it.b.z ?? 0) * 0.15) / 0.7);
            return <Box key={i} b={it.b} ox={z.ox} oy={z.oy} grow={g} active={curZone === it.zi} />;
          })}
          {/* zone labels */}
          {ZONES.map((z, i) => {
            if (t < s2.zones[i] + 0.15) return null;
            const p = prog(t, s2.zones[i] + 0.15, 0.5);
            const [lx, ly] = iso(z.ox + z.w / 2, z.oy + 0.2, 2.9);
            const [bx, by] = iso(z.ox + z.w / 2, z.oy + 0.2, 0);
            const wTxt = z.name.length * 20 + 70;
            return (
              <g key={z.key} opacity={p}>
                <line x1={bx} y1={by} x2={lx} y2={ly} stroke={C.lime} strokeWidth={2} />
                <rect x={lx - wTxt / 2} y={ly - 44 * p} width={wTxt} height={44} rx={4} fill={C.carbon} stroke={C.lime} strokeWidth={2} />
                <text x={lx - wTxt / 2 + 20} y={ly - 13 * p} fontFamily={MONO} fontWeight={700} fontSize={26} fill={C.lime}>{`0${i + 1}`}</text>
                <text x={lx - wTxt / 2 + 62} y={ly - 13 * p} fontFamily={MONO} fontWeight={700} fontSize={26} fill={C.porcelain}>{z.name}</text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* zone caption */}
      {captionIn && curZone >= 0 ? (
        <div style={{position: 'absolute', left: 80, right: 80, top: 1450, opacity: capP * titleOut}}>
          <div style={{fontFamily: MONO, fontSize: 34, color: C.lime, letterSpacing: 4}}>{`0${curZone + 1} / 05`}</div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 88, color: C.white, letterSpacing: -2, marginTop: 8}}>{ZONES[curZone].name}</div>
          <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.porcelain, marginTop: 6}}>{ZONES[curZone].note}</div>
        </div>
      ) : null}

      {/* identity block */}
      <div style={{position: 'absolute', left: 80, right: 80, top: 1380}}>
        {[
          {k: s2.t1, el: <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 90, color: C.white, letterSpacing: -2}}>GHS CUSTOM GEAR</div>},
          {k: s2.t2, el: <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 37, color: C.lime, letterSpacing: 0, marginTop: 14}}>IN-HOUSE SPORTSWEAR MANUFACTURING</div>},
          {k: s2.t3, el: <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.porcelain, letterSpacing: 5, marginTop: 20}}>SIALKOT, PAKISTAN</div>},
        ].map((r, i) => {
          const p = prog(t, r.k, 0.6);
          return <div key={i} style={{opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>{r.el}</div>;
        })}
        <div style={{height: 4, width: 920 * prog(t, s2.t3, 1.0), background: C.lime, marginTop: 30}} />
        <div style={{fontFamily: MONO, fontSize: 31, color: C.porcelain, marginTop: 24, lineHeight: 1.4, opacity: prog(t, s2.t3 + 0.4, 0.6)}}>
          ILLUSTRATIVE SCHEMATIC. NOT ACTUAL FOOTAGE<br />OR INDEPENDENTLY VERIFIED FACILITY EVIDENCE.
        </div>
      </div>
    </AbsoluteFill>
  );
};
