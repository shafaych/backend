#!/usr/bin/env python3
"""Original synthesized soundtrack (no source audio is reused). Every hit is placed on an
edit point read from src/clips.json so the sound is frame-locked to the picture."""
import json, sys, wave
import numpy as np
SR = 48000; FPS = 30; PRE = 9
clips = json.load(open(sys.argv[1])); OUT = sys.argv[2]
TOTAL_F = 525; N = int(SR * TOTAL_F / FPS)
rng = np.random.default_rng(7)
starts = {}; t = PRE
for c in clips: starts[c['id']] = t; t += c['frames']
FOOT_END = t
T = lambda f: f / FPS
L = np.zeros(N); R = np.zeros(N)

def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    s = sig[: N - i] * gain
    L[i:i+len(s)] += s * np.sqrt((1 - pan) / 2) * 1.414
    R[i:i+len(s)] += s * np.sqrt((1 + pan) / 2) * 1.414
def tt(d): return np.arange(int(d * SR)) / SR
def dec(d, k): return np.exp(-tt(d) * k)
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.clip((f - lo) / (lo * .3 + 1), 0, 1) * np.clip((hi - f) / (hi * .3 + 1), 0, 1)
    return np.fft.irfft(X * m, len(x))
def noise(d): return rng.standard_normal(int(d * SR))
def fade(x, a=.004, b=.01):
    n = len(x); fa = int(a*SR); fb = int(b*SR)
    x = x.copy(); x[:fa] *= np.linspace(0,1,fa); x[-fb:] *= np.linspace(1,0,fb); return x

def sub_hit(d=1.5, f0=100, f1=40):
    x = tt(d); f = f1 + (f0 - f1) * np.exp(-x * 14)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * dec(d, 3.2) + 0.25 * np.sin(2 * ph) * dec(d, 9)
    click = bp(noise(d), 800, 5000) * dec(d, 90) * 0.35
    return fade(body + click, .001, .05)
def kick(d=.28): 
    x = tt(d); f = 42 + 90 * np.exp(-x * 30); ph = 2*np.pi*np.cumsum(f)/SR
    return fade(np.sin(ph) * dec(d, 14), .001, .02)
def tick(d=.05, lo=2500, hi=9000): return fade(bp(noise(d), lo, hi) * dec(d, 70), .0005, .01)
def clang(d=.7, base=420):
    x = tt(d); s = sum(a * np.sin(2*np.pi*base*r*x) * np.exp(-x*k) for r, a, k in [(1,1,7),(2.76,.7,9),(4.07,.5,13),(5.4,.3,18)])
    return fade(s + bp(noise(d), 1500, 7000) * dec(d, 60) * .3, .0008, .05)
def whoosh(d, f0, f1, shape='rise'):
    n = noise(d); out = np.zeros_like(n); seg = 12
    L_ = len(n) // seg
    for k in range(seg):
        a = k / (seg - 1); fc = f0 * (f1 / f0) ** a
        out[k*L_:(k+1)*L_] = bp(n[k*L_:(k+1)*L_], fc * .6, fc * 1.6)
    env = np.sin(np.linspace(0, np.pi, len(out))) ** (1.6 if shape == 'rise' else 1)
    if shape == 'rise': env = np.linspace(0, 1, len(out)) ** 2.2 * np.linspace(1, .0, len(out)) ** .15
    return out * env
def rustle(d):
    n = bp(noise(d), 1800, 7500); env = np.abs(bp(noise(d), 4, 18)); env = env / env.max()
    return n * env ** 1.5 * np.sin(np.linspace(0, np.pi, len(n)))
def pluck(f, d=1.2):
    x = tt(d); fm = np.sin(2*np.pi*f*2.0*x) * 1.4 * np.exp(-x*9)
    return fade(np.sin(2*np.pi*f*x + fm) * dec(d, 3.4), .002, .2)
def reverb(sig, d=1.6, mix=.35):
    ir = noise(d) * np.exp(-tt(d) * 3.2); ir = bp(ir, 300, 9000)
    n = len(sig) + len(ir); w = np.fft.irfft(np.fft.rfft(sig, n) * np.fft.rfft(ir, n), n)[:len(sig)]
    return sig + mix * w / (np.abs(w).max() + 1e-9) * np.abs(sig).max()

# ---- 0. pre-roll: near silence, a thin breath of air, then the first impact on the first image
add(whoosh(T(PRE) - .02, 900, 2600) * .10, 0.0, 1, 0.2)
add(sub_hit(1.8, 110, 38), T(PRE), .95)
add(kick(.35), T(PRE), .5)
add(clang(.9, 300), T(PRE), .10, -.2)
add(rustle(.7), T(PRE) + .05, .22, .3)

# ---- 1. every cut gets a frame-locked accent; alternate kick/metal so the rhythm is the edit itself
ids = [c['id'] for c in clips]
scene_cuts = {'c04': 'work', 'c08': 'precision', 'c10': 'process'}
for k, c in enumerate(clips[1:], 1):
    at = T(starts[c['id']]); cid = c['id']
    if cid in scene_cuts:
        add(whoosh(.34, 300, 5200) * .55, at - .30, 1, -.4 if cid != 'c08' else .4)
        add(sub_hit(1.1, 90, 44), at, .62)
        if cid == 'c04': add(clang(.8, 410), at, .38, .1)
        continue
    if k % 2: add(kick(.22), at, .42); add(tick(.04), at, .38, ((k % 4) - 1.5) * .2)
    else: add(clang(.25, 900 + (k % 5) * 80), at, .17, ((k % 3) - 1) * .3); add(tick(.05, 1200, 6000), at, .28)
    add(rustle(.35), at + .02, .22, ((k % 5) - 2) * .15)
    # off-beat hat half-way through each process shot (keeps the pulse moving without a separate grid)
    if starts[cid] >= starts['c10']:
        add(tick(.03, 5000, 11000), at + T(c['frames']) / 2, .22, .25)
# ---- 2. cutting table: motor + slicing accents under the two cutting shots
a = T(starts['c06']); d = T(starts['c06'] + clips[5]['frames'] + clips[6]['frames'])
dur = d + .12 - a; x = tt(dur)
saw = sum(np.sin(2*np.pi*f*x) / j for j, f in enumerate([92, 184, 276, 368], 1))
motor = bp(noise(dur), 200, 1800) * (.6 + .4 * np.sin(2*np.pi*58*x))
mix = (saw * .5 + motor * .5); mix *= np.minimum(1, x / .08) * np.minimum(1, (dur - x) / .12)
add(mix, a, .14)
add(whoosh(.18, 2500, 7000, 'arc') * .7, T(starts['c07']), .5, .3)
# ---- 3. text ticks (tiny, textural)
for f in (PRE + 5, PRE + 10): add(tick(.06, 1800, 7000), T(f), .22)
for f in (start := starts['c04'] + 4, start + 5, start + 10): add(tick(.05, 3000, 9000), T(f), .2, .3)
add(whoosh(.5, 600, 4000, 'arc') * .25, T(starts['c08']) + .03, 1, 0)
# ---- 4. reach: whoosh into the brand, strategic silence, then brand hit + signature
wipe_s = FOOT_END - 14; brand = FOOT_END + 6
add(whoosh(T(brand - 4 - wipe_s) + .0, 250, 6500) * .65, T(wipe_s) - .1, 1, 0)
# ---- bed (restrained): low drone, ducked, dropping out before the brand reveal
bed_d = T(brand) - 0.3; x = tt(bed_d)
drone = (np.sin(2*np.pi*55*x) + .5 * np.sin(2*np.pi*82.4*x + .4)) * (.5 + .5 * np.sin(2*np.pi*.18*x))
air = bp(noise(bed_d), 120, 700) * .4
bed = (drone * .35 + air * .15) * np.minimum(1, x / .6) * np.minimum(1, np.maximum(0, (bed_d - x)) / .25)
add(bed, T(PRE) + .2, .55)
# brand hit (after ~0.35 s of near silence)
tb = T(brand)
add(sub_hit(2.2, 120, 36), tb, 1.0); add(kick(.3), tb, .5)
sig = reverb(pluck(659.25, 1.4) * .6, 1.8, .5)
add(sig, tb + .02, .5, -.15)
add(reverb(pluck(880, 1.8) * .55, 2.0, .55), tb + .20, .5, .15)
for f in (428, 448, 472): add(tick(.05, 3500, 10000), T(f), .16, .2)
add(whoosh(.6, 4000, 9000, 'arc') * .12, tb + .25, 1, 0)

# ---- master: gentle soft clip, fades, write
for ch in (L, R):
    fi = int(.01 * SR); ch[:fi] *= np.linspace(0, 1, fi)
    fo = int(.5 * SR); ch[-fo:] *= np.linspace(1, 0, fo)
st = np.stack([L, R], 1); st = np.tanh(st * .9) / np.tanh(.9)
st = st / np.abs(st).max() * .9
pcm = (st * 32767).astype('<i2')
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', OUT, N / SR, 's')
