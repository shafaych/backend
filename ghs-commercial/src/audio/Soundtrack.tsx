import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import manifest from './manifest.json';
import {FPS, TOTAL} from '../styles/brand';

export type VoMode = 'none' | 'real' | 'scratch';

type Entry = {clips: {id: string; file: string; from: number; frames: number}[]; windows_s: [number, number][]};
const entryFor = (mode: VoMode): Entry | null =>
  mode === 'none' ? null : ((manifest as unknown as Record<string, Entry>)[mode] ?? null);

/** Speech activity (frames) → smooth 0..1 envelope: fast attack just before speech, slower release after. */
const voEnvelope = (frame: number, windows: [number, number][]) => {
  let env = 0;
  for (const [a, b] of windows) {
    const s = a * FPS;
    const e = b * FPS;
    const up = interpolate(frame, [s - 8, s - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const down = interpolate(frame, [e + 4, e + 18], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    env = Math.max(env, Math.min(up, down));
  }
  return env;
};

const dB = (x: number) => Math.pow(10, x / 20);

// Master trims (dB) chosen from measured loudness of the rendered mix (see audio/README.md).
export const LEVELS = {music: 0, sfx: 0, vo: 0, master: -0.8};
// Without a voice-over the mix has more headroom; lift it so the silent-VO master still lands near -16 LUFS.
const NO_VO_TRIM_DB = 2.4;

/**
 * Frame-aligned soundtrack: music bed + SFX stem (both full-length, authored on the 30 fps frame grid)
 * and VO clips placed with <Sequence>. Music ducks −9 dB and SFX −3 dB under speech.
 * A final 25-frame fade guarantees a clean ending.
 */
export const Soundtrack: React.FC<{voMode?: VoMode}> = ({voMode = 'none'}) => {
  const vo = entryFor(voMode);
  const windows = vo?.windows_s ?? [];
  const tail = (f: number) => interpolate(f, [TOTAL - 25, TOTAL - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const master = dB(LEVELS.master + (voMode === 'none' ? NO_VO_TRIM_DB : 0));
  return (
    <>
      <Audio src={staticFile('audio/music.wav')} volume={(f) => master * dB(LEVELS.music) * (1 - (1 - dB(-9)) * voEnvelope(f, windows)) * tail(f)} />
      <Audio src={staticFile('audio/sfx.wav')} volume={(f) => master * dB(LEVELS.sfx) * (1 - (1 - dB(-3)) * voEnvelope(f, windows)) * tail(f)} />
      {vo?.clips.map((c) => (
        <Sequence key={c.id} from={c.from} durationInFrames={c.frames} name={`VO ${c.id}`} layout="none">
          <Audio src={staticFile(c.file)} volume={(f) => master * dB(LEVELS.vo) * interpolate(f, [c.frames - 8, c.frames], [1, 0.0], {extrapolateLeft: 'clamp'})} />
        </Sequence>
      ))}
    </>
  );
};
