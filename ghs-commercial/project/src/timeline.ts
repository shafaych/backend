// All times in seconds. Source = ssstik.io_1793799012180.mp4 (25.8s, 576x1024, 30fps).
export const FPS = 30;
export const TOTAL_FRAMES = 735; // 24.5s
export const C = {carbon:'#171917', graphite:'#333832', lime:'#C8F36B', porcelain:'#F5F5F0', white:'#FFFFFF', thread:'#4A90D9'};

export type Shot = {id:string; src:number; dur:number; rate:number; z0:number; z1:number; ox:number; oy:number; dx?:number; dy?:number};
// dur = SOURCE seconds used; film length = dur / rate
export const SHOTS: Shot[] = [
  {id:'A-screen',   src:0.5,  dur:2.5, rate:1,    z0:1.0,  z1:1.22, ox:.22, oy:.40},        // monitor -> natural whip-pan to printer (src 2.4-2.9)
  {id:'B-printer',  src:3.0,  dur:2.6, rate:1,    z0:1.0,  z1:1.10, ox:.75, oy:.58},        // sublimation print, head travelling
  {id:'C-fabric',   src:6.6,  dur:2.7, rate:1,    z0:1.02, z1:1.14, ox:.60, oy:.55},        // printed fabric handled
  {id:'D-bundle',   src:9.6,  dur:1.2, rate:1,    z0:1.12, z1:1.22, ox:.40, oy:.55},        // cut fabric / garment bundle
  {id:'E-sew-wide', src:12.1, dur:1.3, rate:.85,  z0:1.0,  z1:1.08, ox:.60, oy:.50},
  {id:'F-sew-tight',src:13.4, dur:1.2, rate:.85,  z0:1.22, z1:1.30, ox:.60, oy:.40},
  {id:'G-sew-hands',src:14.6, dur:0.8, rate:.85,  z0:1.0,  z1:1.10, ox:.35, oy:.55},
  {id:'H-garments', src:15.65,dur:1.85, rate:1,    z0:1.0,  z1:1.10, ox:.50, oy:.55},        // real adjacency to sewing (src dark gap 15.47-15.63 skipped)
  {id:'I-handling', src:18.0, dur:3.15, rate:1,    z0:1.05, z1:1.12, ox:.50, oy:.55},
  {id:'J-reveal',   src:21.75,dur:1.2 ,rate:.6,   z0:1.08, z1:1.20, ox:.70, oy:.55},        // speed ramp: 60% only, applied once
];
export const shotLen = (s:Shot)=> s.dur/s.rate;
export const shotStarts = (()=>{let t=0;return SHOTS.map(s=>{const a=t;t+=shotLen(s);return a;});})();
export const VIDEO_END = SHOTS.reduce((a,s)=>a+shotLen(s),0); // ~20.46s
