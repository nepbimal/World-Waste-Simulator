// Thresholds and spreads taken from observed data. Each one is registered in data-register.ts (entries cap_observed,
// tipping_25, heterogeneity, policy_sigma, gmax) with its sources and status. Anything NOT listed here is a free
// modelling parameter and is marked as an assumption in the register.

// Highest and lowest national municipal recycling rates in Europe, 2023 (European Environment Agency summary of
// Eurostat data: Germany about 69%, Romania about 12%). DBnomics shows Germany at 68.2% in the Eurostat series.
export const MAX_OBSERVED_RATE = 0.69;
export const MIN_OBSERVED_RATE = 0.12;
// EU-27 average recycling rate in 2023 (Eurostat): 48.0%.
export const EU_MEAN_RATE_2023 = 0.48;

// How different households (and countries) are from each other: half the observed range divided by the average.
// Used as the relative spread of household recycling around a region's average.
export const HETEROGENEITY = (MAX_OBSERVED_RATE - MIN_OBSERVED_RATE) / (2 * EU_MEAN_RATE_2023);

// Social tipping point: a committed minority of about 25% changed the convention in the group experiments of
// Centola, Becker, Brackbill and Baronchelli (Science, 2018). Used as the neighbour-recycling level above which
// social amplification switches on. The study is a lab coordination task, so this is a reference value, not a law.
export const TIPPING_THRESHOLD = 0.25;

// Observed yearly gains in the municipal recycling rate, in percentage points a year (see register pace_* entries).
export const PACE_EU_RECENT = 0.5; // EU-27, 2014 to 2024
export const PACE_EU_EARLIER = 1.3; // EU-28, 2004 to 2014
export const PACE_FASTEST_NATIONAL = 2.5; // Poland and Slovenia, a decade or more from a very low base

// How much real policy delivery can differ from plan: the two EU decades differ by a factor of 2.6. Treating that
// factor as the 10th to 90th percentile range of a lognormal gives sigma = ln(2.6) / (2 * 1.2816). Only two
// observations, so this is a rough, data-based width rather than a fitted one.
export const POLICY_SIGMA = Math.log(PACE_EU_EARLIER / PACE_EU_RECENT) / (2 * 1.2816);
