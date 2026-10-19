"""Places voice-over lines on the timeline.
  python3 build_vo.py            -> uses real recordings in audio/vo/vo_NN.wav (any sample rate/format ffmpeg reads)
  python3 build_vo.py --scratch  -> builds a clearly-labelled SCRATCH track from ffmpeg's flite (robotic; timing/ducking tests only)
Each line is trimmed of silence, time-fitted with rubberband (max +/-18 %) so words are never cut, and placed at its window start.
Outputs vo_<mode>.wav (45 s stereo) and ../public/audio/vo_windows.json (speech activity in frames, used for ducking)."""
import json, subprocess, sys, os, shutil
import numpy as np, soundfile as sf
import synth as S

mode = 'scratch' if '--scratch' in sys.argv else 'real'
cfg = json.load(open('vo_script.json'))['lines']
os.makedirs(f'../public/audio/vo_{mode}', exist_ok=True)
os.makedirs('vo', exist_ok=True); os.makedirs('vo_scratch', exist_ok=True)
SR = S.SR


def sh(*a):
    subprocess.run(a, check=True, capture_output=True)


def load(path):
    tmp = 'tmp_vo.wav'
    sh('ffmpeg', '-y', '-i', path, '-ac', '1', '-ar', str(SR), tmp)
    x, _ = sf.read(tmp)
    return x


def trim(x, thr=0.01):
    a = np.abs(x)
    idx = np.where(a > thr * a.max())[0]
    return x[max(0, idx[0] - int(0.01 * SR)): idx[-1] + int(0.04 * SR)]


tracks = np.zeros((2, S.n_(45.0)))
windows = []
report = []
clips = []
clip_audio = {}
for L in cfg:
    p = f"vo/vo_{L['id']}.wav"
    if mode == 'scratch':
        p = f"vo_scratch/vo_{L['id']}.wav"
        txt = L['text'].replace("'", "").replace(':', ' ')
        sh('ffmpeg', '-y', '-f', 'lavfi', '-i', f"flite=text='{txt}':voice=rms", '-ar', '44100', p)
    if not os.path.exists(p):
        print('missing', p); continue
    x = trim(load(p))
    nat = len(x) / SR
    win = L['end'] - L['start']
    ratio = nat / win
    if ratio > 1.0:                       # too long: speed up (never cut)
        r = min(ratio, 1.7 if mode == 'scratch' else 1.18)
        sf.write('tmp_in.wav', x, SR)
        sh('ffmpeg', '-y', '-i', 'tmp_in.wav', '-af', f'rubberband=tempo={r:.4f}:pitch=1:formant=preserved', 'tmp_out.wav')
        x, _ = sf.read('tmp_out.wav')
        x = trim(x)
        ok = len(x) / SR <= win + 0.05
    else:
        ok = True
    start = L['start']
    if ok is True and len(x) / SR < win * 0.8:
        start = L['start'] + (win - len(x) / SR) * 0.25    # sit slightly after window start, natural placement
    i = S.n_(start)
    clip_audio[L['id']] = x
    clips.append({'id': L['id'], 'file': f"audio/vo_{mode}/vo_{L['id']}.wav", 'from': int(round(start * 30)), 'frames': int(np.ceil(len(x) / SR * 30)) + 2})
    m = min(len(x), tracks.shape[1] - i)
    tracks[0, i:i + m] += x[:m]; tracks[1, i:i + m] += x[:m]
    report.append({'id': L['id'], 'natural_s': round(nat, 2), 'window_s': round(win, 2), 'fitted_s': round(len(x) / SR, 2), 'fits': bool(ok), 'start_s': round(start, 3), 'end_s': round(start + len(x) / SR, 3)})
    # activity windows for ducking
    env = np.abs(x)
    k = int(0.02 * SR)
    sm = np.convolve(env, np.ones(k) / k, 'same')
    act = sm > 0.02 * sm.max()
    segs, on = [], None
    for j, a in enumerate(act):
        if a and on is None: on = j
        if not a and on is not None:
            segs.append([on, j]); on = None
    if on is not None: segs.append([on, len(act)])
    merged = []
    for a, b in segs:
        if merged and a - merged[-1][1] < 0.35 * SR: merged[-1][1] = b
        else: merged.append([a, b])
    for a, b in merged:
        windows.append([round(start + a / SR, 3), round(start + b / SR, 3)])

def lufs_of(sig):
    sf.write('tmp_l.wav', sig.T if sig.ndim == 2 else sig, SR, subtype='FLOAT')
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', 'tmp_l.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    import re
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', r.stderr.split('Summary')[-1]).group(1))

# one gain for stem AND clips so Remotion's per-line playback matches the delivered stem: -16 LUFS, peak <= -2 dBFS
g = 10 ** ((-16.0 - lufs_of(tracks)) / 20)
g = min(g, 0.79 / max(np.max(np.abs(tracks)), 1e-9))
tracks = tracks * g
for k, x in clip_audio.items():
    sf.write(f"../public/audio/vo_{mode}/vo_{k}.wav", np.stack([x * g, x * g], axis=1), SR, subtype="PCM_24")
print('vo gain', round(20 * np.log10(g), 2), 'dB; stem LUFS', lufs_of(tracks))
out = f'vo_{mode}.wav'
sf.write(out, tracks.T.astype(np.float32), SR, subtype='FLOAT')
sf.write(f'../public/audio/vo_{mode}.wav', tracks.T, SR, subtype='PCM_24')
mpath = '../src/audio/manifest.json'
os.makedirs('../src/audio', exist_ok=True)
man = json.load(open(mpath)) if os.path.exists(mpath) else {}
man[mode] = {'clips': clips, 'windows_s': windows, 'report': report}
json.dump(man, open(mpath, 'w'), indent=1)
for r in report: print(r)
print('windows', len(windows))
