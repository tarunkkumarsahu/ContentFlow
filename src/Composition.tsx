import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ACCENTS,
  DURATION_IN_FRAMES,
  beatPulse,
  accentPulse,
  heroPulse,
  ramp,
  sceneOpacity,
} from "./beatMap";

const PURPLE = "#8b5cf6";
const BLACK = "#07070a";
const OFFWHITE = "#f4f1eb";
const MUTED = "#a7a1b5";
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

const FONT = 'Arial, Helvetica, sans-serif';
const DISPLAY = 'Arial Black, Arial, Helvetica, sans-serif';

const Label: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  size?: number;
  tracking?: number;
}> = ({children, dark = false, size = 24, tracking = 7}) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 800,
      letterSpacing: tracking,
      color: dark ? "#141419" : MUTED,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const BeatGrid: React.FC<{light?: boolean}> = ({light = false}) => {
  const frame = useCurrentFrame();
  const beat = beatPulse(frame);
  const accent = accentPulse(frame);
  const line = light ? "rgba(10,10,15,.08)" : "rgba(255,255,255,.07)";
  return (
    <AbsoluteFill
      style={{
        opacity: 0.38 + beat * 0.22,
        transform: `scale(${1 + beat * 0.008}) rotate(${Math.sin(frame / 80) * 0.28}deg)`,
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: `${95 - accent * 7}px ${95 - accent * 7}px`,
      }}
    />
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.08,
        mixBlendMode: "overlay",
        backgroundImage:
          "radial-gradient(circle at 20% 30%, white 0 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 0 1px, transparent 1px)",
        backgroundSize: `${7 + (frame % 3)}px ${9 + (frame % 4)}px`,
      }}
    />
  );
};

const GlobalHitFx: React.FC = () => {
  const frame = useCurrentFrame();
  const accent = accentPulse(frame);
  const hero = heroPulse(frame);
  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: hero > 0.78 ? "rgba(255,255,255,.92)" : "transparent",
          opacity: hero > 0.78 ? (hero - 0.78) * 2.2 : 0,
          mixBlendMode: "difference",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${50 + Math.sin(frame) * 20}%`,
          height: 3 + accent * 18,
          background: PURPLE,
          opacity: accent * 0.75,
          transform: `scaleX(${accent})`,
        }}
      />
    </>
  );
};

const KineticText: React.FC<{
  text: string;
  start: number;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  width?: string | number;
  stroke?: boolean;
  direction?: "up" | "left" | "right";
  weight?: number;
  lineHeight?: number;
}> = ({
  text,
  start,
  size = 120,
  color = "white",
  align = "left",
  width = "100%",
  stroke = false,
  direction = "up",
  weight = 900,
  lineHeight = 0.88,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - start;
  const pop = spring({
    frame: local,
    fps,
    config: {damping: 15, stiffness: 180, mass: 0.58},
  });
  const beat = beatPulse(frame);
  const accent = accentPulse(frame);
  const enterX = direction === "left" ? -160 : direction === "right" ? 160 : 0;
  const enterY = direction === "up" ? 150 : 0;
  return (
    <div
      style={{
        width,
        fontFamily: DISPLAY,
        fontSize: size,
        fontWeight: weight,
        color: stroke ? "transparent" : color,
        WebkitTextStroke: stroke ? `3px ${color}` : undefined,
        letterSpacing: "-0.065em",
        lineHeight,
        textAlign: align,
        whiteSpace: "pre-line",
        textTransform: "uppercase",
        opacity: interpolate(local, [0, 5], [0, 1], clamp),
        transform: `translate3d(${(1 - pop) * enterX + accent * 2}px, ${(1 - pop) * enterY - beat * 5}px, 0) scale(${0.82 + pop * 0.18 + beat * 0.014}) skewX(${(1 - pop) * -7}deg)`,
        filter: `blur(${Math.max(0, (1 - pop) * 10)}px)`,
        textShadow:
          accent > 0.42
            ? `${-10 * accent}px 0 rgba(139,92,246,.55), ${8 * accent}px 0 rgba(255,255,255,.2)`
            : "none",
      }}
    >
      {text}
    </div>
  );
};

const Scene: React.FC<{
  start: number;
  end: number;
  bg?: string;
  children: React.ReactNode;
  lightGrid?: boolean;
}> = ({start, end, bg = BLACK, children, lightGrid = false}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame >= end) return null;
  const opacity = sceneOpacity(frame, start, end, 6);
  const beat = beatPulse(frame);
  const accent = accentPulse(frame);
  return (
    <AbsoluteFill
      style={{
        background: bg,
        opacity,
        overflow: "hidden",
        transform: `scale(${1 + beat * 0.006 + accent * 0.008})`,
      }}
    >
      <BeatGrid light={lightGrid} />
      {children}
    </AbsoluteFill>
  );
};

const AccentBar: React.FC<{top: number; start: number; dark?: boolean}> = ({top, start, dark}) => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [start, start + 14], [0, 860], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 70,
        width,
        height: 10,
        background: dark ? "#17171c" : PURPLE,
      }}
    />
  );
};

const Portrait: React.FC<{start: number; large?: boolean}> = ({start, large = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - start, fps, config: {damping: 17, stiffness: 105, mass: 0.8}});
  const beat = beatPulse(frame);
  const accent = accentPulse(frame);
  return (
    <Img
      src={staticFile("Thoughtful Gamer with Laptop.png")}
      style={{
        position: "absolute",
        width: large ? "132%" : "116%",
        left: large ? "-16%" : "-8%",
        bottom: large ? "-1%" : "5%",
        transformOrigin: "50% 80%",
        transform: `translateY(${(1 - p) * 180}px) translateX(${Math.sin(frame / 26) * 5}px) scale(${0.92 + p * 0.08 + beat * 0.012}) rotate(${accent * -0.28}deg)`,
        filter: `drop-shadow(0 35px 55px rgba(0,0,0,.38)) contrast(${1 + accent * 0.08})`,
      }}
    />
  );
};

const Marquee: React.FC<{
  text: string;
  top: number;
  speed?: number;
  color?: string;
  opacity?: number;
  reverse?: boolean;
  size?: number;
}> = ({text, top, speed = 5, color = "white", opacity = 0.16, reverse = false, size = 90}) => {
  const frame = useCurrentFrame();
  const beat = beatPulse(frame);
  const x = ((frame * speed * (reverse ? 1 : -1)) % 900) - 300;
  const repeated = `${text}   ${text}   ${text}   ${text}`;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: -400,
        width: 2500,
        transform: `translateX(${x}px) scale(${1 + beat * 0.012})`,
        fontFamily: DISPLAY,
        fontSize: size,
        fontWeight: 900,
        letterSpacing: "-0.05em",
        color,
        opacity,
        whiteSpace: "nowrap",
      }}
    >
      {repeated}
    </div>
  );
};

const WordBurst: React.FC<{
  words: string[];
  start: number;
  step?: number;
  color?: string;
}> = ({words, start, step = 15, color = OFFWHITE}) => {
  const frame = useCurrentFrame();
  const index = Math.min(words.length - 1, Math.max(0, Math.floor((frame - start) / step)));
  const localStart = start + index * step;
  const accent = accentPulse(frame);
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", padding: 55}}>
      <div
        style={{
          position: "absolute",
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 250,
          color: PURPLE,
          opacity: 0.08 + accent * 0.12,
          transform: `rotate(-90deg) translateY(-390px) scale(${1 + accent * 0.1})`,
          letterSpacing: "-0.08em",
        }}
      >
        0{index + 1}
      </div>
      <KineticText
        key={`${index}-${words[index]}`}
        text={words[index]}
        start={localStart}
        size={words[index].length > 9 ? 132 : 170}
        color={color}
        align="center"
        direction={index % 2 ? "right" : "left"}
      />
    </AbsoluteFill>
  );
};

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = ramp(frame, 0, 95);
  return (
    <Scene start={0} end={101}>
      <Marquee text="TARUN / TARUN / TARUN" top={110} speed={2.4} opacity={0.09} size={72} />
      <div style={{position: "absolute", left: 64, top: 190}}>
        <Label>PERSONAL INTRO / 001</Label>
      </div>
      <AbsoluteFill style={{justifyContent: "center", padding: "0 64px"}}>
        <KineticText text="HELLO," start={8} size={150} />
        <KineticText text="I'M TARUN." start={31} size={190} color={PURPLE} direction="right" />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 185,
          left: 65,
          width: 950,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 2,
            width: `${sweep * 100}%`,
            background: "white",
            opacity: 0.7,
          }}
        />
        <div style={{marginTop: 24}}>
          <Label>AI / CODE / CREATIVITY / CURIOSITY</Label>
        </div>
      </div>
    </Scene>
  );
};

const PortraitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [101, 161], [-90, 65], clamp);
  return (
    <Scene start={101} end={161} bg={OFFWHITE} lightGrid>
      <Marquee text="AI DEVELOPER" top={250} speed={6} color="#17171c" opacity={0.08} size={120} />
      <div
        style={{
          position: "absolute",
          left: -80 + drift,
          top: 470,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 285,
          letterSpacing: "-0.09em",
          color: "#111117",
          opacity: 0.12,
        }}
      >
        TARUN
      </div>
      <Portrait start={103} large />
      <div style={{position: "absolute", left: 60, top: 120}}>
        <Label dark>AI DEVELOPER / CREATIVE TECHNOLOGIST</Label>
      </div>
      <div style={{position: "absolute", left: 58, bottom: 155, zIndex: 3}}>
        <KineticText text="TARUN." start={126} size={180} color="#111117" />
        <div style={{height: 12, width: 340, background: PURPLE, marginTop: 22}} />
      </div>
    </Scene>
  );
};

const AiHeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const flip = Math.floor((frame - 161) / 15) % 2 === 1;
  return (
    <Scene start={161} end={277} bg={flip ? OFFWHITE : BLACK} lightGrid={flip}>
      <div style={{position: "absolute", left: 60, top: 130}}>
        <Label dark={flip}>WHAT I DO</Label>
      </div>
      <Marquee
        text="ARTIFICIAL INTELLIGENCE"
        top={440}
        speed={7}
        color={flip ? "#17171c" : "white"}
        opacity={0.08}
        reverse
        size={78}
      />
      <AbsoluteFill style={{justifyContent: "center", padding: 60}}>
        <KineticText
          text="AI"
          start={161}
          size={360}
          color={flip ? "#111117" : OFFWHITE}
          align="center"
        />
        <KineticText
          text="DEVELOPER"
          start={176}
          size={145}
          color={PURPLE}
          align="center"
          direction="right"
        />
      </AbsoluteFill>
      <AccentBar top={1370} start={191} dark={flip} />
      <div style={{position: "absolute", left: 65, bottom: 190}}>
        <Label dark={flip}>I BUILD WITH SYSTEMS, MODELS & CODE</Label>
      </div>
    </Scene>
  );
};

const NotOneBoxScene: React.FC = () => (
  <Scene start={277} end={341} bg={OFFWHITE} lightGrid>
    <div style={{position: "absolute", left: 60, top: 130}}>
      <Label dark>ONE THING ABOUT ME</Label>
    </div>
    <AbsoluteFill style={{justifyContent: "center", padding: 62}}>
      <KineticText text="I DON'T STAY" start={280} size={128} color="#111117" />
      <KineticText text="IN ONE BOX." start={300} size={158} color={PURPLE} direction="right" />
    </AbsoluteFill>
    <Marquee text="EXPLORE / BUILD / CREATE" top={1420} speed={4} color="#111117" opacity={0.11} size={70} />
  </Scene>
);

const CreativeScene: React.FC = () => (
  <Scene start={341} end={431}>
    <div style={{position: "absolute", left: 60, top: 120}}>
      <Label>THINGS I LOVE WORKING WITH</Label>
    </div>
    <WordBurst
      words={["CODE.", "AI.", "DESIGN.", "MOTION.", "3D.", "AUTOMATION."]}
      start={341}
      step={15}
    />
    <AccentBar top={1510} start={371} />
  </Scene>
);

const MindsetScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = [
    {text: "BUILD.", start: 431},
    {text: "BREAK.", start: 446},
    {text: "LEARN.", start: 461},
    {text: "REPEAT.", start: 476},
  ];
  return (
    <Scene start={431} end={491} bg={OFFWHITE} lightGrid>
      <div style={{position: "absolute", left: 60, top: 115}}>
        <Label dark>HOW I MOVE</Label>
      </div>
      <AbsoluteFill style={{justifyContent: "center", padding: "0 58px", gap: 12}}>
        {words.map((w, index) => (
          <div key={w.text} style={{opacity: frame >= w.start ? 1 : 0}}>
            <KineticText
              text={w.text}
              start={w.start}
              size={index === 3 ? 155 : 175}
              color={index === 2 ? PURPLE : "#111117"}
              direction={index % 2 ? "right" : "left"}
            />
          </div>
        ))}
      </AbsoluteFill>
    </Scene>
  );
};

const FinaleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hero = heroPulse(frame);
  const out = 1 - ramp(frame, 560, 596);
  return (
    <Scene start={491} end={597}>
      <Marquee text="TARUN" top={180} speed={3.5} opacity={0.08} size={160} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.34,
          transform: `scale(${1.08 + hero * 0.04})`,
        }}
      >
        <Portrait start={491} large />
      </div>
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 3, opacity: out}}>
        <KineticText text="TARUN." start={491} size={225} align="center" />
        <div style={{marginTop: 30, transform: `scale(${1 + hero * 0.04})`}}>
          <Label size={26}>AI DEVELOPER / CREATIVE TECHNOLOGIST</Label>
        </div>
        <div
          style={{
            marginTop: 34,
            width: 250 + hero * 220,
            height: 9,
            background: PURPLE,
          }}
        />
      </AbsoluteFill>
      <div style={{position: "absolute", bottom: 110, width: "100%", textAlign: "center", opacity: out}}>
        <Label>AI × CODE × CREATIVITY</Label>
      </div>
    </Scene>
  );
};

export const TarunReel: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = beatPulse(frame);
  const accent = accentPulse(frame);
  const cameraX = Math.sin(frame / 18) * beat * 3;
  const cameraY = Math.cos(frame / 21) * accent * 4;
  return (
    <AbsoluteFill style={{background: BLACK}}>
      <Audio src={staticFile("instagram-reel-audio-192kbps.mp3")} volume={1} />
      <AbsoluteFill
        style={{
          transform: `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${1 + accent * 0.004})`,
        }}
      >
        <IntroScene />
        <PortraitScene />
        <AiHeroScene />
        <NotOneBoxScene />
        <CreativeScene />
        <MindsetScene />
        <FinaleScene />
      </AbsoluteFill>
      <GlobalHitFx />
      <Grain />
      {ACCENTS.map((hit) => {
        const distance = frame - hit;
        if (distance < 0 || distance > 3) return null;
        return (
          <div
            key={hit}
            style={{
              position: "absolute",
              inset: 0,
              border: `${Math.max(0, 12 - distance * 4)}px solid ${PURPLE}`,
              opacity: 0.28 - distance * 0.08,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const MyComposition: React.FC = () => (
  <Composition
    id="TarunReel"
    component={TarunReel}
    durationInFrames={DURATION_IN_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
