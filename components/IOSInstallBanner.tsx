"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "install-banner-dismissed";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function hasCompletedCoreLoop(): boolean {
  try {
    return window.localStorage.getItem("dua-app:core-loop-complete") === "1";
  } catch {
    return false;
  }
}

/**
 * BUG-034: iOS Safari has no `beforeinstallprompt` — gentle Add to Home Screen hint.
 */
export function IOSInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      return;
    }
    if (!isIOS() || isStandalone() || !hasCompletedCoreLoop()) return;
    queueMicrotask(() => setVisible(true));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg-card)]/95 px-4 py-3 text-center shadow-lg backdrop-blur-sm">
      <p className="text-xs text-[var(--text-primary)]">
        Add to your home screen for the best experience. Tap Share → Add to Home Screen.
      </p>
      <button
        type="button"
        className="mt-2 text-xs font-medium text-[var(--accent-primary)]"
        onClick={() => {
          try {
            window.localStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
