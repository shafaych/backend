#!/bin/bash
# Packages deliverables after the main render: cover, contact sheet, separate audio mix.
set -e
cd "$(dirname "$0")/.."
mkdir -p deliverables
cp out/ghs_commercial.mp4 deliverables/GHS_MADE_WITH_INTENTION_1080x1920_30fps.mp4
npx remotion still src/index.ts GHSCover deliverables/GHS_reel_cover.png
ffmpeg -y -v error -i public/audio/ghs_mix.wav -c:a aac -b:a 256k deliverables/GHS_final_audio_mix.m4a
cp public/audio/ghs_mix.wav deliverables/GHS_final_audio_mix.wav
# contact sheet: one frame per half second, 6x5 grid
ffmpeg -y -v error -i deliverables/GHS_MADE_WITH_INTENTION_1080x1920_30fps.mp4 \
  -vf "fps=2,scale=270:480,tile=6x5:padding=6:color=0x171917" -frames:v 1 deliverables/GHS_contact_sheet.png
