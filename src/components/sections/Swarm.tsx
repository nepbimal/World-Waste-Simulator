"use client";

import { C, pct } from "@/lib/format";
import { BandChart } from "../charts/BandChart";
import { ElasticSlider } from "../ui/ElasticSlider";
import { GlowCard } from "../ui/GlowCard";
import { Reveal } from "../ui/Reveal";
import { SectionHead } from "../ui/SectionHead";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import type { Sim } from "../useSimulation";

const PACE_PRESETS = [
  { label: "EU 2014–24", value: 0.5, detail: "EU-27 average, 43.0% to 48.1%" },
  { label: "EU 2004–14", value: 1.3, detail: "EU-28 average, 30% to 43% (older definition)" },
  { label: "Poland, Slovenia", value: 2.5, detail: "Fastest sustained national gains found, about 2.4 to 2.7 points a year" },
];

export function Swarm({ sim }: { sim: Sim }) {
  const { bands, sched, targetYear } = sim;
  const last = bands[bands.length - 1];
  return (
    <section id="swarm" className="pt-28">
      <Reveal>
        <SectionHead eyebrow="Household swarm" title={<>A thousand households, <span className="italic text-mute">copying their neighbours.</span></>}>
          1,050 simulated households (150 per region) imitate each other and respond to policy, over 25 random runs. It shows a range of outcomes, not one line.
          It is a model of behaviour, not validated against real data.
        </SectionHead>
      </Reveal>

      <Reveal className="mt-10 grid gap-4 lg:grid-cols-5">
        <GlowCard className="p-5 sm:p-7 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight">Share of waste recycled</h3>
            <ul className="flex gap-4 text-xs text-mute">
              <li className="flex items-center gap-1.5"><i className="h-2 w-4 rounded-sm bg-leaf/50" />Median and 10–90% range</li>
              <li className="flex items-center gap-1.5"><i className="h-0.5 w-4 rounded" style={{ background: C.gold }} />Path your target needs</li>
            </ul>
          </div>
          <div className="mt-3"><BandChart bands={bands} schedule={sched.rows} /></div>
          <p className="mt-2 text-sm text-mute">
            2050 simulated median <b className="font-mono text-leaf">{pct(last.p50)}</b> (range {pct(last.p10)} to {pct(last.p90)}) against <b className="font-mono text-gold">{pct(sched.rows[sched.rows.length - 1].rate)}</b> required.
          </p>
        </GlowCard>

        <GlowCard className="space-y-6 p-5 sm:p-7 lg:col-span-2">
          <h3 className="text-lg font-semibold tracking-tight">How the households behave</h3>
          <ElasticSlider label="Echo chambers" value={sim.echo} min={0} max={1} step={0.1} onChange={sim.setEcho} display={sim.echo.toFixed(1)} hint="0 means everyone hears everyone. 1 means people mostly hear people like them." />
          <ElasticSlider label="Herd effect" value={sim.herd} min={0} max={2} step={0.1} onChange={sim.setHerd} display={sim.herd.toFixed(1)} hint="How strongly neighbours' habits amplify the same policy." accent={C.violet} />
        </GlowCard>
      </Reveal>

      <Reveal className="mt-4" delay={80}>
        <GlowCard className="p-5 sm:p-7">
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold tracking-tight">How fast must recycling grow?</h3>
            <p className="mt-1 text-sm text-mute">Set a target and a deadline. The solver works out the yearly gain required and the last year you can start.</p>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <ElasticSlider label="Target recycled share" value={sim.target} min={30} max={85} onChange={sim.setTarget} display={`${sim.target}%`} accent={C.gold} />
            <ElasticSlider label="Deadline" value={sim.targetYear} min={2030} max={2050} onChange={sim.setTargetYear} display={String(sim.targetYear)} accent={C.gold} />
            <div>
              <ElasticSlider label="Fastest realistic gain" value={sim.maxGain} min={0.5} max={5} step={0.1} onChange={sim.setMaxGain} display={`${sim.maxGain.toFixed(1)} pts / year`} accent={C.gold} />
              <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Recycling pace reference points">
                {PACE_PRESETS.map((p) => (
                  <button key={p.label} type="button" onClick={() => sim.setMaxGain(p.value)} aria-pressed={Math.abs(sim.maxGain - p.value) < 0.05} title={p.detail}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition ${Math.abs(sim.maxGain - p.value) < 0.05 ? "border-gold/60 bg-gold/15 text-gold" : "border-line text-mute hover:text-ink"}`}>
                    {p.label} {p.value}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-dim">
                Reference points from European data (see Sources). 2.5 is a judgement: it equals the fastest sustained national gains found, in countries that started from 3 to 5%. No source gives a pace for the whole world.
              </p>
            </div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-white/[0.03] p-4">
              <div className="text-xs text-mute">Required gain from 2026</div>
              <AnimatedNumber value={sched.gainNeeded} format={(n) => `+${n.toFixed(2)} pts / yr`} className="mt-1 block font-display text-3xl" />
            </div>
            <div className={`rounded-2xl border p-4 ${sched.feasible ? "border-leaf/30 bg-leaf/[0.06]" : "border-ember/40 bg-ember/[0.08]"}`}>
              <div className="text-xs text-mute">Latest year you can start</div>
              <div className={`mt-1 font-display text-3xl ${sched.feasible ? "text-leaf" : "text-ember"}`}>{sched.feasible ? sched.latestStart : "Already too late"}</div>
              <div className="mt-1 text-[11px] text-dim">{sched.feasible ? "Starting later misses the deadline" : "Lower the target or raise the pace"}</div>
            </div>
            <div className="rounded-2xl border border-line bg-white/[0.03] p-4">
              <div className="text-xs text-mute">Best reachable by {targetYear}</div>
              <AnimatedNumber value={sched.reachable * 100} format={(n) => `${n.toFixed(1)}%`} className="mt-1 block font-display text-3xl" />
            </div>
          </div>
        </GlowCard>
      </Reveal>
    </section>
  );
}
