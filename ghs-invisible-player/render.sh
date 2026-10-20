#!/bin/bash
# usage: ./render.sh <composition> <out.mp4> [extra remotion args]
CH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
npx remotion render src/index.ts "$1" "$2" --codec=h264 --crf=16 --pixel-format=yuv420p --concurrency=4 --browser-executable=$CH --chrome-mode=chrome-for-testing "${@:3}"
