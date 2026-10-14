// Waste simulation model.
//
// Grounded directly in the published flagship report:
// World Bank Group: "What a Waste 3.0: Global Snapshot of Solid Waste Management toward Circularity until 2050" (Cook et al., March 2026).
// Every input is cataloged with its exact citation in data-register.ts.

import { MAX_OBSERVED_RATE } from "./thresholds";

export type Region = {
  id: string;
  name: string;
  code: string;
  gen2022: number; // Mt, published 2022 baseline (What a Waste 3.0, Figure 2.1b / Map 2.1)
  gen2050: number; // Mt, published 2050 Business-as-Usual baseline (Figure 2.7a / Figure 4.1b)
  gen2030: number; // Mt, published intermediate 2030 BAU
  gen2040: number; // Mt, published intermediate 2040 BAU
  recovery2022: number; // Materials recovery rate (recycling + composting/AD), Figure 3.5-3.36
  incineration2022: number; // Share incinerated (with energy recovery)
  landfillControlled2022: number; // Share in sanitary or controlled landfill
  dumpsite2022: number; // Share openly dumped
  uncollected2022: number; // Share uncollected
  collectionRate2022: number; // Formal collection coverage
  perCapita2022: number; // kg/capita/day
};

// Official published numbers from What a Waste 3.0 (2026), Chapter 2, 3 and 4
export const REGIONS: Region[] = [
  {
    id: "eap",
    name: "East Asia & Pacific",
    code: "EAP",
    gen2022: 849,
    gen2030: 971,
    gen2040: 1069,
    gen2050: 1119,
    recovery2022: 0.194, // 15% recycling (131 Mt) + 4% composting/AD (34 Mt) = 165 Mt
    incineration2022: 0.442, // 375 Mt (44%)
    landfillControlled2022: 0.219, // 93 Mt sanitary + 93 Mt controlled (22%)
    dumpsite2022: 0.047, // 40 Mt (5%)
    uncollected2022: 0.098, // 83 Mt (10%)
    collectionRate2022: 0.90,
    perCapita2022: 0.98,
  },
  {
    id: "eca",
    name: "Europe & Central Asia",
    code: "ECA",
    gen2022: 415,
    gen2030: 442,
    gen2040: 468,
    gen2050: 485, // What a Waste 3.0 Figure 2.7 & 4.1 (+17% growth from 415 Mt)
    recovery2022: 0.342, // 23% recycling (97 Mt) + 11% composting/AD (45 Mt) = 142 Mt
    incineration2022: 0.220, // 91 Mt
    landfillControlled2022: 0.358, // 149 Mt
    dumpsite2022: 0.041, // 17 Mt (4%)
    uncollected2022: 0.039, // 16 Mt (4%)
    collectionRate2022: 0.96,
    perCapita2022: 1.22,
  },
  {
    id: "sa",
    name: "South Asia",
    code: "SA",
    gen2022: 346,
    gen2030: 436,
    gen2040: 560,
    gen2050: 688,
    recovery2022: 0.214, // 11% recycling (38 Mt) + 11% composting/AD (36 Mt) = 74 Mt
    incineration2022: 0.009, // 3 Mt (1%)
    landfillControlled2022: 0.064, // 22 Mt (6%)
    dumpsite2022: 0.382, // 132 Mt (38%)
    uncollected2022: 0.329, // 114 Mt (33%)
    collectionRate2022: 0.67,
    perCapita2022: 0.49,
  },
  {
    id: "na",
    name: "North America",
    code: "NA",
    gen2022: 311,
    gen2030: 336,
    gen2040: 360,
    gen2050: 368,
    recovery2022: 0.418, // 27% recycling (84 Mt) + 15% composting/AD (46 Mt) = 130 Mt
    incineration2022: 0.116, // 36 Mt (12%)
    landfillControlled2022: 0.463, // 138 Mt sanitary + 6 Mt controlled (46%)
    dumpsite2022: 0.003, // <1%
    uncollected2022: 0.000, // <0.1%
    collectionRate2022: 1.00,
    perCapita2022: 2.25,
  },
  {
    id: "lac",
    name: "Latin America & Caribbean",
    code: "LAC",
    gen2022: 249,
    gen2030: 280,
    gen2040: 324,
    gen2050: 378,
    recovery2022: 0.068, // 6% recycling (16 Mt) + 0.8% composting (1 Mt) = 17 Mt
    incineration2022: 0.005, // ~1 Mt
    landfillControlled2022: 0.667, // 108 Mt sanitary (44%) + 58 Mt controlled (23%)
    dumpsite2022: 0.120, // 30 Mt (12%)
    uncollected2022: 0.140, // 35 Mt (14%)
    collectionRate2022: 0.86,
    perCapita2022: 1.05,
  },
  {
    id: "ssa",
    name: "Sub-Saharan Africa",
    code: "SSA",
    gen2022: 231,
    gen2030: 291,
    gen2040: 391,
    gen2050: 518, // What a Waste 3.0 Figure 2.7 & 4.1 (+124% growth from 231 Mt)
    recovery2022: 0.026, // 2% recycling (6 Mt) + <1% composting = ~6 Mt
    incineration2022: 0.001,
    landfillControlled2022: 0.048, // 11 Mt (5%)
    dumpsite2022: 0.234, // 54 Mt (24%)
    uncollected2022: 0.693, // 160 Mt (69%)
    collectionRate2022: 0.31,
    perCapita2022: 0.52,
  },
  {
    id: "mena",
    name: "Middle East & North Africa",
    code: "MENA",
    gen2022: 161,
    gen2030: 196,
    gen2040: 244,
    gen2050: 298,
    recovery2022: 0.087, // 6% recycling (10 Mt) + 2.7% composting (4 Mt) = 14 Mt
    incineration2022: 0.006,
    landfillControlled2022: 0.379, // 28 Mt sanitary (17%) + 33 Mt controlled (21%)
    dumpsite2022: 0.329, // 53 Mt (33%)
    uncollected2022: 0.205, // 33 Mt (21%)
    collectionRate2022: 0.79,
    perCapita2022: 0.90,
  },
];

export type DerivedRegion = Region;

export const START_YEAR = 2022;
export const END_YEAR = 2050;
export const GLOBAL_2022 = 2562; // Mt, published World Bank What a Waste 3.0 sum (Table 2.1)
export const GLOBAL_2050_BAU = 3855; // Mt, published 2050 BAU sum (+50% growth)
export const GLOBAL_RECOVERY_2022 = 0.2139; // ~21.4% (548 Mt recovered out of 2,562 Mt generated)

// Global Municipal Waste Composition, from What a Waste 3.0, Figure 2.9 (Global weighted mean):
// Food: 38.3%, Garden: 8.0%, Paper & cardboard: 13.9%, Plastic: 12.5%, Glass: 4.2%,
// Metal: 3.8%, Wood: 3.0%, Inert & rubble: 3.9%, Textiles: 3.6%, Rubber & leather: 1.7%,
// WEEE (e-waste): 1.7%, Diapers & hygiene: 1.8%, Hazardous: 0.7%, Other: 2.8%
export const MATERIALS = [
  { id: "food", name: "Food waste", share: 0.383, recoverability: 0.55, color: "#2d6a4f", desc: "Organic kitchen scraps & uneaten food (primary landfill methane driver)" },
  { id: "paper", name: "Paper & cardboard", share: 0.139, recoverability: 1.6, color: "#d4a373", desc: "Packaging, boxes, office paper, newsprint" },
  { id: "plastic", name: "Plastics", share: 0.125, recoverability: 0.50, color: "#e76f51", desc: "65% is single-use packaging; major marine pollution hazard" },
  { id: "garden", name: "Garden & yard waste", share: 0.080, recoverability: 1.2, color: "#52b788", desc: "Leaves, grass cuttings, branches, easily compostable" },
  { id: "glass", name: "Glass", share: 0.042, recoverability: 1.5, color: "#4895ef", desc: "Bottles, jars, infinitely recyclable" },
  { id: "metal", name: "Metals", share: 0.038, recoverability: 2.2, color: "#6c757d", desc: "Aluminum and steel cans, scrap, high energy savings in recycling" },
  { id: "inert", name: "Inert & rubble", share: 0.039, recoverability: 0.4, color: "#9c8974", desc: "Dirt, stones, ceramics, minor construction debris in municipal streams" },
  { id: "textiles", name: "Textiles & clothing", share: 0.036, recoverability: 0.45, color: "#b5838d", desc: "Garments and cloth; <1% currently recycled fibre-to-fibre" },
  { id: "wood", name: "Wood", share: 0.030, recoverability: 0.8, color: "#8c6a45", desc: "Crates, pallets, timber trimmings" },
  { id: "weee", name: "E-waste (WEEE)", share: 0.017, recoverability: 1.1, color: "#457b9d", desc: "Electronics with plugs or batteries; fast growing, contains critical minerals" },
  { id: "rubber", name: "Rubber & leather", share: 0.017, recoverability: 0.3, color: "#495057", desc: "Footwear, belts, tires" },
  { id: "diapers", name: "Diapers & hygiene", share: 0.018, recoverability: 0.1, color: "#e0a96d", desc: "Sanitary napkins, nappies, wipes" },
  { id: "other", name: "Other & hazardous", share: 0.035, recoverability: 0.2, color: "#adb5bd", desc: "Household chemicals, batteries, mixed residual items" },
] as const;

// The published composition percentages are rounded and add up to 99.9%, so shares are divided by their total
// to make the materials add up exactly to the waste generated.
const SHARE_TOTAL = MATERIALS.reduce((a, m) => a + m.share, 0);

export type Scenario = {
  id: string;
  name: string;
  blurb: string;
  target2050Gen: number; // Mt global generation by 2050
  growthCut: number; // % reduction of projected generation growth reached by 2050 (prevention)
  recoveryTarget: number; // Target global recovery rate reached by 2050 (%)
  collectionTarget: number; // Collection coverage target by 2050 (%)
  controlledTarget: number; // Controlled facilities target (SDG 11.6.1) (%)
};

// Defined directly by Table 4.1 of What a Waste 3.0:
export const SCENARIOS: Scenario[] = [
  {
    id: "bau",
    name: "Business as usual",
    blurb: "World Bank baseline: waste grows by 50% to 3.86 Bt, recovery rises slowly to 27%.",
    target2050Gen: 3855,
    growthCut: 0,
    recoveryTarget: 27,
    collectionTarget: 89,
    controlledTarget: 80,
  },
  {
    id: "low",
    name: "Low ambition",
    blurb: "Moderate waste prevention (3.21 Bt) and enhanced recovery reaching 41% globally.",
    target2050Gen: 3213,
    growthCut: 50,
    recoveryTarget: 41,
    collectionTarget: 94,
    controlledTarget: 89,
  },
  {
    id: "high",
    name: "High ambition",
    blurb: "Aggressive prevention caps waste at 2.56 Bt; universal collection & 54% recovery.",
    target2050Gen: 2562,
    growthCut: 100,
    recoveryTarget: 54,
    collectionTarget: 100,
    controlledTarget: 100,
  },
];

export type Inputs = { growthCut: number; recoveryTarget: number };

export type YearPoint = {
  year: number;
  generated: number; // Mt
  recovered: number; // Mt
  residual: number; // Mt landfilled / dumped / burned
  recoveryRate: number; // 0..1
  incinerated: number; // Mt
  controlledLandfill: number; // Mt
  dumpsite: number; // Mt
  uncollected: number; // Mt
  co2eMethane: number; // Mt CO2e from waste decomposition
  byMaterial: { id: string; generated: number; recovered: number; residual: number }[];
  byRegion: {
    id: string;
    name: string;
    code: string;
    generated: number;
    recovery: number;
    recovered: number;
    residual: number;
  }[];
};

function baselineGen(r: Region, year: number): number {
  if (year <= 2030) {
    const t = (year - 2022) / (2030 - 2022);
    return r.gen2022 + (r.gen2030 - r.gen2022) * t;
  } else if (year <= 2040) {
    const t = (year - 2030) / (2040 - 2030);
    return r.gen2030 + (r.gen2040 - r.gen2030) * t;
  } else {
    const t = (year - 2040) / (2050 - 2040);
    return r.gen2040 + (r.gen2050 - r.gen2040) * t;
  }
}

// Shares the recovered tonnes between materials in proportion to their weights. A material can never recover
// more than it generates; any overflow is passed to the materials that still have room, so nothing is lost.
function allocateRecovery(gens: number[], weights: number[], total: number): number[] {
  const out = gens.map(() => 0);
  let remaining = Math.min(total, gens.reduce((a, b) => a + b, 0));
  let open = gens.map((_, i) => i);
  while (remaining > 1e-9 && open.length) {
    const wSum = open.reduce((a, i) => a + weights[i], 0);
    const capped: number[] = [];
    for (const i of open) {
      const give = (remaining * weights[i]) / wSum;
      if (out[i] + give >= gens[i]) capped.push(i);
    }
    if (!capped.length) {
      for (const i of open) out[i] += (remaining * weights[i]) / wSum;
      return out;
    }
    for (const i of capped) {
      remaining -= gens[i] - out[i];
      out[i] = gens[i];
    }
    open = open.filter((i) => !capped.includes(i));
  }
  return out;
}

// Starting global recovery rate, computed from the regional 2022 figures so the maths is self-consistent.
const BASE_RATE = REGIONS.reduce((a, r) => a + r.gen2022 * r.recovery2022, 0) / REGIONS.reduce((a, r) => a + r.gen2022, 0);
// No region can recycle more than the best national rate observed (about 69%, see thresholds.ts)
const RATE_CAP = MAX_OBSERVED_RATE;

// Share of all waste that is dumped or never collected today (generation-weighted).
const MISMANAGED_BASE =
  REGIONS.reduce((a, r) => a + r.gen2022 * (r.dumpsite2022 + r.uncollected2022), 0) / REGIONS.reduce((a, r) => a + r.gen2022, 0);

// Controlled-facilities target (share of waste not dumped or left uncollected) for any recovery target. The three
// presets set it directly (80%, 89%, 100% in 2050); other recovery targets are interpolated between them in a
// straight line, and extended past the ends along the nearest segment.
export function controlledTargetFor(recoveryTarget: number): number {
  const pts = SCENARIOS.map((s) => [s.recoveryTarget, s.controlledTarget] as const).sort((a, b) => a[0] - b[0]);
  const seg = recoveryTarget <= pts[1][0] ? [pts[0], pts[1]] : [pts[pts.length - 2], pts[pts.length - 1]];
  const [[x0, y0], [x1, y1]] = seg;
  return Math.min(100, Math.max(0, y0 + ((recoveryTarget - x0) * (y1 - y0)) / (x1 - x0)));
}

const UNC_RATE = 0.9; // how fast uncollected waste shrinks per unit of formalisation
const DUMP_RATE = 0.8; // how fast open dumping shrinks per unit of formalisation

// Finds the single "formalisation" amount that makes the weighted share of dumped plus uncollected waste equal
// `goal`. Higher formalisation always means less mismanaged waste, so it is found by bisection.
function solveFormalisation(gens: number[], goal: number): number {
  const total = gens.reduce((a, b) => a + b, 0);
  const share = (g: number) =>
    REGIONS.reduce(
      (a, r, i) => a + gens[i] * (r.uncollected2022 * Math.max(0, 1 - UNC_RATE * g) + r.dumpsite2022 * Math.max(0, 1 - DUMP_RATE * g)),
      0,
    ) / total;
  let lo = 0;
  let hi = 1 / Math.min(UNC_RATE, DUMP_RATE) + 0.01;
  for (let n = 0; n < 60; n++) {
    const mid = (lo + hi) / 2;
    if (share(mid) > goal) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Finds each region's recovery rate so that the generation-weighted global rate equals `goal`.
// Every region moves up by k times its uplift weight (regions with more headroom catch up faster) and no region
// can exceed RATE_CAP. The weighted rate rises steadily with k, so k is found by bisection.
function solveRates(gens: number[], base: number[], uplift: number[], goal: number): number[] {
  const total = gens.reduce((a, b) => a + b, 0);
  const ratesAt = (k: number) => base.map((b, i) => Math.min(RATE_CAP, Math.max(0, b + k * uplift[i])));
  const weighted = (k: number) => ratesAt(k).reduce((a, r, i) => a + r * gens[i], 0) / total;
  let lo = -2;
  let hi = 5;
  for (let n = 0; n < 60; n++) {
    const mid = (lo + hi) / 2;
    if (weighted(mid) < goal) lo = mid;
    else hi = mid;
  }
  return ratesAt((lo + hi) / 2);
}

export function simulate({ growthCut, recoveryTarget }: Inputs): YearPoint[] {
  const out: YearPoint[] = [];
  const years = END_YEAR - START_YEAR;

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const t = (year - START_YEAR) / years;
    let generated = 0;
    let recovered = 0;
    let dumpsiteTotal = 0;
    let uncollectedTotal = 0;
    let incineratedTotal = 0;
    let controlledLandfillTotal = 0;
    const byRegion: YearPoint["byRegion"] = [];

    // Prevention cuts generation growth above the 2022 baseline
    const regionGens = REGIONS.map((r) => r.gen2022 + (baselineGen(r, year) - r.gen2022) * (1 - (growthCut / 100) * t));
    // The global recovery rate moves in a straight line from today's rate to the scenario target in 2050.
    // Regions with more headroom (lower starting rate) do proportionally more of the catching up.
    const goal = BASE_RATE + t * (recoveryTarget / 100 - BASE_RATE);
    const regionRates = solveRates(
      regionGens,
      REGIONS.map((r) => r.recovery2022),
      REGIONS.map((r) => 0.5 + 0.8 * (1 - r.recovery2022)),
      goal,
    );

    // The mismanaged share also moves in a straight line, from today's share to what the scenario's
    // controlled-facilities target leaves over in 2050 (BAU 80% controlled, so 20% mismanaged).
    const mismanagedGoal = MISMANAGED_BASE + t * (1 - controlledTargetFor(recoveryTarget) / 100 - MISMANAGED_BASE);
    const formalisation = solveFormalisation(regionGens, mismanagedGoal);

    for (const [i, r] of REGIONS.entries()) {
      const gen = regionGens[i];
      const rate = regionRates[i];

      const regRecovered = gen * rate;
      const regResidual = gen - regRecovered;

      // As collection and recovery expand, uncollected waste and dumpsites contract
      const uncShare = r.uncollected2022 * Math.max(0, 1 - UNC_RATE * formalisation);
      const dumpShare = r.dumpsite2022 * Math.max(0, 1 - DUMP_RATE * formalisation);
      // Material that is recycled is not also burned, so incineration gives way if the shares would exceed 100%
      const room = Math.max(0, 1 - rate - uncShare - dumpShare);
      const incShare = Math.min(r.incineration2022, room);
      const landShare = room - incShare;

      generated += gen;
      recovered += regRecovered;
      uncollectedTotal += gen * uncShare;
      dumpsiteTotal += gen * dumpShare;
      incineratedTotal += gen * incShare;
      controlledLandfillTotal += gen * landShare;

      byRegion.push({
        id: r.id,
        name: r.name,
        code: r.code,
        generated: gen,
        recovery: rate,
        recovered: regRecovered,
        residual: regResidual,
      });
    }

    const weights = MATERIALS.map((m) => m.share * m.recoverability);
    const gens = MATERIALS.map((m) => (generated * m.share) / SHARE_TOTAL);
    const recs = allocateRecovery(gens, weights, recovered);
    const byMaterial = MATERIALS.map((m, i) => ({ id: m.id, generated: gens[i], recovered: recs[i], residual: gens[i] - recs[i] }));

    // Methane & GHG calculation: 2022 baseline is 1.15 Gt CO2e methane from organic solid waste (Food + Garden)
    // Landfilled / unmanaged food + garden produces approx 0.85 t CO2e per tonne of decaying organics
    const foodAndGardenResidual =
      byMaterial.find((m) => m.id === "food")!.residual +
      byMaterial.find((m) => m.id === "garden")!.residual;
    // 1.16 t CO2e per tonne of unrecovered food and garden waste. Calibrated so 2022 gives about 1.15 Gt CO2e,
    // the methane figure in the register (entry methane_emissions: What a Waste 3.0 Executive Summary p. 8 and
    // Chapter 5, as recorded there). Explained in the register entry co2e_scaling.
    const co2eMethane = foodAndGardenResidual * 1.16;

    out.push({
      year,
      generated,
      recovered,
      residual: generated - recovered,
      recoveryRate: recovered / generated,
      incinerated: incineratedTotal,
      controlledLandfill: controlledLandfillTotal,
      dumpsite: dumpsiteTotal,
      uncollected: uncollectedTotal,
      co2eMethane,
      byMaterial,
      byRegion,
    });
  }
  return out;
}

