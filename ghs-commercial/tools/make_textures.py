"""Procedural textile generator: knit height-field -> lit, colourised macro plates.
Everything is synthesised; no external imagery."""
import numpy as np, os
from PIL import Image
from scipy.ndimage import gaussian_filter

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "tex")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def hexrgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float) / 255


def pnoise(shape, sigma, seed):
    r = np.random.default_rng(seed).standard_normal(shape)
    n = gaussian_filter(r, sigma, mode="wrap")
    return n / (n.std() + 1e-9)


def knit_height(H, W, cw, ch, seed=1, wale_wobble=0.0):
    """Stockinette: columns of V stitches. cw/ch = stitch cell size in px."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    # yarn irregularity warps the lattice slightly
    wx = pnoise((H, W), cw * 3, seed) * cw * 0.05 * (1 + wale_wobble)
    wy = pnoise((H, W), cw * 3, seed + 1) * ch * 0.04
    u = ((x + wx) / cw) % 1.0
    v = ((y + wy) / ch) % 1.0
    h = np.zeros((H, W), np.float32)
    for centre in (0.25 + 0.25 * v, 0.75 - 0.25 * v):
        d = u - centre
        d = (d + 0.5) % 1.0 - 0.5
        prof = np.exp(-(d / 0.19) ** 2)
        taper = np.sin(np.pi * np.clip(v * 0.92 + 0.04, 0, 1)) ** 0.6
        h = np.maximum(h, prof * (0.72 + 0.28 * taper))
    # plied-yarn twist: fine diagonal striation riding on each leg
    tw = np.sin((u * 2 - v * 3.0) * 2 * np.pi * 3.0) * 0.05
    h += tw * (h > 0.2)
    # fibre fuzz
    h += pnoise((H, W), 0.7, seed + 2) * 0.03
    h += pnoise((H, W), 2.2, seed + 3) * 0.03
    return h


def light(h, az=-0.6, el=0.75, strength=3.2, ao=0.4):
    gy, gx = np.gradient(gaussian_filter(h, 0.6))
    nx, ny, nz = -gx * strength, -gy * strength, np.ones_like(h)
    n = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    lx, ly, lz = np.cos(az) * np.cos(el), np.sin(az) * np.cos(el), np.sin(el)
    diff = np.clip((nx * lx + ny * ly + nz * lz) / n, 0, 1)
    # gaps between stitches are occluded
    occl = gaussian_filter(h, 3.0)
    occl = (occl - occl.min()) / (np.ptp(occl) + 1e-9)
    shade = diff * (1 - ao + ao * np.clip(h * 1.1, 0, 1)) * (0.75 + 0.25 * occl)
    # sheen on legs
    spec = np.clip(diff, 0, 1) ** 14 * 0.35 * np.clip(h, 0, 1)
    return shade, spec


def colourise(shade, spec, base, spec_col=None, lift=0.0, vign=0.0):
    base = hexrgb(base) if isinstance(base, str) else base
    s = shade[..., None]
    rgb = base * (0.42 + 1.05 * s) + lift
    sc = np.array([1, 1, 1.0]) if spec_col is None else spec_col
    rgb = rgb + spec[..., None] * sc * (0.5 + base.mean())
    if vign:
        H, W = shade.shape
        yy, xx = np.mgrid[0:H, 0:W]
        r = np.hypot((xx / W - .5) * 1.1, (yy / H - .5))
        rgb *= (1 - vign * r ** 2 * 2.2)[..., None]
    # sensor-style film grain
    rgb += rng.standard_normal(rgb.shape[:2])[..., None] * 0.012
    return np.clip(rgb, 0, 1)


def save(arr, name, q=93):
    Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, name), quality=q)
    print("wrote", name, arr.shape)


H, W = 2880, 1620  # taller than 1080x1920 canvas so shots can pan
# --- macro plates -------------------------------------------------
specs = {
    "knit_carbon": ("#2a2d2a", 54, 66),
    "knit_graphite": ("#4b524a", 40, 49),
    "knit_porcelain": ("#f0f0e8", 46, 56),
    "knit_lime": ("#b9e45f", 44, 53),
}
heights = {}
for i, (name, (col, cw, ch)) in enumerate(specs.items()):
    h = knit_height(H, W, cw, ch, seed=10 + i * 7)
    heights[name] = h
    shade, spec = light(h)
    save(colourise(shade, spec, col, vign=0.35), name + ".jpg")

# fine knit used for wide jersey shots (periodic, seamless): neutral shade tile
T = 768
h = knit_height(T, T, 16, 19, seed=99)
shade, spec = light(h, strength=4.0, ao=0.6)
tile = np.clip(0.2 + shade * 0.85 + spec * 1.2, 0, 1)
tile = tile[..., None].repeat(3, 2)
save(tile, "knit_tile_fine.png")
# overlay-friendly 50% grey centred version
g = np.clip(0.5 + (shade - shade.mean()) * 1.1 + spec * 0.6, 0, 1)
save(g[..., None].repeat(3, 2), "knit_tile_overlay.png")

# --- rib (collar / cuff), vertical wales ---------------------------
def rib(H, W, period, seed):
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    u = (x / period) % 1
    wob = pnoise((H, W), 6, seed) * 0.02
    h = np.sin((u + wob) * 2 * np.pi) * 0.5 + 0.5
    h = h ** 1.3
    # stitch bumps along each wale
    v = (y / (period * 1.15)) % 1
    h *= 0.78 + 0.22 * np.sin(v * 2 * np.pi) ** 2
    h += pnoise((H, W), 0.8, seed + 1) * 0.04
    return h

hr = rib(H, W, 70, 5)
sh, sp = light(hr, az=-0.9, strength=4)
save(colourise(sh, sp, "#454a44", vign=.3), "rib_carbon.jpg")
sh, sp = light(hr, az=-0.9, strength=4)
save(colourise(sh, sp, "#c8f36b", vign=.3), "rib_lime.jpg")

# --- performance mesh (honeycomb perforations) ----------------------
def mesh(H, W, d, seed):
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    row = (y / (d * 0.866)).astype(int)
    xs = x + (row % 2) * d / 2
    cx = (np.floor(xs / d) + .5) * d
    cy = (row + .5) * d * 0.866
    cxs = cx - (row % 2) * d / 2
    r = np.hypot(x - cxs, y - cy)
    hole = np.clip((r - d * 0.27) / (d * 0.09), 0, 1)
    h = hole * (0.75 + 0.25 * np.exp(-((r - d * .42) / (d * .1)) ** 2))
    h += pnoise((H, W), 1.2, seed) * 0.025
    return h, hole

hm, hole = mesh(H, W, 62, 3)
sh, sp = light(hm, strength=6, ao=0.7)
rgb = colourise(sh, sp, "#323632", vign=.3)
rgb *= (0.12 + 0.88 * hole)[..., None]  # looking through to deep shadow
save(rgb, "mesh_carbon.jpg")
sh, sp = light(hm, strength=6, ao=0.7)
rgb = colourise(sh, sp, "#e9e9e0", vign=.3) * (0.1 + 0.9 * hole)[..., None]
save(rgb, "mesh_porcelain.jpg")

# --- satin-stitch embroidery tile (parallel threads, directional sheen)
def satin(H, W, thread, seed):
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    ang = np.deg2rad(32)
    u = (x * np.cos(ang) + y * np.sin(ang)) / thread
    v = (-x * np.sin(ang) + y * np.cos(ang))
    fr = u % 1
    h = np.sin(fr * np.pi) ** 0.7
    # threads vary in height and a few lift
    idx = np.floor(u).astype(int)
    r = np.random.default_rng(seed).random(idx.max() + 2)
    h *= (0.8 + 0.2 * r[idx])
    h += pnoise((H, W), 0.8, seed) * 0.02
    return h, v

he, _ = satin(H, W, 7.5, 5)
gy, gx = np.gradient(gaussian_filter(he, 0.5))
# anisotropic sheen: thread direction highlights across the field
yy, xx = np.mgrid[0:H, 0:W]
swirl = np.sin((xx * .004 + yy * .003)) * .5 + .5
sh, sp = light(he, az=-0.5, strength=3.2, ao=0.4)
col = hexrgb("#c8f36b")
rgb = colourise(sh, sp * 0.4, col, vign=.25) * (0.75 + 0.45 * swirl)[..., None]
save(rgb, "satin_lime.jpg")
col = hexrgb("#f5f5f0")
rgb = colourise(sh, sp * 0.4, col, vign=.25) * (0.7 + 0.4 * swirl)[..., None]
save(rgb, "satin_porcelain.jpg")

# --- film grain plate ------------------------------------------------
g = rng.standard_normal((1920, 1080))
g = gaussian_filter(g, 0.6)
g = g / g.std() * 0.16 + 0.5
save(np.clip(g, 0, 1)[..., None].repeat(3, 2), "grain.png")
