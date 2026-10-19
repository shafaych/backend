#!/usr/bin/env bash
# usage: scripts/sheet.sh <dir> <out.png> [cols]  — contact sheet of all PNGs in dir
dir=$1; out=$2; cols=${3:-4}
n=$(ls $dir/f*.png | wc -l); rows=$(( (n + cols - 1) / cols ))
ffmpeg -y -loglevel error -pattern_type glob -i "$dir/f*.png" -vf "scale=360:-1,tile=${cols}x${rows}:padding=6:color=0x888888" -frames:v 1 "$out"
