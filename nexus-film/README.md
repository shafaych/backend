# NEXUS JACKET — LAST TRAIN. FIRST CHAPTER.
20 s · 1080×1920 · 24 fps · Remotion 4 project. `npm install`, then `npm run studio` / `npm run render` / `npm run cover`.
Finished files: `deliverables/last-train.mp4`, `deliverables/cover.png`.

## Visual treatment (read this)
No video-generation tool and no stock-footage source were reachable from this environment, so there is **no photographic footage**.
All six scenes are an **original procedural 2D vector / SVG animation** (stylised, illustrated look), with camera moves, motion blur,
wool/leather/chenille textures (SVG filters), grain and grading done in Remotion. It is not photoreal.
The character is a stylised illustration, not a real person. Jacket is a concept personalisation (CARTER / 27 / small N), not a customer testimonial.

## Audio / licensing
- Voice-over: Kokoro-82M TTS (Apache-2.0) via kokoro-onnx, voice `am_michael`. Synthetic voice; script in `scripts/make_vo.py`. Model files are not committed.
- Sound design + music: synthesised in `scripts/make_audio.py` (footsteps, snap, train, ambience, pad/pulse/arp). Original, no third-party samples.
- Fonts (OFL, via @fontsource): Alfa Slab One, Fraunces, Inter.
- Brand: text wordmark only; no logo supplied, none invented.

## Limitations
- Stylised, not photoreal; hands/faces are simple vector forms. Walking/figure motion is simple.
- Music is a simple synthesised bed, not a composed score. VO is synthetic and slightly flat.
- Seamless-loop / platform-safe text: only the end card and cover carry text, inside safe areas.
