"""Generate voice-over lines with local Kokoro (kokoro-onnx). Usage: make_vo.py MODEL VOICES OUTDIR"""
import sys, soundfile as sf
from kokoro_onnx import Kokoro
model, voices, out = sys.argv[1:4]
k = Kokoro(model, voices)
lines = {
  "vo1": "Not just a jersey.",
  "vo2": "Every detail counts.",
  "vo3": "Custom sportswear, built around your vision.",
  "vo4": "G H S Custom Gear.",
}
for n, t in lines.items():
    s, sr = k.create(t, voice="am_michael", speed=0.92, lang="en-us")
    sf.write(f"{out}/{n}.wav", s, sr)
    print(n, len(s)/sr)
