"use client";

import { useEffect, useState } from "react";

import { SAVED_EMPTY_MESSAGE, SavedEntries } from "@/components/saved/SavedEntries";
import { getLocalSavedKeys } from "@/lib/local/savedKeys";
import type { SavedEntry } from "@/lib/saves/types";

type DeviceState = { status: "loading" } | { status: "error" } | { status: "ready"; entries: SavedEntry[] };

/** Signed out: what was saved on this device (kept from when the person was signed in). */
export function SavedOnDevice() {
  const [state, setState] = useState<DeviceState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const keys = getLocalSavedKeys();
    if (keys.length === 0) {
      queueMicrotask(() => setState({ status: "ready", entries: [] }));
      return;
    }
    void fetch("/api/saved/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        const { entries } = (await response.json()) as { entries: SavedEntry[] };
        if (!cancelled) setState({ status: "ready", entries });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p className="text-sm text-[var(--text-secondary)]">Loading your saves…</p>;
  if (state.status === "error") return <p className="text-sm text-red-700">Couldn&apos;t load your saves. Please try again.</p>;
  if (state.entries.length === 0) return <p className="text-sm text-[var(--text-secondary)]">{SAVED_EMPTY_MESSAGE}</p>;
  return <SavedEntries entries={state.entries} />;
}
