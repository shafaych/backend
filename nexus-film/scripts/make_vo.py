# Generates the three VO lines with Kokoro-82M (Apache-2.0) via kokoro-onnx.
import sys, soundfile as sf
from kokoro_onnx import Kokoro
model, voices, out = sys.argv[1:4]
k = Kokoro(model, voices)
lines = {"vo1":"Some chapters stay with you.","vo2":"Others start with one step.","vo3":"Nexus Jacket. Make it yours."}
for n,t in lines.items():
    s, sr = k.create(t, voice="am_michael", speed=0.88, lang="en-us")
    sf.write(f"{out}/{n}.wav", s, sr); print(n, len(s)/sr)
