import type { Metadata } from "next";
import { CONTACT_URL, H2, LegalShell, P, UL } from "@/components/legal/LegalShell";

export const metadata: Metadata = { title: "Privacy policy | World Waste Simulator", description: "How this website handles personal data." };

export default function Privacy() {
  return (
    <LegalShell title="Privacy policy" german="Datenschutzerklärung">
      <H2>1. Who is responsible</H2>
      <P>
        World Waste Simulator is an open-source project. To contact the person responsible about this policy or about your data, open an issue in the project&apos;s{" "}
        <a className="text-leaf underline" href={CONTACT_URL} target="_blank" rel="noreferrer">GitHub repository</a>.
      </P>

      <H2>2. In short</H2>
      <UL>
        <li>The simulator runs in your browser. The numbers you see are calculated on your device from data that ships with the page.</li>
        <li>There are no accounts, forms, comments or newsletters, so the site does not ask you for any personal data.</li>
        <li>The site sets no cookies and stores nothing on your device (no local storage, no tracking identifiers).</li>
        <li>There is no analytics, advertising, social media plug-in or embedded third-party content. Fonts are served from this site, not from Google.</li>
      </UL>

      <H2>3. Hosting and server log files</H2>
      <P>
        The website is delivered by a hosting provider. When you open a page, the provider&apos;s servers automatically record technical data in log files: your IP address, the date and time, the page requested, the response status, the amount of data sent, the referring page and your browser and operating system.
      </P>
      <P>
        Purpose: delivering the site, keeping it secure and stable, and finding errors or abuse. Legal basis: Art. 6 (1) (f) GDPR, a legitimate interest in running a secure website.
        The provider keeps the logs for a short period set by its own policy and then deletes them. The data is not combined with other data and is not used to identify you.
      </P>
      <P>
        If the provider processes data outside the EU or the European Economic Area, this should happen only with the safeguards required by Chapter V of the GDPR, such as the EU-US Data Privacy Framework or standard contractual clauses. Check the provider&apos;s own privacy policy for details.
      </P>

      <H2>4. Cookies and similar technologies</H2>
      <P>
        This site does not store or read information on your device, so no cookie banner or consent is needed.
      </P>

      <H2>5. Links to other websites</H2>
      <P>
        The sources section links to publishers such as the World Bank, UNEP, Eurostat and others. Those links open in a new tab and are sent without a referrer. Once you leave this site, the other website&apos;s own privacy policy applies, and it will see your IP address.
      </P>

      <H2>6. Your rights</H2>
      <P>You have the right, under the GDPR, to:</P>
      <UL>
        <li>information about the data held about you (Art. 15) and correction of wrong data (Art. 16);</li>
        <li>erasure (Art. 17) and restriction of processing (Art. 18);</li>
        <li>data portability (Art. 20);</li>
        <li>object to processing based on legitimate interests, on grounds relating to your situation (Art. 21);</li>
        <li>complain to a data protection supervisory authority (Art. 77), for example in the country where you live or work.</li>
      </UL>
      <P>
        Because the site holds no personal data beyond the short-lived server logs, which I cannot link to a person, I may not be able to identify you in them. To use any of these rights, open an issue in the project&apos;s GitHub repository (see section 1).
      </P>

      <H2>7. No automated decisions</H2>
      <P>The site makes no automated decisions about you and does no profiling.</P>

      <H2>8. Changes</H2>
      <P>If the site changes in a way that affects personal data (for example if analytics is added), this policy will be updated before the change goes live. This text is a template based on how the site works today, not legal advice.</P>
    </LegalShell>
  );
}
