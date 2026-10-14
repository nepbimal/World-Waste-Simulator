import type { Metadata } from "next";
import { Fill, H2, LegalShell, P } from "@/components/legal/LegalShell";
import { operator } from "@/lib/legal";

export const metadata: Metadata = { title: "Impressum | World Waste Simulator", description: "Legal notice and provider information." };

export default function Impressum() {
  return (
    <LegalShell title="Impressum" german="Legal notice (provider information)">
      <H2>Provider (Anbieter)</H2>
      <P>
        <Fill value={operator.name} label="full name" /><br />
        <Fill value={operator.street} label="street and number" /><br />
        <Fill value={operator.postalCode} label="postal code" /> <Fill value={operator.city} label="city" /><br />
        <Fill value={operator.country} label="country" />
      </P>

      <H2>Contact (Kontakt)</H2>
      <P>
        Email: {operator.email.trim() ? <a className="text-leaf underline" href={`mailto:${operator.email}`}>{operator.email}</a> : <Fill value="" label="email address" />}
        {operator.phone.trim() && <><br />Phone: {operator.phone}</>}
      </P>

      <H2>Responsible for the content</H2>
      <P>
        The person named above is responsible for the content of this website. Where a person is required under § 18 (2) of the German Medienstaatsvertrag, it is the same person.
      </P>

      <H2>About this website</H2>
      <P>
        World Waste Simulator is a free, non-commercial educational tool that shows scenarios for global municipal waste. It does not sell goods or services, does not show advertising and has no user accounts.
        The figures come from the publishers listed in the sources section of the site and are not the provider&apos;s own measurements.
      </P>

      <H2>Dispute resolution</H2>
      <P>
        The European Commission&apos;s online dispute resolution platform was discontinued on 20 July 2025, so there is no link to it. This website does not sell to consumers, and the provider is not obliged to take part in consumer arbitration proceedings (§ 36 VSBG).
      </P>

      <H2>Note on this template</H2>
      <P>
        This notice follows § 5 of the German Digitale-Dienste-Gesetz (DDG), which replaced § 5 TMG on 14 May 2024, and lists the minimum details: name, address and a way to reach the provider quickly.
        Further details (such as a commercial register entry, VAT number or professional rules) are required only for some providers; if one applies to you, add it. This is not legal advice.
      </P>
    </LegalShell>
  );
}
