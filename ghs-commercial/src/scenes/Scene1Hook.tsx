import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, W, H, tint} from '../styles/brand';
import {SAFE} from '../styles/safe';
import {Backdrop} from '../components/Backdrop';
import {JerseyWire} from '../components/Jersey';
import {MaskText} from '../components/MaskText';
import {CornerMarks, PhaseTracker} from '../components/Hud';
import {DrawPath} from '../components/Draw';
import {ease, prog, pulse} from '../utils/anim';

/** SCENE 01 — THE HOOK (0:00–0:05) */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();

  // wireframe constructs fast: first strokes land inside 0.5s
  const wire = prog(frame, 2, 34, ease.outQuart);
  const guides = prog(frame, 0, 26, ease.outQuart);
  const sweepIn = prog(frame, 0, 12, ease.outExpo);

  // simulated 3D: slow yaw + slight pitch, plus push-in
  const yaw = -26 + prog(frame, 0, 150, ease.inOut) * 38;
  const pitch = 8 - prog(frame, 0, 120, ease.inOut) * 8;
  const scale = 1.35 + prog(frame, 0, 150, ease.linear) * 0.12;
  const wireExit = prog(frame, 128, 18, ease.inExpo);

  // opening scanning line (frame 0 → 14) grabs attention immediately
  const scan = prog(frame, 0, 16, ease.outExpo);

  const textSize = 254;
  const camY = -prog(frame, 0, 150, ease.linear) * 30;

  return (
    <AbsoluteFill>
      <Backdrop tone="dark" cell={72} drift={0.35} cam={{x: 0, y: camY}} />
      <CornerMarks dark start={2} />
      <PhaseTracker active={0} dark />

      {/* opening horizontal scan line */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={0} x2={W * scan} y1={H * 0.42} y2={H * 0.42} stroke={C.lime} strokeWidth={2} opacity={1 - prog(frame, 10, 14)} />
        <line x1={W * 0.5 - 300 * sweepIn} x2={W * 0.5 + 300 * sweepIn} y1={H * 0.42} y2={H * 0.42} stroke={C.lime} strokeWidth={6} opacity={1 - prog(frame, 8, 10)} />
      </svg>

      {/* 3D wireframe jersey */}
      <div
        style={{
          position: 'absolute', left: 0, top: 0, width: W, height: 1040,
          perspective: 1500, perspectiveOrigin: '50% 50%',
          opacity: 1 - wireExit,
        }}
      >
        <svg
          width={W} height={1040} viewBox={`0 0 ${W} 1040`}
          style={{
            position: 'absolute', inset: 0, overflow: 'visible',
            transform: `rotateY(${yaw}deg) rotateX(${pitch}deg) scale(${1 + wireExit * 0.2})`,
            transformStyle: 'preserve-3d',
          }}
        >
          <g transform={`translate(${W / 2 - 200 * scale} ${600 - 240 * scale}) scale(${scale})`}>
            {/* depth echo copies create the sense of volume */}
            <g opacity={0.14} transform="translate(-14 -10)"><JerseyWire p={wire} color={C.lime} width={2} /></g>
            <g opacity={0.3} transform="translate(-7 -5)"><JerseyWire p={wire} color={C.lime} width={2.2} /></g>
            <JerseyWire p={wire} color={C.lime} width={2.6} guides={guides} />
          </g>
        </svg>
      </div>

      {/* kinetic headline, lower half, inside safe area */}
      <div style={{position: 'absolute', left: SAFE.left, top: 1000, width: W - SAFE.left - SAFE.right}}>
        <div style={{position: 'relative', height: 490}}>
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <MaskText text="YOUR" chars start={28} stagger={1.4} dur={20} size={textSize} exitStart={72} exitDur={14} />
            <MaskText text="BRAND." chars start={34} stagger={1.4} dur={20} size={textSize} exitStart={74} exitDur={14} />
          </div>
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <MaskText text="OUR" chars start={84} stagger={1.4} dur={20} size={textSize} exitStart={132} exitDur={12} />
            <MaskText text="CRAFT." chars start={90} stagger={1.4} dur={20} size={textSize} color={C.lime} exitStart={134} exitDur={12} />
          </div>
        </div>
      </div>

      {/* lime rule under the headline that anchors both phrases */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <DrawPath d={`M${SAFE.left} 1500 H${W - SAFE.right}`} p={pulse(frame, 36, 26, 122, 16, ease.outExpo, ease.inOut)} stroke={C.lime} width={4} cap="butt" />
        <text x={SAFE.left} y={1540} fontFamily={MONO} fontSize={22} letterSpacing={4} fontWeight={700} fill={tint(C.porcelain, 0.6)}
          opacity={pulse(frame, 44, 14, 118, 10)}>
          GHS CUSTOM GEAR — CUSTOM SPORTSWEAR MANUFACTURING
        </text>
      </svg>
    </AbsoluteFill>
  );
};
