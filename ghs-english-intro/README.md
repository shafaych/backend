# GHS Custom Gear — English factory introduction (Remotion project)

Status: **visual edit complete; English voice-over NOT included** (no natural English TTS reachable from the build environment).

## What exists
- `out/ghs_visual_edit_silent.mp4` — 1080×1920, 30 fps, H.264, 56.9 s, video only (not committed; re-render with `CHROME=<chromium> npm run render`).
- `out/ghs_edit_NO_ENGLISH_VOICE_preview.mp4` — same with the audio bed (Urdu intro audio, real factory ambience, generated music pad). Not a final dub.
- `deliverables/` — contact sheet, estimated-timing SRT, narration script, transcript status.
- `source_originals/` — untouched originals incl. `original_urdu_talking_head.mp4`; `audio_stems/original_urdu_audio.{wav,m4a}` is the Urdu track.

## Adding the English voice
`tools/mix_with_voiceover.sh my_voice.wav 5.9` → ducks the bed, two-pass loudnorm to -16 LUFS / -1 dBTP, writes `out/ghs_english_final.mp4`.
Subtitle/shot timing is ESTIMATED at 2.7 words/s from 5.9 s. Once the real voice exists, edit `NARRATION_START`, `WORDS_PER_SECOND`
(or per-segment times) in `src/timeline.ts`, re-render, and rerun `tools/build_audio.py` after regenerating `timeline.json`.
If the voice is much longer/shorter than ~51 s, adjust `END_CARD_SECONDS`; the end card must stay >= 3 s (currently 7.5 s).

## Honest notes
- The English text is the owner-approved script, not a verified transcript of the Urdu audio. No Urdu transcript was produced (no ASR available).
- No lip-sync is used. The talking head plays only the first 5.5 s with its original Urdu audio, faded out at a low-energy point (not a sentence boundary — speech was continuous).
- Music is a synthesised placeholder pad, not licensed production music; swap `audio_stems/bed_music_pad.wav`.
- `counting-ghs.mp4` was not provided; unused.
- None of the supplied footage clearly shows sublimation printing, embroidery, cutting, or private-label work, so those captions are tagged as company capabilities / placed on general shots. "IN-HOUSE STITCHING" is on real stitching footage.
- Landscape clips (1024×576) are centre-cropped ~1.5× over a blurred copy of themselves; they are softer than the 720p portrait clips.

## Shot log
| Narration | Footage | Caption |
|---|---|---|
| intro 0–5.5 s | talking head (original) | title lower-third |
| 1 | ghs-factory (packing team) | — |
| 2 | kings-ghs (stacks) | GHS CUSTOM GEAR / Sialkot |
| 3 | ghs-factory → kings-ghs | IN-HOUSE MANUFACTURING → CUSTOM TEAM UNIFORMS |
| 4 | Video-48410 stitching → Video-49124 finishing | IN-HOUSE STITCHING → SUBLIMATION & EMBROIDERY (company capability) |
| 5 | Video-49124 → Video-48410 | — |
| 6 | kings-ghs | PRIVATE LABEL PRODUCTION (capability) |
| 7 | ghs-factory | LOW MOQ — 10 PIECES |
| end card 7.5 s | brand card | CTA |
