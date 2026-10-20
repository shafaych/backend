#!/bin/sh
# Two-pass linear loudnorm to -16 LUFS / -1 dBTP on the raw mix -> public/audio/final.wav
set -e
cd "$(dirname "$0")/.."
M=$(ffmpeg -hide_banner -i public/audio/mix.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$M" | grep "\"$1\"" | sed 's/[^0-9.-]*\([-0-9.]*\).*/\1/'; }
ffmpeg -v error -y -i public/audio/mix.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,alimiter=limit=0.89:level=false" -ar 48000 -c:a pcm_s16le public/audio/final.wav
