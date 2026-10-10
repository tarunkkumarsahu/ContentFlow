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

const FPS = 30;
const DURATION = 597;
const BLACK = "#050505";
const WHITE = "#f3f3ef";
const PURPLE = "#8b5cf6";
const DISPLAY = 'Arial Black, Arial, Helvetica, sans-serif';
const FONT = 'Arial, Helvetica, sans-serif';
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

// Exact strong transients detected from the uploaded audio at 30fps.
const STRONG = [8,13,17,21,123,127,131,161,191,221,277,326,341,356,371,401,431,461,491,512] as const;

const pulse = (frame:number, hits:readonly number[], decay=7) => {
  let p = 0;
  for (const h of hits) {
    const d = frame - h;
    if (d >= 0 && d <= decay) p = Math.max(p, Math.pow(1 - d / decay, 2));
  }
  return p;
};

const hit = (frame:number) => pulse(frame, STRONG, 8);
const flashHit = (frame:number) => pulse(frame, STRONG, 3);

const appear = (frame:number, start:number, duration=7) => interpolate(frame,[start,start+duration],[0,1],clamp);
const vanish = (frame:number, end:number, duration=5) => interpolate(frame,[end-duration,end],[1,0],clamp);

const Meta:React.FC<{label:string;dark?:boolean}> = ({label,dark=false}) => (
  <div style={{position:"absolute",left:62,top:65,fontFamily:FONT,fontSize:19,fontWeight:800,letterSpacing:6,color:dark?"rgba(0,0,0,.55)":"rgba(255,255,255,.55)",zIndex:20}}>
    {label}
  </div>
);

const Grid:React.FC<{dark?:boolean}> = ({dark=false}) => (
  <AbsoluteFill style={{
    backgroundImage:`linear-gradient(${dark?"rgba(0,0,0,.055)":"rgba(255,255,255,.055)"} 1px,transparent 1px),linear-gradient(90deg,${dark?"rgba(0,0,0,.055)":"rgba(255,255,255,.055)"} 1px,transparent 1px)`,
    backgroundSize:"54px 54px",
    pointerEvents:"none",
  }}/>
);

const BeatFx:React.FC = () => {
  const f=useCurrentFrame();
  const p=hit(f);
  const flash=flashHit(f);
  return <>
    <AbsoluteFill style={{pointerEvents:"none",background:`rgba(255,255,255,${flash*.32})`,mixBlendMode:"screen",zIndex:90}}/>
    <div style={{position:"absolute",left:0,right:0,top:`${45+Math.sin(f*.7)*10}%`,height:2+p*12,background:PURPLE,opacity:p*.85,transform:`scaleX(${Math.max(.05,p)})`,zIndex:91}}/>
    <AbsoluteFill style={{pointerEvents:"none",boxShadow:`inset 0 0 ${70+p*80}px rgba(0,0,0,.42)`,zIndex:89}}/>
  </>;
};

const PopWord:React.FC<{text:string;start:number;end:number;size?:number;color?:string;align?:"left"|"center";x?:number;y?:number;outline?:boolean}> = ({text,start,end,size=150,color=WHITE,align="left",x=60,y=700,outline=false}) => {
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  if (f < start || f >= end) return null;
  const s=spring({frame:f-start,fps,config:{damping:9,stiffness:240,mass:.55}});
  const out=vanish(f,end,4);
  const p=hit(f);
  return <div style={{
    position:"absolute",left:x,right:align==="center"?x:undefined,top:y,
    fontFamily:DISPLAY,fontWeight:900,fontSize:size,lineHeight:.82,letterSpacing:"-.065em",
    color:outline?"transparent":color,WebkitTextStroke:outline?`3px ${color}`:undefined,
    textAlign:align,textTransform:"uppercase",whiteSpace:"pre-line",zIndex:30,
    opacity:appear(f,start,3)*out,
    transform:`translateY(${(1-s)*80-p*6}px) scale(${.72+s*.28+p*.035}) skewX(${(1-s)*-8}deg)`,
    filter:`blur(${(1-s)*8}px)`,
  }}>{text}</div>;
};

const NoirImage:React.FC<{src:string;start:number;end:number;mode?:"full"|"panel-left"|"panel-right"|"strip";position?:string;opacity?:number}> = ({src,start,end,mode="full",position="center",opacity=.72}) => {
  const f=useCurrentFrame();
  if(f<start||f>=end)return null;
  const p=hit(f);
  const enter=appear(f,start,8);
  const base:React.CSSProperties={position:"absolute",overflow:"hidden",zIndex:4};
  if(mode==="panel-left") Object.assign(base,{left:0,top:0,bottom:0,width:"62%"});
  else if(mode==="panel-right") Object.assign(base,{right:0,top:0,bottom:0,width:"62%"});
  else if(mode==="strip") Object.assign(base,{left:"24%",top:0,bottom:0,width:"52%"});
  else Object.assign(base,{inset:0});
  return <div style={base}>
    <Img src={staticFile(src)} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:position,filter:"grayscale(1) contrast(1.45) brightness(.72)",opacity:opacity*enter,transform:`scale(${1.08+(1-enter)*.08+p*.028}) translate3d(${Math.sin(f/18)*3}px,${Math.cos(f/21)*3}px,0)`}}/>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,.20),rgba(0,0,0,.05) 45%,rgba(0,0,0,.48))"}}/>
  </div>;
};

const Hook:React.FC = () => {
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:BLACK}}>
    <Grid/><Meta label="TARUN / 001"/>
    <PopWord text="NOT" start={8} end={13} size={250} align="center" x={70} y={650}/>
    <PopWord text="JUST" start={13} end={17} size={220} align="center" x={70} y={650} color={PURPLE}/>
    <PopWord text="CODE" start={17} end={21} size={240} align="center" x={70} y={650}/>
    <PopWord text="BUILT TO CREATE" start={21} end={34} size={125} align="center" x={70} y={680}/>
    <div style={{position:"absolute",bottom:120,left:62,fontFamily:FONT,fontSize:18,letterSpacing:5,color:"rgba(255,255,255,.42)"}}>AI × CODE × MOTION</div>
  </AbsoluteFill>;
};

const TarunReveal:React.FC = () => {
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:BLACK}}>
    <Grid/><NoirImage src="reel-assets/03-halo.png" start={34} end={123} mode="strip" position="center 34%" opacity={.9}/>
    <Meta label="IDENTITY / TARUN"/>
    <div style={{position:"absolute",left:-45,top:255,fontFamily:DISPLAY,fontWeight:900,fontSize:330,letterSpacing:"-.09em",color:"rgba(255,255,255,.055)",zIndex:5,transform:`translateX(${interpolate(f,[34,123],[-40,90],clamp)}px)`}}>TARUN</div>
    <PopWord text="TARUN" start={52} end={74} size={190} x={66} y={1190}/>
    <PopWord text="AI DEVELOPER" start={76} end={94} size={86} x={68} y={1375} color={PURPLE}/>
    <PopWord text="CREATIVE TECHNOLOGIST" start={96} end={118} size={58} x={68} y={1480}/>
    <div style={{position:"absolute",left:65,right:65,bottom:135,height:2,background:"rgba(255,255,255,.24)",zIndex:20}}/>
  </AbsoluteFill>;
};

const TripleHit:React.FC = () => (
  <AbsoluteFill style={{background:WHITE}}>
    <Grid dark/><Meta label="SIGNAL / 002" dark/>
    <NoirImage src="reel-assets/01-work.png" start={123} end={161} mode="panel-right" position="62% center" opacity={.76}/>
    <PopWord text="AI" start={123} end={127} size={260} x={50} y={530} color={BLACK}/>
    <PopWord text="CODE" start={127} end={131} size={195} x={50} y={570} color={BLACK}/>
    <PopWord text="MOTION" start={131} end={155} size={142} x={50} y={590} color={PURPLE}/>
  </AbsoluteFill>
);

const RoleScene:React.FC = () => (
  <AbsoluteFill style={{background:BLACK}}>
    <Grid/><NoirImage src="reel-assets/01-work.png" start={161} end={221} mode="panel-left" position="45% center" opacity={.78}/><Meta label="ROLE / 003"/>
    <PopWord text="AI" start={161} end={177} size={300} x={610} y={480}/>
    <PopWord text="DEVELOPER" start={177} end={191} size={105} x={575} y={730} color={PURPLE}/>
    <PopWord text="CREATIVE" start={191} end={205} size={112} x={550} y={1080}/>
    <PopWord text="TECHNOLOGIST" start={205} end={221} size={72} x={545} y={1200}/>
  </AbsoluteFill>
);

const OneBox:React.FC = () => (
  <AbsoluteFill style={{background:WHITE}}>
    <Grid dark/><NoirImage src="reel-assets/02-smoke.png" start={221} end={277} mode="panel-right" position="center top" opacity={.66}/><Meta label="MINDSET / 004" dark/>
    <PopWord text="NO" start={221} end={236} size={300} x={45} y={500} color={BLACK}/>
    <PopWord text="ONE" start={236} end={251} size={220} x={45} y={700} color={BLACK}/>
    <PopWord text="BOX" start={251} end={274} size={235} x={45} y={900} color={PURPLE}/>
    <div style={{position:"absolute",left:52,bottom:200,fontFamily:FONT,fontWeight:800,fontSize:24,letterSpacing:6,color:"rgba(0,0,0,.6)",zIndex:20}}>I DON’T STAY IN ONE BOX.</div>
  </AbsoluteFill>
);

const Breath:React.FC = () => (
  <AbsoluteFill style={{background:BLACK}}>
    <NoirImage src="reel-assets/04-workspace.png" start={277} end={326} mode="full" position="center" opacity={.72}/><Grid/><Meta label="PROCESS / 005"/>
    <PopWord text="BUILD" start={277} end={296} size={190} x={58} y={1080}/>
    <PopWord text="WHAT" start={296} end={310} size={120} x={62} y={1260} color={PURPLE}/>
    <PopWord text="I IMAGINE" start={310} end={326} size={104} x={62} y={1380}/>
  </AbsoluteFill>
);

const FourBeat:React.FC = () => (
  <AbsoluteFill style={{background:WHITE}}>
    <Grid dark/><Meta label="LOOP / 006" dark/>
    <PopWord text="BUILD" start={326} end={341} size={210} align="center" x={55} y={600} color={BLACK}/>
    <PopWord text="BREAK" start={341} end={356} size={210} align="center" x={55} y={600} color={PURPLE}/>
    <PopWord text="LEARN" start={356} end={371} size={210} align="center" x={55} y={600} color={BLACK}/>
    <PopWord text="REPEAT" start={371} end={396} size={190} align="center" x={55} y={600} color={BLACK}/>
    <NoirImage src="reel-assets/03-halo.png" start={326} end={396} mode="strip" position="center" opacity={.16}/>
  </AbsoluteFill>
);

const Disciplines:React.FC = () => (
  <AbsoluteFill style={{background:BLACK}}>
    <Grid/><NoirImage src="reel-assets/04-workspace.png" start={396} end={491} mode="panel-left" position="center" opacity={.42}/><Meta label="DISCIPLINES / 007"/>
    <PopWord text="AI" start={401} end={418} size={250} x={590} y={430}/>
    <PopWord text="CODE" start={431} end={448} size={180} x={560} y={640} color={PURPLE}/>
    <PopWord text="3D" start={461} end={477} size={240} x={615} y={850}/>
    <PopWord text="AUTOMATION" start={491} end={509} size={74} x={535} y={1120}/>
  </AbsoluteFill>
);

const Finale:React.FC = () => {
  const f=useCurrentFrame();
  return <AbsoluteFill style={{background:BLACK}}>
    <Grid/><NoirImage src="reel-assets/03-halo.png" start={512} end={597} mode="full" position="center" opacity={.60}/><Meta label="FINAL / TARUN"/>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,.3),rgba(0,0,0,.72))",zIndex:6}}/>
    <PopWord text="TARUN" start={512} end={532} size={200} align="center" x={55} y={650}/>
    <PopWord text="BUILDING" start={532} end={552} size={120} align="center" x={55} y={690} color={PURPLE}/>
    <PopWord text="WHAT’S NEXT" start={552} end={577} size={105} align="center" x={55} y={700}/>
    <div style={{position:"absolute",left:390,right:390,bottom:270,height:6,background:PURPLE,zIndex:30,transform:`scaleX(${appear(f,550,12)})`}}/>
    <div style={{position:"absolute",bottom:175,width:"100%",textAlign:"center",fontFamily:FONT,fontWeight:800,fontSize:20,letterSpacing:7,color:"rgba(255,255,255,.58)",zIndex:30}}>AI × CODE × CREATIVITY</div>
  </AbsoluteFill>
};

export const TarunReelV5:React.FC = () => {
  const f=useCurrentFrame();
  const p=hit(f);
  const cameraX=Math.sin(f*.9)*p*4;
  const cameraY=Math.cos(f*.7)*p*3;
  return <AbsoluteFill style={{background:BLACK}}>
    <Audio src={staticFile("instagram-reel-audio-192kbps.mp3")} volume={1}/>
    <AbsoluteFill style={{transform:`translate3d(${cameraX}px,${cameraY}px,0) scale(${1+p*.004})`}}>
      {f < 34 && <Hook/>}
      {f >= 34 && f < 123 && <TarunReveal/>}
      {f >= 123 && f < 161 && <TripleHit/>}
      {f >= 161 && f < 221 && <RoleScene/>}
      {f >= 221 && f < 277 && <OneBox/>}
      {f >= 277 && f < 326 && <Breath/>}
      {f >= 326 && f < 396 && <FourBeat/>}
      {f >= 396 && f < 512 && <Disciplines/>}
      {f >= 512 && <Finale/>}
    </AbsoluteFill>
    <BeatFx/>
  </AbsoluteFill>;
};

export const V5Composition:React.FC = () => (
  <Composition id="TarunReelV5" component={TarunReelV5} durationInFrames={DURATION} fps={FPS} width={1080} height={1920}/>
);
