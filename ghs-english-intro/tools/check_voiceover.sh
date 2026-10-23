#!/usr/bin/env bash
# Usage: tools/check_voiceover.sh voice_file  -> prints format, duration, peak and whether it fits the 46.4 s narration window
f="$1"; ffprobe -v error -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration -of default=nw=1 "$f"
ffmpeg -nostats -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
python3 -c "
import subprocess,sys
d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','$f']))
print('duration %.1fs -> '%d + ('fits' if d<=47.0 else 'LONGER than the 46.4 s window; ask for a slightly faster read or trim pauses'))"
