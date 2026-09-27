"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_PREFIXES = ["/login", "/signup", "/auth"];

function isHiddenPath(pathname: string) {
  if (pathname.startsWith("/onboarding")) return true;
  return HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="size-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function HomeIcon() {
  return (
    <NavIcon>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </NavIcon>
  );
}

function DiscoverIcon() {
  return (
    <NavIcon>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </NavIcon>
  );
}

function QuranIcon() {
  return (
    <NavIcon>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H18v18H7.5A2.5 2.5 0 0 1 5 18.5v-13Z" />
      <path d="M7.5 3v15" />
    </NavIcon>
  );
}

function ProphetsIcon() {
  return (
    <NavIcon>
      <path d="M14 4a5.5 5.5 0 1 0 0 11 6.5 6.5 0 0 1 0-11Z" />
      <circle cx="17" cy="6" r="1" fill="currentColor" stroke="none" />
    </NavIcon>
  );
}

function NamesIcon() {
  return (
    <NavIcon>
      <rect x="6" y="6" width="12" height="12" rx="1" />
      <rect x="6" y="6" width="12" height="12" rx="1" transform="rotate(45 12 12)" />
    </NavIcon>
  );
}

const TABS = [
  { href: "/", label: "Feed", Icon: HomeIcon, match: (p: string) => p === "/" },
  {
    href: "/discover",
    label: "Discover",
    Icon: DiscoverIcon,
    match: (p: string) =>
      p !== "/" && !p.startsWith("/quran") && !p.startsWith("/prophets") && !p.startsWith("/prophetic") && !p.startsWith("/stories") && !p.startsWith("/names"),
  },
  { href: "/quran", label: "Qur'an", Icon: QuranIcon, match: (p: string) => p.startsWith("/quran") },
  { href: "/prophets", label: "Prophets", Icon: ProphetsIcon, match: (p: string) => p.startsWith("/prophets") || p.startsWith("/prophetic") || p.startsWith("/stories") },
  { href: "/names", label: "Names", Icon: NamesIcon, match: (p: string) => p.startsWith("/names") },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  if (isHiddenPath(pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 h-16 border-t border-[var(--border)] bg-[var(--card-bg)]/95 backdrop-blur-[12px]"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-full max-w-3xl">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-transform duration-150 active:scale-95 ${
                active ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"
              }`}
            >
              {active ? (
                <span
                  className="mb-0.5 size-1.5 rounded-full bg-[var(--gold)]"
                  aria-hidden
                />
              ) : (
                <span className="mb-0.5 size-1.5" aria-hidden />
              )}
              <Icon />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
