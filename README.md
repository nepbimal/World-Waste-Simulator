# Waste Simulation

Interactive model of global municipal solid waste to 2050: generation, recycling and composting, disposal, waste types,
regions, a required-recycling schedule, and an agent-based ("swarm") view with Monte Carlo ranges.

- `src/lib/waste-model.ts` — deterministic scenario model (World Bank *What a Waste 3.0* anchors and regional tables)
- `src/lib/swarm-model.ts` — agent-based recycling model and the required-rate solver
- `src/lib/data-register.ts` — data register with verified primary citations and statuses
- `src/components/WasteSimulation.tsx` — interactive visualization and simulation page

Data: verified against the World Bank Group's primary publication *What a Waste 3.0: Global Snapshot of Solid Waste Management Toward Circularity until 2050* (Cook et al., March 2026, DOI: 10.1596/978-1-4648-2309-1).
- 2022 baseline: 2.562 billion tonnes across 7 global regions
- 2050 projections: 3.855 billion tonnes (Business as usual, +50%), 3.213 billion tonnes (Low ambition), 2.562 billion tonnes (High ambition)
- Regional profiles: East Asia & Pacific (849 Mt), Europe & Central Asia (415 Mt), South Asia (346 Mt), North America (311 Mt), Latin America & Caribbean (249 Mt), Sub-Saharan Africa (231 Mt), Middle East & North Africa (161 Mt)
- 13 material streams: food waste (38.3%), paper & cardboard (13.9%), plastics (12.5%), garden (8.0%), glass (4.2%), metals (3.8%), and others.
- Additional benchmarks verified with Eurostat (2024/2026), UNITAR/ITU Global E-waste Monitor (2024), and OECD Global Plastics Outlook.

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
