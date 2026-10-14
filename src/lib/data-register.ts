// Register of every external figure used or shown, with its sources and a verification status.
//
// How to read the statuses (assigned by me on 14 Oct 2026):
//   confirmed   - two or more independent published sources report the same figure
//   single      - only one source found
//   conflicting - sources disagree (the note says how); do not treat either as settled
//   derived     - calculated by this project from sourced inputs
//   estimate    - my own assumption, not a published number
//
// Limit: from the build environment I could not open the publishers' own documents (network policy blocks
// worldbank.org, unep.org, epa.gov, iucnredlist.org, arxiv.org and others), so "confirmed" means several
// independent reports agree, not that I read the original table. Links marked `publisher` go to the original publisher.

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

export const CHECKED_ON = "14 October 2026";

export const STATUS_LABEL: Record<Status, string> = {
  confirmed: "Confirmed by 2+ sources",
  single: "Single source",
  conflicting: "Sources conflict",
  derived: "Derived by this project",
  estimate: "Project estimate",
};

const WB_BRIEF: Src = { label: "World Bank: What a Waste 3.0 brief", url: "https://www.worldbank.org/en/brief/2026/03/26/what-a-waste-3", publisher: true };
const WB_DATA: Src = { label: "World Bank Data360: What a Waste dataset", url: "https://data360.worldbank.org/en/dataset/WB_WAW", publisher: true };
const IMPERIAL: Src = { label: "Imperial College news", url: "https://www.imperial.ac.uk/news/articles/admin-services/enterprise/2026/global-waste-to-hit-nearly-4-billion-tonnes-a-year-by-2050-world-bank-group-report-warns/" };
const WASTEDIVE: Src = { label: "Waste Dive", url: "https://www.wastedive.com/news/global-waste-generation-to-rise-by-2050-world-bank/816473/" };
const CONVERSATION: Src = { label: "The Conversation", url: "https://theconversation.com/the-worlds-waste-mountain-is-rising-at-an-alarming-rate-278627" };
const ALTIOREM: Src = { label: "Altiorem summary of What a Waste 3.0", url: "https://altiorem.org/research/what-a-waste-3-0-global-snapshot-of-solid-waste-management-toward-circularity-until-2050/" };
const UDLAP: Src = { label: "UDLAP Observatorio Global summary", url: "https://observatorioglobal.udlap.mx/?p=6134" };
const DONTWASTE: Src = { label: "Dont Waste It (HU) summary", url: "https://dontwasteit.hu/en/world-banks-what-a-waste-3-0/" };
const WAW2: Src = { label: "World Bank: What a Waste 2.0 (2018)", url: "https://openknowledge.worldbank.org/entities/publication/d3f9d45e-115f-559b-b14f-28552410e90a/full", publisher: true };
const UNEP_GWMO: Src = { label: "UNEP: Global Waste Management Outlook 2024", url: "https://www.unep.org/resources/global-waste-management-outlook-2024", publisher: true };

export const REGISTER: Entry[] = [
  // ---- Global municipal solid waste ----
  { id: "gen2022", category: "Global municipal waste", metric: "Global municipal solid waste generated", value: "2.56 billion tonnes", year: "2022", status: "confirmed",
    note: "Used as the model's 2022 starting total. Several outlets round this to 2.6 billion.", sources: [WB_BRIEF, IMPERIAL, WASTEDIVE, CONVERSATION] },
  { id: "gen2050", category: "Global municipal waste", metric: "Projected generation, business as usual", value: "3.86 billion tonnes (+50%)", year: "2050", status: "confirmed",
    note: "Used as the model's 2050 baseline. Same report also gives a low-ambition case of 3.12 billion tonnes (single source) and a high-ambition case that holds waste near today's level.", sources: [WB_BRIEF, IMPERIAL, WASTEDIVE, CONVERSATION] },
  { id: "percap", category: "Global municipal waste", metric: "Waste per person", value: "0.88 kg/day global; North America 2.25 kg/day; Niger about 0.2 kg/day", year: "2022", status: "single",
    note: "Reported by one summary of the report; not used in the model.", sources: [ALTIOREM] },
  { id: "recovery", category: "Global municipal waste", metric: "Share recovered (recycling and composting)", value: "21%", year: "2022", status: "single",
    note: "Used as the model's starting recovery rate. Seen in one secondary summary only (another search result also quoted 21% without naming the page). The previous edition reported about 19% for 2016; UNEP's 2024 outlook reported 19% for 2020 (single secondary source). The report does not split recycling from composting in anything I found.", sources: [ALTIOREM] },
  { id: "mix", category: "Global municipal waste", metric: "Where waste goes: landfill / materials recovery / incineration with energy / dumped or uncollected", value: "29% / 21% / 20% / 30%", year: "2022", status: "single",
    note: "The 30% unmanaged share appears in several places, but the World Bank's key findings word it as 'approximately one-third'. Treat 30 to 33% as the range. The four-way split itself is from one summary.", sources: [ALTIOREM, WB_BRIEF] },
  { id: "mismanaged", category: "Global municipal waste", metric: "Mismanaged waste", value: "about 760 million tonnes, flat to 2050 while its share falls from about 30% to about 20%", year: "2022 to 2050", status: "single", note: "Appeared in coverage of the report; I could not tell which page carried it, so only the World Bank brief is linked.", sources: [WB_BRIEF] },
  { id: "composition", category: "Global municipal waste", metric: "Composition", value: "Food 38%; plastics 12.5% (65% of that single-use)", year: "2022", status: "conflicting",
    note: "Only one summary gives the 2022 mix. The previous edition (2016 data) reported food and green 44%, paper 17%, plastic 12%, glass 5%, metal 4%, wood 2%, rubber 2%, other 14%. The model uses 38% and 12.5% and splits the remaining 49.5% in the 2016 proportions, so paper, glass, metal, wood, rubber and other are derived, not published.", sources: [DONTWASTE, WAW2] },
  { id: "income", category: "Global municipal waste", metric: "High-income countries: share of population vs share of waste", value: "16% of people, 29% of waste", year: "2022", status: "confirmed", sources: [ALTIOREM, UDLAP] },
  { id: "collection", category: "Global municipal waste", metric: "Low-income countries: waste collected / waste in controlled facilities", value: "28% / 3%", year: "2022", status: "single", sources: [ALTIOREM] },
  { id: "growth", category: "Global municipal waste", metric: "Fastest regional growth to 2050", value: "Sub-Saharan Africa +124%, South Asia +99%", year: "2022 to 2050", status: "single",
    note: "One summary gave these percentages; a second search could not confirm them, though several sources agree the two regions grow fastest. Not used in the model.", sources: [WB_BRIEF] },
  { id: "regional", category: "Global municipal waste", metric: "Regional generation and recovery for the seven World Bank regions", value: "Derived (see note)", year: "2022 and 2050", status: "derived",
    note: "I could not read the regional tables of What a Waste 3.0. The model takes the regional shape from What a Waste 2.0 and rescales it to the 2022 and 2050 world totals above. Regional recovery rates are my estimates calibrated to the 21% global figure. As a cross-check, the derived growth to 2050 is about +139% for Sub-Saharan Africa and +71% for South Asia, against the reported +124% and +99% (single source), so the regional split is rough and the global totals are the reliable part. Replace with the Data360 dataset when it can be read.", sources: [WAW2, WB_DATA] },
  { id: "unep", category: "Global municipal waste", metric: "UNEP projection", value: "2.1 billion tonnes (2023) to 3.8 billion tonnes (2050)", year: "2023 to 2050", status: "conflicting",
    note: "UNEP's own page says 2.1 billion tonnes for 2023; UNEP-linked press releases say 2.3. UNEP's baseline year is also earlier than the World Bank's 2022 figure of 2.56, so the two agencies are not directly comparable.", sources: [UNEP_GWMO, { label: "Waste Management World", url: "https://waste-management-world.com/resource-use/global-waste-management-outlook-2024/" }] },
  { id: "cost", category: "Global municipal waste", metric: "Cost of waste management", value: "USD 252 bn direct, USD 361 bn with hidden costs (2020); about USD 640 bn by 2050 without action", year: "2020 / 2050", status: "single", note: "Quoted from UNEP's report page.", sources: [UNEP_GWMO] },

  // ---- Benchmarks ----
  { id: "eu", category: "Regional benchmarks", metric: "EU municipal waste per person and recycling rate", value: "517 kg per person; 48.1% recycled (248 kg)", year: "2024", status: "confirmed",
    note: "2023 was 511 kg and 48.0%. Some country figures in the release (for example Austria, Romania) are 2023 data. Reported from Eurostat by trade press; I did not read the Eurostat table.", sources: [{ label: "Recycling Magazine", url: "https://www.recycling-magazine.com/26752/517-kg-municipal-waste-per-capita-in-2024" }, { label: "Eunews", url: "https://www.eunews.it/en/2026/03/30/in-2024-the-amount-of-waste-per-european-will-rise-to-517-kg-a-6-kg-increase-compared-to-2023/" }, { label: "Brussels Times", url: "https://www.brusselstimes.com/eu-affairs/2052523/eu-municipal-waste-hits-517-kg-per-capita-as-trends-worsen/" }] },
  { id: "us", category: "Regional benchmarks", metric: "US municipal solid waste and recycling plus composting rate", value: "292.4 million tons; 4.9 lb per person per day; 32.1%", year: "2018", status: "confirmed",
    note: "This is the newest national figure I could find. EPA's last Facts and Figures fact sheet was published in 2020 using 2018 data, so it is old; a newer release may exist that I could not find.", sources: [{ label: "US EPA: National overview", url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/national-overview-facts-and-figures-materials", publisher: true }, { label: "US EPA: 2018 fact sheet (PDF)", url: "https://www.epa.gov/sites/default/files/2021-01/documents/2018_ff_fact_sheet_dec_2020_fnl_508.pdf", publisher: true }] },

  // ---- Plastics ----
  { id: "plastwaste", category: "Plastics", metric: "Global plastic waste and what happens to it", value: "353 Mt; about 9% recycled, 19% incinerated, about 50% landfilled, 22% mismanaged", year: "2019", status: "confirmed",
    note: "OECD figures. Some coverage describes the shares loosely, so treat them as approximate.", sources: [{ label: "OECD Global Plastics Outlook", url: "https://www.oecd.org/en/publications/global-plastics-outlook_de747aef-en/full-report/component-5", publisher: true }, { label: "Circular Online", url: "https://www.circularonline.co.uk/news/9-of-global-plastic-waste-is-recycled-while-22-is-mismanaged-oecd/" }, { label: "IISD SDG Knowledge Hub", url: "https://sdg.iisd.org/news/global-plastic-outlook-calls-for-more-circularity-national-roadmaps/" }] },
  { id: "leak", category: "Plastics", metric: "Plastic leaking into the environment / into rivers, lakes and oceans", value: "22 Mt / 6.1 Mt", year: "2019", status: "single", sources: [{ label: "OECD Global Plastics Outlook", url: "https://www.oecd.org/en/publications/global-plastics-outlook_de747aef-en/full-report/component-5", publisher: true }] },
  { id: "plastprod", category: "Plastics", metric: "Global plastics production", value: "430.9 Mt (+4.1%)", year: "2024", status: "confirmed", sources: [{ label: "Polyform Next on Plastics Europe", url: "https://www.polyformnext.de/news-en/images/warning-of-domino-effectPlastics-Europe-sounds-the-alarm--plastics-production-falls-again-1.htm" }, { label: "ETMM", url: "https://www.etmm-online.com/global-plastics-industry-growth-innovation-plastpol-exhibition-a-540e32e1183bfc605c199524af9c6d94/" }] },
  { id: "rivers", category: "Plastics", metric: "Plastic carried to the ocean by rivers", value: "0.8 to 2.7 Mt a year; over 1,000 rivers cause 80%", year: "2021 study", status: "confirmed",
    note: "A model estimate with wide uncertainty, not a measurement. It excludes plastic reaching the sea by other routes.", sources: [{ label: "The Ocean Cleanup", url: "https://theoceancleanup.com/scientific-publications/more-than-1000-rivers-account-for-80-of-global-riverine-plastic-emissions-into-the-ocean/", publisher: true }, { label: "Plastic Bank", url: "https://rivers.plasticbank.com/statistics/global-totals" }, { label: "FAO AGRIS record", url: "https://agris.fao.org/search/en/records/669f725800eb85b7d72d0c38" }] },

  // ---- Electronics ----
  { id: "ewaste", category: "Electronic waste", metric: "E-waste generated / formally collected and recycled", value: "62 Mt (7.8 kg per person) / 22.3%", year: "2022", status: "confirmed",
    note: "Projected to reach 82 Mt by 2030 (the report's 'on track' scenario).", sources: [{ label: "UNITAR: Global E-waste Monitor 2024", url: "https://unitar.org/about/news-stories/press/global-e-waste-monitor-2024-electronic-waste-rising-five-times-faster-documented-e-waste-recycling", publisher: true }, { label: "Down To Earth", url: "https://www.downtoearth.org.in/waste/humanity-produced-62-billion-kg-of-e-waste-in-2022-in-2030-that-number-will-be-82-billion-kg-un-95146" }, { label: "Fortune", url: "https://fortune.com/2024/04/08/world-generated-62-million-tonnes-electronic-waste-year-un-agencies-warn-tech-environment" }] },

  // ---- Food ----
  { id: "food", category: "Food", metric: "Food wasted", value: "1.05 billion tonnes (19% of food available); 132 kg per person; households 60%, food service 28%, retail 12%", year: "2022", status: "confirmed", sources: [{ label: "UNEP Food Waste Index Report 2024", url: "https://www.unep.org/resources/publication/unep-food-waste-index-report-2024", publisher: true }, { label: "NDC Partnership", url: "https://ndcpartnership.org/knowledge-portal/climate-toolbox/food-waste-index-report-2024" }, { label: "IISD SDG Knowledge Hub", url: "https://sdg.iisd.org/?p=725726" }] },

  // ---- Water ----
  { id: "wastewater", category: "Water", metric: "Household wastewater safely treated", value: "58% (2022) vs 56% (2020 and the SDG 6 data portal's latest)", year: "2020 to 2024", status: "conflicting",
    note: "Different years and editions give 56% or 58%; about 40% of domestic wastewater is released without safe treatment. Only 42 countries (12% of people) reported treatment levels for 2022, so global totals are extrapolated.", sources: [{ label: "UN SDG 6 Extended Report 2024", url: "https://unstats.un.org/sdgs/report/2024/extended-report/Extended-Report_Goal-6.pdf", publisher: true }, { label: "UN-Water 2021 update", url: "https://www.unwater.org/node/1730", publisher: true }, { label: "SDG 6 Data portal", url: "https://www.sdg6data.org/en/indicator/6.3.1", publisher: true }] },

  // ---- Climate and energy ----
  { id: "methane", category: "Climate and energy", metric: "Waste's share of human-caused methane", value: "about 20%", year: "2020 to 2025 reports", status: "confirmed",
    note: "UNEP's Global Methane Status Report 2025 coverage gives different splits for agriculture and energy, but both outlets put waste at 20%. A projected 56% rise in waste methane by 2050 appears in one summary only.", sources: [{ label: "Mongabay India on UNEP report", url: "https://india.mongabay.com/2025/11/global-methane-status-report-shows-methane-emissions-rising-despite-policy-progress/amp/" }, { label: "Khan Global Studies summary", url: "https://currentaffairs.khanglobalstudies.com/global-methane-status-report-2025/" }, { label: "BioCycle on 2021 UNEP assessment", url: "https://www.biocycle.net/reducing-human-caused-methane-by-45-by-2030" }] },
  { id: "ghg", category: "Climate and energy", metric: "Waste sector's share of all greenhouse gas emissions", value: "about 3%", year: "2023 report", status: "single", note: "Global Climate and Health Alliance; I could not check its underlying citation.", sources: [{ label: "Global Climate and Health Alliance", url: "https://climateandhealthalliance.org/wp-content/uploads/2023/08/MethaneReport-Waste-FINAL.pdf" }] },
  { id: "energy", category: "Climate and energy", metric: "Energy saved by recycling vs virgin production", value: "Aluminum about 95%; steel 60 to 74%; paper about 40%; plastic about 33% on the EPA page, up to 76% for PET elsewhere", year: "archived EPA page", status: "conflicting",
    note: "The plastic figure differs by source and polymer; the higher number comes from a commercial blog. The EPA page is archived and may be outdated.", sources: [{ label: "US EPA WasteWise factoid (archived)", url: "https://archive.epa.gov/epawaste/conserve/smm/wastewise/web/html/factoid.html", publisher: true }] },

  // ---- Textiles ----
  { id: "textiles", category: "Textiles", metric: "Clothing recycled into new clothing", value: "under 1% of fibre used", year: "around 2017", status: "single", note: "Ellen MacArthur Foundation linked analysis, old but still widely cited.", sources: [{ label: "Ellen MacArthur Foundation reading (PDF)", url: "https://www.sesync.org/sites/default/files/2023-02/MacArthur%20Foundation%20-%20Abbreviated%20Reading.pdf" }] },
  { id: "textvol", category: "Textiles", metric: "Textile waste per year", value: "92 Mt (textile waste) vs 120 Mt discarded clothing (2024 estimate, 150 Mt by 2030)", year: "2024", status: "conflicting", note: "The two figures measure different things and should not be compared.", sources: [{ label: "Kvadrat", url: "https://kvadrat.dk/sv/kvadrat-really/circularity/our-commitment-to-transparency" }, { label: "Galaxus summarising BCG", url: "https://www.galaxus.ch/en/page/120-million-tonnes-of-textile-waste-and-rising-39101" }] },

  // ---- Wildlife ----
  { id: "redlist", category: "Wildlife", metric: "Species on the IUCN Red List / threatened with extinction", value: "175,909 assessed / 49,505 threatened", year: "2026 update", status: "single",
    note: "Reported by two study-guide sites that appear to copy one release; I could not open iucnredlist.org. The 2024 update had about 163,000 assessed and about 45,000 threatened.", sources: [{ label: "Chronicle India", url: "https://www.chronicleindia.in/online-magazine/csce-september-2026/iucn-red-list-2026-update" }, { label: "TNPSC Thervupettagam", url: "https://www.tnpscthervupettagam.com/currentaffairs-detail/iucn-red-list-2026-update/" }] },
  { id: "debris", category: "Wildlife", metric: "Wildlife harmed by marine debris", value: "about 44,000 animals in 340 publications; plastic about 92% of encounters; about 17% of affected species threatened or near threatened", year: "review", status: "confirmed", sources: [{ label: "University of Plymouth", url: "https://www.plymouth.ac.uk/news/new-study-reveals-the-global-impact-of-debris-on-marine-life", publisher: true }, { label: "Conservation Jobs", url: "https://www.conservationjobs.co.uk/articles/marine-debris-affects-hundreds-of-species/" }] },
  { id: "monk", category: "Wildlife", metric: "Marine mammals most vulnerable to macroplastic", value: "Hawaiian monk seal ranked first; African manatee, Australian sea lion, vaquita and Mediterranean monk seal also in the top five", year: "2026 study", status: "confirmed",
    note: "This ranks vulnerability to plastic only. It is not a prediction of which species goes extinct first.", sources: [{ label: "Ocean Conservancy", url: "https://oceanconservancy.org/newsroom/press-release/2026/04/15/news-new-study-ranks-hawaiian-monk-seal-as-marine-mammal-most-at-risk-of-extinction-from-plastic-pollution/", publisher: true }, { label: "Maui Now", url: "https://mauinow.com/2026/04/16/new-study-ranks-hawaiian-monk-seal-as-marine-mammal-most-at-risk-from-plastic-pollution/" }, { label: "Science Africa", url: "https://news.scienceafrica.co.ke/plastic-pollution-puts-hawaiian-monk-seal-at-highest-risk-of-extinction/" }] },
  { id: "mammals", category: "Wildlife", metric: "Marine mammals red-listed as threatened", value: "more than 1 in 3 of 117 evaluated", year: "2026 coverage", status: "single", sources: [{ label: "Science Africa", url: "https://news.scienceafrica.co.ke/plastic-pollution-puts-hawaiian-monk-seal-at-highest-risk-of-extinction/" }] },
  { id: "ghost", category: "Wildlife", metric: "Harm from ghost fishing gear", value: "66% of marine mammals, 50% of seabirds, all 7 sea turtle species", year: "WWF", status: "single", sources: [{ label: "Marine Industry News on WWF", url: "https://marineindustrynews.co.uk/ghost-gear-is-central-in-the-fight-against-plastic-pollution-says-wwf" }] },
];

export function statusCounts(): Record<Status, number> {
  const c: Record<Status, number> = { confirmed: 0, single: 0, conflicting: 0, derived: 0, estimate: 0 };
  for (const e of REGISTER) c[e.status]++;
  return c;
}

export const MODEL_ASSUMPTIONS: Entry[] = [
  { id: "gmax", category: "Model assumptions", metric: "Maximum realistic gain in recycling share", value: "2.5 points per year (adjustable)", year: "n/a", status: "estimate", note: "No sourced global benchmark found.", sources: [] },
  { id: "weights", category: "Model assumptions", metric: "How easily each material is recovered", value: "Illustrative weights", year: "n/a", status: "estimate", sources: [] },
  { id: "swarm", category: "Model assumptions", metric: "Swarm model parameters (neighbour influence, noise, herd effect)", value: "Plausible defaults, not fitted to data", year: "n/a", status: "estimate", sources: [] },
];
