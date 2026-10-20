#!/usr/bin/env python3
"""Procedural score + SFX + voice mix for THE INVISIBLE PLAYER. Run from tools/."""
import json, numpy as np, soundfile as sf, math
from scipy.signal import sosfilt, butter, fftconvolve, resample_poly

SR = 48000
DUR = 55.0
N = int((DUR + 3.5) * SR)
T = json.load(open("../src/timing.json"))
rng = np.random.default_rng(11)

def bus(): return np.zeros((2, N))
music, sfx, amb, voice, rvb = bus(), bus(), bus(), bus(), bus()

def pan_gain(p): a = (p + 1) * math.pi / 4; return math.cos(a), math.sin(a)
def add(b, sig, t, g=1.0, pan=0.0, send=0.0):
    i = int(t * SR)
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    l, r = pan_gain(pan)
    b[0, i:i+n] += sig[:n] * g * l
    b[1, i:i+n] += sig[:n] * g * r
    if send > 0:
        rvb[0, i:i+n] += sig[:n] * g * l * send
        rvb[1, i:i+n] += sig[:n] * g * r * send

def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, min(hi, SR/2-100)], "band", fs=SR, output="sos"), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def adsr(n, a, r, curve=1.0):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** curve if na < n else np.linspace(0, 1, n)
    if nr < n: e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e
def expdec(d, tau): return np.exp(-tt(d) / tau)
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)

def sweep_bp(x, f0, f1, q=3.0, o=2):
    """time-varying band-pass noise (block-wise, filter state carried)."""
    out = np.zeros_like(x); B = 1024; zi = None
    nb = len(x) // B + 1
    for b in range(nb):
        s = b * B; e = min(len(x), s + B)
        if s >= e: break
        fc = f0 * (f1 / f0) ** (b / max(1, nb - 1))
        sos = butter(o, [fc / (1 + 1/q), min(fc * (1 + 1/q), SR/2 - 200)], "band", fs=SR, output="sos")
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        out[s:e], zi = sosfilt(sos, x[s:e], zi=zi)
    return out

def glide(f0, f1, d, harm=(1,), amps=(1,), curve="exp"):
    t = tt(d); k = t / d
    f = f0 * (f1 / f0) ** k if curve == "exp" else f0 + (f1 - f0) * k
    ph = 2 * np.pi * np.cumsum(f) / SR
    return sum(a * np.sin(h * ph) for h, a in zip(harm, amps))

# ---------- reverb ----------
def make_ir(t60=3.0, seed=3):
    r = np.random.default_rng(seed); n = int(t60 * 1.1 * SR)
    t = np.arange(n) / SR
    ir = np.stack([r.standard_normal(n), r.standard_normal(n)]) * np.exp(-t * 6.9 / t60)
    ir = lp(ir, 5500)  # darker tail
    ir[:, :int(0.02*SR)] *= np.linspace(0, 1, int(0.02*SR))
    return ir / np.sqrt((ir ** 2).sum() / 2) * 0.55

IR = make_ir()
def reverb(x2):  # x2 (2,n)
    return np.stack([fftconvolve(x2[0], IR[0])[:x2.shape[1]], fftconvolve(x2[1], IR[1])[:x2.shape[1]]])

# ---------- instruments ----------
def saw_pad(freqs, d, bright=1800, detune=0.006, voices=3, a=1.2, r=1.5):
    t = tt(d); out = np.zeros(len(t))
    for f in freqs:
        for v in range(voices):
            df = f * (1 + detune * (v - (voices - 1) / 2) + rng.uniform(-0.0008, 0.0008))
            ph = (t * df + rng.uniform()) % 1.0
            out += (2 * ph - 1) * 0.5 + 0.5 * np.sin(2*np.pi*ph*2)*0.3
    out = lp(out, bright)
    return out * adsr(len(t), a, r) / (len(freqs) * voices) * 2.2

def pluck(f, d=1.2, bright=1.0, tau=0.35):
    t = tt(d); out = np.zeros(len(t))
    for k, a in enumerate([1, .5, .28, .16, .08], 1):
        out += a * np.sin(2*np.pi*f*k*t*(1+0.0004*k*k)) * np.exp(-t / (tau / (1 + 0.5 * (k - 1) * bright)))
    out[:int(0.004*SR)] *= np.linspace(0, 1, int(0.004*SR))
    return out * 0.5

def bell(f, d=2.5, tau=0.9):
    t = tt(d); out = np.zeros(len(t))
    for r_, a in [(1, 1), (2.76, .5), (5.4, .3), (8.93, .15)]:
        out += a * np.sin(2*np.pi*f*r_*t) * np.exp(-t / (tau / (1 + 0.4 * (r_ - 1))))
    out[:int(0.002*SR)] *= np.linspace(0, 1, int(0.002*SR))
    return out * 0.4

def sub(f, d, tau=None, drop=0.0):
    t = tt(d); tau = tau or d / 3
    fr = f * (1 + drop * np.exp(-t / 0.08))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    return np.sin(ph) * np.exp(-t / tau)

def kick(g=1.0):
    t = tt(0.4); f = 45 + 95 * np.exp(-t / 0.035)
    x = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t / 0.13)
    x += 0.4 * hp(noise(0.4), 1500) * np.exp(-t / 0.004)
    return x * g

def snare(g=1.0, d=0.3):
    t = tt(d); x = bp(noise(d), 1800, 9000) * np.exp(-t / 0.07) + np.sin(2*np.pi*190*t) * np.exp(-t / 0.05) * 0.5
    return x * g

def hat(g=1.0, d=0.06): return hp(noise(d), 7000) * expdec(d, 0.012) * g
def tick(f=2400, g=1.0, d=0.05):
    t = tt(d); return np.sin(2*np.pi*f*t) * np.exp(-t / 0.008) * g + hp(noise(d), 5000) * np.exp(-t / 0.003) * 0.3 * g

def whoosh(d, f0, f1, q=2.0, g=1.0, shape=1.0):
    n = noise(d); x = sweep_bp(n, f0, f1, q)
    k = np.linspace(0, 1, len(x))
    e = np.sin(np.pi * np.clip(k, 0, 1) ** shape) ** 1.5
    return x * e * g * 4

def riser(d, f0=200, f1=9000, g=1.0):
    x = sweep_bp(noise(d), f0, f1, 1.6)
    k = np.linspace(0, 1, len(x)); return x * k ** 2.2 * g * 4

def hit(g=1.0, d=3.0, f=42):
    t = tt(d)
    x = sub(f, d, tau=1.1, drop=1.6) * 1.0
    x += lp(noise(d), 600) * np.exp(-t / 0.25) * 0.9
    x += hp(noise(d), 3000) * np.exp(-t / 0.05) * 0.5
    return x * g

# ---------- timeline ----------
def heart_times():
    out = []; t = 2.0
    while t < 11.5:
        out.append(t); k = min(1, (t - 2.0) / 6); t += 1.05 - 0.35 * k
    return out

def S(k): return T["scenes"][k]
FZ = T["freeze"]

# === AMBIENCE ===
def crowd(d, bright=True):
    L = noise(d); R = noise(d)
    out = []
    for x in (L, R):
        y = bp(x, 220, 3800) + 0.5 * bp(x, 500, 900) + 0.35 * bp(x, 1100, 1800)
        k = tt(d)
        slow = 0.55 + 0.45 * np.sin(2*np.pi*0.23*k + rng.uniform(0, 6)) * np.sin(2*np.pi*0.11*k + rng.uniform(0, 6))
        out.append(y * slow)
    return np.stack(out) * 0.5
cr = crowd(DUR)
t55 = tt(DUR)
swell = 0.15 + 0.85 * np.clip(t55 / 7.6, 0, 1) ** 1.6
for c, w in [(3.6, 0.5), (5.9, 0.6), (7.6, 0.5)]:
    swell += 0.35 * np.exp(-((t55 - c) / w) ** 2)
pre = np.where(t55 < FZ, 1.0, 0.0)
# freeze: crowd collapses into a muffled low-passed wash that fades away
cr_b = cr * (swell * pre)[None, :]
cr_m = np.stack([lp(cr[0], 520, 2), lp(cr[1], 520, 2)]) * (np.where(t55 >= FZ, np.exp(-(t55 - FZ) / 2.2), 0) * 0.55)[None, :]
cr_late = np.stack([lp(cr[0], 900, 2), lp(cr[1], 900, 2)]) * (0.06 * np.clip((t55 - 45.6) / 0.5, 0, 1) * np.clip((52.5 - t55) / 2.0, 0, 1))[None, :]
amb[:, :len(t55)] += (cr_b * 0.42 + cr_m * 0.42 + cr_late)
# floodlight electric hum rises
hum = (np.sin(2*np.pi*100*t55) + 0.4*np.sin(2*np.pi*200*t55)) * np.clip(t55 / 6, 0, 1) * np.where(t55 < FZ, 1, 0) * 0.012
amb[:, :len(t55)] += hum[None, :]
# low rumble
rum = lp(noise(DUR + 0.0), 90) * 5
rum_env = np.clip(t55 / 7.5, 0, 1) ** 1.3 * 0.5 + 0.18 * (t55 >= FZ) * np.exp(-(t55 - FZ) / 6)
amb[:, :len(t55)] += (rum * rum_env * 0.5)[None, :]

# === HEARTBEAT ===
for t in heart_times():
    k = min(1, max(0, (t - 2.0) / 6)); g = 0.45 + 0.5 * k
    if t > FZ: g *= max(0, 1 - (t - FZ) / 3.5)
    lub = sub(58, 0.32, tau=0.09, drop=0.7)
    dub = sub(52, 0.3, tau=0.08, drop=0.6) * 0.7
    add(sfx, lub, t, g * 1.1, send=0.06); add(sfx, dub, t + 0.27, g * 1.1, send=0.06)
    add(sfx, lp(noise(0.12), 400) * expdec(0.12, 0.03), t, g * 0.5)

# === OPENING details ===
for ts in (6.65, 6.95, 7.25, 7.55, 7.8):  # player shifts weight, cloth rustle, steps
    add(sfx, bp(noise(0.2), 600, 3500) * expdec(0.2, 0.05) * 0.25, ts, 1, pan=0.1, send=0.1)
add(sfx, whoosh(1.4, 120, 900, g=0.12), 0.8, 1, send=0.2)  # air through haze as camera moves

# === FREEZE (8.0) ===
rv_src = (bp(noise(1.1), 300, 7000) * np.linspace(0, 1, int(1.1*SR)) ** 0.5 * 0.9)
rv_src = np.stack([rv_src, bp(noise(1.1), 300, 7000)]) 
rv_tail = reverb(np.concatenate([rv_src * expdec(1.1, 0.25)[None, :], np.zeros((2, int(2.5*SR)))], axis=1))
rev_rev = rv_tail[:, ::-1][:, : int(2.0 * SR)]
rev_rev = rev_rev[:, -int(1.15*SR):] * np.linspace(0, 1, int(1.15*SR))[None, :] ** 2
i0r = int(FZ * SR) - rev_rev.shape[1]
for ch in range(2): sfx[ch, i0r: i0r + rev_rev.shape[1]] += rev_rev[ch] * 1.2
add(sfx, glide(180, 1500, 1.1, (1, 2), (1, .3)) * np.linspace(0, 1, int(1.1*SR)) ** 2, FZ - 1.1, 0.22, send=0.3)
add(sfx, hit(1.5, 4.0, 40), FZ, 1, send=0.35)
add(sfx, bp(noise(1.5), 2000, 12000) * expdec(1.5, 0.35), FZ, 0.4, send=0.5)
add(sfx, tick(900, 0.7, 0.2), FZ, 0.6)
# atmospheric drop: pull everything down after the hit (applied in ducking stage)
DROP = (FZ, FZ + 1.6)
# light streaks stretch
add(sfx, whoosh(1.6, 300, 9000, g=0.4, shape=0.7), FZ + 0.05, 1, pan=-0.3, send=0.3)
add(sfx, whoosh(1.6, 9000, 500, g=0.25, shape=1.4), FZ + 0.1, 1, pan=0.4, send=0.3)
# wireframe scan blips (scan f12-62 => 8.4-10.1s)
for i, ts in enumerate(np.linspace(8.42, 10.05, 22)):
    add(sfx, tick(1200 + i * 130, 0.28, 0.05), ts, 1, pan=math.sin(i) * 0.5, send=0.15)
add(sfx, glide(300, 2400, 1.7, (1,), (1,)) * 0.06 * np.hanning(int(1.7*SR)), 8.4, 1, send=0.3)
# jersey separation whooshes (f62-140 => 10.07-12.67)
for i, ts in enumerate([10.1, 10.45, 10.8, 11.15, 11.5, 11.85]):
    add(sfx, whoosh(0.7, 500 * (1 + i * .4), 3500, g=0.34), ts, 1, pan=[-0.7, 0.7, -0.4, 0.4, 0, 0.6][i], send=0.25)
    add(sfx, bell(mtof(81 + [0, 3, 7, 10, 12, 14][i]), 2.0, 0.6), ts + 0.35, 0.09, pan=[-0.7, 0.7, -0.4, 0.4, 0, 0.6][i], send=0.5)
# label ticks
for i in range(6): add(sfx, tick(3200 + 250 * i, 0.26, 0.04), 11.85 + i * 0.2, 1, pan=(-1) ** i * 0.6, send=0.2)
# text hits (f134=12.47, 143, 152)
for ts in (12.47, 12.77, 13.07):
    add(sfx, hit(0.35, 1.4, 55), ts, 1, send=0.3)
    add(sfx, whoosh(0.4, 400, 2500, g=0.2), ts - 0.1, 1, send=0.2)
# zoom into collar f196-240 (14.53-16.0)
add(sfx, riser(1.5, 150, 11000, 0.6), 14.5, 1, send=0.2)
add(sfx, glide(110, 880, 1.5) * 0.18 * np.linspace(0, 1, int(1.5*SR)) ** 2, 14.5, 1)
# thread hum bridge
th = np.sin(2*np.pi*392*tt(2.4)) * 0.5 + np.sin(2*np.pi*392*2.003*tt(2.4)) * 0.2
add(sfx, th * adsr(len(th), 0.8, 1.0) * 0.1, 15.6, 1, send=0.3)
add(sfx, hit(0.8, 3.0, 36), 16.0, 1, send=0.3)

# === SCENE 3 FABRIC JOURNEY (16-26) ===
# fibres: grain textures, thread rasp
for i in range(160):
    ts = 16.0 + i * 0.06 + rng.uniform(0, 0.04)
    dens = 1
    add(sfx, hp(noise(0.03), 4500) * expdec(0.03, 0.005) * rng.uniform(0.1, 0.3), ts, 1, pan=rng.uniform(-0.9, 0.9), send=0.1)
add(sfx, whoosh(3.2, 200, 6000, g=0.35, shape=1.0), 16.5, 1, pan=0, send=0.3)       # plunge into thread
add(sfx, whoosh(4.5, 3000, 300, g=0.28, shape=1.0), 18.8, 1, pan=-0.3, send=0.3)    # tunnel flow
add(sfx, whoosh(4.5, 250, 5000, g=0.25, shape=1.2), 19.3, 1, pan=0.4, send=0.3)
tun = bp(noise(5.2), 120, 1200) * (0.6 + 0.4 * np.sin(2*np.pi*3.0*tt(5.2))) 
add(sfx, tun * adsr(len(tun), 1.2, 1.4) * 1.4, 19.0, 0.1, send=0.2)
for i in range(12):  # thread twang plucks
    add(sfx, pluck(mtof(76 + [0, 3, 7, 10, 12, 7, 3, 0, 15, 12, 10, 7][i]), 0.9, tau=0.25), 18.9 + i * 0.28, 0.07, pan=math.sin(i * 1.7) * 0.7, send=0.5)
# reorganize into rows f172-215 => 21.73-23.17 ; ticks as rows snap
add(sfx, riser(1.6, 200, 10000, 0.5), 21.6, 1, send=0.25)
for i in range(26): add(sfx, tick(1800 + (i % 7) * 260, 0.22, 0.04), 21.73 + i * 0.055, 1, pan=((i * 37) % 100) / 50 - 1, send=0.1)
add(sfx, hit(0.7, 2.2, 52), 23.2, 1, send=0.3)
add(sfx, riser(1.2, 300, 8000, 0.45), 23.9, 1, send=0.2)
for i in range(34): add(sfx, tick(900 + (i % 9) * 300, 0.18, 0.04), 24.0 + i * 0.03, 1, pan=((i * 53) % 100) / 50 - 1, send=0.1)
add(sfx, hit(0.8, 2.5, 48), 25.15, 1, send=0.3)
# needle/seam: stitch ticks 24.2-26.0
for i in range(44): add(sfx, tick(2800, 0.17 + 0.05 * (i % 4 == 0), 0.03), 24.15 + i * 0.043, 1, pan=0.5 * math.sin(i * .5), send=0.1)
for i in range(70): add(sfx, tick(3600 + (i * 31) % 900, 0.1, 0.025), 24.8 + i * 0.018, 1, send=0.1)  # satin stitch rasp
add(sfx, whoosh(1.0, 400, 7000, g=0.5, shape=0.8), 25.2, 1, send=0.3)

# === SCENE 4 (26-36) ===
for i, tl in enumerate(T["light"]):
    add(sfx, whoosh(0.7, 300, 5000, g=0.3), tl - 0.45, 1, pan=[-0.5, 0.5, -0.5, 0.5][i], send=0.3)
    add(sfx, hit(0.6, 1.8, 58), tl, 1, send=0.3)
    add(sfx, bell(mtof(69 + [0, 3, 7, 12][i]), 3.2, 1.1), tl, 0.25, pan=[-0.5, 0.5, -0.5, 0.5][i], send=0.6)
    add(sfx, bell(mtof(81 + [0, 3, 7, 12][i]), 3.2, 0.9), tl + 0.02, 0.12, pan=[-0.5, 0.5, -0.5, 0.5][i], send=0.6)
    add(sfx, glide(300, 2200, 1.1) * 0.05 * np.hanning(int(1.1*SR)), tl + 0.3, 1, send=0.3)   # line travels to centre
for ts in (31.6, 33.13):
    add(sfx, hit(0.55, 1.8, 50), ts, 1, send=0.3); add(sfx, whoosh(0.5, 500, 3500, g=0.25), ts - 0.15, 1, send=0.2)

# === SCENE 5 (36-46) ===
add(sfx, riser(2.0, 150, 9000, 0.55), 36.0, 1, send=0.2)
add(sfx, whoosh(1.2, 4000, 200, g=0.45, shape=1.5), 36.9, 1, send=0.35)           # symbol implosion
add(sfx, glide(900, 90, 1.0) * 0.2 * np.hanning(int(1.0*SR)), 36.9, 1, send=0.2)
for i, ts in enumerate((37.45, 38.2, 38.93)):                                       # three letter zips
    add(sfx, glide(900 + 400 * i, 4200, 0.9, (1, 2), (1, .4)) * 0.12 * np.hanning(int(0.9*SR)), ts, 1, pan=[-0.6, 0, 0.6][i], send=0.3)
    add(sfx, whoosh(0.8, 800, 7000, g=0.28), ts, 1, pan=[-0.6, 0, 0.6][i], send=0.2)
# impact at wordmark 40.2: layered tonal impact
WM = T["wordmarkImpact"]
add(sfx, hit(1.6, 5.0, 38), WM, 1, send=0.4)
add(sfx, bp(noise(3.5), 1500, 14000) * expdec(3.5, 0.6), WM, 0.5, send=0.6)
imp = saw_pad([mtof(m) for m in (33, 45, 52, 57, 60, 64, 69)], 4.5, bright=3500, a=0.02, r=2.5)
add(music, imp, WM, 0.55, send=0.4)
add(sfx, bell(mtof(81), 5, 1.8), WM, 0.3, send=0.7)
add(sfx, bell(mtof(88), 5, 1.4), WM, 0.15, send=0.7)
for ts in (41.0, 41.87, 43.07): add(sfx, hit(0.4, 1.3, 55), ts, 1, send=0.3); add(sfx, whoosh(0.4, 400, 3000, g=0.18), ts - 0.1, 1, send=0.2)
# climax build 43.6 -> 45.6
add(sfx, riser(2.3, 200, 12000, 0.8), 43.3, 1, send=0.3)
add(sfx, glide(80, 1200, 2.3) * 0.16 * np.linspace(0, 1, int(2.3*SR)) ** 2, 43.3, 1)
CL = T["climax"]
add(sfx, hit(2.0, 5.0, 36), CL, 1, send=0.5)
add(sfx, bp(noise(3.5), 1000, 14000) * expdec(3.5, 0.5), CL, 0.7, send=0.7)
add(music, saw_pad([mtof(m) for m in (33, 45, 57, 60, 64, 69)], 2.0, bright=4000, a=0.01, r=1.2), CL, 0.5, send=0.5)

# === SCENE 6 (46-55) ===
add(sfx, whoosh(1.4, 600, 9000, g=0.4, shape=0.9), 46.0, 1, send=0.35)
add(sfx, bell(mtof(84), 4.0, 1.4), 46.1, 0.2, send=0.7)
add(sfx, whoosh(2.6, 200, 4000, g=0.16, shape=1.0), 46.5, 1, pan=0.2, send=0.4)   # porcelain wash
add(sfx, hit(0.45, 2.0, 55), 46.47, 1, send=0.3)
add(sfx, hit(0.45, 2.0, 49), 48.13, 1, send=0.3)
add(sfx, whoosh(0.6, 500, 3500, g=0.2), 48.0, 1, send=0.2)
for i in range(5):
    add(sfx, pluck(mtof(79 + [0, 4, 7, 12, 16][i]), 1.5, tau=0.5), 49.75 + i * 0.12, 0.12, pan=(i - 2) * 0.3, send=0.5)
    add(sfx, tick(2200, 0.18, 0.04), 49.75 + i * 0.12, 1, pan=(i - 2) * 0.3)
add(sfx, hit(0.55, 2.4, 44), 49.7, 1, send=0.4)

# === MUSIC ===
CH = {"Am": [45, 52, 57, 60, 64, 69], "F": [41, 48, 53, 57, 60, 65], "C": [48, 55, 60, 64, 67, 72], "G": [43, 50, 55, 59, 62, 67],
      "Fa": [41, 48, 53, 57, 60, 65], "Cm": [48, 55, 59, 64, 67, 71]}
def pad(name, t0, t1, g, bright=1500, a=1.6, r=2.0, send=0.35, oct_=0):
    f = [mtof(m + oct_) for m in CH[name]]
    d = t1 - t0 + r
    add(music, saw_pad(f, d, bright=bright, a=a, r=r), t0, g, send=send)
# 0-8: dark swell
add(music, saw_pad([mtof(33), mtof(40), mtof(45), mtof(52), mtof(59)], 9.5, bright=700, a=4.5, r=1.2), 2.0, 0.6, send=0.4)
# 8-16: hollow cold pad & sparse bells
add(music, saw_pad([mtof(m) for m in (45, 52, 57, 64)], 9.0, bright=900, a=1.5, r=2.0), 8.6, 0.55, send=0.5)
for ts, m in [(9.6, 81), (10.9, 76), (12.2, 79), (13.4, 88), (14.4, 84)]:
    add(music, bell(mtof(m), 3.0, 1.2), ts, 0.12, pan=(-1) ** int(ts) * 0.4, send=0.7)
# 16-26: build — pulse bass, arps, hats
pad("Am", 16, 20.5, 0.4, 1100, 1.0); pad("F", 20.5, 23.2, 0.42, 1500, 0.8); pad("G", 23.2, 26.2, 0.48, 2200, 0.6)
BEAT = 0.5
roots = [(16, 20.5, 33), (20.5, 23.2, 29), (23.2, 26, 31)]
for a, b, m in roots:
    t = a
    while t < b - 0.01:
        add(music, lp(sub(mtof(m + 12), 0.45, tau=0.2) * 1.0 + saw_pad([mtof(m + 12)], 0.45, 400, 0.01, 1, 0.01, 0.1) * 0.6, 500), t, 0.5 * min(1, (t - 16) / 5 + 0.3))
        t += BEAT / 2
arp = [0, 7, 12, 15, 12, 7, 3, 7]
t = 18.0; i = 0
while t < 26.0:
    base = 69 if t < 20.5 else (65 if t < 23.2 else 67)
    nn = base + [0, 7, 12, 15, 19, 15, 12, 7][i % 8]
    add(music, pluck(mtof(nn), 0.5, tau=0.14), t, 0.09 + 0.1 * (t - 18) / 8, pan=math.sin(i) * 0.5, send=0.3)
    t += BEAT / 4; i += 1
t = 21.0
while t < 26.0:
    add(music, hat(0.1 + 0.05 * (t - 21)), t, 1, pan=0.3); t += BEAT / 2
for t in np.arange(22.0, 26.0, 1.0): add(music, kick(0.55), t, 1)
# 26-36: athletes
for a, b, n in [(26, 28.5, "Am"), (28.5, 31, "F"), (31, 33.5, "C"), (33.5, 36, "G")]:
    pad(n, a, b, 0.55, 2000, 0.4, 1.2)
    root = CH[n][0]
    t = a
    while t < b - 0.01:
        add(music, lp(sub(mtof(root), 0.9, tau=0.4), 300), t, 0.6); t += BEAT * 2
t = 26.0; i = 0
while t < 36.0:
    n = "Am" if t < 28.5 else "F" if t < 31 else "C" if t < 33.5 else "G"
    notes = CH[n][2:] + [CH[n][3] + 12]
    add(music, bell(mtof(notes[i % len(notes)] + 12), 1.6, 0.4), t, 0.07, pan=math.sin(i * 1.3) * 0.6, send=0.5)
    t += BEAT / 2; i += 1
for t in np.arange(28.0, 36.0, 0.5):
    add(music, kick(0.45 if (t * 2) % 2 == 0 else 0.0), t, 1)
for t in np.arange(26.25, 36.0, 0.5): add(music, hat(0.14), t, 1, pan=0.4)
# 36-46: reveal & climax
for a, b, n in [(36, 38.5, "Am"), (38.5, 40.2, "F"), (40.2, 41.6, "Am"), (41.6, 43.0, "F"), (43.0, 44.4, "C"), (44.4, 45.6, "G")]:
    pad(n, a, b, 0.6 if a < 40.2 else 0.7, 2600 if a < 40.2 else 3600, 0.3, 1.0)
    root = CH[n][0]; t = a
    while t < b - 0.01:
        add(music, lp(sub(mtof(root), 0.5, tau=0.25) + 0.5 * lp(saw_pad([mtof(root)], 0.5, 300, 0.01, 1, 0.01, 0.05), 400), 350), t, 0.7); t += BEAT
t = 36.0; i = 0
while t < 45.6:
    n = "Am" if t < 38.5 else "F" if t < 40.2 else "Am" if t < 41.6 else "F" if t < 43 else "C" if t < 44.4 else "G"
    nn = CH[n][1] + 24 + [0, 7, 12, 7, 15, 12, 7, 3][i % 8]
    add(music, pluck(mtof(nn), 0.4, tau=0.12), t, 0.1 + (0.05 if t > 40.2 else 0), pan=math.sin(i) * 0.6, send=0.3)
    t += BEAT / 4; i += 1
for t in np.arange(36.0, 45.6, 0.5):
    if t < 38.2 or t >= 40.2: add(music, kick(0.7 if t >= 40.2 else 0.5), t, 1)
for t in np.arange(40.25, 45.6, 0.5): add(music, hat(0.2), t, 1, pan=0.3)
for t in np.arange(40.5, 45.6, 1.0): add(music, snare(0.5), t, 1, pan=-0.1, send=0.2)
# snare roll build into the logo hit (38.2 -> 40.2), and into the climax (44.0 -> 45.6)
def roll(a, b, g0, g1):
    t = a; step = 0.25
    while t < b:
        k = (t - a) / (b - a)
        add(music, snare(g0 + (g1 - g0) * k, 0.16), t, 1, send=0.15)
        step = 0.25 * (1 - 0.8 * k) + 0.03; t += step
roll(38.2, 40.15, 0.12, 0.6); roll(44.0, 45.58, 0.2, 0.75)
# 46-55: warm resolution
pad("C", 46.0, 48.5, 0.55, 2400, 1.2, 2.0, 0.45); pad("F", 48.5, 51.0, 0.55, 2400, 1.0, 2.0, 0.45)
pad("C", 51.0, 53.0, 0.5, 2000, 0.8, 2.5, 0.5); pad("C", 53.0, 55.0, 0.4, 1800, 0.8, 3.0, 0.5)
for t, m in [(46.2, 48), (48.5, 41), (51.0, 48)]:
    add(music, lp(sub(mtof(m), 3.0, tau=1.5), 250), t, 0.8, send=0.1)
i = 0
for t in np.arange(46.6, 54.0, 0.75):
    n = "C" if t < 48.5 or t >= 51 else "F"
    notes = [m + 12 for m in CH[n][2:]]
    add(music, pluck(mtof(notes[i % len(notes)] + 12), 1.8, tau=0.55), t, 0.11 * (1 - max(0, t - 51.5) / 3.5), pan=math.sin(i * 0.9) * 0.5, send=0.55)
    i += 1
for ts, m in [(46.3, 84), (49.7, 88), (51.3, 79)]:
    add(music, bell(mtof(m), 4.0, 1.5), ts, 0.12, send=0.7)

# === VOICE ===
def load_vo(name):
    x, sr0 = sf.read(f"../audio/{name}.wav")
    if x.ndim > 1: x = x.mean(1)
    x = resample_poly(x, SR, sr0)
    x = hp(x, 75)
    # presence + gentle air
    pres = bp(x, 2200, 4800, 2) * 0.35
    x = x + pres
    # tame sibilance & normalise by RMS
    rms = np.sqrt(np.mean(x ** 2) + 1e-9); x = x / rms * 0.11
    # soft compression
    x = np.tanh(x * 2.2) / 2.2 * 1.9
    fi = int(0.01 * SR); x[:fi] *= np.linspace(0, 1, fi); x[-fi:] *= np.linspace(1, 0, fi)
    return x
vo_spans = []
for k, t in T["vo"].items():
    x = load_vo(k)
    add(voice, x, t, 1.0, send=0.05)
    add(rvb, x, t, 0.10)
    vo_spans.append((k, t, t + len(x) / SR))
print("VO spans:", [(k, round(a, 2), round(b, 2)) for k, a, b in vo_spans])

# === REVERB RENDER & DUCKING ===
wet = reverb(rvb)
t_all = np.arange(N) / SR
vmono = np.abs(voice[0]) + np.abs(voice[1])
def smooth_env(x, att, rel):
    a = math.exp(-1 / (att * SR)); r = math.exp(-1 / (rel * SR)); y = np.zeros_like(x); s = 0.0
    xs = x[::48]  # coarse then upsample
    ys = np.zeros_like(xs)
    a2 = math.exp(-48 / (att * SR)); r2 = math.exp(-48 / (rel * SR))
    for i, v in enumerate(xs):
        s = a2 * s + (1 - a2) * v if v > s else r2 * s + (1 - r2) * v
        ys[i] = s
    return np.interp(np.arange(len(x)), np.arange(len(xs)) * 48, ys)
env = smooth_env(vmono, 0.04, 0.4)
env = np.clip(env / (np.percentile(env[env > 0.01], 70) + 1e-9), 0, 1)
duck_m = 1 - 0.50 * env
duck_s = 1 - 0.32 * env
# atmospheric drop at the freeze: everything but the hit dips and recovers
drop = np.ones(N); i0 = int(DROP[0] * SR); i1 = int(DROP[1] * SR)
drop[i0:i1] = 0.25 + 0.75 * np.linspace(0, 1, i1 - i0) ** 2
drop[i0 - int(0.01*SR):i0] = 1
mus = music * duck_m * drop
sfxd = sfx * duck_s
ambd = amb * duck_m
wetd = wet * duck_s
# cut tail after final hit: music ends gently, global fade
mix = mus * 0.85 + sfxd * 0.9 + ambd * 1.0 + wetd * 0.9 + voice * 1.0
# the climax "cut": brief silence of music after 45.6 is natural (pads released)
fade = np.ones(N); f0 = int(52.4 * SR); f1 = int(DUR * SR)
fade[f0:f1] = np.linspace(1, 0.0, f1 - f0) ** 1.6; fade[f1:] = 0
mix = mix * fade[None, :]
mix = mix[:, :int(DUR * SR)]
# safety: soft clip
pk = np.max(np.abs(mix)); mix = mix / pk * 0.8
mix = np.tanh(mix * 1.15) / 1.15
sf.write("../audio/master_raw.wav", mix.T, SR, subtype="PCM_24")
np.save("../audio/vo_spans.npy", np.array([(a, b) for _, a, b in vo_spans]))
print("done", mix.shape, "peak", np.max(np.abs(mix)))
