import { describe, expect, it } from "vitest";
import {
  END_YEAR,
  GLOBAL_2022,
  GLOBAL_2050_BAU,
  GLOBAL_RECOVERY_2022,
  MATERIALS,
  REGIONS,
  START_YEAR,
  simulate,
} from "../waste-model";
import { NOW_YEAR, requiredSchedule, runSwarm } from "../swarm-model";
import { operationalCostBn } from "../costs";
import { MODEL_ASSUMPTIONS, REGISTER } from "../data-register";

const BAU = { growthCut: 0, recoveryTarget: 27 };
const HIGH = { growthCut: 100, recoveryTarget: 54 };
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe("waste model: anchors", () => {
  it("regions add up to the published 2022 total", () => {
    expect(sum(REGIONS.map((r) => r.gen2022))).toBe(GLOBAL_2022);
  });

  it("regions add up to the 2050 business-as-usual total within rounding", () => {
    expect(Math.abs(sum(REGIONS.map((r) => r.gen2050)) - GLOBAL_2050_BAU)).toBeLessThanOrEqual(2);
  });

  it("business as usual starts at the 2022 total and 21.4% recovery", () => {
    const d = simulate(BAU);
    expect(d[0].year).toBe(START_YEAR);
    expect(d[0].generated).toBeCloseTo(GLOBAL_2022, 0);
    expect(d[0].recoveryRate).toBeCloseTo(GLOBAL_RECOVERY_2022, 2);
  });

  it("business as usual ends near the 2050 total", () => {
    const last = simulate(BAU).at(-1)!;
    expect(last.year).toBe(END_YEAR);
    expect(Math.abs(last.generated - GLOBAL_2050_BAU)).toBeLessThanOrEqual(2);
  });

  it("full prevention holds 2050 waste at the 2022 level", () => {
    expect(simulate(HIGH).at(-1)!.generated).toBeCloseTo(GLOBAL_2022, 0);
  });

  it("more prevention never means more waste, and more recovery never means less recovered", () => {
    const lowCut = simulate({ growthCut: 20, recoveryTarget: 27 }).at(-1)!;
    const highCut = simulate({ growthCut: 60, recoveryTarget: 27 }).at(-1)!;
    expect(highCut.generated).toBeLessThan(lowCut.generated);
    const lowRec = simulate({ growthCut: 0, recoveryTarget: 30 }).at(-1)!;
    const highRec = simulate({ growthCut: 0, recoveryTarget: 60 }).at(-1)!;
    expect(highRec.recoveryRate).toBeGreaterThan(lowRec.recoveryRate);
  });
});

describe("waste model: invariants in every year and scenario", () => {
  for (const [name, inp] of [["BAU", BAU], ["High", HIGH], ["Custom", { growthCut: 35, recoveryTarget: 41 }]] as const) {
    it(`${name}: regions sum to the global figures`, () => {
      for (const y of simulate(inp)) {
        expect(sum(y.byRegion.map((r) => r.generated))).toBeCloseTo(y.generated, 6);
        expect(sum(y.byRegion.map((r) => r.recovered))).toBeCloseTo(y.recovered, 6);
      }
    });

    it(`${name}: materials sum to the global figures`, () => {
      for (const y of simulate(inp)) {
        expect(sum(y.byMaterial.map((m) => m.generated))).toBeCloseTo(y.generated, 6);
        expect(sum(y.byMaterial.map((m) => m.recovered))).toBeCloseTo(y.recovered, 4);
      }
    });

    it(`${name}: recovered plus disposed equals generated, and recovery rate stays within 0 to 1`, () => {
      for (const y of simulate(inp)) {
        expect(y.recovered + y.residual).toBeCloseTo(y.generated, 6);
        expect(y.recoveryRate).toBeGreaterThanOrEqual(0);
        expect(y.recoveryRate).toBeLessThanOrEqual(1);
      }
    });

    it(`${name}: no treatment stream is negative`, () => {
      for (const y of simulate(inp)) {
        for (const v of [y.recovered, y.incinerated, y.controlledLandfill, y.dumpsite, y.uncollected]) {
          expect(v).toBeGreaterThanOrEqual(0);
        }
      }
    });
  }

  it("published composition shares sum to 100% within their rounding", () => {
    expect(Math.abs(sum(MATERIALS.map((m) => m.share)) - 1)).toBeLessThan(0.002);
  });
});

describe("swarm model", () => {
  const gen = simulate(BAU);
  const inp = { recoveryTarget: 27, echo: 0.3, herd: 0.5, agents: 60, runs: 8, seed: 42 };

  it("is reproducible for a fixed seed and differs for another", () => {
    expect(runSwarm(inp, gen)).toEqual(runSwarm(inp, gen));
    expect(runSwarm({ ...inp, seed: 43 }, gen)).not.toEqual(runSwarm(inp, gen));
  });

  it("keeps percentile bands ordered and starts near today's recovery rate", () => {
    const bands = runSwarm(inp, gen);
    for (const b of bands) {
      expect(b.p10).toBeLessThanOrEqual(b.p50);
      expect(b.p50).toBeLessThanOrEqual(b.p90);
    }
    expect(Math.abs(bands[0].p50 - GLOBAL_RECOVERY_2022)).toBeLessThan(0.02);
  });
});

describe("required recycling schedule", () => {
  const gen = simulate(BAU);

  it("ends exactly at the target and never falls below today's rate", () => {
    const s = requiredSchedule(gen, 0.5, 2040, 2.5);
    expect(s.rows.at(-1)!.rate).toBeCloseTo(0.5, 6);
    expect(s.rows[0].year).toBe(NOW_YEAR);
    for (const r of s.rows) expect(r.rate).toBeGreaterThanOrEqual(s.rows[0].rate - 1e-9);
  });

  it("matches the required yearly gain formula", () => {
    const s = requiredSchedule(gen, 0.5, 2040, 2.5);
    const rNow = s.rows[0].rate;
    expect(s.gainNeeded).toBeCloseTo(((0.5 - rNow) / (2040 - NOW_YEAR)) * 100, 6);
  });

  it("flags a target that cannot be reached at the maximum pace", () => {
    expect(requiredSchedule(gen, 0.85, 2030, 1).feasible).toBe(false);
    expect(requiredSchedule(gen, 0.3, 2050, 5).feasible).toBe(true);
  });
});

describe("operating cost", () => {
  it("equals the published endpoints on the business-as-usual path", () => {
    expect(operationalCostBn(2022, 100, 100)).toBeCloseTo(250, 6);
    expect(operationalCostBn(2050, 100, 100)).toBeCloseTo(426, 6);
  });
  it("scales with the waste handled", () => {
    expect(operationalCostBn(2040, 80, 100)).toBeCloseTo(0.8 * operationalCostBn(2040, 100, 100), 6);
  });
});

describe("data register rules", () => {
  const all = [...REGISTER, ...MODEL_ASSUMPTIONS];

  it("has unique ids and a value and year for every entry", () => {
    expect(new Set(all.map((e) => e.id)).size).toBe(all.length);
    for (const e of all) {
      expect(e.value.length, e.id).toBeGreaterThan(0);
      expect(e.year.length, e.id).toBeGreaterThan(0);
    }
  });

  it("gives every sourced status at least one source with an https link", () => {
    for (const e of all.filter((x) => x.status !== "estimate")) {
      expect(e.sources.length, `${e.id} has no source`).toBeGreaterThan(0);
      for (const s of e.sources) expect(s.url, e.id).toMatch(/^https:\/\//);
    }
  });

  it('only marks an entry "confirmed" when it lists two or more sources', () => {
    for (const e of all.filter((x) => x.status === "confirmed")) {
      expect(e.sources.length, `${e.id} is "confirmed" with ${e.sources.length} source(s)`).toBeGreaterThanOrEqual(2);
    }
  });
});
