"""Voice-over generation with Kokoro-82M (local, open-source, Apache-2.0).
Usage: python3 generate_vo.py <kokoro-v1.0.onnx> <voices-v1.0.bin> <out_dir>
Models: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
"""
import sys, soundfile as sf
from kokoro_onnx import Kokoro

LINES = {
    1: "Think you need hundreds of pieces to start your sportswear brand? Think again.",
    2: "Your first collection can start with just ten pieces.",
    3: "Your designs. Your labels. Your identity. Made for your brand.",
    4: "Start small, build your collection, and scale when you're ready.",
    5: "With GHS Custom Gear, you have a manufacturing partner behind your vision.",
    6: "GHS Custom Gear. Your brand starts here.",
}
# "GHS" is read by the default G2P as one run-together word with uneven stress; spell it as three
# evenly-stressed letters. The comma after "Gear" in line 5 is dropped to avoid a ~0.5 s dead pause.
PHONEME_OVERRIDES = {
    5: "wɪð dʒˈiː ˈeɪtʃ ˈɛs kˈʌstəm ɡˈɪɹ juː hæv ɐ mˌænjuːfˈæktʃɚɹɪŋ pˈɑːɹtnɚ bᵻhˌaɪnd jʊɹ vˈɪʒən.",
    6: "dʒˈiː ˈeɪtʃ ˈɛs kˈʌstəm ɡˈɪɹ. jʊɹ bɹˈænd stˈɑːɹts hˈɪɹ.",
}
model, voices, out = sys.argv[1:4]
k = Kokoro(model, voices)
for i, t in LINES.items():
    if i in PHONEME_OVERRIDES:
        s, sr = k.create(PHONEME_OVERRIDES[i], voice="am_michael", speed=0.95, lang="en-us", is_phonemes=True)
    else:
        s, sr = k.create(t, voice="am_michael", speed=0.95, lang="en-us")
    sf.write(f"{out}/vo_{i}.wav", s, sr)
    print(i, round(len(s) / sr, 2), "s")
