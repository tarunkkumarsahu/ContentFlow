import React from "react";
import {
  AbsoluteFill,
  Composition,
  Html5Audio,
  staticFile,
  useRemotionEnvironment,
} from "remotion";
import {TarunReel} from "./Composition";
import {DURATION_IN_FRAMES} from "./beatMap";

const PreviewSafeTarunReel: React.FC = () => {
  const env = useRemotionEnvironment();

  return (
    <AbsoluteFill>
      {!env.isRendering ? (
        <Html5Audio
          src={staticFile("instagram-reel-audio-192kbps.mp3")}
          volume={1}
        />
      ) : null}
      <TarunReel />
    </AbsoluteFill>
  );
};

export const AudioPreviewComposition: React.FC = () => (
  <Composition
    id="TarunReel"
    component={PreviewSafeTarunReel}
    durationInFrames={DURATION_IN_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
