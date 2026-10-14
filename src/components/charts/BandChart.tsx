"use client";

import { END_YEAR, START_YEAR } from "@/lib/waste-model";
import type { Band } from "@/lib/swarm-model";
import { C } from "@/lib/format";

const W = 760, H = 280, L = 48, R = 16, T = 16, B = 28;

export function BandChart({ bands, schedule }: { bands: Band[]; schedule: { year: number; rate: number }[] }) {
  const max = Math.max(0.65, ...bands.map((b) => b.p90), ...schedule.map((r) => r.rate)) * 1.05;
  const x = (yr: number) => L + ((yr - START_YEAR) / (END_YEAR - START_YEAR)) * (W - L - R);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const f = (n: number) => n.toFixed(1);
  const band = [...bands.map((b) => `${f(x(b.year))},${f(y(b.p90))}`), ...[...bands].reverse().map((b) => `${f(x(b.year))},${f(y(b.p10))}`)].join(" ");
  const med = bands.map((b, i) => `${i ? "L" : "M"}${f(x(b.year))},${f(y(b.p50))}`).join("");
  const req = schedule.map((r, i) => `${i ? "L" : "M"}${f(x(r.year))},${f(y(r.rate))}`).join("");
  const last = bands[bands.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" role="img" aria-label="Recycling share: simulated range and the path required to hit the target">
      <defs>
        <linearGradient id="gBand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.leaf} stopOpacity="0.1" />
          <stop offset="1" stopColor={C.leaf} stopOpacity="0.32" />
        </linearGradient>
      </defs>
      {[0, 0.2, 0.4, 0.6, 0.8].filter((t) => t <= max).map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={C.grid} />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="13" fill={C.mute} fontFamily="var(--font-inter), sans-serif">{Math.round(t * 100)}%</text>
        </g>
      ))}
      {[2022, 2030, 2040, 2050].map((yr) => (
        <text key={yr} x={x(yr)} y={H - 8} textAnchor="middle" fontSize="13" fill={C.mute} fontFamily="var(--font-inter), sans-serif">{yr}</text>
      ))}
      <polygon points={band} fill="url(#gBand)" className="fade-in" />
      <path d={req} pathLength={1} className="draw" fill="none" stroke={C.gold} strokeWidth="2.4" strokeLinecap="round" />
      <path d={med} pathLength={1} className="draw" fill="none" stroke={C.leaf} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(last.year)} cy={y(last.p50)} r="5" fill={C.leaf} stroke="#06080b" strokeWidth="2" />
    </svg>
  );
}
