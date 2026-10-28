# Fully synthesized soundtrack (no source audio). Foley snips are designed sound, not factory recordings.
import numpy as np, wave
SR=48000; FPS=30; N=SR*18
rng=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
def t(d): return np.arange(int(d*SR))/SR
def fft_filter(x,lo,hi):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR)
    X[(f<lo)|(f>hi)]=0; return np.fft.irfft(X,len(x))
def add(sig,fr,gain=1.0,pan=0.0,off=0.0):
    i=int(fr/FPS*SR+off*SR); n=min(len(sig),N-i)
    if n<=0 or i<0: return
    L[i:i+n]+=sig[:n]*gain*(1-max(pan,0)); R[i:i+n]+=sig[:n]*gain*(1+min(pan,0))
def kick(g=1):
    x=t(.32); f=45+110*np.exp(-x*28); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*9)*g
def hat(d=.05):
    x=t(d); return fft_filter(rng.standard_normal(len(x)),7000,18000)*np.exp(-x*90)*.5
def clap():
    x=t(.22); n=fft_filter(rng.standard_normal(len(x)),900,6000)
    e=sum(np.exp(-np.clip(x-o,0,None)*60)*(x>=o) for o in (0,.012,.024))*.4+np.exp(-x*22)*.6
    return n*e*.6
def snip(g=1):
    # two metallic blade strokes (shear + ring)
    x=t(.28); n=fft_filter(rng.standard_normal(len(x)),2500,11000)
    ring=sum(np.sin(2*np.pi*f*x)*np.exp(-x*a) for f,a in((3150,40),(4720,55),(6900,70)))*.12
    e=np.exp(-x*38)+0.7*np.exp(-np.clip(x-.075,0,None)*45)*(x>.075)
    return (n*e*.55+ring)*g
def swish(d=.5,lo=600,hi=7000,g=.5,rise=True):
    x=t(d); n=fft_filter(rng.standard_normal(len(x)),lo,hi)
    e=np.sin(np.pi*np.clip(x/d,0,1))**(1.5 if rise else 1)
    return n*e*g
def click(g=.5):
    x=t(.03); return fft_filter(rng.standard_normal(len(x)),2000,9000)*np.exp(-x*200)*g+np.sin(2*np.pi*1800*x)*np.exp(-x*300)*g*.3
def bass(f0,d=.22,g=.35):
    x=t(d); y=sum(np.sin(2*np.pi*f0*k*x)/k for k in (1,2,3,4)); y=fft_filter(y,30,500)
    return y*np.exp(-x*6)*g
def pluck(f,d=1.4,g=.3):
    x=t(d); y=sum(np.sin(2*np.pi*f*k*x)/k**1.3 for k in (1,2,3))*np.exp(-x*3); return y*g
bt=15 # frames per beat @120bpm
# opening: scissors-led, sparse sub pulses only
add(snip(1.0),15,1,-.1); add(kick(.8),15); add(snip(.8),48,1,.1); add(swish(.4,300,2500,.25),8)
add(click(),15); add(click(),48)
# groove from scene 2
add(swish(.5,500,6500,.5),84)
for b in range(90,420,bt):
    k=(b-90)//bt
    add(kick(.95),b)
    add(hat(),b+bt//2,.8)
    if k>=4 and k%2==1: add(clap(),b,.7)           # backbeat from the personalization scene
    if k>=8: add(hat(.03),b+bt//4,.35); add(hat(.03),b+3*bt//4,.35)
    add(bass([55,55,65.4,49][ (k//1)%4],.22),b+bt//2,1)
# scene 3 precision hits on each cut + clicks on type reveals
for c in (180,210,240,265): add(snip(.55),c,1,.15); add(click(.6),c+2)
for c in (96,110,306,322): add(click(.45),c)
for c in (182,212,267): add(click(.6),c)
add(snip(1.0),300,1,-.1); add(snip(.8),312,.8,.1)  # scene 4 match cut
add(swish(.35,800,8000,.45),330-6)
# wipe + cut line + brand hit
add(swish(.9,300,9000,.7),404); add(click(.8),438); add(swish(.3,3000,12000,.6),438)
add(kick(1.2),452); add(bass(41.2,1.2,.9),452)
for i,f in enumerate((261.6,329.6,392.0,523.3)): add(pluck(f,1.6,.22),452,1,(-.3+.2*i),off=i*.06)
for c in (458,464,470,474): add(click(.45),c)
add(click(.9),478); add(pluck(1046.5,1.2,.18),478)
# mild sidechain-like softening and normalize peak
m=np.stack([L,R],1); pk=np.abs(m).max(); m=m/pk*0.89
m=np.tanh(m*1.2)/np.tanh(1.2)
m[-int(.25*SR):]*=np.linspace(1,0,int(.25*SR))[:,None]
with wave.open('/tmp/raw_mix.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((m*32767).astype('<i2').tobytes())
