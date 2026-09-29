"use client";

import { useEffect, useRef } from "react";

/** How often to follow the recitation while it plays: often enough for the word glow to keep pace. */
const TICK_MS = 50;

/**
 * Calls `tick` every 50 ms while `active`. Not animation frames: browsers pause those for hidden or
 * occluded pages, while a recitation (and its end-of-ayah check) must carry on. Callers also call `tick`
 * from the audio element's `timeupdate`, which keeps firing when timers are slowed in the background.
 */
export function usePlaybackTicker(active: boolean, tick: () => void) {
  const tickRef = useRef(tick);
  useEffect(() => {
    tickRef.current = tick;
  });

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => tickRef.current(), TICK_MS);
    return () => window.clearInterval(timer);
  }, [active]);
}
