# Revision 2 — polish pass (no scene rebuilt)
| # | Change | How it was checked |
|---|--------|--------------------|
| 1 | KESTREL de-emphasised (smaller jersey wordmark/crest, smaller box branding, labelled "Illustrative brand"); "MADE BY GHS CUSTOM GEAR" added to Scenes 2–3 header, the shipping box, and a "GHS MAKES" node in Scene 4; Scene 5 garment now says "YOUR BRAND" | visual stills + contact sheet |
| 2 | Scene 4 opening/"START SMALL" frames: tile wave, grid stays visible and pulses, START SMALL moved to top; Scene 5 opening: registration ring, scan sweep, ghost capability rows | visual stills |
| 3 | Small text raised (tags 22→28 px, disclaimers 17–18→24–25 px, spec strip, flow labels 20→26 px); disclaimer wording unchanged; moved clear of bottom UI zone | visual stills |
| 4 | CTA "START YOUR CUSTOM ORDER — MOQ 10 PIECES"; URL on a solid lime slab at 104 px | visual stills |
| 5 | GHS wordmark seams: slats swap to one solid text node after landing | pixel test on frame 1180: hairline dip 13.1 → 1.2 levels |
| 6 | VO: "GHS" now spelled as three evenly stressed letters (lines 5, 6); comma pause in line 5 shortened 0.51 → 0.39 s | take-by-take gap/length measurement. **Not verified by ear or ASR** (no speech-recognition model reachable offline) |
| 7 | SFX sync | frame-diff vs SFX-envelope onsets for 22 events: 17 within 5 ms, rest ≤ 80 ms or soft whoosh swells peaking mid-transition |
| 8 | Music ducking: asymmetric 60 ms/450 ms, −14 dB under speech, SFX −5 dB | music vs VO during speech was −2.6…−8.3 dB, now −12.0…−16.8 dB |
| 9 | Still 40.000 s / 1200 frames / 1080×1920, brand palette unchanged | ffprobe |
Loudness: −14.4 LUFS integrated, true peak −2.2 dBTP.
Before/after: `deliverables/contact-sheet-before-after.png`; previous render kept in `deliverables/v1_before/`.
