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
