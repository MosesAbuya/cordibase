"use client";

import { ReactNode } from "react";

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-linen dark:bg-ink overflow-y-auto">
      {children}
    </div>
  );
}
