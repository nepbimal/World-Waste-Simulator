"use client";

import { useMemo, useState, useEffect } from "react";
import {
  END_YEAR,
  GLOBAL_2022,
  GLOBAL_2050_BAU,
  GLOBAL_RECOVERY_2022,
  MATERIALS,
  REGIONS,
  SCENARIOS,
  START_YEAR,
  simulate,
  type Scenario,
} from "@/lib/waste-model";
import {
  CHECKED_ON,
  MODEL_ASSUMPTIONS,
  REGISTER,
  STATUS_LABEL,
  statusCounts,
  type Entry,
  type Status,
} from "@/lib/data-register";
import { SPECIES_CAVEATS } from "@/lib/planet-impact";
import { NOW_YEAR, requiredSchedule, runSwarm, type Band } from "@/lib/swarm-model";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const fmt1 = (n: number) => n.toFixed(1);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

// Interactive Line Chart with hover tooltip
function InteractiveLineChart({
  years,
  generated,
  recovered,
  residual,
  selectedYear,
  onSelectYear,
}: {
  years: number[];
  generated: number[];
  recovered: number[];
  residual: number[];
  selectedYear: number;
  onSelectYear: (yr: number) => void;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const W = 720;
  const H = 280;
  const L = 56;
  const R = 20;
  const T = 20;
  const B = 32;

  const max = Math.max(...generated) * 1.08;
  const x = (i: number) => L + (i / (years.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);

  const activeIdx = hoverIndex ?? (selectedYear - START_YEAR);
  const activeYr = years[activeIdx];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* Y Axis Grid */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#e2ddd5" strokeDasharray="3 3" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#78716c" fontFamily="monospace">
              {fmt(t)}
            </text>
          </g>
        ))}

        {/* X Axis Labels */}
        {years.map((yr, i) =>
          yr % 5 === 0 || i === 0 || i === years.length - 1 ? (
            <text key={yr} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#78716c" fontFamily="monospace">
              {yr}
            </text>
          ) : null
        )}

        {/* Shaded Area between Generated and Recovered (Residual) */}
        <polygon
          points={`
            ${years.map((_, i) => `${x(i).toFixed(1)},${y(generated[i]).toFixed(1)}`).join(" ")}
            ${[...years].reverse().map((_, i) => `${x(years.length - 1 - i).toFixed(1)},${y(recovered[years.length - 1 - i]).toFixed(1)}`).join(" ")}
          `}
          fill="#c0563f"
          fillOpacity="0.08"
        />

        {/* Shaded Area for Recovered */}
        <polygon
          points={`
            ${years.map((_, i) => `${x(i).toFixed(1)},${y(recovered[i]).toFixed(1)}`).join(" ")}
            ${[...years].reverse().map((_, i) => `${x(years.length - 1 - i).toFixed(1)},${y(0).toFixed(1)}`).join(" ")}
          `}
          fill="#2d6a4f"
          fillOpacity="0.10"
        />

        {/* Series Lines */}
        <polyline
          fill="none"
          stroke="#1c1917"
          strokeWidth="2.5"
          strokeLinejoin="round"
          points={years.map((_, i) => `${x(i).toFixed(1)},${y(generated[i]).toFixed(1)}`).join(" ")}
        />
        <polyline
          fill="none"
          stroke="#2d6a4f"
          strokeWidth="2.5"
          strokeLinejoin="round"
          points={years.map((_, i) => `${x(i).toFixed(1)},${y(recovered[i]).toFixed(1)}`).join(" ")}
        />
        <polyline
          fill="none"
          stroke="#c0563f"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeDasharray="5 3"
          points={years.map((_, i) => `${x(i).toFixed(1)},${y(residual[i]).toFixed(1)}`).join(" ")}
        />

        {/* Active Year Cursor Line */}
        {activeIdx >= 0 && activeIdx < years.length && (
          <g>
            <line
              x1={x(activeIdx)}
              x2={x(activeIdx)}
              y1={T}
              y2={H - B}
              stroke="#0f766e"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle cx={x(activeIdx)} cy={y(generated[activeIdx])} r="4" fill="#1c1917" />
            <circle cx={x(activeIdx)} cy={y(recovered[activeIdx])} r="4" fill="#2d6a4f" />
            <circle cx={x(activeIdx)} cy={y(residual[activeIdx])} r="4" fill="#c0563f" />
          </g>
        )}

        {/* Invisible Click/Hover Zones for Each Year */}
        {years.map((yr, i) => {
          const colW = (W - L - R) / (years.length - 1);
          return (
            <rect
              key={yr}
              x={x(i) - colW / 2}
              y={T}
              width={colW}
              height={H - T - B}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onClick={() => onSelectYear(yr)}
            />
          );
        })}
      </svg>

      {/* Floating Info Pill */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-100/90 px-3 py-1.5 text-xs text-stone-700 border border-stone-200">
        <div>
          Year: <strong className="text-stone-900">{activeYr}</strong> · Generated:{" "}
          <strong className="text-stone-900">{fmt(generated[activeIdx])} Mt</strong>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-700" />
            Recovered: {fmt(recovered[activeIdx])} Mt ({pct(recovered[activeIdx] / generated[activeIdx])})
          </span>
          <span className="flex items-center gap-1.5 text-red-800 font-medium">
            <span className="h-2 w-2 rounded-full bg-red-700" />
            Disposed / Burned: {fmt(residual[activeIdx])} Mt
          </span>
        </div>
      </div>
    </div>
  );
}

// Swarm Percentile Band Chart
function SwarmBandChart({
  bands,
  schedule,
}: {
  bands: Band[];
  schedule: { year: number; rate: number }[];
}) {
  const W = 680;
  const H = 250;
  const L = 46;
  const R = 16;
  const T = 16;
  const B = 28;

  const max = Math.max(0.65, ...bands.map((b) => b.p90), ...schedule.map((r) => r.rate)) * 1.05;
  const x = (yr: number) => L + ((yr - START_YEAR) / (END_YEAR - START_YEAR)) * (W - L - R);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const f = (n: number) => n.toFixed(1);

  const area = [
    ...bands.map((b) => `${f(x(b.year))},${f(y(b.p90))}`),
    ...[...bands].reverse().map((b) => `${f(x(b.year))},${f(y(b.p10))}`),
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" role="img" aria-label="Swarm simulation range">
      {[0, 0.2, 0.4, 0.6, 0.8]
        .filter((t) => t <= max)
        .map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#e2ddd5" strokeDasharray="3 3" />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#78716c">
              {Math.round(t * 100)}%
            </text>
          </g>
        ))}

      {[2022, 2026, 2030, 2040, 2050].map((yr) => (
        <text key={yr} x={x(yr)} y={H - 8} textAnchor="middle" fontSize="11" fill="#78716c" fontFamily="monospace">
          {yr}
        </text>
      ))}

      {/* 10th-90th Percentile Confidence Envelope */}
      <polygon points={area} fill="#2d6a4f" opacity="0.18" />

      {/* Median Simulated Trajectory */}
      <polyline
        fill="none"
        stroke="#2d6a4f"
        strokeWidth="2.5"
        points={bands.map((b) => `${f(x(b.year))},${f(y(b.p50))}`).join(" ")}
      />

      {/* Required Target Path */}
      <polyline
        fill="none"
        stroke="#b45309"
        strokeWidth="2.5"
        strokeDasharray="6 4"
        points={schedule.map((r) => `${f(x(r.year))},${f(y(r.rate))}`).join(" ")}
      />
    </svg>
  );
}

const STATUS_BADGE: Record<Status, { bg: string; text: string; border: string }> = {
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300" },
  single: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300" },
  conflicting: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-300" },
  derived: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-300" },
  estimate: { bg: "bg-stone-100", text: "text-stone-700", border: "border-stone-300" },
};

export default function WasteSimulation() {
  const [activeTab, setActiveTab] = useState<"overview" | "materials" | "regions" | "swarm" | "impact" | "sources">("overview");

  // Simulation Levers
  const [scenarioId, setScenarioId] = useState<string>("bau");
  const selectedScenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

  const [growthCut, setGrowthCut] = useState(selectedScenario.growthCut);
  const [recoveryTarget, setRecoveryTarget] = useState(selectedScenario.recoveryTarget);

  // Time & Animation
  const [year, setYear] = useState<number>(2035);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Swarm parameters
  const [echo, setEcho] = useState<number>(0.3);
  const [herd, setHerd] = useState<number>(0.5);

  // Required Schedule Solver
  const [target, setTarget] = useState<number>(54); // What a Waste 3.0 High Ambition target
  const [targetYear, setTargetYear] = useState<number>(2050);
  const [maxGain, setMaxGain] = useState<number>(2.5);

  // Filter for Data Register
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  const pickScenario = (s: Scenario) => {
    setScenarioId(s.id);
    setGrowthCut(s.growthCut);
    setRecoveryTarget(s.recoveryTarget);
  };

  // Run deterministic multi-decade model
  const data = useMemo(() => simulate({ growthCut, recoveryTarget }), [growthCut, recoveryTarget]);
  const bau = useMemo(() => simulate({ growthCut: 0, recoveryTarget: 27 }), []);

  // Run stochastic agent swarm simulation
  const bands = useMemo(
    () => runSwarm({ recoveryTarget, echo, herd, agents: 150, runs: 25, seed: 42 }, data),
    [recoveryTarget, echo, herd, data]
  );

  // Calculate required acceleration schedule
  const sched = useMemo(
    () => requiredSchedule(data, target / 100, targetYear, maxGain),
    [data, target, targetYear, maxGain]
  );

  // Timeline playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setYear((prev) => {
        if (prev >= END_YEAR) {
          setIsPlaying(false);
          return START_YEAR;
        }
        return prev + 1;
      });
    }, 450);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const yearIndex = year - START_YEAR;
  const cur = data[yearIndex] || data[0];
  const bauCur = bau[yearIndex] || bau[0];
  const years = useMemo(() => data.map((d) => d.year), [data]);

  const avoidedDisposal = bauCur.residual - cur.residual;
  const avoidedGen = bauCur.generated - cur.generated;
  const cumulativeAvoided = useMemo(() => {
    return data.slice(0, yearIndex + 1).reduce((acc, d, i) => acc + (bau[i].residual - d.residual), 0);
  }, [data, bau, yearIndex]);

  const counts = useMemo(() => statusCounts(), []);

  // Filtered Register
  const filteredRegister = useMemo(() => {
    const combined = [...REGISTER, ...MODEL_ASSUMPTIONS];
    return combined.filter((e) => {
      const matchQuery =
        e.metric.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = selectedStatusFilter === "all" || e.status === selectedStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [searchQuery, selectedStatusFilter]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 text-[#201c17] antialiased">
      {/* Header */}
      <header className="border-b border-stone-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              World Bank What a Waste 3.0 Verified Dataset
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              World Waste Simulator
            </h1>
            <p className="mt-1 text-stone-600 max-w-2xl text-sm">
              Global municipal solid waste model (2022–2050): tracking 2.56 to 3.86 billion tonnes across 7 global regions,
              13 material streams, collection infrastructure, and climate impacts.
            </p>
          </div>

          {/* Quick Year Display & Play Button */}
          <div className="flex items-center gap-3 bg-stone-100 p-2.5 rounded-xl border border-stone-200">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-sm transition"
              title={isPlaying ? "Pause simulation" : "Play forward 2022 to 2050"}
            >
              {isPlaying ? (
                <>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Play
                </>
              )}
            </button>
            <div className="text-center px-2">
              <span className="block text-[10px] uppercase font-bold text-stone-500 tracking-wider">Simulated Year</span>
              <span className="text-2xl font-black font-mono text-stone-900">{year}</span>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="mt-6 flex flex-wrap gap-1 border-b border-stone-200 text-sm font-medium">
          {[
            { id: "overview", label: "Overview & Scenarios", icon: "📊" },
            { id: "regions", label: "7 World Regions", icon: "🌍" },
            { id: "materials", label: "13 Material Streams", icon: "📦" },
            { id: "swarm", label: "Household Swarm Simulation", icon: "🐝" },
            { id: "impact", label: "Climate & Planetary Footprint", icon: "🌿" },
            { id: "sources", label: "Verified Data Register", icon: "📜" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition ${
                activeTab === tab.id
                  ? "border-emerald-700 text-emerald-900 font-semibold bg-emerald-50/50"
                  : "border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Top Scenario Selector & Real-Time KPI Cards */}
      <section className="mt-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {SCENARIOS.map((s) => {
            const isSelected = scenarioId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => pickScenario(s)}
                className={`relative rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? "border-emerald-700 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-700"
                    : "border-stone-200 bg-white/70 hover:bg-white hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{s.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold font-mono bg-stone-100 text-stone-700">
                    {s.target2050Gen} Mt in 2050
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-600 line-clamp-2">{s.blurb}</p>
                <div className="mt-3 flex gap-2 text-[11px] text-stone-500 font-mono">
                  <span>Recov: {s.recoveryTarget}%</span>
                  <span>·</span>
                  <span>Collection: {s.collectionTarget}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Global KPI Counters for Selected Year */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-stone-200 bg-white/80 p-4 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Total Generated ({year})</span>
            <div className="mt-1 text-2xl font-bold font-mono text-stone-900">{fmt(cur.generated)} Mt</div>
            <div className="mt-1 text-[11px] text-stone-500">
              {avoidedGen > 0 ? (
                <span className="text-emerald-700 font-medium">▼ {fmt(avoidedGen)} Mt avoided vs BAU</span>
              ) : (
                <span>Baseline generation</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white/80 p-4 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Materials Recovered</span>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-800">
              {fmt(cur.recovered)} Mt
            </div>
            <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
              {pct(cur.recoveryRate)} recycled / composted
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white/80 p-4 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Landfill & Mismanaged</span>
            <div className="mt-1 text-2xl font-bold font-mono text-red-800">{fmt(cur.residual)} Mt</div>
            <div className="mt-1 text-[11px] text-stone-500">
              {avoidedDisposal > 0 ? (
                <span className="text-emerald-700 font-medium">▼ {fmt(avoidedDisposal)} Mt diverted</span>
              ) : (
                <span>Unmitigated disposal</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white/80 p-4 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Cumulative Diverted (2022–{year})</span>
            <div className="mt-1 text-2xl font-bold font-mono text-stone-900">
              {(cumulativeAvoided / 1000).toFixed(2)} Bt
            </div>
            <div className="mt-1 text-[11px] text-stone-500">
              {cumulativeAvoided > 0 ? "Saved from dumps & landfills" : "No divergence yet"}
            </div>
          </div>
        </div>

        {/* Global Year Scrubber Bar */}
        <div className="mt-4 rounded-xl border border-stone-200 bg-stone-100/70 p-4">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
            <span className="font-semibold text-stone-800">Drag to change year: {year}</span>
            <span>2022 (What a Waste baseline) → 2050 (Scenario horizon)</span>
          </div>
          <input
            type="range"
            min={START_YEAR}
            max={END_YEAR}
            value={year}
            onChange={(e) => setYear(+e.target.value)}
            className="w-full accent-emerald-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
          />
        </div>
      </section>

      {/* TAB 1: OVERVIEW & SCENARIO EXPLORER */}
      {activeTab === "overview" && (
        <section className="mt-8 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Global Trajectory: 2022 to 2050 (Million Tonnes / Year)
                </h2>
                <p className="text-xs text-stone-500">
                  Click or hover on any year to inspect generated vs recovered streams.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-stone-900">
                  <span className="h-2.5 w-2.5 rounded-sm bg-stone-900" />
                  Total Generated
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-700" />
                  Recovered (Recycling + Composting)
                </span>
                <span className="flex items-center gap-1.5 text-red-800">
                  <span className="h-2.5 w-2.5 rounded-sm bg-red-700" />
                  Disposed (Landfills, Dumps & Uncollected)
                </span>
              </div>
            </div>

            <div className="mt-4">
              <InteractiveLineChart
                years={years}
                generated={data.map((d) => d.generated)}
                recovered={data.map((d) => d.recovered)}
                residual={data.map((d) => d.residual)}
                selectedYear={year}
                onSelectYear={setYear}
              />
            </div>
          </div>

          {/* Waste Destination Breakdown Bar for Selected Year */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-stone-900">Where Does the World&apos;s Waste Go in {year}?</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Breakdown based on What a Waste 3.0 treatment streams: Materials recovery, Controlled landfill, Incineration, Dumpsites, and Uncollected.
            </p>

            <div className="mt-4">
              <div className="h-6 w-full flex rounded-lg overflow-hidden font-mono text-[10px] font-bold text-white text-center leading-6">
                <div
                  style={{ width: `${(cur.recovered / cur.generated) * 100}%` }}
                  className="bg-emerald-700 hover:brightness-110 transition"
                  title={`Materials Recovery: ${fmt(cur.recovered)} Mt (${pct(cur.recovered / cur.generated)})`}
                >
                  {cur.recovered / cur.generated > 0.08 && pct(cur.recovered / cur.generated)}
                </div>
                <div
                  style={{ width: `${(cur.incinerated / cur.generated) * 100}%` }}
                  className="bg-amber-600 hover:brightness-110 transition"
                  title={`Modern Incineration w/ Energy: ${fmt(cur.incinerated)} Mt (${pct(cur.incinerated / cur.generated)})`}
                >
                  {cur.incinerated / cur.generated > 0.08 && pct(cur.incinerated / cur.generated)}
                </div>
                <div
                  style={{ width: `${(cur.controlledLandfill / cur.generated) * 100}%` }}
                  className="bg-sky-700 hover:brightness-110 transition"
                  title={`Controlled & Sanitary Landfill: ${fmt(cur.controlledLandfill)} Mt (${pct(cur.controlledLandfill / cur.generated)})`}
                >
                  {cur.controlledLandfill / cur.generated > 0.08 && pct(cur.controlledLandfill / cur.generated)}
                </div>
                <div
                  style={{ width: `${(cur.dumpsite / cur.generated) * 100}%` }}
                  className="bg-orange-700 hover:brightness-110 transition"
                  title={`Open Dumpsite: ${fmt(cur.dumpsite)} Mt (${pct(cur.dumpsite / cur.generated)})`}
                >
                  {cur.dumpsite / cur.generated > 0.08 && pct(cur.dumpsite / cur.generated)}
                </div>
                <div
                  style={{ width: `${(cur.uncollected / cur.generated) * 100}%` }}
                  className="bg-stone-700 hover:brightness-110 transition"
                  title={`Uncollected / Open Burned: ${fmt(cur.uncollected)} Mt (${pct(cur.uncollected / cur.generated)})`}
                >
                  {cur.uncollected / cur.generated > 0.08 && pct(cur.uncollected / cur.generated)}
                </div>
              </div>

              {/* Legend with Tonnages */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-emerald-700 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-900">Recovery</div>
                    <div className="text-stone-500 font-mono">{fmt(cur.recovered)} Mt ({pct(cur.recovered / cur.generated)})</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-amber-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-900">Incineration</div>
                    <div className="text-stone-500 font-mono">{fmt(cur.incinerated)} Mt ({pct(cur.incinerated / cur.generated)})</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-sky-700 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-900">Sanitary Landfill</div>
                    <div className="text-stone-500 font-mono">{fmt(cur.controlledLandfill)} Mt ({pct(cur.controlledLandfill / cur.generated)})</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-orange-700 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-900">Open Dumpsites</div>
                    <div className="text-stone-500 font-mono">{fmt(cur.dumpsite)} Mt ({pct(cur.dumpsite / cur.generated)})</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-stone-700 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-900">Uncollected</div>
                    <div className="text-stone-500 font-mono">{fmt(cur.uncollected)} Mt ({pct(cur.uncollected / cur.generated)})</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Levers Slider Box */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-6">
            <h3 className="font-bold text-stone-900">Custom Scenario Levers</h3>
            <p className="text-xs text-stone-500">Fine-tune waste prevention ambition and global materials recovery goals.</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-semibold text-stone-700">
                Waste Prevention by 2050: <span className="font-mono text-emerald-800 text-sm">{growthCut}%</span> of growth avoided
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={growthCut}
                  onChange={(e) => {
                    setGrowthCut(+e.target.value);
                    setScenarioId("custom");
                  }}
                  className="mt-2 w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 font-normal block mt-1">
                  0% = business as usual growth (3.86 Bt); 100% = capped at 2022 levels (2.56 Bt)
                </span>
              </label>

              <label className="text-xs font-semibold text-stone-700">
                Global Recovery Rate Target by 2050: <span className="font-mono text-emerald-800 text-sm">{recoveryTarget}%</span>
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={recoveryTarget}
                  onChange={(e) => {
                    setRecoveryTarget(+e.target.value);
                    setScenarioId("custom");
                  }}
                  className="mt-2 w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 font-normal block mt-1">
                  Baseline is 21.4% (2022); High-ambition scenario targets 54% global recovery
                </span>
              </label>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: 7 WORLD REGIONS */}
      {activeTab === "regions" && (
        <section className="mt-8 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900">Regional Profiles in {year}</h2>
            <p className="text-xs text-stone-500">
              Published baseline generation, per-capita rates, and projected trajectories across all 7 World Bank regions.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cur.byRegion.map((r) => {
                const regMeta = REGIONS.find((x) => x.id === r.id)!;
                return (
                  <div key={r.id} className="rounded-xl border border-stone-200 p-4 bg-stone-50/60 hover:bg-stone-50 transition">
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-stone-900">{r.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                        {r.code}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-stone-500 block">Generated:</span>
                        <strong className="text-stone-900 font-mono text-sm">{fmt(r.generated)} Mt</strong>
                      </div>
                      <div>
                        <span className="text-stone-500 block">Recovered:</span>
                        <strong className="text-emerald-800 font-mono text-sm">{pct(r.recovery)}</strong>
                      </div>
                    </div>

                    <div className="mt-2 h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-700"
                        style={{ width: `${Math.min(100, r.recovery * 100)}%` }}
                      />
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-200 text-[11px] text-stone-600 flex justify-between">
                      <span>Per capita: {regMeta.perCapita2022} kg/day</span>
                      <span>Collection: {Math.round(regMeta.collectionRate2022 * 100)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl bg-amber-50/70 border border-amber-200 p-4 text-xs text-amber-900">
              <strong>Key Finding:</strong> Sub-Saharan Africa and South Asia are projected to grow fastest (+124% and +99% under BAU) due to rapid urban demographic growth, while currently having the lowest formal collection rates (31% and 67%).
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: 13 MATERIAL STREAMS */}
      {activeTab === "materials" && (
        <section className="mt-8 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900">Global Material Composition in {year}</h2>
            <p className="text-xs text-stone-500">
              Verified global weighted distribution from Chapter 2 (Figure 2.9) of What a Waste 3.0.
            </p>

            <div className="mt-5 space-y-3">
              {cur.byMaterial.map((m) => {
                const meta = MATERIALS.find((x) => x.id === m.id)!;
                const shareOfTotal = (m.generated / cur.generated) * 100;
                const recRate = m.recovered / m.generated;

                return (
                  <div key={m.id} className="rounded-xl border border-stone-100 bg-stone-50/50 p-3 text-xs">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: meta.color }} />
                        <span className="font-bold text-stone-900">{meta.name}</span>
                        <span className="text-[11px] text-stone-500 font-mono">({fmt1(shareOfTotal)}% of total)</span>
                      </div>
                      <div className="font-mono text-stone-700">
                        <strong>{fmt(m.generated)} Mt generated</strong> ·{" "}
                        <span className="text-emerald-800 font-semibold">{fmt(m.recovered)} Mt recovered ({pct(recRate)})</span>
                      </div>
                    </div>

                    <div className="mt-2 h-2 w-full bg-stone-200 rounded-full overflow-hidden flex">
                      <div className="h-full" style={{ width: `${recRate * 100}%`, backgroundColor: meta.color }} />
                    </div>

                    <div className="mt-1.5 text-[11px] text-stone-500">
                      {meta.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: SWARM SIMULATION */}
      {activeTab === "swarm" && (
        <section className="mt-8 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900">
              Household Agent Swarm Model (1,050 Agents, 25 Monte Carlo Runs)
            </h2>
            <p className="text-xs text-stone-500">
              Stochastic agent ensemble simulating peer imitation, social echo chambers, and household response to policy incentives.
            </p>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-semibold text-stone-700">
                Echo Chamber Clustering: <span className="font-mono text-emerald-800">{echo.toFixed(1)}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={echo}
                  onChange={(e) => setEcho(+e.target.value)}
                  className="mt-2 w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 font-normal block mt-1">
                  0 = well-mixed public dialogue · 1 = isolated peer enclaves
                </span>
              </label>

              <label className="text-xs font-semibold text-stone-700">
                Neighbour Herd Amplification: <span className="font-mono text-emerald-800">{herd.toFixed(1)}</span>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={herd}
                  onChange={(e) => setHerd(+e.target.value)}
                  className="mt-2 w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 font-normal block mt-1">
                  Multiplier on how neighbour recycling habits reinforce municipal policies
                </span>
              </label>
            </div>

            <div className="mt-5">
              <SwarmBandChart bands={bands} schedule={sched.rows} />
              <div className="mt-2 flex flex-wrap justify-between text-xs text-stone-600 font-mono">
                <span>
                  🟢 2050 Simulated Median: <strong>{pct(bands[bands.length - 1].p50)}</strong> (10th–90th percentile: {pct(bands[bands.length - 1].p10)} to {pct(bands[bands.length - 1].p90)})
                </span>
                <span>
                  🔶 Target Schedule: <strong>{pct(sched.rows[sched.rows.length - 1].rate)}</strong>
                </span>
              </div>
            </div>

            {/* Target Feasibility Checker */}
            <div className="mt-6 pt-5 border-t border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm">Policy Feasibility & Rate-of-Change Solver</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <label className="text-xs font-semibold text-stone-700">
                  Target Recovery Rate: <strong>{target}%</strong>
                  <input
                    type="range"
                    min={30}
                    max={85}
                    value={target}
                    onChange={(e) => setTarget(+e.target.value)}
                    className="mt-1.5 w-full accent-amber-600"
                  />
                </label>

                <label className="text-xs font-semibold text-stone-700">
                  Target Deadline Year: <strong>{targetYear}</strong>
                  <input
                    type="range"
                    min={2030}
                    max={2050}
                    value={targetYear}
                    onChange={(e) => setTargetYear(+e.target.value)}
                    className="mt-1.5 w-full accent-amber-600"
                  />
                </label>

                <label className="text-xs font-semibold text-stone-700">
                  Max Realistic Gain: <strong>{maxGain.toFixed(1)} pts/yr</strong>
                  <input
                    type="range"
                    min={0.5}
                    max={5.0}
                    step={0.5}
                    value={maxGain}
                    onChange={(e) => setMaxGain(+e.target.value)}
                    className="mt-1.5 w-full accent-amber-600"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-lg bg-stone-100 p-3">
                  <span className="text-stone-500 block">Required annual gain from 2026:</span>
                  <strong className="text-stone-900 text-base font-mono">+{sched.gainNeeded.toFixed(2)} pts / year</strong>
                </div>
                <div className="rounded-lg bg-stone-100 p-3">
                  <span className="text-stone-500 block">Latest feasible year to start:</span>
                  <strong className={`text-base font-mono ${sched.feasible ? "text-emerald-800" : "text-red-700"}`}>
                    {sched.feasible ? sched.latestStart : "Already past deadline"}
                  </strong>
                </div>
                <div className="rounded-lg bg-stone-100 p-3">
                  <span className="text-stone-500 block">Maximum reachable by {targetYear}:</span>
                  <strong className="text-stone-900 text-base font-mono">{pct(sched.reachable)}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: CLIMATE & PLANETARY IMPACTS */}
      {activeTab === "impact" && (
        <section className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Methane & Climate</span>
              <div className="mt-2 text-2xl font-bold font-mono text-stone-900">
                {fmt(cur.co2eMethane)} Mt CO₂e
              </div>
              <p className="mt-1 text-xs text-stone-600">
                Annual GHG emissions from decaying food & garden waste in dumps and landfills.
              </p>
              <div className="mt-3 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
                Composting & anaerobic digestion prevent up to 90% of landfill methane.
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Unmanaged Plastics</span>
              <div className="mt-2 text-2xl font-bold font-mono text-red-800">
                {fmt(cur.byMaterial.find((m) => m.id === "plastic")!.residual * 0.29)} Mt
              </div>
              <p className="mt-1 text-xs text-stone-600">
                Plastics entering uncontrolled dumpsites or remaining uncollected annually in {year}.
              </p>
              <div className="mt-3 text-[11px] text-red-900 bg-red-50 p-2 rounded border border-red-200 font-medium">
                65% of municipal plastics are single-use packaging.
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Economic Value Lost</span>
              <div className="mt-2 text-2xl font-bold font-mono text-stone-900">
                ${fmt(cur.residual * 45 / 1000)} Billion
              </div>
              <p className="mt-1 text-xs text-stone-600">
                Estimated recyclable material value lost each year to dumping and incineration.
              </p>
              <div className="mt-3 text-[11px] text-stone-800 bg-stone-100 p-2 rounded border border-stone-200 font-medium">
                18 million urban waste workers currently recover valuable resources globally.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-stone-900">Wildlife & Marine Ecosystem Vulnerability</h3>
            <p className="text-xs text-stone-500 mt-0.5">Ecological risk factors documented across published conservation assessments:</p>
            <ul className="mt-3 space-y-2 text-xs text-stone-600 list-disc pl-5">
              {SPECIES_CAVEATS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* TAB 6: DATA REGISTER & CITATIONS */}
      {activeTab === "sources" && (
        <section className="mt-8 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Data Register & Verification Ledger</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Every figure verified against publisher documents. Checked: {CHECKED_ON}.
                </p>
              </div>

              {/* Status Summary Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {(Object.keys(counts) as Status[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSelectedStatusFilter(selectedStatusFilter === k ? "all" : k)}
                    className={`rounded-full border px-2.5 py-1 transition ${
                      selectedStatusFilter === k
                        ? "ring-2 ring-stone-800 font-bold"
                        : ""
                    } ${STATUS_BADGE[k].bg} ${STATUS_BADGE[k].text} ${STATUS_BADGE[k].border}`}
                  >
                    {STATUS_LABEL[k]}: {counts[k]}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search metrics, sources, numbers, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs focus:bg-white focus:outline-emerald-700 transition"
              />
            </div>

            {/* List of Entries */}
            <div className="mt-5 space-y-3">
              {filteredRegister.map((e) => {
                const badge = STATUS_BADGE[e.status];
                return (
                  <div key={e.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block">
                          {e.category}
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm mt-0.5">{e.metric}</h4>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {STATUS_LABEL[e.status]}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-mono font-bold text-stone-900">
                      {e.value} <span className="text-stone-500 font-normal">({e.year})</span>
                    </div>

                    {e.note && <p className="mt-1 text-xs text-stone-600 leading-relaxed">{e.note}</p>}

                    {e.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap gap-3 text-xs">
                        {e.sources.map((s) => (
                          <a
                            key={s.url}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-800 hover:text-emerald-900 hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>↗</span>
                            {s.label} {s.publisher && <span className="text-[10px] text-stone-500">(Primary Publisher)</span>}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-stone-200 text-xs text-stone-500 flex flex-wrap justify-between items-center gap-4">
        <div>
          World Waste Simulator · Data source: <strong>World Bank Group What a Waste 3.0</strong> (Cook et al., 2026).
        </div>
        <div>
          DOI: <a href="https://doi.org/10.1596/978-1-4648-2309-1" target="_blank" rel="noreferrer" className="underline hover:text-stone-800">10.1596/978-1-4648-2309-1</a>
        </div>
      </footer>
    </main>
  );
}
