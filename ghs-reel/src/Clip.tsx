import React from 'react';
import {Freeze, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';

/** Original footage, scaled 720x1280 -> 1080x1920 (exact 1.5x), slow push-in, no sharpening. */
export const Clip: React.FC<{
  start: number; // source frame
  rate: number;
  freezeAt?: number; // local frame at which the clip holds its last good frame
  zoom?: [number, number];
  drift?: [number, number]; // px start->end translate
  width?: number;
  height?: number;
  focusY?: number; // 0..1 vertical focus when cropping into a box
  total?: number;
}> = ({start, rate, freezeAt = 9999, zoom = [1.02, 1.1], drift = [0, 0], width = 1080, height = 1920, focusY = 0.5, total = 94}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, total], zoom, {extrapolateRight: 'clamp'});
  const dx = interpolate(f, [0, total], [0, drift[0]], {extrapolateRight: 'clamp'});
  const dy = interpolate(f, [0, total], [0, drift[1]], {extrapolateRight: 'clamp'});
  const vh = 1920;
  const top = -(focusY * vh - height / 2);
  return (
    <div style={{position: 'absolute', inset: 0, width, height, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top, width: 1080, height: vh, transform: `translate(${dx}px, ${dy}px) scale(${z})`, transformOrigin: `50% ${focusY * 100}%`, filter: 'contrast(1.03)'}}>
        <Freeze frame={freezeAt} active={f > freezeAt}>
          <OffthreadVideo
            src={staticFile('source.mp4')}
            startFrom={start}
            playbackRate={rate}
            muted
            style={{width: 1080, height: 1920}}
          />
        </Freeze>
      </div>
    </div>
  );
};
