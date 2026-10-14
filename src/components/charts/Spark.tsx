import { useId } from "react";
import { C, clamp } from "@/lib/format";

export type SparkSeries = { values: (number | null)[]; color: string; dashed?: boolean; label: string };

const W = 320, H = 96, PX = 4, PY = 8;

// A small line chart with the selected year marked. Plain SVG with a text alternative.
export function Spark({ years, series, marker, ariaLabel, unit }: { years: number[]; series: SparkSeries[]; marker: number; ariaLabel: string; unit: string }) {
  const titleId = useId();
  const all = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const max = Math.max(...all) * 1.08 || 1;
  const x = (i: number) => PX + (i / (years.length - 1)) * (W - 2 * PX);
  const y = (v: number) => PY + (1 - v / max) * (H - 2 * PY);
  const mi = clamp(marker - years[0], 0, years.length - 1);
  const path = (vals: (number | null)[]) => {
    let d = "";
    vals.forEach((v, i) => { if (v !== null) d += `${d && vals[i - 1] !== null ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`; });
    return d;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-labelledby={titleId}>
      <title id={titleId}>{ariaLabel}</title>
      <line x1={PX} x2={W - PX} y1={H - PY} y2={H - PY} stroke={C.grid} />
      {series.map((s) => (
        <path key={s.label} d={path(s.values)} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={s.dashed ? "3 4" : undefined} />
      ))}
      <line x1={x(mi)} x2={x(mi)} y1={PY} y2={H - PY} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 4" />
      {series.map((s) => {
        const v = s.values[mi];
        return v === null || v === undefined ? null : <circle key={s.label} cx={x(mi)} cy={y(v)} r="3.6" fill={s.color} stroke="#06080b" strokeWidth="1.5" />;
      })}
      <text x={W - PX} y={10} textAnchor="end" fontSize="10" fill={C.mute}>{unit}</text>
    </svg>
  );
}
