"""Original instrumental score: modern industrial / sports-brand electronic, A minor, 120 BPM, 90 beats = 45.0 s.
Scene boundaries (5/12/20/28/36 s) all sit on beats, 12/20/28/36 on bar lines. Fully synthesised."""
import numpy as np
import synth as S

BPM = 120
BEAT = 60 / BPM
DUR = 45.0
CH = {  # chord tones (Hz), bass root
    'Am': ([220.00, 261.63, 329.63, 440.00], 55.00),
    'F': ([174.61, 220.00, 261.63, 349.23], 43.65),
    'C': ([261.63, 329.63, 392.00, 523.25], 65.41),
    'G': ([196.00, 246.94, 293.66, 392.00], 49.00),
}
PROG = ['Am', 'F', 'C', 'G']


def chord_at(t):
    bar = int(t // (BEAT * 4))
    return PROG[(bar // 2) % 4]


def build():
    drums, bass, pad, arp, fx = (S.Bus(DUR + 4) for _ in range(5))
    kick_times = []
    sm = lambda a, b, t: float(np.clip((t - a) / (b - a), 0, 1))
    nbeats = int(DUR / BEAT)

    for b in range(nbeats + 1):
        t = b * BEAT
        # ---- kick ----
        k = None
        if 2.5 <= t < 5: k = 0.35 + 0.25 * sm(2.5, 5, t)                       # heartbeat build
        elif 5 <= t < 12: k = 0.62
        elif 12 <= t < 36: k = 0.9
        elif 37.5 <= t < 42: k = 1.0
        elif 42 <= t < 43.5 and b % 4 == 0: k = 0.8
        elif 36 <= t < 37.5: k = None
        if k:
            drums.add(S.kick(k), t, 0.9); kick_times.append(t)
        if t == 37.5:
            drums.add(S.kick(1.0, 0.7, 190, 38), t, 1.0); drums.add(S.clap(1.0), t, 0.7)

    for s in range(int(DUR / (BEAT / 4)) + 1):
        t = s * BEAT / 4
        beat_pos = s % 4
        # ---- hats / shaker ----
        if 5 <= t < 43.5:
            lvl = 0.16 if t < 12 else 0.24
            if beat_pos == 2: drums.add(S.hat(lvl * 1.4, open_=(t >= 12)), t, 1.0, pan=0.25)
            elif t >= 12 and beat_pos in (1, 3): drums.add(S.hat(lvl * 0.55), t, 1.0, pan=-0.2)
            elif t < 12 and beat_pos == 0 and (s // 4) % 2 == 1: drums.add(S.hat(lvl), t, 1.0)
        if 2 <= t < 5 and s % 2 == 0:                                         # rising ticks in the hook
            drums.add(S.hat(0.12 + 0.12 * sm(2, 5, t)), t, 1.0)
        if 20 <= t < 43.5 and beat_pos in (0, 2):
            drums.add(S.shaker(0.25), t + 0.0, 1.0, pan=-0.3)
        # ---- clap / snare on 2 & 4 ----
        if 12 <= t < 36 or 37.5 <= t < 42:
            if s % 8 == 4:
                drums.add(S.clap(0.7), t, 0.9); drums.add(S.snare(0.35), t, 0.6)
        elif 5 <= t < 12 and s % 8 == 4:
            drums.add(S.clap(0.35), t, 0.7)
        # ---- snare roll into the logo (33–37.5 s) ----
        if 33 <= t < 37.5 and s % (2 if t < 36 else 1) == 0:
            drums.add(S.snare(0.25 + 0.6 * sm(33, 37.5, t)), t, 0.8)
        # ---- tom fills at phrase ends ----
        if t in (19.0, 19.25, 19.5, 19.75, 27.0, 27.25, 27.5, 27.75):
            drums.add(S.tom(0.8, [150, 130, 110, 95][int((t * 4) % 4)]), t, 0.8, pan=-0.3 + 0.2 * (t % 1) * 3)

    # ---- bass: 8th-note pulse; enters 5 s, fuller from 12 s, cut at breakdown ----
    for e in range(int(DUR / (BEAT / 2)) + 1):
        t = e * BEAT / 2
        if not (5 <= t < 36 or 37.5 <= t < 43.5): continue
        root = CH[chord_at(t)][1]
        f = root * (2 if e % 4 == 3 else 1)
        lvl = 0.55 if t < 12 else 0.85
        cut = 260 + 700 * sm(5, 36, t) if t < 36 else 900
        if t >= 37.5: cut = 1000
        if t < 12 and e % 2 == 1: continue
        bass.add(S.bass_note(f, BEAT / 2 * 0.95, lvl, cut), t, 1.0)
    # drone in the hook
    drone = S.saw_chord([55.0, 110.0, 164.81], 5.2, 0.5, 0.004, 400, a=2.5, r=0.8)
    pad.add(drone, 0.0, 0.8)

    # ---- pad: 2-bar chords, swelling filter ----
    for c in range(int(DUR / (BEAT * 8)) + 1):
        t0 = c * BEAT * 8
        name = PROG[c % 4]
        if t0 >= 43.5: break
        cut = 700 + 2600 * sm(0, 36, t0)
        lvl = 0.35 if t0 < 5 else 0.5
        pad.add(S.saw_chord(CH[name][0], BEAT * 8 + 0.4, lvl, 0.006, cut, a=0.6, r=0.8), t0, 1.0)

    # ---- arp: 16th plucks from 20 s, brighter & louder from 28 s ----
    for s in range(int(DUR / (BEAT / 4)) + 1):
        t = s * BEAT / 4
        if not (20 <= t < 36 or 37.5 <= t < 42): continue
        tones = CH[chord_at(t)][0]
        pat = [0, 2, 1, 3, 2, 1, 3, 2][s % 8]
        f = tones[pat] * (2 if (s % 8) in (3, 7) else 1)
        lvl = 0.30 + 0.25 * sm(20, 36, t) if t < 36 else 0.55
        arp.add(S.pluck(f, 0.2, lvl, 2500 + 4000 * sm(20, 36, t)), t, 1.0, pan=-0.35 if s % 2 else 0.35)

    # ---- logo hit: big chord stab + crash, then reverb-washed resolve ----
    stab = S.saw_chord([110.0, 164.81, 220.0, 329.63, 440.0, 659.26], 2.6, 0.9, 0.008, 4200, a=0.004, r=2.2)
    fx.add(stab, 37.5, 1.0)
    crash = S.hp(S.noise(3.0), 3500) * np.exp(-S.tt(3.0) * 1.6) * 0.5
    fx.add(crash, 37.5, 1.0)
    fx.add(S.reverse_swell(1.5, 0.6), 36.0, 1.0)                              # reverse swell into the hit
    fx.add(S.reverse_swell(1.2, 0.4), 4.0, 1.0)                               # swell into scene 2
    fx.add(S.reverse_swell(1.2, 0.5), 11.0, 1.0)
    for t in (19.0, 27.0):
        fx.add(S.reverse_swell(1.0, 0.45), t, 1.0)
    # final resolve chord (A minor add9) with long tail
    fin = S.saw_chord([110.0, 164.81, 220.0, 261.63, 329.63, 493.88], 3.6, 0.8, 0.007, 2600, a=0.3, r=2.4)
    fx.add(fin, 41.8, 1.0)

    # ---- sidechain pump on pad/arp ----
    n = pad.n
    pump = np.ones(n)
    for kt in kick_times:
        i = S.n_(kt)
        m = S.n_(0.28)
        seg = 1 - 0.45 * np.exp(-np.arange(m) / S.n_(0.09))
        pump[i:i + m] = np.minimum(pump[i:i + m], seg[:max(0, min(m, n - i))])
    pad.b *= pump
    arp.b *= pump

    mix = drums.b * 1.0 + bass.b * 1.0 + pad.b * 0.9 + arp.b * 0.9 + fx.b * 0.8
    mix = mix[:, :S.n_(DUR)]
    # tasteful reverb on pad/arp/fx via a send
    send = (pad.b * 0.5 + arp.b * 0.5 + fx.b * 0.6)[:, :S.n_(DUR)]
    rvb = S.reverb(send, rt=2.2, wet=1.0, bright=4000)
    mix[:, :min(mix.shape[1], rvb.shape[1])] += rvb[:, :mix.shape[1]] * 0.5
    # tone: gentle high-pass for rumble, soft saturation
    mix = np.stack([S.hp(mix[0], 28), S.hp(mix[1], 28)])
    mix = S.soft_clip(mix * 0.8, 1.2)
    # fade-in at 0 and closing fade-out (resolve rings, then smooth fade 43.2 -> 45.0)
    t = np.arange(mix.shape[1]) / S.SR
    mix *= np.clip(t / 0.05, 0, 1)
    mix *= np.clip((DUR - t) / 1.8, 0, 1) ** 1.5
    return mix


if __name__ == '__main__':
    import soundfile as sf
    x = build()
    print('music peak', np.max(np.abs(x)))
    sf.write('music_raw.wav', (x / np.max(np.abs(x)) * 0.89).T.astype(np.float32), S.SR, subtype='FLOAT')
