"use client";

import { useState } from "react";
import { MATERIALS } from "@/lib/waste-model";
import { fmt, fmt1, pct } from "@/lib/format";
import { GlowCard } from "../ui/GlowCard";
import { Reveal } from "../ui/Reveal";
import { SectionHead } from "../ui/SectionHead";
import type { Sim } from "../useSimulation";

export function Materials({ sim }: { sim: Sim }) {
  const { cur, year } = sim;
  const [hot, setHot] = useState<string | null>(null);
  const rows = cur.byMaterial.map((m) => ({ ...m, meta: MATERIALS.find((x) => x.id === m.id)! }));
  const biggest = Math.max(...rows.map((r) => r.generated));
  return (
    <section id="materials" className="pt-28">
      <Reveal>
        <SectionHead eyebrow="Thirteen streams" title={<>What we actually <span className="italic text-mute">throw away.</span></>}>
          The mix of municipal waste in {year}, and how much of each material is recovered. Hover a segment or a row to follow it.
        </SectionHead>
      </Reveal>

      <Reveal className="mt-10">
        <GlowCard className="p-5 sm:p-7">
          <div className="flex h-12 w-full gap-[3px] overflow-hidden rounded-2xl" role="img" aria-label="Composition of municipal waste by material">
            {rows.map((r) => (
              <div
                key={r.id}
                onPointerEnter={() => setHot(r.id)}
                onPointerLeave={() => setHot(null)}
                className="h-full transition-[opacity,flex-grow] duration-500 ease-out"
                style={{ flexGrow: r.generated, flexBasis: 0, background: r.meta.color, opacity: hot && hot !== r.id ? 0.25 : 1 }}
                title={`${r.meta.name}: ${fmt1((r.generated / cur.generated) * 100)}%`}
              />
            ))}
          </div>
          <p className="mt-5 text-xs text-dim">Bright bar and green figure: recovered. Faint bar and white figure: generated.</p>
          <ul className="mt-2 divide-y divide-line">
            {rows.map((r) => {
              const rec = r.recovered / r.generated;
              return (
                <li
                  key={r.id}
                  onPointerEnter={() => setHot(r.id)}
                  onPointerLeave={() => setHot(null)}
                  className={`grid items-center gap-x-4 gap-y-1 py-3 transition-opacity duration-300 sm:grid-cols-[220px_1fr_150px] ${hot && hot !== r.id ? "opacity-35" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <i className="h-3 w-3 shrink-0 rounded" style={{ background: r.meta.color }} />
                    <span className="font-medium">{r.meta.name}</span>
                    <span className="font-mono text-[11px] text-dim">{fmt1((r.generated / cur.generated) * 100)}%</span>
                  </div>
                  <div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-white/8">
                      <div className="absolute inset-y-0 left-0 rounded-full opacity-30 transition-[width] duration-700 ease-out" style={{ width: `${(r.generated / biggest) * 100}%`, background: r.meta.color }} />
                      <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out" style={{ width: `${(r.recovered / biggest) * 100}%`, background: r.meta.color }} />
                    </div>
                    <p className="mt-1.5 text-xs text-dim">{r.meta.desc}</p>
                  </div>
                  <div className="text-right font-mono text-xs sm:text-sm">
                    <div className="text-ink">{fmt(r.generated)} Mt</div>
                    <div className="text-leaf">{fmt(r.recovered)} Mt · {pct(rec)}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </GlowCard>
      </Reveal>
    </section>
  );
}
