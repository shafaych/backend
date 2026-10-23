import soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro('kk/kokoro-v1.0.onnx','kk/voices-v1.0.bin')
lines = [
 "Behind every custom sportswear collection...",
 "...are real hands, real skills, and attention to detail.",
 "Inside GHS Custom Gear, our team works across garment preparation and finishing.",
 "From the production floor to order preparation, every stage plays its part.",
 "Custom sportswear for teams, businesses, and growing apparel brands.",
 "GHS Custom Gear. Your vision. Our production.",
]
for i,t in enumerate(lines):
    a,sr = k.create(t, voice='am_michael', speed=0.98, lang='en-us')
    sf.write(f'vo_{i}.wav', a, sr); print(i, len(a)/sr)
