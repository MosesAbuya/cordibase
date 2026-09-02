"use client";
import { useRef, MouseEvent, ReactNode, CSSProperties } from "react";
export default function TiltCard({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const rotX = ((e.clientY-r.top-r.height/2)/(r.height/2))*-10;
    const rotY = ((e.clientX-r.left-r.width/2)/(r.width/2))*10;
    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ transition:"transform 0.15s ease", transformStyle:"preserve-3d", willChange:"transform", ...style }}>{children}</div>;
}
