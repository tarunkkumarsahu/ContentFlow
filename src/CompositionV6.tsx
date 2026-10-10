import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
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
const WHITE = "#f4f4f0";
const GREY = "#8c8c88";
const SOFT = "rgba(244,244,240,.72)";
const HAIR = "rgba(244,244,240,.12)";
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
const display = 'Arial Black, Inter, Arial, sans-serif';
const sans = 'Inter, Arial, sans-serif';

const MAJOR = [8,13,17,21,25,48,59,123,127,131,153,159,161,191,205,207,213,220,273,277,288,321,326,333,339,341,356,363,371,393,401,430,453,460,476,479,488,491,512,573] as const;
const HARD = [17,25,59,123,161,191,220,277,341,371,430,491,512,573] as const;

const pulse = (frame:number, hits:readonly number[], decay=6) => {
  let p = 0;
  for (const h of hits) {
    const d = frame - h;
    if (d >= 0 && d <= decay) p = Math.max(p, 1 - d / decay);
  }
  return p;
};
const majorPulse = (f:number) => pulse(f, MAJOR, 5);
const hardPulse = (f:number) => pulse(f, HARD, 8);
const inOut = (f:number, start:number, end:number, edge=5) => interpolate(f,[start,start+edge,end-edge,end],[0,1,1,0],clamp);

const MicroMeta:React.FC<{dark?:boolean; left?:string; right?:string; top?:number; bottom?:number; children:React.ReactNode}> = ({dark=false,left,right,top,bottom,children}) => (
  <div style={{position:'absolute',left,right,top,bottom,fontFamily:sans,fontSize:17,fontWeight:800,letterSpacing:4.5,textTransform:'uppercase',color:dark?'rgba(5,5,5,.62)':'rgba(244,244,240,.62)',zIndex:20}}>{children}</div>
);

const Checker:React.FC<{invert?:boolean; size?:number; opacity?:number}> = ({invert=false,size=86,opacity=.12}) => (
  <AbsoluteFill style={{opacity,backgroundImage:`linear-gradient(45deg, ${invert?'#000':'#fff'} 25%, transparent 25%),linear-gradient(-45deg, ${invert?'#000':'#fff'} 25%, transparent 25%),linear-gradient(45deg, transparent 75%, ${invert?'#000':'#fff'} 75%),linear-gradient(-45deg, transparent 75%, ${invert?'#000':'#fff'} 75%)`,backgroundSize:`${size}px ${size}px`,backgroundPosition:`0 0,0 ${size/2}px,${size/2}px -${size/2}px,-${size/2}px 0px`}} />
);

const Grid:React.FC<{dark?:boolean}> = ({dark=false}) => (
  <AbsoluteFill style={{opacity:.35,backgroundImage:`linear-gradient(${dark?'rgba(0,0,0,.08)':'rgba(255,255,255,.065)'} 1px,transparent 1px),linear-gradient(90deg,${dark?'rgba(0,0,0,.08)':'rgba(255,255,255,.065)'} 1px,transparent 1px)`,backgroundSize:'90px 90px'}} />
);

const Grain:React.FC = () => {
  const f=useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents:'none',mixBlendMode:'overlay',opacity:.08,backgroundImage:'radial-gradient(circle, rgba(255,255,255,.5) 0 1px, transparent 1px)',backgroundSize:`${6+(f%3)}px ${7+(f%4)}px`,zIndex:60}} />;
};

const Scan:React.FC = () => {
  const f=useCurrentFrame();
  const y=(f*13)%1920;
  return <div style={{position:'absolute',left:0,right:0,top:y,height:2,background:'rgba(255,255,255,.16)',boxShadow:'0 0 24px rgba(255,255,255,.16)',zIndex:55,pointerEvents:'none'}}/>;
};

const GlobalImpact:React.FC = () => {
  const f=useCurrentFrame();
  const m=majorPulse(f); const h=hardPulse(f);
  return <>
    <AbsoluteFill style={{pointerEvents:'none',background:h>.7?WHITE:'transparent',opacity:h>.7?(h-.7)*1.6:0,mixBlendMode:'difference',zIndex:80}}/>
    <div style={{position:'absolute',left:0,right:0,top:`${14+(f*7)%72}%`,height:1+m*10,background:WHITE,opacity:m*.55,transform:`scaleX(${Math.min(1,m*1.6)})`,transformOrigin:'center',zIndex:79}} />
    <div style={{position:'absolute',inset:14+h*8,border:`${1+h*5}px solid rgba(255,255,255,${.08+h*.45})`,pointerEvents:'none',zIndex:78}} />
  </>;
};

const ImagePanel:React.FC<{src:string; frame:number; x:number; y:number; w:number; h:number; clip?:string; opacity?:number; objectPosition?:string; rotate?:number; zoom?:number; invert?:boolean}> = ({src,frame,x,y,w,h,clip,opacity=1,objectPosition='center',rotate=0,zoom=1,invert=false}) => {
  const b=majorPulse(frame);
  return <div style={{position:'absolute',left:x,top:y,width:w,height:h,overflow:'hidden',clipPath:clip,transform:`rotate(${rotate}deg) scale(${1+b*.012})`,background:BLACK}}>
    <Img src={staticFile(src)} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition,filter:`grayscale(1) contrast(1.45) brightness(${invert?1.15:.82}) ${invert?'invert(1)':''}`,opacity,transform:`scale(${zoom+b*.025}) translate(${Math.sin(frame/24)*3}px,${Math.cos(frame/31)*3}px)`}} />
  </div>;
};

const Orbit:React.FC<{frame:number; x:number; y:number; size:number; dark?:boolean}> = ({frame,x,y,size,dark=false}) => {
  const p=majorPulse(frame); const c=dark?'#050505':'#f4f4f0';
  return <div style={{position:'absolute',left:x,top:y,width:size,height:size,zIndex:12}}>
    {[1,.72,.43].map((s,i)=><div key={i} style={{position:'absolute',left:'50%',top:'50%',width:`${s*100}%`,height:`${s*100}%`,border:`${i===1?2:1}px solid ${c}`,opacity:.16+i*.1,borderRadius:'50%',transform:`translate(-50%,-50%) rotate(${(frame*(i%2?1:-1)*.8)%360}deg) scale(${1+p*.03})`}} />)}
    <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:1,background:c,opacity:.15,transform:`rotate(${frame*1.3}deg)`,transformOrigin:'50% 50%'}}/>
    <div style={{position:'absolute',left:0,right:0,top:'50%',height:1,background:c,opacity:.1}}/>
    <div style={{position:'absolute',left:'50%',top:'50%',width:10+p*8,height:10+p*8,background:c,borderRadius:'50%',transform:'translate(-50%,-50%)'}}/>
  </div>;
};

const HugeWord:React.FC<{text:string; frame:number; start:number; size?:number; top?:number; left?:number; color?:string; stroke?:boolean; rotate?:number; align?:'left'|'center'; width?:number|string}> = ({text,frame,start,size=180,top=700,left=60,color=WHITE,stroke=false,rotate=0,align='left',width='auto'}) => {
  const {fps}=useVideoConfig();
  const s=spring({frame:frame-start,fps,config:{damping:13,stiffness:220,mass:.6}});
  const b=majorPulse(frame);
  return <div style={{position:'absolute',top,left,width,fontFamily:display,fontSize:size,fontWeight:900,lineHeight:.82,letterSpacing:'-.075em',textTransform:'uppercase',textAlign:align,color:stroke?'transparent':color,WebkitTextStroke:stroke?`2px ${color}`:undefined,transform:`translateY(${(1-s)*110}px) scale(${.84+s*.16+b*.025}) rotate(${rotate+(1-s)*-3}deg)`,filter:`blur(${Math.max(0,(1-s)*9)}px)`,opacity:interpolate(frame-start,[0,3],[0,1],clamp),zIndex:15}}>{text}</div>;
};

const TileWord:React.FC<{text:string; active:boolean; x:number; y:number; w:number; h:number; invert?:boolean}> = ({text,active,x,y,w,h,invert=false}) => <div style={{position:'absolute',left:x,top:y,width:w,height:h,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${invert?'rgba(0,0,0,.14)':'rgba(255,255,255,.14)'}`,background:active?(invert?BLACK:WHITE):'transparent',color:active?(invert?WHITE:BLACK):(invert?BLACK:WHITE),fontFamily:sans,fontWeight:900,fontSize:22,letterSpacing:4,textTransform:'uppercase',transition:'none',zIndex:18}}>{text}</div>;

const Hook:React.FC = () => {
  const f=useCurrentFrame();
  const hits=[8,13,17,21,25];
  const words=['NOT','JUST','CODE','—','TARUN'];
  let idx=0; for(let i=0;i<hits.length;i++) if(f>=hits[i]) idx=i;
  const local=f-hits[idx]; const b=majorPulse(f);
  return <AbsoluteFill style={{background:idx===3?WHITE:BLACK,color:idx===3?BLACK:WHITE,overflow:'hidden'}}>
    <Checker invert={idx===3} size={96} opacity={idx===3?.12:.07}/>
    <MicroMeta left="64px" top={58}>{idx<4?'SIGNAL / 001':'IDENTITY / 001'}</MicroMeta>
    <MicroMeta right="64px" bottom={58}>0{idx+1} / 05</MicroMeta>
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontFamily:display,fontSize:idx===4?230:250,fontWeight:900,letterSpacing:'-.08em',lineHeight:.78,textTransform:'uppercase',transform:`scale(${.72+Math.min(1,local/4)*.28+b*.05}) rotate(${idx===3?-9:0}deg)`,filter:`blur(${Math.max(0,12-local*3)}px)`,opacity:local<0?0:1}}>{words[idx]}</div>
    </div>
    {idx===4 && <>
      <div style={{position:'absolute',left:70,right:70,top:1160,height:1,background:WHITE,opacity:.25}}/>
      <MicroMeta left="72px" top={1190}>AI / SYSTEMS / MOTION</MicroMeta>
    </>}
  </AbsoluteFill>;
};

const NameArchitecture:React.FC = () => {
  const f=useCurrentFrame(); const local=f-48; const phase=f<59?0:f<88?1:2;
  return <AbsoluteFill style={{background:WHITE,color:BLACK,overflow:'hidden'}}>
    <Grid dark/><Checker invert size={74} opacity={.045}/>
    <MicroMeta dark left="60px" top={54}>TARUN / SYSTEM</MicroMeta>
    <MicroMeta dark right="60px" top={54}>AI DEVELOPER</MicroMeta>
    <div style={{position:'absolute',left:-80,top:300,fontFamily:display,fontSize:530,fontWeight:900,letterSpacing:'-.13em',lineHeight:.7,color:'rgba(0,0,0,.055)',transform:`translateX(${interpolate(local,[0,75],[-120,50],clamp)}px)`}}>T</div>
    <ImagePanel src="reel-assets/03-halo.png" frame={f} x={phase===0?500:440} y={phase===0?260:200} w={phase===0?500:600} h={phase===2?1080:920} opacity={.96} objectPosition="center" clip={phase===0?'polygon(12% 0,100% 0,100% 100%,0 86%)':phase===1?'polygon(0 6%,100% 0,88% 100%,8% 92%)':'polygon(8% 0,92% 0,100% 92%,0 100%)'} zoom={1.08}/>
    <Orbit frame={f} x={35} y={810} size={470} dark/>
    {phase===0 && <>
      <HugeWord text="AI" frame={f} start={48} top={445} left={55} size={240} color={BLACK}/>
      <HugeWord text="DEV" frame={f} start={53} top={635} left={55} size={160} color={BLACK} stroke/>
    </>}
    {phase===1 && <>
      <HugeWord text="TARUN" frame={f} start={59} top={1050} left={48} size={205} color={BLACK}/>
      <MicroMeta dark left="60px" top={1258}>BUILDS SYSTEMS / SHAPES IDEAS</MicroMeta>
    </>}
    {phase===2 && <>
      <div style={{position:'absolute',left:60,top:360,width:360,height:520,border:'2px solid #050505',background:'rgba(255,255,255,.62)',backdropFilter:'blur(8px)',zIndex:16,transform:`rotate(-4deg) translateY(${hardPulse(f)*-8}px)`}}>
        <div style={{height:58,borderBottom:'2px solid #050505',display:'flex',alignItems:'center',padding:'0 18px',fontFamily:sans,fontSize:16,fontWeight:900,letterSpacing:3}}>PROFILE://TARUN</div>
        <div style={{padding:22,fontFamily:display,fontSize:70,lineHeight:.82,letterSpacing:'-.06em'}}>AI<br/>CODE<br/>MOTION</div>
        <div style={{position:'absolute',left:22,right:22,bottom:24,fontFamily:sans,fontSize:14,letterSpacing:2.5,lineHeight:1.5}}>CURIOUS BY DEFAULT<br/>BUILDING BY CHOICE</div>
      </div>
    </>}
  </AbsoluteFill>;
};

const LetterDrop:React.FC = () => {
  const f=useCurrentFrame();
  const events=[123,127,131,153,159];
  const letters=['T','A','R','U','N'];
  let idx=0; events.forEach((e,i)=>{if(f>=e) idx=i});
  const split=majorPulse(f);
  return <AbsoluteFill style={{background:BLACK,color:WHITE,overflow:'hidden'}}>
    <Checker size={58} opacity={.08}/><MicroMeta left="60px" top={56}>NAME / ASSEMBLY</MicroMeta>
    <ImagePanel src="reel-assets/02-smoke.png" frame={f} x={0} y={0} w={1080} h={1920} opacity={.23} zoom={1.08}/>
    <div style={{position:'absolute',inset:0,display:'grid',gridTemplateColumns:'repeat(5,1fr)',zIndex:12}}>
      {letters.map((l,i)=><div key={l} style={{borderLeft:i?`1px solid ${HAIR}`:'none',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',background:i===idx?'rgba(255,255,255,.94)':'rgba(0,0,0,.28)',color:i===idx?BLACK:WHITE,transform:`translateY(${i===idx?-split*12:0}px)`}}><div style={{fontFamily:display,fontSize:190,fontWeight:900,transform:`rotate(${i%2?-6:5}deg) scale(${i===idx?1.12:.8})`,opacity:i<=idx?1:.12}}>{l}</div></div>)}
    </div>
    <MicroMeta left="60px" bottom={62}>NOT A LOGO. A SIGNATURE.</MicroMeta>
  </AbsoluteFill>;
};

const CoreStack:React.FC = () => {
  const f=useCurrentFrame();
  const points=[161,191,220]; const words=['AI','CODE','SYSTEMS'];
  let idx=0; points.forEach((e,i)=>{if(f>=e) idx=i});
  const images=['reel-assets/01-work.png','reel-assets/04-workspace.png','reel-assets/03-halo.png'];
  return <AbsoluteFill style={{background:idx===1?WHITE:BLACK,color:idx===1?BLACK:WHITE,overflow:'hidden'}}>
    <Grid dark={idx===1}/><MicroMeta dark={idx===1} left="58px" top={55}>CORE / 0{idx+1}</MicroMeta>
    <ImagePanel src={images[idx]} frame={f} x={idx===1?70:520} y={idx===2?190:300} w={idx===1?940:500} h={idx===1?570:1180} opacity={idx===1?.72:.88} objectPosition="center" clip={idx===0?'polygon(18% 0,100% 0,100% 100%,0 86%)':idx===2?'polygon(0 0,100% 12%,86% 100%,0 100%)':undefined} zoom={1.1}/>
    <HugeWord text={words[idx]} frame={f} start={points[idx]} top={idx===1?910:600} left={idx===0?50:idx===1?70:40} size={idx===2?155:idx===1?240:360} color={idx===1?BLACK:WHITE}/>
    {idx===0 && <><HugeWord text="DEVELOPER" frame={f} start={166} top={900} left={56} size={112} color={WHITE} stroke/><Orbit frame={f} x={80} y={1130} size={340}/></>}
    {idx===1 && <div style={{position:'absolute',left:72,top:1250,width:940,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',borderTop:'2px solid #050505',borderBottom:'2px solid #050505'}}>{['LOGIC','BUILD','SHIP'].map((x,i)=><div key={x} style={{padding:'26px 10px',textAlign:'center',borderLeft:i?'1px solid #050505':'none',fontFamily:sans,fontWeight:900,letterSpacing:5}}>{x}</div>)}</div>}
    {idx===2 && <><div style={{position:'absolute',left:48,top:995,width:420,height:260,border:'1px solid rgba(255,255,255,.25)',display:'grid',gridTemplateColumns:'1fr 1fr',gridTemplateRows:'1fr 1fr',zIndex:20}}>{['MODEL','FLOW','DATA','IDEA'].map((x,i)=><div key={x} style={{display:'flex',alignItems:'center',justifyContent:'center',borderRight:i%2===0?'1px solid rgba(255,255,255,.18)':'none',borderBottom:i<2?'1px solid rgba(255,255,255,.18)':'none',fontFamily:sans,fontSize:17,fontWeight:900,letterSpacing:3}}>{x}</div>)}</div><MicroMeta left="52px" bottom={94}>BUILDING CONNECTED THINKING</MicroMeta></>}
  </AbsoluteFill>;
};

const NoBox:React.FC = () => {
  const f=useCurrentFrame(); const phase=f<273?0:1;
  return <AbsoluteFill style={{background:phase?WHITE:BLACK,color:phase?BLACK:WHITE,overflow:'hidden'}}>
    <Checker invert={phase===1} size={78} opacity={.06}/>
    <ImagePanel src="reel-assets/02-smoke.png" frame={f} x={phase?510:0} y={160} w={570} h={1450} opacity={.72} objectPosition="center" clip={phase?'polygon(8% 0,100% 0,100% 100%,0 92%)':'polygon(0 0,92% 8%,100% 100%,0 100%)'} zoom={1.12}/>
    <div style={{position:'absolute',left:phase?50:570,top:260,width:460,height:1260,border:`2px solid ${phase?BLACK:WHITE}`,zIndex:18,transform:`rotate(${phase?-2:2}deg)`}}/>
    {!phase?<><HugeWord text="DON'T" frame={f} start={220} top={470} left={530} size={150}/><HugeWord text="STAY" frame={f} start={236} top={610} left={530} size={170} stroke/><HugeWord text="IN" frame={f} start={252} top={790} left={530} size={180}/></>:<><HugeWord text="ONE" frame={f} start={273} top={430} left={48} size={190} color={BLACK}/><HugeWord text="BOX" frame={f} start={277} top={620} left={48} size={230} color={BLACK} stroke/><Orbit frame={f} x={70} y={1030} size={360} dark/></>}
    <MicroMeta dark={phase===1} left="56px" bottom={64}>MULTI-DISCIPLINE / SINGLE DIRECTION</MicroMeta>
  </AbsoluteFill>;
};

const InterfaceMontage:React.FC = () => {
  const f=useCurrentFrame();
  const p1=inOut(f,277,321,4), p2=inOut(f,321,341,3);
  return <AbsoluteFill style={{background:WHITE,color:BLACK,overflow:'hidden'}}>
    <Grid dark/><MicroMeta dark left="55px" top={54}>TOOLKIT / LIVE</MicroMeta><Checker invert size={54} opacity={.04}/>
    <div style={{position:'absolute',left:45,top:240,width:990,height:540,border:'2px solid #050505',background:'#f4f4f0',transform:`translateY(${(1-p1)*90}px) rotate(-1.4deg)`,opacity:p1,zIndex:12}}>
      <div style={{height:66,borderBottom:'2px solid #050505',display:'flex',alignItems:'center',padding:'0 20px',fontFamily:sans,fontWeight:900,letterSpacing:4}}>SYSTEM://PROMPT_TO_ACTION</div>
      <div style={{display:'grid',gridTemplateColumns:'1.35fr .65fr',height:472}}>
        <div style={{borderRight:'2px solid #050505',padding:26,fontFamily:'monospace',fontSize:22,lineHeight:1.6}}><div>01&nbsp; input = idea</div><div>02&nbsp; model = reason()</div><div>03&nbsp; code = build()</div><div>04&nbsp; output = motion</div><div style={{marginTop:28,fontFamily:display,fontSize:66,lineHeight:.85}}>MAKE<br/>IT REAL.</div></div>
        <div style={{position:'relative'}}><Orbit frame={f} x={15} y={70} size={280} dark/><div style={{position:'absolute',left:28,right:28,bottom:36,fontFamily:sans,fontSize:14,letterSpacing:2.5}}>SIGNAL LOCKED<br/>STATUS: BUILDING</div></div>
      </div>
    </div>
    <div style={{position:'absolute',left:100,top:840,width:390,height:600,border:'2px solid #050505',background:'#050505',transform:`translateX(${(1-p2)*-160}px) rotate(4deg)`,opacity:p2,zIndex:14}}><ImagePanel src="reel-assets/04-workspace.png" frame={f} x={0} y={0} w={386} h={596} opacity={.9} objectPosition="center" zoom={1.1}/></div>
    <div style={{position:'absolute',right:70,top:930,width:460,height:430,border:'2px solid #050505',background:WHITE,transform:`translateX(${(1-p2)*170}px) rotate(-3deg)`,opacity:p2,zIndex:15,padding:26}}><div style={{fontFamily:sans,fontSize:15,fontWeight:900,letterSpacing:4}}>CREATIVE STACK</div><div style={{marginTop:38,fontFamily:display,fontSize:72,lineHeight:.85,letterSpacing:'-.06em'}}>AI<br/>CODE<br/>MOTION<br/>3D</div><div style={{position:'absolute',right:24,bottom:20,fontFamily:sans,fontSize:13,letterSpacing:2}}>NO SINGLE BOX</div></div>
  </AbsoluteFill>;
};

const DisciplineHits:React.FC = () => {
  const f=useCurrentFrame(); const hits=[341,356,371]; const words=['DESIGN','MOTION','3D']; let idx=0; hits.forEach((h,i)=>{if(f>=h)idx=i});
  return <AbsoluteFill style={{background:BLACK,color:WHITE,overflow:'hidden'}}>
    <Checker size={64} opacity={.05}/><ImagePanel src={idx===0?'reel-assets/01-work.png':idx===1?'reel-assets/02-smoke.png':'reel-assets/04-workspace.png'} frame={f} x={0} y={0} w={1080} h={1920} opacity={.18} zoom={1.18}/>
    <div style={{position:'absolute',left:40,right:40,top:280,bottom:280,border:'1px solid rgba(255,255,255,.18)',transform:`rotate(${idx===1?-2:2}deg)`}}/>
    <HugeWord text={words[idx]} frame={f} start={hits[idx]} top={720} left={idx===1?20:50} size={words[idx]==='MOTION'?155:220} color={WHITE} align="center" width={1000}/>
    <MicroMeta left="55px" top={60}>DISCIPLINE / 0{idx+1}</MicroMeta><MicroMeta right="55px" bottom={60}>FAST / FUNCTIONAL / VISUAL</MicroMeta>
  </AbsoluteFill>;
};

const MethodLoop:React.FC = () => {
  const f=useCurrentFrame(); const hits=[371,393,401,430]; const words=['BUILD','BREAK','LEARN','REPEAT']; let idx=0; hits.forEach((h,i)=>{if(f>=h)idx=i}); const inv=idx%2===1;
  return <AbsoluteFill style={{background:inv?WHITE:BLACK,color:inv?BLACK:WHITE,overflow:'hidden'}}>
    <Grid dark={inv}/>
    <div style={{position:'absolute',left:54,top:250,fontFamily:display,fontSize:420,fontWeight:900,lineHeight:.7,letterSpacing:'-.12em',color:inv?'rgba(0,0,0,.05)':'rgba(255,255,255,.05)'}}>0{idx+1}</div>
    <HugeWord text={words[idx]} frame={f} start={hits[idx]} top={720} left={55} size={words[idx]==='REPEAT'?155:210} color={inv?BLACK:WHITE}/>
    <div style={{position:'absolute',left:60,right:60,bottom:340,height:160,display:'grid',gridTemplateColumns:'repeat(4,1fr)',border:`1px solid ${inv?'rgba(0,0,0,.2)':'rgba(255,255,255,.2)'}`}}>{words.map((w,i)=><TileWord key={w} text={w} active={i===idx} x={i*240} y={0} w={240} h={160} invert={inv}/>)}</div>
    <MicroMeta dark={inv} left="60px" top={58}>PROCESS / LOOP</MicroMeta>
  </AbsoluteFill>;
};

const ShadowSystem:React.FC = () => {
  const f=useCurrentFrame(); const phase=f<453?0:f<476?1:2;
  return <AbsoluteFill style={{background:WHITE,color:BLACK,overflow:'hidden'}}>
    <Checker invert size={88} opacity={.055}/><Grid dark/>
    <ImagePanel src={phase===0?'reel-assets/03-halo.png':phase===1?'reel-assets/01-work.png':'reel-assets/02-smoke.png'} frame={f} x={phase===1?0:430} y={phase===2?240:120} w={phase===1?610:650} h={phase===2?1180:1420} opacity={.95} objectPosition="center" clip={phase===0?'polygon(20% 0,100% 0,100% 100%,0 88%)':phase===1?'polygon(0 0,92% 8%,100% 100%,0 100%)':'polygon(8% 0,100% 0,90% 100%,0 92%)'} zoom={1.08}/>
    <div style={{position:'absolute',left:55,top:200,width:390,height:1260,zIndex:14}}>
      <div style={{fontFamily:display,fontSize:phase===0?245:phase===1?160:185,fontWeight:900,lineHeight:.78,letterSpacing:'-.09em'}}>T<br/>A<br/>R<br/>U<br/>N</div>
    </div>
    {phase===1 && <div style={{position:'absolute',left:80,top:990,width:500,height:250,border:'2px solid #050505',background:'rgba(244,244,240,.9)',zIndex:20,padding:24,transform:'rotate(-3deg)'}}><div style={{fontFamily:sans,fontSize:14,fontWeight:900,letterSpacing:3}}>CURRENT MODE</div><div style={{marginTop:22,fontFamily:display,fontSize:58,lineHeight:.8}}>BUILDING<br/>NEXT.</div></div>}
    {phase===2 && <Orbit frame={f} x={60} y={1080} size={330} dark/>}
    <MicroMeta dark left="58px" top={58}>SIGNATURE / SHADOW</MicroMeta>
  </AbsoluteFill>;
};

const Finale:React.FC = () => {
  const f=useCurrentFrame(); const phase=f<512?0:f<573?1:2;
  return <AbsoluteFill style={{background:phase===2?WHITE:BLACK,color:phase===2?BLACK:WHITE,overflow:'hidden'}}>
    {phase<2 && <ImagePanel src="reel-assets/03-halo.png" frame={f} x={0} y={0} w={1080} h={1920} opacity={phase===0?.32:.18} objectPosition="center" zoom={1.16}/>} 
    <Checker invert={phase===2} size={96} opacity={phase===2?.08:.04}/>
    {phase===0 && <><HugeWord text="TARUN" frame={f} start={491} top={590} left={35} size={230} align="center" width={1010}/><div style={{position:'absolute',left:280,right:280,top:860,height:2,background:WHITE,opacity:.5}}/><MicroMeta left="300px" top={900}>AI DEVELOPER / CREATIVE TECHNOLOGIST</MicroMeta></>}
    {phase===1 && <><HugeWord text="BUILDING" frame={f} start={512} top={510} left={45} size={155} align="center" width={990}/><HugeWord text="WHAT'S NEXT" frame={f} start={528} top={690} left={25} size={135} color={WHITE} stroke align="center" width={1030}/><Orbit frame={f} x={370} y={1040} size={340}/></>}
    {phase===2 && <><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{fontFamily:display,fontSize:250,fontWeight:900,letterSpacing:'-.1em'}}>T.</div></div><MicroMeta dark left="60px" bottom={60}>END / START AGAIN</MicroMeta></>}
  </AbsoluteFill>;
};

export const TarunReelV6:React.FC = () => {
  const f=useCurrentFrame();
  const cam=hardPulse(f);
  return <AbsoluteFill style={{background:BLACK,overflow:'hidden'}}>
    <Audio src={staticFile('instagram-reel-audio-192kbps.mp3')} volume={1}/>
    <AbsoluteFill style={{transform:`translate(${Math.sin(f*2.1)*cam*4}px,${Math.cos(f*1.7)*cam*4}px) scale(${1+cam*.006})`}}>
      {f<48 && <Hook/>}
      {f>=48 && f<123 && <NameArchitecture/>}
      {f>=123 && f<161 && <LetterDrop/>}
      {f>=161 && f<220 && <CoreStack/>}
      {f>=220 && f<277 && <NoBox/>}
      {f>=277 && f<341 && <InterfaceMontage/>}
      {f>=341 && f<371 && <DisciplineHits/>}
      {f>=371 && f<430 && <MethodLoop/>}
      {f>=430 && f<491 && <ShadowSystem/>}
      {f>=491 && <Finale/>}
    </AbsoluteFill>
    <GlobalImpact/><Scan/><Grain/>
  </AbsoluteFill>;
};

export const V6Composition:React.FC = () => <Composition id="TarunReelV6" component={TarunReelV6} durationInFrames={DURATION} fps={FPS} width={1080} height={1920}/>;
