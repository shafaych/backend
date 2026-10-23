"""Synthesise the GHS reel soundtrack (music + SFX) and mix in the Kokoro voice-over.
Usage: python3 tools/make_audio.py   (run from ghs-reel/, needs public/audio/vo*.wav)"""
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR, DUR = 48000, 15.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def lay(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    sig = sig[: N - i]
    l = gain * (1 - max(pan, 0)); r = gain * (1 + min(pan, 0))
    buf[i:i + len(sig), 0] += sig * l
    buf[i:i + len(sig), 1] += sig * r

def env(n, a, d):  # attack/exp-decay
    t = np.arange(n) / SR
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)

def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output="sos"), x)

def kick(f0=150, f1=44, dur=0.38):
    n = int(SR * dur); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t / 0.04)) / SR
    return np.tanh(1.6 * np.sin(ph)) * env(n, 0.001, 0.12) + 0.2 * filt(rng.standard_normal(n), "high", 3000) * env(n, 0.0005, 0.01)

def boom(f=52, dur=1.8):
    n = int(SR * dur); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f * (1 + 1.2 * np.exp(-t / 0.06))) / SR
    return np.tanh(1.3 * np.sin(ph)) * env(n, 0.002, 0.5)

def hat(open_=False):
    n = int(SR * (0.22 if open_ else 0.06))
    return filt(rng.standard_normal(n), "high", 7000) * env(n, 0.0005, 0.09 if open_ else 0.018)

def clap():
    n = int(SR * 0.25)
    x = filt(rng.standard_normal(n), "band", [1200, 5000])
    e = sum(env(n, 0.0005, 0.02) * (np.arange(n) / SR >= d) for d in (0, 0.012, 0.024)) * 0.4 + env(n, 0.002, 0.07)
    return x * e

def whoosh(dur, up=True, lo=300, hi=9000):
    n = int(SR * dur); x = rng.standard_normal(n)
    fr = np.geomspace(lo, hi, n) if up else np.geomspace(hi, lo, n)
    out = np.zeros(n); low = band = 0.0
    q = 0.35
    for i in range(n):  # state-variable bandpass with sweeping cutoff
        f = 2 * np.sin(np.pi * fr[i] / SR)
        low += f * band; high = x[i] - low - q * band; band += f * high; out[i] = band
    w = np.sin(np.pi * np.linspace(0, 1, n)) ** (2 if up else 1.5)
    if up: w = np.linspace(0, 1, n) ** 2.2 * (1 - np.linspace(0, 1, n) ** 12)
    return out * w * 0.5

def rustle(dur=0.5, seed=0):
    r = np.random.default_rng(seed); n = int(SR * dur)
    x = filt(r.standard_normal(n), "band", [2500, 9000])
    am = np.abs(filt(r.standard_normal(n), "low", 40)) ** 1.5
    am /= am.max(); w = np.sin(np.pi * np.linspace(0, 1, n))
    return x * am * w * 0.8

def pluck(freq, dur=0.5):
    n = int(SR * dur); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * freq * k * t) / k for k in (1, 2, 3)) + 0.4 * np.sign(np.sin(2 * np.pi * freq * t))
    return filt(x, "low", 2400) * env(n, 0.003, 0.16)

def pad(freqs, dur):
    n = int(SR * dur); t = np.arange(n) / SR; x = np.zeros(n)
    for f in freqs:
        for d in (-0.004, 0.004):
            x += np.sin(2 * np.pi * f * (1 + d) * t) + 0.3 * np.sin(4 * np.pi * f * (1 + d) * t)
    a = np.minimum(t / 0.5, 1); r = np.minimum((dur - t) / 0.8, 1)
    return filt(x, "low", 2200) * a * r / (len(freqs) * 2)

def bassnote(freq, dur):
    n = int(SR * dur); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t) + 0.15 * np.sign(np.sin(2 * np.pi * freq * t))
    return filt(x, "low", 500) * np.minimum(t / 0.01, 1) * np.minimum((dur - t) / 0.05, 1)

m = np.zeros((N, 2))   # music bus
fx = np.zeros((N, 2))  # sfx bus
kick_times = []

# ---- hook ----
lay(fx, boom(52, 1.8), 0.40, 0.9)
lay(fx, whoosh(0.4, True, 400, 8000), 0.02, 0.5)
lay(fx, hat(True), 0.40, 0.25)
# text reveal ticks
for tt, g in ((1.85, 0.35),): lay(fx, filt(rng.standard_normal(2000), "high", 5000) * env(2000, 0.001, 0.02), tt, g)

# ---- groove 1.0 - 11.9 ----
beat = 0.5
for k in range(2, 24):
    tb = k * beat
    if tb >= 12.0: break
    lay(m, kick(), tb, 0.85 if k % 2 == 0 else 0.75); kick_times.append(tb)
    lay(m, hat(), tb + beat / 2, 0.22)
    if k % 2 == 1 and tb > 2.9: lay(m, clap(), tb, 0.22)
    if tb > 5.9: lay(m, hat(), tb + beat / 4, 0.1)
# bass line, one note per half bar
roots = [55.0, 55.0, 65.41, 49.0]  # A, A, C, G
for bar in range(1, 6):
    for h in range(2):
        s = bar * 2.0 + h * 1.0
        if s < 1.5 or s >= 12.0: continue
        lay(m, bassnote(roots[(bar * 2 + h) % 4], 0.9), s, 0.5)
# arp from scene 2
arp = [220.0, 261.63, 329.63, 392.0, 329.63, 261.63, 293.66, 392.0]
for k in range(int(3.0 / 0.25), int(12.0 / 0.25)):
    tt = k * 0.25
    f = arp[k % 8] * (1.5 if tt >= 6.0 and (k // 8) % 2 else 1.0)
    lay(m, pluck(f), tt, 0.16 if tt < 6 else 0.22, pan=0.4 * np.sin(k))
lay(m, pad([110, 164.81, 220, 261.63], 3.2), 0.0, 0.5)
lay(m, pad([110, 164.81, 220, 261.63], 5.9), 3.0, 0.45)
lay(m, pad([130.81, 196, 261.63, 329.63], 3.0), 6.0, 0.45)
lay(m, pad([98, 146.83, 196, 246.94], 3.0), 9.0, 0.45)

# ---- transitions / fabric ----
for s in (2.7, 5.7, 8.65, 11.6):
    d = 0.4 if s < 8 else 0.4
    lay(fx, whoosh(d, True, 300, 10000), s, 0.7)
    lay(fx, boom(46, 1.0), s + d, 0.55)
for tt, sd in ((3.35, 1), (4.2, 2), (5.0, 3), (7.0, 4), (7.9, 5)):
    lay(fx, rustle(0.5, sd), tt, 0.5, pan=0.3 * (-1) ** sd)
lay(fx, filt(rng.standard_normal(3000), "high", 4000) * env(3000, 0.001, 0.03), 6.35, 0.4)  # seam tick
# reveal swipes
for tt in (9.0,): lay(fx, whoosh(0.35, False, 400, 9000), tt, 0.5)
for tt in (9.45, 9.65, 9.85): lay(fx, filt(rng.standard_normal(3000), "band", [1500, 6000]) * env(3000, 0.001, 0.05), tt, 0.45)

# ---- brand end card ----
lay(fx, boom(49, 2.4), 12.0, 1.0)
lay(fx, clap(), 12.0, 0.35)
chord = [220.0, 329.63, 440.0, 493.88, 659.25]
n = int(SR * 3.0); tt_ = np.arange(n) / SR
stab = sum(np.sin(2 * np.pi * f * tt_) + 0.3 * np.sin(4 * np.pi * f * tt_) for f in chord)
lay(m, filt(stab, "low", 5000) * env(n, 0.004, 0.9) * 0.12, 12.0, 1.0)
lay(m, pad([110, 164.81, 220, 329.63], 3.0), 12.0, 0.6)
lay(m, kick(), 12.5, 0.6); lay(m, kick(), 13.5, 0.5)
for k, f in enumerate((880.0, 987.77, 1318.5)):  # soft sparkle finish
    lay(m, pluck(f, 0.9), 14.0 + k * 0.08, 0.1, pan=(-0.4, 0, 0.4)[k])

# ---- sidechain on the music bus ----
duck = np.ones(N)
for tb in kick_times + [12.5, 13.5]:
    i = int(tb * SR); L = int(0.22 * SR)
    seg = duck[i:i + L]; duck[i:i + len(seg)] = np.minimum(seg, 1 - 0.55 * np.exp(-np.arange(len(seg)) / (0.07 * SR)))
# ---- voice ----
vo = np.zeros((N, 2)); vo_gate = np.ones(N)
vo_at = {"vo1": 0.5, "vo2": 1.95, "vo3": 9.15, "vo4": 12.55}
for name, at in vo_at.items():
    x, sr = sf.read(f"public/audio/{name}.wav")
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = resample_poly(x, SR, sr)
    x = filt(x, "high", 90) ; x = x / np.abs(x).max()
    x = np.tanh(1.8 * x) / np.tanh(1.8)  # gentle compression/saturation
    lay(vo, x, at, 0.95)
    i = int(at * SR); e = i + len(x)
    g = np.ones(N); g[max(i - 3000, 0):e + 9000] = 0.55
    vo_gate = np.minimum(vo_gate, np.convolve(g, np.ones(2400) / 2400, "same"))

mix = m * duck[:, None] * vo_gate[:, None] * 0.9 + fx * vo_gate[:, None] * 0.8 + vo * 1.0
# master fade
mix[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))[:, None]
mix /= max(np.abs(mix).max(), 1e-9); mix *= 0.89
sf.write("/tmp/ghs_raw.wav", mix, SR, subtype="PCM_24")
print("raw written")
