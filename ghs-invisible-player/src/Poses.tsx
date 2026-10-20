import React from "react";
import {AbsoluteFill} from "remotion";
import {C} from "./util";
import {FigureSVG, POSES} from "./Figure";
export const PoseSheet: React.FC = () => {
  const names = ["idle", "run", "soccer", "basket", "football", "volley"];
  return (
    <AbsoluteFill style={{background: "#222"}}>
      <svg width={1080} height={1920}>
        {names.map((n, i) => (
          <g key={n}>
            <FigureSVG id={n} pose={POSES[n]} x={270 + (i % 3) * 270} y={500 + Math.floor(i / 3) * 700} scale={4.6} rim={0.8} wire={i === 1 ? 1 : 0}
              kit={{sleeve: n === "football" ? "pads" : "short", lit: 0.8, helmet: n === "football"}} />
            <text x={270 + (i % 3) * 270} y={560 + Math.floor(i / 3) * 700} fill="#fff" fontSize={30} textAnchor="middle">{n}</text>
          </g>
        ))}
        <rect width={1080} height={1920} fill="none" stroke={C.lime} />
      </svg>
    </AbsoluteFill>
  );
};
