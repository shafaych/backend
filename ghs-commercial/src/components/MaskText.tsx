import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT} from '../styles/brand';
import {ease, prog, EaseFn} from '../utils/anim';

type Props = {
  text: string;
  start: number;
  size: number;
  color?: string;
  weight?: number;
  font?: string;
  dur?: number;
  /** per-unit delay in frames (units = chars when `chars`, else a single unit) */
  stagger?: number;
  chars?: boolean;
  exitStart?: number;
  exitDur?: number;
  tracking?: number; // em
  lineHeight?: number; // em
  align?: 'left' | 'center' | 'right';
  /** px of travel used to derive motion blur from velocity */
  blurGain?: number;
  easing?: EaseFn;
  style?: React.CSSProperties;
};

/**
 * Masked kinetic type line. The glyphs rise from below a hard mask with a slight
 * skew; a directional (vertical) blur is derived from frame-to-frame velocity.
 */
export const MaskText: React.FC<Props> = ({
  text, start, size, color = C.porcelain, weight = 900, font = FONT, dur = 22, stagger = 1.6,
  chars = false, exitStart, exitDur = 14, tracking = -0.035, lineHeight = 0.96, align = 'left',
  blurGain = 22, easing = ease.outExpo, style,
}) => {
  const frame = useCurrentFrame();
  const uid = 'mb' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const units = chars ? Array.from(text) : [text];

  const state = (f: number, i: number) => {
    const d = i * stagger;
    const pin = prog(f, start + d, dur, easing);
    const pout = exitStart === undefined ? 0 : prog(f, exitStart + d * 0.5, exitDur, ease.inExpo);
    return {pin, pout, y: (1 - pin) * 112 - pout * 112, vis: pin * (1 - pout)};
  };

  let maxV = 0;
  units.forEach((_, i) => {
    const a = state(frame, i);
    const b = state(frame - 1, i);
    maxV = Math.max(maxV, Math.abs(a.y - b.y));
  });
  const blur = Math.min(10, (maxV / 112) * blurGain * (size / 100));
  const anyVisible = units.some((_, i) => {
    const s = state(frame, i);
    return s.pin > 0 && s.pout < 1;
  });

  if (!anyVisible) return <div style={{height: size * lineHeight, ...style}} />;

  const boxH = size * lineHeight;
  return (
    <div
      style={{
        position: 'relative',
        display: 'block',
        textAlign: align,
        whiteSpace: 'pre',
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        lineHeight: `${boxH}px`,
        letterSpacing: `${tracking}em`,
        color,
        filter: blur > 0.35 ? `url(#${uid})` : undefined,
        ...style,
      }}
    >
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={uid} x="-5%" y="-60%" width="110%" height="220%">
          <feGaussianBlur stdDeviation={`0 ${blur.toFixed(2)}`} />
        </filter>
      </svg>
      {units.map((u, i) => {
        const s = state(frame, i);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              height: boxH,
              verticalAlign: 'top',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${s.y}%) skewY(${(1 - s.pin) * 7 + s.pout * -5}deg)`,
                transformOrigin: 'left bottom',
              }}
            >
              {u}
            </span>
          </span>
        );
      })}
    </div>
  );
};
