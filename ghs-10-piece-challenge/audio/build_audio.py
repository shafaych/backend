"""Procedural music + SFX + VO mix for "Big Brands Start Small" (40s, 48kHz stereo).
Everything is synthesised with numpy/scipy – no samples, no external assets.
Outputs (to ../public/audio): vo.wav, music.wav, sfx.wav, mix.wav (+ cues.json)
Run: python3 build_audio.py
"""
import json, os
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000
DUR = 40.0
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "audio")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)
BPM = 120
BEAT = 60 / BPM

# ---------------------------------------------------------------- helpers
def t_(d): return np.arange(int(SR * d)) / SR
def env_ad(n, a=0.002, d=0.3, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1) * np.exp(-t * curve / max(d, 1e-3))
    return e
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, min(f, 20000) / (SR / 2), "low", output="sos"), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f / (SR / 2), "high", output="sos"), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo / (SR / 2), hi / (SR / 2)], "band", output="sos"), x)
def noise(d): return rng.standard_normal(int(SR * d))
def saw(f, d):
    t = t_(d); return 2 * ((t * f) % 1) - 1
def midi(m): return 440 * 2 ** ((m - 69) / 12)

def reverb(x, secs=1.8, wet=0.3, hp_f=200):
    n = int(SR * secs)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * (6.9 / secs))
    ir = lp(ir, 6000)
    ir = hp(ir, hp_f)
    ir /= np.sqrt(np.sum(ir ** 2))
    w = signal.fftconvolve(x, ir)[: len(x)]
    return x * (1 - wet) + w * wet

class Bus:
    def __init__(self): self.l = np.zeros(N); self.r = np.zeros(N)
    def add(self, sig, t, g=1.0, pan=0.0):
        i = int(t * SR)
        if i >= N or i < 0: return
        s = sig[: N - i] * g
        a = (pan + 1) * np.pi / 4
        self.l[i:i + len(s)] += s * np.cos(a); self.r[i:i + len(s)] += s * np.sin(a)
    def stereo(self): return np.stack([self.l, self.r], 1)

# ---------------------------------------------------------------- instruments
def kick(g=1.0):
    d = 0.45; t = t_(d)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env_ad(len(t), 0.001, 0.35, 5)
    click = np.zeros(len(t)); click[:120] = hp(noise(0.0025), 1500)[:120] * 0.5
    return np.tanh((s + click) * 1.6) * g
def snare(g=1.0):
    d = 0.35; t = t_(d)
    n = hp(noise(d), 1800) * env_ad(len(t), 0.001, 0.18, 6)
    tone = np.sin(2 * np.pi * 190 * t) * env_ad(len(t), 0.001, 0.09, 6) * 0.5
    return (n * 0.7 + tone) * g
def clap(g=1.0):
    d = 0.3; s = np.zeros(int(SR * d))
    for o in (0, 0.011, 0.022):
        i = int(o * SR); n = bp(noise(0.12), 900, 3500) * env_ad(int(0.12 * SR), 0.001, 0.05, 5); s[i:i + len(n)] += n
    s += bp(noise(d), 900, 3500) * env_ad(len(s), 0.025, 0.18, 6) * 0.6
    return s * g
def hat(g=1.0, open_=False):
    d = 0.25 if open_ else 0.06
    return hp(noise(d), 7000) * env_ad(int(SR * d), 0.0005, d * 0.7, 6) * g
def bass(m, d, g=1.0):
    f = midi(m); t = t_(d)
    s = saw(f, d) * 0.5 + np.sin(2 * np.pi * f * t)
    cut = 250 + 700 * np.exp(-t * 8)
    # time-varying lowpass via blocks
    out = np.zeros_like(s); blk = 512; z = None
    for i in range(0, len(s), blk):
        sos = signal.butter(2, cut[i] / (SR / 2), "low", output="sos")
        if z is None: z = signal.sosfilt_zi(sos) * s[i]
        o, z = signal.sosfilt(sos, s[i:i + blk], zi=z); out[i:i + blk] = o
    return out * np.minimum(t / 0.005, 1) * np.minimum((d - t) / 0.03, 1).clip(0, 1) * g
def pluck(m, g=1.0, d=0.35):
    f = midi(m); t = t_(d)
    s = saw(f, d) + saw(f * 1.006, d) * 0.7
    out = np.zeros_like(s); blk = 256; z = None
    cut = 500 + 4500 * np.exp(-t * 14)
    for i in range(0, len(s), blk):
        sos = signal.butter(2, cut[i] / (SR / 2), "low", output="sos")
        if z is None: z = signal.sosfilt_zi(sos) * s[i]
        o, z = signal.sosfilt(sos, s[i:i + blk], zi=z); out[i:i + blk] = o
    return out * env_ad(len(t), 0.002, 0.25, 5) * g
def pad(ms, d, g=1.0, bright=2200):
    t = t_(d); s = np.zeros(len(t))
    for m in ms:
        for det in (-0.007, 0.0, 0.007):
            s += saw(midi(m) * (1 + det), d)
    s = lp(s, bright, 2)
    a = np.minimum(t / 0.8, 1) * np.minimum((d - t) / 0.8, 1).clip(0, 1)
    return s * a * g / (len(ms) * 3)
def riser(d, g=1.0, up=True):
    t = t_(d); n = noise(d)
    out = np.zeros_like(n); blk = 1024; z = None
    for i in range(0, len(n), blk):
        c = 300 + 9000 * (i / len(n)) ** 2
        sos = signal.butter(2, [c / (SR / 2), min(c * 2.2, 22000) / (SR / 2)], "band", output="sos")
        if z is None: z = signal.sosfilt_zi(sos) * 0
        o, z = signal.sosfilt(sos, n[i:i + blk], zi=z); out[i:i + blk] = o
    out *= (t / d) ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(120 + 900 * (t / d) ** 3) / SR) * (t / d) ** 2.5 * 0.35
    s = out * 3 + tone
    s /= np.max(np.abs(s)) + 1e-9
    return (s if up else s[::-1]) * g
def whoosh(d=0.6, g=1.0, f0=500, f1=5000):
    n = noise(d); t = t_(d); out = np.zeros_like(n); blk = 512; z = None
    for i in range(0, len(n), blk):
        c = f0 * (f1 / f0) ** np.sin(np.pi * i / len(n))  # up then down
        sos = signal.butter(2, [c * 0.6 / (SR / 2), min(c * 1.6, 22000) / (SR / 2)], "band", output="sos")
        if z is None: z = signal.sosfilt_zi(sos) * 0
        o, z = signal.sosfilt(sos, n[i:i + blk], zi=z); out[i:i + blk] = o
    e = np.sin(np.pi * t / d) ** 2
    s = out * e; s /= np.max(np.abs(s)) + 1e-9
    return s * g
def impact(g=1.0, d=3.2):
    t = t_(d)
    f = 38 + 140 * np.exp(-t * 9)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.002, 1.8, 4.5)
    crack = hp(noise(d), 600) * env_ad(len(t), 0.001, 0.25, 6) * 0.9
    boom = lp(noise(d), 400) * env_ad(len(t), 0.002, 1.0, 5) * 0.6
    s = sub * 1.2 + crack + boom
    s = np.tanh(s * 1.3)
    tail = reverb(hp(s, 90), 2.6, 0.45, 150)
    return tail * g
def hit(g=1.0):  # mid-weight typographic hit
    d = 0.9; t = t_(d)
    f = 55 + 90 * np.exp(-t * 20)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.001, 0.5, 5)
    top = hp(noise(d), 1500) * env_ad(len(t), 0.001, 0.08, 6) * 0.6
    return np.tanh((sub * 1.3 + top)) * g
def click(g=1.0, f=2400):
    d = 0.05; t = t_(d)
    return (np.sin(2 * np.pi * f * t) * env_ad(len(t), 0.0005, 0.012, 6) * 0.6 +
            hp(noise(d), 4000) * env_ad(len(t), 0.0002, 0.006, 6) * 0.4) * g
def tick(g=1.0, f=1400):
    d = 0.04; t = t_(d); return np.sin(2 * np.pi * f * t) * env_ad(len(t), 0.0003, 0.01, 6) * g
def swish(d=0.45, g=1.0):  # soft fabric
    n = bp(noise(d), 1500, 7000); t = t_(d)
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.6
    return n * e * g * 1.2
def thump(g=1.0, f=70):
    d = 0.4; t = t_(d); ff = f + 40 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(ff) / SR) * env_ad(len(t), 0.001, 0.2, 5) * g
def paper(d=0.5, g=1.0):  # tape / box material
    n = bp(noise(d), 800, 9000); t = t_(d)
    return n * (rng.random(len(t)) > 0.3) * env_ad(len(t), 0.002, d * 0.8, 3) * g
def chime(f, g=1.0, d=1.6):
    t = t_(d)
    s = sum(np.sin(2 * np.pi * f * k * t) * a * np.exp(-t * dc) for k, a, dc in
            [(1, 1, 2.2), (2.01, 0.5, 3), (3.98, 0.25, 5), (5.4, 0.12, 7)])
    return reverb(s * np.minimum(t / 0.002, 1), 1.8, 0.35) * g

# ---------------------------------------------------------------- VO
VO_T = {1: 0.8, 2: 6.5, 3: 13.2, 4: 20.4, 5: 27.4, 6: 34.9}
vo = np.zeros(N)
for i, st in VO_T.items():
    x, sr = sf.read(os.path.join(HERE, f"vo_{i}.wav"))
    assert sr == 24000
    x = signal.resample_poly(x, 2, 1)
    x = hp(x, 70)
    x = x / (np.max(np.abs(x)) + 1e-9)
    i0 = int(st * SR); vo[i0:i0 + len(x)] += x[: N - i0] * 0.9
# gentle presence EQ + compression-ish limiter
vo = vo + 0.35 * bp(vo, 2500, 5500)
vo = reverb(vo, 0.9, 0.06, 300)
vo = np.tanh(vo * 1.6) / np.tanh(1.6)
vo *= 0.95 / np.max(np.abs(vo))

# duck mask from VO activity
act = lp(np.abs(vo), 8, 1)
act = (act > 0.012).astype(float)
duck = signal.sosfilt(signal.butter(1, 6 / (SR / 2), "low", output="sos"), act)
duck = np.clip(duck * 1.4, 0, 1)

# ---------------------------------------------------------------- cue sheet (seconds) – mirrored by src/timeline.ts
CUES = {
    "s1_500": 0.30, "s1_1000": 1.50, "s1_toomany": 2.55, "s1_silence": 3.60,
    "s1_whatif": 3.70, "s1_ten": 4.50, "s2_start": 6.00, "s3_start": 13.00,
    "s4_start": 20.00, "s5_start": 27.00, "s6_start": 34.00, "wordmark_hit": 34.60,
    "headline_hit": 36.30, "url": 38.40,
}

# ---------------------------------------------------------------- SFX
S = Bus()
add = S.add
# Scene 1 — problem
add(thump(0.8, 55), 0.30, 1, 0); add(hit(0.5), 0.30)
add(hit(0.85), 1.50); add(thump(1.0, 50), 1.50)
for k in range(6): add(tick(0.35, 1800 + k * 200), 1.62 + k * 0.045, 1, (-1) ** k * 0.5)  # glitch stutter
add(hit(1.0), 2.55); add(thump(1.0, 45), 2.55)
for k in range(8): add(tick(0.4, 900 + 200 * (k % 3)), 2.62 + k * 0.035, 1, (-1) ** k * 0.6)
add(riser(1.05, 0.9), 2.55)                     # reverse suck into silence
add(whoosh(0.5, 0.5, 400, 3000), 3.70, 1, -0.4)
add(whoosh(0.4, 0.5, 600, 4500), 4.10, 1, 0.4)
add(impact(1.15), 4.50)                          # "10" slam
add(tick(0.5, 3000), 4.50)
add(riser(0.6, 0.7), 5.4)                        # into scene 2
# Scene 2 — first collection
add(whoosh(0.9, 0.9, 300, 5000), 5.85)
add(impact(0.55, 2.0), 6.00)
for k in range(10):
    add(swish(0.5, 0.45), 6.35 + 0.17 * k, 1, np.sin(k * 1.9) * 0.7)
    add(thump(0.22, 90 + 6 * k), 6.55 + 0.17 * k)
add(whoosh(0.8, 0.5, 400, 3500), 8.2)
add(hit(0.9), 8.60); add(tick(0.6, 2200), 9.7); add(hit(0.4), 9.7)
add(swish(0.9, 0.35), 10.8, 1, -0.4); add(swish(0.9, 0.35), 11.8, 1, 0.4)
add(riser(0.9, 0.7, up=False), 12.2); add(whoosh(0.7, 0.8, 500, 4500), 12.6)
# Scene 3 — identity
add(whoosh(0.7, 0.7), 12.95)
add(hit(0.7), 13.30)
for tt, f in ((13.7, 2200), (14.05, 2600), (14.4, 3000)): add(click(1.0, f), tt)       # color picks
add(swish(0.6, 0.6), 14.5)                                                              # pattern material wipe
for tt in (15.0, 15.18, 15.36): add(thump(0.5, 80), tt); add(click(0.8, 1800), tt)      # numbers stamp
add(hit(0.75), 14.80)
for k in range(14): add(tick(0.5, 2800 + (k % 2) * 400), 15.45 + k * 0.06, 1, (-1) ** k * 0.5)  # embroidery stitch
add(click(1.0, 3200), 16.15); add(paper(0.25, 0.5), 16.15)                              # label snap
add(hit(0.85), 16.30); add(whoosh(0.5, 0.5), 16.30)
add(paper(0.5, 0.6), 17.0); add(paper(0.4, 0.55), 17.5)
add(thump(0.9, 62), 18.0); add(paper(0.6, 0.8), 18.05)                                  # box lands / tape
add(click(1.0, 2400), 18.8); add(chime(880, 0.35), 18.9)
add(riser(0.7, 0.8), 18.9)
# Scene 4 — scale
add(whoosh(0.6, 0.7), 19.95)
for tt, base in ((20.6, 600), (21.5, 800), (22.4, 1000), (23.3, 1300)):
    add(hit(0.65), tt); add(click(1.0, base * 2), tt)
    for j in range(4): add(thump(0.35 + 0.1 * j, 80 + 8 * j), tt + 0.1 + j * 0.12)  # box stack thuds
n_ = 0
tt = 20.0
while tt < 24.0:                                                                        # escalating rhythmic ticks
    add(tick(0.15 + 0.2 * (tt - 20) / 4, 1200 + 150 * n_ % 1800), tt)
    tt += max(0.12, 0.5 - 0.09 * (n_ + 1)); n_ += 1
add(riser(1.1, 0.9), 23.9)
add(impact(0.85, 2.4), 25.0); add(hit(0.9), 24.1)
add(hit(0.9), 25.3); add(impact(0.8, 2.4), 25.3)
add(whoosh(0.8, 0.7, 400, 6000), 26.5)
# Scene 5 — partner
add(whoosh(0.8, 0.7), 26.9); add(impact(0.5, 2.0), 27.0)
add(swish(1.4, 0.35), 27.4); add(bp(noise(2.5), 2000, 9000) * env_ad(int(2.5 * SR), 0.5, 2.0, 3) * 0.04, 27.5)
for tt in (28.5, 29.5, 30.5, 31.5):
    add(hit(0.5), tt); add(click(1.0, 2000), tt); add(chime(660 + (tt - 28.5) * 110, 0.22), tt + 0.02)
add(riser(1.2, 0.9), 32.5)
# Scene 6 — CTA
add(riser(1.0, 0.9, up=False), 33.0)                                                    # suck to black
add(impact(1.35, 4.5), 34.60)                                                           # wordmark impact
add(whoosh(0.6, 0.6, 600, 6000), 35.9)
add(impact(0.9, 3.5), 36.30); add(hit(1.0), 36.30)                                      # headline
add(click(1.0, 2800), 37.6); add(hit(0.4), 37.6)
add(chime(1318, 0.45, 2.4), 38.4); add(click(1.0, 3400), 38.4)
sfx = S.stereo()

# ---------------------------------------------------------------- MUSIC (A minor, 120 BPM, beat-aligned at integer seconds)
M = Bus()
CH = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]  # Am F C G
def chord_at(t): return CH[int((t // 2) % 4)] if t >= 0 else CH[0]
# intro drone 0 – 3.6 (tense)
M.add(pad([33, 40, 45], 3.7, 0.9, 500), 0.0, 1, 0)
M.add(pad([57, 60, 63], 3.7, 0.35, 1200), 0.0, 1, 0)
for k in range(7): M.add(thump(0.55, 48), 0.3 + k * 0.5, 1, 0)          # heartbeat sub pulse
for k in range(9, 24): M.add(hat(0.18), 0.5 + k * 0.125, 1, 0.3)
# riser into silence
# 4.5 → 6.0 pre-drop groove (kick + bass)
def groove(t0, t1, kick_on=True, hats=True, bassline=True, arp=False, clap_on=True, clap_beats=(1, 3), intensity=1.0):
    t = t0
    while t < t1 - 1e-6:
        beat = round((t - t0) / BEAT)
        bar_t = t
        if kick_on: M.add(kick(0.95 * intensity), t, 1, 0)
        if hats:
            M.add(hat(0.28 * intensity), t + BEAT / 2, 1, 0.35)
            if beat % 2 == 1: M.add(hat(0.18, True), t + BEAT / 2, 1, -0.3)
            M.add(hat(0.12), t + BEAT / 4, 1, -0.2); M.add(hat(0.12), t + 3 * BEAT / 4, 1, 0.2)
        if clap_on and beat % 4 in clap_beats: M.add(clap(0.55 * intensity), t, 1, 0)
        if bassline:
            root = chord_at(t)[0] - 12
            M.add(bass(root, BEAT * 0.45, 0.8), t + BEAT / 2, 1, 0)
            if beat % 4 == 0: M.add(bass(root, BEAT * 0.9, 0.9), t, 1, 0)
        if arp:
            notes = chord_at(t)[1]
            for j in range(2):
                n = notes[(beat * 2 + j) % 3] + 12 * (1 + ((beat + j) % 2))
                M.add(pluck(n, 0.38 * intensity), t + j * BEAT / 2, 1, 0.5 * (-1) ** j)
        t += BEAT
groove(4.5, 6.0, hats=False, clap_on=False, arp=False)
M.add(pad([45, 52, 57, 60], 1.6, 0.6, 1500), 4.5)
# Scene 2 (6–13): groove + arp
groove(6.0, 13.0, arp=True, intensity=0.9)
for t in np.arange(6.0, 13.0, 2.0): M.add(pad(chord_at(t)[1], 2.1, 0.5), t)
# Scene 3 (13–20): melodic, slightly softer drums
groove(13.0, 20.0, arp=True, intensity=0.8, clap_beats=(2,))
for t in np.arange(14.0, 20.0, 2.0): M.add(pad([n + 12 for n in chord_at(t)[1]], 2.1, 0.55, 3000), t)
M.add(pad(chord_at(13.0)[1], 1.1, 0.5), 13.0)
# Scene 4 (20–27): escalating
groove(20.0, 24.0, arp=True, intensity=1.0)
for t in np.arange(20.0, 24.0, 2.0): M.add(pad(chord_at(t)[1], 2.1, 0.55), t)
# snare roll 22–24 escalating, into START SMALL (24.1) breakdown, THINK BIG (25.3) full drop
tt = 22.0; sp = 0.25
while tt < 24.0:
    M.add(snare(0.35 + 0.5 * (tt - 22) / 2), tt, 1, 0); tt += sp; sp = max(0.0625, sp * 0.86)
groove(24.0, 25.3, kick_on=False, hats=False, bassline=False, arp=False, clap_on=False)
M.add(pad([57, 60, 64], 1.4, 0.5), 24.0)
groove(25.3, 27.0, arp=True, intensity=1.1)
for t in np.arange(25.3, 27.0, 2.0): M.add(pad([57, 60, 64, 69], 1.8, 0.7, 3500), t)
# Scene 5 (27–34): driving, sophisticated
groove(27.0, 33.0, arp=True, intensity=0.95)
for t in np.arange(27.0, 33.0, 2.0): M.add(pad([n + 12 for n in chord_at(t)[1]], 2.1, 0.55, 3200), t)
for k in range(8): M.add(snare(0.3 + 0.07 * k), 32.0 + k * 0.125 if k < 8 else 33.0, 1, 0)  # fill
# Scene 6: suck to black ~33.0–34.6, then wordmark drop
M.add(pad([33, 40, 45], 2.5, 0.8, 600), 33.0)
groove(34.6, 36.3, kick_on=True, hats=False, clap_on=False, arp=False)
groove(36.3, 38.4, arp=True, intensity=1.0)
for t in (34.6, 36.3): M.add(pad([57, 60, 64, 69], 3.0, 0.9, 3500), t)
M.add(pad([45, 52, 57, 60, 64], 4.0, 0.9, 2500), 38.4)
music_st = M.stereo()
wet = reverb(0.5 * (music_st[:, 0] + music_st[:, 1]), 1.5, 1.0, 300) * 0.12
music_st = music_st + wet[:, None]

# music dips: silence window 3.6–4.5 (music cut), end fade
mm = np.ones(N)
def ramp(m, t0, t1, a, b):
    i0, i1 = int(t0 * SR), int(t1 * SR); m[i0:i1] = np.linspace(a, b, i1 - i0)
i0, i1 = int(3.55 * SR), int(4.5 * SR); mm[i0:i1] = 0.0
ramp(mm, 3.45, 3.55, 1, 0)
i0, i1 = int(33.95 * SR), int(34.6 * SR); mm[i0:i1] = 0.0                     # black beat before wordmark
ramp(mm, 33.7, 33.95, 1, 0)
ramp(mm, 38.4, 40.0, 1, 0.0)
music_st = music_st * mm[:, None]
# also silence SFX tails (riser) not needed; keep dramatic cuts clean via mask on sfx for black beats
duck_m = 1 - 0.38 * duck   # music ducks ~4 dB … deeper below
music_st = music_st * duck_m[:, None] * 0.55
sfx_st = sfx * (1 - 0.22 * duck)[:, None] * 0.8
vo_st = np.stack([vo, vo], 1)

def norm_peak(x, p): return x * (p / (np.max(np.abs(x)) + 1e-9))
music_st = norm_peak(music_st, 0.68)

mix = vo_st * 1.0 + music_st * 1.0 + sfx_st * 1.0
mix = hp(mix.T, 30, 2).T
# gentle master: soft clip
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix = mix * (0.89 / np.max(np.abs(mix)))
fade = np.ones(N); fade[: int(0.02 * SR)] = np.linspace(0, 1, int(0.02 * SR)); fade[-int(0.3 * SR):] = np.linspace(1, 0, int(0.3 * SR))
mix *= fade[:, None]

for name, x in (("vo", vo_st), ("music", music_st), ("sfx", sfx_st), ("mix", mix)):
    sf.write(os.path.join(OUT, f"{name}.wav"), (x * fade[:, None]).astype(np.float32), SR, subtype="PCM_16")
json.dump({"cues": CUES, "vo_start": VO_T, "bpm": BPM}, open(os.path.join(HERE, "cues.json"), "w"), indent=2)
print("peak mix", np.max(np.abs(mix)))
