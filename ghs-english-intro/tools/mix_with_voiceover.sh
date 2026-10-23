#!/usr/bin/env bash
# Usage: tools/mix_with_voiceover.sh path/to/english_voiceover.(wav|mp3|m4a) [offset_seconds=5.9] [out.mp4]
# Places the supplied English voice-over at the narration start, ducks music+ambience under it,
# keeps the original Urdu intro audio, two-pass normalises to -16 LUFS / -1 dBTP and muxes with the silent video.
set -euo pipefail
cd "$(dirname "$0")/.."
VO="$1"; OFF="${2:-5.9}"; OUT="${3:-out/ghs_english_final.mp4}"
OFFMS=$(python3 -c "print(int(float('$OFF')*1000))")
TOT=$(python3 -c "import json;print(json.load(open('timeline.json'))['total'])")
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
GRAPH="[3:a]aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-18:TP=-3:LRA=7,adelay=${OFFMS}|${OFFMS},apad=whole_dur=${TOT},asplit=2[vo][vosc];
 [1:a][2:a]amix=inputs=2:normalize=0[bed];
 [bed][vosc]sidechaincompress=threshold=0.03:ratio=8:attack=40:release=450:makeup=1[ducked];
 [0:a][ducked][vo]amix=inputs=3:normalize=0[pre]"
IN=(-i audio_stems/bed_intro_urdu.wav -i audio_stems/bed_ambience.wav -i audio_stems/bed_music_pad.wav -i "$VO")
ffmpeg -v error -y "${IN[@]}" -filter_complex "$GRAPH" -map '[pre]' -t "$TOT" -c:a pcm_f32le "$TMP/pre.wav"
J=$(ffmpeg -hide_banner -i "$TMP/pre.wav" -af loudnorm=I=-16:TP=-1:LRA=9:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$TMP/pre.wav" -af "loudnorm=I=-16:TP=-1:LRA=9:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 -c:a pcm_s16le "$TMP/final.wav"
ffmpeg -v error -y -i out/ghs_visual_edit_silent.mp4 -i "$TMP/final.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ac 2 -t "$TOT" -movflags +faststart "$OUT"
cp "$TMP/final.wav" "${OUT%.mp4}_mix.wav"
echo "wrote $OUT"
