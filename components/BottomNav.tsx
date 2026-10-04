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

function LibraryIcon() {
  return (
    <NavIcon>
      <path d="M4 19.5V5a1 1 0 0 1 1-1h3v16H5a1 1 0 0 1-1-.5Z" />
      <path d="M8 4h4v16H8" />
      <path d="m13.5 5.2 3.8-1.1 3 13.3-3.8 1.1Z" />
    </NavIcon>
  );
}

function YouIcon() {
  return (
    <NavIcon>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </NavIcon>
  );
}

const LIBRARY_PREFIXES = ["/library", "/prophets", "/prophetic", "/stories", "/companions", "/names", "/duas", "/adhkar"];
const YOU_PREFIXES = ["/you", "/saved", "/favourites", "/journal", "/my-duas", "/supporter"];
const startsWithAny = (p: string, prefixes: string[]) => prefixes.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));

const TABS = [
  { href: "/", label: "Feed", Icon: HomeIcon, match: (p: string) => p === "/" || p.startsWith("/feed") },
  {
    href: "/discover",
    label: "Discover",
    Icon: DiscoverIcon,
    match: (p: string) =>
      p !== "/" && !p.startsWith("/feed") && !p.startsWith("/quran") && !startsWithAny(p, LIBRARY_PREFIXES) && !startsWithAny(p, YOU_PREFIXES),
  },
  { href: "/quran", label: "Qur'an", Icon: QuranIcon, match: (p: string) => p.startsWith("/quran") },
  { href: "/library", label: "Library", Icon: LibraryIcon, match: (p: string) => startsWithAny(p, LIBRARY_PREFIXES) },
  { href: "/you", label: "You", Icon: YouIcon, match: (p: string) => startsWithAny(p, YOU_PREFIXES) },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  if (isHiddenPath(pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 h-16 border-t border-[var(--border)] bg-[var(--bg-base)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-[12px]"
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
              <span className="text-[11px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
