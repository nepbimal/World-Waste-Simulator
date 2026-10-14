// Details the legal pages need and that only the site operator can supply. They are left empty on purpose:
// the pages show a visible "not filled in yet" notice until every required field is set. Do not publish the
// site with placeholders. These pages are a starting template, not legal advice.

export const operator = {
  name: "", // full legal name of the person (or company) running the site
  street: "", // street and house number
  postalCode: "",
  city: "",
  country: "",
  email: "", // an address you read; required so visitors can reach you quickly
  phone: "", // optional
};

export const hosting = {
  provider: "", // company that serves the website (for example Vercel Inc.)
  location: "", // where its servers are, if known
  logRetention: "", // how long it keeps server logs, as stated by the provider
};

export const LEGAL_UPDATED = "14 October 2026";

export function missingOperatorFields(): string[] {
  const required: (keyof typeof operator)[] = ["name", "street", "postalCode", "city", "country", "email"];
  return required.filter((k) => !operator[k].trim());
}

export function missingHostingFields(): string[] {
  return (Object.keys(hosting) as (keyof typeof hosting)[]).filter((k) => !hosting[k].trim());
}

export const operatorComplete = () => missingOperatorFields().length === 0;
