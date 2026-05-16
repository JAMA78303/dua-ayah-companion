"use client";

import { useCallback, useRef, useState } from "react";

import { UpgradeModal } from "@/components/UpgradeModal";
import { useTheme } from "@/components/ThemeProvider";
import { KISWAH_THEME_META } from "@/lib/theme/kiswahThemes";
import { THEME_SWATCH_GRADIENTS } from "@/lib/theme/swatchGradients";
import { THEME_IDS, canUseTheme, type ThemeId } from "@/types/theme";

const HOLD_MS = 450;

export function ThemeSelector() {
  const { theme, setTheme, isSupporter } = useTheme();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [tooltipId, setTooltipId] = useState<ThemeId | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const startHold = useCallback(
    (id: ThemeId) => {
      clearHoldTimer();
      holdTimerRef.current = setTimeout(() => {
        setTooltipId(id);
      }, HOLD_MS);
    },
    [clearHoldTimer],
  );

  async function onSelect(next: ThemeId) {
    setTooltipId(null);
    if (!canUseTheme(next, isSupporter)) {
      setUpgradeOpen(true);
      return;
    }
    await setTheme(next);
  }

  return (
    <div>
      <div
        className="flex gap-3 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label="Choose a Kiswah theme"
      >
        {THEME_IDS.map((id) => {
          const meta = KISWAH_THEME_META[id];
          const locked = !canUseTheme(id, isSupporter);
          const selected = theme === id;
          const showTooltip = tooltipId === id;

          return (
            <div key={id} className="relative flex w-[5.25rem] shrink-0 flex-col items-center gap-1.5">
              {showTooltip ? (
                <div
                  role="tooltip"
                  className="absolute bottom-full z-20 mb-2 max-w-[11rem] rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-2.5 py-2 text-center text-[10px] leading-snug text-[var(--text-secondary)] shadow-[var(--card-shadow)]"
                >
                  {meta.historicalNote}
                </div>
              ) : null}

              <button
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={`${meta.nameEnglish}. ${meta.historicalNote}`}
                onClick={() => void onSelect(id)}
                onPointerDown={() => startHold(id)}
                onPointerUp={clearHoldTimer}
                onPointerLeave={() => {
                  clearHoldTimer();
                  setTooltipId(null);
                }}
                onPointerCancel={clearHoldTimer}
                onContextMenu={(e) => e.preventDefault()}
                className={`relative size-12 rounded-full transition-transform duration-150 active:scale-95 ${
                  selected
                    ? "ring-[3px] ring-[var(--gold)] ring-offset-2 ring-offset-[var(--bg-base)]"
                    : ""
                }`}
                style={{ background: THEME_SWATCH_GRADIENTS[id] }}
              >
                {locked ? (
                  <span
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35"
                    aria-hidden
                  >
                    <svg className="size-5 text-white/90" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a5 5 0 00-5 5v2H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 7V7a3 3 0 116 0v2H9z" />
                    </svg>
                  </span>
                ) : null}
              </button>

              <p
                dir="rtl"
                lang="ar"
                className="font-scheherazade text-center text-[13px] leading-tight text-[var(--text-primary)]"
              >
                {meta.nameArabic}
              </p>
              <p className="text-center text-[10px] leading-tight text-[var(--text-secondary)]">
                {meta.nameEnglish}
              </p>
            </div>
          );
        })}
      </div>

      <section className="mx-auto mt-6 max-w-[300px] space-y-2 text-center">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">
          The Kiswah throughout history
        </h3>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          The Kiswah — the cloth that covers the Ka&apos;bah — has changed colour many times across
          Islamic history. Each theme in this app reflects one of those historical coverings.
        </p>
      </section>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Unlock historical Kiswah themes"
        description="Become a Supporter to use Al-Ahmar, Al-Akhdar, Al-Dhahabi, and Al-Mukhattam."
      />
    </div>
  );
}
