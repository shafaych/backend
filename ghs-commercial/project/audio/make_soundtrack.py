"""Original electronic-industrial soundtrack + synthesized Foley for the GHS film. numpy only, deterministic."""
import numpy as np, wave, sys
SR=48000; DUR=24.5; N=int(SR*DUR); rng=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
def tt(d): return np.arange(int(d*SR))/SR
def add(sig,t,pan=0.0,g=1.0):
    i=int(t*SR); 
    if i>=N: return
    s=sig[:N-i]*g; l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    L[i:i+len(s)]+=s*l*1.414; R[i:i+len(s)]+=s*r*1.414
def bp(x,lo,hi):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); m=((f>=lo)&(f<=hi)).astype(float)
    k=int(len(f)*0.0); return np.fft.irfft(X*m,len(x))
def noise(d): return rng.standard_normal(int(d*SR))
def env(d,a,r,pw=2):
    t=tt(d); e=np.minimum(t/max(a,1e-4),1)*np.exp(-t/r*pw); return e
def kick(g=1): 
    t=tt(.45); f=48+90*np.exp(-t*28); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*7)*g
def hat(g=1,open_=False):
    d=.25 if open_ else .06; return bp(noise(d),6500,16000)*np.exp(-tt(d)/(0.07 if open_ else 0.015))*g
def clap(g=1):
    d=.3; n=bp(noise(d),900,4200); t=tt(d); e=np.exp(-t*18)+0.6*np.exp(-((t-.012)*200)**2)+0.5*np.exp(-((t-.024)*200)**2); return n*e*g
def boom(g=1,d=2.2):
    t=tt(d); f=36+60*np.exp(-t*9); return (np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.6)+0.25*bp(noise(d),40,220)*np.exp(-t*5))*g
def pluck(freq,d=1.8,g=1.0,bright=1.0):
    t=tt(d); s=sum(np.sin(2*np.pi*freq*k*t)/k**1.4*np.exp(-t*(2+k*1.5)) for k in range(1,7)); return s*(1-np.exp(-t*400))*g
def pad(freqs,d,g=1.0):
    t=tt(d); s=np.zeros_like(t)
    for f in freqs:
        for det in (-0.004,0,0.004): s+=np.sin(2*np.pi*f*(1+det)*t+rng.uniform(0,6))+0.3*np.sin(2*np.pi*2*f*(1+det)*t)
    a=np.minimum(t/1.2,1)*np.minimum((d-t)/1.5,1); return s*a*g/ (len(freqs)*3)
def riser(d,g=1.0):
    t=tt(d); n=noise(d); X=np.fft.rfft(n); f=np.fft.rfftfreq(len(n),1/SR)
    out=np.zeros_like(t); 
    # sweep band-pass centre upward in 8 chunks
    seg=len(t)//16
    for i in range(16):
        c=300*(1.35**i); a=bp(n[i*seg:(i+1)*seg+1] if i<15 else n[i*seg:],c*.7,c*1.4); out[i*seg:i*seg+len(a)]=a
    return out*(t/d)**2*g
def swish(d,lo,hi,g=1.0,pk=.5):
    t=tt(d); e=np.sin(np.pi*np.clip(t/d,0,1))**2*np.exp(-0*t); return bp(noise(d),lo,hi)*e*g
BEAT=.5
# --- bed: sub drone, slowly breathing ---
t=tt(DUR); drone=np.sin(2*np.pi*55*t)*0.5+np.sin(2*np.pi*82.4*t)*0.18
drone*=np.minimum(t/2,1)*np.minimum((DUR-t)/1.2,1)*(0.55+0.45*np.sin(2*np.pi*t/8)**2)
add(drone,0,0,.22)
# --- 01 digital pulse 0.3-2.5 ---
for i,tm in enumerate(np.arange(.3,2.4,.25)):
    f=[880,1320,1760,1320][i%4]; s=np.sin(2*np.pi*f*tt(.12))*np.exp(-tt(.12)*30); add(s,tm,-.5+.25*(i%4),.10+.012*i)
    add(s,tm+.18,.4,.04)
add(pad([110,164.8,220],2.6),0,0,.18)
# whoosh into hit (pan 1.9-2.4)
add(riser(1.0,1),1.5,0,.16); add(swish(.6,800,6000,1),1.85,-.3,.25)
# --- 02 hit + printer ---
add(boom(1),2.5,0,.95); add(clap(1),2.5,0,.20)
printer=np.zeros(int(2.6*SR)); t2=tt(2.6)
motor=0.25*np.sin(2*np.pi*95*t2)+0.12*np.sin(2*np.pi*190*t2)+0.08*bp(noise(2.6),300,900)
carr=np.abs(np.sin(2*np.pi*t2/1.15))  # carriage back-and-forth swell
printer=motor*(0.4+0.6*carr)+0.35*bp(noise(2.6),1500,5200)*carr**2
add(printer*np.minimum(t2/.2,1)*np.minimum((2.6-t2)/.3,1),2.5,0,.30)
for i in range(int(2.6/.0625)):  # printhead ticks
    if i%2==0: add(bp(noise(.01),2500,9000)*np.exp(-tt(.01)/.002),2.5+i*.0625,.3*(-1)**(i//4),.05)
for b in range(5): add(kick(),2.5+b*BEAT*1.0,0,.55) if b>=1 else None
# --- 03 material 5.1-9.1 ---
for k,(tm,lo,hi) in enumerate([(5.15,500,3500),(5.9,300,2500),(6.7,400,3000),(7.35,300,2200)]):
    add(swish(.55,lo,hi,1),tm,-.4+.3*k,.32)
for i in range(16): add(kick(),5.1+i*BEAT,0,.5*min(1,.4+i*.1))
for i in range(32): add(hat(), 5.1+i*.25+.125,.35,.14)
add(pad([110,138.6,164.8],4.2),5.0,0,.2)
add(boom(.5,1.2),5.1,0,.5); add(swish(.4,200,1800,1),7.75,0,.25)
# --- 04 craft: sewing rhythm 9.1-12.98 ---
t4=tt(3.9)
for i in range(int(3.9*16)):  # machine ~16 stitches/s with 4-beat accent shaping
    tm=9.1+i/16.0
    add(bp(noise(.02),1200,6500)*np.exp(-tt(.02)/.004), tm, .25*np.sin(i*.7), .17 if i%4 else .26)
    add(np.sin(2*np.pi*140*tt(.03))*np.exp(-tt(.03)/.006), tm, 0, .08)
add(0.5*bp(noise(3.9),200,700)*np.minimum(t4/.3,1)*np.minimum((3.9-t4)/.4,1),9.1,0,.09)  # motor bed
for i in range(8): add(kick(),9.1+i*BEAT,0,.62)
for i in range(16): add(hat(.9,i%4==3),9.1+i*.25+.125,.4,.20)
for m in (10.1,11.1,12.1): add(clap(),m,0,.28)
bass=[55,55,82.4,55,73.4,55,82.4,98]
for i in range(16):
    f=bass[i%8]; d=.22; s=np.sin(2*np.pi*f*tt(d))*np.exp(-tt(d)*7)+0.3*np.sin(2*np.pi*2*f*tt(d))*np.exp(-tt(d)*12); add(s,9.1+i*.25,0,.30)
add(riser(.98,1),12.0,0,.14)
# --- 05 finishing 12.98-17.88: lower density ---
for i in range(10): add(kick(),12.98+i*BEAT*2*.5*2 if False else 12.98+i*1.0,0,.45)
for k,tm in enumerate([13.0,14.9,15.7,16.2]): add(swish(.5,300,2600,1),tm,(-1)**k*.4,.26)
for i in range(6): add(bp(noise(.35),2500,9000)*np.exp(-tt(.35)/.12)*np.abs(np.sin(tt(.35)*60)),15.6+i*.31,.5*(-1)**i,.07) # plastic/tag rustle
add(pad([110,130.8,164.8,196],4.9),12.9,0,.28)
arp=[220,261.6,329.6,392,329.6,261.6]
for i in range(int(4.8/.25)): add(pluck(arp[i%6]*(2 if i%12>5 else 1),.7,1),13.0+i*.25,-.5+.2*(i%6),.10)
add(riser(1.6,1),16.3,0,.20)
# --- 06 reveal lift 17.88 ---
add(boom(1,2.8),17.88,0,1.0); add(clap(1.2),17.88,0,.28); add(hat(1,True),17.88,.3,.2)
for fs,tm in [([110,164.8,220,277.2,329.6],17.88),([87.3,130.8,174.6,220,261.6],19.2)]: add(pad(fs,2.6),tm-.05,0,.32)
mel=[(659.3,18.1),(880,18.5),(1108.7,18.9),(987.8,19.2),(880,19.5),(1318.5,19.7)]
for f,tm in mel: add(pluck(f,1.4,1),tm,.2,.16); add(pluck(f,1.4,1),tm+.375,-.3,.05)
for i in range(8): add(kick(),17.88+i*BEAT,0,.62)
for i in range(16): add(hat(),17.88+i*.25+.125,.35,.14)
# --- 07 wipe + GHS signature ---
add(swish(.5,500,7000,1),19.6,0,.30)
add(boom(.9,3.5),20.05,0,.75)
for f,tm in [(659.3,20.17),(880,20.47),(1318.5,20.77)]: add(pluck(f,3.0,1),tm,0,.22); add(pluck(f*2,2.5,1),tm,.4,.05)
add(pad([110,164.8,220,329.6],4.2),20.05,0,.3)
# --- master: gentle soft clip + normalise to -1.5 dBFS peak, 0.05s edge fades ---
M=np.stack([L,R]); M=np.tanh(M*0.9)/np.tanh(.9)
M*=np.minimum(np.arange(N)/(SR*.05),1)*np.minimum((N-np.arange(N))/(SR*.9),1)
M*= (10**(-1.5/20))/np.max(np.abs(M))
pcm=(M.T*32767).astype('<i2')
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print('peak',np.max(np.abs(M)),'rms dB',20*np.log10(np.sqrt(np.mean(M**2))))
