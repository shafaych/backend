import soundfile as sf
from kokoro_onnx import Kokoro
k=Kokoro("kokoro.onnx","voices.bin")
L=["This isn't stock footage.","These are the people behind our production.","From garment preparation to careful packing, every detail deserves attention.","At GHS Custom Gear, real people are behind the work.","GHS Custom Gear. Your vision. Our production."]
for i,t in enumerate(L,1):
    s,sr=k.create(t,voice="am_michael",speed=0.95,lang="en-us")
    sf.write(f"vo{i}.wav",s,sr); print(i,len(s)/sr)
