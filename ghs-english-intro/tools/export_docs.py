#!/usr/bin/env python3
"""Exports narration script, segment timing, SRT and timeline breakdown from timeline.json."""
import json, re, sys
R = sys.argv[1] if len(sys.argv) > 1 else '.'
T = json.load(open(f'{R}/timeline.json'))
def tc(t, comma=False):
    m = int(t // 60); s = t - 60 * m
    return f"{m:02d}:{s:06.3f}".replace('.', ',' if comma else '.')
def srt_tc(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s-int(s))*1000)):03d}"
def split(text, mx=5):
    out = []
    for s in re.findall(r'[^.!?:]+[.!?:]?', text):
        w = s.split()
        if not w: continue
        n = -(-len(w) // mx); size = -(-len(w) // n)
        out += [' '.join(w[i:i+size]) for i in range(0, len(w), size)]
    return out
subs, srt, i = [], [], 1
for s in T['segments']:
    ch = split(s['text']); tot = sum(len(c.split()) for c in ch); t = s['start']
    for c in ch:
        d = (s['speechEnd'] - s['start']) * len(c.split()) / tot
        subs.append((s['id'], t, t + d, c))
        srt.append(f"{i}\n{srt_tc(t)} --> {srt_tc(t+d)}\n{c}\n"); i += 1; t += d
open(f'{R}/deliverables/english_subtitles_ESTIMATED_timing.srt', 'w').write('\n'.join(srt))

L = ["# English narration script and timing", "",
     f"Total video: **{T['total']:.2f} s** (1080×1920, 30 fps). Narration window: {tc(T['narrationStart'])} – {tc(T['narrationEnd'])}.", "",
     "The script is the owner-approved marketing script with two wording tweaks for American English (see end of file). It is **not** a verified transcript of the Urdu recording.",
     "All narration times below are **targets** (150 words/min speaking pace + 0.4 s pause between segments), to be replaced by the real voice-over's timing.", "",
     "| # | Start | Speech ends | Segment ends | Target length | Words | Text |", "|---|---|---|---|---|---|---|"]
for s in T['segments']:
    L.append(f"| {s['id']} | {tc(s['start'])} | {tc(s['speechEnd'])} | {tc(s['end'])} | {s['speechEnd']-s['start']:.1f} s | {len(s['text'].split())} | {s['text']} |")
L += ["", "## Full script (read straight through)", ""] + [s['text'] for s in T['segments']]
L += ["", "Read “10” as “ten” in the voice-over; the subtitle says “ten”. Note for the voice artist: sentence 7 should land by "
      f"{tc(T['segments'][-1]['speechEnd'])} so the closing card (starts {tc(T['endCardStart'])}) is not cut across.", "",
      "## Wording changes from the supplied script", "- “a custom sportswear manufacturing company” → “a custom sportswear manufacturer”", "- “We operate our own manufacturing facility” → “We run our own manufacturing facility”",
      "No manufacturing claim was added or removed."]
open(f'{R}/deliverables/english_narration_script_and_timing.md', 'w').write('\n'.join(L) + '\n')

NAME = {'talkinghead': 'Original talking head', 'stitching': 'Video-48410 (machine stitching)', 'finishing': 'Video-49124 (garment finishing)',
        'packing_team': 'ghs-factory (workers preparing/packing)', 'finished_stacks': 'kings-ghs-manufacturing (finished sportswear stacks)'}
B = ["# Video timeline breakdown", "", "## Visual tracks", "", "| Start | End | Length | Section | Source clip (source in-point) | On-screen caption |", "|---|---|---|---|---|---|",
     f"| 00:00.000 | {tc(T['intro'])} | {T['intro']:.1f} s | Talking-head intro | {NAME['talkinghead']} (0.0 s), original Urdu audio, faded out at the end | “GHS CUSTOM GEAR / Custom Sportswear Manufacturer / Sialkot, Pakistan” |"]
for sh in T['shots']:
    B.append(f"| {tc(sh['start'])} | {tc(sh['end'])} | {sh['end']-sh['start']:.1f} s | Factory footage | {NAME[sh['clip']]} ({sh['from']:.1f} s) | {sh['tag'] or '—'} |")
B.append(f"| {tc(T['endCardStart'])} | {tc(T['total'])} | {T['total']-T['endCardStart']:.1f} s | End card | Brand graphic (no footage) | GHS CUSTOM GEAR · YOUR VISION. OUR PRODUCTION. · Custom Sportswear & Private Label Manufacturing · MOQ Starting at 10 Pieces · ghscustomgear.com · LET'S DISCUSS YOUR NEXT ORDER. |")
B += ["", "(Crossfades are 6 frames / 0.2 s at each shot boundary. Shots overlap by that amount.)", "",
      "## Subtitles (estimated timing)", "", "| # | Start | End | Segment | Text |", "|---|---|---|---|---|"]
for n, (sid, a, b, c) in enumerate(subs, 1):
    B.append(f"| {n} | {tc(a)} | {tc(b)} | {sid} | {c} |")
B += ["", "## Audio tracks", "", f"- 00:00 – {tc(T['intro'])}: original Urdu audio (full level), faded out over the last 0.3 s.",
      f"- {tc(T['narrationStart'])} – {tc(T['narrationEnd'])}: reserved for the English voice-over (not yet supplied).",
      f"- 00:00 – {tc(T['total'])}: factory ambience from the clips' own audio (quiet) + generated placeholder music pad, ducked under the voice by `tools/mix_with_voiceover.sh`."]
open(f'{R}/deliverables/video_timeline_breakdown.md', 'w').write('\n'.join(B) + '\n')
print('exported')
