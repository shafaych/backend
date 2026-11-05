import numpy as np, wave
SR=48000; D=22.0; N=int(SR*D)
rs=np.random.RandomState(3)
t=np.arange(N)/SR
L=np.zeros(N); R=np.zeros(N)
def add(sig,at,pan=0.0,g=1.0):
    i=int(at*SR); n=min(len(sig),N-i)
    if n<=0: return
    l=np.sqrt(0.5*(1-pan)); r=np.sqrt(0.5*(1+pan))
    L[i:i+n]+=sig[:n]*g*l; R[i:i+n]+=sig[:n]*g*r
def P(a,b):
    n=max(len(a),len(b)); o=np.zeros(n); o[:len(a)]+=a; o[:len(b)]+=b; return o
def tt(d): return np.arange(int(d*SR))/SR
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0.0
    # vectorised one-pole via lfilter-free approach
    from scipy.signal import lfilter
    return lfilter([1-a],[1,-a],x)
def hp(x,fc): return x-lp(x,fc)
def bp(x,lo,hi): return lp(hp(x,lo),hi)
def noise(d): return rs.randn(int(d*SR))
def env(d,a,r,pw=2.0):
    x=tt(d); e=np.minimum(x/max(a,1e-4),1)*np.clip(1-(x-a)/max(d-a,1e-4),0,1)**pw; return e
def sub(d,f0,f1,dec):
    x=tt(d); f=f1+(f0-f1)*np.exp(-x*9); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-x/dec)
def saw(f,d):
    x=tt(d); return 2*((x*f)%1)-1
def reverb(x,rt=2.2):
    n=int(rt*SR); ir=rs.randn(n)*np.exp(-np.arange(n)/SR*3.2/rt*2); ir=lp(ir,5000)
    from scipy.signal import fftconvolve
    return fftconvolve(x,ir)[:len(x)]*0.02
# ---- 0-1.2 stadium ambience (crowd + light buzz)
d=1.25
crowd=bp(noise(d),200,2500)*0.18*(0.6+0.4*np.sin(tt(d)*7))
buzz=(np.sin(2*np.pi*100*tt(d))+0.5*np.sin(2*np.pi*200*tt(d)))*0.05
amb=(crowd+buzz)*np.minimum(tt(d)/0.3,1)
amb[int((d-0.05)*SR):]*=np.linspace(1,0,len(amb)-int((d-0.05)*SR))
add(amb,0,-0.1)
add(bp(noise(d),300,3000)*0.12*np.minimum(tt(d)/0.4,1),0,0.2)
# whoosh dive 0-1.2
w=bp(noise(1.2),150,3000)*np.linspace(0.05,0.5,int(1.2*SR))**2; add(w,0,0,0.7)
# switches clunks
for k,at in enumerate([1.10,1.16,1.19]):
    c=bp(noise(0.08),80,1500)*env(0.08,0.002,0,3); add(c,at,-0.5+k*0.5,0.5)
# ---- 1.2 blackout impact
imp=P(sub(2.2,75,36,0.7)*0.9,bp(noise(0.5),30,400)*env(0.5,0.002,0,3)*0.6)
add(imp,1.2,0,1.1)
add(reverb(imp[:int(1.2*SR)].copy(),2.5)*8,1.2,0,0.6)
# room tone after blackout
rt=lp(noise(20.8),180)*0.05; add(rt,1.25,0,1.0)
# ---- 2-5 tension: drone, electrical hum, riser
d=3.4
x=tt(d); dr=(np.sin(2*np.pi*55*x)+0.5*np.sin(2*np.pi*110.7*x))*0.18*np.minimum(x/1.0,1)
add(dr,1.9,0,1)
el=np.sin(2*np.pi*120*x)*0.5+np.sin(2*np.pi*360*x)*0.25
el*=(0.04+0.12*np.minimum(x/3,1))*(0.7+0.3*np.sign(np.sin(2*np.pi*13*x)))
add(el,2.0,0.3,1)
for at in np.sort(rs.uniform(2.1,4.9,28)):   # electrical crackle
    c=hp(noise(0.012),3000)*env(0.012,0.001,0,2)*rs.uniform(0.15,0.5); add(c,at,rs.uniform(-1,1),1)
rz=noise(3.0); fr=np.linspace(300,5000,len(rz))
ris=bp(rz,400,3000)*np.linspace(0,1,len(rz))**2.5*0.35; add(ris,2.0,0,1)
ps=saw(110,3.0)*np.linspace(0,1,int(3*SR))**2*0.07; add(lp(ps,np.linspace(300,2400,1)[0]+600),2.0,0,1)
# ---- 5-9 fabric: massive swishes
for at,pan,dd in [(5.0,-0.5,1.3),(5.9,0.6,1.5),(6.8,-0.4,1.4),(7.6,0.5,1.4),(8.3,0,1.3)]:
    n=noise(dd); e=np.sin(np.pi*np.linspace(0,1,len(n)))**1.8
    sw=bp(n,300,1200)*e*0.5+bp(noise(dd),1800,7000)*e*0.22
    sw*=1+0.4*np.sin(tt(dd)*40)   # cloth flutter
    add(sw,at,pan,1)
    add(sub(dd,45,38,0.6)*e*0.25,at,0,1)
add(bp(noise(4),500,6000)*np.linspace(0,1,4*SR)**2*0.18,5.0,0,1)
# whooshy riser tone
x=tt(4.2); f=200*2**(np.linspace(0,2.2,len(x))); ph=2*np.pi*np.cumsum(f)/SR
add(np.sin(ph)*np.linspace(0,1,len(x))**2*0.08,5.0,0,1)
# ---- 9-13 assembly: stitch ticks accelerating, riser
tk=9.0; gap=0.28
while tk<12.9:
    c=hp(noise(0.02),2500)*env(0.02,0.001,0,3); add(c,tk,np.sin(tk*5)*0.7,0.35)
    add(sub(0.1,160,120,0.04)*0.18,tk,0,1)
    gap=max(0.05,gap*0.93); tk+=gap
x=tt(4.0); f=80*2**(np.linspace(0,3.2,len(x))); ph=2*np.pi*np.cumsum(f)/SR
add(np.sin(ph)*np.linspace(0,1,len(x))**2*0.13,9.0,0,1)
add(lp(saw(55,4.0),1500)*np.linspace(0,1,4*SR)**2*0.1,9.0,0,1)
add(bp(noise(4),800,9000)*np.linspace(0,1,4*SR)**3*0.22,9.0,0,1)
# silence gasp before the hit
for ch in (L,R):
    a=int(12.82*SR); b=int(13.0*SR); ch[a:b]*=np.linspace(1,0.15,b-a)
# ---- 13.0 deep transformation impact + payoff
imp=P(sub(3.0,90,32,1.1)*1.0,bp(noise(1.0),40,900)*env(1.0,0.002,0,3)*0.7)
add(imp,13.0,0,1.15)
add(reverb(imp[:int(2*SR)].copy(),3.0)*10,13.0,0,0.7)
add(hp(noise(1.2),2000)*env(1.2,0.003,0,2.5)*0.2,13.0,0,1)
chord=[110,164.8,220,261.6,329.6]
def pad(f,d,det=0.004):
    x=tt(d); s=saw(f*(1+det),d)+saw(f*(1-det),d)+0.5*np.sin(2*np.pi*f*x)
    return lp(s,2200)*np.minimum(x/0.8,1)*np.clip((d-x)/1.2,0,1)
for i,f in enumerate(chord):
    p=pad(f,7.0); add(p*0.07,13.0,-0.5+i*0.25,1)
# 17-20 progression
for f in [98,146.8,196,246.9,293.7]:
    p=pad(f,3.6); add(p*0.05,17.0,0,1)
for f in [87.3,130.8,174.6,220,261.6]:
    p=pad(f,2.4); add(p*0.04,20.0,0,1)
# arpeggio pulses 13-17 (120bpm 16ths)
seq=[220,329.6,440,329.6,261.6,392,523.3,392]
n=0; at=13.4
while at<17.0:
    f=seq[n%8]; d=0.35; x=tt(d)
    pl=(np.sin(2*np.pi*f*x)+0.4*np.sin(2*np.pi*2*f*x+np.sin(2*np.pi*f*x)))*np.exp(-x*9)
    add(pl*0.12,at,((n%5)-2)*0.3,1); n+=1; at+=0.125
# bass pulse
at=13.0
while at<17.0:
    add(sub(0.4,55,50,0.2)*0.35,at,0,1); at+=0.5
# floodlight activation: clunk + hum surge
for i in range(4):
    T=13.45+0.7*i
    add(P(sub(0.3,140,60,0.08)*0.5,bp(noise(0.12),100,2000)*env(0.12,0.002,0,3)*0.5),T,[-0.8,0.8,-0.8,0.8][i],1)
    x=tt(1.4); f=60+40*np.minimum(x/0.8,1)
    add(np.sin(2*np.pi*np.cumsum(f)/SR)*np.minimum(x/0.3,1)*np.exp(-x*1.2)*0.12,T,0,1)
    add(hp(noise(0.5),4000)*np.exp(-tt(0.5)*10)*0.08,T+0.05,[-0.8,0.8,-0.8,0.8][i],1)
# 17-20 gentle riser + sustained shimmer
add(bp(noise(2.9),2000,9000)*np.linspace(0,1,int(2.9*SR))**2*0.08,17.0,0,1)
add(sub(3.0,55,55,5)*0.2,17.0,0,1)
# ---- 20 sonic logo
def bell(f,d):
    x=tt(d); m=np.sin(2*np.pi*f*2.01*x)*3*np.exp(-x*5)
    return np.sin(2*np.pi*f*x+m)*np.exp(-x*2.2)
add(sub(2.0,70,45,0.6)*0.8,20.0,0,1)
add(bell(659.3,2.0)*0.3,20.0,-0.2,1)
add(bell(987.8,1.9)*0.28,20.25,0.25,1)
add(bell(1318.5,1.7)*0.2,20.5,0,1)
add(reverb(bell(987.8,1.5)*0.5,2.0)*6,20.25,0,1)
# ---- master
m=np.stack([L,R],1)
# soft clip + fades
m=np.tanh(m*1.1)
pk=np.abs(m).max(); m=m/pk*0.89
m[:int(0.02*SR)]*=np.linspace(0,1,int(0.02*SR))[:,None]
m[-int(0.35*SR):]*=np.linspace(1,0,int(0.35*SR))[:,None]
pcm=(m*32767).astype('<i2')
with wave.open('audio/ghs_audio.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok',pk, len(m)/SR)
