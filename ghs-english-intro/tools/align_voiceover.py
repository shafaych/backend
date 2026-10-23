#!/usr/bin/env python3
"""Usage: align_voiceover.py voice_file out_aligned.wav
Takes ONE continuous English take (7 sentences, brief pauses between them), finds the 6 sentence gaps,
and places each sentence at its target start time on the 55.3 s timeline so the burned-in subtitles and
shot changes stay in sync. No video re-render is needed. Then run: tools/mix_with_voiceover.sh out_aligned.wav 0"""
import json, re, subprocess, sys, os
src, out = sys.argv[1], sys.argv[2]
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
T = json.load(open(f'{R}/timeline.json')); segs = T['segments']; total = T['total']
tmp = out + '.mono.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '48000', tmp], check=True)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', tmp]))
log = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'silencedetect=n=-38dB:d=0.22', '-f', 'null', '-'], capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
gaps = []
for i, s in enumerate(starts):
    e = ends[i] if i < len(ends) else dur
    if s > 0.05 and e < dur - 0.05: gaps.append((s, e, e - s))   # interior gaps only
need = len(segs) - 1
if len(gaps) < need:
    sys.exit(f'Found {len(gaps)} sentence gaps, need {need}. Leave >= 0.3 s of silence between the 7 sentences, or send one file per sentence.')
gaps = sorted(sorted(gaps, key=lambda g: -g[2])[:need])
lead = ends[0] if starts and starts[0] < 0.05 else 0.0
bounds = [lead] + [x for g in gaps for x in (g[0], g[1])]
chunks, a = [], lead
for g in gaps: chunks.append((a, g[0])); a = g[1]
tail = dur
for i, st in enumerate(starts):
    en = ends[i] if i < len(ends) else dur
    if en >= dur - 0.05 and st > 0.05: tail = st
chunks.append((a, tail))
inputs, flt, lab = [], [], []
warn = []
for i, ((a, b), sg) in enumerate(zip(chunks, segs)):
    length = b - a; window = sg['end'] - sg['start']
    tag = 'OK' if length <= window - 0.1 else 'TOO LONG'
    if tag != 'OK': warn.append(f"sentence {sg['id']}: {length:.2f}s of speech vs {window-0.1:.2f}s available")
    print(f"sentence {sg['id']}: speech {length:.2f}s -> placed at {sg['start']:.2f}s (window {window:.2f}s) {tag}")
    inputs += ['-ss', f'{a:.3f}', '-t', f'{length:.3f}', '-i', tmp]
    d = int(sg['start'] * 1000)
    flt.append(f'[{i}:a]afade=t=in:d=0.02,afade=t=out:st={max(0,length-0.05):.3f}:d=0.05,adelay={d}|{d}[v{i}]'); lab.append(f'[v{i}]')
flt.append(''.join(lab) + f'amix=inputs={len(segs)}:normalize=0,apad=whole_dur={total}[o]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(flt), '-map', '[o]', '-t', f'{total}', '-ar', '48000', out], check=True)
os.remove(tmp)
if warn: print('WARNING (overlaps next sentence or end card):', *warn, sep='\n  ')
print('wrote', out)
