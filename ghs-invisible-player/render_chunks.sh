#!/bin/bash
# renders the film in 150-frame chunks (robust against a stalled tab), then concatenates
for s in $(seq 0 150 1649); do
  e=$((s+149)); [ $e -gt 1649 ] && e=1649
  f=out/chunks/c$(printf %04d $s).mp4
  [ -s $f ] && continue
  timeout 420 ./render.sh Film $f --frames=$s-$e > out/chunks/log_$s.txt 2>&1 || { echo "chunk $s failed/timeout"; timeout 420 ./render.sh Film $f --frames=$s-$e > out/chunks/log_$s.txt 2>&1; }
done
ls out/chunks/c*.mp4 | sed "s#^#file '$PWD/#; s#\$#'#" > out/chunks/list.txt
ffmpeg -y -v error -f concat -safe 0 -i out/chunks/list.txt -c copy out/video.mp4 && echo ALLDONE
