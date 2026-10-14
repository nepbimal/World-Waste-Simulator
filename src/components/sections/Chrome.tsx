"use client";

import { useEffect, useState } from "react";
import { END_YEAR, SCENARIOS, START_YEAR } from "@/lib/waste-model";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { ElasticSlider } from "../ui/ElasticSlider";
import type { Sim } from "../useSimulation";

export const NAV = [
  { id: "overview", label: "Overview" },
  { id: "regions", label: "Regions" },
  { id: "materials", label: "Materials" },
  { id: "swarm", label: "Swarm" },
  { id: "impact", label: "Impact" },
  { id: "sources", label: "Sources" },
];

export function TopNav() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-35% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-[#06080b]/65 backdrop-blur-xl" aria-label="Sections">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <span className="relative grid h-6 w-6 place-items-center rounded-full border border-leaf/50">
            <span className="tick-live h-2 w-2 rounded-full bg-leaf" />
          </span>
          <span className="hidden whitespace-nowrap sm:inline">World Waste Simulator</span>
          <span className="sr-only sm:hidden">World Waste Simulator</span>
        </a>
        <ul className="no-scrollbar -mr-2 flex max-w-[78%] items-center gap-1 overflow-x-auto text-[13px] sm:max-w-none">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={active === n.id ? "true" : undefined}
                className={`relative whitespace-nowrap rounded-full px-3 py-1.5 transition-colors ${active === n.id ? "bg-white/10 text-ink" : "text-mute hover:text-ink"}`}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

// Floating control bar: play, year, scrubber, scenario. Always reachable while scrolling.
export function Dock({ sim }: { sim: Sim }) {
  const { year, setYear, isPlaying, setIsPlaying, scenarioId, pickScenario } = sim;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-3">
      <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl border border-white/10 bg-[#0a0f12]/80 p-2.5 pl-3 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:flex-nowrap sm:rounded-full sm:pl-2.5">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause the timeline" : `Play the timeline from ${year} to ${END_YEAR}`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf text-[#04110b] transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <div className="w-14 shrink-0 text-center">
          <div className="text-[9px] uppercase tracking-[0.16em] text-dim">Year</div>
          <AnimatedNumber value={year} format={(n) => String(Math.round(n))} className="font-mono text-xl font-semibold" />
        </div>
        <div className="min-w-[120px] flex-1">
          <ElasticSlider compact label="Simulated year" value={year} min={START_YEAR} max={END_YEAR} onChange={setYear} />
        </div>
        <div className="flex shrink-0 gap-1 rounded-full bg-white/5 p-1 text-xs" role="group" aria-label="Scenario">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => pickScenario(s)}
              aria-pressed={scenarioId === s.id}
              className={`rounded-full px-3 py-1.5 font-medium transition ${scenarioId === s.id ? "bg-white text-[#06080b]" : "text-mute hover:text-ink"}`}
            >
              {s.id === "bau" ? "BAU" : s.id === "low" ? "Low" : "High"}
            </button>
          ))}
          {scenarioId === "custom" && <span className="rounded-full bg-violet/25 px-3 py-1.5 font-medium text-ink">Custom</span>}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 flex flex-wrap items-center justify-between gap-3 border-t border-line py-8 text-xs text-dim">
      <div>World Waste Simulator. A scenario model, not a forecast.</div>
      <div>
        Data: World Bank Group, <em>What a Waste 3.0</em> (2026), plus the sources listed in the register.{" "}
        <a className="underline hover:text-ink" href="#sources">See every figure</a>
      </div>
    </footer>
  );
}
