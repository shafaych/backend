import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { C, easeIn, prog } from "./theme";
import { FPS, T } from "./timeline";
import { Grain } from "./components/Fx";
import * as R from "./components/Reveals";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";

export const Commercial: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  // Scene 5 collapses into a point of black before the wordmark (33.2 → 33.95)
  const k5 = prog(t, 33.2, 0.75, easeIn);
  return (
    <AbsoluteFill style={{ background: C.carbon }}>
      <Audio src={staticFile("audio/final.wav")} />
      {t < T.s2 + 0.6 && <Scene1 />}
      {t >= T.s2 && t < T.s3 + 0.9 && <Scene2 />}
      {t >= T.s3 - 0.3 && t < T.s4 + 0.9 && <R.BarsReveal t={t} at={T.s3 - 0.1}><Scene3 /></R.BarsReveal>}
      {t >= T.s4 - 0.2 && t < T.s5 + 0.9 && <R.IrisReveal t={t} at={T.s4 - 0.05} cx={540} cy={820}><Scene4 /></R.IrisReveal>}
      {t >= T.s5 - 0.2 && t < T.s6 && (
        <AbsoluteFill style={{ clipPath: k5 > 0 ? `circle(${2300 * (1 - k5) + 4}px at 540px 975px)` : undefined, background: C.carbon }}>
          <R.SlitReveal t={t} at={T.s5 - 0.1}><Scene5 /></R.SlitReveal>
        </AbsoluteFill>
      )}
      {t >= 33.9 && <Scene6 />}
      {t >= 33.5 && t < 34.3 && <div style={{ position: "absolute", left: 536, top: 971, width: 8, height: 8, borderRadius: 4, background: C.lime, opacity: 1 - prog(t, 33.95, 0.3) }} />}
      <Grain />
    </AbsoluteFill>
  );
};
