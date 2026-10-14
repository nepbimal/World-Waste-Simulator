import { GLOBAL_2022, GLOBAL_2050_BAU, GLOBAL_RECOVERY_2022 } from "@/lib/waste-model";
import { fmt } from "@/lib/format";
import { CountUp } from "../ui/AnimatedNumber";
import type { Sim } from "../useSimulation";

// Rounds half up, so 3.855 shows as 3.86 like the published figure.
const bt = (n: number) => (Math.round(n * 100 + 1e-6) / 100).toFixed(2);
const LINE_1 = "Where does the world's waste go,".split(" ");
const LINE_2 = "and where is it headed?".split(" ");

export function Hero({ sim }: { sim: Sim }) {
  const base = sim.data[0];
  const unmanaged = (base.dumpsite + base.uncollected) / base.generated;
  return (
    <section id="top" className="relative pb-10 pt-16 sm:pt-24">
      <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-mute">
        <span className="tick-live h-1.5 w-1.5 rounded-full bg-leaf" />
        World Bank · What a Waste 3.0 · 2022 to 2050
      </div>

      <h1 className="mt-7 font-display text-[clamp(2.5rem,6.3vw,5.2rem)] leading-[0.98] tracking-tight">
        {LINE_1.map((w, i) => (
          <span key={`a${i}`} className="word mr-[0.25em]" style={{ "--i": i } as React.CSSProperties}>{w}</span>
        ))}
        <br />
        {LINE_2.map((w, i) => (
          <span key={`b${i}`} className="word mr-[0.25em] italic grad-text" style={{ "--i": i + LINE_1.length } as React.CSSProperties}>{w}</span>
        ))}
      </h1>

      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-mute">
        Play the next three decades of municipal waste: how much we make, what gets recycled, and what ends up in landfills, dumps and fires.
        Change the policy and watch the curves bend. <span className="shine">Every number is sourced.</span>
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-4">
        <a href="#overview" className="orbit"><span>Run the simulation <span aria-hidden="true">↓</span></span></a>
        <a href="#sources" className="rounded-full px-5 py-3 text-sm font-medium text-mute transition hover:text-ink">How it is sourced</a>
      </div>

      <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-4">
        {[
          { k: "Waste produced, 2022", node: <><CountUp to={GLOBAL_2022 / 1000} format={bt} /> <span className="text-mute text-lg">billion t</span></> },
          { k: "Projected 2050 (business as usual)", node: <><CountUp to={GLOBAL_2050_BAU / 1000} format={bt} /> <span className="text-mute text-lg">billion t</span></> },
          { k: "Recycled or composted today", node: <><CountUp to={GLOBAL_RECOVERY_2022 * 100} format={(n) => n.toFixed(1)} /><span className="text-mute text-lg">%</span></> },
          { k: "Dumped or never collected", node: <><CountUp to={unmanaged * 100} format={(n) => fmt(n)} /><span className="text-mute text-lg">%</span></> },
        ].map((s) => (
          <div key={s.k} className="bg-[#080b0e]/80 p-5 sm:p-6">
            <dd className="font-display text-4xl sm:text-5xl">{s.node}</dd>
            <dt className="mt-2 text-xs text-mute">{s.k}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
