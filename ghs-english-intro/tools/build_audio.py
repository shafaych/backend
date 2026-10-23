#!/usr/bin/env python3
"""Builds the voice-free audio bed: original Urdu intro audio + real factory ambience + generated music pad."""
import json, subprocess, sys
R = sys.argv[1] if len(sys.argv) > 1 else '.'
T = json.load(open(f'{R}/timeline.json'))
AMB = {'stitching': 'amb_stitching', 'finishing': 'amb_finishing', 'packing_team': 'amb_packing_team', 'finished_stacks': 'amb_finished_stacks'}
FADE = 0.2
inputs, flt, labels = [], [], []
n = 0
for s in T['shots']:
    dur = s['end'] - s['start'] + FADE
    inputs += ['-ss', f"{s['from']}", '-t', f'{dur:.3f}', '-i', f"{R}/audio_stems/{AMB[s['clip']]}.wav"]
    d = int(s['start'] * 1000)
    flt.append(f"[{n}:a]loudnorm=I=-30:TP=-6:LRA=11,afade=t=in:d={FADE},afade=t=out:st={dur-FADE:.3f}:d={FADE},adelay={d}|{d}[a{n}]")
    labels.append(f'[a{n}]'); n += 1
flt.append(f"{''.join(labels)}amix=inputs={n}:normalize=0:duration=longest,volume=1.0[amb]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(flt), '-map', '[amb]', '-ar', '48000', '-ac', '2', f'{R}/audio_stems/bed_ambience.wav'], check=True)

# Intro: original Urdu audio, faded out across the energy dip at ~5.2-5.5s.
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{R}/audio_stems/original_urdu_audio.wav', '-t', f"{T['intro']}",
                '-af', f"afade=t=out:st={T['intro']-0.3}:d=0.3,apad=whole_dur={T['total']}", '-t', f"{T['total']}", f'{R}/audio_stems/bed_intro_urdu.wav'], check=True)

# Generated music pad (synthesised, not a recording): soft Am add9 drone, slow swell, gentle echo, low-passed.
tot = T['total']
notes = [110, 164.81, 220, 261.63, 329.63, 493.88]
amps = [0.5, 0.35, 0.3, 0.18, 0.15, 0.08]
src = [f"sine=f={f}:d={tot}:r=48000,volume={a}" for f, a in zip(notes, amps)]
ins = []
for s_ in src: ins += ['-f', 'lavfi', '-i', s_]
fl = ''.join(f'[{i}:a]' for i in range(len(notes))) + f"amix=inputs={len(notes)}:normalize=0,tremolo=f=0.11:d=0.35,lowpass=f=1400,aecho=0.8:0.6:420|760:0.35|0.22,stereotools=mlev=0.9:slev=1.4,afade=t=in:d=2.5,afade=t=out:st={tot-3}:d=3,loudnorm=I=-26:TP=-6:LRA=7[m]"
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fl, '-map', '[m]', '-ac', '2', f'{R}/audio_stems/bed_music_pad.wav'], check=True)

# Bed mix (no English voice). Music held back under the Urdu intro.
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{R}/audio_stems/bed_intro_urdu.wav', '-i', f'{R}/audio_stems/bed_ambience.wav', '-i', f'{R}/audio_stems/bed_music_pad.wav',
                '-filter_complex', f"[0:a]volume=1.0[u];[1:a]volume=1.0[a];[2:a]volume='if(lt(t,5.5),0.45,1)':eval=frame[m];[u][a][m]amix=inputs=3:normalize=0,alimiter=limit=0.89[o]",
                '-map', '[o]', '-ar', '48000', '-ac', '2', f'{R}/audio_stems/bed_mix_no_voice.wav'], check=True)
print('ok')
