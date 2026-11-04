import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import {C, FPS, SHOTS, shotLen, shotStarts, VIDEO_END} from './timeline';

const F = (s:number)=>Math.round(s*FPS);
const ease = Easing.bezier(0.16,1,0.3,1);
const clamp = {extrapolateLeft:'clamp', extrapolateRight:'clamp'} as const;
const font = 'Inter, "Helvetica Neue", Arial, sans-serif';

const ShotView: React.FC<{i:number}> = ({i}) => {
  const s = SHOTS[i]; const f = useCurrentFrame(); const len = F(shotLen(s));
  const k = interpolate(f,[0,len],[0,1],{...clamp, easing:Easing.inOut(Easing.sin)});
  const z = s.z0 + (s.z1-s.z0)*k;
  return (
    <AbsoluteFill style={{overflow:'hidden', background:C.carbon}}>
      <OffthreadVideo src={staticFile('source_1080.mp4')} startFrom={F(s.src)} playbackRate={s.rate} muted
        style={{width:1080,height:1920,transform:`scale(${z})`,transformOrigin:`${s.ox*100}% ${s.oy*100}%`}} />
    </AbsoluteFill>
  );
};

// Editorial caption: masked slide-up + hairline, sits above social UI safe zone.
const Caption: React.FC<{t0:number;t1:number;idx:string;text:string}> = ({t0,t1,idx,text}) => {
  const f = useCurrentFrame();
  const a = F(t0), b = F(t1);
  if (f<a || f>b) return null;
  const inP = interpolate(f,[a,a+16],[0,1],{...clamp,easing:ease});
  const outP = interpolate(f,[b-10,b],[1,0],clamp);
  return (
    <div style={{position:'absolute',left:72,bottom:330,opacity:outP,fontFamily:font,color:C.porcelain}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18,opacity:inP}}>
        <div style={{width:10,height:10,background:C.lime}}/>
        <div style={{fontSize:22,fontWeight:600,letterSpacing:'0.22em'}}>{idx}</div>
        <div style={{height:2,width:interpolate(inP,[0,1],[0,120]),background:'rgba(245,245,240,.7)'}}/>
      </div>
      <div style={{overflow:'hidden',paddingBottom:6}}>
        <div style={{fontSize:50,fontWeight:700,letterSpacing:'0.03em',lineHeight:1.1,transform:`translateY(${(1-inP)*110}%)`,textShadow:'0 2px 24px rgba(0,0,0,.45)'}}>{text}</div>
      </div>
    </div>
  );
};

// Blue thread: thin hairline in the jersey's printed blue. d = path, draws between t0..t1, fades by t2.
const Thread: React.FC<{d:string;t0:number;t1:number;t2:number;dash?:string;w?:number}> = ({d,t0,t1,t2,dash,w=4}) => {
  const f = useCurrentFrame();
  if (f<F(t0)||f>F(t2)) return null;
  const p = interpolate(f,[F(t0),F(t1)],[0,1],{...clamp,easing:Easing.inOut(Easing.cubic)});
  const o = interpolate(f,[F(t1),F(t2)],[1,0],clamp);
  return (
    <svg width={1080} height={1920} style={{position:'absolute',inset:0,opacity:o}}>
      <path d={d} pathLength={1} fill="none" stroke={C.thread} strokeWidth={w} strokeLinecap="round"
        strokeDasharray={dash ?? '1'} strokeDashoffset={dash?0:1-p}
        style={dash?{clipPath:`inset(0 ${(1-p)*100}% 0 0)`}:undefined} />
    </svg>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const p = (a:number,b:number)=>interpolate(f,[a,b],[0,1],{...clamp,easing:ease});
  const lineP = p(4,30);
  const up = (a:number)=>({opacity:p(a,a+18), transform:`translateY(${(1-p(a,a+18))*22}px)`});
  return (
    <AbsoluteFill style={{background:`radial-gradient(120% 70% at 50% 40%, ${C.graphite} 0%, ${C.carbon} 62%)`,fontFamily:font,color:C.porcelain}}>
      <div style={{position:'absolute',left:90,right:90,top:760}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:34,...up(14)}}>
          <div style={{width:12,height:12,background:C.lime}}/>
          <div style={{fontSize:24,fontWeight:600,letterSpacing:'0.26em',color:C.lime}}>GHS</div>
        </div>
        <div style={{fontSize:80,fontWeight:700,letterSpacing:'0.02em',lineHeight:1,whiteSpace:'nowrap',...up(10)}}>GHS CUSTOM GEAR</div>
        <svg width={900} height={12} style={{margin:'36px 0 34px'}}>
          <line x1={0} y1={6} x2={900*lineP} y2={6} stroke={C.thread} strokeWidth={4} strokeLinecap="round"/>
        </svg>
        <div style={{fontSize:27,fontWeight:600,letterSpacing:'0.2em',...up(30),opacity:p(30,48)*.78}}>CUSTOM SPORTSWEAR MANUFACTURING</div>
        <div style={{fontSize:40,fontWeight:500,letterSpacing:'0.04em',marginTop:64,...up(46)}}>YOUR DESIGN. OUR PRODUCTION.</div>
        <div style={{fontSize:34,fontWeight:600,letterSpacing:'0.06em',marginTop:56,color:C.lime,...up(62)}}>ghscustomgear.com</div>
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const endStart = F(VIDEO_END) - 6;
  // diagonal wipe led by a blue thread edge
  const w = interpolate(f,[endStart,endStart+16],[0,1],{...clamp,easing:Easing.inOut(Easing.cubic)});
  const edge = -300 + w*1700; // x of leading edge at mid height
  return (
    <AbsoluteFill style={{background:C.carbon}}>
      {SHOTS.map((s,i)=>(
        <Sequence key={s.id} from={F(shotStarts[i])} durationInFrames={F(shotLen(s))+ (i<SHOTS.length-1?0:12)}>
          <ShotView i={i}/>
        </Sequence>
      ))}
      {/* dip to carbon bridging the real dark gap between printer and fabric */}
      <AbsoluteFill style={{background:C.carbon,opacity:interpolate(f,[F(5.0),F(5.1),F(5.1)+4,F(5.1)+10],[0,1,1,0],clamp),pointerEvents:'none'}}/>
      {/* soft bottom scrim for type legibility + gentle vignette */}
      <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(23,25,23,.18) 0%,rgba(23,25,23,0) 25%,rgba(23,25,23,0) 55%,rgba(23,25,23,.62) 100%)',opacity:f<endStart?1:0}}/>

      <Caption t0={0.5} t1={2.4} idx="01" text="IT STARTS WITH A DESIGN."/>
      <Caption t0={2.8} t1={5.0} idx="02" text="FROM DIGITAL TO FABRIC."/>
      <Caption t0={5.5} t1={7.8} idx="03" text="EVERY DETAIL MATTERS."/>
      <Caption t0={9.2} t1={12.5} idx="04" text="CRAFTED INTO REALITY."/>
      <Caption t0={17.95} t1={19.8} idx="05" text="FROM PIXELS TO PERFORMANCE."/>

      {/* BLUE THREAD SYSTEM */}
      <Thread d="M 40 760 C 300 700, 560 900, 1120 1010" t0={1.55} t1={2.45} t2={2.9}/>            {/* leaves the screen with the pan */}
      <Thread d="M -20 1560 C 300 1530, 700 1590, 1100 1540" t0={3.2} t1={4.6} t2={5.0} w={2}/>     {/* printer travel */}
      <Thread d="M 1100 1500 C 800 1470, 400 1540, 72 1500" t0={7.4} t1={8.3} t2={8.8} w={2}/>      {/* fabric toward stitching */}
      <Thread d="M 72 1500 L 1008 1500" t0={9.3} t1={11.2} t2={12.6} dash="14 12" w={3}/>           {/* stitch line under caption */}
      <Thread d="M 72 1560 C 400 1530, 760 1600, 1008 1520" t0={18.9} t1={19.8} t2={19.95} w={4}/>   {/* resolves into reveal */}

      {/* end-card wipe */}
      {f>=endStart && (
        <Sequence from={endStart}>
          <AbsoluteFill style={{clipPath:`polygon(0 0, ${edge+240}px 0, ${edge-240}px 100%, 0 100%)`}}><EndCard/></AbsoluteFill>
          <svg width={1080} height={1920} style={{position:'absolute',inset:0,opacity:w<1?1:0}}>
            <line x1={edge+240} y1={0} x2={edge-240} y2={1920} stroke={C.thread} strokeWidth={3}/>
          </svg>
        </Sequence>
      )}
      <Audio src={staticFile('soundtrack.wav')} />
    </AbsoluteFill>
  );
};
