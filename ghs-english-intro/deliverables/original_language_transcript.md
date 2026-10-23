# Original-language transcript — NOT PRODUCED

No speech-recognition model could be run in this environment (model hosts such as Hugging Face / OpenAI are blocked
by the network policy, and no Urdu recogniser was available via PyPI/npm). Therefore:

- No transcript of the Urdu recording exists and none has been verified.
- The Roman-Urdu text in the brief is a reference script only; it was not confirmed against the audio.
- Exact spoken wording, pauses and deviations from the script are unknown.
- Only audio facts measured directly: 54.5 s of continuous speech with no silences > 0.18 s at -24 dB; a low-energy dip
  at ~5.2-5.5 s, used as the cut point for the talking-head intro.

To get a real transcript: run Whisper (large-v3, language=ur) on `audio_stems/original_urdu_audio.wav` somewhere with model access,
then have a native speaker verify it.
