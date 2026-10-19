import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT, MONO, easeOut, easeInOut, easeIn, easeBack, prog, mix, shake } from "../theme";
import { T, FPS } from "../timeline";
import { Flash, MaskLine, Tag, TechGrid } from "../components/Fx";

const SLATS = 14;
const Wordmark: React.FC<{ t: number; size: number }> = ({ t, size }) => (
  <div style={{ position: "relative", width: 1080, height: size * 0.95 }}>
    {Array.from({ length: SLATS }, (_, i) => {
      const k = prog(t, 34.42 + Math.abs(i - SLATS / 2) * 0.028, 0.34, easeOut);
      const w = 1080 / SLATS;
      return (
        <div key={i} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: "100%", clipPath: `inset(0 ${1080 - (i + 1) * w - 0.5}px 0 ${i * w - 0.5}px)`, opacity: Math.min(1, k * 4) }}>
          <div style={{ transform: `translateY(${(i % 2 ? 1 : -1) * (1 - k) * 420}px)`, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: "-0.055em", color: C.white, textAlign: "center", width: 1080 }}>
            <span style={{ display: "inline-block", transform: "scaleX(.92)" }}>GHS</span>
          </div>
        </div>
      );
    })}
  </div>
);

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sh = shake(t, T.wordmark, 34, 8);
  const sh2 = shake(t, T.headline6, 26, 8);

  // wordmark lockup moves from hero to header at the headline hit
  const mv = prog(t, 36.1, 0.6, easeInOut);
  const lockY = mix(0, -600, mv), lockS = mix(1, 0.5, mv);
  const scan = prog(t, 34.1, 0.5, easeIn);
  const scanOut = prog(t, 34.62, 0.5, easeOut);
  const show = t >= 34.4;

  return (
    <AbsoluteFill style={{ background: C.carbon, overflow: "hidden", transform: `translate(${sh.x + sh2.x}px, ${sh.y + sh2.y}px)` }}>
      <TechGrid opacity={0.05} offsetY={frame * 0.5} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(200,243,107,${0.05 + 0.13 * Math.exp(-(t - T.wordmark) * 1.2) * (t > T.wordmark ? 1 : 0)}) 0%, rgba(0,0,0,0) 65%)` }} />

      {/* scan line */}
      {t < 35.4 && (
        <div style={{ position: "absolute", left: 540 - 540 * scan * (1 + scanOut), width: 1080 * scan * (1 + scanOut), top: 975 - 3, height: 6 - 4 * scanOut, background: C.lime, boxShadow: "0 0 40px 6px rgba(200,243,107,.7)", opacity: 1 - scanOut * 0.9 }} />
      )}

      <div style={{ position: "absolute", inset: 0, transform: `translateY(${lockY}px) scale(${lockS})`, transformOrigin: "50% 50%" }}>
        {show && (
          <div style={{ position: "absolute", left: 0, top: 780 }}>
            <Wordmark t={t} size={520} />
          </div>
        )}
        <div style={{ position: "absolute", left: 0, top: 1250, width: 1080, textAlign: "center", opacity: prog(t, 34.95, 0.3) }}>
          <div style={{ display: "inline-block", overflow: "hidden", height: 82 }}>
            <div style={{ transform: `translateY(${(1 - prog(t, 34.95, 0.5)) * 100}%)`, fontFamily: FONT, fontWeight: 900, fontSize: 70, letterSpacing: "0.38em", color: C.lime, paddingLeft: "0.38em" }}>CUSTOM GEAR</div>
          </div>
        </div>
      </div>
      {/* impact rings */}
      {[0, 1].map((i) => {
        const kk = prog(t, T.wordmark + i * 0.1, 0.9);
        return kk > 0 && kk < 1 ? <div key={i} style={{ position: "absolute", left: 540 - 800 * kk, top: 975 - 800 * kk, width: 1600 * kk, height: 1600 * kk, borderRadius: "50%", border: `${5 - 2 * i}px solid ${C.lime}`, opacity: (1 - kk) * 0.6 }} /> : null;
      })}

      {/* headline */}
      <MaskLine t={t} at={T.headline6} size={172} y={580} x={54} width={1000} squeeze={0.84} dur={0.55}>YOUR BRAND</MaskLine>
      <MaskLine t={t} at={T.headline6 + 0.12} size={172} y={750} x={54} width={1000} squeeze={0.84} color={C.lime} dur={0.55}>STARTS HERE.</MaskLine>

      {/* support line + ten tiles */}
      <div style={{ position: "absolute", left: 60, top: 1010, background: C.lime, color: C.carbon, fontFamily: FONT, fontWeight: 900, fontSize: 56, letterSpacing: "-0.01em", padding: "14px 30px", transform: `scaleX(${prog(t, T.support6, 0.45)})`, transformOrigin: "0 50%", whiteSpace: "nowrap" }}>START WITH 10 PIECES.</div>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 10 }, (_, i) => {
          const kk = prog(t, T.support6 + 0.1 + i * 0.045, 0.3, easeBack);
          return <rect key={i} x={60 + i * 98} y={1160} width="80" height={88 * kk} fill="none" stroke={C.lime} strokeWidth="3" opacity={kk > 0 ? 1 : 0} />;
        })}
        {Array.from({ length: 10 }, (_, i) => {
          const kk = prog(t, T.support6 + 0.1 + i * 0.045, 0.3, easeBack);
          return <rect key={`f${i}`} x={60 + i * 98} y={1160 + 88 - 88 * kk} width="80" height={88 * kk} fill={C.lime} />;
        })}
      </svg>

      {/* URL */}
      <div style={{ position: "absolute", left: 0, top: 1420, width: 1080, textAlign: "center", opacity: prog(t, T.url, 0.2) }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 98, letterSpacing: "-0.04em", color: C.white, display: "inline-block", transform: "scaleX(.9)" }}>
          {"ghscustomgear.com".split("").map((ch, i) => <span key={i} style={{ opacity: prog(t, T.url + i * 0.025, 0.1) , color: i < 3 ? C.lime : C.white }}>{ch}</span>)}
        </div>
        <div style={{ height: 6, background: C.lime, width: 880 * prog(t, T.url + 0.1, 0.6, easeInOut), margin: "14px auto 0" }} />
      </div>
      <Tag x={0} y={1810} align="center" size={17} opacity={0.5 * prog(t, T.url, 0.5)} spacing={2}>Hypothetical scenarios shown for illustration only.</Tag>
      <Flash t={t} at={T.wordmark} peak={0.5} decay={9} />
      <Flash t={t} at={T.headline6} peak={0.5} decay={10} color={C.lime} />
    </AbsoluteFill>
  );
};
