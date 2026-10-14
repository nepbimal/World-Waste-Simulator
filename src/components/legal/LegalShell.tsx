import Link from "next/link";
import type { ReactNode } from "react";
import { Aurora } from "../ui/Aurora";
export const LEGAL_UPDATED = "14 October 2026";
export const CONTACT_URL = "https://github.com/nepbimal/World-Waste-Simulator/issues";

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms and disclaimer" },
];

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-10 font-display text-2xl text-ink">{children}</h2>;
}
export function P({ children }: { children: ReactNode }) {
  return <p className="mt-3 leading-relaxed text-mute">{children}</p>;
}
export function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-mute">{children}</ul>;
}

export function LegalShell({ title, german, children }: { title: string; german?: string; children: ReactNode }) {
  return (
    <>
      <Aurora />
      <header className="border-b border-line bg-[#06080b]/65 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-leaf/50"><span className="h-2 w-2 rounded-full bg-leaf" /></span>
            World Waste Simulator
          </Link>
          <Link href="/" className="text-sm text-mute transition hover:text-ink">← Back to the simulator</Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-14 sm:px-6">
        <h1 className="font-display text-5xl leading-tight">{title}</h1>
        {german && <p className="mt-1 italic text-dim">{german}</p>}
        <p className="mt-3 text-sm text-dim">Last updated {LEGAL_UPDATED}</p>
        <div>{children}</div>
        <nav aria-label="Legal pages" className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm">
          {LEGAL_LINKS.map((l) => <Link key={l.href} href={l.href} className="text-mute underline-offset-4 hover:text-ink hover:underline">{l.label}</Link>)}
        </nav>
      </main>
    </>
  );
}
