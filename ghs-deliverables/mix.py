import numpy as np, subprocess, re, soundfile as sf
from scipy import signal
SR=48000; DUR=38.0; N=int(SR*DUR); rng=np.random.default_rng(7)
def t(n): return np.arange(n)/SR
def place(buf, x, at):
    i=int(at*SR); 
    if i<0: x=x[-i:]; i=0
    e=min(N,i+len(x)); 
    if e>i: buf[i:e]+=x[:e-i]
def fade(x,a,b):
    x=x.copy(); a=int(a*SR); b=int(b*SR)
    if a: x[:a]*=np.linspace(0,1,a)[:,None] if x.ndim==2 else np.linspace(0,1,a)
    if b: x[-b:]*=np.linspace(1,0,b)[:,None] if x.ndim==2 else np.linspace(1,0,b)
    return x
def db(x): return 10**(x/20)
def rms_db(x): return 20*np.log10(np.sqrt((x**2).mean())+1e-9)
def hp(x,f,sr=SR): return signal.sosfilt(signal.butter(2,f,'hp',fs=sr,output='sos'),x,axis=0)
def lp(x,f): return signal.sosfilt(signal.butter(2,f,'lp',fs=SR,output='sos'),x,axis=0)
def bp(x,a,b): return signal.sosfilt(signal.butter(2,[a,b],'bp',fs=SR,output='sos'),x,axis=0)

# ---------- source (real factory) audio, per shot with J/L overlap ----------
import re as _re
shots=[(m.group(1),float(m.group(2)),float(m.group(3)),float(m.group(4))) for m in _re.finditer(r"src: '(\w+)\.mp4', in: ([\d.]+), at: ([\d.]+), dur: ([\d.]+)", open('../remotion/src/shots.ts').read())]
src=np.zeros((N,2))
for name,i_,at,d in shots:
    pad=0.12
    raw=subprocess.run(['ffmpeg','-v','error','-ss',str(max(0,i_-pad)),'-t',str(d+2*pad),'-i',f'../src_media/{name}.mp4','-vn','-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    x=np.frombuffer(raw,dtype=np.float32).reshape(-1,2).astype(float)
    x=hp(x,90)
    r=rms_db(x); target=-22 if name in('sewing','purple') else -30
    g=min(target-r,18 if name not in('sewing','purple') else 6)
    x=x*db(g); 
    if name not in('sewing','purple'): x=lp(x,7000)
    x=fade(x,0.1,0.14); place(src,x,at-pad)
# ---------- music ----------
mus=np.zeros((N,2)); BPM=120; beat=60/BPM
def kick(vol=1):
    n=int(.38*SR); tt=t(n); f=45+90*np.exp(-tt*28); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-tt*9)*vol
def clap():
    n=int(.22*SR); return bp(rng.standard_normal(n),1200,6000)*np.exp(-t(n)*22)*.5
def hat(v=.2,l=.05):
    n=int(l*SR); return hp(rng.standard_normal(n),7000)*np.exp(-t(n)*70)*v
def tick(v=.3):  # mechanical needle-like click
    n=int(.03*SR); return bp(rng.standard_normal(n),1800,5200)*np.exp(-t(n)*160)*v
def bass(f,l,v=.5):
    n=int(l*SR); tt=t(n); x=signal.sawtooth(2*np.pi*f*tt)*.6+np.sin(2*np.pi*f*tt)
    return lp(x,380)*np.minimum(1,tt*80)*np.exp(-tt*5)*v
def pad(f,l,v=.12):
    n=int(l*SR); tt=t(n); x=sum(np.sin(2*np.pi*f*k*tt+k)+np.sin(2*np.pi*f*1.005*k*tt) for k in (1,2))
    return lp(x,1400)*v*np.minimum(1,tt/1.2)*np.minimum(1,(l-tt)/1.0)
def st(x,pan=0): return np.stack([x*(1-max(pan,0)),x*(1+min(pan,0))],1)
nb=int(DUR/beat)
bline=[55,55,65.41,49]  # A, A, C, G root pattern per bar
for b in range(nb):
    tb=b*beat; bar=b//4
    if tb<4:  # subtle mechanical rhythm
        for s in range(4): place(mus,st(tick(.16+.04*(s%2==0))),tb+s*beat/4)
        if b%4==0: place(mus,st(kick(.28)),tb)
    elif tb<32:
        lvl=0.45 if tb<10 else 0.6 if tb<25 else 0.7
        place(mus,st(kick(lvl)),tb)
        place(mus,st(hat(.14)),tb+beat/2)
        if tb>=7: 
            for s in (0,2,3): place(mus,st(tick(.1)),tb+s*beat/4)
        if tb>=10 and b%2==1: place(mus,st(clap()*.55),tb)
        if tb>=7: place(mus,st(bass(bline[(bar)%4],beat*.9,.34 if tb<17 else .42)),tb)
        if tb>=7: place(mus,st(bass(bline[(bar)%4]*2,beat*.4,.18)),tb+beat/2)
        if tb>=17 and b%4==0: place(mus,st(pad([220,261.6,196,196][bar%4],beat*4,.1)),tb)
    else:
        if b%2==0 and tb>=32.0: place(mus,st(kick(.35)),tb)
        if b%4==0 and tb>=32.0: place(mus,st(pad([220,261.6,196,220][(bar)%4],beat*4,.09)),tb)
# ---------- SFX ----------
sfx=np.zeros((N,2))
def whoosh(l=.38,v=.30,up=True):
    n=int(l*SR); tt=t(n); x=rng.standard_normal(n); out=np.zeros(n); 
    fc=np.geomspace(500,6000,n) if up else np.geomspace(6000,500,n)
    # time-varying lowpass via blocks
    blk=512
    for i in range(0,n,blk):
        f=min(fc[i],20000); sos=signal.butter(2,[max(200,f*.4),min(f*1.4,22000)],'bp',fs=SR,output='sos'); out[i:i+blk]=signal.sosfilt(sos,x[i:i+blk])
    env=np.sin(np.pi*np.clip(tt/l,0,1))**2
    return out*env*v*3
def impact(v=.9,l=1.2):
    n=int(l*SR); tt=t(n); f=38+60*np.exp(-tt*14); x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*3.2)
    x+=lp(rng.standard_normal(n),400)*np.exp(-tt*10)*.35
    return x*v
text_starts=[0.17,2.1,2.3,4.17,7.2,10.2,10.4,17.13,20.7,25.17,28.6]
for s in text_starts: place(sfx,st(whoosh(.34,.16,True)),s-0.02)
for s in (4.0,10.0,17.0,25.0): place(sfx,st(whoosh(.3,.22,False)),s-.22); place(sfx,st(impact(.45,.8)),s)
# riser into brand reveal + restrained impact
n=int(1.0*SR); rs=hp(rng.standard_normal(n),1500)*np.linspace(0,1,n)**2*.18; place(sfx,st(rs),31.0)
place(sfx,st(impact(.85,2.2)),32.0)
place(sfx,st(whoosh(.5,.2,True)),32.45)
place(sfx,st(tick(.5)),33.9); 
# ---------- VO ----------
vo=np.zeros((N,2)); vo_at=[0.45,4.35,10.4,17.3,25.3,32.5]
for i,a in enumerate(vo_at):
    x,sr=sf.read(f'vo_{i}.wav'); x=signal.resample_poly(x,SR,sr); x=hp(x,85)
    x=x/np.max(np.abs(x))*.9
    # gentle compression: soft knee via tanh
    x=np.tanh(x*1.6)/np.tanh(1.6)*.9
    x=fade(x,.01,.04); place(vo,np.stack([x,x],1),a)
env=np.abs(vo).max(1); env=signal.sosfiltfilt(signal.butter(2,4,'lp',fs=SR,output='sos'),env); env=np.clip(env/ (env.max()*.35),0,1)
duck_m=1-.55*env; duck_s=1-.5*env
mixd=vo*1.0 + mus[:, :]*db(-9)*duck_m[:,None] + src*db(-3)*duck_s[:,None]*1.0 + sfx*db(-6)
# music rises slightly in final hold, fade all out at end
mixd*=np.interp(t(N),[0,.05,37.0,38.0],[0,1,1,0])[:,None]
sf.write('mix_pre.wav',mixd/np.max(np.abs(mixd))*.8,SR)
print('pre peak done', rms_db(mixd))
