"""Builds the 25s stereo mix: factory ambience + procedural industrial music + Kokoro VO + SFX."""
import numpy as np, soundfile as sf, subprocess, os
from scipy import signal
SR=48000; N=25*SR; rng=np.random.default_rng(7)
d=os.path.dirname(os.path.abspath(__file__))
def rd(f):
    x,sr=sf.read(os.path.join(d,f),always_2d=True)
    if sr!=SR: x=signal.resample_poly(x,SR,sr,axis=0)
    return x.mean(1) if x.shape[1]>1 else x[:,0]
def place(buf,x,t):
    i=int(t*SR)
    if i>=N: return
    j=min(N,i+len(x)); buf[i:j]+=x[:j-i]
def env(points,n=N):
    t=np.arange(n)/SR; return np.interp(t,[p[0] for p in points],[p[1] for p in points])
def lp(x,f,o=2): return signal.sosfilt(signal.butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=2): return signal.sosfilt(signal.butter(o,f,'high',fs=SR,output='sos'),x)
def bp(x,a,b): return signal.sosfilt(signal.butter(2,[a,b],'band',fs=SR,output='sos'),x)
def rms_db(x): return 20*np.log10(np.sqrt(np.mean(x**2))+1e-9)

# --- Layer 1: ambience from the real footage, cut to match the picture edit
src=rd('src_audio.wav'); src=hp(src,90,3)
segs=[(0,0,4),(4,10,2.5),(6.5,18,2.5),(9,5.5,3),(12,12,3),(15,16,5.2)]
amb=np.zeros(N); xf=int(.12*SR)
for o,s0,du in segs:
    x=src[int(s0*SR):int((s0+du+.12)*SR)].copy(); x*=np.minimum(1,np.minimum(np.arange(len(x))/xf,(len(x)-np.arange(len(x)))/xf))
    place(amb,x,o)
amb*=env([(0,1),(19.8,1),(20.8,0.0)])            # fades under the brand card
amb*=10**((-24-rms_db(amb[:20*SR]))/20)

# --- Layer 2: restrained industrial music (A minor, 92 bpm), fully synthesised
bpm=92; beat=60/bpm; t=np.arange(N)/SR
music=np.zeros(N)
for k,f in enumerate([55,55,43.65,49]):                 # bass, one bar each, 4 bars loop (~10.4s)
    pass
bars=int(25/(beat*4))+2
roots=[55.0,43.65,49.0,41.2]
for b in range(bars):
    r=roots[b%4]; t0=b*beat*4
    for e in range(8):                                  # 8th-note sub pulse
        tt=t0+e*beat/2; 
        if tt>=25: break
        n=int(beat/2*SR*0.9); tx=np.arange(n)/SR
        x=np.sin(2*np.pi*r*tx)*np.exp(-tx*5)*0.9+np.sin(2*np.pi*r*2*tx)*np.exp(-tx*9)*0.15
        place(music,x*(1.0 if e%2==0 else 0.6),tt)
    for q in range(4):                                  # soft kick
        tt=t0+q*beat
        if tt>=25: break
        n=int(.25*SR); tx=np.arange(n)/SR
        place(music,np.sin(2*np.pi*(48+90*np.exp(-tx*30))*tx)*np.exp(-tx*12)*0.8,tt)
    for q in range(8):                                  # metallic tick (industrial hat)
        tt=t0+q*beat/2+beat/4
        if tt>=25: break
        n=int(.05*SR); x=hp(rng.standard_normal(n),7000)*np.exp(-np.arange(n)/SR*70)
        place(music,x*0.10,tt)
    # pad: detuned saws, minor chords, low-passed
    chord={55.0:[220,261.63,329.63],43.65:[174.61,220,261.63],49.0:[196,246.94,293.66],41.2:[164.81,196,246.94]}[r]
    n=int(beat*4*SR*1.05); tx=np.arange(n)/SR; pad=np.zeros(n)
    for fr in chord:
        for dt in (-1.003,1,1.003): pad+=signal.sawtooth(2*np.pi*fr*dt*tx)
    pad=lp(pad,1400)*np.minimum(1,np.minimum(tx/1.2,(tx[-1]-tx)/1.2))*0.05
    place(music,pad,t0)
music=lp(music,9000)
music*=env([(0,0.0),(1.0,0.7),(4,0.8),(9,0.9),(15,0.95),(20,1.0),(23.6,0.9),(25,0)])
music*=10**((-20-rms_db(music))/20)

# --- Layer 3: Kokoro voice-over
vo=np.zeros(N)
for f,tm in [('vo1.wav',0.4),('vo2.wav',4.2),('vo3.wav',9.2),('vo4.wav',15.0),('vo5.wav',20.0)]:
    x=rd(f); x=hp(x,70); place(vo,x,tm)
vo*=10**((-17-rms_db(vo[vo!=0]))/20)

# --- ducking: smoothed envelope from VO activity
act=lp(np.abs(vo),6,1); act=np.clip(act/ (np.percentile(act,95)+1e-9),0,1)
duck_m=1-0.55*np.clip(lp(act*4,4,1),0,1)   # music ducks ~-7 dB
duck_a=1-0.40*np.clip(lp(act*4,4,1),0,1)
music*=duck_m; amb*=duck_a

# --- SFX: transition whooshes + restrained fabric rustle + brand-card thump
sfx=np.zeros(N)
def whoosh(t0,dur=.55,lvl=.12):
    n=int(dur*SR); x=bp(rng.standard_normal(n),400,5000); e=np.sin(np.linspace(0,np.pi,n))**2; place(sfx,x*e*lvl,t0)
for tc in (3.8,8.8,14.8,19.8): whoosh(tc)
def rustle(t0,lvl=.05):
    n=int(.35*SR); x=bp(rng.standard_normal(n),2500,9000)*np.abs(np.sin(np.linspace(0,np.pi*(3+rng.integers(0,3)),n)))**1.5
    place(sfx,x*np.hanning(n)*lvl,t0)
for tr in (10.3,11.4,12.8,13.5,14.2): rustle(tr)
n=int(.9*SR); tx=np.arange(n)/SR; place(sfx,np.sin(2*np.pi*(42+70*np.exp(-tx*18))*tx)*np.exp(-tx*5)*0.5,20.0)
sfx*=10**((-30-rms_db(sfx[sfx!=0]))/20)*3.0

mix=amb+music+vo+sfx
# stereo: music/ambience widened slightly, VO & bass centred
L=amb*1.0+music*1.0+vo+sfx; R=L.copy()
hs=np.roll(amb,int(.0006*SR)); L=L-amb+amb*0.95+hs*0.05
st=np.stack([L,R],1)
sf.write(os.path.join(d,'mix_raw.wav'),st,SR)
