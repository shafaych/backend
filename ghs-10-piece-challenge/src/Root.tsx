import React from "react";
import { Composition } from "remotion";
import { Commercial } from "./Commercial";
import { FPS, W, H, DURATION } from "./timeline";

export const Root: React.FC = () => (
  <Composition id="TenPieceChallenge" component={Commercial} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
