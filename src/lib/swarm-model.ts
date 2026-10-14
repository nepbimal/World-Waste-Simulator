// Agent-based ("swarm") recycling model. Re-implements the mathematical ideas behind MiroFish/OASIS-style
// agent simulations: stochastic activation, similarity-weighted neighbour influence, and an ensemble of
// seeded runs. No MiroFish code is used.

import { END_YEAR, REGIONS, START_YEAR, simulate, type YearPoint } from "./waste-model";

export const CAP = 0.95;
export const NOW_YEAR = 2026;

export type SwarmInputs = {
  recoveryTarget: number; // extra recovery points by 2050 (same lever as the deterministic model)
  echo: number; // 0 well-mixed .. 1 strong echo chambers
  herd: number; // kappa: how much neighbour adoption amplifies the policy push
  agents: number; // agents per region
  runs: number; // Monte Carlo replications
  seed: number;
};

export type Band = { year: number; p10: number; p50: number; p90: number }; // global recovery rate 0..1

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const NEIGHBOURS = 5;
const ETA = 0.2;

export function runSwarm(inp: SwarmInputs, gen: YearPoint[]): Band[] {
  const years = END_YEAR - START_YEAR;
  const perYear: number[][] = Array.from({ length: years + 1 }, () => []);
  for (let run = 0; run < inp.runs; run++) {
    const rnd = mulberry32(inp.seed + run * 7919);
    const noise = () => (rnd() + rnd() + rnd() - 1.5) * 0.02; // ~N(0, 0.01^2)
    const regs = REGIONS.map((r) => {
      const m0 = r.recovery2016 / CAP;
      const p = new Float64Array(inp.agents);
      const a = new Float64Array(inp.agents);
      const w = new Float64Array(inp.agents);
      for (let i = 0; i < inp.agents; i++) {
        p[i] = clamp(m0 + 0.2 * (rnd() + rnd() - 1));
        a[i] = 0.3 + 0.7 * rnd();
        w[i] = 1 + 4 * rnd() ** 3; // heavy-tailed influence
      }
      const push = (inp.recoveryTarget / 100 / years / CAP) * (0.4 + 1 - r.recovery2016);
      return { p, a, w, push };
    });
    for (let t = 0; t <= years; t++) {
      let rec = 0, tot = 0;
      regs.forEach((reg, ri) => {
        const { p, a, w, push } = reg;
        const n = p.length;
        if (t > 0) {
          const cand: number[] = [];
          for (let i = 0; i < n; i++) if (rnd() < a[i]) cand.push(i);
          const k = Math.min(cand.length, Math.floor((0.3 + 0.4 * rnd()) * n));
          for (let s = 0; s < k; s++) { // partial Fisher-Yates: first k are the sample
            const j = s + Math.floor(rnd() * (cand.length - s));
            [cand[s], cand[j]] = [cand[j], cand[s]];
            const i = cand[s];
            let num = 0, den = 0;
            for (let d = 0; d < NEIGHBOURS; d++) {
              const j2 = Math.floor(rnd() * n);
              const g = w[j2] * Math.exp(-inp.echo * 5 * Math.abs(p[j2] - p[i]));
              num += g * p[j2]; den += g;
            }
            const m = num / den;
            p[i] = clamp(p[i] + ETA * (m - p[i]) + inp.herd * push * m + noise());
          }
          for (let i = 0; i < n; i++) p[i] = clamp(p[i] + push);
        }
        let mean = 0;
        for (let i = 0; i < n; i++) mean += p[i];
        const rate = (CAP * mean) / n;
        const g = gen[t].byRegion[ri].generated;
        rec += g * rate; tot += g;
      });
      perYear[t].push(rec / tot);
    }
  }
  const q = (arr: number[], f: number) => {
    const s = [...arr].sort((x, y) => x - y);
    return s[Math.min(s.length - 1, Math.floor(f * (s.length - 1) + 0.5))];
  };
  return perYear.map((arr, t) => ({ year: START_YEAR + t, p10: q(arr, 0.1), p50: q(arr, 0.5), p90: q(arr, 0.9) }));
}

export type Schedule = {
  rows: { year: number; rate: number; generated: number; recycled: number }[];
  gainNeeded: number; // percentage points per year, from NOW_YEAR
  latestStart: number;
  feasible: boolean;
  reachable: number; // best rate reachable by targetYear at maxGain starting now
};

// Required recycling path from today to `target` (0..1) by `targetYear`, using generation from `gen`.
export function requiredSchedule(gen: YearPoint[], target: number, targetYear: number, maxGain: number): Schedule {
  const now = gen[NOW_YEAR - START_YEAR];
  const bau = simulate({ growthCut: 0, recoveryTarget: 2 })[NOW_YEAR - START_YEAR];
  const rNow = bau.recoveryRate;
  const span = targetYear - NOW_YEAR;
  const gain = (target - rNow) / span; // fraction per year
  const gMax = maxGain / 100;
  const latestStart = targetYear - Math.ceil(Math.max(0, target - rNow) / gMax);
  const feasible = latestStart >= NOW_YEAR;
  const rows = [];
  for (let y = NOW_YEAR; y <= END_YEAR; y++) {
    const rate = y >= targetYear ? target : Math.max(rNow, rNow + gain * (y - NOW_YEAR));
    const g = gen[y - START_YEAR].generated;
    rows.push({ year: y, rate, generated: g, recycled: g * rate });
  }
  void now;
  return { rows, gainNeeded: gain * 100, latestStart, feasible, reachable: Math.min(CAP, rNow + gMax * span) };
}
