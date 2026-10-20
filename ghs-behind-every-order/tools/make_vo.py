"""Generate voice-over segments with Kokoro TTS (kokoro-onnx). Writes public/audio/vo_*.wav and vo_meta.json."""
import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICE = sys.argv[1] if len(sys.argv) > 1 else "am_michael"
SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 0.93
SEGMENTS = {
  "s1a": "Choosing an overseas manufacturer raises real questions.",
  "s1b": "And you deserve clear answers.",
  "s2":  "GHS Custom Gear operates its own sportswear manufacturing facility, in Sialkot, Pakistan.",
  "s3":  "Your designs, materials, sizing, and branding requirements should be clear before production begins.",
  "s4":  "Understand each production stage, confirm your order details, and discuss how progress updates will be shared.",
  "s5":  "From construction details to final inspection, quality deserves attention at every stage.",
  "s6a": "Have questions? Talk directly with GHS Custom Gear about your custom manufacturing requirements.",
  "s6b": "Let's build with clarity.",
}
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
meta = {}
for key, text in SEGMENTS.items():
    s, sr = k.create(text, voice=VOICE, speed=(SPEED*1.07 if key.startswith("s6") else SPEED), lang="en-us")
    s = np.asarray(s, dtype=np.float32)
    # trim silence edges
    idx = np.where(np.abs(s) > 0.01)[0]
    s = s[max(idx[0]-int(0.03*sr),0): idx[-1]+int(0.08*sr)]
    sf.write(f"public/audio/vo_{key}.wav", s, sr)
    meta[key] = {"dur": len(s)/sr, "sr": sr}
    print(key, round(len(s)/sr, 2))
json.dump(meta, open("public/audio/vo_meta.json", "w"), indent=1)
