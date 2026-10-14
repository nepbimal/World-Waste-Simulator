"use client";

import { useMemo, useState } from "react";
import { MODEL_ASSUMPTIONS, REGISTER, STATUS_LABEL, statusCounts, type Entry, type Status } from "@/lib/data-register";
import { GlowCard } from "../ui/GlowCard";
import { Reveal } from "../ui/Reveal";
import { SectionHead } from "../ui/SectionHead";

const STATUS_STYLE: Record<Status, { chip: string; dot: string }> = {
  confirmed: { chip: "border-leaf/40 bg-leaf/10 text-leaf", dot: "bg-leaf" },
  single: { chip: "border-gold/40 bg-gold/10 text-gold", dot: "bg-gold" },
  conflicting: { chip: "border-ember/45 bg-ember/10 text-ember", dot: "bg-ember" },
  derived: { chip: "border-sky/40 bg-sky/10 text-sky", dot: "bg-sky" },
  estimate: { chip: "border-white/20 bg-white/5 text-mute", dot: "bg-ash" },
};

export function Register() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const counts = useMemo(() => statusCounts(), []);
  const all = useMemo(() => [...REGISTER, ...MODEL_ASSUMPTIONS], []);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter((e) => (status === "all" || e.status === status) && (!s || `${e.metric} ${e.value} ${e.category}`.toLowerCase().includes(s)));
  }, [all, q, status]);

  return (
    <section id="sources" className="pt-28">
      <Reveal>
        <SectionHead eyebrow="Sources" title={<>Every number, <span className="italic text-mute">with its receipts.</span></>}>
          Each figure lists its year, its sources and how well it is backed. Where sources disagree or only one was found, it says so.
        </SectionHead>
      </Reveal>

      <Reveal className="mt-10">
        <div className="sticky top-16 z-30 rounded-2xl border border-line bg-[#080b0e]/80 p-3 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              aria-label="Search the register"
              placeholder="Search a number, topic or category"
              className="min-w-[220px] flex-1 rounded-xl border border-line bg-white/[0.04] px-4 py-2.5 text-sm outline-none transition placeholder:text-dim focus:border-leaf/50 focus:bg-white/[0.07]"
            />
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button onClick={() => setStatus("all")} aria-pressed={status === "all"} className={`rounded-full border px-3 py-1.5 transition ${status === "all" ? "border-white bg-white text-[#06080b]" : "border-line text-mute hover:text-ink"}`}>
                All {all.length}
              </button>
              {(Object.keys(counts) as Status[]).filter((k) => counts[k] > 0 || MODEL_ASSUMPTIONS.some((e) => e.status === k)).map((k) => (
                <button key={k} onClick={() => setStatus(status === k ? "all" : k)} aria-pressed={status === k} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition ${status === k ? `${STATUS_STYLE[k].chip} ring-1 ring-white/40` : "border-line text-mute hover:text-ink"}`}>
                  <i className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[k].dot}`} />
                  {STATUS_LABEL[k]} · {all.filter((e) => e.status === k).length}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-5 grid gap-4 md:grid-cols-2" aria-live="polite">
        {shown.map((e) => <EntryCard key={e.id} e={e} />)}
        {shown.length === 0 && <p className="col-span-full rounded-2xl border border-line p-8 text-center text-sm text-mute">No figures match. Clear the search or the filter.</p>}
      </div>
    </section>
  );
}

function EntryCard({ e }: { e: Entry }) {
  const st = STATUS_STYLE[e.status];
  return (
    <GlowCard className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dim">{e.category}</span>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${st.chip}`}>{STATUS_LABEL[e.status]}</span>
      </div>
      <h4 className="mt-2 font-semibold leading-snug">{e.metric}</h4>
      <p className="mt-2 font-mono text-sm text-ink">{e.value} <span className="text-dim">({e.year})</span></p>
      {e.note && (
        <details className="group mt-2 text-xs text-mute">
          <summary className="cursor-pointer list-none text-violet marker:hidden hover:underline">
            <span className="group-open:hidden">Show the caveat</span><span className="hidden group-open:inline">Hide the caveat</span>
          </summary>
          <p className="mt-2 leading-relaxed">{e.note}</p>
        </details>
      )}
      {e.sources.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-xs">
          {e.sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-mute transition hover:text-leaf">
              ↗ {s.label}{s.publisher && <span className="text-dim"> (publisher)</span>}
            </a>
          ))}
        </div>
      )}
    </GlowCard>
  );
}
