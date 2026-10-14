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

The agent-based model re-implements the ideas behind MiroFish/OASIS-style simulations (stochastic agent activation,
similarity-weighted neighbour influence, seeded Monte Carlo ensembles). MiroFish itself is AGPL-3.0 and is not used here.
