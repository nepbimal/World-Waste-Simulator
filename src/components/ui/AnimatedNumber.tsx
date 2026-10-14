"use client";

import { useEffect, useState } from "react";
import { useInView, useReducedMotion, useTween } from "./hooks";

// A number that glides to its new value whenever it changes.
export function AnimatedNumber({ value, format, className = "" }: { value: number; format: (n: number) => string; className?: string }) {
  const v = useTween(value);
  return <span className={`tabular-nums ${className}`}>{format(v)}</span>;
}

// A number that counts up from `from` to `to` the first time it scrolls into view.
export function CountUp({ to, from = 0, duration = 1800, format, className = "" }: { to: number; from?: number; duration?: number; format: (n: number) => string; className?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4);
  const reduced = useReducedMotion();
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!seen) return;
    if (reduced) {
      const id = requestAnimationFrame(() => setV(to));
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setV(from + (to - from) * (1 - Math.pow(1 - t, 4)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, from, duration, reduced]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{format(v)}</span>;
}
