"use client";

import { useId, useRef, useState } from "react";
import { C, clamp, fmt, pct } from "@/lib/format";

const W = 800, H = 340, L = 54, R = 18, T = 18, B = 30;

type Props = {
  years: number[];
  generated: number[];
  recovered: number[];
  residual: number[];
  bauGenerated: number[];
  selectedYear: number;
  onSelectYear: (y: number) => void;
};

export function TrajectoryChart({ years, generated, recovered, residual, bauGenerated, selectedYear, onSelectYear }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const n = years.length;
  const rawMax = Math.max(...bauGenerated, ...generated);
  const step = [250, 500, 1000, 2000].find((s) => rawMax / s <= 5) ?? 2000;
  const max = Math.ceil(rawMax / step) * step;
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);
  const x = (i: number) => L + (i / (n - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const line = (a: number[]) => a.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = (a: number[]) => `${line(a)}L${x(n - 1).toFixed(1)},${y(0).toFixed(1)}L${x(0).toFixed(1)},${y(0).toFixed(1)}Z`;
  const idxAt = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    return clamp(Math.round(((px - L) / (W - L - R)) * (n - 1)), 0, n - 1);
  };
  const active = hover ?? selectedYear - years[0];
  const left = (x(active) / W) * 100;

  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        style={{ touchAction: "pan-y" }}
        role="slider"
        tabIndex={0}
        aria-labelledby={`${titleId} ${descId}`}
        aria-valuemin={years[0]}
        aria-valuemax={years[n - 1]}
        aria-valuenow={selectedYear}
        aria-valuetext={`${selectedYear}: ${fmt(generated[selectedYear - years[0]])} Mt generated, ${fmt(recovered[selectedYear - years[0]])} Mt recovered, ${fmt(residual[selectedYear - years[0]])} Mt disposed`}
        onKeyDown={(e) => {
          const step = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : e.key === "PageUp" ? 5 : e.key === "PageDown" ? -5 : 0;
          if (step) { e.preventDefault(); onSelectYear(clamp(selectedYear + step, years[0], years[n - 1])); }
          else if (e.key === "Home") { e.preventDefault(); onSelectYear(years[0]); }
          else if (e.key === "End") { e.preventDefault(); onSelectYear(years[n - 1]); }
        }}
        onPointerMove={(e) => {
          const i = idxAt(e);
          setHover(i);
          if (e.buttons === 1) onSelectYear(years[i]);
        }}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(e) => onSelectYear(years[idxAt(e)])}
      >
        <title id={titleId}>{`Waste generated, recovered and disposed each year, ${years[0]} to ${years[n - 1]}`}</title>
        <desc id={descId}>
          {`Generated waste goes from ${fmt(generated[0])} Mt to ${fmt(generated[n - 1])} Mt, recovered from ${fmt(recovered[0])} Mt to ${fmt(recovered[n - 1])} Mt, and disposed from ${fmt(residual[0])} Mt to ${fmt(residual[n - 1])} Mt. Use the arrow keys to change the selected year.`}
        </desc>
        <defs>
          <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.leaf} stopOpacity="0.32" />
            <stop offset="1" stopColor={C.leaf} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.ember} stopOpacity="0.22" />
            <stop offset="1" stopColor={C.ember} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={C.grid} />
            <text x={L - 10} y={y(t) + 4} textAnchor="end" fontSize="13" fill={C.mute} fontFamily="var(--font-inter), sans-serif">{fmt(t)}</text>
          </g>
        ))}
        {years.map((yr, i) => [2022, 2030, 2040, 2050].includes(yr) && (
          <text key={yr} x={x(i)} y={H - 8} textAnchor="middle" fontSize="13" fill={C.mute} fontFamily="var(--font-inter), sans-serif">{yr}</text>
        ))}

        <path d={area(residual)} fill="url(#gRes)" className="fade-in" />
        <path d={area(recovered)} fill="url(#gRec)" className="fade-in" />

        <path d={line(bauGenerated)} fill="none" stroke={C.mute} strokeWidth="1.5" strokeDasharray="2 5" opacity="0.7" />
        <path d={line(generated)} pathLength={1} className="draw" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        <path d={line(residual)} pathLength={1} className="draw" fill="none" stroke={C.ember} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        <path d={line(recovered)} pathLength={1} className="draw" fill="none" stroke={C.leaf} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />

        <line x1={x(active)} x2={x(active)} y1={T} y2={H - B} stroke="rgba(255,255,255,0.35)" strokeDasharray="3 4" />
        {[[generated, C.ink], [residual, C.ember], [recovered, C.leaf]].map(([a, c], k) => (
          <circle key={k} cx={x(active)} cy={y((a as number[])[active])} r="5" fill={c as string} stroke="#06080b" strokeWidth="2" />
        ))}
      </svg>

      <div
        className="pointer-events-none absolute top-1 z-10 w-56 rounded-xl border border-line bg-[#0b1014]/90 p-3 text-xs shadow-2xl backdrop-blur"
        style={{ left: `clamp(0px, calc(${left}% - 112px), calc(100% - 224px))`, transition: "left .12s ease-out" }}
      >
        <div className="font-mono text-sm text-ink">{years[active]}</div>
        <dl className="mt-1.5 space-y-1">
          <Row c={C.ink} k="Generated" v={`${fmt(generated[active])} Mt`} />
          <Row c={C.leaf} k="Recovered" v={`${fmt(recovered[active])} Mt`} sub={pct(recovered[active] / generated[active])} />
          <Row c={C.ember} k="Disposed" v={`${fmt(residual[active])} Mt`} />
        </dl>
      </div>
    </div>
  );
}

function Row({ c, k, v, sub }: { c: string; k: string; v: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="flex items-center gap-1.5 text-mute"><i className="h-2 w-2 rounded-full" style={{ background: c }} />{k}</dt>
      <dd className="whitespace-nowrap font-mono text-ink">{v}{sub && <span className="ml-1 text-dim">{sub}</span>}</dd>
    </div>
  );
}
