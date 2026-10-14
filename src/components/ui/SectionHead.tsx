import type { ReactNode } from "react";

export function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="max-w-3xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet">{eyebrow}</div>
      <h2 className="mt-3 font-display text-4xl leading-[1.05] text-ink sm:text-5xl">{title}</h2>
      {children && <p className="mt-4 text-base leading-relaxed text-mute">{children}</p>}
    </header>
  );
}
