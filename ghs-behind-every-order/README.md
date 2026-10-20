# GHS Custom Gear — Behind Every Order
Remotion + React + TypeScript, 1080x1920 @30fps, 1500 frames. All visuals are SVG/CSS.
- `npm install`, then `npm run studio` to edit; timing lives in `src/cues.json` (shared by visuals and audio).
- Audio: `tools/make_vo.py` (Kokoro TTS, voice am_michael; model files from the kokoro-onnx `model-files-v1.0` release go in `models/`) and `tools/make_audio.py` (synthesised music + SFX + mix).
- Render: `npx remotion render src/index.ts BehindEveryOrder out/GHS_Behind_Every_Order.mp4 --codec=h264 --audio-codec=aac`
