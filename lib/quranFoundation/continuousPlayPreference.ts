export const CONTINUOUS_PLAY_STORAGE_KEY = "dac-continuous-play";

export function getContinuousPlayEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONTINUOUS_PLAY_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setContinuousPlayEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONTINUOUS_PLAY_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}
