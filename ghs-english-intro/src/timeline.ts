// All timing for the edit lives here. Narration timing is ESTIMATED (words / pace)
// until a real English voice track is supplied -- see README.md to re-time.
export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const INTRO_SECONDS = 5.5; // original talking head, original Urdu audio
export const NARRATION_START = 5.9;
export const WORDS_PER_SECOND = 2.5;
export const PAUSE = 0.4;
export const END_CARD_SECONDS = 3.0;

export type Line = {id: number; text: string};

// Approved English marketing script (supplied by the owner). NOT a verified transcript of the Urdu recording.
export const LINES: Line[] = [
  {id: 1, text: "If you're looking for a reliable manufacturer for your sportswear brand or team, let me show you what we do."},
  {id: 2, text: "We're GHS Custom Gear, a custom sportswear manufacturer based in Sialkot, Pakistan."},
  {id: 3, text: 'We run our own manufacturing facility, producing custom soccer uniforms, basketball jerseys, American football uniforms, tracksuits, hoodies, and training wear.'},
  {id: 4, text: 'From fabric selection and cutting to stitching, sublimation printing, and embroidery, our experienced production team handles the manufacturing process.'},
  {id: 5, text: 'Our priority goes beyond making products. We focus on quality, accurate customization, and dependable manufacturing.'},
  {id: 6, text: 'We also offer custom designs, private labeling, and bulk production.'},
  {id: 7, text: "And here's something important: our minimum order quantity starts at just ten pieces."},
];

const words = (t: string) => t.trim().split(/\s+/).length;

export const SEGMENTS = (() => {
  let t = NARRATION_START;
  return LINES.map((l) => {
    const speech = words(l.text) / WORDS_PER_SECOND;
    const seg = {...l, start: t, speechEnd: t + speech, end: t + speech + PAUSE};
    t = seg.end;
    return seg;
  });
})();

export const NARRATION_END = SEGMENTS[SEGMENTS.length - 1].end;
export const END_CARD_START = NARRATION_END;
export const TOTAL_SECONDS = END_CARD_START + END_CARD_SECONDS;
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);
export const f = (s: number) => Math.round(s * FPS);

export type ClipId = 'talkinghead' | 'stitching' | 'finishing' | 'packing_team' | 'finished_stacks';
export const CLIPS: Record<ClipId, {file: string; landscape: boolean; seconds: number}> = {
  talkinghead: {file: 'clips/talkinghead.mp4', landscape: false, seconds: 54.5},
  stitching: {file: 'clips/stitching.mp4', landscape: false, seconds: 31.7},
  finishing: {file: 'clips/finishing.mp4', landscape: false, seconds: 8.3},
  packing_team: {file: 'clips/packing_team.mp4', landscape: true, seconds: 21.6},
  finished_stacks: {file: 'clips/finished_stacks.mp4', landscape: true, seconds: 15.7},
};

export type Tag = {text: string; sub?: string; kind?: 'shot' | 'capability'};
// frac0/frac1 = portion of the narration segment the shot covers.
export type Shot = {seg: number; frac0: number; frac1: number; clip: ClipId; from: number; tag?: Tag; push?: number};

// Every caption is tied to what the footage actually shows (see README shot log).
export const SHOTS: Shot[] = [
  {seg: 1, frac0: 0, frac1: 1, clip: 'packing_team', from: 0},
  {seg: 2, frac0: 0, frac1: 1, clip: 'finished_stacks', from: 0, tag: {text: 'GHS CUSTOM GEAR', sub: 'Custom Sportswear Manufacturer · Sialkot, Pakistan'}},
  {seg: 3, frac0: 0, frac1: 0.5, clip: 'packing_team', from: 9, tag: {text: 'IN-HOUSE MANUFACTURING'}},
  {seg: 3, frac0: 0.5, frac1: 1, clip: 'finished_stacks', from: 6.2, tag: {text: 'CUSTOM TEAM UNIFORMS'}},
  {seg: 4, frac0: 0, frac1: 0.5, clip: 'stitching', from: 0, tag: {text: 'IN-HOUSE STITCHING'}},
  {seg: 4, frac0: 0.5, frac1: 1, clip: 'finishing', from: 0, tag: {text: 'SUBLIMATION & EMBROIDERY', sub: 'COMPANY CAPABILITY', kind: 'capability'}},
  {seg: 5, frac0: 0, frac1: 0.5, clip: 'finishing', from: 4, push: 0.06},
  {seg: 5, frac0: 0.5, frac1: 1, clip: 'stitching', from: 12},
  {seg: 6, frac0: 0, frac1: 1, clip: 'finished_stacks', from: 10.6, tag: {text: 'PRIVATE LABEL PRODUCTION', kind: 'capability'}},
  {seg: 7, frac0: 0, frac1: 1, clip: 'packing_team', from: 14, tag: {text: 'LOW MOQ — 10 PIECES'}},
];
