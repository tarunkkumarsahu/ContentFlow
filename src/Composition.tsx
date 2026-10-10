import React from 'react';
import {AbsoluteFill, Composition, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';

const PURPLE = '#a78bfa';
const clamp = {extrapolateLeft:'clamp' as const, extrapolateRight:'clamp' as const};
const fade = (f:number,a:number,b:number,c:number,d:number) => interpolate(f,[a,b,c,d],[0,1,1,0],clamp);
const ease = (f:number,start:number,duration:number) => Math.min(1,Math.max(0,(f-start)/duration));

const Scene:React.FC<{start:number;end:number;children:React.ReactNode;background?:string}> = ({start,end,children,background='#08080b'}) => {
 const f=useCurrentFrame(); const opacity=fade(f,start,start+8,end-9,end);
 return <AbsoluteFill style={{background,opacity,overflow:'hidden'}}>{children}</AbsoluteFill>;
};
const Kinetic:React.FC<{text:string;start:number;size?:number;color?:string;align?:'left'|'center';top?:number;weight?:number}> = ({text,start,size=100,color='#fff',align='center',top=0,weight=900}) => {
 const f=useCurrentFrame(); const {fps}=useVideoConfig();
 const p=spring({frame:f-start,fps,config:{damping:17,stiffness:135,mass:.7}});
 return <div style={{opacity:ease(f,start,9),transform:`translateY(${(1-p)*125}px) skewY(${(1-p)*-5}deg)`,fontFamily:'Arial, Helvetica, sans-serif',fontSize:size,fontWeight:weight,letterSpacing:'-.065em',lineHeight:.94,color,textAlign:align,whiteSpace:'pre-line',textTransform:'uppercase',position:'relative',top}}>{text}</div>;
};
const Rule:React.FC<{start:number;top?:string}> = ({start,top='50%'}) => {const f=useCurrentFrame();return <div style={{position:'absolute',top,left:'8%',height:3,width:`${ease(f,start,17)*84}%`,background:PURPLE}}/>};
const Photo:React.FC<{start:number;scale?:number}> = ({start,scale=1}) => {const f=useCurrentFrame();const {fps}=useVideoConfig();const p=spring({frame:f-start,fps,config:{damping:20,stiffness:90}});return <Img src={staticFile('tarun.png')} style={{position:'absolute',width:'110%',height:'auto',bottom:'11%',left:'-5%',objectFit:'contain',transform:`translateY(${(1-p)*220}px) scale(${scale+(1-p)*.13})`,filter:'drop-shadow(0 15px 45px rgba(0,0,0,.5))'}}/>};
const Label:React.FC<{children:React.ReactNode;dark?:boolean}> = ({children,dark=false}) => <div style={{fontFamily:'Arial, sans-serif',fontSize:27,fontWeight:700,letterSpacing:7,color:dark?'#17171c':'#b7b1c9'}}>{children}</div>;

export const TarunReel:React.FC = () => {const f=useCurrentFrame();return <AbsoluteFill style={{background:'#08080b'}}>
 <Scene start={0} end={105}>
  <div style={{position:'absolute',left:70,top:140}}><Label>CREATIVE INTRODUCTION / 001</Label></div>
  <AbsoluteFill style={{justifyContent:'center',padding:70}}><Kinetic text="NOT JUST" start={6} size={145} align="left"/><Kinetic text="CODE." start={21} size={215} color={PURPLE} align="left"/></AbsoluteFill>
  <Rule start={38} top="72%"/>
  <div style={{position:'absolute',bottom:175,right:80}}><Label>IDEAS INTO REALITY</Label></div>
 </Scene>
 <Scene start={100} end={265} background="#f4f3f0">
  <div style={{position:'absolute',left:68,top:150}}><Label dark>HELLO, I'M</Label></div>
  <div style={{position:'absolute',left:45,top:320,zIndex:0,opacity:.13,transform:`translateX(${interpolate(f,[100,260],[-70,45],clamp)}px)`}}><span style={{fontFamily:'Arial',fontWeight:900,fontSize:270,letterSpacing:-22,color:'#111'}}>TARUN</span></div>
  <Photo start={114}/>
  <div style={{position:'absolute',left:65,bottom:225,zIndex:2}}><Kinetic text="TARUN." start={142} size={180} color="#14141a" align="left"/><div style={{height:13,width:350,background:PURPLE,marginTop:20}}/></div>
  <div style={{position:'absolute',bottom:95,left:70}}><Label dark>AI DEVELOPER / CREATIVE MIND</Label></div>
 </Scene>
 <Scene start={260} end={410}>
  <div style={{position:'absolute',left:65,top:155}}><Label>WHAT I DO</Label></div>
  <AbsoluteFill style={{justifyContent:'center',padding:60,gap:42}}>
   <Kinetic text="ARTIFICIAL" start={275} size={108} align="left"/>
   <Kinetic text="INTELLIGENCE" start={297} size={102} color={PURPLE} align="left"/>
   <Kinetic text="DEVELOPMENT." start={326} size={112} align="left"/>
  </AbsoluteFill>
  <Rule start={350} top="78%"/>
 </Scene>
 <Scene start={405} end={555} background="#f4f3f0">
  <div style={{position:'absolute',left:60,top:170}}><Label dark>MORE THAN ONE DISCIPLINE</Label></div>
  <AbsoluteFill style={{justifyContent:'center',padding:55,gap:38}}>
   <Kinetic text="SOFTWARE." start={420} size={142} color="#101015" align="left"/>
   <Kinetic text="CREATIVITY." start={447} size={126} color="#101015" align="left"/>
   <Kinetic text="EXPERIMENTS." start={475} size={111} color="#6d42d8" align="left"/>
  </AbsoluteFill>
 </Scene>
 <Scene start={550} end={730}>
  <div style={{position:'absolute',left:60,top:160}}><Label>MY MINDSET</Label></div>
  <AbsoluteFill style={{justifyContent:'center',alignItems:'center',gap:38}}>
   <Kinetic text="I BUILD." start={565} size={170}/>
   <Kinetic text="I LEARN." start={605} size={170} color={PURPLE}/>
   <Kinetic text="I EVOLVE." start={645} size={165}/>
  </AbsoluteFill>
 </Scene>
 <Scene start={725} end={900} background="#f4f3f0">
  <AbsoluteFill style={{justifyContent:'center',alignItems:'center',padding:50}}>
   <Kinetic text="TARUN." start={745} size={220} color="#111117"/>
   <div style={{marginTop:48,opacity:ease(f,770,20),transform:`translateY(${(1-ease(f,770,20))*25}px)`}}><Label dark>BUILDING WHAT'S NEXT.</Label></div>
   <div style={{width:220,height:8,background:PURPLE,marginTop:35,transform:`scaleX(${ease(f,790,20)})`}}/>
  </AbsoluteFill>
  <div style={{position:'absolute',bottom:120,width:'100%',textAlign:'center'}}><Label dark>AI / CODE / CREATIVITY</Label></div>
 </Scene>
 </AbsoluteFill>};

export const MyComposition:React.FC = () => <Composition id="TarunReel" component={TarunReel} durationInFrames={900} fps={30} width={1080} height={1920}/>;
