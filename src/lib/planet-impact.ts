// Sourced, hedged context for how waste affects energy, climate, water, land and wildlife.
// Figures are quoted from the cited sources (some via secondary write-ups, noted in `note`).
// Nothing here is a prediction of when a species will go extinct.

export type Source = { label: string; url: string };

// Energy saved by recycling vs making from virgin material (EPA WasteWise factoid, archived page).
export const ENERGY_SAVINGS = [
  { material: "Aluminum", saving: "about 95%", detail: "Recycling uses under 5% of the energy of primary production." },
  { material: "Steel / tin cans", saving: "60 to 74%", detail: "" },
  { material: "Paper", saving: "about 40%", detail: "Recycled paper needs about 60% of the energy of virgin pulp; other sources report up to 64%." },
  { material: "Plastic", saving: "about 33% (EPA page); some sources say up to 76% for PET", detail: "The higher PET figure comes from a commercial blog, so treat it as unverified." },
];
export const ENERGY_SOURCE: Source = { label: "US EPA WasteWise factoid (archived)", url: "https://archive.epa.gov/epawaste/conserve/smm/wastewise/web/html/factoid.html" };

export const CLIMATE_FACTS = [
  { text: "Landfills and wastewater are about 20% of human-caused methane (UNEP/CCAC Global Methane Assessment, as reported by BioCycle).", url: "https://www.biocycle.net/reducing-human-caused-methane-by-45-by-2030" },
  { text: "The waste sector is about 3% of total greenhouse gas emissions (Global Climate and Health Alliance; I could not check its underlying citation).", url: "https://climateandhealthalliance.org/wp-content/uploads/2023/08/MethaneReport-Waste-FINAL.pdf" },
];

export const WATER_FACTS = [
  { text: "More than 1,000 rivers account for about 80% of plastic entering the ocean from rivers (Meijer et al. 2021, Science Advances). Country and river totals are rough: a 100 tonne estimate could be 25 to 400 tonnes. I could not retrieve the global annual tonnage, so none is shown.", url: "https://ourworldindata.org/how-much-plastic-waste-ends-up-in-the-ocean" },
];

export const SPECIES_FACTS = [
  { text: "A review of 340 publications found about 44,000 animals entangled in or swallowing debris. Plastic was about 92% of encounters and about 17% of affected species were threatened or near threatened on the IUCN Red List (Gall and Thompson).", url: "https://www.plymouth.ac.uk/news/new-study-reveals-the-global-impact-of-debris-on-marine-life" },
  { text: "A 2026 Conservation Biology study ranked the Hawaiian monk seal first among marine mammals for vulnerability to macroplastic. African manatee, Australian sea lion, vaquita and Mediterranean monk seal were also in the top five. This ranks plastic risk only, not extinction order.", url: "https://oceanconservancy.org/newsroom/press-release/2026/04/15/news-new-study-ranks-hawaiian-monk-seal-as-marine-mammal-most-at-risk-of-extinction-from-plastic-pollution/" },
  { text: "Of 117 marine mammals evaluated, more than 1 in 3 are red-listed as vulnerable, endangered or critically endangered (same coverage).", url: "https://news.scienceafrica.co.ke/plastic-pollution-puts-hawaiian-monk-seal-at-highest-risk-of-extinction/" },
  { text: "Ghost fishing gear harms 66% of marine mammals, 50% of seabirds and all 7 species of marine turtles (WWF).", url: "https://marineindustrynews.co.uk/ghost-gear-is-central-in-the-fight-against-plastic-pollution-says-wwf" },
];

export const SPECIES_CAVEATS = [
  "No source I found predicts which species will go extinct first, or when. Rankings above measure vulnerability to plastic only.",
  "For several threatened species (for example the vaquita) fishing bycatch is a larger driver than general waste, so waste reduction alone would not save them.",
  "How losing species affects the wider ecosystem (for example the loss of marine predators cascading down the food web) is general ecology, not something this model calculates.",
];
