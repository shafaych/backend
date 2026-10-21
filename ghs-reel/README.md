# GHS Custom Gear — Reel (Remotion)
Uses the original factory footage (`public/kings-ghs-manufacturing.mp4`). 1080x1920, 30fps, 20s.
1. `python3 -I tools/make_audio.py` → `public/music.wav` (synthesised music bed + SFX)
2. `sh tools/prep_footage.sh` → `public/footage-graded.mp4` (grade + sharpen + 1.5x lanczos)
3. `npm install && npx remotion studio src/index.ts` (edit) or `npm run render`; then loudnorm to -14 LUFS (see git history / ffmpeg `loudnorm=I=-14:TP=-1.5`).
Pan-and-scan keyframes live in `src/GhsReel.tsx` (`KEYS`).
