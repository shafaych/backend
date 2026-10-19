# GHS Custom Gear — The 10-Piece Challenge ("Big Brands Start Small")
40 s · 1080×1920 · 30 fps · 1,200 frames · H.264 + AAC. Remotion + React + TypeScript; every visual is SVG/CSS/React — no external images, video, logos or downloaded fonts.
The "KESTREL" brand and all growth numbers (10→25→50→100) are fictional/illustrative and labelled as such on screen.

## Render
```bash
npm install
npm run audio          # optional: rebuild music/SFX/mix (needs python3 numpy scipy soundfile; VO wavs are included)
npm run studio         # live preview
npm run preview        # first 6 s → out/preview-first-6s.mp4
npm run render         # full video → out/ghs-10-piece-challenge.mp4
```
Offline/CI: `CHROME_PATH=/path/to/chromium-or-headless_shell npm run render`.
Audio source: `public/audio/final.wav` (mix loudness-normalised to ≈ -14 LUFS, true peak ≤ -1.5 dBTP).

## Layout
- `src/Commercial.tsx` – timeline & transitions · `src/timeline.ts` – cue times (mirror `audio/build_audio.py` CUES)
- `src/scenes/Scene1–6.tsx` · `src/components/` – Jersey (parametric vector garment), Box, Crest, BigTen, Reveals (bars / iris / slit), Fx (grain, glitch, mask-line type)
- `audio/generate_vo.py` (Kokoro TTS, local) · `audio/build_audio.py` (procedural music, SFX, ducking, mix) · `NARRATION.md`
- `deliverables/` – final MP4, 6 s preview, contact sheet, audio stems (vo / music / sfx / final)

## Honest notes
- Voice-over is **Kokoro-82M TTS** (open source, run locally). It is natural-sounding synthetic speech, not a human recording. Model files (~350 MB) are downloaded from GitHub releases and are not committed.
- Music and SFX are fully synthesised in numpy (no samples). Audio was verified by measurement (duration, loudness, silence map, cue alignment) — not by ear; a listen-through is recommended before publishing.
- Typeface is **Inter Display** (a system font on the render machine) with Helvetica/Arial fallbacks; install Inter or expect slightly different metrics elsewhere.
- No previous "From Concept to Game Day" project existed in this repository, so nothing was modified; this commercial is a separate composition (`TenPieceChallenge`).
