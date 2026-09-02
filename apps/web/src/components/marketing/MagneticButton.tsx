"use client";
import { useRef, MouseEvent, ReactNode, CSSProperties } from "react";
export default function MagneticButton({ children, className = "", href, style }: { children: ReactNode; className?: string; href?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.35}px,${(e.clientY-r.top-r.height/2)*0.35}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  return (
    <a ref={ref} href={href||"#"} onMouseMove={onMove} onMouseLeave={onLeave}
      className={className} style={{ transition:"transform 0.3s cubic-bezier(0.23,1,0.32,1)", display:"inline-flex", ...style }}>
      {children}
    </a>
  );
}
