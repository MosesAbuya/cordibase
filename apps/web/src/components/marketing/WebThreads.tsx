"use client";
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import "./WebThreads.css";

const hexToRgb = (hex: string): [number,number,number] => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return [1,1,1];
  return [parseInt(r[1],16)/255,parseInt(r[2],16)/255,parseInt(r[3],16)/255];
};

const FAN_MODE: Record<string,number> = { center:0, left:1, right:2 };

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position,0.0,1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed,uThreadCount,uFrequency,uSpread,uTaper,uPosition,uFanMode;
uniform float uGlow,uFalloff,uThickness,uBrightness,uOpacity;
uniform float uMirror,uShimmer,uGrain,uGrainIntensity;
uniform vec3 uColor1,uColor2,uColor3;
uniform vec2 uMouse;
uniform float uMouseStrength,uEnableMouse,uMouseActive;
out vec4 fragColor;
#define TAU 6.28318530718
#define MAX_THREADS 10
float glow(float x,float str,float dist){ return dist/pow(max(x,1e-4),str); }
void main(){
  vec2 uv=gl_FragCoord.xy/iResolution.xy;
  float n=max(uThreadCount,1.0);
  float pinchX=uFanMode<0.5?0.5:(uFanMode<1.5?0.0:1.0);
  if(uEnableMouse>0.5) pinchX=mix(pinchX,uMouse.x,clamp(uMouseStrength,0.0,1.0)*uMouseActive);
  float spreadDx=uSpread*abs(uv.x-pinchX);
  float baseT=iTime*uSpeed;
  float tauOverN=TAU/n;
  float mirror=uMirror>0.5?sign(pinchX-uv.x):1.0;
  float invThickness=1.0/max(uThickness,0.01);
  float xFreq=uv.x*uFrequency;
  float yOff=uv.y-uPosition;
  float ciScale=n>1.0?1.0/(n-1.0):0.0;
  vec3 col=vec3(0.0);
  float gsum=0.0;
  for(int idx=0;idx<MAX_THREADS;idx++){
    float i=float(idx);
    if(i>=n) break;
    float amplitude=spreadDx*(1.0+i*uTaper);
    float phase=(baseT+i*tauOverN)*mirror;
    float sdf=abs(yOff+sin(xFreq+phase)*amplitude)*invThickness;
    float g=glow(sdf,uFalloff,uGlow);
    float ci=i*ciScale;
    vec3 threadCol=mix(uColor1,uColor2,ci);
    col+=g*threadCol; gsum+=g;
  }
  float coreAmt=smoothstep(0.5,2.2,gsum);
  col=mix(col,uColor3*gsum,coreAmt*0.5);
  float bright=uBrightness;
  if(uEnableMouse>0.5){
    vec2 md=uv-uMouse;
    bright+=clamp(uMouseStrength,0.0,1.0)*uMouseActive*exp(-dot(md,md)*6.0)*0.6;
  }
  col*=bright;
  float alpha=clamp(gsum,0.0,1.0)*uOpacity;
  vec3 outRgb=col*alpha;
  if(uGrain>0.5){
    float gv=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233))+iTime)*43758.5453)-0.5)*uGrainIntensity;
    outRgb=clamp(outRgb+gv,0.0,1.0);
    alpha=clamp(alpha+gv,0.0,1.0);
  }
  fragColor=vec4(outRgb,alpha);
}`;

const ctxMap = new WeakMap<HTMLElement, any>();

interface WebThreadsProps {
  color1?: string; color2?: string; color3?: string;
  speed?: number; threadCount?: number; frequency?: number;
  spread?: number; taper?: number; position?: number;
  fanMode?: string; glow?: number; falloff?: number;
  thickness?: number; brightness?: number; opacity?: number;
  mirror?: boolean; shimmer?: boolean; grain?: boolean;
  grainIntensity?: number; mouseInteraction?: boolean;
  mouseStrength?: number; className?: string;
}

export default function WebThreads({
  color1="#119822", color2="#31cb00", color3="#ffffff",
  speed=0.2, threadCount=6, frequency=5.0, spread=0.18,
  taper=1.0, position=0.5, fanMode="center",
  glow=0.02, falloff=0.6, thickness=1.1, brightness=0.6,
  opacity=1.0, mirror=true, shimmer=false, grain=true,
  grainIntensity=0.05, mouseInteraction=true, mouseStrength=0.3,
  className=""
}: WebThreadsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ enabled: true, strength: 0.3 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ webgl:2, alpha:true, premultipliedAlpha:true, antialias:false, dpr:Math.min(window.devicePixelRatio||1,2) });
    const gl = renderer.gl as any;
    gl.clearColor(0,0,0,0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width="100%"; canvas.style.height="100%"; canvas.style.display="block";
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const makeVec3 = (hex: string) => { const [r,g,b]=hexToRgb(hex); return new Float32Array([r,g,b]); };

    const program = new Program(gl, {
      vertex, fragment,
      uniforms: {
        iTime:{value:0}, iResolution:{value:new Float32Array([1,1])},
        uSpeed:{value:speed}, uThreadCount:{value:threadCount},
        uFrequency:{value:frequency}, uSpread:{value:spread},
        uTaper:{value:taper}, uPosition:{value:position},
        uFanMode:{value:FAN_MODE[fanMode]??0},
        uGlow:{value:glow}, uFalloff:{value:falloff},
        uThickness:{value:thickness}, uBrightness:{value:brightness},
        uOpacity:{value:opacity}, uMirror:{value:mirror?1.0:0.0},
        uShimmer:{value:shimmer?1.0:0.0}, uGrain:{value:grain?1.0:0.0},
        uGrainIntensity:{value:grainIntensity},
        uColor1:{value:makeVec3(color1)},
        uColor2:{value:makeVec3(color2)},
        uColor3:{value:makeVec3(color3)},
        uMouse:{value:new Float32Array([0.5,0.5])},
        uMouseStrength:{value:mouseStrength},
        uEnableMouse:{value:mouseInteraction?1.0:0.0},
        uMouseActive:{value:0}
      }
    });
    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1,Math.floor(rect.width));
      const h = Math.max(1,Math.floor(rect.height));
      renderer.setSize(w,h);
      const res = program.uniforms.iResolution.value as Float32Array;
      res[0]=gl.drawingBufferWidth; res[1]=gl.drawingBufferHeight;
    };
    const ro = new ResizeObserver(setSize); ro.observe(container); setSize();

    const currMouse=[0.5,0.5], targetMouse=[0.5,0.5];
    let currActive=0, targetActive=0;
    const onMove=(e:MouseEvent)=>{ const r=canvas.getBoundingClientRect(); targetMouse[0]=(e.clientX-r.left)/r.width; targetMouse[1]=1-(e.clientY-r.top)/r.height; targetActive=1; };
    const onEnter=()=>{targetActive=1;};
    const onLeave=()=>{targetActive=0;};
    canvas.addEventListener("mousemove",onMove);
    canvas.addEventListener("mouseenter",onEnter);
    canvas.addEventListener("mouseleave",onLeave);

    let raf=0, isVisible=true, isPageVisible=!document.hidden;
    const t0=performance.now();
    const loop=(t:number)=>{
      program.uniforms.iTime.value=(t-t0)*0.001;
      currMouse[0]+=(targetMouse[0]-currMouse[0])*0.05;
      currMouse[1]+=(targetMouse[1]-currMouse[1])*0.05;
      currActive+=(targetActive-currActive)*0.05;
      (program.uniforms.uMouse.value as Float32Array)[0]=currMouse[0];
      (program.uniforms.uMouse.value as Float32Array)[1]=currMouse[1];
      program.uniforms.uMouseActive.value=currActive;
      program.uniforms.uEnableMouse.value=mouseRef.current.enabled?1.0:0.0;
      renderer.render({ scene:mesh });
      raf=requestAnimationFrame(loop);
    };
    const tryStart=()=>{ if(isVisible&&isPageVisible&&raf===0) raf=requestAnimationFrame(loop); };
    const tryStop=()=>{ if(raf!==0){cancelAnimationFrame(raf);raf=0;} };
    const io=new IntersectionObserver(([e])=>{ isVisible=e.isIntersecting; isVisible?tryStart():tryStop(); },{threshold:0});
    io.observe(container);
    document.addEventListener("visibilitychange",()=>{ isPageVisible=!document.hidden; isPageVisible?tryStart():tryStop(); });
    tryStart();

    return ()=>{
      tryStop(); ro.disconnect(); io.disconnect();
      canvas.removeEventListener("mousemove",onMove);
      canvas.removeEventListener("mouseenter",onEnter);
      canvas.removeEventListener("mouseleave",onLeave);
      ctxMap.delete(container);
      try{container.removeChild(canvas);}catch{}
      (gl as any).getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={containerRef} className={("web-threads-container "+className).trim()} />;
}
