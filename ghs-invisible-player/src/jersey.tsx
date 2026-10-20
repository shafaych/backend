import React from "react";
import {C} from "./util";

export const J = {
  front: "M-70 -252 L-152 -226 Q-176 -170 -166 -105 Q-158 -20 -154 262 L154 262 Q158 -20 166 -105 Q176 -170 152 -226 L70 -252 L0 -176 Z",
  back: "M-70 -252 L-152 -226 Q-176 -170 -166 -105 Q-158 -20 -154 262 L154 262 Q158 -20 166 -105 Q176 -170 152 -226 L70 -252 Q0 -200 -70 -252 Z",
  sleeveL: "M-152 -226 L-262 -168 Q-304 -120 -284 -72 L-232 -50 Q-196 -80 -166 -105 Q-176 -170 -152 -226 Z",
  sleeveR: "M152 -226 L262 -168 Q304 -120 284 -72 L232 -50 Q196 -80 166 -105 Q176 -170 152 -226 Z",
  collarV: "M-70 -252 L0 -176 L70 -252 L56 -259 L0 -196 L-56 -259 Z",
  collarCrew: "M-70 -252 Q0 -200 70 -252 L56 -259 Q0 -216 -56 -259 Z",
  hem: "M-154 232 L154 232 L154 262 L-154 262 Z",
  cuffL: "M-262 -168 Q-304 -120 -284 -72 L-266 -66 Q-286 -118 -246 -160 Z",
  cuffR: "M262 -168 Q304 -120 284 -72 L266 -66 Q286 -118 246 -160 Z",
  chevron: "M-160 -20 L0 70 L160 -20 L160 14 L0 104 L-160 14 Z",
  insertL: "M-166 -105 Q-158 -20 -154 262 L-128 262 Q-132 -20 -140 -110 Z",
  insertR: "M166 -105 Q158 -20 154 262 L128 262 Q132 -20 140 -110 Z",
};
export const SEAMS: {k: string; d: string}[] = [
  {k: "shoulderL", d: "M-70 -252 L-152 -226"},
  {k: "shoulderR", d: "M70 -252 L152 -226"},
  {k: "armholeL", d: "M-152 -226 Q-176 -170 -166 -105"},
  {k: "armholeR", d: "M152 -226 Q176 -170 166 -105"},
  {k: "sideL", d: "M-166 -105 Q-158 -20 -154 262"},
  {k: "sideR", d: "M166 -105 Q158 -20 154 262"},
  {k: "hem", d: "M-154 232 L154 232"},
  {k: "cuffL", d: "M-262 -168 Q-304 -120 -284 -72"},
  {k: "cuffR", d: "M262 -168 Q304 -120 284 -72"},
  {k: "neck", d: "M-70 -252 L0 -176 L70 -252"},
];
export const OUTLINES = [J.front, J.sleeveL, J.sleeveR];

/** diamond lattice pattern, clipped by parent */
export const Lattice: React.FC<{id: string; color?: string; opacity?: number; step?: number; w?: number}> = ({id, color = C.lime, opacity = 0.18, step = 34, w = 1.2}) => {
  const lines: React.ReactNode[] = [];
  for (let i = -30; i <= 30; i++) {
    lines.push(<line key={"a" + i} x1={-340 + i * step} y1={-300} x2={340 + i * step} y2={380} />);
    lines.push(<line key={"b" + i} x1={340 + i * step} y1={-300} x2={-340 + i * step} y2={380} />);
  }
  return (
    <g id={id} stroke={color} strokeWidth={w} opacity={opacity} fill="none">
      {lines}
    </g>
  );
};

export const JerseyAssembled: React.FC<{
  base?: string; trim?: string; pattern?: number; id?: string; stroke?: string; strokeW?: number; fillOpacity?: number; back?: boolean;
}> = ({base = "#2a302a", trim = C.lime, pattern = 0.2, id = "jy", stroke, strokeW = 2, fillOpacity = 1, back = false}) => (
  <g>
    <defs>
      <clipPath id={`${id}-clip`}><path d={back ? J.back : J.front} /><path d={J.sleeveL} /><path d={J.sleeveR} /></clipPath>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={base} />
        <stop offset="1" stopColor="#1b1f1b" />
      </linearGradient>
    </defs>
    <path d={J.sleeveL} fill={`url(#${id}-g)`} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={strokeW} />
    <path d={J.sleeveR} fill={`url(#${id}-g)`} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={strokeW} />
    <path d={back ? J.back : J.front} fill={`url(#${id}-g)`} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={strokeW} />
    <g clipPath={`url(#${id}-clip)`}>
      <Lattice id={`${id}-lat`} opacity={pattern} />
      <path d={J.chevron} fill={trim} opacity={0.95} />
      <path d={J.insertL} fill={trim} opacity={0.9} />
      <path d={J.insertR} fill={trim} opacity={0.9} />
      <path d={J.hem} fill={trim} opacity={0.95} />
    </g>
    <path d={J.cuffL} fill={trim} />
    <path d={J.cuffR} fill={trim} />
    <path d={back ? J.collarCrew : J.collarV} fill={trim} />
  </g>
);
