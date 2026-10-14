// Waste simulation model.
//
// Every input is listed with its source and verification status in data-register.ts.

export type Region = {
  id: string;
  name: string;
  gen2016: number; // million tonnes, World Bank What a Waste 2.0 (2018): used only for regional shape
  gen2050: number; // million tonnes, What a Waste 2.0 projection: used only for regional shape
  recovery2016: number; // approximate recycled + composted share (my estimate), 0..1
};

// Regional shape comes from What a Waste 2.0, the last edition whose regional tables I could cite.
// Totals are re-anchored to What a Waste 3.0 (2026): 2.56 Bt in 2022, 3.86 Bt in 2050 (business as usual).
const WAW2_REGIONS: Region[] = [
  { id: "eap", name: "East Asia & Pacific", gen2016: 468, gen2050: 714, recovery2016: 0.23 },
  { id: "eca", name: "Europe & Central Asia", gen2016: 392, gen2050: 490, recovery2016: 0.28 },
  { id: "na", name: "North America", gen2016: 289, gen2050: 396, recovery2016: 0.38 },
  { id: "sa", name: "South Asia", gen2016: 334, gen2050: 661, recovery2016: 0.05 },
  { id: "lac", name: "Latin America & Caribbean", gen2016: 231, gen2050: 369, recovery2016: 0.08 },
  { id: "ssa", name: "Sub-Saharan Africa", gen2016: 174, gen2050: 516, recovery2016: 0.04 },
  { id: "mena", name: "Middle East & North Africa", gen2016: 129, gen2050: 255, recovery2016: 0.07 },
];

export const START_YEAR = 2022;
export const END_YEAR = 2050;
export const GLOBAL_2022 = 2560; // Mt, World Bank What a Waste 3.0
export const GLOBAL_2050 = 3860; // Mt, World Bank What a Waste 3.0 business as usual
export const GLOBAL_RECOVERY_2022 = 0.21; // What a Waste 3.0, as reported by secondary summaries

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const raw2022 = WAW2_REGIONS.map((r) => r.gen2016 * Math.pow(r.gen2050 / r.gen2016, 6 / 34));
const k2022 = GLOBAL_2022 / sum(raw2022);
const k2050 = GLOBAL_2050 / sum(WAW2_REGIONS.map((r) => r.gen2050));
const weightedRaw = sum(WAW2_REGIONS.map((r, i) => raw2022[i] * k2022 * r.recovery2016)) / GLOBAL_2022;
const kRec = GLOBAL_RECOVERY_2022 / weightedRaw;

// Derived regional values: starting generation (2022), 2050 generation, and recovery rate in 2022.
export const REGIONS = WAW2_REGIONS.map((r, i) => ({
  id: r.id,
  name: r.name,
  gen2022: raw2022[i] * k2022,
  gen2050: r.gen2050 * k2050,
  recovery2022: Math.min(0.9, r.recovery2016 * kRec),
}));
export type DerivedRegion = (typeof REGIONS)[number];

// Global composition. Food (38%) and plastics (12.5%) are from What a Waste 3.0 as reported by one summary.
// The remaining 49.5% is split in the proportions of What a Waste 2.0 (a derived estimate).
// `recoverability` is an illustrative weight, not a published figure.
const OTHER_SCALE = (1 - 0.38 - 0.125) / 0.44;
export const MATERIALS = [
  { id: "food", name: "Food & green", share: 0.38, recoverability: 0.55, color: "#3f6b52" },
  { id: "paper", name: "Paper & cardboard", share: 0.17 * OTHER_SCALE, recoverability: 1.6, color: "#b8834a" },
  { id: "plastic", name: "Plastic", share: 0.125, recoverability: 0.55, color: "#c0563f" },
  { id: "glass", name: "Glass", share: 0.05 * OTHER_SCALE, recoverability: 1.5, color: "#5f8fa8" },
  { id: "metal", name: "Metal", share: 0.04 * OTHER_SCALE, recoverability: 2.2, color: "#7a7468" },
  { id: "wood", name: "Wood", share: 0.02 * OTHER_SCALE, recoverability: 0.8, color: "#8c6a45" },
  { id: "rubber", name: "Rubber & leather", share: 0.02 * OTHER_SCALE, recoverability: 0.3, color: "#4a4540" },
  { id: "other", name: "Other", share: 0.14 * OTHER_SCALE, recoverability: 0.35, color: "#a9a293" },
] as const;

export type Scenario = {
  id: string;
  name: string;
  blurb: string;
  growthCut: number; // % reduction of projected generation growth reached by 2050 (prevention)
  recoveryTarget: number; // extra recovery percentage points reached by 2050
};

export const SCENARIOS: Scenario[] = [
  { id: "bau", name: "Business as usual", blurb: "World Bank baseline: waste grows, recovery barely changes.", growthCut: 0, recoveryTarget: 2 },
  { id: "policy", name: "Stronger policy", blurb: "EU-style targets spread globally; modest prevention.", growthCut: 20, recoveryTarget: 15 },
  { id: "circular", name: "Circular economy", blurb: "Strong prevention plus near-universal collection and recovery.", growthCut: 50, recoveryTarget: 35 },
];

export type Inputs = { growthCut: number; recoveryTarget: number };

export type YearPoint = {
  year: number;
  generated: number; // Mt
  recovered: number; // Mt
  residual: number; // Mt landfilled / dumped / burned
  recoveryRate: number; // 0..1
  byMaterial: { id: string; generated: number; recovered: number }[];
  byRegion: { id: string; generated: number; recovery: number }[];
};

function baselineGen(r: DerivedRegion, year: number): number {
  const t = (year - START_YEAR) / (END_YEAR - START_YEAR);
  return r.gen2022 * Math.pow(r.gen2050 / r.gen2022, t);
}

export function simulate({ growthCut, recoveryTarget }: Inputs): YearPoint[] {
  const out: YearPoint[] = [];
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const t = (year - START_YEAR) / (END_YEAR - START_YEAR);
    let generated = 0;
    let recovered = 0;
    const byRegion: YearPoint["byRegion"] = [];
    for (const r of REGIONS) {
      const base = baselineGen(r, year);
      // Prevention reduces the *growth* above the 2016 level, phasing in linearly.
      const gen = r.gen2022 + (base - r.gen2022) * (1 - (growthCut / 100) * t);
      // Regions with low recovery have more headroom, so scale the uplift.
      const headroom = 1 - r.recovery2022;
      const rate = Math.min(0.95, r.recovery2022 + (recoveryTarget / 100) * t * (0.4 + headroom));
      generated += gen;
      recovered += gen * rate;
      byRegion.push({ id: r.id, generated: gen, recovery: rate });
    }
    const weights = MATERIALS.map((m) => m.share * m.recoverability);
    const wSum = weights.reduce((a, b) => a + b, 0);
    const byMaterial = MATERIALS.map((m, i) => {
      const g = generated * m.share;
      return { id: m.id, generated: g, recovered: Math.min(g, (recovered * weights[i]) / wSum) };
    });
    out.push({ year, generated, recovered, residual: generated - recovered, recoveryRate: recovered / generated, byMaterial, byRegion });
  }
  return out;
}
