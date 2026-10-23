"""Original score + SFX for MADE WITH INTENTION. 120 BPM (beat = 0.5s), 15s, 48k stereo.
Timeline (s): 0-2 texture ticks | 2-5 craft | 5-9 identity | 9-12 reveal | 12-15 signature."""
import numpy as np, os, wave
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
DUR = 15.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
os.makedirs(OUT, exist_ok=True)

def t(d): return np.arange(int(SR * d)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, "lp", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "hp", fs=SR, output="sos"), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], "bp", fs=SR, output="sos"), x)
def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    s = sig[: N - i]
    gl = gain * np.cos((pan + 1) * np.pi / 4); gr = gain * np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(s)] += s * gl; R[i:i + len(s)] += s * gr

def env(n, a, d, curve=3.0):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    rest = n - na; e[na:] = np.exp(-curve * np.arange(rest) / max(1, rest) * (1 / d if d else 1)) if rest > 0 else e[na:]
    return e

# ---------- instruments ----------
def kick(vel=1.0):
    x = t(0.45); f = 48 + 90 * np.exp(-x * 38)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-x * 7.5)
    y += lp(rng.standard_normal(len(x)), 1800) * np.exp(-x * 90) * 0.25
    return y * vel

def tick(vel=1.0, bright=6500):  # crisp rim/click, not a snare
    x = t(0.09)
    y = bp(rng.standard_normal(len(x)), 1800, bright) * np.exp(-x * 90)
    y += np.sin(2 * np.pi * 1650 * x) * np.exp(-x * 160) * 0.5
    return y * vel

def hat(vel=1.0, open_=False):
    x = t(0.22 if open_ else 0.05)
    y = hp(rng.standard_normal(len(x)), 7500, 3) * np.exp(-x * (22 if open_ else 110))
    return y * vel

def clap(vel=1.0):
    x = t(0.2)
    y = bp(rng.standard_normal(len(x)), 900, 3200) * (np.exp(-x * 28) + 0.6 * np.exp(-((x - 0.012) * 300) ** 2))
    return y * vel * 0.9

def rustle(d=0.28, vel=1.0, lo=2500, hi=11000):
    """Textile rustle: granular filtered noise bursts."""
    x = t(d); n = rng.standard_normal(len(x))
    grains = np.zeros(len(x))
    for _ in range(int(d * 90)):
        c = rng.integers(0, len(x)); w = rng.integers(40, 260)
        grains[c:c + w] += rng.random() * np.hanning(min(w, len(x) - c))[: len(grains[c:c + w])]
    y = bp(n, lo, hi) * grains
    return y * np.sin(np.pi * np.clip(x / d, 0, 1)) ** 0.7 * vel

def sub(freq, d, vel=1.0):
    x = t(d)
    y = np.sin(2 * np.pi * freq * x) + 0.18 * np.sin(2 * np.pi * freq * 2 * x)
    e = np.minimum(1, x / 0.015) * np.exp(-x * 2.2 / d * 1.6)
    return y * e * vel

def thread_sweep(d=0.32, up=True, vel=1.0):
    """Precision transition: narrow band-passed noise glide + a high filament tone."""
    x = t(d); n = rng.standard_normal(len(x))
    f0, f1 = (1500, 9000) if up else (9000, 1500)
    fc = np.geomspace(f0, f1, len(x))
    out = np.zeros(len(x)); seg = 512
    for i in range(0, len(x), seg):
        c = fc[i]; out[i:i + seg] = bp(n[max(0, i - 256):i + seg], c * .8, min(c * 1.25, 20000), 2)[-len(out[i:i + seg]):]
    e = np.sin(np.pi * np.clip(x / d, 0, 1)) ** 1.6
    tone = np.sin(2 * np.pi * np.cumsum(fc * 0.5) / SR) * 0.06
    return (out * 1.2 + tone) * e * vel

def pad(freqs, d, vel=1.0, bright=1400):
    x = t(d); y = np.zeros(len(x))
    for f in freqs:
        for det in (-0.007, 0.0, 0.007):
            ph = 2 * np.pi * f * (1 + det) * x
            y += (2 * ((ph / (2 * np.pi)) % 1) - 1) / 3  # saw
    y = lp(y, bright, 2)
    e = np.minimum(1, x / (d * .45)) * np.minimum(1, (d - x) / (d * .4))
    return y * e * vel / len(freqs)

def bell(freq, d=2.5, vel=1.0):
    x = t(d); y = np.zeros(len(x))
    for r, a, dec in ((1, 1, 2.2), (2.01, .5, 3.0), (3.99, .22, 4.5), (5.4, .12, 6)):
        y += a * np.sin(2 * np.pi * freq * r * x) * np.exp(-x * dec)
    mod = np.sin(2 * np.pi * freq * 3.5 * x) * np.exp(-x * 14) * 0.6
    y += np.sin(2 * np.pi * freq * x + 2.2 * mod) * 0.5 * np.exp(-x * 3)
    y *= np.minimum(1, x / 0.004)
    return y * vel

def reverb(x_l, x_r, d=2.6, wet=0.3):
    ir_n = int(SR * d); k = np.arange(ir_n) / SR
    outs = []
    for x, seed in ((x_l, 1), (x_r, 2)):
        ir = np.random.default_rng(seed).standard_normal(ir_n) * np.exp(-k * 2.6)
        ir = lp(ir, 5200, 1); ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        outs.append(fftconvolve(x, ir)[: len(x)] * wet / 40)
    return outs

# ---------- score ----------
F = {"F1": 43.65, "Db1": 34.65, "Ab1": 51.91, "Eb1": 38.89}
b = lambda n: n * BEAT

# Scene 1 (0-2s): sharp, rhythmic ticks over a bare fabric-air bed
for beat, v, f in ((0, 1.0, 6500), (1, .55, 5200), (2, .8, 6500), (3, .5, 5200), (3.5, .6, 7000)):
    add(tick(v, f), b(beat), .55, pan=-0.15 if int(beat * 2) % 2 == 0 else .2)
add(rustle(1.2, .5, 3000, 9000), 0.1, .22, pan=-.3)
add(sub(F["F1"], 1.4, 1), 1.0, .55)                       # bass enters at 1.0
add(thread_sweep(.55, True, 1), 1.5, .4)                  # tension into scene 2
# fabric wipes (14 frames, centred on the cut)
for i, c in enumerate((2.5, 3.5, 4.5, 6.0, 7.0, 8.0, 9.0)):
    add(thread_sweep(14 / 30, i % 2 == 0, 1), c - 7 / 30, .3 if c < 9 else .22, pan=-.3 if i % 2 == 0 else .3)

# Scene 2 (2-5s): craft - kick on beats, hats 8ths, rustle on each cut
cuts2 = [2.0, 2.5, 3.0, 3.5, 3.75, 4.0, 4.5]
for i in range(int((5.0 - 2.0) / BEAT)):
    tt = 2.0 + i * BEAT
    add(kick(.95 if i % 2 == 0 else .7), tt, .62)
    add(hat(.5), tt + BEAT / 2, .22, pan=.3)
    add(hat(.28), tt + BEAT / 4, .12, pan=-.3)
    add(hat(.28), tt + 3 * BEAT / 4, .12, pan=.3)
    if i % 2 == 1: add(clap(.55), tt, .26)
for tt in cuts2:
    add(rustle(.22, .7), tt, .22, pan=rng.uniform(-.5, .5))
    add(tick(.6, 8000), tt, .3)
for tt in (2.0, 3.0, 4.0):
    add(sub(F["F1"] if tt < 4 else F["Db1"], .9, 1), tt, .6)

# Scene 3 (5-9s): identity - fuller groove, 8 cuts on beats
for i in range(int(4.0 / BEAT)):
    tt = 5.0 + i * BEAT
    add(kick(1.0 if i % 2 == 0 else .75), tt, .66)
    add(hat(.55, open_=(i % 2 == 1)), tt + BEAT / 2, .2, pan=.35)
    add(hat(.3), tt + BEAT / 4, .1, pan=-.35); add(hat(.3), tt + 3 * BEAT / 4, .1, pan=.35)
    if i % 2 == 1: add(clap(.7), tt, .3)
    add(rustle(.2, .65), tt, .2, pan=rng.uniform(-.6, .6))
for tt, f in ((5.0, "Db1"), (6.0, "Db1"), (7.0, "Ab1"), (8.0, "Eb1")):
    add(sub(F[f], .98, 1), tt, .68)
# "YOUR BRAND." text hit
add(tick(1, 9000), 7.0, .4); add(bell(1568, 1.2, .5), 7.0, .1, pan=.3)

# Scene 4 (9-12s): drop to near-silence, pad swell, sonic logo
add(pad([87.3, 130.8, 207.7], 5.5, 1.0, 900), 8.5, .26)  # Fm / Ab colour, swells to 12
add(sub(F["F1"], 3.0, 1), 9.0, .22)
# sonic logo: C6 - G5 - C7 with long tail, letters build on the first two notes
add(bell(1046.5, 3.2, 1), 9.55, .26, pan=-.2)
add(bell(783.99, 3.0, 1), 9.80, .22, pan=.2)
add(bell(2093.0, 3.5, 1), 10.05, .2, pan=0)
add(rustle(.5, .6, 4000, 12000), 9.45, .18)

# Scene 5 (12-15s): signature
add(kick(1.0), 12.0, .6); add(sub(F["Db1"], 3.0, 1), 12.0, .42)
add(pad([69.3, 103.8, 138.6, 207.7], 3.0, 1.0, 1100), 12.0, .35)
add(bell(1046.5, 3.0, 1), 12.0, .22)
add(tick(.7, 8000), 12.5, .22)
add(bell(1568, 2.4, 1), 13.0, .1)   # website line
add(rustle(.25, .5), 13.0, .1)
add(bell(2093.0, 2.2, 1), 13.55, .08)

# ---------- master ----------
dry_l, dry_r = L.copy(), R.copy()
# duck the pad/bass slightly by kick is already implicit; add reverb
rl, rr = reverb(L, R, 2.6, 0.6)
L = dry_l + rl; R = dry_r + rr
# gentle tape-ish saturation + highpass for cleanliness
L = np.tanh(hp(L, 28) * 1.25); R = np.tanh(hp(R, 28) * 1.25)
# fades
fi = int(.01 * SR); L[:fi] *= np.linspace(0, 1, fi); R[:fi] *= np.linspace(0, 1, fi)
fo = int(1.2 * SR); L[-fo:] *= np.linspace(1, 0, fo) ** 1.5; R[-fo:] *= np.linspace(1, 0, fo) ** 1.5
L, R = L * 0.6, R * 0.6
st = np.stack([L, R], 1)
pcm = (st * 32767).astype(np.int16)
with wave.open(os.path.join(OUT, "ghs_mix.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("rms dBFS", 20 * np.log10(np.sqrt((st ** 2).mean())), "peak", 20 * np.log10(np.abs(st).max()))
