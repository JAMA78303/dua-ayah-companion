const SPEED_STORAGE_KEY = "dac-playback-speed";
const PLAYBACK_SPEEDS = [0.75, 1, 1.25];

/** Stored speed, or 1× when missing / invalid. Call after mount — never during render (hydration). */
export function readPlaybackSpeed(): number {
  try {
    const stored = Number(window.localStorage.getItem(SPEED_STORAGE_KEY));
    return PLAYBACK_SPEEDS.includes(stored) ? stored : 1;
  } catch {
    return 1;
  }
}

/** Cycles to the next speed and persists it. */
export function cyclePlaybackSpeed(current: number): number {
  const next = PLAYBACK_SPEEDS[(PLAYBACK_SPEEDS.indexOf(current) + 1) % PLAYBACK_SPEEDS.length]!;
  try {
    window.localStorage.setItem(SPEED_STORAGE_KEY, String(next));
  } catch {
    /* speed still applies for this session */
  }
  return next;
}
