import soundfile as sf, numpy as np, json, sys
from kokoro_onnx import Kokoro
k = Kokoro("kokoro-v1.0.onnx","voices-v1.0.bin")
voice = sys.argv[1] if len(sys.argv)>1 else "am_michael"
lines = {
 "v1":"Every game has its heroes.",
 "v2":"You see the players. You see the passion.",
 "v3":"Behind every uniform, there's a story of precision, preparation, and purpose.",
 "v4":"Different sports. Different teams. One thing they share — someone brings their identity to life.",
 "v5":"That unseen player? Your manufacturing partner.",
 "v6a":"Let your team be seen.",
 "v6b":"G H S Custom Gear.",
 "v6c":"Your vision. Our production.",
}
dur={}
for n,t in lines.items():
    a,sr = k.create(t, voice=voice, speed=(0.97 if n.startswith("v6") else 0.9), lang="en-us")
    sf.write(f"../audio/{n}.wav", a, sr); dur[n]=len(a)/sr
print(dur)
