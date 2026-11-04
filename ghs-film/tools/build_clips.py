#!/usr/bin/env python3
"""Cuts the source into per-shot, conservatively upscaled (576x1024 -> 1080x1920) clips.
Frame ranges avoid the source's third-party logo overlay (appears after frame 406),
the 'niche' pattern paper (frames 200-235) and the GUCCI shirt (frames 184-199)."""
import subprocess, json, re, sys, os
SRC = sys.argv[1]; OUT = sys.argv[2]; TL = sys.argv[3]
FPS = 30
# id, first frame, last frame (inclusive), playback rate, label
SHOTS = [
 ("c01",42,59,.75,"orange fabric close"),("c02",23,39,.75,"workshop table wide"),("c03",1,20,.75,"pink garments"),
 ("c04",62,76,.75,"worker with dark garment"),("c05",79,91,.70,"seamstress"),("c06",123,134,.70,"cutting table wide"),
 ("c07",108,120,.70,"cutting machine"),("c08",94,105,.65,"pattern marking"),("c09",165,182,.75,"ruler measuring"),
 ("c10",137,148,.70,"machine sewing"),("c11",151,162,.70,"folding fabric"),("c12",237,251,.75,"sewing grey fabric"),
 ("c13",267,281,.80,"thread cones"),("c14",283,299,.80,"workshop wide"),("c15",301,324,.75,"green/orange garments"),
 ("c16",326,344,.80,"folding orange jersey"),("c17",362,376,.75,"bagged garments"),("c18",378,404,.90,"container"),
]
def luma(a,b):
    r=subprocess.run(["ffmpeg","-v","info","-i",SRC,"-vf",f"select='between(n,{a},{b})',signalstats,metadata=print:key=lavfi.signalstats.YAVG","-an","-f","null","-"],capture_output=True,text=True)
    v=[float(x) for x in re.findall(r"YAVG=([0-9.]+)",r.stderr)]
    return sum(v)/len(v)
tl=[]; t=0
for sid,a,b,rate,label in SHOTS:
    y=luma(a,b)/255
    gamma=min(1.18,max(0.88,(0.46/max(y,.05))**0.35))  # gentle pull toward a common exposure
    gamma=round(gamma,3)
    n=b-a+1
    outframes=round(n/rate)
    vf=(f"select='between(n,{a},{b})',setpts=N/FRAME_RATE/TB,"
        f"hqdn3d=1.0:1.0:2.5:2.5,scale=1080:1920:flags=lanczos,"
        f"setpts=PTS/{rate},minterpolate=fps={FPS}:mi_mode=blend,"
        f"eq=gamma={gamma}:contrast=1.05:saturation=0.97,unsharp=5:5:0.25:5:5:0.0,format=yuv420p")
    subprocess.run(["ffmpeg","-v","error","-y","-i",SRC,"-vf",vf,"-an","-r",str(FPS),"-frames:v",str(outframes),"-c:v","libx264","-crf","12","-preset","fast",f"{OUT}/{sid}.mp4"],check=True)
    tl.append(dict(id=sid,src=f"clips/{sid}.mp4",frames=outframes,rate=rate,label=label,luma=round(y,3),gamma=gamma))
    print(sid,outframes,round(y,3),gamma)
json.dump(tl,open(TL,"w"),indent=1)
