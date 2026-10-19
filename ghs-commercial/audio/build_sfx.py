"""Sound-effects stem. Every event is placed on the exact frame of the visual animation it belongs to
(frame numbers are the global frames used by src/scenes/*). 30 fps."""
import numpy as np
import synth as S

FPS = 30
DUR = 45.0
T = lambda f: f / FPS


def bezier_ease(x1, y1, x2, y2):
    """CSS cubic-bezier easing (same maths as Remotion's Easing.bezier)."""
    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            t = (lo + hi) / 2
            bx = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3
            if bx < x: lo = t
            else: hi = t
        t = (lo + hi) / 2
        return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3
    return f


out_quart = bezier_ease(0.25, 1, 0.5, 1)


def build():
    bus = S.Bus(DUR + 3)
    rv = S.Bus(DUR + 3)          # reverb send
    add = bus.add

    def wet(x, t0, g=1.0, pan=0.0):
        rv.add(x, t0, g, pan)

    # ------------------------------------------------------------------ 0–5 s  HOOK (frames 0–150)
    add(S.impact(1.0), T(0), 0.95)                       # deep impact on first frame
    wet(S.impact(0.6, 2.4), T(0), 0.5)
    # horizontal scan line f0–14
    add(S.whoosh(0.5, 300, 7000, 0.8, q=1.0, peak=0.5), T(0), 0.5)
    # jersey line construction f2–36: rapid precise ticks + rising shimmer
    for k in range(34):
        f = 2 + k
        add(S.tick(0.5, 2200 + 55 * k), T(f), 0.55, pan=-0.4 + 0.8 * (k % 7) / 6)
    add(S.sweep_bp(S.noise(1.2), 900, 7500, q=2.5) * np.linspace(0, 1, S.n_(1.2)) ** 2 * 0.6, T(2), 0.7)
    # typography whooshes: YOUR (f28) BRAND (f34) – per-char stagger 1.4f
    add(S.whoosh(0.55, 500, 5200, 0.9, peak=0.4), T(26), 0.7, pan=-0.15)
    add(S.whoosh(0.55, 500, 5200, 0.9, peak=0.4), T(32), 0.7, pan=0.15)
    add(S.thump(1.0, 80), T(36), 0.8)
    add(S.impact(0.7, 1.4), T(46), 0.35)                  # BRAND. lands
    add(S.click(1.0), T(36), 0.5); add(S.click(1.0), T(44), 0.4)
    # exit f72–86
    add(S.whoosh(0.4, 4000, 700, 0.7, peak=0.3), T(72), 0.6)
    # OUR (f84) CRAFT. (f90)
    add(S.whoosh(0.5, 500, 5800, 0.9, peak=0.4), T(82), 0.7, pan=-0.2)
    add(S.whoosh(0.5, 500, 5800, 0.9, peak=0.4), T(88), 0.7, pan=0.2)
    add(S.impact(0.9, 1.6), T(98), 0.55)
    wet(S.ping(0.6, 1760, 0.9), T(100), 0.35)
    # exit + lime sweep transition f132–168
    add(S.whoosh(0.4, 4500, 800, 0.7, peak=0.3), T(132), 0.55)
    add(S.whoosh(0.8, 300, 9000, 1.0, q=0.9, peak=0.7), T(142), 0.9)  # fast lime line sweep into scene 2
    add(S.riser(0.5, 0.5, 600, 9000), T(145), 0.4)

    # ------------------------------------------------------------------ 5–12 s  CUSTOMIZATION (frames 150–360)
    g = 150
    add(S.thump(0.9, 70), T(g + 0), 0.8)
    for f, p in [(8, -0.2), (16, 0.2)]:                    # BUILT AROUND / YOUR VISION masks
        add(S.whoosh(0.45, 600, 4500, 0.8, peak=0.4), T(g + f - 2), 0.55, pan=p)
    # step ticker clicks at each new step label
    for f in (6, 30, 50, 76, 108, 124, 134, 154, 174):
        add(S.click(0.9, 2500, 7000), T(g + f), 0.4)
    # body forms (fabric rises from hem f4–42): soft fabric rustle
    add(S.sweep_bp(S.noise(1.2), 700, 3000, q=0.8) * np.hanning(S.n_(1.2)) * 0.9, T(g + 4), 0.45)
    # outline draw f0–26: tick trail
    for k in range(13):
        add(S.tick(0.35, 2600 + 80 * k), T(g + 2 * k), 0.35)
    # sleeves slide f30–60: two cloth swooshes + snap click
    for f, p in [(30, -0.5), (34, 0.5)]:
        add(S.swish(0.32, 3200, 800, 0.7), T(g + f), 0.55, pan=p)
        add(S.thump(0.6, 120, 0.1), T(g + f + 14), 0.45, pan=p)
        add(S.click(1.0), T(g + f + 15), 0.5, pan=p)
    # fabric panels / pattern f50–86
    add(S.whoosh(0.7, 500, 2800, 0.6, q=0.9, peak=0.4), T(g + 50), 0.5)
    add(S.click(1.0), T(g + 50), 0.4); add(S.click(1.0), T(g + 58), 0.35)
    # seams + collar draw f76–110: stitch ticks
    for k in range(26):
        add(S.tick(0.5, 3400 + 40 * (k % 5)), T(g + 76 + 1.3 * k), 0.35, pan=-0.3 + 0.6 * (k % 2))
    # number applied f108–130: heat-press thump + hiss
    add(S.thump(1.2, 62, 0.22), T(g + 109), 0.95)
    add(S.hp(S.noise(0.45), 2500) * np.exp(-S.tt(0.45) * 9), T(g + 109), 0.35)
    add(S.ping(0.6, 1318, 0.6), T(g + 112), 0.22)
    # GHS mark f124
    add(S.click(1.0, 2500, 8000), T(g + 126), 0.55); add(S.tick(0.8, 3951), T(g + 128), 0.5)
    wet(S.ping(0.7, 2637, 0.6), T(g + 128), 0.4)
    # three colourway sweeps f132/152/172 (16f each)
    for f in (132, 152, 172):
        add(S.whoosh(0.5, 700, 6500, 0.9, q=1.1, peak=0.5), T(g + f), 0.6, pan=-0.3 + 0.3 * ((f - 132) // 20))
        add(S.click(1.0), T(g + f + 8), 0.45)
    add(S.thump(0.7, 80, 0.14), T(g + 190), 0.4)
    # text exits f188–206
    add(S.whoosh(0.45, 3800, 600, 0.6, peak=0.3), T(g + 190), 0.5)

    # ------------------------------------------------------------------ 12–20 s  MANUFACTURING (frames 360–600)
    g = 360
    add(S.swish(0.3, 3000, 600, 0.6), T(g + 2), 0.45)                    # ink retracts f2–16
    add(S.whoosh(0.8, 300, 4500, 0.7, peak=0.5), T(g + 4), 0.5)          # window opens f4–34
    add(S.thump(1.0, 70, 0.2), T(g + 33), 0.8)                           # mat locks
    add(S.click(1.0), T(g + 33), 0.6)
    for f, p in [(10, -0.2), (18, 0.2)]:
        add(S.whoosh(0.45, 600, 4500, 0.7, peak=0.4), T(g + f - 2), 0.45, pan=p)
    # precision cutting: body f18–40, sleeveL f30–52, sleeveR f36–58, collar f42–64
    for start, dur, p in [(18, 22, 0), (30, 22, -0.5), (36, 22, 0.5), (42, 22, 0)]:
        n = int(dur / 2.4)
        add(S.sweep_bp(S.noise(dur / FPS), 2500, 5500, q=3) * 0.5, T(g + start), 0.28, pan=p)
        for k in range(n):
            add(S.snip(0.8), T(g + start + k * 2.4), 0.42, pan=p)
    add(S.ping(0.7, 1568, 0.6), T(g + 22), 0.25)
    # separation f58–88: panels slide apart
    for f, p in [(58, -0.7), (62, 0.7), (60, 0.0)]:
        add(S.whoosh(0.5, 500, 3200, 0.8, q=1.1, peak=0.5), T(g + f), 0.5, pan=p)
    for f, p in [(86, -0.7), (88, 0.7)]:
        add(S.thump(0.8, 110, 0.12), T(g + f), 0.5, pan=p); add(S.click(1.0), T(g + f), 0.4, pan=p)
    # sublimation print f84–114: printer-head scan hiss + 30Hz rhythm
    d = 30 / FPS
    ph = S.tt(d)
    scan = S.sweep_bp(S.noise(d), 1200, 5200, q=2.0) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 36 * ph)))
    add(scan * np.sin(np.pi * np.clip(ph / d, 0, 1)) ** 0.5 * 0.9, T(g + 84), 0.5)
    add(S.stitch_buzz(d, 160, 33, 0.5), T(g + 84), 0.22)
    add(S.ping(0.6, 1760, 0.5), T(g + 112), 0.3)
    # stitching f108–140 (per piece stagger 4f): sewing-machine rhythm
    for k in range(int(38 / 1.9)):
        f = 108 + k * 1.9
        add(S.tick(0.7, 2800 + 220 * (k % 3)), T(g + f), 0.4, pan=-0.4 + 0.8 * ((k * 7) % 5) / 4)
        add(S.thump(0.45, 140, 0.05), T(g + f), 0.22)
    add(S.ping(0.7, 1396, 0.6), T(g + 114), 0.22)
    # embroidery: camera push f130–154, machine f146–182, zoom out f186–210
    add(S.whoosh(0.8, 300, 5000, 0.9, q=0.9, peak=0.6), T(g + 128), 0.55)
    add(S.thump(0.8, 70, 0.2), T(g + 153), 0.6)
    add(S.stitch_buzz(36 / FPS, 112, 22, 1.0), T(g + 146), 0.38)
    for k in range(int(36 / 1.36)):
        add(S.tick(0.8, 3400 + 90 * (k % 4)), T(g + 146 + k * 1.36), 0.3, pan=0.1 * ((k % 3) - 1))
        add(S.thump(0.4, 150, 0.04), T(g + 146 + k * 1.36), 0.18)
    add(S.ping(0.8, 2093, 0.7), T(g + 183), 0.3)
    add(S.whoosh(0.8, 5500, 400, 0.9, q=0.9, peak=0.4), T(g + 186), 0.5)
    # assembly f190–224: pieces glide home, clicks as they seat
    for f, p in [(190, -0.6), (192, 0.6), (196, 0.0)]:
        add(S.swish(0.4, 3000, 900, 0.7), T(g + f), 0.5, pan=p)
    for f, p in [(214, -0.5), (218, 0.5), (222, 0.0)]:
        add(S.thump(0.9, 90, 0.12), T(g + f), 0.5, pan=p); add(S.click(1.0, 1500, 5500), T(g + f), 0.55, pan=p)
    # number applied f214–234
    add(S.thump(1.3, 60, 0.24), T(g + 215), 0.95)
    add(S.hp(S.noise(0.4), 2500) * np.exp(-S.tt(0.4) * 9), T(g + 215), 0.3)
    wet(S.ping(0.8, 1318, 0.7), T(g + 217), 0.4)
    # camera push f206–240
    add(S.whoosh(0.9, 400, 3000, 0.5, q=0.8, peak=0.5), T(g + 206), 0.3)

    # ------------------------------------------------------------------ 20–28 s  PRODUCT RANGE (frames 600–840)
    g = 600
    add(S.whoosh(0.7, 250, 8500, 1.0, q=0.9, peak=0.6), T(g - 3), 0.75)  # upward lime wipe 'up'
    add(S.impact(0.7, 1.2), T(g + 14), 0.5)
    for f, p in [(8, -0.2), (14, 0.2)]:
        add(S.whoosh(0.45, 600, 4500, 0.8, peak=0.4), T(g + f - 2), 0.5, pan=p)
    pans = [-0.55, 0.55, -0.55, 0.55, 0.0]
    for i in range(5):
        st = 26 + 8 * i
        add(S.swish(0.3, 3800, 900, 0.9), T(g + st), 0.55, pan=pans[i])        # card slides in
        add(S.thump(0.8, 85 + 6 * i, 0.12), T(g + st + 14), 0.55, pan=pans[i])  # soft landing impact
        add(S.click(0.9), T(g + st + 14), 0.4, pan=pans[i])
        # garment outline drawing
        for k in range(8):
            add(S.tick(0.3, 2600 + 120 * k), T(g + st + 4 + 3.5 * k), 0.22, pan=pans[i])
    # headline swap f106–134
    add(S.whoosh(0.4, 3800, 600, 0.6, peak=0.3), T(g + 106), 0.45)
    add(S.whoosh(0.5, 600, 5000, 0.8, peak=0.4), T(g + 118), 0.55)
    add(S.thump(1.0, 70, 0.18), T(g + 134), 0.6)
    # colourway cycles: local 146–155, 179–188, 212–221
    for f in (146, 179, 212):
        add(S.whoosh(0.35, 800, 6000, 0.7, q=1.2, peak=0.5), T(g + f), 0.4)
        for k, p in enumerate(pans):
            add(S.click(0.8, 2500, 7500), T(g + f + 3 + k), 0.2, pan=p)

    # ------------------------------------------------------------------ 28–36 s  B2B ADVANTAGE (frames 840–1080)
    g = 840
    add(S.whoosh(0.7, 8500, 250, 1.0, q=0.9, peak=0.5), T(g - 3), 0.7)    # 'left' wipe
    add(S.impact(0.8, 1.4), T(g + 16), 0.5)
    ease = out_quart
    for i, name in enumerate(['10', '100+', '3000-5000', 'PRIVATE LABEL']):
        t0 = 6 + 56 * i
        # hero card expands f t0–t0+16: low-frequency impact + whoosh
        add(S.impact(1.0, 1.8), T(g + t0 + 2), 0.75)
        add(S.whoosh(0.35, 500, 5000, 0.7, peak=0.5), T(g + t0 - 2), 0.45)
        # label reveal t0+14 click
        add(S.click(1.0, 2000, 7000), T(g + t0 + 14), 0.5)
        add(S.ping(0.7, 1568 if i % 2 == 0 else 1760, 0.6), T(g + t0 + 40), 0.0)
        # collapse t0+34..48
        add(S.whoosh(0.35, 3500, 500, 0.6, peak=0.4), T(g + t0 + 34), 0.45)
        add(S.thump(1.0, 90, 0.14), T(g + t0 + 47), 0.55); add(S.click(1.0), T(g + t0 + 47), 0.45)
        # counting ticks
        if i == 3:
            for k in range(13):
                add(S.blip(0.9, 1100 + 55 * k), T(g + t0 + 8 + 1.1 * k + 1.5), 0.42)
        else:
            top = {0: 10, 1: 100, 2: 5000}[i]
            last = -1
            for fr in range(0, 36):
                c = ease(min(1, max(0, fr / 34)))
                v = int(round(c * top)) if i < 2 else int(round(c * 5000) / 100)
                if v != last:
                    add(S.blip(0.8, 900 + 1500 * c), T(g + t0 + 8 + fr), 0.34, pan=-0.1 + 0.2 * (fr % 2))
                    last = v
            add(S.ping(0.8, 2093, 0.5), T(g + t0 + 8 + 34), 0.3)      # settle chime on final value
            add(S.thump(0.9, 75, 0.1), T(g + t0 + 8 + 34), 0.5)
    for f in (4, 8):
        add(S.click(1.0), T(g + f), 0.3)

    # ------------------------------------------------------------------ 36–45 s  BRAND REVEAL (frames 1080–1350)
    g = 1080
    add(S.whoosh(0.7, 250, 9000, 1.0, q=0.9, peak=0.6), T(g - 3), 0.6)    # 'down' curtain
    # cinematic riser into logo impact (wordmark bold f1126)
    add(S.riser(1.6, 1.0, 250, 9500, 110, 900), T(g + 0), 0.8)
    # guide / letter drawing f0–52 (monoline strokes): rapid precise ticks
    for k in range(40):
        add(S.tick(0.45, 2400 + 45 * k), T(g + 2 + 1.1 * k), 0.3, pan=-0.5 + (k % 9) / 8)
    # weight bloom f46–70 + LOGO IMPACT
    add(S.impact(1.2, 3.2), T(g + 46), 1.0)
    wet(S.impact(0.8, 3.0), T(g + 46), 0.6)
    add(S.shimmer(3.0, 0.9), T(g + 47), 0.5)
    wet(S.shimmer(3.0, 0.9, (3136, 3951, 4699, 5588)), T(g + 49), 0.5)
    add(S.whoosh(0.5, 400, 6000, 0.8, peak=0.5), T(g + 62), 0.45)         # CUSTOM GEAR
    add(S.click(1.0, 2500, 8000), T(g + 64), 0.5)
    add(S.whoosh(0.45, 500, 5000, 0.7, peak=0.5), T(g + 88), 0.4)          # tagline
    add(S.click(1.0, 2500, 8000), T(g + 92), 0.5)
    # brand lock-up lifts f116–150
    add(S.whoosh(0.9, 300, 2500, 0.6, q=0.9, peak=0.5), T(g + 116), 0.4)
    add(S.thump(1.0, 70, 0.2), T(g + 150), 0.55)
    # CTA lines f140/148/156
    for i, f in enumerate((140, 148, 156)):
        add(S.whoosh(0.4, 600, 5200, 0.8, peak=0.45), T(g + f - 2), 0.5, pan=-0.15 + 0.15 * i)
        add(S.thump(1.0, 85 - 4 * i, 0.14), T(g + f + 8), 0.65)
    # small riser into URL, URL bar wipe f186–208 + hit
    add(S.riser(0.9, 0.7, 500, 9500, 200, 1000), T(g + 160), 0.55)
    add(S.whoosh(0.5, 400, 7000, 0.9, q=1.0, peak=0.5), T(g + 184), 0.6)
    add(S.impact(1.0, 2.2), T(g + 187), 0.7)
    add(S.click(1.0, 2500, 8000), T(g + 198), 0.5); add(S.tick(1.0, 3951), T(g + 198), 0.5)
    # URL sheen f214–236
    add(S.shimmer(1.6, 0.8, (3951, 4699, 5588)), T(g + 213), 0.45)
    add(S.whoosh(0.7, 2000, 9000, 0.5, q=1.0, peak=0.5), T(g + 214), 0.25)
    # closing resolve: soft final chime
    add(S.ping(0.8, 880, 2.0), T(g + 232), 0.0)

    # reverb return
    sfx = bus.b.copy()
    rvb = S.reverb(rv.b, rt=1.6, wet=1.0, bright=3000)
    n = min(sfx.shape[1], rvb.shape[1])
    sfx[:, :n] += rvb[:, :n] * 0.8
    return sfx[:, : S.n_(DUR)]


if __name__ == '__main__':
    import soundfile as sf
    x = build()
    pk = np.max(np.abs(x))
    print('sfx peak', pk)
    x = x / pk * 0.89
    sf.write('sfx_raw.wav', x.T.astype(np.float32), S.SR, subtype='FLOAT')
