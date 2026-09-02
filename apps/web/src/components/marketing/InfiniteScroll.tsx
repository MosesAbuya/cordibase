"use client";
import { ReactNode } from "react";
export default function InfiniteScroll({ children, speed = 30 }: { children: ReactNode; speed?: number }) {
  const mask = "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)";
  return (
    <div className="relative overflow-hidden w-full" style={{ maskImage: mask, WebkitMaskImage: mask }}>
      <div className="flex gap-12 items-center" style={{ width:"max-content", animation:`infiniteScroll ${speed}s linear infinite` }}>
        {children}{children}
      </div>
      <style>{`@keyframes infiniteScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
