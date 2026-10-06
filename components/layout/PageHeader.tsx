import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Small teal label above the title, e.g. "Your private space". */
  eyebrow: string;
  title: string;
  /** Optional link back, e.g. to the Library. */
  back?: { href: string; label: string };
  children?: ReactNode;
}

/** The redesign's page header: a small uppercase label over a Cormorant title. */
export function PageHeader({ eyebrow, title, back, children }: PageHeaderProps) {
  return (
    <header className="space-y-1">
      {back ? (
        <Link href={back.href} className="mb-2 inline-flex min-h-9 items-center text-xs font-bold text-[var(--accent-primary)] hover:opacity-80">
          {`← ${back.label}`}
        </Link>
      ) : null}
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent-primary)]">{eyebrow}</p>
      <h1 className="font-playfair text-[32px] font-semibold leading-tight text-[var(--text-primary)]">{title}</h1>
      {children}
    </header>
  );
}
