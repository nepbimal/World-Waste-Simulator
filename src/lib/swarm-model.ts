// Agent-based ("swarm") recycling model. Re-implements the mathematical ideas behind MiroFish/OASIS-style
// agent simulations: stochastic activation of agents, similarity-weighted influence between neighbours, and an
// ensemble of seeded runs read as a distribution. No MiroFish code is used. See docs in data-register.ts for which
// parameters come from data (thresholds.ts) and which are free assumptions.
//
// How it fits with the deterministic model: each region's agents start around that region's recycling rate and receive
// the scenario's yearly policy push (the change in the deterministic regional rate). With no social effects the swarm
// therefore follows the deterministic path. On top of that, neighbours influence each other (learning, echo chambers),
// and neighbours above a social tipping point amplify the push (herd effect). Each run also draws how well policy
// is delivered (a multiplier whose spread comes from observed EU paces), so the percentile band shows real uncertainty.

import { END_YEAR, REGIONS, START_YEAR, simulate, type YearPoint } from "./waste-model";
import { HETEROGENEITY, MAX_OBSERVED_RATE, POLICY_SIGMA, TIPPING_THRESHOLD } from "./thresholds";

export const CAP = MAX_OBSERVED_RATE; // no region's average can exceed the best national rate observed
export const NOW_YEAR = 2026;

export type SwarmInputs = {
  recoveryTarget: number; // scenario recovery target in 2050, percent (only used to label the run)
  echo: number; // 0 well-mixed .. 1 strong echo chambers
  herd: number; // how strongly neighbours above the tipping point amplify the policy push
  agents: number; // agents per region
  runs: number; // Monte Carlo replications
  seed: number;
  uncertainty?: boolean; // draw policy delivery per run (default true); false isolates the agent dynamics
  tuning?: Partial<Tuning>; // free parameters, overridable for sensitivity tests
};

export type Tuning = { neighbours: number; learningRate: number; tippingWidth: number };

export type Band = {
  year: number;
  p10: number;
  p50: number;
  p90: number; // global recovery rate, 0..1
  spread: number; // median across runs of the standard deviation between agents, in rate points (0..1)
};

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

// Free modelling parameters. No data was found to fit them; the register lists them as assumptions and the tests check
// that conclusions do not hinge on them.
export const DEFAULT_TUNING: Tuning = {
  neighbours: 5, // agents each agent looks at per year
  learningRate: 0.2, // how far an active agent moves toward what its neighbours do
  tippingWidth: 0.05, // how sharply amplification switches on around the tipping point
};

// Inverse of the standard normal distribution (Acklam's rational approximation, accurate to about 1e-9).
export function probit(p: number): number {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) {
    const x = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * x + c[1]) * x + c[2]) * x + c[3]) * x + c[4]) * x + c[5]) / ((((d[0] * x + d[1]) * x + d[2]) * x + d[3]) * x + 1);
  }
  if (p > 1 - lo) return -probit(1 - p);
  const x = p - 0.5, r = x * x;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * x) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

const q = (arr: number[], f: number) => {
  const s = [...arr].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(f * (s.length - 1) + 0.5))];
};

export function runSwarm(inp: SwarmInputs, gen: YearPoint[]): Band[] {
  const years = END_YEAR - START_YEAR;
  const uncertain = inp.uncertainty ?? true;
  const { neighbours, learningRate, tippingWidth } = { ...DEFAULT_TUNING, ...inp.tuning };
  const rates: number[][] = Array.from({ length: years + 1 }, () => []);
  const spreads: number[][] = Array.from({ length: years + 1 }, () => []);

  for (let run = 0; run < inp.runs; run++) {
    const rnd = mulberry32(inp.seed + run * 7919);
    // How well policy is delivered in this run: median 1, spread from observed EU paces. The runs take evenly spaced
    // quantiles of that distribution (stratified sampling) instead of random draws, so the median and the 10th and
    // 90th percentiles are stable even with few runs. Agent behaviour inside each run is still random.
    const delivery = uncertain ? Math.exp(POLICY_SIGMA * probit((run + 0.5) / inp.runs)) : 1;

    const regs = REGIONS.map((_, ri) => {
      const r0 = gen[0].byRegion[ri].recovery;
      const p = new Float64Array(inp.agents);
      const a = new Float64Array(inp.agents);
      const w = new Float64Array(inp.agents);
      for (let i = 0; i < inp.agents; i++) {
        p[i] = clamp(r0 * (1 + HETEROGENEITY * (rnd() + rnd() - 1)));
        a[i] = 0.3 + 0.7 * rnd();
        w[i] = 1 + 4 * rnd() ** 3; // heavy-tailed influence
      }
      // Re-centre so the region starts exactly at its published rate
      for (let k = 0; k < 4; k++) {
        let mean = 0;
        for (let i = 0; i < inp.agents; i++) mean += p[i];
        const shift = r0 - mean / inp.agents;
        for (let i = 0; i < inp.agents; i++) p[i] = clamp(p[i] + shift);
      }
      return { p, a, w, mb: new Float64Array(inp.agents), active: new Uint8Array(inp.agents) };
    });

    for (let t = 0; t <= years; t++) {
      let rec = 0, tot = 0, varSum = 0;
      regs.forEach((reg, ri) => {
        const { p, a, w, mb, active } = reg;
        const n = p.length;
        if (t > 0) {
          const delta = gen[t].byRegion[ri].recovery - gen[t - 1].byRegion[ri].recovery; // this year's policy push
          // Every agent looks at a few neighbours, weighting similar and influential ones more
          for (let i = 0; i < n; i++) {
            let num = 0, den = 0;
            for (let d = 0; d < neighbours; d++) {
              const j = Math.floor(rnd() * n);
              const g = w[j] * Math.exp(-inp.echo * 5 * Math.abs(p[j] - p[i]));
              num += g * p[j]; den += g;
            }
            mb[i] = num / den;
          }
          // Only some agents act each year (random activation)
          active.fill(0);
          const cand: number[] = [];
          for (let i = 0; i < n; i++) if (rnd() < a[i]) cand.push(i);
          const k = Math.min(cand.length, Math.floor((0.3 + 0.4 * rnd()) * n));
          for (let s = 0; s < k; s++) {
            const j = s + Math.floor(rnd() * (cand.length - s));
            [cand[s], cand[j]] = [cand[j], cand[s]];
            active[cand[s]] = 1;
          }
          for (let i = 0; i < n; i++) {
            let step = delivery * delta; // everyone gets the policy push
            if (active[i]) {
              step += learningRate * (mb[i] - p[i]); // learn from neighbours
              step += inp.herd * delivery * delta * sigmoid((mb[i] - TIPPING_THRESHOLD) / tippingWidth); // social amplification
            }
            p[i] = clamp(p[i] + step);
          }
          // The region's average cannot pass the best national rate ever observed
          let mean = 0;
          for (let i = 0; i < n; i++) mean += p[i];
          mean /= n;
          if (mean > CAP) for (let i = 0; i < n; i++) p[i] = clamp(p[i] + (CAP - mean));
        }
        let mean = 0;
        for (let i = 0; i < n; i++) mean += p[i];
        mean /= n;
        let v = 0;
        for (let i = 0; i < n; i++) v += (p[i] - mean) ** 2;
        const g = gen[t].byRegion[ri].generated;
        rec += g * mean; tot += g; varSum += g * (v / n);
      });
      rates[t].push(rec / tot);
      spreads[t].push(Math.sqrt(varSum / tot));
    }
  }
  return rates.map((arr, t) => ({ year: START_YEAR + t, p10: q(arr, 0.1), p50: q(arr, 0.5), p90: q(arr, 0.9), spread: q(spreads[t], 0.5) }));
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
  const bau = simulate({ growthCut: 0, recoveryTarget: 27 })[NOW_YEAR - START_YEAR];
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
