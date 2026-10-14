// Register of every external figure used or shown, with its sources and an honest verification status.
//
// How to read the statuses:
//   confirmed   - two or more independent published sources report the same figure
//   single      - only one source found (including figures published exclusively in What a Waste 3.0)
//   conflicting - sources or report tables disagree (the note says how); do not treat either as settled
//   derived     - calculated by this project from sourced inputs
//   estimate    - project assumption or user lever, not a published measurement
//
// Primary reference:
// Cook, E., Ionkova, K., Bhada-Tata, P., Yadav, S., and van Woerden, F. (2026).
// "What a Waste 3.0: Global Snapshot of Solid Waste Management Toward Circularity until 2050."
// World Bank Group Urban Development Series. Washington, DC. DOI: 10.1596/978-1-4648-2309-1.
// Verified against the primary publication (384 pages, handle: 10986/44141).

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

export const CHECKED_ON = "14 October 2026 (cross-referenced against What a Waste 3.0 primary publication)";

export const STATUS_LABEL: Record<Status, string> = {
  confirmed: "Confirmed by 2+ sources",
  single: "Single source",
  conflicting: "Sources conflict",
  derived: "Derived by this project",
  estimate: "Project estimate / lever",
};

// Sources
const WB_REPORT: Src = { label: "World Bank: What a Waste 3.0 (Cook et al. 2026)", url: "https://hdl.handle.net/10986/44141", publisher: true };
const WB_BRIEF: Src = { label: "World Bank: What a Waste 3.0 brief", url: "https://www.worldbank.org/en/brief/2026/03/26/what-a-waste-3", publisher: true };
const WB_DATA: Src = { label: "World Bank Data360: What a Waste dataset", url: "https://data360.worldbank.org/en/dataset/WB_WAW", publisher: true };
const IMPERIAL: Src = { label: "Imperial College news", url: "https://www.imperial.ac.uk/news/articles/admin-services/enterprise/2026/global-waste-to-hit-nearly-4-billion-tonnes-a-year-by-2050-world-bank-group-report-warns/" };
const WASTEDIVE: Src = { label: "Waste Dive", url: "https://www.wastedive.com/news/global-waste-generation-to-rise-by-2050-world-bank/816473/" };
const CONVERSATION: Src = { label: "The Conversation", url: "https://theconversation.com/the-worlds-waste-mountain-is-rising-at-an-alarming-rate-278627" };
const ALTIOREM: Src = { label: "Altiorem summary of What a Waste 3.0", url: "https://altiorem.org/research/what-a-waste-3-0-global-snapshot-of-solid-waste-management-toward-circularity-until-2050/" };
const EUROSTAT: Src = { label: "Eurostat: Municipal waste statistics (2024 data)", url: "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Municipal_waste_statistics", publisher: true };
const EPA_FACTS: Src = { label: "US EPA: National overview (2018 data)", url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/national-overview-facts-and-figures-materials", publisher: true };
const OECD_PLAST: Src = { label: "OECD: Global Plastics Outlook", url: "https://www.oecd.org/en/publications/global-plastics-outlook_de747aef-en.html", publisher: true };
const UNITAR_EW: Src = { label: "UNITAR/ITU: Global E-waste Monitor 2024", url: "https://unitar.org/about/news-stories/press/global-e-waste-monitor-2024-electronic-waste-rising-five-times-faster-documented-e-waste-recycling", publisher: true };
const UNEP_FOOD: Src = { label: "UNEP: Food Waste Index Report 2024", url: "https://www.unep.org/resources/publication/unep-food-waste-index-report-2024", publisher: true };
const UNEP_GWMO: Src = { label: "UNEP: Global Waste Management Outlook 2024", url: "https://www.unep.org/resources/global-waste-management-outlook-2024", publisher: true };
const CLEANUP: Src = { label: "The Ocean Cleanup: 1,000 Rivers Study", url: "https://theoceancleanup.com/scientific-publications/more-than-1000-rivers-account-for-80-of-global-riverine-plastic-emissions-into-the-ocean/", publisher: true };

export const REGISTER: Entry[] = [
  // ---- Global municipal solid waste ----
  {
    id: "gen2022",
    category: "Global municipal waste",
    metric: "Global municipal solid waste generated",
    value: "2,562 million tonnes (2.56 billion tonnes)",
    year: "2022",
    status: "confirmed",
    note: "Used as the model's 2022 starting total. Reported in What a Waste 3.0 Table 2.1 and confirmed by independent press summaries (Imperial College, Waste Dive, The Conversation). Surpassed the 2018 report's 2030 projection of 2.59 Bt 8 years early due to improved capture of uncollected and non-household waste.",
    sources: [WB_REPORT, WB_BRIEF, IMPERIAL, WASTEDIVE, CONVERSATION],
  },
  {
    id: "gen2050",
    category: "Global municipal waste",
    metric: "Projected generation by 2050 (Business as usual)",
    value: "3,855 million tonnes (3.86 billion tonnes, +50%)",
    year: "2050",
    status: "confirmed",
    note: "Used as the model's 2050 baseline. Reported in What a Waste 3.0 Table 4.1 and Figure 4.1, and confirmed by multiple independent outlets (Imperial College, Waste Dive, The Conversation).",
    sources: [WB_REPORT, WB_BRIEF, IMPERIAL, WASTEDIVE, CONVERSATION],
  },
  {
    id: "scenarios_2050",
    category: "Global municipal waste",
    metric: "Alternative policy scenarios for 2050",
    value: "Low ambition: 3.12 to 3.21 Bt (+25%) · High ambition: 2.56 Bt (0% growth, capped at 2022 level)",
    year: "2050",
    status: "conflicting",
    note: "Sources and report tables disagree slightly on low ambition: Table 4.1 and chapter text (p. 117) state 3.21 billion tonnes (+25%), while Figure 4.1 bar chart labels it as 3,119 Mt (3.12 billion tonnes). High ambition is consistently stated as holding generation near 2.56 Bt (0% growth).",
    sources: [WB_REPORT, ALTIOREM],
  },
  {
    id: "percap",
    category: "Global municipal waste",
    metric: "Waste per person",
    value: "0.88 kg/day global mean; North America 2.25 kg/day; South Asia 0.49 kg/day; Sub-Saharan Africa 0.52 kg/day",
    year: "2022",
    status: "single",
    note: "What a Waste 3.0 Figure 2.1f and p. 15. The 0.88 kg/day figure is from this single study.",
    sources: [WB_REPORT, ALTIOREM],
  },
  {
    id: "recovery",
    category: "Global municipal waste",
    metric: "Share recovered (recycling and composting)",
    value: "21.4% (about 548 million tonnes)",
    year: "2022",
    status: "single",
    note: "What a Waste 3.0 Figure S.3 reports 15% recycling and 6% composting & anaerobic digestion (summing to 21%). Across regional treatment tables, the weighted sum is 548 Mt (21.39%). Single source; UNEP 2024 reported 19% for 2020.",
    sources: [WB_REPORT, ALTIOREM],
  },
  {
    id: "mix",
    category: "Global municipal waste",
    metric: "Where waste goes: landfill / materials recovery / incineration / dumpsite / uncollected",
    value: "29% landfill (17% sanitary, 12% controlled) / 21% materials recovery / 20% incineration with energy / 13% dumpsites / 17% uncollected",
    year: "2022",
    status: "single",
    note: "What a Waste 3.0 Figure S.3 (p. 3). Dumpsites (13%) + uncollected (17%) total 30% mismanaged waste. Single institutional source.",
    sources: [WB_REPORT, ALTIOREM],
  },
  {
    id: "regional",
    category: "Global municipal waste",
    metric: "Regional generation and recovery across 7 World Bank regions",
    value: "EAP: 849 Mt (19.4% recov) · ECA: 415 Mt (34.2%) · SA: 346 Mt (21.4%) · NA: 311 Mt (41.8%) · LAC: 249 Mt (6.8%) · SSA: 231 Mt (2.6%) · MENA: 161 Mt (8.7%)",
    year: "2022 and 2050",
    status: "single",
    note: "From What a Waste 3.0 Chapter 2 (Figure 2.1b), Chapter 3 (regional treatment figures 3.5, 3.11, 3.16, 3.22, 3.25, 3.30, 3.36), and Chapter 4 (Figure 4.1). Note on SSA growth: generation grows from 231 Mt (2022) to 518 Mt (2050) under BAU, which is +124.2% (matching the +124% stated in the text; Figure 2.7 bar labels). Marked 'single' because only What a Waste 3.0 reports this specific 7-region breakdown.",
    sources: [WB_REPORT, WB_DATA],
  },
  {
    id: "composition",
    category: "Global municipal waste",
    metric: "Global composition breakdown (13 categories)",
    value: "Food 38.3%, Paper 13.9%, Plastic 12.5%, Garden 8.0%, Glass 4.2%, Metal 3.8%, Inert 3.9%, Textiles 3.6%, Wood 3.0%, WEEE 1.7%, Rubber 1.7%, Diapers 1.8%, Other 3.5%",
    year: "2022",
    status: "single",
    note: "What a Waste 3.0 Figure 2.9 (p. 23). Weighted global mean from national waste audit databases. Total organics (food + garden) equal 46.3%. Note: previous edition (2016 data) reported food and green 44%, paper 17%, plastic 12%. Marked 'single' as it comes from this study's synthesis.",
    sources: [WB_REPORT],
  },
  {
    id: "collection",
    category: "Global municipal waste",
    metric: "Collection rates by country income group",
    value: "High-income: 99% · Upper-middle: 89% · Lower-middle: 61% · Low-income: 28% (urban 42%, rural 5%)",
    year: "2022",
    status: "single",
    note: "What a Waste 3.0 Figure S.2 (p. 3) and Figure 2.11 (p. 24). Single institutional source.",
    sources: [WB_REPORT],
  },
  {
    id: "unep",
    category: "Global municipal waste",
    metric: "UNEP global waste projection",
    value: "2.1 billion tonnes (2023) to 3.8 billion tonnes (2050)",
    year: "2023 to 2050",
    status: "conflicting",
    note: "UNEP's own report page states 2.1 billion tonnes for 2023, while UNEP-linked press releases state 2.3 billion tonnes. UNEP's baseline is also earlier than the World Bank's 2022 baseline of 2.56 Bt, so the two agencies are not directly comparable.",
    sources: [UNEP_GWMO, { label: "Waste Management World on UNEP", url: "https://waste-management-world.com/resource-use/global-waste-management-outlook-2024/" }],
  },
  {
    id: "cost_financing",
    category: "Economics and jobs",
    metric: "Global municipal waste management operational costs",
    value: "US$ 250+ billion (2022), projected to rise to US$ 426 billion by 2050 under BAU",
    year: "2022 / 2050",
    status: "single",
    note: "What a Waste 3.0 Executive Summary p. 5 and Chapter 7. UNEP 2024 separately estimated direct costs at USD 252 bn and total with hidden externalities at USD 361 bn (2020), rising to USD 640 bn by 2050. The $426B figure is specific to What a Waste 3.0 direct municipal costs.",
    sources: [WB_REPORT, UNEP_GWMO],
  },
  {
    id: "waste_jobs",
    category: "Economics and jobs",
    metric: "Urban waste workforce and informal sector",
    value: "18 million urban waste workers (about 0.3% of global urban population)",
    year: "2022",
    status: "single",
    note: "What a Waste 3.0 Executive Summary p. 5 and Chapter 6 (p. 678). Estimates formal municipal workers and informal waste pickers. Single institutional source.",
    sources: [WB_REPORT],
  },

  // ---- Climate and environment ----
  {
    id: "methane_emissions",
    category: "Climate and energy",
    metric: "Greenhouse gas emissions from solid waste management",
    value: "1.28 billion tonnes CO2e/year (methane: 1.15 Gt CO2e, ~90%)",
    year: "2022",
    status: "single",
    note: "What a Waste 3.0 Executive Summary p. 8 and Chapter 5. Methane accounts for 1.15 Gt CO2e. Projected to rise to 1.84 Gt CO2e by 2050 under BAU. Single source for this specific calculation.",
    sources: [WB_REPORT],
  },
  {
    id: "methane_share",
    category: "Climate and energy",
    metric: "Waste's share of human-caused methane",
    value: "about 20%",
    year: "2020 to 2025 reports",
    status: "confirmed",
    note: "Reported in UNEP/CCAC Global Methane Assessment (2021) and confirmed in UNEP Global Methane Status Report (2025 coverage). Both identify waste as the third largest source after agriculture and energy.",
    sources: [{ label: "UNEP Global Methane Assessment", url: "https://www.unep.org/resources/report/global-methane-assessment-benefits-and-costs-mitigating-methane-emissions", publisher: true }, { label: "Mongabay India on UNEP report", url: "https://india.mongabay.com/2025/11/global-methane-status-report-shows-methane-emissions-rising-despite-policy-progress/amp/" }],
  },
  {
    id: "energy_savings",
    category: "Climate and energy",
    metric: "Energy saved by recycling vs virgin production",
    value: "Aluminum ~95%; steel 60–74%; paper ~40%; plastic 33% to 76%",
    year: "EPA / literature",
    status: "conflicting",
    note: "Plastic figures vary by polymer and process: EPA WasteWise factoid cites 33% average, whereas life-cycle assessments for sorted rPET bottles report up to 76%. Aluminum (95%) and steel (60-74%) are widely corroborated.",
    sources: [{ label: "US EPA WasteWise (archived)", url: "https://archive.epa.gov/epawaste/conserve/smm/wastewise/web/html/factoid.html", publisher: true }],
  },

  // ---- Plastics ----
  {
    id: "plastics_mismanaged",
    category: "Plastics",
    metric: "Mismanaged plastic waste",
    value: "93 million tonnes/year (28.8% of all plastic waste)",
    year: "2022",
    status: "single",
    note: "What a Waste 3.0 Section 2.7 (p. 4). 42 Mt dumped in uncontrolled sites, 51 Mt uncollected. Middle-income countries generate 87% of all mismanaged plastics.",
    sources: [WB_REPORT],
  },
  {
    id: "plastics_single_use",
    category: "Plastics",
    metric: "Single-use plastics share of municipal plastic waste",
    value: "65% (about 208 million tonnes/year)",
    year: "2022",
    status: "single",
    note: "What a Waste 3.0 Section 2.7 (p. 4). Single source.",
    sources: [WB_REPORT],
  },
  {
    id: "plastwaste_oecd",
    category: "Plastics",
    metric: "Global total plastic waste and treatment split",
    value: "353 Mt (2019); 9% recycled, 19% incinerated, 50% landfilled, 22% mismanaged",
    year: "2019",
    status: "confirmed",
    note: "OECD Global Plastics Outlook. Confirmed across multiple independent reviews (OECD, Circular Online, IISD). Covers all plastic sectors, not only municipal solid waste.",
    sources: [OECD_PLAST, { label: "Circular Online", url: "https://www.circularonline.co.uk/news/9-of-global-plastic-waste-is-recycled-while-22-is-mismanaged-oecd/" }],
  },
  {
    id: "rivers_cleanup",
    category: "Plastics",
    metric: "Riverine plastic emissions to the ocean",
    value: "0.8 to 2.7 Mt/year; over 1,000 rivers account for 80%",
    year: "2021 study",
    status: "confirmed",
    note: "Meijer et al. (Science Advances 2021). Model estimate with wide confidence intervals. Confirmed across The Ocean Cleanup and FAO AGRIS records.",
    sources: [CLEANUP, { label: "FAO AGRIS record", url: "https://agris.fao.org/search/en/records/669f725800eb85b7d72d0c38" }],
  },

  // ---- Electronics & Scope Discrepancy ----
  {
    id: "ewaste_global",
    category: "Electronic waste",
    metric: "Global e-waste generated vs municipal audit share",
    value: "62 Mt total generated (UNITAR/ITU 2022) vs ~44 Mt in municipal solid waste audits (1.7% of 2.56 Bt)",
    year: "2022",
    status: "conflicting",
    note: "Scope discrepancy: UNITAR/ITU Global E-waste Monitor measures ALL electrical/electronic waste generated across households, businesses, and industry (62 Mt in 2022; 7.8 kg/person; 22.3% documented recycled). In contrast, municipal solid waste characterization audits (What a Waste 3.0 Figure 2.9) only capture small consumer electronics thrown into municipal bins (1.7% of 2.56 Bt = ~43.5 Mt). The remaining ~18.5 Mt flows through commercial/industrial channels or scrap metal yards.",
    sources: [UNITAR_EW, WB_REPORT],
  },

  // ---- Food waste ----
  {
    id: "food_unep",
    category: "Food waste",
    metric: "Food wasted globally",
    value: "1.05 billion tonnes (19% of all food available to consumers); 132 kg/person",
    year: "2022",
    status: "confirmed",
    note: "UNEP Food Waste Index Report 2024. Confirmed across multiple international portals (UNEP, IISD, NDC Partnership). Households account for 60%, food service 28%, retail 12%.",
    sources: [UNEP_FOOD, { label: "IISD SDG Knowledge Hub", url: "https://sdg.iisd.org/?p=725726" }],
  },

  // ---- Wastewater ----
  {
    id: "wastewater",
    category: "Water",
    metric: "Household wastewater safely treated",
    value: "58% (2022) vs 56% (2020 SDG 6 portal)",
    year: "2020 to 2024",
    status: "conflicting",
    note: "UN SDG 6 Extended Report (2024) cites 58%, while UN-Water's previous update and the SDG 6 data portal cite 56%. About 40-44% of domestic wastewater is discharged without safe treatment.",
    sources: [{ label: "UN SDG 6 Extended Report 2024", url: "https://unstats.un.org/sdgs/report/2024/extended-report/Extended-Report_Goal-6.pdf", publisher: true }, { label: "SDG 6 Data portal", url: "https://www.sdg6data.org/en/indicator/6.3.1", publisher: true }],
  },

  // ---- Regional Benchmarks ----
  {
    id: "eu_eurostat",
    category: "Regional benchmarks",
    metric: "EU municipal waste per person and recycling rate",
    value: "517 kg per person; 48.0% recycled and composted",
    year: "2024",
    status: "confirmed",
    note: "Eurostat official data release (January 2026). Confirmed by trade press (Recycling Magazine, Eunews, Brussels Times). Material recycling plus biowaste composting.",
    sources: [EUROSTAT, { label: "Recycling Magazine", url: "https://www.recycling-magazine.com/26752/517-kg-municipal-waste-per-capita-in-2024" }],
  },
  {
    id: "us_epa",
    category: "Regional benchmarks",
    metric: "US municipal solid waste and recycling/composting rate",
    value: "292.4 million tons; 4.9 lb/capita/day; 32.1% recycled/composted",
    year: "2018",
    status: "single",
    note: "Only one source is listed (EPA itself), so this is not marked confirmed. US EPA Facts and Figures national overview (published Dec 2020 using 2018 data). Newest official national release from EPA. 50% landfilled, 11.8% combusted with energy recovery, 32.1% recycled/composted.",
    sources: [EPA_FACTS],
  },

  // ---- Recycling pace benchmarks ----
  {
    id: "pace_eu_recent",
    category: "Recycling pace benchmarks",
    metric: "EU-27 average yearly gain in the municipal recycling rate",
    value: "about +0.5 points a year (43.0% in 2014 to 48.1% in 2024)",
    year: "2014 to 2024",
    status: "derived",
    note: "Pace calculated here from Eurostat's rates as reported by the press: 48.1% (2024) and 48.0% (2023) are in several reports, but the 2014 figure of 43.0% appears in only one (Brussels Times). An earlier Eurostat release gave 37.2% for 2013 and 48.0% for 2023 (about +1.1 a year), so revisions to the method change the answer. I did not read the Eurostat table itself.",
    sources: [
      { label: "Eurostat news, 30 March 2026", url: "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260330-1", publisher: true },
      { label: "Brussels Times", url: "https://www.brusselstimes.com/eu-affairs/2052523/eu-municipal-waste-hits-517-kg-per-capita-as-trends-worsen/" },
      { label: "Recycling Magazine", url: "https://www.recycling-magazine.com/26752/517-kg-municipal-waste-per-capita-in-2024" },
    ],
  },
  {
    id: "pace_eu_2004",
    category: "Recycling pace benchmarks",
    metric: "EU yearly gain in the municipal recycling rate, earlier decade",
    value: "about +1.3 points a year (30% in 2004 to 43% in 2014)",
    year: "2004 to 2014",
    status: "single",
    note: "European Environment Agency briefing for the EU-28, which counts material recycling, composting and digestion and excludes Croatia in 2004 to 2006. It uses an older definition than the 2014 to 2024 figures above, so the two decades are not strictly comparable.",
    sources: [{ label: "EEA: Recycling of municipal waste (2016)", url: "https://www.eea.europa.eu/airs/2016/resource-efficiency-and-low-carbon-economy/recycling-of-municipal-waste", publisher: true }],
  },
  {
    id: "pace_poland",
    category: "Recycling pace benchmarks",
    metric: "Poland: fast national gain",
    value: "about +2.7 points a year (5% in 2004 to 21% in 2010)",
    year: "2004 to 2010",
    status: "single",
    note: "European Environment Agency country assessment. Counts material and organic recycling only, and the EEA warns that coverage of the data changed over the period. Six years only, starting from a very low base.",
    sources: [{ label: "EEA: Municipal waste management in Poland", url: "https://www.eea.europa.eu/publications/managing-municipal-solid-waste/poland-municipal-waste-management", publisher: true }],
  },
  {
    id: "pace_slovenia",
    category: "Recycling pace benchmarks",
    metric: "Slovenia: fastest sustained national gain found",
    value: "about +2.5 points a year (3% in 2001 to 36% in 2014)",
    year: "2001 to 2014",
    status: "single",
    note: "EIONET country profile using national reporting. A second table I found (source not identified, so not linked) gives 21.9% in 2007 and 59.8% in 2023, about +2.4 a year, which fits. Eurostat and national figures for Slovenia differ by methodology (Eurostat showed 37% already in 2008 in an EEA profile), so the pace is approximate. Thirteen years from a very low base in a small country.",
    sources: [{ label: "EIONET: Slovenia municipal waste country profile (2016)", url: "https://www.eionet.europa.eu/etcs/etc-ce/products/country-profiles-on-the-management-of-municipal-waste-1/slovenia_msw_2016.pdf", publisher: true }],
  },

  // ---- Wildlife ----
  {
    id: "redlist",
    category: "Wildlife",
    metric: "Species on the IUCN Red List / threatened with extinction",
    value: "175,909 assessed / 49,505 threatened",
    year: "2026 update",
    status: "single",
    note: "Reported by educational current affairs releases for the 2026 update. The 2024 IUCN update had ~163,000 assessed and ~45,000 threatened.",
    sources: [{ label: "Chronicle India", url: "https://www.chronicleindia.in/online-magazine/csce-september-2026/iucn-red-list-2026-update" }],
  },
  {
    id: "monk",
    category: "Wildlife",
    metric: "Marine mammals most vulnerable to macroplastic",
    value: "Hawaiian monk seal ranked first; African manatee, Australian sea lion, vaquita and Mediterranean monk seal also in top five",
    year: "2026 study",
    status: "confirmed",
    note: "Ocean Conservancy study (April 2026). Confirmed by multiple science reports (Ocean Conservancy, Maui Now, Science Africa). Ranks vulnerability to plastic only, not extinction date.",
    sources: [{ label: "Ocean Conservancy press release", url: "https://oceanconservancy.org/newsroom/press-release/2026/04/15/news-new-study-ranks-hawaiian-monk-seal-as-marine-mammal-most-at-risk-of-extinction-from-plastic-pollution/", publisher: true }, { label: "Maui Now", url: "https://mauinow.com/2026/04/16/new-study-ranks-hawaiian-monk-seal-as-marine-mammal-most-at-risk-from-plastic-pollution/" }],
  },
];

export function statusCounts(): Record<Status, number> {
  const c: Record<Status, number> = { confirmed: 0, single: 0, conflicting: 0, derived: 0, estimate: 0 };
  for (const e of REGISTER) c[e.status]++;
  for (const a of MODEL_ASSUMPTIONS) c[a.status]++;
  return c;
}

export const MODEL_ASSUMPTIONS: Entry[] = [
  {
    id: "co2e_scaling",
    category: "Model assumptions",
    metric: "Climate figure in the Impact panel (CO2e from waste)",
    value: "Food and garden waste that is not recovered, times 1.16 t CO2e per tonne",
    year: "2022 to 2050",
    status: "derived",
    note: "The factor 1.16 is set so the model's 2022 result (about 1,140 Mt CO2e) matches the 1.15 Gt CO2e methane figure in the methane_emissions entry. It is a single calibration factor, not a measured emission factor, and it ignores differences between landfill types, gas capture and climate. The earlier code comment cited page 831 of the report, which cannot be right for a 384-page report; the page reference now points to the methane_emissions entry, whose own page numbers I could not check.",
    sources: [WB_REPORT],
  },
  {
    id: "cost_trajectory",
    category: "Model assumptions",
    metric: "Municipal operating cost shown in the Impact panel",
    value: "Business-as-usual cost interpolated between US$250B (2022) and US$426B (2050), scaled by this scenario's waste relative to business as usual",
    year: "2022 to 2050",
    status: "derived",
    note: "Assumes cost moves in proportion to tonnes handled. Real costs also depend on collection coverage and treatment mix, which this scaling ignores. Both endpoints come from the single-source cost_financing entry. Replaces an earlier unsourced US$45 per tonne figure.",
    sources: [WB_REPORT],
  },
  {
    id: "gmax",
    category: "Model assumptions",
    metric: "Maximum realistic pace of annual recycling gain",
    value: "2.5 percentage points a year (slider default, adjustable)",
    year: "n/a",
    status: "estimate",
    note: "A judgement, not a forecast. 2.5 matches the fastest sustained national gains found in the pace_slovenia and pace_poland entries (about 2.4 to 2.7 points a year). Those countries started from 3 to 5% and are small, so a global pace this fast is not guaranteed. The EU as a whole managed 0.5 to 1.3 points a year (pace_eu_recent, pace_eu_2004). No source gives a pace for the world as a whole.",
    sources: [],
  },
  {
    id: "weights",
    category: "Model assumptions",
    metric: "How easily each material is recovered (recoverability indices)",
    value: "Illustrative weights (metals 2.2, paper 1.6, glass 1.5, plastics 0.5)",
    year: "n/a",
    status: "estimate",
    note: "Project assumption to distribute global recycling gains across material types proportionally to typical sorting efficiencies.",
    sources: [],
  },
  {
    id: "swarm",
    category: "Model assumptions",
    metric: "Swarm micro-agent model parameters (neighbour influence, noise, herd effect)",
    value: "Default parameters (agents=150/region, echo=0.3, herd=0.5)",
    year: "n/a",
    status: "estimate",
    note: "Plausible micro-simulation defaults for household peer imitation. Not empirically fitted to survey data.",
    sources: [],
  },
];
