"use client";

import type { ElementType, PointerEvent, ReactNode } from "react";

// A surface with a soft light that follows the pointer.
export function GlowCard({ children, className = "", active, as, ...rest }: { children: ReactNode; className?: string; active?: boolean; as?: ElementType } & Record<string, unknown>) {
  const Tag = (as ?? "div") as ElementType;
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Tag className={`glow ${className}`} data-active={active ? "true" : "false"} onPointerMove={onMove} {...rest}>
      {children}
    </Tag>
  );
}
