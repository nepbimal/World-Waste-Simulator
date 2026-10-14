// Register of external figures, official sources, and verification status.
//
// Verification status criteria:
//   confirmed   - verified against primary publisher reports (e.g. World Bank What a Waste 3.0, Eurostat, UNITAR, OECD)
//   single      - single peer-reviewed or institutional study
//   conflicting - sources differ in scope, boundary, or baseline year
//   derived     - computed directly from confirmed inputs
//   estimate    - user-adjustable model assumption
//
// Primary reference:
// Cook, E., Ionkova, K., Bhada-Tata, P., Yadav, S., and van Woerden, F. (2026).
// "What a Waste 3.0: Global Snapshot of Solid Waste Management Toward Circularity until 2050."
// World Bank Group Urban Development Series. Washington, DC. DOI: 10.1596/978-1-4648-2309-1.
// Verified directly against the 384-page primary publication and official datasets.

export type Status = "confirmed" | "single" | "conflicting" | "derived" | "estimate";
export type Src = { label: string; url: string; publisher?: boolean };
export type Entry = {
  id: string;
  category: string;
  metric: string;
  value: string;
  year: string;
  status: Status;
  note?: string;
  sources: Src[];
};

export const CHECKED_ON = "Verified from primary publisher reports (What a Waste 3.0, Eurostat, UNITAR, OECD)";

export const STATUS_LABEL: Record<Status, string> = {
  confirmed: "Confirmed (Primary Report)",
  single: "Single Institutional Source",
  conflicting: "Methodological Difference",
  derived: "Derived from Confirmed Data",
  estimate: "Model Assumption / Lever",
};

const WB_REPORT: Src = { label: "World Bank: What a Waste 3.0 (Cook et al. 2026)", url: "https://hdl.handle.net/10986/44141", publisher: true };
const WB_DATA: Src = { label: "World Bank Data360: What a Waste Dataset", url: "https://data360.worldbank.org/en/dataset/WB_WAW", publisher: true };
const EUROSTAT: Src = { label: "Eurostat: Municipal Waste Statistics 2024", url: "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Municipal_waste_statistics", publisher: true };
const UNITAR_EW: Src = { label: "UNITAR/ITU: Global E-waste Monitor 2024", url: "https://unitar.org/about/news-stories/press/global-e-waste-monitor-2024-electronic-waste-rising-five-times-faster-documented-e-waste-recycling", publisher: true };
const OECD_PLAST: Src = { label: "OECD: Global Plastics Outlook", url: "https://www.oecd.org/en/publications/global-plastics-outlook_de747aef-en.html", publisher: true };
const UNEP_FOOD: Src = { label: "UNEP: Food Waste Index Report 2024", url: "https://www.unep.org/resources/publication/unep-food-waste-index-report-2024", publisher: true };
const UNEP_METHANE: Src = { label: "UNEP/CCAC: Global Methane Assessment", url: "https://www.unep.org/resources/report/global-methane-assessment-benefits-and-costs-mitigating-methane-emissions", publisher: true };
const EPA_FACTS: Src = { label: "US EPA: Facts and Figures on Materials, Wastes and Recycling", url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/national-overview-facts-and-figures-materials", publisher: true };

export const REGISTER: Entry[] = [
  // ---- Global municipal solid waste generation & trajectory ----
  {
    id: "gen2022",
    category: "Global municipal waste",
    metric: "Global municipal solid waste generated",
    value: "2,562 million tonnes (2.56 billion tonnes)",
    year: "2022",
    status: "confirmed",
    note: "Primary baseline in What a Waste 3.0 (Table 2.1). Reached 2.56 Bt by 2022, surpassing the previous edition's 2030 projection (2.59 Bt) 8 years earlier due to updated capture of uncollected and non-household flows.",
    sources: [WB_REPORT, WB_DATA],
  },
  {
    id: "gen2050_bau",
    category: "Global municipal waste",
    metric: "Projected generation by 2050 (Business-As-Usual)",
    value: "3,855 million tonnes (+50% growth)",
    year: "2050",
    status: "confirmed",
    note: "What a Waste 3.0 Table 4.1 & Figure 4.1. Fast growth driven by low- and middle-income country demographic and economic expansion.",
    sources: [WB_REPORT],
  },
  {
    id: "scenarios_2050",
    category: "Global municipal waste",
    metric: "Alternative policy scenarios for 2050",
    value: "Low ambition: 3,213 Mt (+25%) · High ambition: 2,562 Mt (0% growth, capped at 2022 level)",
    year: "2050",
    status: "confirmed",
    note: "Table 4.1. Under high ambition, aggressive waste prevention and circular economy practices decouple economic growth from waste generation.",
    sources: [WB_REPORT],
  },
  {
    id: "percap",
    category: "Global municipal waste",
    metric: "Average daily waste generated per person",
    value: "0.88 kg/day global mean (ranging from 0.16 to >3.0 kg/day)",
    year: "2022",
    status: "confirmed",
    note: "Figure 2.1f. North America generates 2.25 kg/capita/day; Europe & Central Asia 1.22; Latin America 1.05; East Asia & Pacific 0.98; Middle East & North Africa 0.90; Sub-Saharan Africa 0.52; South Asia 0.49 kg/capita/day.",
    sources: [WB_REPORT],
  },
  {
    id: "recovery",
    category: "Global municipal waste",
    metric: "Global materials recovery share (Recycling + Composting/AD)",
    value: "21.4% (548 million tonnes recovered)",
    year: "2022",
    status: "confirmed",
    note: "Figure S.3 & regional tables. 15% material recycling (385 Mt) + 6% composting & anaerobic digestion (163 Mt).",
    sources: [WB_REPORT],
  },
  {
    id: "mix",
    category: "Global municipal waste",
    metric: "Global waste fate: Landfill / Recovery / Incineration / Mismanaged",
    value: "29% landfill · 21% materials recovery · 20% modern incineration · 30% mismanaged (13% dumpsite + 17% uncollected)",
    year: "2022",
    status: "confirmed",
    note: "Figure S.3. Landfill consists of 17% sanitary landfill and 12% controlled landfill. In low-income countries, 72% remains uncollected and 25% is openly dumped.",
    sources: [WB_REPORT],
  },
  {
    id: "regional",
    category: "Global municipal waste",
    metric: "Regional waste generation and breakdown (2022)",
    value: "East Asia & Pacific 849 Mt (33%) · Europe & Central Asia 415 Mt (16%) · South Asia 346 Mt (14%) · North America 311 Mt (12%) · Latin America 249 Mt (10%) · Sub-Saharan Africa 231 Mt (9%) · Middle East & North Africa 161 Mt (6%)",
    year: "2022",
    status: "confirmed",
    note: "Figures 2.1b & 2.1d. Fastest growth to 2050: Sub-Saharan Africa (+124% to 485-518 Mt) and South Asia (+99% to 688 Mt).",
    sources: [WB_REPORT],
  },
  {
    id: "composition",
    category: "Global municipal waste",
    metric: "Global material composition breakdown",
    value: "Food 38.3% · Paper & cardboard 13.9% · Plastics 12.5% · Garden 8.0% · Glass 4.2% · Metals 3.8% · Inert/rubble 3.9% · Textiles 3.6% · Wood 3.0% · WEEE 1.7% · Rubber 1.7% · Hygiene/diapers 1.8% · Other 3.5%",
    year: "2022",
    status: "confirmed",
    note: "Figure 2.9 (Global weighted mean from national waste audits). Organics (food + garden) constitute 46.3% of global municipal waste.",
    sources: [WB_REPORT],
  },
  {
    id: "collection",
    category: "Global municipal waste",
    metric: "Municipal waste collection coverage by country income group",
    value: "High-income: 99% · Upper-middle: 89% · Lower-middle: 61% · Low-income: 28% (Urban 42%, Rural 5%)",
    year: "2022",
    status: "confirmed",
    note: "Figure S.2 and Figure 2.11. In low-income nations, 72% of waste is never collected and must be self-managed (principally open-burned).",
    sources: [WB_REPORT],
  },

  // ---- Climate and environment ----
  {
    id: "methane_emissions",
    category: "Climate and energy",
    metric: "Greenhouse gas emissions from solid waste management",
    value: "1.28 billion tonnes CO2e/year (methane: 1.15 Gt CO2e, ~90%)",
    year: "2022",
    status: "confirmed",
    note: "What a Waste 3.0 Chapter 5. Solid waste is the 3rd largest source of anthropogenic methane (~20% of global emissions). Projected to rise to 1.84 Gt CO2e by 2050 under BAU.",
    sources: [WB_REPORT, UNEP_METHANE],
  },
  {
    id: "cost_financing",
    category: "Economics and jobs",
    metric: "Global municipal waste management operational costs",
    value: "US$ 250+ billion/year (2022), projected to rise to US$ 426 billion/year by 2050",
    year: "2022 / 2050",
    status: "confirmed",
    note: "Chapter 7. Consumes ~6% of municipal budgets on average. Universal collection in middle-income countries requires 0.3-0.5% of GDP; in low-income countries ~0.8% of GDP.",
    sources: [WB_REPORT],
  },
  {
    id: "waste_jobs",
    category: "Economics and jobs",
    metric: "Urban waste workforce and informal sector",
    value: "18 million urban waste workers (~0.3% of global urban population)",
    year: "2022",
    status: "confirmed",
    note: "Chapter 6. Informal waste pickers collect up to 90% of all recycled materials in many lower-income cities.",
    sources: [WB_REPORT],
  },

  // ---- Plastics & Ocean Pollution ----
  {
    id: "plastics_mismanaged",
    category: "Plastics",
    metric: "Mismanaged plastic waste",
    value: "93 million tonnes/year (28.8% of all plastic waste)",
    year: "2022",
    status: "confirmed",
    note: "What a Waste 3.0 Section 2.7. 42 Mt dumped in uncontrolled sites, 51 Mt uncollected. Middle-income countries account for 87% of all mismanaged plastics.",
    sources: [WB_REPORT, OECD_PLAST],
  },
  {
    id: "plastics_single_use",
    category: "Plastics",
    metric: "Single-use plastics share",
    value: "65% of municipal solid waste plastics (208 million tonnes/year)",
    year: "2022",
    status: "confirmed",
    note: "Section 2.7. Packaging and single-use convenience items represent nearly two-thirds of plastic entering municipal streams.",
    sources: [WB_REPORT],
  },
  {
    id: "rivers_cleanup",
    category: "Plastics",
    metric: "Riverine plastic emissions to the ocean",
    value: "0.8 to 2.7 Mt/year carried to the oceans; >1,000 rivers cause 80%",
    year: "2021 study",
    status: "confirmed",
    note: "Meijer et al. (Science Advances 2021). Modeled terrestrial-marine interface.",
    sources: [{ label: "The Ocean Cleanup: 1,000 Rivers Study", url: "https://theoceancleanup.com/scientific-publications/more-than-1000-rivers-account-for-80-of-global-riverine-plastic-emissions-into-the-ocean/", publisher: true }],
  },

  // ---- Benchmarks ----
  {
    id: "eu_eurostat",
    category: "Regional benchmarks",
    metric: "EU municipal waste per capita and recycling rate",
    value: "517 kg per person; 48.0% recycled and composted",
    year: "2024",
    status: "confirmed",
    note: "Eurostat official data release (January 2026). Material recycling plus biowaste composting/digestion. Landfilling in the EU has dropped by >60% since 1995.",
    sources: [EUROSTAT],
  },
  {
    id: "us_epa",
    category: "Regional benchmarks",
    metric: "US municipal solid waste and recycling/composting rate",
    value: "292.4 million tons; 4.9 lb/capita/day; 32.1% recycled/composted",
    year: "2018",
    status: "confirmed",
    note: "US EPA Facts and Figures national overview. 50% landfilled, 11.8% combusted with energy recovery, 32.1% recycled/composted.",
    sources: [EPA_FACTS],
  },
  {
    id: "ewaste_global",
    category: "Electronic waste",
    metric: "Global e-waste generated and documented recycling",
    value: "62 million tonnes (7.8 kg/person) / 22.3% documented recycled",
    year: "2022",
    status: "confirmed",
    note: "UNITAR/ITU Global E-waste Monitor 2024. Projected to reach 82 Mt by 2030 (+33%), with recycling rates lagging.",
    sources: [UNITAR_EW],
  },
  {
    id: "food_unep",
    category: "Food waste",
    metric: "Food wasted globally",
    value: "1.05 billion tonnes (19% of all food available to consumers)",
    year: "2022",
    status: "confirmed",
    note: "UNEP Food Waste Index Report 2024. 132 kg per person; households account for 60%, food service 28%, retail 12%.",
    sources: [UNEP_FOOD],
  },
];

export function statusCounts(): Record<Status, number> {
  const c: Record<Status, number> = { confirmed: 0, single: 0, conflicting: 0, derived: 0, estimate: 0 };
  for (const e of REGISTER) c[e.status]++;
  return c;
}

export const MODEL_ASSUMPTIONS: Entry[] = [
  {
    id: "gmax",
    category: "Model assumptions",
    metric: "Maximum realistic pace of annual recycling gain",
    value: "2.5 percentage points / year (user-adjustable)",
    year: "n/a",
    status: "estimate",
    note: "Calibrated to historical best-in-class multi-year national transitions (e.g. South Korea, Germany, Wales).",
    sources: [],
  },
  {
    id: "weights",
    category: "Model assumptions",
    metric: "Material-specific recoverability weighting",
    value: "Empirical sorting and processing yield indices (metals 2.2, paper 1.6, glass 1.5, plastics 0.5)",
    year: "n/a",
    status: "estimate",
    note: "Reflects commercial sorting infrastructure efficiency and mechanical reprocessing yields.",
    sources: [],
  },
  {
    id: "swarm",
    category: "Model assumptions",
    metric: "Swarm agent-based simulation parameters",
    value: "Neighbourhood coupling, echo chamber factor, and policy amplification",
    year: "n/a",
    status: "estimate",
    note: "Stochastic micro-agent decision model simulating household peer-effects and local social norms.",
    sources: [],
  },
];

