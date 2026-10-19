"""Small deterministic synthesis toolkit (numpy/scipy only). Every sound is generated procedurally."""
import numpy as np
from scipy import signal

SR = 44100
rng = np.random.default_rng(20240607)


def n_(sec):
    return int(round(sec * SR))


def tt(sec):
    return np.arange(n_(sec)) / SR


class Bus:
    """Stereo accumulation buffer."""

    def __init__(self, dur):
        self.n = n_(dur)
        self.b = np.zeros((2, self.n), dtype=np.float64)

    def add(self, x, t0, gain=1.0, pan=0.0):
        if x.ndim == 1:
            l = np.cos((pan + 1) * np.pi / 4)
            r = np.sin((pan + 1) * np.pi / 4)
            x = np.stack([x * l * 1.414, x * r * 1.414])
        i = n_(t0)
        if i >= self.n or i + x.shape[1] <= 0:
            return
        a = max(0, -i)
        e = min(x.shape[1], self.n - i)
        self.b[:, i + a:i + e] += x[:, a:e] * gain


def env_ad(n, a, d, curve=4.0):
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-curve * np.clip(t - a, 0, None) / max(d, 1e-4))
    return att * dec


def fade(x, fin=0.003, fout=0.01):
    n = x.shape[-1]
    fi, fo = min(n, n_(fin)), min(n, n_(fout))
    w = np.ones(n)
    if fi: w[:fi] = np.linspace(0, 1, fi)
    if fo: w[-fo:] = np.linspace(1, 0, fo)
    return x * w


def noise(sec):
    return rng.standard_normal(n_(sec))


def lp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, min(fc, SR * 0.45), 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, min(hi, SR * 0.45)], 'band', fs=SR, output='sos'), x)


def sweep_bp(x, f0, f1, q=3.0, expo=True, chunk=512):
    """Band-pass whose centre moves f0 -> f1 across the signal (stateful chunks)."""
    n = len(x)
    out = np.zeros(n)
    zi = None
    nch = (n + chunk - 1) // chunk
    for k in range(nch):
        u = k / max(1, nch - 1)
        fc = f0 * (f1 / f0) ** u if expo else f0 + (f1 - f0) * u
        bw = fc / q
        sos = signal.butter(2, [max(20, fc - bw / 2), min(SR * 0.45, fc + bw / 2)], 'band', fs=SR, output='sos')
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        seg, zi = signal.sosfilt(sos, x[k * chunk:(k + 1) * chunk], zi=zi)
        out[k * chunk:(k + 1) * chunk] = seg
    return out


def sweep_lp(x, f0, f1, chunk=512):
    n = len(x)
    out = np.zeros(n)
    zi = None
    nch = (n + chunk - 1) // chunk
    for k in range(nch):
        u = k / max(1, nch - 1)
        fc = f0 * (f1 / f0) ** u
        sos = signal.butter(2, min(fc, SR * 0.45), 'low', fs=SR, output='sos')
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        seg, zi = signal.sosfilt(sos, x[k * chunk:(k + 1) * chunk], zi=zi)
        out[k * chunk:(k + 1) * chunk] = seg
    return out


_IRS = {}


def reverb(x, rt=1.2, wet=0.3, pre=0.012, bright=3500):
    """Convolution reverb with a synthetic exponentially decaying stereo IR."""
    key = (rt, bright)
    if key not in _IRS:
        n = n_(rt * 1.2)
        t = np.arange(n) / SR
        irs = []
        for _ in range(2):
            ir = rng.standard_normal(n) * np.exp(-6.9 * t / rt)
            ir = lp(ir, bright)
            irs.append(ir / np.sqrt(np.sum(ir ** 2)))
        _IRS[key] = np.stack(irs)
    ir = _IRS[key]
    xs = x if x.ndim == 2 else np.stack([x, x])
    pad = np.zeros((2, n_(pre)))
    wetsig = np.stack([signal.fftconvolve(xs[c], ir[c]) for c in range(2)])
    wetsig = np.concatenate([pad, wetsig], axis=1)
    out = np.zeros((2, wetsig.shape[1]))
    out[:, :xs.shape[1]] += xs * (1 - wet * 0.5)
    out += wetsig * wet * 2.2
    return out


def soft_clip(x, drive=1.0):
    return np.tanh(x * drive) / np.tanh(drive)


# ---------------------------------------------------------------- one-shots
def kick(level=1.0, dur=0.42, f0=170, f1=46, click=0.35):
    t = tt(dur)
    ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t * 28)) / SR
    body = np.sin(ph) * np.exp(-t * 9.5)
    c = hp(noise(dur), 2500) * np.exp(-t * 220) * click
    return fade(soft_clip(body + c, 1.3) * level, 0.0005, 0.02)


def snare(level=1.0, dur=0.28):
    t = tt(dur)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 26) * 0.5
    nz = bp(noise(dur), 1500, 9000) * np.exp(-t * 17)
    return fade((tone + nz) * level, 0.0005, 0.02)


def clap(level=1.0):
    out = np.zeros(n_(0.3))
    for i, d in enumerate([0, 0.011, 0.023]):
        s = bp(noise(0.3), 1200, 3800) * np.exp(-np.arange(n_(0.3)) / SR * (60 if i < 2 else 18))
        out[n_(d):] += s[:len(out) - n_(d)]
    return fade(out * level * 0.8, 0.001, 0.02)


def hat(level=1.0, open_=False):
    d = 0.22 if open_ else 0.05
    t = tt(d)
    x = hp(noise(d), 7000) * np.exp(-t * (14 if open_ else 80))
    return fade(x * level, 0.0005, 0.01)


def shaker(level=1.0):
    d = 0.08
    t = tt(d)
    x = bp(noise(d), 4500, 11000) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return x * level


def tom(level=1.0, f=110, dur=0.3):
    t = tt(dur)
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t * 25))) / SR
    return fade(np.sin(ph) * np.exp(-t * 11) * level, 0.0005, 0.02)


def impact(level=1.0, dur=2.6):
    """Deep cinematic hit: sub drop + body + noise burst, long tail."""
    t = tt(dur)
    ph = 2 * np.pi * np.cumsum(30 + 70 * np.exp(-t * 4.5)) / SR
    sub = np.sin(ph) * np.exp(-t * 1.6)
    body = np.sin(2 * np.pi * np.cumsum(60 + 120 * np.exp(-t * 12)) / SR) * np.exp(-t * 6)
    burst = lp(noise(dur), 3500) * np.exp(-t * 9) * 0.7
    crack = hp(noise(dur), 3000) * np.exp(-t * 60) * 0.5
    x = sub * 1.0 + body * 0.7 + burst + crack
    return fade(soft_clip(x * level, 1.4), 0.0003, 0.15)


def whoosh(dur=0.7, f0=400, f1=6000, level=1.0, q=1.6, peak=0.55):
    x = noise(dur)
    y = sweep_bp(x, f0, f1, q=q)
    t = np.linspace(0, 1, len(y))
    env = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.5)
    return y * env * level * 3.0


def swish(dur=0.28, f0=2500, f1=900, level=1.0):
    return whoosh(dur, f0, f1, level, q=1.2, peak=0.35)


def tick(level=1.0, f=3200, dur=0.02):
    t = tt(dur)
    return fade(np.sin(2 * np.pi * f * t) * np.exp(-t * 260) * level, 0.0002, 0.004)


def click(level=1.0, lo=1800, hi=6500):
    d = 0.012
    t = tt(d)
    return fade(bp(noise(d), lo, hi) * np.exp(-t * 450) * level * 2.0, 0.0002, 0.003)


def thump(level=1.0, f=95, dur=0.16):
    t = tt(dur)
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.8 * np.exp(-t * 40))) / SR
    return fade(np.sin(ph) * np.exp(-t * 24) * level + lp(noise(dur), 700) * np.exp(-t * 60) * level * 0.4, 0.0003, 0.02)


def ping(level=1.0, f=1568, dur=0.5):
    t = tt(dur)
    x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 9)
    return fade(x * level, 0.0005, 0.05)


def snip(level=1.0):
    """Precision shear: two metallic transients."""
    out = np.zeros(n_(0.16))
    for d, f in [(0, 5200), (0.045, 4300)]:
        t = tt(0.07)
        s = (bp(noise(0.07), 3000, 9000) + 0.4 * np.sin(2 * np.pi * f * t)) * np.exp(-t * 80)
        out[n_(d):n_(d) + len(s)] += s[:len(out) - n_(d)]
    return fade(out * level, 0.0003, 0.02)


def blip(level=1.0, f=1200, dur=0.045):
    t = tt(dur)
    x = np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + np.sin(2 * np.pi * f * t)
    return fade(x * np.exp(-t * 55) * level * 0.7, 0.0004, 0.006)


def riser(dur=2.0, level=1.0, f0=250, f1=9000, tone0=110, tone1=880):
    t = tt(dur)
    u = t / dur
    nz = sweep_bp(noise(dur), f0, f1, q=1.4)
    ph = 2 * np.pi * np.cumsum(tone0 * (tone1 / tone0) ** u) / SR
    tone = (signal.sawtooth(ph) * 0.25 + np.sin(ph) * 0.4)
    tone = sweep_lp(tone, 400, 7000)
    env = u ** 2.2
    return (nz * 2.0 + tone) * env * level


def shimmer(dur=2.5, level=1.0, notes=(2093, 2637, 3136, 3951, 4699)):
    t = tt(dur)
    x = np.zeros_like(t)
    for i, f in enumerate(notes):
        mod = 0.5 + 0.5 * np.sin(2 * np.pi * (0.9 + 0.3 * i) * t + i)
        x += np.sin(2 * np.pi * f * t) * mod * 0.25 / (1 + 0.15 * i)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return x * env * level


def reverse_swell(dur=1.0, level=1.0):
    t = tt(dur)
    x = hp(noise(dur), 3000) * (t / dur) ** 3
    return x * level


def saw_chord(freqs, dur, level=1.0, detune=0.006, cutoff=1800, a=0.5, r=0.8):
    t = tt(dur)
    x = np.zeros_like(t)
    for f in freqs:
        for d in (-detune, 0, detune):
            x += signal.sawtooth(2 * np.pi * f * (1 + d) * t + rng.uniform(0, 6.28))
    x = lp(x, cutoff, 3) / (len(freqs) * 3)
    env = np.minimum(1, t / a) * np.minimum(1, (dur - t) / r)
    return x * env * level


def pluck(f, dur=0.22, level=1.0, bright=4000):
    t = tt(dur)
    x = signal.sawtooth(2 * np.pi * f * t) * 0.6 + np.sign(np.sin(2 * np.pi * f * 1.004 * t)) * 0.3
    x = sweep_lp(x, bright, 500) if dur > 0.05 else x
    return fade(x * np.exp(-t * 14) * level, 0.001, 0.02)


def bass_note(f, dur, level=1.0, cut=500):
    t = tt(dur)
    x = np.sin(2 * np.pi * f * t) * 0.8 + signal.sawtooth(2 * np.pi * f * t) * 0.35
    x = lp(x, cut, 2)
    env = np.minimum(1, t / 0.008) * np.exp(-t * 2.2) * np.minimum(1, (dur - t) / 0.04)
    return soft_clip(x * env * level * 1.4, 1.2)


def stitch_buzz(dur, f=105, am=21, level=1.0):
    t = tt(dur)
    x = signal.square(2 * np.pi * f * t) * 0.5 + np.sin(2 * np.pi * f * 2 * t) * 0.3
    x = lp(x, 1800, 2) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * am * t))) * 0.6
    return fade(x * level, 0.02, 0.03)


def mono_to_stereo_width(x, delay_ms=11):
    d = n_(delay_ms / 1000)
    l = x
    r = np.concatenate([np.zeros(d), x[:-d]]) if d else x
    return np.stack([l, r])
