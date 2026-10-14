"use client";

import { C, fmt, pct } from "@/lib/format";
import {
  METHANE_SHARE,
  foodHalvingBenchmark,
  foodKgPerPerson,
  mismanagedPlasticMt,
  mismanagedShare,
  municipalEwasteMt,
  publishedBauMethaneMt,
  publishedHighMethane2050Mt,
  singleUsePlasticMt,
  textiles,
  totalEwasteMt,
} from "@/lib/streams";
import { Spark } from "../charts/Spark";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { GlowCard } from "../ui/GlowCard";
import { Reveal } from "../ui/Reveal";
import { SectionHead } from "../ui/SectionHead";
import type { Sim } from "../useSimulation";

function Badge({ kind }: { kind: "derived" | "confirmed" | "single" | "conflicting" }) {
  const style = {
    derived: "border-sky/40 bg-sky/10 text-sky",
    confirmed: "border-leaf/40 bg-leaf/10 text-leaf",
    single: "border-gold/40 bg-gold/10 text-gold",
    conflicting: "border-ember/45 bg-ember/10 text-ember",
  }[kind];
  const label = { derived: "Derived", confirmed: "Confirmed", single: "Single source", conflicting: "Sources conflict" }[kind];
  return <a href="#sources" className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`} title="See the register for sources">{label}</a>;
}

function Legend({ items }: { items: { c: string; l: string; dashed?: boolean }[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-mute">
      {items.map((i) => (
        <li key={i.l} className="flex items-center gap-1.5">
          <i className="inline-block w-4 border-t-2" style={{ borderColor: i.c, borderStyle: i.dashed ? "dotted" : "solid" }} />{i.l}
        </li>
      ))}
    </ul>
  );
}

export function Streams({ sim }: { sim: Sim }) {
  const { data, bau, cur, bauCur, year } = sim;
  const years = data.map((d) => d.year);
  const base = foodKgPerPerson(data[0]);
  const foodNow = foodKgPerPerson(cur);
  const foodGoal = foodHalvingBenchmark(base, year);

  const ewTotal = totalEwasteMt(year);
  const ewMuni = municipalEwasteMt(cur);

  const plasticNow = mismanagedPlasticMt(cur);
  const plastic22 = mismanagedPlasticMt(data[0]);

  const methNow = cur.co2eMethane;
  const methPub = publishedBauMethaneMt(year);
  const tx = textiles(cur);
  const last = data[data.length - 1];

  return (
    <section id="streams" className="pt-28">
      <Reveal>
        <SectionHead eyebrow="Food, e-waste, plastics, climate" title={<>Four stories <span className="italic text-mute">inside the totals.</span></>}>
          Each panel follows the waste stream from the model for your scenario and compares it with a published benchmark. Year {year}.
        </SectionHead>
      </Reveal>

      <Reveal className="mt-10 grid gap-4 md:grid-cols-2">
        {/* FOOD */}
        <GlowCard className="flex flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Food · SDG 12.3</div>
            <Badge kind="derived" />
          </div>
          <AnimatedNumber value={foodNow} format={(n) => `${fmt(n)} kg`} className="mt-3 block font-display text-4xl" />
          <p className="text-sm text-mute">of food waste per person in {year}, in the municipal stream</p>
          <div className="mt-3">
            <Spark years={years} marker={year} unit="kg per person"
              ariaLabel={`Food waste per person: ${fmt(base)} kg in 2022, ${fmt(foodKgPerPerson(last))} kg in 2050 for this scenario, against a line that halves the 2022 level by 2030`}
              series={[
                { label: "Your scenario", color: C.leaf, values: data.map(foodKgPerPerson) },
                { label: "Business as usual", color: C.mute, dashed: true, values: bau.map(foodKgPerPerson) },
                { label: "Halving line", color: C.gold, dashed: true, values: years.map((y) => foodHalvingBenchmark(base, y)) },
              ]} />
            <Legend items={[{ c: C.leaf, l: "Your scenario" }, { c: C.mute, l: "Business as usual", dashed: true }, { c: C.gold, l: "Half of 2022 by 2030", dashed: true }]} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-mute">
            The halving line sits at <b className="text-gold">{fmt(foodGoal)} kg</b> in {year}; this scenario is at <b className="text-ink">{fmt(foodNow)} kg</b>
            {foodNow <= foodGoal ? ", at or below the line." : `, ${fmt(foodNow - foodGoal)} kg above it.`}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-dim">
            Scope: SDG 12.3 is measured with the UNEP Food Waste Index (retail, food service and households: 1.05 billion tonnes, 132 kg per person in 2022).
            This panel uses the model&apos;s municipal food stream (about 123 kg per person), and the model cuts every material equally, so it cannot target food specifically.
          </p>
        </GlowCard>

        {/* E-WASTE */}
        <GlowCard className="flex flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">E-waste · two scopes</div>
            <Badge kind="conflicting" />
          </div>
          <AnimatedNumber value={ewMuni} format={(n) => `${fmt(n)} Mt`} className="mt-3 block font-display text-4xl" />
          <p className="text-sm text-mute">of electronics in the municipal bin in {year} (model)</p>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="flex justify-between"><span className="text-mute">In the municipal bin (model)</span><span className="font-mono text-ink">{fmt(ewMuni)} Mt</span></div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-sky transition-[width] duration-700 ease-out" style={{ width: `${Math.min(100, (ewMuni / (ewTotal ?? 82)) * 100)}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between"><span className="text-mute">All e-waste, every channel (published)</span><span className="font-mono text-ink">{ewTotal === null ? "no projection" : `${fmt(ewTotal)} Mt`}</span></div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-violet transition-[width] duration-700 ease-out" style={{ width: ewTotal === null ? "0%" : "100%" }} /></div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-mute">
            {ewTotal === null
              ? `No source I found projects total e-waste beyond 2030, so only the model's municipal share is shown for ${year}.`
              : `The municipal bin holds about ${pct(ewMuni / ewTotal)} of all e-waste in ${year}.`}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-dim">
            Why two numbers: the UN Global E-waste Monitor counts all electrical and electronic waste from households, business and industry (62 Mt in 2022, projected 82 Mt in 2030, with the documented recycling share falling from 22.3% to about 20%).
            City waste audits only see what lands in municipal bins (1.7% of municipal waste, about 44 Mt). The rest travels through other channels. 2023 to 2029 is a straight line between the two published points.
          </p>
        </GlowCard>

        {/* PLASTICS */}
        <GlowCard className="flex flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Plastics · leakage</div>
            <Badge kind="derived" />
          </div>
          <AnimatedNumber value={plasticNow} format={(n) => `${fmt(n)} Mt`} className="mt-3 block font-display text-4xl text-ember" />
          <p className="text-sm text-mute">of plastic dumped or never collected in {year} ({pct(mismanagedShare(cur))} of all waste is mismanaged)</p>
          <div className="mt-3">
            <Spark years={years} marker={year} unit="Mt a year"
              ariaLabel={`Mismanaged plastic: ${fmt(plastic22)} Mt in 2022 and ${fmt(mismanagedPlasticMt(last))} Mt in 2050 for this scenario, against ${fmt(mismanagedPlasticMt(bau[bau.length - 1]))} Mt under business as usual`}
              series={[
                { label: "Your scenario", color: C.ember, values: data.map(mismanagedPlasticMt) },
                { label: "Business as usual", color: C.mute, dashed: true, values: bau.map(mismanagedPlasticMt) },
              ]} />
            <Legend items={[{ c: C.ember, l: "Your scenario" }, { c: C.mute, l: "Business as usual", dashed: true }]} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-mute">
            Single-use packaging is about 65% of municipal plastic: <b className="text-ink">{fmt(singleUsePlasticMt(cur))} Mt</b> in {year}.
            Compared with 2022 ({fmt(plastic22)} Mt), mismanaged plastic is {plasticNow < plastic22 ? `${fmt(plastic22 - plasticNow)} Mt lower` : `${fmt(plasticNow - plastic22)} Mt higher`}.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-dim">
            Method: plastic generated times the share of all waste that the scenario leaves dumped or uncollected, so it falls as collection grows.
            This assumes plastic is mismanaged in the same proportion as waste overall; the 2022 result (about 96 Mt) is within 3% of the published 93 Mt. Only part of it reaches the ocean.
          </p>
        </GlowCard>

        {/* METHANE */}
        <GlowCard className="flex flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Climate · methane</div>
            <Badge kind="derived" />
          </div>
          <AnimatedNumber value={methNow} format={(n) => `${fmt(n)} Mt CO₂e`} className="mt-3 block font-display text-4xl" />
          <p className="text-sm text-mute">from food and garden waste that is not recovered, {year}</p>
          <div className="mt-3">
            <Spark years={years} marker={year} unit="Mt CO₂e"
              ariaLabel={`Waste methane: ${fmt(data[0].co2eMethane)} Mt CO2e in 2022 and ${fmt(last.co2eMethane)} Mt in 2050 for this scenario, against ${fmt(bau[bau.length - 1].co2eMethane)} Mt under business as usual`}
              series={[
                { label: "Your scenario", color: C.leaf, values: data.map((d) => d.co2eMethane) },
                { label: "Business as usual (model)", color: C.mute, dashed: true, values: bau.map((d) => d.co2eMethane) },
                { label: "World Bank business as usual (estimate)", color: C.gold, dashed: true, values: years.map(publishedBauMethaneMt) },
              ]} />
            <Legend items={[{ c: C.leaf, l: "Your scenario" }, { c: C.mute, l: "Business as usual (model)", dashed: true }, { c: C.gold, l: "World Bank BAU (estimate)", dashed: true }]} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-mute">
            The World Bank&apos;s business-as-usual path implies about <b className="text-gold">{fmt(methPub)} Mt</b> of methane in {year}; the model&apos;s business as usual gives <b className="text-ink">{fmt(bauCur.co2eMethane)} Mt</b>.
            {" "}In 2050 the high-ambition case implies about {fmt(publishedHighMethane2050Mt)} Mt.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-dim">
            The World Bank gives total waste emissions (1.28 Gt CO₂e in 2022, 1.84 Gt in 2050 business as usual); I took the methane part at {(METHANE_SHARE * 100).toFixed(0)}% and filled the years between in a straight line, so the gold line is an estimate.
            The model counts all unrecovered food and garden waste as methane whatever the landfill type, so it cannot show the benefit of gas capture.
          </p>
        </GlowCard>
      </Reveal>

      <Reveal className="mt-4" delay={80}>
        <GlowCard className="grid gap-4 p-6 md:grid-cols-[1fr_2fr] md:items-center">
          <div>
            <div className="flex items-center gap-2"><div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Textiles</div><Badge kind="conflicting" /></div>
            <AnimatedNumber value={tx.generated} format={(n) => `${fmt(n)} Mt`} className="mt-2 block font-display text-4xl" />
            <p className="text-sm text-mute">in the municipal stream, {year}</p>
          </div>
          <p className="text-sm leading-relaxed text-mute">
            The model recovers <b className="text-ink">{pct(tx.recoveredShare)}</b> of textiles in {year} ({fmt(tx.recovered)} Mt). That counts all recovery routes. A widely cited analysis found under 1% of clothing fibre is recycled back into new clothing, and published volumes range from 92 to 120 Mt a year depending on what is counted, so treat these as different measures. See the register.
          </p>
        </GlowCard>
      </Reveal>
    </section>
  );
}
