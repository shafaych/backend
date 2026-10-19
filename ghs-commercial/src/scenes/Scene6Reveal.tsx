import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, FONT, W, H, tint} from '../styles/brand';
import {SAFE} from '../styles/safe';
import {Backdrop} from '../components/Backdrop';
import {CornerMarks, PhaseTracker} from '../components/Hud';
import {MaskText} from '../components/MaskText';
import {GHSMark} from '../components/GHSMark';
import {DrawPath} from '../components/Draw';
import {ease, lerp, prog} from '../utils/anim';

/** SCENE 06 — FINAL BRAND REVEAL (0:36–0:45). Frames 225–270 are a static branded hold. */
export const Scene6Reveal: React.FC = () => {
  const frame = useCurrentFrame();

  const guides = prog(frame, 0, 30, ease.outQuart);
  const guideFade = prog(frame, 58, 22, ease.inOut);
  const draw = prog(frame, 8, 44, ease.inOut);
  const weight = prog(frame, 46, 24, ease.inOut);
  const rule = prog(frame, 64, 22, ease.outExpo);

  const m = prog(frame, 116, 34, ease.inOut);
  const gy = lerp(830, 500, m);
  const gs = lerp(1, 0.72, m);

  const urlIn = prog(frame, 186, 22, ease.outExpo);
  const urlLine = prog(frame, 200, 24, ease.outExpo);
  const camY = -prog(frame, 0, 225, ease.linear) * 18;
  const push = 1 + prog(frame, 100, 125, ease.inOut) * 0.025;
  const sheen = prog(frame, 214, 22, ease.inOut);

  return (
    <AbsoluteFill>
      <Backdrop tone="dark" cell={72} drift={0.3} cam={{x: 0, y: camY}} />
      <CornerMarks dark />
      <PhaseTracker active={5} dark start={0} />

      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 40%'}}>
      {/* brand lock-up: wordmark + CUSTOM GEAR + tagline */}
      <div style={{position: 'absolute', left: 140, top: 0, width: 800, height: 520, transform: `translateY(${gy - 260}px) scale(${gs})`, transformOrigin: '50% 50%'}}>
        <div style={{position: 'absolute', left: 20, top: 0, width: 760}}>
          <GHSMark draw={draw} weight={weight} guides={guides} guideFade={guideFade} width={760} />
          <svg width={760} height={20} style={{display: 'block', marginTop: 24}}>
            <DrawPath d="M0 8 H760" p={rule} stroke={C.lime} width={6} cap="butt" />
          </svg>
        </div>
        <div style={{position: 'absolute', left: 20, top: 318, width: 760}}>
          <MaskText text="GHS CUSTOM GEAR" start={64} dur={22} size={58} weight={800} tracking={0.2} color={C.porcelain} lineHeight={1.1} />
        </div>
        <div style={{position: 'absolute', left: 20, top: 408, width: 760}}>
          <MaskText text="YOUR VISION. OUR PRODUCTION." start={90} dur={22} size={40} weight={700} tracking={0.04} color={C.lime} lineHeight={1.2} />
        </div>
      </div>

      {/* CTA */}
      <div style={{position: 'absolute', left: SAFE.left, top: 830, width: W - SAFE.left - SAFE.right}}>
        <MaskText text="LET'S BUILD" start={140} dur={22} size={118} tracking={-0.04} color={C.porcelain} />
        <MaskText text="YOUR NEXT" start={148} dur={22} size={118} tracking={-0.04} color={C.porcelain} />
        <MaskText text="COLLECTION." start={156} dur={22} size={118} tracking={-0.04} color={C.porcelain} />
      </div>

      {/* website */}
      <div
        style={{
          position: 'absolute', left: SAFE.left, top: 1290, width: W - SAFE.left - SAFE.right, height: 132,
          background: C.lime, clipPath: `inset(0 ${(1 - urlIn) * 100}% 0 0)`, display: 'flex', alignItems: 'center', paddingLeft: 40,
        }}
      >
        <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 70, letterSpacing: '-0.025em', color: C.carbon, whiteSpace: 'nowrap'}}>ghscustomgear.com</span>
        {sheen > 0 && sheen < 1 && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${-20 + sheen * 130}%`, width: 90, background: 'rgba(255,255,255,0.55)', transform: 'skewX(-20deg)'}} />}
        <svg width={90} height={90} viewBox="0 0 90 90" style={{position: 'absolute', right: 34, top: 21}}>
          <DrawPath d="M20 70 L68 22 M30 22 H68 V60" p={prog(frame, 196, 22, ease.outExpo)} stroke={C.carbon} width={9} cap="butt" join="miter" />
        </svg>
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <DrawPath d={`M${SAFE.left} 1452 H${SAFE.left + (W - SAFE.left - SAFE.right) * urlLine}`} p={urlLine > 0 ? 1 : 0} stroke={tint(C.porcelain, 0.5)} width={2} cap="butt" />
      </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
