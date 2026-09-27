"use client";

import { usePathname } from "next/navigation";

export function AppFooter() {
  // The swipe feed fills the screen; its end card carries the same ayah.
  if (usePathname() === "/") return null;

  return (
    <footer className="border-t border-[var(--border)] px-4 py-6 text-center">
      <p className="text-xs italic text-[var(--accent-primary)]">
        &quot;We have not sent down the Qur&apos;an to you to cause you distress&quot; — Ta-Ha, 2
      </p>
    </footer>
  );
}
