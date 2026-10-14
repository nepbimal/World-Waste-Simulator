import type { Metadata } from "next";
import { Fill, H2, LegalShell, P, UL } from "@/components/legal/LegalShell";
import { operator } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms and disclaimer | World Waste Simulator", description: "Terms of use, disclaimer and copyright notes." };

export default function Terms() {
  return (
    <LegalShell title="Terms and disclaimer" german="Nutzungsbedingungen und Haftungsausschluss">
      <H2>1. What this site is</H2>
      <P>
        World Waste Simulator is a free educational tool for exploring scenarios of global municipal solid waste to 2050. It is a simple model, not a forecast, and it is not professional advice.
        Do not rely on it for policy, investment, engineering, legal or scientific decisions without checking the original sources.
      </P>

      <H2>2. Where the numbers come from</H2>
      <UL>
        <li>Most figures are taken from published reports (World Bank, UNEP, Eurostat, OECD, UN agencies and others), which are linked in the sources section.</li>
        <li>Some figures are estimates or my own calculations. Each one is marked in the register as confirmed, single source, conflicting, derived or estimate, so you can see how well it is backed.</li>
        <li>Published figures can be revised, can differ between sources and may be out of date. I could not open every original document, and the register says where that applies.</li>
      </UL>

      <H2>3. No warranty and liability</H2>
      <P>
        The site is provided free of charge and as it is. I do not promise that it is complete, current, error-free or always available.
        I am liable without limit for intent and gross negligence, for injury to life, body or health, and wherever the law makes liability mandatory. Beyond that, because the service is free, I am not liable for losses that result from using it or relying on it.
      </P>

      <H2>4. Links to other websites</H2>
      <P>I have no control over the content of linked websites and am not responsible for it. I checked the links when I added them; if you find one that is unlawful or wrong, please tell me.</P>

      <H2>5. Copyright and data</H2>
      <UL>
        <li>The text, design and code of this site are © <Fill value={operator.name} label="rights holder" />. The source code licence is: <Fill value="" label="add a licence, for example MIT" />. Until a licence is added, all rights are reserved.</li>
        <li>The figures belong to the organisations that published them and are cited in the register. Check their own terms of use before you reuse a figure, and credit the original publisher.</li>
        <li>Names and logos of organisations mentioned belong to their owners. This site is not affiliated with or endorsed by them.</li>
      </UL>

      <H2>6. Accessibility feedback</H2>
      <P>The site is built to be used with a keyboard and a screen reader and to work on phones. If something does not work for you, write to <Fill value={operator.email} label="email address" /> and I will try to fix it.</P>

      <H2>7. Changes</H2>
      <P>I may change these terms when the site changes. The date at the top shows the latest version. This text is a template, not legal advice.</P>
    </LegalShell>
  );
}
