# Procedural sound design + music (all synthesized here, original, no third-party samples) and VO mix.
import numpy as np, soundfile as sf, os
SR=48000; D=20; N=SR*D; rng=np.random.default_rng(7)
t=np.arange(N)/SR
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0.0
    # vectorised one-pole via scipy-free loop in chunks
    import scipy.signal as ss
    return ss.lfilter([1-a],[1,-a],x)
def bp(x,lo,hi):
    import scipy.signal as ss
    b,a=ss.butter(2,[lo/(SR/2),hi/(SR/2)],'band'); return ss.lfilter(b,a,x)
def env(t0,a,d,length=None):
    e=np.zeros(N); i0=int(t0*SR); n=int((a+d*4)*SR); n=min(n,N-i0)
    tt=np.arange(n)/SR; e[i0:i0+n]=np.where(tt<a,tt/a,np.exp(-(tt-a)/d)); return e
def gate(t0,t1,fi=0.5,fo=0.5):
    return np.clip((t-t0)/fi,0,1)*np.clip((t1-t)/fo,0,1)
def noise(): return rng.standard_normal(N)
L=np.zeros(N); R=np.zeros(N)
def add(x,pan=0.0,g=1.0):
    global L,R; L+=x*g*(1-np.maximum(pan,0)); R+=x*g*(1+np.minimum(pan,0))
# --- ambience
rumble=lp(noise(),70)*14*(0.6+0.4*np.sin(2*np.pi*0.23*t))
add(rumble,0,0.5*gate(0,13.2,0.1,1.2))              # subway rumble
traffic=lp(noise(),420)*2.2*(0.7+0.3*np.sin(2*np.pi*0.11*t))
add(traffic,0,0.22*(gate(0,4,0.1,2)+gate(13,20,2.5,2.5)))   # distant traffic -> street
hush=bp(noise(),2000,6000)*0.5
add(hush,0,0.02*gate(0,17,0.1,1))
# street life 13-20: soft wind + distant hum
street=bp(noise(),180,900)*1.6
add(street,0.2,0.16*gate(13.2,19.5,1.5,2))
# --- footsteps
def step(t0,pan=0,g=1.0,wet=0.5,pitch=1.0):
    th=env(t0,0.002,0.045)*bp(noise(),300*pitch,2500*pitch)*3
    body=env(t0,0.003,0.06)*np.sin(2*np.pi*(90*pitch)*(t-t0).clip(0))*1.2
    tail=env(t0+0.01,0.01,0.18)*bp(noise(),800,3500)*0.5*wet
    add(th+body+tail,pan,0.5*g)
for i,s in enumerate(np.arange(0.35,2.9,0.40)): step(s,0.12*(-1)**i,0.9,0.9)     # stairs, reverby
for i,s in enumerate(np.arange(6.0,6.0)): pass
step(13.05,0,1.0,0.3,0.9); step(13.62,-0.1,1.1,0.2)                            # match cut: train floor -> street
for i,s in enumerate(np.arange(13.62,17.0,0.52)): step(s,0.1*(-1)**i,1.0,0.35,0.85)
step(12.45,0,0.8,0.5); step(12.95,0,0.8,0.5)
# --- fabric + snap
for t0,du,g in [(3.05,0.5,0.5),(3.7,0.35,0.4),(4.55,0.6,0.35),(11.1,0.5,0.25),(12.3,0.5,0.3),(13.7,3,0.12)]:
    add(bp(noise(),1500,7000)*gate(t0,t0+du,du*0.4,du*0.5)*(0.6+0.4*np.sin(2*np.pi*3.1*t)),0,0.06*g/0.3*0.3)
snap_t=4.35
sn=env(snap_t,0.0008,0.012)*bp(noise(),2500,9000)*4+env(snap_t,0.0005,0.05)*np.sin(2*np.pi*2300*(t-snap_t).clip(0))*0.8+env(snap_t+0.045,0.0005,0.03)*np.sin(2*np.pi*3100*(t-snap_t).clip(0))*0.5
add(sn,0.15,0.5)
# --- train pass 6.2-9.4 (doppler-ish sweep + wheel clack), stop 9.6-11.4, doors 12.0
g_pass=np.sin(np.pi*np.clip((t-6.2)/3.2,0,1))**1.5*(t>6.2)*(t<9.4)
roar=lp(noise(),900)*g_pass*3
f=np.interp(t,[6.2,9.4],[260,150]); ph=np.cumsum(f)/SR
whine=np.sin(2*np.pi*ph)*0.15*g_pass
clack=(np.sin(2*np.pi*14*t*np.interp(t,[6.2,9.4],[1.2,0.8]))>0.97)*1.0
clack=lp(clack*rng.standard_normal(N),1500)*g_pass*25
add(roar+whine+clack,np.interp(t,[6.2,9.4],[-0.7,0.7]),0.5)
gs=np.interp(t,[9.4,10.0,11.4,11.8],[0,1,0.5,0])
sq=bp(noise(),2800,3600)*gs*0.6*np.sin(np.pi*np.clip((t-9.6)/1.6,0,1))
add(lp(noise(),500)*gs*2.2+sq,0.2,0.4)
# brake hiss + doors
add(bp(noise(),3000,9000)*env(11.7,0.05,0.5)*1.2,0.2,0.18)
for k,t0 in enumerate([11.95,12.3]):   # soft two-tone door chime
    for fr in (880,660): add(env(t0+0.0,0.005,0.35)*np.sin(2*np.pi*fr*(t-t0).clip(0))*0.12,0,0.5)
add(bp(noise(),1200,5000)*env(12.45,0.15,0.5)*1.0,0,0.2)   # door slide
# --- breath at ~11.3
add(bp(noise(),500,2500)*gate(11.0,11.7,0.35,0.35)*0.8,0,0.1)
# --- music: restrained pad + soft pulse, enters 6.0, opens at 13.2
def pad(freqs,t0,t1,g):
    x=np.zeros(N)
    for f0 in freqs:
        for det in (-0.004,0,0.004):
            x+=np.sin(2*np.pi*f0*(1+det)*t+rng.uniform(0,6))+0.3*np.sin(2*np.pi*2*f0*(1+det)*t)
    return x*gate(t0,t1,1.6,1.8)*g
ch=[([110,164.8,220,261.6],6.0,10.0),([87.3,130.8,174.6,220],8.5,12.0),([130.8,196,261.6,329.6],13.0,16.0),([98,146.8,196,246.9],14.8,17.9),([110,164.8,220,329.6],16.8,20.0)]
mus=sum(pad(f,a,b,0.016) for f,a,b in ch)
k=np.clip((t-13)/3,0,1); mus=lp(mus,1400)*(1-k)+lp(mus,3200)*k
pulse=sum(env(s,0.01,0.28)*np.sin(2*np.pi*55*(t-s).clip(0)) for s in np.arange(6.0,13.0,1.5))*0.35
pulse+=sum(env(s,0.01,0.28)*np.sin(2*np.pi*55*(t-s).clip(0)) for s in np.arange(13.0,17.5,1.5))*0.3
arp=np.zeros(N)
for i,s in enumerate(np.arange(13.4,18.0,0.75)):
    fr=[329.6,392,440,523.2][i%4]; arp+=env(s,0.005,0.5)*np.sin(2*np.pi*fr*(t-s).clip(0))*0.035
mus=(mus+pulse+arp)*np.clip((t-0)/1,0,1)*np.clip((20-t)/1.2,0,1)
# reverb-ish smear
import scipy.signal as ss
ir=(rng.standard_normal(int(1.6*SR))*np.exp(-np.arange(int(1.6*SR))/(0.45*SR)))*0.05
wet=ss.fftconvolve(mus,ir)[:N]
add(mus+0.8*wet,0,0.75)
# --- VO with ducking
vo=np.zeros(N)
for name,t0 in [("vo1",3.55),("vo2",10.25),("vo3",17.35)]:
    x,sr=sf.read(f"public/audio/{name}.wav"); assert sr==SR or True
    if sr!=SR: x=ss.resample_poly(x,SR,sr)
    i0=int(t0*SR); vo[i0:i0+len(x)]+=x[:N-i0]
vo=vo/np.max(np.abs(vo))*0.75
b,a=ss.butter(2,90/(SR/2),'high'); vo=ss.lfilter(b,a,vo)
vo_wet=ss.fftconvolve(vo,ir*0.5)[:N]
duck=lp(np.abs(vo)*1.0,6); duck=1-0.45*np.clip(duck*8,0,1)
bed_L,bed_R=L*duck,R*duck
mixL=bed_L+vo+0.25*vo_wet; mixR=bed_R+vo+0.25*vo_wet
m=np.stack([mixL,mixR],1)
m=np.tanh(m*0.95)                       # soft limiter
m=m/np.max(np.abs(m))*0.5
m*=np.clip((20-t)/0.6,0,1)[:,None]
sf.write("public/audio/mix.wav",m.astype(np.float32),SR); print("ok",np.sqrt((m**2).mean()))
