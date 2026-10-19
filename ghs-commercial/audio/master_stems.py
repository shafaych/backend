"""Loudness-master the three stems and publish them to public/audio (used by Remotion) and out/deliver/audio."""
import subprocess, json, os, shutil, re, sys

def run(args):
    return subprocess.run(args, capture_output=True, text=True)

def lufs_norm(src, dst, target, tp, pre=''):
    chain = (pre + ',' if pre else '') + f'loudnorm=I={target}:TP={tp}:LRA=20:print_format=json'
    r = run(['ffmpeg', '-hide_banner', '-i', src, '-af', chain, '-f', 'null', '-'])
    m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr, re.S).group(0))
    chain2 = (pre + ',' if pre else '') + (f"loudnorm=I={target}:TP={tp}:LRA=20:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                                           f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    run(['ffmpeg', '-y', '-i', src, '-af', chain2, '-ar', '44100', '-c:a', 'pcm_s24le', dst])
    print(dst, 'in', m['input_i'], '->', target)

os.makedirs('../public/audio', exist_ok=True)
# music: gentle glue compression, bed level
lufs_norm('music_raw.wav', '../public/audio/music.wav', -19.0, -2.0, 'acompressor=threshold=-18dB:ratio=2:attack=20:release=200')
# sfx: tame the big impacts with a limiter first
lufs_norm('sfx_raw.wav', '../public/audio/sfx.wav', -22.0, -2.0, 'highpass=f=20,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,alimiter=limit=0.7:level=false')
