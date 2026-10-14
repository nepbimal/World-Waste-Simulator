"use client";

import { REGIONS } from "@/lib/waste-model";
import { fmt, pct } from "@/lib/format";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { GlowCard } from "../ui/GlowCard";
import { Reveal } from "../ui/Reveal";
import { SectionHead } from "../ui/SectionHead";
import type { Sim } from "../useSimulation";

export function Regions({ sim }: { sim: Sim }) {
  const { cur, year } = sim;
  const total = cur.generated;
  const growth = REGIONS.map((r) => ({ name: r.name, g: r.gen2050 / r.gen2022 - 1 })).sort((a, b) => b.g - a.g);
  const collect = (id: string) => REGIONS.find((r) => r.id === id)!;
  return (
    <section id="regions" className="pt-28">
      <Reveal>
        <SectionHead eyebrow="Seven regions" title={<>The same planet, <span className="italic text-mute">very different bins.</span></>}>
          Waste, recycling and collection by World Bank region in {year}.
        </SectionHead>
      </Reveal>
      <Reveal className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cur.byRegion.map((r) => {
          const meta = collect(r.id);
          const g = meta.gen2050 / meta.gen2022 - 1;
          return (
            <GlowCard key={r.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{r.name}</h3>
                <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-mute">{r.code}</span>
              </div>
              <AnimatedNumber value={r.generated} format={(n) => `${fmt(n)} Mt`} className="mt-3 block font-display text-4xl" />
              <div className="mt-1 text-xs text-dim">{pct(r.generated / total)} of the world&apos;s waste</div>
              <div className="mt-2 inline-flex rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-mute">{g >= 0 ? "+" : ""}{Math.round(g * 100)}% by 2050 (BAU)</div>
              <div className="mt-auto flex items-center justify-between pt-4 text-xs">
                <span className="text-mute">Recovered</span>
                <span className="font-mono text-leaf">{pct(r.recovery)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-leaf transition-[width] duration-700 ease-out" style={{ width: `${Math.min(100, r.recovery * 100)}%` }} />
              </div>
              <div className="mt-4 flex justify-between border-t border-line pt-3 text-xs text-mute">
                <span>{meta.perCapita2022} kg / person / day</span>
                <span>{Math.round(meta.collectionRate2022 * 100)}% collected</span>
              </div>
            </GlowCard>
          );
        })}
        <GlowCard className="flex flex-col justify-between border-leaf/30 bg-leaf/[0.05] p-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-leaf">World</div>
            <AnimatedNumber value={total} format={(n) => `${fmt(n)} Mt`} className="mt-3 block font-display text-4xl" />
            <div className="mt-1 text-xs text-dim">all seven regions, {year}</div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs"><span className="text-mute">Recovered</span><span className="font-mono text-leaf">{pct(cur.recoveryRate)}</span></div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-leaf transition-[width] duration-700 ease-out" style={{ width: `${cur.recoveryRate * 100}%` }} /></div>
          </div>
        </GlowCard>
      </Reveal>
      <Reveal delay={80} className="mt-4">
        <GlowCard className="flex flex-wrap items-center gap-x-6 gap-y-2 border-gold/30 p-5 text-sm text-mute">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">Fastest growth</span>
          <span>
            Under business as usual, {growth[0].name} grows <b className="text-ink">{Math.round(growth[0].g * 100)}%</b> and {growth[1].name} grows <b className="text-ink">{Math.round(growth[1].g * 100)}%</b> between 2022 and 2050, the figures in the current model data.
          </span>
        </GlowCard>
      </Reveal>
    </section>
  );
}
