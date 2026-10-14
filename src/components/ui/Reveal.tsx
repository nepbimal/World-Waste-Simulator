"use client";

import type { ReactNode } from "react";
import { useInView } from "./hooks";

export function Reveal({ children, className = "", delay = 0, id }: { children: ReactNode; className?: string; delay?: number; id?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.08);
  return (
    <div ref={ref} id={id} className={`reveal ${seen ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
