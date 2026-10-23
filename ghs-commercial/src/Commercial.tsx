import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FabricWipe, Grade, MaskLine, Preload, Scrim, clamp, ease, easeIO, lerp, sec, tex} from './common';
import {Collar, Emblem, FabricOpen, Hem, Print, Seam} from './Macro';
import {JerseyShot} from './Jersey';
import {Lockup, Reveal} from './Brand';

/** Edit list in frames. 120 BPM -> one beat = 15 frames; every cut sits on the beat grid. */
const S = (from: number, len: number, node: React.ReactNode, key: string) => (
  <Sequence key={key} from={from} durationInFrames={len}>{node}</Sequence>
);

export const Commercial: React.FC = () => {
  const f = useCurrentFrame();
  const shots = [
    // 01 The Texture 0-2s
    S(0, 60, <FabricOpen />, 'a0'),
    // 02 The Craft 2-5s (7 cuts)
    S(60, 15, <Seam a="knit_carbon.jpg" b="knit_graphite.jpg" angle={62} len={15} />, 'a1'),
    S(75, 15, <Collar len={15} />, 'a2'),
    S(90, 15, <Print len={15} />, 'a3'),
    S(105, 7, <Seam a="mesh_carbon.jpg" b="mesh_porcelain.jpg" angle={-68} len={7} flip drift={-1} />, 'a4'),
    S(112, 8, <Emblem len={8} />, 'a5'),
    S(120, 15, <Hem len={15} />, 'a6'),
    S(135, 15, <Seam a="knit_porcelain.jpg" b="knit_carbon.jpg" angle={78} len={15} drift={-1} />, 'a7'),
    // 03 The Identity 5-9s (wide / close pairs on the beat)
    S(150, 15, <JerseyShot d="voltage" len={15} focus={[540, 1000]} z={[1.0, 1.07]} seed={3} />, 'b0'),
    S(165, 15, <JerseyShot d="voltage" close len={15} focus={[540, 760]} z={[2.2, 2.4]} drift={[0, 40]} seed={3} />, 'b1'),
    S(180, 15, <JerseyShot d="grid" len={15} focus={[540, 1000]} z={[1.06, 1.0]} seed={8} />, 'b2'),
    S(195, 15, <JerseyShot d="grid" close len={15} focus={[540, 520]} z={[2.5, 2.7]} drift={[30, 20]} seed={8} />, 'b3'),
    S(210, 15, <JerseyShot d="contour" len={15} focus={[540, 1000]} z={[1.0, 1.07]} seed={14} />, 'b4'),
    S(225, 15, <JerseyShot d="contour" close len={15} focus={[540, 1000]} z={[1.9, 2.1]} drift={[-30, -20]} seed={14} />, 'b5'),
    S(240, 15, <JerseyShot d="split" len={15} focus={[540, 1000]} z={[1.06, 1.0]} seed={21} />, 'b6'),
    S(255, 15, <JerseyShot d="split" close len={15} focus={[540, 980]} z={[1.9, 2.05]} drift={[20, 30]} seed={21} />, 'b7'),
  ];

  // typography over the picture (global frame)
  const craft = (
    <>
      {f >= 60 && f < 150 ? <Scrim strength={0.78} height={820} /> : null}
      {f >= 150 && f < 270 ? <Scrim strength={0.5} height={520} /> : null}
      <Sequence from={60} durationInFrames={45}>
        <div style={{position: 'absolute', left: 84, bottom: 430}}>
          <MaskLine text="EVERY THREAD." at={2} out={36} size={74} weight={500} track={0.16} />
        </div>
      </Sequence>
      <Sequence from={105} durationInFrames={45}>
        <div style={{position: 'absolute', left: 84, bottom: 430}}>
          <MaskLine text="EVERY DETAIL." at={2} out={36} size={74} weight={500} track={0.16} />
        </div>
      </Sequence>
      <Sequence from={210} durationInFrames={60}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 300, display: 'flex', justifyContent: 'center'}}>
          <MaskLine text="YOUR BRAND." at={0} out={50} size={120} weight={600} track={0.1} font="Inter" />
        </div>
      </Sequence>
    </>
  );

  const picture = f < 270;
  return (
    <Preload>
      <AbsoluteFill style={{background: C.carbon}}>
        {picture ? (
          <Grade vignette={0.5}>
            {shots}
            {/* fabric wipes sit above the picture, cuts hide beneath them */}
            <FabricWipe cut={75} dir={1} />
            <FabricWipe cut={105} dir={-1} />
            <FabricWipe cut={135} dir={1} />
            <FabricWipe cut={180} dir={-1} />
            <FabricWipe cut={210} dir={1} />
            <FabricWipe cut={240} dir={-1} />
            <FabricWipe cut={270} dir={1} toBlack />
            {craft}
          </Grade>
        ) : null}
        {/* 04 The Brand Reveal 9-12s */}
        <Sequence from={270} durationInFrames={90}><Grade vignette={0.7}><Reveal /></Grade></Sequence>
        {/* 05 The Signature 12-15s */}
        <Sequence from={360} durationInFrames={90}><Grade vignette={0.45}><Lockup /></Grade></Sequence>
        <Audio src={staticFile('audio/ghs_mix.wav')} />
      </AbsoluteFill>
    </Preload>
  );
};
