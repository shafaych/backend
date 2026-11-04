# GHS — From Pixels to Performance (Remotion)
1. `npm install`
2. Upscale/grade source once: `ffmpeg -i source_original.mp4 -an -vf "scale=1080:1920:flags=lanczos,eq=contrast=1.04:saturation=0.94,format=yuv420p" -c:v libx264 -crf 12 -g 15 -r 30 public/source_1080.mp4`
3. Soundtrack: `python3 audio/make_soundtrack.py public/soundtrack.wav` (numpy only)
4. `npx remotion studio src/index.ts` or `npx remotion render src/index.ts GHS out.mp4 --audio-codec=aac`
Edit shots in `src/timeline.ts`, captions/thread in `src/Film.tsx`.
