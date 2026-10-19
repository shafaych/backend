import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, W, H} from '../styles/brand';
import {ease, prog} from '../utils/anim';

export type WipeKind = 'none' | 'right' | 'up' | 'left' | 'down';

const SKEW = 140;
const BAND = 170;

/**
 * Reveals `children` (the incoming scene) with a directional edge sweep. Rendered
 * at global time; the edge carries a lime rule and, for some kinds, a carbon band.
 */
export const Wipe: React.FC<{kind: WipeKind; start: number; dur: number; children: React.ReactNode}> = ({kind, start, dur, children}) => {
  const frame = useCurrentFrame();
  if (kind === 'none' || frame >= start + dur) return <>{children}</>;
  if (frame < start) return null;

  const p = prog(frame, start, dur, ease.inOut);
  const band = kind === 'left' || kind === 'down' || kind === 'up' ? BAND : 0;
  let clip = '';
  let overlay: React.ReactNode = null;

  if (kind === 'right' || kind === 'left') {
    const span = W + SKEW * 2 + band;
    const e = kind === 'right' ? -SKEW + p * span : W + SKEW - p * span;
    const a = kind === 'right' ? e + SKEW : e - SKEW; // top x
    const b = kind === 'right' ? e - SKEW : e + SKEW; // bottom x
    clip =
      kind === 'right'
        ? `polygon(0px 0px, ${a}px 0px, ${b}px ${H}px, 0px ${H}px)`
        : `polygon(${W}px 0px, ${a}px 0px, ${b}px ${H}px, ${W}px ${H}px)`;
    const dx = kind === 'right' ? band : -band;
    overlay = (
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        {band > 0 && <polygon points={`${a},0 ${a + dx},0 ${b + dx},${H} ${b},${H}`} fill={C.carbon} />}
        <line x1={a} y1={0} x2={b} y2={H} stroke={C.lime} strokeWidth={7} />
        <line x1={a - (kind === 'right' ? 26 : -26)} y1={0} x2={b - (kind === 'right' ? 26 : -26)} y2={H} stroke={C.lime} strokeWidth={2} opacity={0.7} />
        <line x1={a - (kind === 'right' ? 56 : -56)} y1={0} x2={b - (kind === 'right' ? 56 : -56)} y2={H} stroke={C.lime} strokeWidth={1} opacity={0.45} />
      </svg>
    );
  } else {
    const span = H + SKEW + band;
    const e = kind === 'up' ? H + SKEW * 0.5 - p * span : -SKEW * 0.5 + p * span;
    const l = kind === 'up' ? e + SKEW * 0.5 : e - SKEW * 0.5;
    const r = kind === 'up' ? e - SKEW * 0.5 : e + SKEW * 0.5;
    clip =
      kind === 'up'
        ? `polygon(0px ${l}px, ${W}px ${r}px, ${W}px ${H}px, 0px ${H}px)`
        : `polygon(0px 0px, ${W}px 0px, ${W}px ${r}px, 0px ${l}px)`;
    const dy = kind === 'up' ? -band : band;
    overlay = (
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <polygon points={`0,${l} ${W},${r} ${W},${r + dy} 0,${l + dy}`} fill={C.carbon} />
        <line x1={0} y1={l} x2={W} y2={r} stroke={C.lime} strokeWidth={7} />
        <line x1={0} y1={l + (kind === 'up' ? 24 : -24)} x2={W} y2={r + (kind === 'up' ? 24 : -24)} stroke={C.lime} strokeWidth={2} opacity={0.7} />
      </svg>
    );
  }

  return (
    <>
      <div style={{position: 'absolute', inset: 0, clipPath: clip}}>{children}</div>
      {overlay}
    </>
  );
};
