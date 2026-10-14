# Waste Simulation

Interactive model of global municipal solid waste to 2050: generation, recycling and composting, disposal, waste types,
regions, a required-recycling schedule, and an agent-based ("swarm") view with Monte Carlo ranges.

- `src/lib/waste-model.ts` — deterministic scenario model (World Bank *What a Waste 2.0* anchors)
- `src/lib/swarm-model.ts` — agent-based recycling model and the required-rate solver
- `src/components/WasteSimulation.tsx` — the page

Data: World Bank *What a Waste 2.0* (2018), UNEP Global Waste Management Outlook 2024, US EPA, Eurostat. Regional recovery
rates and per-material weights are approximations, not published figures. This is a scenario model, not a forecast.

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
