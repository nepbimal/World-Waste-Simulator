"use client";

import { useId, useState } from "react";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  display?: string;
  hint?: string;
  accent?: string;
  compact?: boolean;
};

// A native range input (so keyboard and screen readers keep working) with a springy visual track.
export function ElasticSlider({ label, value, min, max, step = 1, onChange, display, hint, accent, compact }: Props) {
  const id = useId();
  const [drag, setDrag] = useState(false);
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div className="min-w-0">
      {!compact && (
        <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
          <label htmlFor={id} className="text-mute">{label}</label>
          <span className="font-mono text-base text-ink">{display ?? value}</span>
        </div>
      )}
      <div className="es" data-drag={drag} style={{ "--p": p, ...(accent ? { "--accent": accent } : {}) } as React.CSSProperties}>
        <div className="es-track"><div className="es-fill" /><div className="es-knob" /></div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={compact ? label : undefined}
          onChange={(e) => onChange(+e.target.value)}
          onPointerDown={() => setDrag(true)}
          onPointerUp={() => setDrag(false)}
          onPointerCancel={() => setDrag(false)}
          onBlur={() => setDrag(false)}
        />
      </div>
      {hint && !compact && <p className="mt-1 text-xs text-dim">{hint}</p>}
    </div>
  );
}
