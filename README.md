# Waste Simulation

Interactive model of global municipal solid waste to 2050: generation, recycling and composting, disposal, waste types,
regions, a required-recycling schedule, and an agent-based ("swarm") view with Monte Carlo ranges.

- `src/lib/waste-model.ts` — deterministic scenario model (World Bank *What a Waste 3.0* anchors and regional tables)
- `src/lib/swarm-model.ts` — agent-based recycling model and the required-rate solver
- `src/lib/data-register.ts` — data register with verified primary citations and statuses
- `src/components/WasteSimulation.tsx` — interactive visualization and simulation page

Data: anchored to the World Bank Group's primary publication *What a Waste 3.0: Global Snapshot of Solid Waste Management Toward Circularity until 2050* (Cook et al., March 2026, DOI: [10.1596/978-1-4648-2309-1](https://doi.org/10.1596/978-1-4648-2309-1)).
- **2022 baseline:** 2,562 million tonnes (2.56 Bt) across 7 global regions
- **2050 projections:** 3,855 million tonnes (Business as usual, +50%), with low-ambition (3.12–3.21 Bt) and high-ambition (2.56 Bt, capped) policy scenarios
- **7 World Bank regions:** East Asia & Pacific (849 Mt), Europe & Central Asia (415 Mt), South Asia (346 Mt), North America (311 Mt), Latin America & Caribbean (249 Mt), Sub-Saharan Africa (231 Mt), Middle East & North Africa (161 Mt)
- **13 material streams:** Food waste (38.3%), paper & cardboard (13.9%), plastics (12.5%), garden (8.0%), glass (4.2%), metals (3.8%), and others
- **Verification policy:** Every figure in `src/lib/data-register.ts` is labeled as `confirmed` (2+ independent published sources), `single` (single institutional report, including figures exclusive to What a Waste 3.0), `conflicting` (where reports or scopes differ, e.g. e-waste audit vs total discard, low-ambition table vs figure), or `estimate` (project levers, e.g. the 2.5 pts/yr max realistic gain and swarm simulation defaults). This is a scenario model, not a forecast.

```bash
npm install
npm run dev
```

## Open it without a terminal

- **Vercel (easiest, free):** go to vercel.com, sign in with GitHub, click Add New > Project, pick this repo, click Deploy. You get a public link in about a minute.
- **GitHub Codespaces:** on the repo page click Code > Codespaces > Create. In the browser terminal that opens, run `npm install` then `npm run dev` and open the forwarded port 3000.

## Maths background

The agent-based "swarm" model re-implements the ideas behind MiroFish/OASIS-style simulations (random activation of agents,
similarity-weighted neighbour influence, many seeded runs read as a distribution). MiroFish itself is AGPL-3.0 and is not used here.

How it fits together: each region's household agents start at that region's recycling rate and receive the scenario's yearly
policy push, so with no social effects the swarm follows the deterministic scenario path (tests check this). On top of that,
neighbours influence each other (echo chambers change how far apart households end up, not the average) and neighbours
above a social tipping point can amplify the push (the herd effect, off by default).

Thresholds taken from data (see `src/lib/thresholds.ts` and the register): the ceiling on any region's recycling rate is the
highest national rate observed (69%, Germany 2023); amplification switches on at the 25% tipping point from published group
experiments; household spread comes from the 12% to 69% range of European national rates; and the width of the uncertainty band
comes from the gap between two measured EU decades (0.5 and 1.3 points a year). The learning rate, number of neighbours and the
herd strength have no data behind them; tests show the average outcome barely depends on the first two.

## Legal pages

The site has a privacy policy (`/privacy`) and terms and disclaimer (`/terms`), linked from the footer. They contain no personal
details: contact is through issues on the project's GitHub repository. There is no Impressum, because an Impressum consists of the
operator's name, address and email. If the site is run commercially or from Germany in a way that requires one, add an
`/impressum` page with those details before relying on the site. The pages describe how the site works today (no cookies, no
local storage, no analytics, no forms, fonts served from the site itself); if you add any of those, update the privacy policy
first. These templates are not legal advice. The repository has no licence file yet, so by default all rights are reserved.
