"use client";
import { Renderer, Program, Mesh, Color, Triangle, RenderTarget } from "ogl";
import { useEffect, useRef } from "react";
import "./Strands.css";

const MAX_STRANDS = 12;
const MAX_COLORS = 8;

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[${MAX_COLORS}];
uniform int uColorCount, uStrandCount;
uniform float uSpeed,uAmplitude,uWaviness,uThickness,uGlow,uTaper,uSpread,uHueShift,uIntensity,uOpacity,uScale,uSaturation;
out vec4 fragColor;
const float PI = 3.14159265;
vec3 spectrum(float t){ return 0.5+0.5*cos(2.0*PI*(t+vec3(0.00,0.33,0.67))); }
vec3 samplePalette(float t){
  t=fract(t); float sc=t*float(uColorCount);
  int idx=int(floor(sc)); float blend=fract(sc);
  int nxt=idx+1; if(nxt>=uColorCount)nxt=0;
  return mix(uColors[idx],uColors[nxt],blend);
}
vec3 strandColor(float t){ if(uColorCount>0)return samplePalette(t); return spectrum(t); }
void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*uResolution)/uResolution.y;
  uv/=max(uScale,0.0001);
  float e=0.06+uIntensity*0.94;
  float env=pow(max(cos(uv.x*PI*1.3),0.0),uTaper);
  vec3 col=vec3(0.0);
  for(int i=0;i<${MAX_STRANDS};i++){
    if(i>=uStrandCount)break;
    float fi=float(i),ph=fi*1.7*uSpread;
    float freq=(2.0+fi*0.35)*uWaviness,spd=1.4+fi*1.2;
    float tt=uTime*uSpeed;
    float w=sin(uv.x*freq+tt*spd+ph)*0.60+sin(uv.x*freq*1.1-tt*spd*0.7+ph*1.7)*0.40;
    float amp=(0.1+0.02*e)*env*uAmplitude;
    float y=w*amp,d=abs(uv.y-y);
    float thick=(0.001+0.05*e)*(0.35+env)*uThickness;
    float g=thick/(d+thick*0.45); g=g*g;
    float h=fi/float(uStrandCount)+uv.x*0.30+uTime*0.04+uHueShift;
    col+=strandColor(h)*g*env;
  }
  col*=0.45+0.7*e; col=1.0-exp(-col*uGlow);
  float gray=dot(col,vec3(0.2126,0.7152,0.0722));
  col=max(mix(vec3(gray),col,uSaturation),0.0);
  float lum=max(max(col.r,col.g),col.b);
  float alpha=clamp(lum,0.0,1.0)*uOpacity;
  fragColor=vec4(col*uOpacity,alpha);
}`;

interface StrandsProps {
  colors?: string[]; count?: number; speed?: number; amplitude?: number;
  waviness?: number; thickness?: number; glow?: number; taper?: number;
  spread?: number; hueShift?: number; intensity?: number; saturation?: number;
  opacity?: number; scale?: number; className?: string;
  style?: React.CSSProperties;
}

const buildPalette = (colors: string[]) => {
  const filled = colors && colors.length ? colors : ["#ffffff"];
  const padded: number[][] = [];
  for (let i = 0; i < MAX_COLORS; i++) {
    const hex = filled[i] ?? filled[filled.length - 1];
    const c = new Color(hex);
    padded.push([c.r, c.g, c.b]);
  }
  return padded;
};

export default function Strands({
  colors=["#119822","#31cb00","#8bc088"],
  count=3, speed=0.4, amplitude=1, waviness=1, thickness=0.7,
  glow=2.6, taper=3, spread=1, hueShift=0, intensity=0.6,
  saturation=1.5, opacity=1, scale=1.5, className="", style
}: StrandsProps) {
  const propsRef = useRef<StrandsProps>({});
  propsRef.current = { colors,count,speed,amplitude,waviness,thickness,glow,taper,spread,hueShift,intensity,saturation,opacity,scale };
  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctn = ctnDom.current; if (!ctn) return;
    const renderer = new Renderer({ alpha:true, premultipliedAlpha:true, antialias:true });
    const gl = renderer.gl as any;
    gl.clearColor(0,0,0,0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";
    const geometry = new Triangle(gl);
    if ((geometry as any).attributes.uv) delete (geometry as any).attributes.uv;

    const program = new Program(gl, {
      vertex: VERT, fragment: FRAG,
      uniforms: {
        uTime:{value:0}, uResolution:{value:[ctn.offsetWidth,ctn.offsetHeight]},
        uColors:{value:buildPalette(propsRef.current.colors??[])},
        uColorCount:{value:Math.min((propsRef.current.colors??[]).length,MAX_COLORS)},
        uStrandCount:{value:Math.min(count,MAX_STRANDS)},
        uSpeed:{value:speed}, uAmplitude:{value:amplitude}, uWaviness:{value:waviness},
        uThickness:{value:thickness}, uGlow:{value:glow}, uTaper:{value:taper},
        uSpread:{value:spread}, uHueShift:{value:hueShift}, uIntensity:{value:intensity},
        uOpacity:{value:opacity}, uScale:{value:scale}, uSaturation:{value:saturation}
      }
    });
    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    const resize = () => {
      const w = ctn.offsetWidth, h = ctn.offsetHeight;
      renderer.setSize(w,h);
      program.uniforms.uResolution.value = [w,h];
    };
    window.addEventListener("resize", resize); resize();

    let animId = 0;
    const update = (t: number) => {
      animId = requestAnimationFrame(update);
      const p = propsRef.current as Required<StrandsProps>;
      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uColors.value = buildPalette(p.colors);
      program.uniforms.uColorCount.value = Math.min(p.colors.length, MAX_COLORS);
      program.uniforms.uStrandCount.value = Math.min(Math.max(Math.round(p.count),1),MAX_STRANDS);
      program.uniforms.uSpeed.value = p.speed;
      program.uniforms.uAmplitude.value = p.amplitude;
      program.uniforms.uWaviness.value = p.waviness;
      program.uniforms.uThickness.value = p.thickness;
      program.uniforms.uGlow.value = p.glow;
      program.uniforms.uTaper.value = p.taper;
      program.uniforms.uSpread.value = p.spread;
      program.uniforms.uHueShift.value = p.hueShift;
      program.uniforms.uIntensity.value = p.intensity;
      program.uniforms.uOpacity.value = p.opacity;
      program.uniforms.uScale.value = p.scale;
      program.uniforms.uSaturation.value = p.saturation;
      renderer.render({ scene:mesh });
    };
    animId = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      if (ctn && gl.canvas.parentNode === ctn) ctn.removeChild(gl.canvas);
      (gl as any).getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={ctnDom} className={("strands-container " + className).trim()} style={style} />;
}
