# Waste Simulation

Interactive model of global municipal solid waste to 2050: generation, recycling and composting, disposal, waste types,
regions, a required-recycling schedule, and an agent-based ("swarm") view with Monte Carlo ranges.

- `src/lib/waste-model.ts` — deterministic scenario model (World Bank *What a Waste 2.0* anchors)
- `src/lib/swarm-model.ts` — agent-based recycling model and the required-rate solver
- `src/components/WasteSimulation.tsx` — the page

Data: anchored to the World Bank's *What a Waste 3.0* (2026): 2.56 billion tonnes in 2022, 3.86 billion in 2050. Benchmarks
from Eurostat (2024), US EPA, OECD, UNEP, the Global E-waste Monitor and others. Every figure, with year, sources and a
verification status (confirmed, single source, conflicting, derived, estimate), is in `src/lib/data-register.ts` and shown
on the page under "Data, sources and verification". The regional split and per-material weights are estimates, not
published numbers. This is a scenario model, not a forecast.

Known limits: the publishers' own documents could not be opened when this was built, so "confirmed" means several
independent reports agree. To replace the derived regional numbers, use the World Bank dataset at
https://data360.worldbank.org/en/dataset/WB_WAW.

```
npm install
npm run dev
```

## Open it without a terminal

- **Vercel (easiest, free):** go to vercel.com, sign in with GitHub, click Add New > Project, pick this repo, click Deploy. You get a public link in about a minute.
- **GitHub Codespaces:** on the repo page click Code > Codespaces > Create. In the browser terminal that opens, run `npm install` then `npm run dev` and open the forwarded port 3000.

## Maths background

The agent-based model re-implements the ideas behind MiroFish/OASIS-style simulations (stochastic agent activation,
similarity-weighted neighbour influence, seeded Monte Carlo ensembles). MiroFish itself is AGPL-3.0 and is not used here.
