import clips from './clips.json';
export const PRE = 9; // near-black pause before the first image + bass impact
export type Clip = {id: string; src: string; frames: number; rate: number; label: string; start: number};
let t = PRE;
export const CLIPS: Clip[] = clips.map((c) => {
  const out = {...c, start: t};
  t += c.frames;
  return out;
});
export const FOOTAGE_END = t; // 400
export const WIPE_START = FOOTAGE_END - 14;
export const WIPE_END = FOOTAGE_END + 4;
export const BRAND_START = WIPE_END;
export const TOTAL = 525;
export const start = (id: string) => CLIPS.find((c) => c.id === id)!.start;
export const C = {carbon: '#171917', graphite: '#333832', lime: '#C8F36B', porcelain: '#F5F5F0'};
