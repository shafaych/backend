import React from 'react';
import {C, MONO} from '../styles/brand';
import {ease, prog} from '../utils/anim';
import {DrawPath} from './Draw';

type Props = {
  /** current frame (scene-local) */
  frame: number;
  start: number;
  end: number;
  /** anchor on the artwork */
  ax: number;
  ay: number;
  /** label box top-left */
  lx: number;
  ly: number;
  index: string;
  label: string;
  dark?: boolean;
};

const FS = 24;
const CH = FS * 0.6 + 2.2;

/** Technical annotation: dot on artwork, leader line, mono tag. */
export const Callout: React.FC<Props> = ({frame, start, end, ax, ay, lx, ly, index, label, dark = false}) => {
  const inP = prog(frame, start, 18, ease.outExpo);
  const outP = prog(frame, end, 12, ease.inOut);
  const vis = inP * (1 - outP);
  if (vis <= 0.001) return null;
  const w = (label.length + index.length + 1) * CH + 44;
  const h = 50;
  const ink = dark ? C.porcelain : C.carbon;
  const tx = lx + w / 2;
  const ty = ly + (ay > ly ? h : 0);
  const d = `M${ax} ${ay} L${ax} ${(ay + ty) / 2} L${tx} ${ty}`;
  return (
    <g opacity={1 - outP}>
      <DrawPath d={d} p={inP} stroke={ink} width={2} />
      <circle cx={ax} cy={ay} r={9 * inP} fill={C.lime} stroke={ink} strokeWidth={3} />
      <circle cx={ax} cy={ay} r={9 + 14 * prog(frame, start, 24, ease.outQuart)} fill="none" stroke={ink} strokeWidth={1.5} opacity={1 - prog(frame, start, 24, ease.outQuart)} />
      <g style={{clipPath: `inset(0 ${(1 - inP) * 100}% 0 0)`}}>
        <rect x={lx} y={ly} width={w} height={h} fill={C.lime} stroke={ink} strokeWidth={2} />
        <text x={lx + 18} y={ly + 33} fontFamily={MONO} fontSize={FS} fontWeight={700} letterSpacing={2} fill={C.carbon}>
          <tspan opacity={0.55}>{index}</tspan> {label}
        </text>
      </g>
    </g>
  );
};
