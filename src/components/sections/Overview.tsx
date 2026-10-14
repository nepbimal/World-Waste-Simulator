"use client";

import { SCENARIOS, START_YEAR } from "@/lib/waste-model";
import { C, fmt, pct } from "@/lib/format";
import { TrajectoryChart } from "../charts/TrajectoryChart";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { ElasticSlider } from "../ui/ElasticSlider";
import { GlowCard } from "../ui/GlowCard";
import { Reveal } from "../ui/Reveal";
import { SectionHead } from "../ui/SectionHead";
import type { Sim } from "../useSimulation";

export function Overview({ sim }: { sim: Sim }) {
  const { cur, data, bau, year, scenarioId, pickScenario } = sim;
  const g = cur.generated;
  const streams = [
    { k: "Recycled and composted", v: cur.recovered, c: C.leaf },
    { k: "Incinerated for energy", v: cur.incinerated, c: C.gold },
    { k: "Sanitary or controlled landfill", v: cur.controlledLandfill, c: C.sky },
    { k: "Open dumpsites", v: cur.dumpsite, c: C.ember },
    { k: "Uncollected or burned", v: cur.uncollected, c: C.ash },
  ];
  const kpis = [
    { k: `Waste generated, ${year}`, v: cur.generated, f: (n: number) => `${fmt(n)} Mt`, note: sim.avoidedGen > 0 ? `${fmt(sim.avoidedGen)} Mt avoided vs business as usual` : "Business-as-usual path", tone: "text-ink", good: sim.avoidedGen > 0 },
    { k: "Recycled and composted", v: cur.recovered, f: (n: number) => `${fmt(n)} Mt`, note: `${pct(cur.recoveryRate)} of all waste`, tone: "text-leaf", good: true },
    { k: "Landfilled, dumped or burned", v: cur.residual, f: (n: number) => `${fmt(n)} Mt`, note: sim.avoidedDisposal > 0 ? `${fmt(sim.avoidedDisposal)} Mt diverted` : "Nothing diverted yet", tone: "text-ember", good: sim.avoidedDisposal > 0 },
    { k: `Diverted since ${START_YEAR}`, v: sim.cumulativeAvoided / 1000, f: (n: number) => `${n.toFixed(2)} Bt`, note: sim.cumulativeAvoided > 0 ? "Kept out of dumps and landfills" : "No divergence yet", tone: "text-ink", good: sim.cumulativeAvoided > 0 },
  ];

  return (
    <section id="overview" className="pt-24">
      <Reveal>
        <SectionHead eyebrow="Overview" title={<>Choose a future. <span className="italic text-mute">Watch it unfold.</span></>}>
          Three World Bank scenarios, or set your own levers. The dock at the bottom scrubs through the years.
        </SectionHead>
      </Reveal>

      <Reveal className="mt-10 grid gap-4 md:grid-cols-3">
        {SCENARIOS.map((s) => (
          <GlowCard key={s.id} as="button" active={scenarioId === s.id} onClick={() => pickScenario(s)} aria-pressed={scenarioId === s.id} className="p-5 text-left">
            <div className="flex items-start justify-between gap-3">
              <span className="text-lg font-semibold tracking-tight">{s.name}</span>
              {scenarioId === s.id && <span className="rounded-full bg-leaf/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-leaf">Selected</span>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-mute">{s.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[11px] text-mute">
              <span className="rounded-md bg-white/5 px-2 py-1">{fmt(s.target2050Gen)} Mt in 2050</span>
              <span className="rounded-md bg-white/5 px-2 py-1">recovery {s.recoveryTarget}%</span>
              <span className="rounded-md bg-white/5 px-2 py-1">collection {s.collectionTarget}%</span>
            </div>
          </GlowCard>
        ))}
      </Reveal>

      <Reveal className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4" delay={80}>
        {kpis.map((k) => (
          <GlowCard key={k.k} className="p-5">
            <div className="text-xs text-mute">{k.k}</div>
            <AnimatedNumber value={k.v} format={k.f} className={`mt-2 block font-display text-4xl ${k.tone}`} />
            <div className={`mt-2 text-[11px] ${k.good ? "text-leaf" : "text-dim"}`}>{k.good && k.v !== cur.recovered ? "▼ " : ""}{k.note}</div>
          </GlowCard>
        ))}
      </Reveal>

      <Reveal className="mt-4" delay={80}>
        <GlowCard className="p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Million tonnes a year, 2022 to 2050</h3>
              <p className="mt-1 text-sm text-mute">Hover to inspect a year, click or drag to move through time. The dotted line is business as usual.</p>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-mute">
              {[[C.ink, "Generated"], [C.leaf, "Recovered"], [C.ember, "Disposed"]].map(([c, l]) => (
                <li key={l} className="flex items-center gap-1.5"><i className="h-0.5 w-4 rounded" style={{ background: c }} />{l}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <TrajectoryChart
              years={data.map((d) => d.year)}
              generated={data.map((d) => d.generated)}
              recovered={data.map((d) => d.recovered)}
              residual={data.map((d) => d.residual)}
              bauGenerated={bau.map((d) => d.generated)}
              selectedYear={year}
              onSelectYear={sim.setYear}
            />
          </div>
        </GlowCard>
      </Reveal>

      <Reveal className="mt-4 grid gap-4 lg:grid-cols-5" delay={80}>
        <GlowCard className="p-5 sm:p-7 lg:col-span-3">
          <h3 className="text-lg font-semibold tracking-tight">Where {year}&apos;s waste goes</h3>
          <div className="mt-5 flex h-9 w-full overflow-hidden rounded-xl bg-white/5">
            {streams.map((s) => (
              <div key={s.k} title={`${s.k}: ${fmt(s.v)} Mt`} className="h-full transition-[width] duration-700 ease-out first:rounded-l-xl last:rounded-r-xl" style={{ width: `${(s.v / g) * 100}%`, background: s.c }} />
            ))}
          </div>
          <ul className="mt-5 grid gap-3.5">
            {streams.map((s) => (
              <li key={s.k} className="flex items-center gap-3 text-sm">
                <i className="h-3 w-3 shrink-0 rounded" style={{ background: s.c }} />
                <span className="flex-1 text-mute">{s.k}</span>
                <span className="w-16 text-right font-mono text-ink">{pct(s.v / g)}</span>
                <span className="w-24 text-right font-mono text-xs text-dim">{fmt(s.v)} Mt</span>
              </li>
            ))}
          </ul>
        </GlowCard>

        <GlowCard className="space-y-6 p-5 sm:p-7 lg:col-span-2">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Your levers</h3>
            <p className="mt-1 text-sm text-mute">Moving either slider switches to a custom scenario.</p>
          </div>
          <ElasticSlider label="Waste prevented by 2050" value={sim.growthCut} min={0} max={100} onChange={sim.setGrowth} display={`${sim.growthCut}% of growth`} hint="0% is business as usual (3.86 Bt). 100% holds waste at 2022 levels (2.56 Bt)." />
          <ElasticSlider label="Global recovery target, 2050" value={sim.recoveryTarget} min={20} max={80} onChange={sim.setRecovery} display={`${sim.recoveryTarget}%`} accent={C.gold} hint="Today it is about 21%. The high-ambition scenario targets 54%." />
        </GlowCard>
      </Reveal>
    </section>
  );
}
