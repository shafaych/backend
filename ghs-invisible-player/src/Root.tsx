import React from "react";
import {Composition, useCurrentFrame} from "remotion";
import {Film} from "./Film";
import {PoseSheet} from "./Poses";
import {Scene1} from "./scenes/Scene1";
import {Scene2} from "./scenes/Scene2";
import {useFonts} from "./Fonts";

const Pre: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return f < 240 ? <Scene1 frame={f} /> : <Scene2 frame={f - 240} />;
};
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={1650} fps={30} width={1080} height={1920} />
    <Composition id="Preview" component={Pre} durationInFrames={480} fps={30} width={1080} height={1920} />
    <Composition id="Poses" component={PoseSheet} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
