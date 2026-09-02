"use client";
import { useEffect, useRef } from "react";
interface P { x:number; y:number; vx:number; vy:number; r:number; alpha:number; pulse:number; }
export default function Particles({ count = 60 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let animId: number, particles: P[] = [];
    const resize = () => {
      canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
      particles = Array.from({length:count}, () => ({
        x:Math.random()*canvas.width, y:Math.random()*canvas.height,
        vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3,
        r:Math.random()*1.5+0.5, alpha:Math.random()*0.4+0.1, pulse:Math.random()*Math.PI*2 }));
    };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.pulse += 0.02;
        const a = p.alpha*(0.6+0.4*Math.sin(p.pulse));
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(49,203,0,${a.toFixed(2)})`; ctx.fill();
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
        if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize",resize); cancelAnimationFrame(animId); };
  }, [count]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents:"none" }} />;
}
