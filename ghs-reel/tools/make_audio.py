# Synthesises the music bed + SFX for the reel (no external assets). Output: public/music.wav
import numpy as np, wave
SR=44100; D=20.0; N=int(SR*D); t=np.arange(N)/SR
rng=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
def add(sig,at,g=1.0,pan=0.0):
    i=int(at*SR); s=sig[:max(0,N-i)]; 
    L[i:i+len(s)]+=s*g*(1-max(pan,0)); R[i:i+len(s)]+=s*g*(1+min(pan,0))
def env(n,a,d): 
    x=np.arange(n)/SR; return np.minimum(x/a,1)*np.exp(-x/d)
def lp(x,k):  # simple one-pole lowpass
    y=np.zeros_like(x); a=k; acc=0
    for i in range(len(x)): acc+=a*(x[i]-acc); y[i]=acc
    return y
def noise(n): return rng.standard_normal(n)
BPM=100; beat=60/BPM
# bass kick-like pulse + sub bass line (A1,A1,F1,G1 per bar)
notes=[55,55,43.65,49]
for b in range(int(D/beat)):
    at=b*beat
    if at<0.0 or at>=16.4: continue
    n=int(SR*0.5); x=np.arange(n)/SR
    f=notes[(b//4)%4]
    sub=np.sin(2*np.pi*f*x)*env(n,0.01,0.28)
    gain=0.0 if at<0.3 else min(1,(at-0.3)/2.5)
    add(sub,at,0.42*gain)
    if b%2==0:  # soft kick
        k=np.sin(2*np.pi*(48+90*np.exp(-x*30))*x)*env(n,0.002,0.09); add(k,at,0.35*gain)
    # off-beat hat
    h=noise(int(SR*0.06)); h=h-lp(h,0.15); add(h*env(len(h),0.001,0.015),at+beat/2,0.06*gain,0.2)
# pad chords (Am, F, G, Am) with slow swell, ends on resolved chord at ~16.0 ring-out
chords=[[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7],[220,261.6,329.6]]
bar=beat*4
for c in range(0,5):
    at=c*bar*1.0
    if at>=17: break
    ch=chords[c%4]; dur=bar+0.8; n=int(SR*dur); x=np.arange(n)/SR
    pad=sum(np.sin(2*np.pi*f*x)+0.4*np.sin(2*np.pi*f*2.003*x)+0.25*np.sin(2*np.pi*f*0.998*x) for f in ch)
    e=np.minimum(x/1.2,1)*np.minimum((dur-x)/0.8,1)
    add(pad*e/9,at,0.5,0.0)
# musical finish: Am add9 bell chord at 16.0 with long tail
for f,dl in [(440,0),(659.3,0.06),(880,0.12),(1318.5,0.18)]:
    n=int(SR*3.6); x=np.arange(n)/SR
    bell=(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*f*2.76*x))*env(n,0.004,0.9)
    add(bell,16.0+dl,0.12,0.15 if f>600 else -0.15)
n=int(SR*3.8); x=np.arange(n)/SR
add(np.sin(2*np.pi*55*x)*env(n,0.01,1.2),16.0,0.5)
# SFX
def whoosh(at,dur=0.7,g=0.25,rev=False):
    n=int(SR*dur); x=noise(n); sw=np.linspace(0.02,0.3,n); y=np.zeros(n); acc=0
    for i in range(n): acc+=sw[i]*(x[i]-acc); y[i]=acc
    e=np.sin(np.pi*np.linspace(0,1,n))**2
    if rev: e=e[::-1]*np.linspace(0.2,1,n)
    add(y*e,at,g,0.0)
def impact(at,g=0.5):
    n=int(SR*0.9); x=np.arange(n)/SR
    th=np.sin(2*np.pi*(42+60*np.exp(-x*25))*x)*env(n,0.001,0.22)
    cr=lp(noise(n),0.25)*env(n,0.001,0.05)*0.4
    add(th+cr,at,g)
def tick(at,g=0.18):
    n=int(SR*0.08); x=np.arange(n)/SR; add(np.sin(2*np.pi*1800*x)*env(n,0.001,0.012),at,g)
def rustle(at,g=0.1):
    n=int(SR*0.35); x=noise(n); x=x-lp(x,0.05); x=lp(x,0.5)
    add(x*env(n,0.03,0.12)*(0.6+0.4*np.sin(np.arange(n)/SR*60)),at,g,rng.uniform(-.5,.5))
impact(0.10,0.45); tick(1.55); impact(1.65,0.3)       # scene1: ANOTHER ORDER / ALMOST READY
whoosh(2.7,0.5,0.22); tick(3.25)                       # scene2
whoosh(6.7,0.5,0.22); tick(7.3); tick(8.0)
for tt in [8.6,9.5,10.4,11.2]: rustle(tt)
whoosh(11.7,0.5,0.22); impact(12.2,0.4); tick(13.6)    # scene4 READY FOR DISPATCH
whoosh(15.5,0.6,0.28,rev=True); impact(16.0,0.35); tick(17.2); tick(17.9); tick(18.6)
# master: gentle lowpass-free normalise, fade out
fade=np.ones(N); fi=int((D-1.6)*SR); fade[fi:]=np.linspace(1,0,N-fi)
L*=fade; R*=fade
m=max(abs(L).max(),abs(R).max()); L/=m; R/=m; L*=0.8; R*=0.8
pcm=(np.stack([L,R],1)*32767).astype('<i2')
w=wave.open('public/music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
