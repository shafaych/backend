export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION = 1200;

/** Scene start times (seconds). Mirrors audio/build_audio.py CUES — keep in sync. */
export const T = {
  s1: 0, s2: 6, s3: 13, s4: 20, s5: 27, s6: 34, end: 40,
  // Scene 1
  n500: 0.3, n1000: 1.5, tooMany: 2.55, blackout: 3.6, whatIf: 3.7, ten: 4.5,
  // Scene 2
  burst: 6.0, jerseyStart: 6.35, headline2: 8.6, sub2: 9.7,
  // Scene 3
  design: 13.3, label: 14.8, brand: 16.3,
  // Scene 4
  c10: 20.6, c25: 21.5, c50: 22.4, c100: 23.3, startSmall: 24.1, thinkBig: 25.3,
  // Scene 5
  tag1: 28.5, tag2: 29.5, tag3: 30.5, tag4: 31.5,
  // Scene 6
  wordmark: 34.6, headline6: 36.3, support6: 37.6, url: 38.4,
};
export const sec = (s: number) => Math.round(s * FPS);
