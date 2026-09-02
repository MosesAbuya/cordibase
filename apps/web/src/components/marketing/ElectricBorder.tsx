"use client";
import { useEffect, useRef, useCallback, ReactNode, CSSProperties } from "react";
import "./ElectricBorder.css";

interface ElectricBorderProps {
  children: ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  borderRadius?: number;
  className?: string;
  style?: CSSProperties;
}

export default function ElectricBorder({
  children, color="#119822", speed=1, chaos=0.12,
  borderRadius=24, className, style
}: ElectricBorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  const random = useCallback((x: number) => (Math.sin(x*12.9898)*43758.5453)%1,[]);

  const noise2D = useCallback((x:number,y:number)=>{
    const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j;
    const a=random(i+j*57),b=random(i+1+j*57),c=random(i+(j+1)*57),d=random(i+1+(j+1)*57);
    const ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);
    return a*(1-ux)*(1-uy)+b*ux*(1-uy)+c*(1-ux)*uy+d*ux*uy;
  },[random]);

  const octavedNoise = useCallback((x:number,octaves:number,lacunarity:number,gain:number,baseAmplitude:number,baseFrequency:number,time:number,seed:number,baseFlatness:number)=>{
    let y=0,amplitude=baseAmplitude,frequency=baseFrequency;
    for(let i=0;i<octaves;i++){
      const oa=i===0?amplitude*baseFlatness:amplitude;
      y+=oa*noise2D(frequency*x+seed*100,time*frequency*0.3);
      frequency*=lacunarity; amplitude*=gain;
    }
    return y;
  },[noise2D]);

  const getCornerPoint = useCallback((cx:number,cy:number,r:number,startAngle:number,arcLen:number,progress:number)=>({
    x:cx+r*Math.cos(startAngle+progress*arcLen),
    y:cy+r*Math.sin(startAngle+progress*arcLen)
  }),[]);

  const getRoundedRectPoint = useCallback((t:number,left:number,top:number,width:number,height:number,radius:number)=>{
    const sw=width-2*radius,sh=height-2*radius;
    const cA=(Math.PI*radius)/2;
    const total=2*sw+2*sh+4*cA;
    let d=t*total,acc=0;
    if(d<=acc+sw){return{x:left+radius+(d-acc)/sw*sw,y:top};}
    acc+=sw;
    if(d<=acc+cA){return getCornerPoint(left+width-radius,top+radius,radius,-Math.PI/2,Math.PI/2,(d-acc)/cA);}
    acc+=cA;
    if(d<=acc+sh){return{x:left+width,y:top+radius+(d-acc)/sh*sh};}
    acc+=sh;
    if(d<=acc+cA){return getCornerPoint(left+width-radius,top+height-radius,radius,0,Math.PI/2,(d-acc)/cA);}
    acc+=cA;
    if(d<=acc+sw){return{x:left+width-radius-(d-acc)/sw*sw,y:top+height};}
    acc+=sw;
    if(d<=acc+cA){return getCornerPoint(left+radius,top+height-radius,radius,Math.PI/2,Math.PI/2,(d-acc)/cA);}
    acc+=cA;
    if(d<=acc+sh){return{x:left,y:top+height-radius-(d-acc)/sh*sh};}
    acc+=sh;
    return getCornerPoint(left+radius,top+radius,radius,Math.PI,Math.PI/2,(d-acc)/cA);
  },[getCornerPoint]);

  useEffect(()=>{
    const canvas=canvasRef.current,container=containerRef.current;
    if(!canvas||!container) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    const octaves=10,lacunarity=1.6,gain=0.7,amplitude=chaos,frequency=10,baseFlatness=0,displacement=60,borderOffset=60;
    const updateSize=()=>{
      const rect=container.getBoundingClientRect();
      const w=rect.width+borderOffset*2,h=rect.height+borderOffset*2;
      const dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=w*dpr; canvas.height=h*dpr;
      canvas.style.width=w+"px"; canvas.style.height=h+"px";
      ctx.scale(dpr,dpr);
      return{width:w,height:h};
    };
    let{width,height}=updateSize();
    let lastDpr=Math.min(window.devicePixelRatio||1,2);
    const drawFrame=(currentTime:number)=>{
      const dpr=Math.min(window.devicePixelRatio||1,2);
      if(dpr!==lastDpr){lastDpr=dpr;const s=updateSize();width=s.width;height=s.height;}
      const delta=(currentTime-lastFrameTimeRef.current)/1000;
      timeRef.current+=delta*speed; lastFrameTimeRef.current=currentTime;
      ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.scale(dpr,dpr);
      ctx.strokeStyle=color; ctx.lineWidth=1; ctx.lineCap="round"; ctx.lineJoin="round";
      const left=borderOffset,top=borderOffset;
      const bw=width-2*borderOffset,bh=height-2*borderOffset;
      const maxR=Math.min(bw,bh)/2,r=Math.min(borderRadius,maxR);
      const approxP=2*(bw+bh)+2*Math.PI*r,samples=Math.floor(approxP/2);
      ctx.beginPath();
      for(let i=0;i<=samples;i++){
        const prog=i/samples;
        const pt=getRoundedRectPoint(prog,left,top,bw,bh,r);
        const xN=octavedNoise(prog*8,octaves,lacunarity,gain,amplitude,frequency,timeRef.current,0,baseFlatness);
        const yN=octavedNoise(prog*8,octaves,lacunarity,gain,amplitude,frequency,timeRef.current,1,baseFlatness);
        const dx=pt.x+xN*displacement,dy=pt.y+yN*displacement;
        i===0?ctx.moveTo(dx,dy):ctx.lineTo(dx,dy);
      }
      ctx.closePath(); ctx.stroke();
      animationRef.current=requestAnimationFrame(drawFrame);
    };
    const ro=new ResizeObserver(()=>{const s=updateSize();width=s.width;height=s.height;});
    ro.observe(container);
    animationRef.current=requestAnimationFrame(drawFrame);
    return()=>{cancelAnimationFrame(animationRef.current);ro.disconnect();};
  },[color,speed,chaos,borderRadius,octavedNoise,getRoundedRectPoint]);

  const vars={"--electric-border-color":color,borderRadius} as CSSProperties;
  return (
    <div ref={containerRef} className={("electric-border "+(className??"")).trim()} style={{...vars,...style}}>
      <div className="eb-canvas-container"><canvas ref={canvasRef} className="eb-canvas"/></div>
      <div className="eb-layers"><div className="eb-glow-1"/><div className="eb-glow-2"/><div className="eb-background-glow"/></div>
      <div className="eb-content">{children}</div>
    </div>
  );
}
