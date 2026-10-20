import React from "react";
import {AbsoluteFill, Sequence, useCurrentFrame} from "remotion";
import {useFonts} from "./Fonts";
import {Scene1} from "./scenes/Scene1";
import {Scene2} from "./scenes/Scene2";
import {Scene3} from "./scenes/Scene3";
import {Scene4} from "./scenes/Scene4";
import {Scene5} from "./scenes/Scene5";
import {Scene6} from "./scenes/Scene6";

const L: React.FC<{C: React.FC<{frame: number}>}> = ({C}) => <C frame={useCurrentFrame()} />;

export const Film: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: "#040504"}}>
      <Sequence from={0} durationInFrames={240}><L C={Scene1} /></Sequence>
      <Sequence from={240} durationInFrames={240}><L C={Scene2} /></Sequence>
      <Sequence from={480} durationInFrames={300}><L C={Scene3} /></Sequence>
      <Sequence from={780} durationInFrames={300}><L C={Scene4} /></Sequence>
      <Sequence from={1080} durationInFrames={300}><L C={Scene5} /></Sequence>
      <Sequence from={1380} durationInFrames={270}><L C={Scene6} /></Sequence>
    </AbsoluteFill>
  );
};
