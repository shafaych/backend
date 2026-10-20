import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, FPS, clamp} from './theme';

const TimeCtx = createContext(0);
/** absolute time in seconds on the full commercial timeline */
export const useT = () => useContext(TimeCtx);

const TimeProvider: React.FC<{startSec: number; children: React.ReactNode}> = ({startSec, children}) => {
  const f = useCurrentFrame();
  return <TimeCtx.Provider value={startSec + f / FPS}>{children}</TimeCtx.Provider>;
};

/** A scene occupies [from,to) seconds. Edges get a quiet fade plus a thin lime scan line. */
export const Scene: React.FC<{from: number; to: number; bg?: string; scan?: boolean; children: React.ReactNode}> = ({
  from, to, bg = C.carbon, scan = true, children,
}) => (
  <Sequence from={Math.round(from * FPS)} durationInFrames={Math.round((to - from) * FPS)} layout="none">
    <TimeProvider startSec={from}>
      <SceneInner from={from} to={to} bg={bg} scan={scan}>{children}</SceneInner>
    </TimeProvider>
  </Sequence>
);

const SceneInner: React.FC<{from: number; to: number; bg: string; scan: boolean; children: React.ReactNode}> = ({
  from, to, bg, scan, children,
}) => {
  const t = useT();
  const fadeIn = clamp((t - from) / 0.35);
  const fadeOut = to >= 50 ? 1 : clamp((to - t) / 0.3);
  const s = clamp((t - from) / 0.5);
  return (
    <AbsoluteFill style={{background: bg}}>
      <AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut)}}>{children}</AbsoluteFill>
      {scan && from > 0 && s < 1 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: `${s * 100}%`, height: 3, background: C.lime, opacity: 0.8 * (1 - s)}} />
      ) : null}
    </AbsoluteFill>
  );
};
