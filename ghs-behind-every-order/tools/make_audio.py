"""Synthesise music + SFX, mix with Kokoro VO -> public/audio/mix.wav (48k stereo). Timing comes from src/cues.json."""
import json, numpy as np, soundfile as sf
from scipy.signal import lfilter, butter, sosfilt, resample_poly

SR = 48000; DUR = 50.0; N = int(SR * DUR)
cues = json.load(open("src/cues.json"))
rng = np.random.default_rng(7)

def tt(d): return np.arange(int(d * SR)) / SR
def add(buf, x, t, pan=0.0, g=1.0):
    i = int(t * SR); x = x[: max(0, N - i)]
    if len(x) == 0: return
    l = g * np.sqrt(0.5 * (1 - pan)); r = g * np.sqrt(0.5 * (1 + pan))
    buf[0, i:i+len(x)] += x * l; buf[1, i:i+len(x)] += x * r
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2, o=2): return sosfilt(butter(o, [f1, f2], 'band', fs=SR, output='sos'), x)
def env(d, a, r): 
    t = tt(d); e = np.minimum(t / max(a, 1e-4), 1.0) * np.minimum((d - t) / max(r, 1e-4), 1.0); return np.clip(e, 0, 1)
def noise(d): return rng.standard_normal(int(d * SR))
def midi(n): return 440 * 2 ** ((n - 69) / 12)

# ---------- SFX ----------
def ping(f=1320, d=0.5):
    t = tt(d); return (np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*f*1.5*t)) * np.exp(-t*9) * 0.5
def notify(): return np.concatenate([ping(988, .12)[:int(.09*SR)], np.zeros(0)]) if False else (lambda a, b: np.pad(a, (0, len(b)+int(.09*SR)))[:len(b)+int(.09*SR)+len(a)] + np.pad(b, (int(.09*SR), 0))[:len(b)+int(.09*SR)+len(a)] if False else _mix2(a, b))(ping(880, .45), ping(1318, .55))
def _mix2(a, b):
    o = int(.09 * SR); out = np.zeros(max(len(a), o + len(b))); out[:len(a)] += a; out[o:o+len(b)] += b; return out
def click(d=0.05):
    t = tt(d); return (hp(noise(d), 2500) * np.exp(-t*160) * 0.35 + np.sin(2*np.pi*2400*t) * np.exp(-t*120) * 0.3)
def tick(f=1900, d=0.08):
    t = tt(d); return np.sin(2*np.pi*f*t) * np.exp(-t*70) * 0.4
def linedraw(d=0.7):
    t = tt(d); f = 900 + 2200 * (t / d) ** 1.5
    ph = 2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph) * 0.12 + bp(noise(d), 2500, 6000) * 0.05) * env(d, 0.05, 0.15)
def confirm():
    a = np.sin(2*np.pi*660*tt(.2)) * np.exp(-tt(.2)*22) * .35
    b = np.sin(2*np.pi*990*tt(.3)) * np.exp(-tt(.3)*14) * .35
    out = np.zeros(int(.4*SR)); out[:len(a)] += a; o = int(.07*SR); out[o:o+len(b)] += b; return out
def stage_beep(i):
    f = 440 * 1.122 ** i; t = tt(.42)
    return (np.sin(2*np.pi*f*t) * np.exp(-t*8) * .35 + np.sin(2*np.pi*f*2*t) * np.exp(-t*14) * .12
            + lp(np.sin(2*np.pi*70*t), 200) * np.exp(-t*18) * .5)
def swell(d=0.7, f1=400, f2=3000):
    n = noise(d); y = np.zeros_like(n); 
    seg = 8; L = len(n) // seg
    for k in range(seg):
        fc = f1 + (f2 - f1) * (k / seg); y[k*L:(k+1)*L] = bp(n, fc*0.7, fc*1.3)[k*L:(k+1)*L]
    return y * env(d, d*0.55, d*0.45) * 0.18
def machine(kind):
    if kind == 'cut':   # shears: two quick metallic snips
        d = .5; x = np.zeros(int(d*SR))
        for o in (0.02, 0.2):
            s = bp(noise(.12), 3000, 9000) * np.exp(-tt(.12)*40) * .5; i = int(o*SR); x[i:i+len(s)] += s
        return x
    if kind == 'sew':   # needle chatter ~22 Hz
        d = .8; x = np.zeros(int(d*SR)); k = 0.0
        while k < d - 0.05:
            s = (lp(noise(.03), 1800) * 0.5 + np.sin(2*np.pi*600*tt(.03))*.3) * np.exp(-tt(.03)*110); i = int(k*SR); x[i:i+len(s)] += s; k += 0.045
        return x * env(d, .05, .2) * 0.8
    if kind == 'sub':   # heat press hiss
        d = .8; return bp(noise(d), 1500, 7000) * env(d, .25, .5) * .22
    if kind == 'emb':   # fine fast stitch
        d = .8; x = np.zeros(int(d*SR)); k = 0.0
        while k < d - 0.05:
            s = (hp(noise(.02), 1500)*.4) * np.exp(-tt(.02)*160); i = int(k*SR); x[i:i+len(s)] += s; k += 0.028
        return x * env(d, .05, .2) * .8
    if kind == 'qc':    # inspection beep pair
        t = tt(.3); return (np.sin(2*np.pi*1500*t) * (np.exp(-t*30) + 0.7*np.exp(-np.clip(t-.12, 0, None)*30)*(t>.12))) * .3
def scan(d=1.4):
    t = tt(d); f = 500 + 1100 * np.sin(np.pi * t / d) ** 2
    return np.sin(2*np.pi*np.cumsum(f)/SR) * 0.09 * env(d, .2, .3)
def inspect_blip():
    t = tt(.35); return (np.sin(2*np.pi*1100*t)*np.exp(-t*25)*.3 + np.sin(2*np.pi*1650*np.clip(t-.06,0,None))*np.exp(-np.clip(t-.06,0,None)*22)*(t>.06)*.25)
def paper(d=0.35):
    return hp(lp(noise(d), 4500), 400) * env(d, .06, .25) * .25

sfx = np.zeros((2, N))
S = cues
for i, t in enumerate(S["s1"]["q"]): add(sfx, notify(), t, pan=(-.25, .2, -.1)[i], g=.7)
add(sfx, swell(1.0, 300, 1800), S["s1"]["head"] - .5, g=.8)
add(sfx, ping(660, 1.2) * 1.0, S["s1"]["head"], g=.5)
# scene 2
add(sfx, swell(.7, 500, 2500), 7.0)
add(sfx, linedraw(.9), S["s2"]["lines"], g=1)
for z, t in zip(('cut','sew','sub','emb','qc'), S["s2"]["zones"]):
    add(sfx, click(), t - .02); add(sfx, machine(z), t + .05, pan={'cut':-.4,'sew':-.2,'sub':.1,'emb':.3,'qc':.5}[z], g=.9)
for k in ("t1","t2","t3"): add(sfx, tick(2200), S["s2"][k], g=.8)
# scene 3
add(sfx, paper(), S["s3"]["doc"]); add(sfx, swell(.6, 400, 2000), 14.9, g=.8)
for t in S["s3"]["rows"]: add(sfx, tick(1700), t, g=.8); add(sfx, confirm(), t + .22, g=.55)
add(sfx, linedraw(1.4), S["s3"]["garment"], g=1)
for k in range(4): add(sfx, tick(2600 + 200*k), S["s3"]["arrows"] + .18*k, g=.7)
add(sfx, confirm(), S["s3"]["head"], g=.9)
# scene 4
add(sfx, swell(.6, 400, 2000), 22.8, g=.8)
for i, t in enumerate(S["s4"]["stages"]): add(sfx, stage_beep(i), t, g=.9)
add(sfx, paper(.25), S["s4"]["panel"]); add(sfx, notify(), S["s4"]["panel"] + .5, g=.5)
add(sfx, tick(2000), S["s4"]["k1"], g=.8); add(sfx, tick(2400), S["s4"]["k2"], g=.8)
# scene 5
add(sfx, swell(.6, 400, 2000), 31.8, g=.8)
add(sfx, scan(1.6), S["s5"]["scan"], g=1)
for t in S["s5"]["callouts"]: add(sfx, inspect_blip(), t, g=1); add(sfx, machine('qc'), t + .35, g=.5)
add(sfx, confirm(), S["s5"]["head"], g=.9); add(sfx, tick(2200), S["s5"]["sub"], g=.8)
# scene 6
add(sfx, swell(1.0, 300, 3000), 40.4, g=1)
add(sfx, linedraw(1.6), S["s6"]["mark"], g=.9)
for t in S["s6"]["tag"]: add(sfx, tick(1800), t, g=.8); add(sfx, click(), t + .05, g=.6)
for t in S["s6"]["cta"]: add(sfx, confirm(), t, g=.6)

# ---------- MUSIC ----------
BPM = 96; beat = 60 / BPM; bar = 4 * beat
chords = {  # root midi (bass), triad tones
 'Am': (33, [57, 60, 64, 69]), 'F': (29, [53, 57, 60, 65]), 'C': (36, [55, 60, 64, 67]), 'G': (31, [55, 59, 62, 67]),
 'Cadd9': (36, [55, 60, 64, 67, 74])}
nbars = int(np.ceil(DUR / bar))
prog = []
for b in range(nbars):
    if b >= nbars - 2: prog.append('G' if b == nbars - 2 else 'Cadd9')
    else: prog.append(('Am','F','C','G')[b % 4])
music = np.zeros((2, N))
def saw(f, d):
    t = tt(d); return 2 * ((t * f) % 1.0) - 1
def pad(notes, d):
    x = np.zeros(int(d*SR))
    for n in notes:
        for det in (-0.12, 0.0, 0.12):
            x += saw(midi(n) * 2 ** (det/12), d)[:len(x)]
    x = lp(x, 1500, 2) / (len(notes)*3) 
    return x * 0.9
def inten(t):  # overall arc 0..1
    return float(np.interp(t, [0, 7, 15, 23, 32, 41, 47.5, 50], [0.25, 0.45, 0.6, 0.75, 0.9, 1.0, 1.0, 0.8]))
for b, c in enumerate(prog):
    t0 = b * bar; root, tones = chords[c]
    d = bar + 1.2
    p = pad(tones, d) * env(d, 0.9, 1.2)
    add(music, p, t0 - 0.2 if t0 > 0 else 0, g=0.5 * inten(t0))
    # bass
    tb = tt(bar + .5); bs = np.sin(2*np.pi*midi(root)*tb) + .3*np.sin(2*np.pi*midi(root)*2*tb)
    add(music, bs * env(bar+.5, .05, .4) * .55, t0, g=inten(t0) * (0.8 if t0 < 7 else 1.0))
    # arpeggio plucks from scene 4 onward
    if 23 <= t0 < 47.5:
        for k in range(8):
            n = tones[(0,2,1,3,2,1,3,2)[k] % len(tones)] + 12
            ts = t0 + k * beat / 2; tp = tt(.5)
            pl = (np.sin(2*np.pi*midi(n)*tp) + .4*np.sin(2*np.pi*midi(n)*2*tp)) * np.exp(-tp*7) * .16
            add(music, pl, ts, pan=-.3 + .6*(k % 2), g=inten(ts))
# percussion
def kick():
    t = tt(.4); f = 48 + 90*np.exp(-t*30); return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*9) * .9
def hat(): return hp(noise(.05), 7000) * np.exp(-tt(.05)*90) * .22
def brush(): return bp(noise(.22), 1500, 6000) * env(.22, .02, .18) * .22
def shaker(): return bp(noise(.07), 5000, 9000) * np.exp(-tt(.07)*50) * .18
for b in range(nbars):
    t0 = b * bar
    for k in range(4):
        ts = t0 + k * beat
        if ts >= 7 and ts < 47.5 and k in (0, 2): add(music, kick(), ts, g=.35 * (0.6 if ts < 15 else 1.0))
        if ts >= 15 and ts < 47.5:
            add(music, shaker(), ts + beat/2, pan=.25, g=1.0 * inten(ts))
        if ts >= 23 and ts < 47.5 and k in (1, 3): add(music, brush(), ts, g=1.0)
        if ts >= 32 and ts < 47.5: add(music, hat(), ts, pan=-.2, g=.8)
# intro: sparse soft pulse
for k in range(int(7 / (2*beat))): add(music, lp(np.sin(2*np.pi*55*tt(.5)), 120) * np.exp(-tt(.5)*6) * .8, k * 2 * beat, g=.5)
# riser into resolve + resolve chord with long tail
add(music, swell(2.4, 300, 5000), 45.1, g=1.0)
res_t = cues["s6"]["resolve"]
for n in [48, 55, 60, 64, 67, 72, 74]:
    d = 2.6; tp = tt(d)
    add(music, (np.sin(2*np.pi*midi(n)*tp) + .3*np.sin(2*np.pi*midi(n)*2*tp)) * np.exp(-tp*1.6) * env(d, .01, .6) * .12, res_t, g=1.0)
# gentle fade-out
fade = np.ones(N); fi = int(49.2 * SR); fade[fi:] = np.linspace(1, 0, N - fi) ** 1.5
music *= fade

# ---------- VOICE ----------
vo = np.zeros((2, N)); voenv = np.zeros(N)
for key, t in cues["vo"].items():
    s, sr = sf.read(f"public/audio/vo_{key}.wav"); s = resample_poly(s, SR, sr)
    s = hp(s, 70, 2) * 1.0
    add(vo, s, t, g=1.0)
    i = int(t * SR); voenv[i:i+len(s)] = np.maximum(voenv[i:i+len(s)], np.abs(s))
# duck: smooth envelope
e = lfilter([1 - np.exp(-1/(0.12*SR))], [1, -np.exp(-1/(0.12*SR))], (voenv > 0.02).astype(float))
e = lfilter([1 - np.exp(-1/(0.35*SR))], [1, -np.exp(-1/(0.35*SR))], e)
duck = 1 - 0.55 * np.clip(e * 1.6, 0, 1)

mix = vo * 1.0 + music * 0.55 * duck + sfx * 0.55 * (1 - 0.25 * np.clip(e*1.6, 0, 1))
mix = np.tanh(mix * 0.9) / np.tanh(0.9)
pk = np.abs(mix).max(); mix = mix / pk * 0.89
sf.write("public/audio/mix.wav", mix.T.astype(np.float32), SR, subtype="PCM_16")
sf.write("public/audio/music_only.wav", (music * .5).T.astype(np.float32), SR, subtype="PCM_16")
print("done, peak before norm", round(float(pk), 2))
