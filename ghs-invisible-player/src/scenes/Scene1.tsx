import React from "react";
import {AbsoluteFill} from "remotion";
import {C, H, W, easeIn, easeOut, lerp, prog, smooth} from "../util";
import {FigureSVG, mixPose, POSES} from "../Figure";
import {StadiumBG, stadiumProject} from "./Stadium";
import {heartPulse} from "../heart";

export const playerPose = (f: number) => {
  const breathe = Math.sin(f / 14) * 0.012;
  const idle = {...POSES.idle, lean: POSES.idle.lean + breathe, head: POSES.idle.head + Math.sin(f / 40) * 0.05};
  if (f < 190) return {pose: idle, wx: 0};
  const a = smooth(prog(f, 190, 214));
  const b = easeOut(prog(f, 214, 240));
  const pose = mixPose(mixPose(idle, POSES.crouch, a), POSES.run, b);
  return {pose, wx: easeIn(prog(f, 212, 240)) * 0.5};
};

export const PlayerOnPitch: React.FC<{frame: number; wire?: number; rimBoost?: number; uid?: string}> = ({frame, wire = 0, rimBoost = 0, uid = "pl"}) => {
  const {pose, wx} = playerPose(Math.min(frame, 239));
  const p = stadiumProject(frame, wx, 0, 0)!;
  const px = (p[2] * 1.8) / 92;
  const rim = 0.75 + rimBoost;
  return (
    <g>
      <ellipse cx={p[0]} cy={p[1]} rx={px * 28} ry={px * 5} fill="#000" opacity={0.55} />
      <g opacity={0.14} transform={`translate(0 ${2 * p[1]}) scale(1 -1)`}>
        <FigureSVG id={uid + "r"} pose={pose} x={p[0]} y={p[1]} scale={px} rim={0} kit={{sleeve: "short", lit: 0.3}} />
      </g>
      <FigureSVG id={uid} pose={pose} x={p[0]} y={p[1]} scale={px} rim={rim} wire={wire} kit={{sleeve: "short", lit: 0.3}} />
    </g>
  );
};

export const Scene1: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / 30;
  const pulse = heartPulse(t);
  const fadeIn = 1 - smooth(prog(frame, 0, 36));
  return (
    <AbsoluteFill style={{background: "#050605"}}>
      <svg width={W} height={H} style={{position: "absolute"}}>
        <StadiumBG frame={frame} uid="s1" />
        <PlayerOnPitch frame={frame} />
        <defs>
          <radialGradient id="s1-vig" cx="50%" cy="46%" r="75%">
            <stop offset="0.45" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity={0.78 - pulse * 0.18} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#s1-vig)" />
        <rect width={W} height={H} fill="#000" opacity={fadeIn} />
      </svg>
    </AbsoluteFill>
  );
};
