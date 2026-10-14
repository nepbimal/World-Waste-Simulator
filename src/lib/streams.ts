// Calculations that link the simulated waste streams to published benchmarks (food, e-waste, plastics,
// textiles, methane). Every constant here is listed in data-register.ts with its source and status; formulas
// that combine figures are registered there as "derived".

import { END_YEAR, START_YEAR, type YearPoint } from "./waste-model";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const stream = (p: YearPoint, id: string) => p.byMaterial.find((m) => m.id === id)!;

// ---------- Population (billions) ----------
// 2030 and 2050: UN World Population Prospects 2024, medium variant. 2022: derived from the UNEP Food Waste Index
// (1.05 billion tonnes at 132 kg per person), which also matches the UN's "8 billion in late 2022".
export const POP_2022_BN = 1050 / 132;
export const POP_2030_BN = 8.5;
export const POP_2050_BN = 9.7;

export function populationBn(year: number): number {
  if (year <= 2030) return lerp(POP_2022_BN, POP_2030_BN, clamp01((year - START_YEAR) / (2030 - START_YEAR)));
  return lerp(POP_2030_BN, POP_2050_BN, clamp01((year - 2030) / (END_YEAR - 2030)));
}

// ---------- Food (SDG 12.3) ----------
// Million tonnes divided by billions of people is kilograms per person.
export function foodKgPerPerson(p: YearPoint): number {
  return stream(p, "food").generated / populationBn(p.year);
}

export const SDG_FOOD_YEAR = 2030;

// Illustrative line: half of the model's own 2022 per-person food waste by 2030, held flat afterwards. SDG 12.3 itself
// is measured with the UNEP Food Waste Index (retail, food service and households), not this municipal food stream.
export function foodHalvingBenchmark(baseKg: number, year: number): number {
  return baseKg * (1 - 0.5 * clamp01((year - START_YEAR) / (SDG_FOOD_YEAR - START_YEAR)));
}

// ---------- E-waste ----------
export const EWASTE_2022_MT = 62;
export const EWASTE_2030_MT = 82;

// All e-waste, every channel, in Mt. Published for 2022 and projected for 2030 only; null where nothing is published.
export function totalEwasteMt(year: number): number | null {
  if (year < START_YEAR || year > 2030) return null;
  return lerp(EWASTE_2022_MT, EWASTE_2030_MT, (year - START_YEAR) / (2030 - START_YEAR));
}

// E-waste that ends up in the municipal bin, from the model's weee stream.
export function municipalEwasteMt(p: YearPoint): number {
  return stream(p, "weee").generated;
}

// ---------- Plastics ----------
export const SINGLE_USE_SHARE = 0.65;

export function mismanagedShare(p: YearPoint): number {
  return (p.dumpsite + p.uncollected) / p.generated;
}

// Plastic that is dumped or never collected. Assumes plastic is mismanaged in the same proportion as all waste,
// so it falls as the scenario collects more waste and closes dumpsites.
export function mismanagedPlasticMt(p: YearPoint): number {
  return stream(p, "plastic").generated * mismanagedShare(p);
}

export function singleUsePlasticMt(p: YearPoint): number {
  return stream(p, "plastic").generated * SINGLE_USE_SHARE;
}

// ---------- Textiles ----------
export function textiles(p: YearPoint) {
  const t = stream(p, "textiles");
  return { generated: t.generated, recovered: t.recovered, recoveredShare: t.recovered / t.generated };
}

// ---------- Methane ----------
export const WASTE_GHG_2022_MT = 1280; // total waste-sector greenhouse gases, Mt CO2e
export const WASTE_GHG_2050_BAU_MT = 1840;
export const WASTE_GHG_2050_HIGH_MT = 910;
export const METHANE_2022_MT = 1150;
export const METHANE_SHARE = METHANE_2022_MT / WASTE_GHG_2022_MT; // about 90%

// The published business-as-usual path is only given for 2022 and 2050; this fills in the years between in a straight
// line and takes the methane part at the 2022 methane share. A derived estimate, not a published series.
export function publishedBauMethaneMt(year: number): number {
  const t = clamp01((year - START_YEAR) / (END_YEAR - START_YEAR));
  return lerp(WASTE_GHG_2022_MT, WASTE_GHG_2050_BAU_MT, t) * METHANE_SHARE;
}

export const publishedHighMethane2050Mt = WASTE_GHG_2050_HIGH_MT * METHANE_SHARE;
