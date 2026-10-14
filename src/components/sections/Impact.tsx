"use client";

import { operationalCostBn } from "@/lib/costs";
import { fmt } from "@/lib/format";
import { SPECIES_CAVEATS } from "@/lib/planet-impact";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { GlowCard } from "../ui/GlowCard";
import { Reveal } from "../ui/Reveal";
import { SectionHead } from "../ui/SectionHead";
import type { Sim } from "../useSimulation";

export function Impact({ sim }: { sim: Sim }) {
  const { cur, year, bauCur } = sim;
  const plastic = cur.byMaterial.find((m) => m.id === "plastic")!;
  const cards = [
    { eyebrow: "Climate", tone: "text-ink", value: cur.co2eMethane, f: (n: number) => `${fmt(n)} Mt CO₂e`, body: "A year of greenhouse gas from food and garden waste rotting in dumps and landfills.", foot: "Composting and anaerobic digestion can prevent up to 90% of landfill methane.", footTone: "border-leaf/25 bg-leaf/[0.07] text-leaf" },
    { eyebrow: "Water and land", tone: "text-ember", value: plastic.residual * 0.288, f: (n: number) => `${fmt(n)} Mt`, body: `Plastic that is dumped or never collected in ${year}. Applies the registered 28.8% mismanaged share to plastic that is not recovered (a simplification).`, foot: "About 65% of municipal plastic is single-use packaging.", footTone: "border-ember/25 bg-ember/[0.07] text-ember" },
    { eyebrow: "Cost of managing it", tone: "text-ink", value: operationalCostBn(year, cur.generated, bauCur.generated), f: (n: number) => `$${fmt(n)} billion`, body: `Direct municipal cost in ${year}: the World Bank's US$250B (2022) to US$426B (2050) business-as-usual path, scaled to this scenario's waste. A derived estimate; see the register.`, foot: "The register lists about 18 million urban waste workers worldwide.", footTone: "border-white/10 bg-white/[0.04] text-mute" },
  ];
  return (
    <section id="impact" className="pt-28">
      <Reveal>
        <SectionHead eyebrow="Planetary footprint" title={<>What it costs <span className="italic text-mute">beyond the bin.</span></>}>
          Model outputs for {year}, linked to the climate, water and wildlife figures in the register.
        </SectionHead>
      </Reveal>
      <Reveal className="mt-10 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <GlowCard key={c.eyebrow} className="flex flex-col p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">{c.eyebrow}</div>
            <AnimatedNumber value={c.value} format={c.f} className={`mt-3 block font-display text-4xl ${c.tone}`} />
            <p className="mt-2 flex-1 text-sm leading-relaxed text-mute">{c.body}</p>
            <div className={`mt-4 rounded-xl border px-3 py-2 text-xs ${c.footTone}`}>{c.foot}</div>
          </GlowCard>
        ))}
      </Reveal>
      <Reveal className="mt-4" delay={80}>
        <GlowCard className="p-6 sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight">Wildlife: what we can and cannot say</h3>
          <p className="mt-1 text-sm text-mute">Published findings are listed in the register. This model does not predict extinctions.</p>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {SPECIES_CAVEATS.map((c, i) => (
              <li key={c} className="rounded-2xl border border-line bg-white/[0.03] p-4 text-sm leading-relaxed text-mute">
                <span className="mb-2 block font-mono text-xs text-violet">0{i + 1}</span>
                {c}
              </li>
            ))}
          </ul>
        </GlowCard>
      </Reveal>
    </section>
  );
}
