import { describe, expect, it } from "vitest";
import { SCENARIOS, simulate } from "../waste-model";
import { CAP, DEFAULT_TUNING, probit, runSwarm } from "../swarm-model";
import { EU_MEAN_RATE_2023, HETEROGENEITY, MAX_OBSERVED_RATE, MIN_OBSERVED_RATE, POLICY_SIGMA, TIPPING_THRESHOLD } from "../thresholds";
import { MODEL_ASSUMPTIONS, REGISTER } from "../data-register";

const AGENTS = 100;
const RUNS = 21;
const gen = (sc: (typeof SCENARIOS)[number]) => simulate({ growthCut: sc.growthCut, recoveryTarget: sc.recoveryTarget });
const base = { echo: 0.3, herd: 0, agents: AGENTS, runs: RUNS, seed: 42 };
const last = <T,>(a: T[]) => a[a.length - 1];

describe("swarm: consistent with the deterministic model", () => {
  for (const sc of SCENARIOS) {
    it(`${sc.name}: with no social amplification and no delivery uncertainty it follows the deterministic path`, () => {
      const g = gen(sc);
      const b = runSwarm({ ...base, recoveryTarget: sc.recoveryTarget, uncertainty: false }, g);
      expect(Math.abs(b[0].p50 - g[0].recoveryRate)).toBeLessThan(0.0005);
      for (const i of [7, 14, 21, 28]) expect(Math.abs(b[i].p50 - g[i].recoveryRate), `${sc.name} ${b[i].year}`).toBeLessThan(0.006);
    });

    it(`${sc.name}: with delivery uncertainty the median stays within 1 point and the band is wide`, () => {
      const g = gen(sc);
      const b = runSwarm({ ...base, recoveryTarget: sc.recoveryTarget }, g);
      expect(Math.abs(last(b).p50 - last(g).recoveryRate)).toBeLessThan(0.01);
      expect(last(b).p90 - last(b).p10).toBeGreaterThan(0.04);
    });
  }
});

describe("swarm: the controls do something", () => {
  const sc = SCENARIOS[1];
  const g = gen(sc);
  const run = (over: object) => last(runSwarm({ ...base, recoveryTarget: sc.recoveryTarget, ...over }, g));

  it("a stronger herd effect raises the 2050 median", () => {
    expect(run({ herd: 1 }).p50).toBeGreaterThan(run({ herd: 0 }).p50 + 0.01);
    expect(run({ herd: 2 }).p50).toBeGreaterThan(run({ herd: 1 }).p50 + 0.01);
  });

  it("echo chambers widen the gap between households but not the average", () => {
    const a = run({ echo: 0, uncertainty: false });
    const b = run({ echo: 1, uncertainty: false });
    expect(b.spread).toBeGreaterThan(a.spread * 1.05);
    expect(Math.abs(b.p50 - a.p50)).toBeLessThan(0.005);
  });

  it("more delivery uncertainty is reflected: the band is wider with it than without", () => {
    const on = run({});
    const off = run({ uncertainty: false });
    expect(on.p90 - on.p10).toBeGreaterThan(off.p90 - off.p10 + 0.03);
  });
});

describe("swarm: reliability", () => {
  const sc = SCENARIOS[0];
  const g = gen(sc);
  const p50 = (over: object) => last(runSwarm({ ...base, herd: 0.5, recoveryTarget: sc.recoveryTarget, ...over }, g)).p50;

  it("is reproducible for a fixed seed and differs slightly for another", () => {
    expect(runSwarm({ ...base, recoveryTarget: 27 }, g)).toEqual(runSwarm({ ...base, recoveryTarget: 27 }, g));
    expect(runSwarm({ ...base, recoveryTarget: 27, seed: 43 }, g)).not.toEqual(runSwarm({ ...base, recoveryTarget: 27 }, g));
  });

  it("gives nearly the same median for different seeds, thanks to stratified policy draws", () => {
    const vals = [1, 2, 3, 4].map((s) => p50({ seed: s * 1000 }));
    expect(Math.max(...vals) - Math.min(...vals)).toBeLessThan(0.008);
  });

  it("does not depend on how many agents are simulated", () => {
    expect(Math.abs(p50({ agents: 60 }) - p50({ agents: 300 }))).toBeLessThan(0.012);
  });

  it("keeps percentile bands ordered, within 0 to the observed maximum, and never above the cap", () => {
    const hi = SCENARIOS[2];
    for (const b of runSwarm({ ...base, herd: 2, recoveryTarget: hi.recoveryTarget }, gen(hi))) {
      expect(b.p10).toBeLessThanOrEqual(b.p50);
      expect(b.p50).toBeLessThanOrEqual(b.p90);
      expect(b.p10).toBeGreaterThanOrEqual(0);
      expect(b.p90).toBeLessThanOrEqual(CAP + 1e-9);
    }
  });
});

describe("swarm: free parameters do not drive the conclusion", () => {
  const sc = SCENARIOS[1];
  const g = gen(sc);
  const p50 = (tuning: object) => last(runSwarm({ ...base, recoveryTarget: sc.recoveryTarget, uncertainty: false, tuning }, g)).p50;
  it("learning rate and neighbour count leave the average within half a point", () => {
    const ref = p50({});
    for (const t of [{ learningRate: 0.05 }, { learningRate: 0.5 }, { neighbours: 2 }, { neighbours: 12 }]) {
      expect(Math.abs(p50(t) - ref), JSON.stringify(t)).toBeLessThan(0.006);
    }
    expect(DEFAULT_TUNING.learningRate).toBe(0.2);
  });
});

describe("thresholds come from the data they are registered with", () => {
  it("match the observed values", () => {
    expect(MAX_OBSERVED_RATE).toBe(0.69);
    expect(MIN_OBSERVED_RATE).toBe(0.12);
    expect(EU_MEAN_RATE_2023).toBe(0.48);
    expect(TIPPING_THRESHOLD).toBe(0.25);
    expect(HETEROGENEITY).toBeCloseTo(0.59375, 4);
    expect(POLICY_SIGMA).toBeCloseTo(Math.log(2.6) / (2 * 1.2816), 4);
  });

  it("the highest observed rate caps every region in the deterministic model too", () => {
    for (const y of simulate({ growthCut: 0, recoveryTarget: 69 })) for (const r of y.byRegion) expect(r.recovery).toBeLessThanOrEqual(0.69 + 1e-9);
    expect(last(simulate({ growthCut: 0, recoveryTarget: 80 })).recoveryRate).toBeCloseTo(0.69, 3);
  });

  it("each is in the register", () => {
    const ids = new Set([...REGISTER, ...MODEL_ASSUMPTIONS].map((e) => e.id));
    for (const id of ["cap_observed", "tipping_25", "heterogeneity", "policy_sigma", "swarm_free", "gmax"]) expect(ids.has(id), id).toBe(true);
  });
});

describe("probit", () => {
  it("is the inverse of the normal distribution", () => {
    expect(probit(0.5)).toBeCloseTo(0, 9);
    expect(probit(0.8413447)).toBeCloseTo(1, 4);
    expect(probit(0.9)).toBeCloseTo(1.2816, 3);
    expect(probit(0.1)).toBeCloseTo(-1.2816, 3);
    expect(probit(0.001)).toBeCloseTo(-3.0902, 3);
  });
});
