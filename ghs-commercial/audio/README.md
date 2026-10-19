# GHS commercial — audio pipeline

Everything is generated locally with numpy/scipy (no samples, no downloads, no external services).

| Stage | Command | Output |
|---|---|---|
| Music (120 BPM, A minor, 90 beats = 45.000 s) | `python3 build_music.py` | `music_raw.wav` |
| SFX, placed on the exact animation frames (see comments in `build_sfx.py`) | `python3 build_sfx.py` | `sfx_raw.wav` |
| Voice-over (see below) | `python3 build_vo.py [--scratch]` | `vo_<mode>.wav`, per-line clips, `src/audio/manifest.json` |
| Loudness mastering (music -19 LUFS, SFX -22 LUFS) | `python3 master_stems.py` | `public/audio/music.wav`, `sfx.wav` |

`npm run audio:build` runs the music + SFX + mastering chain.

## Voice-over: current status
No natural neural TTS could be installed in the build environment (model weights are hosted on hosts the sandbox blocks,
and the only local engine, ffmpeg's `flite`, is robotic). **No professional voice-over has been produced.**
The pipeline is ready for one:
1. Record or synthesise the 8 lines in `vo_script.json` (any format ffmpeg reads) as `audio/vo/vo_01.wav … vo_08.wav`.
2. `npm run audio:vo` — trims silence, time-fits each line into its window (rubberband, max ±18 %, never cuts words), loudness-matches
   to -16 LUFS, writes per-line clips + speech windows to `src/audio/manifest.json`.
3. `npm run build` — `GHSCommercial` automatically uses the `real` VO (`src/Root.tsx`), ducks music -9 dB / SFX -3 dB under speech.
`npm run audio:scratch` + `npm run build:preview-vo` renders a *scratch* (robotic) voice preview for timing/ducking checks only.

## Timeline notes
Scene boundaries 5/12/20/28/36 s all fall on beats; 12/20/28/36 s on bar lines. Logo impact is on beat 75 (37.5 s).
Breakdown 36.0–37.5 s: kick/bass drop out, snare roll + riser into the hit. Music rings out on A minor add9 from 41.8 s and fades 43.2–45.0 s.
