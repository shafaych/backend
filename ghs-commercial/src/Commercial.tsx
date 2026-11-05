import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {createWorld} from './world';
import {Overlay} from './Overlay';

let world: ReturnType<typeof createWorld> | null = null;

export const Commercial: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('init'));

  useEffect(() => {
    (async () => {
      const faces = [
        new FontFace('Anton', `url(${staticFile('fonts/anton.woff2')})`),
        new FontFace('Inter', `url(${staticFile('fonts/inter-600.woff2')})`, {weight: '600'}),
        new FontFace('Inter', `url(${staticFile('fonts/inter-800.woff2')})`, {weight: '800'}),
      ];
      for (const f of faces) {
        await f.load();
        (document as any).fonts.add(f);
      }
      await (document as any).fonts.load('300px Anton');
      if (!world && ref.current) world = createWorld(ref.current, width, height);
      setReady(true);
    })();
  }, []);

  useLayoutEffect(() => {
    if (ready && world) {
      world.update(frame / fps);
      continueRender(handle);
    }
  }, [frame, ready]);

  return (
    <AbsoluteFill style={{background: '#171917'}}>
      <canvas ref={ref} width={width} height={height} style={{width, height, display: 'block'}} />
      <Overlay t={frame / fps} />
    </AbsoluteFill>
  );
};
