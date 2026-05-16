interface SurahReferencePillProps {
  children: React.ReactNode;
  className?: string;
}

export function SurahReferencePill({ children, className = "" }: SurahReferencePillProps) {
  return (
    <p
      className={`inline-flex max-w-full items-center justify-center rounded-full border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--accent-primary)] ${className}`}
    >
      {children}
    </p>
  );
}
