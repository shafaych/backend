#!/bin/bash
cd "$(dirname "$0")/.."
for f in "$@"; do
  s=$(date +%s.%N)
  npx remotion still src/index.ts GHS out/s$(printf %04d $f).png --frame=$f 2>&1 | grep -iE "error|TypeError|Exception" 
  e=$(date +%s.%N); echo "frame $f: $(echo "$e - $s" | bc)s"
done
