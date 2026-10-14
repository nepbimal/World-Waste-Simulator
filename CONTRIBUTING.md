# Contributing to World Waste Simulator

This guide is for anyone who wants to improve the project: people, and any AI coding or research assistant.
Read it fully before changing anything.

## What the project is

An interactive Next.js web app that projects global municipal solid waste to 2050: how much is produced,
recycled or composted, and disposed of, by region and by material, under three scenarios (business as usual,
stronger policy, circular economy) plus custom sliders. It also shows:

- the recycling percentage required each year to hit a target by a deadline, and the latest year recycling can start;
- an agent-based "swarm" model: 150 simulated households per region, 25 seeded Monte Carlo runs, shown as a
  median line with a 10th to 90th percentile band;
- a register of every external figure with its year, sources and a verification status.

## Read these files first, in this order

1. `README.md`
2. `src/lib/data-register.ts`: every external figure, with year, sources and status
3. `src/lib/waste-model.ts`: deterministic model, anchored to World Bank *What a Waste 3.0*
4. `src/lib/swarm-model.ts`: agent-based model and the required-recycling solver
5. `src/components/WasteSimulation.tsx`: the whole page

## Tech notes

- Next.js 16 (App Router), React 19, TypeScript, Tailwind 4. Next.js 16 has breaking changes compared with older
  versions: read the guides in `node_modules/next/dist/docs/` before writing framework code.
- Run: `npm install`, then `npm run dev`.
- Before every commit run: `npx tsc --noEmit`, `npx eslint .`, `npx next build`.
- There is no chart library; charts are small inline SVG components. Keep the page usable at phone width.

## Rules (the most important part)

1. **Never invent or guess a number.** Every figure must be traceable to a source you actually opened. If you
   cannot find it, say so and leave it out.
2. **Every figure goes in `src/lib/data-register.ts`** with its metric, value, year, source URLs and one status:
   - `confirmed`: two or more independent sources agree
   - `single`: one source found
   - `conflicting`: sources disagree (explain how)
   - `derived`: calculated by this project from sourced inputs
   - `estimate`: our own assumption

   Prefer the publisher's own document (World Bank, UNEP, EPA, Eurostat, OECD, IUCN, UN agencies). Only mark a
   figure `confirmed` if you read the sources, and do not attribute a figure to a page that did not carry it.
3. **Use the latest data available** and state its year. If a newer release exists, update the register.
4. **Stay honest about what the model is.** It is a scenario model, not a forecast. Do not claim the swarm model
   is validated against real data. Do not predict extinction dates for any species; only cite published
   vulnerability findings.
5. **Small, reviewable commits.** Explain every formula change in the commit message. Do not change the maths
   silently.
6. **If a source is blocked, paywalled or unclear, stop and say so.** Do not fill the gap with a plausible number.

## Open work, in priority order

1. **Regional data is derived, not published.** The 2022 and 2050 regional tables from *What a Waste 3.0* could not
   be read earlier. Get them from https://data360.worldbank.org/en/dataset/WB_WAW or the full report
   (https://hdl.handle.net/10986/44141), replace the derived numbers in `waste-model.ts`, and mark them `confirmed`.
   Also find real regional recycling and composting rates; the current ones are estimates.
2. **Verify against primary documents.** Re-check every `single` and `conflicting` entry against the publisher's own
   page, especially: global composition (food 38%, plastics 12.5%), the 21% recovery rate, the 29/21/20/30
   treatment split, UNEP's 2.1 vs 2.3 billion tonnes for 2023, wastewater 56% vs 58%, the IUCN Red List 2026
   counts, and the newest US EPA national figures (the current data is from 2018).
3. **Missing categories.** E-waste, food, plastics, wastewater, textiles, methane and wildlife are sourced facts
   only. Turn them into model-linked panels (for example e-waste and food-waste trajectories to 2030 and 2050)
   using published projections, each with sources and a status.
4. **Species.** Build a sourced "species at risk from waste and pollution" section from IUCN Red List data and
   peer-reviewed studies (marine animals and plastic, ghost gear, seabirds). Show the uncertainty, give no invented
   rankings or dates, and say clearly where bycatch or habitat loss matters more than waste.
5. **Recycling targets.** Done for Europe: the register has `pace_*` entries (EU average 0.5 to 1.3 points a year,
   fastest national gains about 2.4 to 2.7). Still open: East Asian or other non-European benchmarks, and a pace for
   regions outside Europe. The 2.5 default is documented as a judgement in `gmax`.
6. **Quality.** Add unit tests for `waste-model.ts` and `swarm-model.ts` (totals match 2.56 Bt in 2022 and 3.86 Bt
   in 2050; regional sums equal the global total; swarm output is reproducible for a fixed seed). Improve
   accessibility (keyboard-usable sliders, text alternatives for charts, colour contrast) and the mobile layout.
7. **Deployment.** Add a README section on deploying to Vercel and a checklist for updating the data.

## How to work

1. Start by summarising the project back in about 10 lines and say which items above you will take on.
2. Work on one item at a time.
3. For each change, say what you verified and where, update the register, run the checks above, and write a
   clear commit message.
