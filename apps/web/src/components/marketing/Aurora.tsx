"use client";
import { useEffect, useRef } from "react";
export default function Aurora({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let animId: number, t = 0;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      const { width: w, height: h } = canvas; ctx.clearRect(0, 0, w, h);
      const waves: [string,number,number,number][] = [["rgba(17,152,34,0.18)",0.0008,0.22,1.4],["rgba(49,203,0,0.10)",0.0013,0.18,2.1],["rgba(30,68,30,0.25)",0.0006,0.28,0.9]];
      waves.forEach(([color,speed,amp,freq]) => {
        ctx.beginPath(); ctx.moveTo(0, h * 0.5);
        for (let x = 0; x <= w; x += 4) {
          const y = h*0.5 + Math.sin(x*freq*0.003+t*speed*1000)*h*amp + Math.cos(x*0.005+t*speed*700)*h*amp*0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      });
      t++; animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId); };
  }, []);
  return <canvas ref={canvasRef} className={"absolute inset-0 w-full h-full " + className} style={{ pointerEvents: "none" }} />;
}
