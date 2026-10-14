// Municipal waste-management operating cost shown in the Impact panel.
// Derived estimate (registered as "cost_trajectory" in data-register.ts): the World Bank's business-as-usual
// direct cost, US$250B in 2022 rising to US$426B in 2050, interpolated linearly by year and then scaled by how
// many tonnes this scenario handles compared with business as usual. Costs really depend on collection coverage
// and treatment mix as well, which this simple scaling ignores.

import { END_YEAR, START_YEAR } from "./waste-model";

export const COST_2022_BN = 250;
export const COST_2050_BN = 426;

export function operationalCostBn(year: number, generated: number, bauGenerated: number): number {
  const t = (year - START_YEAR) / (END_YEAR - START_YEAR);
  const bauCost = COST_2022_BN + (COST_2050_BN - COST_2022_BN) * t;
  return bauCost * (generated / bauGenerated);
}
