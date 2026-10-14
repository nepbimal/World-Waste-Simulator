// Waste simulation model.
//
// Sources (see SOURCES below): World Bank "What a Waste 2.0" (2018) for regional
// generation in 2016 and the 2050 projection, global composition and treatment
// shares; UNEP Global Waste Management Outlook 2024 for the 2023 -> 2050 range.
// Regional recovery rates are approximations calibrated so the weighted global
// recovery matches the World Bank's ~19% (13.5% recycled + 5.5% composted).

export type Region = {
  id: string;
  name: string;
  gen2016: number; // million tonnes
  gen2050: number; // million tonnes (World Bank business-as-usual)
  recovery2016: number; // share recycled + composted, 0..1 (approximate)
};

export const REGIONS: Region[] = [
  { id: "eap", name: "East Asia & Pacific", gen2016: 468, gen2050: 714, recovery2016: 0.23 },
  { id: "eca", name: "Europe & Central Asia", gen2016: 392, gen2050: 490, recovery2016: 0.28 },
  { id: "na", name: "North America", gen2016: 289, gen2050: 396, recovery2016: 0.38 },
  { id: "sa", name: "South Asia", gen2016: 334, gen2050: 661, recovery2016: 0.05 },
  { id: "lac", name: "Latin America & Caribbean", gen2016: 231, gen2050: 369, recovery2016: 0.08 },
  { id: "ssa", name: "Sub-Saharan Africa", gen2016: 174, gen2050: 516, recovery2016: 0.04 },
  { id: "mena", name: "Middle East & North Africa", gen2016: 129, gen2050: 255, recovery2016: 0.07 },
];

// Global composition (World Bank). `recoverability` is an illustrative weight for
// how readily each stream is recycled/composted today.
export const MATERIALS = [
  { id: "food", name: "Food & green", share: 0.44, recoverability: 0.55, color: "#3f6b52" },
  { id: "paper", name: "Paper & cardboard", share: 0.17, recoverability: 1.6, color: "#b8834a" },
  { id: "plastic", name: "Plastic", share: 0.12, recoverability: 0.55, color: "#c0563f" },
  { id: "glass", name: "Glass", share: 0.05, recoverability: 1.5, color: "#5f8fa8" },
  { id: "metal", name: "Metal", share: 0.04, recoverability: 2.2, color: "#7a7468" },
  { id: "wood", name: "Wood", share: 0.02, recoverability: 0.8, color: "#8c6a45" },
  { id: "rubber", name: "Rubber & leather", share: 0.02, recoverability: 0.3, color: "#4a4540" },
  { id: "other", name: "Other", share: 0.14, recoverability: 0.35, color: "#a9a293" },
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

export const START_YEAR = 2016;
export const END_YEAR = 2050;

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

function baselineGen(r: Region, year: number): number {
  const t = (year - START_YEAR) / (END_YEAR - START_YEAR);
  return r.gen2016 * Math.pow(r.gen2050 / r.gen2016, t);
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
      const gen = r.gen2016 + (base - r.gen2016) * (1 - (growthCut / 100) * t);
      // Regions with low recovery have more headroom, so scale the uplift.
      const headroom = 1 - r.recovery2016;
      const rate = Math.min(0.95, r.recovery2016 + (recoveryTarget / 100) * t * (0.4 + headroom));
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

export const SOURCES = [
  { label: "World Bank — What a Waste 2.0 (2018)", url: "https://openknowledge.worldbank.org/entities/publication/d3f9d45e-115f-559b-b14f-28552410e90a/full" },
  { label: "UNEP — Global Waste Management Outlook 2024", url: "https://www.unep.org/resources/global-waste-management-outlook-2024" },
  { label: "US EPA — Facts and Figures about Materials, Waste and Recycling", url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/national-overview-facts-and-figures-materials" },
  { label: "Eurostat — Municipal waste statistics (2022)", url: "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20240208-2" },
];
