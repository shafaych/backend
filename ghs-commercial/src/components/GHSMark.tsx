import React from 'react';
import {DrawPath} from './Draw';
import {C} from '../styles/brand';
import {lerp, prog, ease} from '../utils/anim';

/**
 * GHS wordmark, built from geometric strokes (editable vector paths, no fonts).
 * viewBox: -10 0 480 160
 */
export const GHS_LETTERS = {
  G: 'M125 47 A60 60 0 1 0 135 84 H80',
  H: 'M205 7 V153 M295 7 V153 M205 80 H295',
  S: 'M443 50 C435 28 410 20 395 20 C365 20 352 38 352 53 C352 80 443 76 443 108 C443 126 425 140 398 140 C372 140 355 128 350 108',
} as const;
export const GHS_ORDER: (keyof typeof GHS_LETTERS)[] = ['G', 'H', 'S'];
export const GHS_VIEWBOX = '-10 0 480 160';
export const GHS_ASPECT = 480 / 160;
export const GHS_STROKE = 26;

type Props = {
  /** monoline letter draw 0..1 */
  draw: number;
  /** monoline → bold weight 0..1 */
  weight: number;
  /** construction guides 0..1 (draw) */
  guides?: number;
  guideFade?: number;
  color?: string;
  guideColor?: string;
  width: number;
};

export const GHSMark: React.FC<Props> = ({draw, weight, guides = 0, guideFade = 0, color = C.porcelain, guideColor = C.lime, width}) => {
  const height = width / GHS_ASPECT;
  const sw = lerp(2.5, GHS_STROKE, ease.inOut(weight));
  const g = guides;
  const gOpacity = 1 - guideFade;
  return (
    <svg width={width} height={height} viewBox={GHS_VIEWBOX} style={{overflow: 'visible'}}>
      <g opacity={gOpacity} stroke={guideColor} fill="none" strokeWidth={1.2}>
        {/* cap / baseline / mid construction rails */}
        <DrawPath d="M-40 7 H500" p={g} stroke={guideColor} width={1.2} />
        <DrawPath d="M-40 153 H500" p={g} stroke={guideColor} width={1.2} />
        <DrawPath d="M-40 80 H500" p={g} stroke={guideColor} width={1.2} opacity={0.6} />
        <DrawPath d="M75 -30 V190" p={g} stroke={guideColor} width={1.2} opacity={0.6} />
        <DrawPath d="M250 -30 V190" p={g} stroke={guideColor} width={1.2} opacity={0.6} />
        <DrawPath d="M398 -30 V190" p={g} stroke={guideColor} width={1.2} opacity={0.6} />
        {/* construction circles */}
        <DrawPath d="M135 80 A60 60 0 1 0 15 80 A60 60 0 1 0 135 80" p={g} stroke={guideColor} width={1.2} />
        <DrawPath d="M458 80 A60 60 0 1 0 338 80 A60 60 0 1 0 458 80" p={prog(g, 0.2, 0.8, (t) => t) } stroke={guideColor} width={1.2} opacity={0.55} />
      </g>
      {GHS_ORDER.map((k, i) => (
        <DrawPath
          key={k}
          d={GHS_LETTERS[k]}
          p={prog(draw, i * 0.22, 0.56, ease.inOut)}
          stroke={color}
          width={sw}
          cap="butt"
          join="miter"
        />
      ))}
    </svg>
  );
};
