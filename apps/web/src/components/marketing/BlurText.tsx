"use client";
import { useEffect, useRef, useState } from "react";
interface BlurTextProps { text: string; className?: string; delay?: number; }
export default function BlurText({ text, className = "", delay = 0 }: BlurTextProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <span ref={ref} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} style={{ display:"inline-block", marginRight:"0.25em",
          opacity: visible ? 1 : 0, filter: visible ? "blur(0px)" : "blur(12px)",
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: `opacity 0.7s ease ${delay+i*0.08}s,filter 0.7s ease ${delay+i*0.08}s,transform 0.7s ease ${delay+i*0.08}s` }}>{word}</span>
      ))}
    </span>
  );
}
