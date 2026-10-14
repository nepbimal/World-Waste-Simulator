import { describe, expect, it } from "vitest";
import { simulate } from "../waste-model";
import {
  POP_2022_BN,
  POP_2030_BN,
  POP_2050_BN,
  foodHalvingBenchmark,
  foodKgPerPerson,
  METHANE_SHARE,
  mismanagedPlasticMt,
  municipalEwasteMt,
  populationBn,
  publishedBauMethaneMt,
  publishedHighMethane2050Mt,
  singleUsePlasticMt,
  textiles,
  totalEwasteMt,
} from "../streams";
import { REGISTER, MODEL_ASSUMPTIONS } from "../data-register";

const BAU = simulate({ growthCut: 0, recoveryTarget: 27 });
const HIGH = simulate({ growthCut: 100, recoveryTarget: 54 });

describe("population", () => {
  it("hits the published anchor years and grows in between", () => {
    expect(populationBn(2022)).toBeCloseTo(POP_2022_BN, 9);
    expect(populationBn(2030)).toBeCloseTo(POP_2030_BN, 9);
    expect(populationBn(2050)).toBeCloseTo(POP_2050_BN, 9);
    expect(populationBn(2040)).toBeGreaterThan(POP_2030_BN);
    expect(populationBn(2040)).toBeLessThan(POP_2050_BN);
  });
  it("derives about 7.95 billion people in 2022", () => {
    expect(POP_2022_BN).toBeCloseTo(7.95, 2);
  });
});

describe("food", () => {
  it("is about 123 kg per person in 2022", () => {
    expect(foodKgPerPerson(BAU[0])).toBeGreaterThan(120);
    expect(foodKgPerPerson(BAU[0])).toBeLessThan(127);
  });
  it("halving benchmark is the 2022 level, then half of it from 2030 on", () => {
    expect(foodHalvingBenchmark(100, 2022)).toBe(100);
    expect(foodHalvingBenchmark(100, 2030)).toBe(50);
    expect(foodHalvingBenchmark(100, 2045)).toBe(50);
    expect(foodHalvingBenchmark(100, 2026)).toBeCloseTo(75, 9);
  });
  it("high ambition lowers food waste per person but does not halve it by 2030", () => {
    const i = 2030 - 2022;
    expect(foodKgPerPerson(HIGH[i])).toBeLessThan(foodKgPerPerson(BAU[i]));
    expect(foodKgPerPerson(HIGH[i])).toBeGreaterThan(0.5 * foodKgPerPerson(HIGH[0]));
  });
});

describe("e-waste", () => {
  it("total e-waste is published for 2022 and projected for 2030 only", () => {
    expect(totalEwasteMt(2022)).toBe(62);
    expect(totalEwasteMt(2030)).toBe(82);
    expect(totalEwasteMt(2026)).toBeCloseTo(72, 9);
    expect(totalEwasteMt(2031)).toBeNull();
    expect(totalEwasteMt(2050)).toBeNull();
  });
  it("the municipal-bin share is about 44 Mt in 2022 and smaller than total e-waste", () => {
    expect(municipalEwasteMt(BAU[0])).toBeGreaterThan(42);
    expect(municipalEwasteMt(BAU[0])).toBeLessThan(46);
    expect(municipalEwasteMt(BAU[0])).toBeLessThan(totalEwasteMt(2022)!);
  });
});

describe("plastics", () => {
  it("2022 mismanaged plastic is within 5% of the registered 93 Mt", () => {
    expect(Math.abs(mismanagedPlasticMt(BAU[0]) - 93) / 93).toBeLessThan(0.05);
  });
  it("falls faster when the scenario collects more waste", () => {
    expect(mismanagedPlasticMt(HIGH.at(-1)!)).toBeLessThan(mismanagedPlasticMt(BAU.at(-1)!));
    expect(mismanagedPlasticMt(HIGH.at(-1)!)).toBeCloseTo(0, 6);
  });
  it("single-use plastic is 65% of plastic generated", () => {
    expect(singleUsePlasticMt(BAU[0])).toBeCloseTo(0.65 * 321, -1);
  });
});

describe("textiles", () => {
  it("reports tonnes and a recovered share between 0 and 1", () => {
    const t = textiles(BAU[0]);
    expect(t.generated).toBeGreaterThan(0);
    expect(t.recoveredShare).toBeGreaterThanOrEqual(0);
    expect(t.recoveredShare).toBeLessThanOrEqual(1);
  });
});

describe("methane", () => {
  it("methane share of waste emissions is about 90%", () => {
    expect(METHANE_SHARE).toBeCloseTo(0.9, 1);
  });
  it("model 2022 methane is within 2% of the registered 1.15 Gt", () => {
    expect(Math.abs(BAU[0].co2eMethane - 1150) / 1150).toBeLessThan(0.02);
  });
  it("model business-as-usual 2050 methane is within 5% of the published-path estimate", () => {
    const last = BAU.at(-1)!;
    expect(Math.abs(last.co2eMethane - publishedBauMethaneMt(2050)) / publishedBauMethaneMt(2050)).toBeLessThan(0.05);
  });
  it("high ambition 2050 methane is below business as usual and in the range of the published high case", () => {
    expect(HIGH.at(-1)!.co2eMethane).toBeLessThan(BAU.at(-1)!.co2eMethane);
    expect(Math.abs(HIGH.at(-1)!.co2eMethane - publishedHighMethane2050Mt) / publishedHighMethane2050Mt).toBeLessThan(0.15);
  });
});

describe("register entries for these streams", () => {
  const ids = new Set([...REGISTER, ...MODEL_ASSUMPTIONS].map((e) => e.id));
  it("exist for every benchmark and derived formula used", () => {
    for (const id of [
      "sdg123", "food_2019", "pop_future", "ewaste_2030", "ewaste_recycling_2030", "ghg_waste",
      "pop_2022", "food_halving", "plastic_dynamic", "methane_path", "mismanaged_calibration", "ewaste_interp",
    ]) {
      expect(ids.has(id), id).toBe(true);
    }
  });
});
