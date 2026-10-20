import React from "react";
import {AbsoluteFill} from "remotion";
import {C, FONT_BODY, FONT_HEAD, H, W, clamp, easeInOut, easeOut, lerp, prog, smooth} from "../util";
import {mixHex} from "../Figure";
import {J, Lattice, SEAMS} from "../jersey";
import {LETTERS, SW} from "../Wordmark";
import {StadiumBG} from "./Stadium";
import {KLines} from "../Kinetic";

export const MiniMark: React.FC<{color?: string; accent?: string; sw?: number}> = ({color = C.black, accent = C.lime, sw = SW}) => (
  <g fill="none">
    {LETTERS.map((L) => (
      <g key={L.k} transform={`translate(${L.x} 0)`}>
        <path d={L.d} stroke={color} strokeWidth={sw} />
        {L.bar && <path d={L.bar} stroke={accent} strokeWidth={sw} />}
      </g>
    ))}
  </g>
);

const ShineJersey: React.FC<{f: number; draw: number; fill: number}> = ({f, draw, fill}) => {
  const bars = [J.front, J.sleeveL, J.sleeveR];
  const shine = prog(f, 40, 86);
  return (
    <g>
      <defs>
        <linearGradient id="s6-body" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stopColor="#3a413a" /><stop offset="0.5" stopColor="#252a25" /><stop offset="1" stopColor="#151815" /></linearGradient>
        <clipPath id="s6-clip"><path d={J.front} /><path d={J.sleeveL} /><path d={J.sleeveR} /></clipPath>
        <linearGradient id="s6-shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.28" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <filter id="s6-shadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="26" /></filter>
      </defs>
      <g filter="url(#s6-shadow)" opacity={0.35 * fill} transform="translate(0 34)">
        {bars.map((d, i) => <path key={i} d={d} fill="#000" />)}
      </g>
      <g opacity={fill}>
        <path d={J.sleeveL} fill="url(#s6-body)" /><path d={J.sleeveR} fill="url(#s6-body)" /><path d={J.front} fill="url(#s6-body)" />
        <g clipPath="url(#s6-clip)">
          <Lattice id="s6-lat" opacity={0.1} />
          <path d={J.chevron} fill={C.lime} /><path d={J.insertL} fill={C.lime} /><path d={J.insertR} fill={C.lime} /><path d={J.hem} fill={C.lime} />
          <path d={J.chevron} fill="none" stroke={C.black} strokeWidth={2} strokeDasharray="10 8" opacity={0.5} transform="translate(0 17) scale(1 0.2) translate(0 -60)" />
          <rect x={-420 + shine * 900} y={-300} width={160} height={700} fill="url(#s6-shine)" transform={`skewX(-18) translate(${0} 0)`} />
        </g>
        <path d={J.cuffL} fill={C.lime} /><path d={J.cuffR} fill={C.lime} />
        <path d={J.collarV} fill={C.porcelain} />
        <g fill="none" stroke={C.porcelain} strokeWidth={2} strokeDasharray="9 7" opacity={0.55}>
          {SEAMS.map((s) => <path key={s.k} d={s.d} />)}
        </g>
        <g transform="translate(-92 -150) scale(0.2)"><MiniMark color={C.porcelain} accent={C.lime} sw={34} /></g>
      </g>
      <g fill="none" stroke={C.lime} strokeWidth={3}>
        {bars.map((d, i) => <path key={i} d={d} pathLength={1} strokeDasharray={`${draw} 2`} opacity={1 - fill * 0.6} />)}
      </g>
    </g>
  );
};

export const Scene6: React.FC<{frame: number}> = ({frame}) => {
  const f = frame;
  const flash = clamp(1 - f / 10);
  const draw = easeOut(prog(f, 4, 34));
  const fill = smooth(prog(f, 22, 48));
  const bg = easeInOut(prog(f, 16, 76));
  const toLock = easeInOut(prog(f, 104, 140));
  const jScale = lerp(lerp(0.72, 1.2, easeOut(prog(f, 0, 60))), 0.86, toLock);
  const jy = 520;
  const bob = Math.sin(f / 26) * 4 * (1 - toLock);
  const textCol = mixHex("#F5F5F0", "#171917", smooth(prog(f, 30, 70)));
  const lockIn = (a: number) => easeOut(prog(f, 120 + a, 144 + a));
  return (
    <AbsoluteFill style={{background: "#040504"}}>
      <svg width={W} height={H} style={{position: "absolute"}}>
        <defs>
          <radialGradient id="s6-bgp" cx="50%" cy="34%" r="80%"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.55" stopColor="#F5F5F0" /><stop offset="1" stopColor="#E7E8DF" /></radialGradient>
        </defs>
        <g opacity={1 - bg * 0.85}><StadiumBG frame={239} sec={8} lights={1} uid="s6" stretch={0.3} /></g>
        <rect width={W} height={H} fill="#040504" opacity={0.55 * (1 - bg)} />
        <g opacity={bg} style={{clipPath: `circle(${lerp(0, 2400, bg)}px at 540px ${jy}px)`}}>
          <rect width={W} height={H} fill="url(#s6-bgp)" />
          {/* soft stadium-light shafts fading into porcelain */}
          {[[-120, 0.55], [200, 0.4], [880, 0.5], [1200, 0.38]].map(([x, o], i) => (
            <polygon key={i} points={`${x},-50 ${x + 70},-50 ${x + 420 * (i % 2 ? -1 : 1) + 360},1900 ${x + 420 * (i % 2 ? -1 : 1) - 160},1900`} fill="#fff" opacity={0.28 * (o as number) * (1 - 0.6 * toLock)} />
          ))}
        </g>
        <g transform={`translate(540 ${jy + bob}) scale(${jScale})`}>
          <ShineJersey f={f} draw={draw} fill={fill} />
        </g>
        <rect width={W} height={H} fill="#fff" opacity={flash} />
      </svg>

      {/* headline 1 */}
      <div style={{position: "absolute", left: 70, top: 930}}>
        <KLines frame={f} start={14} stagger={8} size={190} lh={0.88} color={textCol} out={60} outDur={12}
          lines={[{t: "Let your"}, {t: "team be"}]} />
        <div style={{position: "relative", display: "inline-block", opacity: 1 - clamp((f - 60) / 12)}}>
          <div style={{position: "absolute", left: -14, right: -18, top: 22, bottom: 10, background: C.lime, transform: `scaleX(${easeOut(prog(f, 36, 56))})`, transformOrigin: "left"}} />
          <div style={{position: "relative"}}>
            <KLines frame={f} start={30} size={190} lh={0.88} color={mixHex("#F5F5F0", "#171917", smooth(prog(f, 36, 56)))} lines={[{t: "seen."}]} />
          </div>
        </div>
      </div>
      {/* headline 2 */}
      <div style={{position: "absolute", left: 70, top: 980}}>
        <KLines frame={f} start={64} stagger={9} size={128} lh={0.9} color={C.black} out={100} outDur={12}
          lines={[{t: "We'll help build"}, {t: "what they wear.", c: "#4a5a1c"}]} />
      </div>

      {/* final lockup */}
      <div style={{position: "absolute", left: 0, top: 890, width: W, display: "flex", flexDirection: "column", alignItems: "center"}}>
        <svg width={420} height={180} viewBox="-420 -150 840 300" style={{opacity: lockIn(0), transform: `translateY(${(1 - lockIn(0)) * 26}px)`}}>
          <MiniMark color={C.black} accent={C.lime} />
        </svg>
        <div style={{height: 26}} />
        <div style={{fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 118, color: C.black, letterSpacing: 2, lineHeight: 1, opacity: lockIn(5), transform: `translateY(${(1 - lockIn(5)) * 26}px)`}}>GHS CUSTOM GEAR</div>
        <div style={{height: 18}} />
        <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 35, color: "#3b4238", letterSpacing: 2.5, opacity: lockIn(10), transform: `translateY(${(1 - lockIn(10)) * 20}px)`}}>Custom Teamwear &amp; Private Label Manufacturing</div>
        <div style={{height: 44}} />
        <div style={{background: C.black, color: C.lime, fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 50, letterSpacing: 4, padding: "14px 38px 12px", opacity: lockIn(15), transform: `translateY(${(1 - lockIn(15)) * 20}px)`}}>MOQ STARTING AT 10 PIECES</div>
        <div style={{height: 40}} />
        <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 48, color: C.black, letterSpacing: 3, opacity: lockIn(20), transform: `translateY(${(1 - lockIn(20)) * 20}px)`}}>ghscustomgear.com</div>
      </div>
      <div style={{position: "absolute", bottom: 54, width: W, textAlign: "center", fontFamily: FONT_BODY, fontWeight: 500, fontSize: 19, letterSpacing: 1.5, color: "#6b7266", opacity: lockIn(24)}}>Conceptual animation. Stadium and athletes are illustrative only; no teams or sponsorships implied.</div>
    </AbsoluteFill>
  );
};
