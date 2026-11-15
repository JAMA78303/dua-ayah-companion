import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { StarMark } from "@/components/brand/StarMark";

export const authPrimaryButton =
  "flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent-primary)] text-sm font-bold text-[var(--on-accent-text)] transition hover:opacity-90 disabled:opacity-60";

/** The star mark, a serif title and a calm line beneath it. */
export function AuthHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <StarMark size={60} />
      <h1 className="font-playfair text-[32px] font-semibold leading-tight text-[var(--text-primary)]">{title}</h1>
      {children ? <p className="max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">{children}</p> : null}
    </header>
  );
}

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  Icon: LucideIcon;
}

/** A rounded field with a leading icon; the label is read by screen readers and shown as the placeholder. */
export function AuthField({ id, label, Icon, placeholder, ...input }: AuthFieldProps) {
  return (
    <div className="flex min-h-12 items-center gap-2.5 rounded-[18px] border border-[var(--border)] bg-[var(--input-bg)] px-4 focus-within:border-[var(--accent-primary)]">
      <Icon className="size-[18px] shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        placeholder={placeholder ?? label}
        className="w-full bg-transparent py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
        {...input}
      />
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]" aria-hidden>
      <span className="h-px flex-1 bg-[var(--border)]" />
      or
      <span className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-[14px] border border-[color-mix(in_srgb,#b42318_35%,transparent)] bg-[color-mix(in_srgb,#b42318_8%,var(--card-bg))] px-4 py-3 text-sm text-[var(--text-primary)]"
    >
      {children}
    </p>
  );
}

export function AuthNote({ children }: { children: ReactNode }) {
  return <p className="rounded-[14px] bg-[var(--bg-subtle)] px-4 py-3 text-sm text-[var(--text-secondary)]">{children}</p>;
}

export function AuthPrivacyLine() {
  return (
    <p className="text-center text-[11px] leading-relaxed text-[var(--text-secondary)]">
      Your journal and personal duas are sent over an encrypted connection. We never sell personal data.
    </p>
  );
}
