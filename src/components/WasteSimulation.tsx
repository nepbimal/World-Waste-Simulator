"use client";

import { useMemo, useState } from "react";
import { END_YEAR, MATERIALS, REGIONS, SCENARIOS, START_YEAR, simulate } from "@/lib/waste-model";
import { CHECKED_ON, MODEL_ASSUMPTIONS, REGISTER, STATUS_LABEL, statusCounts, type Entry, type Status } from "@/lib/data-register";
import { SPECIES_CAVEATS } from "@/lib/planet-impact";
import { NOW_YEAR, requiredSchedule, runSwarm, type Band } from "@/lib/swarm-model";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function LineChart({ series, years }: { series: { name: string; color: string; values: number[] }[]; years: number[] }) {
  const W = 640, H = 260, L = 48, R = 12, T = 12, B = 28;
  const max = Math.max(...series.flatMap((s) => s.values)) * 1.08;
  const x = (i: number) => L + (i / (years.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Waste generated, recovered and disposed per year">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#00000012" />
          <text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#6f6858">{fmt(t)}</text>
        </g>
      ))}
      {years.map((yr, i) => (yr % 10 === 0 || i === 0 || i === years.length - 1) && (
        <text key={yr} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#6f6858">{yr}</text>
      ))}
      {series.map((s) => (
        <polyline key={s.name} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round"
          points={s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} />
      ))}
    </svg>
  );
}

function BandChart({ bands, schedule }: { bands: Band[]; schedule: { year: number; rate: number }[] }) {
  const W = 640, H = 240, L = 40, R = 12, T = 12, B = 26;
  const max = Math.max(0.6, ...bands.map((b) => b.p90), ...schedule.map((r) => r.rate)) * 1.05;
  const x = (yr: number) => L + ((yr - START_YEAR) / (END_YEAR - START_YEAR)) * (W - L - R);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const f = (n: number) => n.toFixed(1);
  const area = [...bands.map((b) => `${f(x(b.year))},${f(y(b.p90))}`), ...[...bands].reverse().map((b) => `${f(x(b.year))},${f(y(b.p10))}`)].join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Recycling rate: swarm simulation range and required path">
      {[0, 0.2, 0.4, 0.6, 0.8].filter((t) => t <= max).map((t) => (
        <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#00000012" /><text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#6f6858">{Math.round(t * 100)}%</text></g>
      ))}
      {[2022, 2026, 2035, 2050].map((yr) => <text key={yr} x={x(yr)} y={H - 8} textAnchor="middle" fontSize="10" fill="#6f6858">{yr}</text>)}
      <polygon points={area} fill="#3f6b52" opacity="0.2" />
      <polyline fill="none" stroke="#3f6b52" strokeWidth="2.5" points={bands.map((b) => `${f(x(b.year))},${f(y(b.p50))}`).join(" ")} />
      <polyline fill="none" stroke="#b8834a" strokeWidth="2.5" strokeDasharray="6 4" points={schedule.map((r) => `${f(x(r.year))},${f(y(r.rate))}`).join(" ")} />
    </svg>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  confirmed: "border-[#3f6b52]/40 bg-[#3f6b52]/10 text-[#2f5440]",
  single: "border-[#b8834a]/50 bg-[#b8834a]/10 text-[#7a5427]",
  conflicting: "border-[#c0563f]/40 bg-[#c0563f]/10 text-[#8e3a28]",
  derived: "border-[#5f8fa8]/50 bg-[#5f8fa8]/10 text-[#3d6579]",
  estimate: "border-black/20 bg-black/[0.04] text-[#4a4540]",
};

function EntryRow({ e }: { e: Entry }) {
  return (
    <li className="rounded-lg bg-white/60 p-3 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-medium">{e.metric}</span>
        <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_STYLE[e.status]}`}>{STATUS_LABEL[e.status]}</span>
      </div>
      <div className="mt-1">{e.value} <span className="text-[#6f6858]">({e.year})</span></div>
      {e.note && <p className="mt-1 text-xs text-[#6f6858]">{e.note}</p>}
      {e.sources.length > 0 && (
        <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
          {e.sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="underline text-[#6f6858]">{s.label}{s.publisher ? " (publisher)" : ""}</a>
          ))}
        </p>
      )}
    </li>
  );
}

export default function WasteSimulation() {
  const [scenarioId, setScenarioId] = useState("bau");
  const base = SCENARIOS.find((s) => s.id === scenarioId)!;
  const [growthCut, setGrowthCut] = useState(base.growthCut);
  const [recoveryTarget, setRecoveryTarget] = useState(base.recoveryTarget);
  const [year, setYear] = useState(2035);
  const [echo, setEcho] = useState(0.3);
  const [herd, setHerd] = useState(0.5);
  const [target, setTarget] = useState(50);
  const [targetYear, setTargetYear] = useState(2040);
  const [maxGain, setMaxGain] = useState(2.5);

  const pick = (id: string) => {
    const s = SCENARIOS.find((x) => x.id === id)!;
    setScenarioId(id); setGrowthCut(s.growthCut); setRecoveryTarget(s.recoveryTarget);
  };

  const data = useMemo(() => simulate({ growthCut, recoveryTarget }), [growthCut, recoveryTarget]);
  const bau = useMemo(() => simulate({ growthCut: 0, recoveryTarget: 2 }), []);
  const bands = useMemo(
    () => runSwarm({ recoveryTarget, echo, herd, agents: 150, runs: 25, seed: 42 }, data),
    [recoveryTarget, echo, herd, data],
  );
  const sched = useMemo(() => requiredSchedule(data, target / 100, targetYear, maxGain), [data, target, targetYear, maxGain]);
  const counts = useMemo(() => statusCounts(), []);
  const categories = useMemo(() => Array.from(new Set([...REGISTER, ...MODEL_ASSUMPTIONS].map((e) => e.category))), []);
  const cur = data[year - START_YEAR];
  const years = data.map((d) => d.year);
  const cumulativeResidual = data.slice(0, year - START_YEAR + 1).reduce((a, d) => a + d.residual, 0);
  const foodDisposed = cur.byMaterial.filter((m) => m.id === "food").reduce((a, m) => a + m.generated - m.recovered, 0);
  const plasticDisposed = cur.byMaterial.filter((m) => m.id === "plastic").reduce((a, m) => a + m.generated - m.recovered, 0);
  const avoided = bau[year - START_YEAR].residual - cur.residual;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 text-[#201c17]">
      <h1 className="text-3xl font-semibold">Waste simulation to 2050</h1>
      <p className="mt-2 max-w-2xl text-[#6f6858]">
        How much municipal solid waste the world produces, how much is recycled or composted, and what is left to landfill,
        dump or burn. Starts from the World Bank&apos;s 2022 data (published 2026) and projects each region forward under the scenario you choose.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {SCENARIOS.map((s) => (
          <button key={s.id} onClick={() => pick(s.id)}
            className={`rounded-xl border p-4 text-left transition ${scenarioId === s.id ? "border-[#3f6b52] bg-[#3f6b52]/10" : "border-black/10 bg-white/50 hover:bg-white"}`}>
            <div className="font-medium">{s.name}</div>
            <div className="mt-1 text-sm text-[#6f6858]">{s.blurb}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 rounded-xl border border-black/10 bg-white/50 p-5 sm:grid-cols-3">
        <label className="text-sm">Year: <b>{year}</b>
          <input type="range" min={START_YEAR} max={END_YEAR} value={year} onChange={(e) => setYear(+e.target.value)} className="mt-2 w-full" />
        </label>
        <label className="text-sm">Waste prevention by 2050: <b>{growthCut}%</b> of projected growth avoided
          <input type="range" min={0} max={100} value={growthCut} onChange={(e) => { setGrowthCut(+e.target.value); setScenarioId("custom"); }} className="mt-2 w-full" />
        </label>
        <label className="text-sm">Extra recovery by 2050: <b>+{recoveryTarget}</b> points
          <input type="range" min={0} max={50} value={recoveryTarget} onChange={(e) => { setRecoveryTarget(+e.target.value); setScenarioId("custom"); }} className="mt-2 w-full" />
        </label>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Waste generated", `${fmt(cur.generated)} Mt`],
          ["Recycled + composted", `${fmt(cur.recovered)} Mt (${pct(cur.recoveryRate)})`],
          ["Landfilled / dumped / burned", `${fmt(cur.residual)} Mt`],
          [`Cumulative disposed ${START_YEAR}–${year}`, `${(cumulativeResidual / 1000).toFixed(1)} Bt`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-black/10 bg-white/50 p-4">
            <div className="text-xs text-[#6f6858]">{k}</div>
            <div className="mt-1 text-lg font-semibold">{v}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-[#6f6858]">
        Compared with business as usual in {year}, this scenario disposes of {fmt(Math.max(avoided, 0))} Mt less per year.
      </p>

      <section className="mt-8 rounded-xl border border-black/10 bg-white/50 p-5">
        <h2 className="font-medium">Million tonnes per year</h2>
        <div className="mt-2 flex flex-wrap gap-4 text-xs">
          {[["Generated", "#201c17"], ["Recovered", "#3f6b52"], ["Disposed", "#c0563f"]].map(([n, c]) => (
            <span key={n} className="flex items-center gap-1"><i className="inline-block h-2 w-4 rounded" style={{ background: c }} />{n}</span>
          ))}
        </div>
        <LineChart years={years} series={[
          { name: "Generated", color: "#201c17", values: data.map((d) => d.generated) },
          { name: "Recovered", color: "#3f6b52", values: data.map((d) => d.recovered) },
          { name: "Disposed", color: "#c0563f", values: data.map((d) => d.residual) },
        ]} />
      </section>


      <section className="mt-8 rounded-xl border border-black/10 bg-white/50 p-5">
        <h2 className="font-medium">How fast recycling must start</h2>
        <p className="mt-1 text-sm text-[#6f6858]">
          Set a target and a deadline. The page works out the yearly recycling percentage required, and the last year you can
          start and still make it at the maximum pace you think is realistic.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <label className="text-sm">Target recycled share: <b>{target}%</b>
            <input type="range" min={30} max={90} value={target} onChange={(e) => setTarget(+e.target.value)} className="mt-2 w-full" />
          </label>
          <label className="text-sm">By year: <b>{targetYear}</b>
            <input type="range" min={2035} max={END_YEAR} value={targetYear} onChange={(e) => setTargetYear(+e.target.value)} className="mt-2 w-full" />
          </label>
          <label className="text-sm">Max realistic gain: <b>{maxGain.toFixed(1)}</b> pts/year (assumption)
            <input type="range" min={0.5} max={5} step={0.5} value={maxGain} onChange={(e) => setMaxGain(+e.target.value)} className="mt-2 w-full" />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white/60 p-3"><div className="text-xs text-[#6f6858]">Required gain from {NOW_YEAR}</div><div className="text-lg font-semibold">+{sched.gainNeeded.toFixed(2)} pts / year</div></div>
          <div className="rounded-lg bg-white/60 p-3"><div className="text-xs text-[#6f6858]">Latest possible start</div><div className="text-lg font-semibold">{sched.feasible ? sched.latestStart : "Already too late"}</div></div>
          <div className="rounded-lg bg-white/60 p-3"><div className="text-xs text-[#6f6858]">Best reachable by {targetYear}</div><div className="text-lg font-semibold">{pct(sched.reachable)}</div></div>
        </div>
        {!sched.feasible && (
          <p className="mt-2 text-sm text-[#c0563f]">At {maxGain.toFixed(1)} points a year, {target}% by {targetYear} is out of reach even starting today. Lower the target, move the deadline, or raise the pace.</p>
        )}
        <table className="mt-4 w-full text-sm">
          <thead><tr className="text-left text-xs text-[#6f6858]"><th className="font-normal">Year</th><th className="text-right font-normal">Share recycled</th><th className="text-right font-normal">Waste (Mt)</th><th className="text-right font-normal">Must be recycled (Mt)</th></tr></thead>
          <tbody>
            {sched.rows.filter((r) => r.year % 3 === 2 || r.year === NOW_YEAR || r.year === END_YEAR).map((r) => (
              <tr key={r.year} className="border-t border-black/5"><td className="py-1">{r.year}</td><td className="text-right">{pct(r.rate)}</td><td className="text-right">{fmt(r.generated)}</td><td className="text-right">{fmt(r.recycled)}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 rounded-xl border border-black/10 bg-white/50 p-5">
        <h2 className="font-medium">Swarm view: 1,050 simulated households, 25 runs per region group</h2>
        <p className="mt-1 text-sm text-[#6f6858]">
          Instead of one smooth line, each region has 150 agents who copy their neighbours and respond to policy. Green is the median
          global recycling share and the shaded band is the 10th to 90th percentile across runs. Dashed gold is the path required for your target.
          The band is narrow because many agents average out; it does not capture policy or economic shocks.
        </p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <label className="text-sm">Echo chambers: <b>{echo.toFixed(1)}</b> (0 = everyone hears everyone)
            <input type="range" min={0} max={1} step={0.1} value={echo} onChange={(e) => setEcho(+e.target.value)} className="mt-2 w-full" />
          </label>
          <label className="text-sm">Herd effect: <b>{herd.toFixed(1)}</b> (neighbours amplify policy)
            <input type="range" min={0} max={2} step={0.1} value={herd} onChange={(e) => setHerd(+e.target.value)} className="mt-2 w-full" />
          </label>
        </div>
        <BandChart bands={bands} schedule={sched.rows} />
        <p className="text-sm text-[#6f6858]">
          2050 median {pct(bands[bands.length - 1].p50)} (range {pct(bands[bands.length - 1].p10)} to {pct(bands[bands.length - 1].p90)}), versus {pct(sched.rows[sched.rows.length - 1].rate)} required.

        </p>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-black/10 bg-white/50 p-5">
          <h2 className="font-medium">What kind of waste, {year}</h2>
          <ul className="mt-3 space-y-2">
            {cur.byMaterial.map((m) => {
              const meta = MATERIALS.find((x) => x.id === m.id)!;
              return (
                <li key={m.id} className="text-sm">
                  <div className="flex justify-between"><span>{meta.name}</span><span className="text-[#6f6858]">{fmt(m.generated)} Mt · {pct(m.recovered / m.generated)} recovered</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/[0.06]">
                    <div className="h-full" style={{ width: `${(m.generated / cur.generated / 0.44) * 100}%`, background: meta.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="rounded-xl border border-black/10 bg-white/50 p-5">
          <h2 className="font-medium">By region, {year}</h2>
          <table className="mt-3 w-full text-sm">
            <thead><tr className="text-left text-xs text-[#6f6858]"><th className="font-normal">Region</th><th className="text-right font-normal">Mt</th><th className="text-right font-normal">Recovered</th></tr></thead>
            <tbody>
              {cur.byRegion.map((r) => (
                <tr key={r.id} className="border-t border-black/5">
                  <td className="py-1.5">{REGIONS.find((x) => x.id === r.id)!.name}</td>
                  <td className="text-right">{fmt(r.generated)}</td>
                  <td className="text-right">{pct(r.recovery)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>


      <section className="mt-8 rounded-xl border border-black/10 bg-white/50 p-5">
        <h2 className="font-medium">What this means for land, climate and water ({year})</h2>
        <p className="mt-1 text-sm text-[#6f6858]">Model outputs for the year you picked. The published figures behind each topic are listed with sources below.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white/60 p-4 text-sm"><h3 className="font-medium">Land</h3><p className="mt-1 text-[#6f6858]"><b className="text-[#201c17]">{fmt(cur.residual)} Mt</b> disposed this year; <b className="text-[#201c17]">{(cumulativeResidual / 1000).toFixed(1)} Bt</b> since {START_YEAR}.</p></div>
          <div className="rounded-lg bg-white/60 p-4 text-sm"><h3 className="font-medium">Climate</h3><p className="mt-1 text-[#6f6858]"><b className="text-[#201c17]">{fmt(foodDisposed)} Mt</b> of food and green waste not recovered. Organic waste in landfills is the main methane source.</p></div>
          <div className="rounded-lg bg-white/60 p-4 text-sm"><h3 className="font-medium">Water</h3><p className="mt-1 text-[#6f6858]"><b className="text-[#201c17]">{fmt(plasticDisposed)} Mt</b> of plastic not recovered. Only part reaches waterways, depending on collection quality.</p></div>
        </div>
        <div className="mt-4 rounded-lg bg-white/60 p-4 text-sm">
          <h3 className="font-medium">Wildlife: which species are most at risk?</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[#6f6858]">{SPECIES_CAVEATS.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-black/10 bg-white/50 p-5" id="sources">
        <h2 className="font-medium">Data, sources and verification</h2>
        <p className="mt-1 text-sm text-[#6f6858]">
          Every external figure is listed with its year, sources and a status. Checked {CHECKED_ON}. I could not open the publishers&apos; own documents from where this was built, so
          &quot;confirmed&quot; means several independent reports give the same number, not that the original table was read. Where sources disagree or I only found one, it says so.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {(Object.keys(counts) as Status[]).filter((k) => k !== "estimate" || counts[k] > 0).map((k) => (
            <span key={k} className={`rounded-full border px-2.5 py-1 ${STATUS_STYLE[k]}`}>{STATUS_LABEL[k]}: {counts[k]}</span>
          ))}
        </div>
        {categories.map((cat) => (
          <div key={cat} className="mt-6">
            <h3 className="text-sm font-semibold">{cat}</h3>
            <ul className="mt-2 space-y-3">
              {[...REGISTER, ...MODEL_ASSUMPTIONS].filter((e) => e.category === cat).map((e) => <EntryRow key={e.id} e={e} />)}
            </ul>
          </div>
        ))}
      </section>

      <p className="mt-6 text-xs text-[#6f6858]">This is a simple scenario model, not a forecast.</p>
    </main>
  );
}
