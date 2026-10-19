# GHS Custom Gear — "From Concept to Game Day" (Remotion)
1080×1920, 30fps, 1,350 frames (45s). Everything is code: SVG, CSS, React, Remotion.

## Run
    npm install
    npm start            # Remotion Studio preview
    npm run typecheck
    npm run build        # -> out/ghs-custom-gear-commercial.mp4
    node scripts/stills.mjs out/qa 100 400 ...   # independent stills (global frame numbers)
If Chrome can't be downloaded, set REMOTION_BROWSER_EXECUTABLE (config also auto-detects /opt/pw-browsers/chromium).

## Animation system
- `styles/brand.ts`: palette, fonts, scene timing (`SCENES`), `WIPE` overlap. `styles/safe.ts`: social safe areas.
- `utils/anim.ts`: `prog()` (clamped, eased 0→1 from frame ranges), `pulse()`, `sp()` (restrained spring), easings. All motion is a pure function of `useCurrentFrame()`, so any frame renders independently.
- `components/`: `MaskText` (masked kinetic type, velocity-derived directional blur), `DrawPath/StitchPath/Head` (path drawing, sewing, needle), `Jersey` (layered garment: panels, sweeps between colourways), `Garments` (5 product silhouettes), `GHSMark` (geometric stroke wordmark), `Wipe` (edge-sweep transitions), `Callout`, `Hud`, `Backdrop`.
- `GHSCommercial.tsx`: Sequences per scene; outgoing scene runs 18 frames under the incoming wipe. Scene 2→3 is a match-cut on the same jersey.
