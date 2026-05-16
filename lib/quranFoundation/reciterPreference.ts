export const RECITER_STORAGE_KEY = "dac-reciter-id";
export const DEFAULT_RECITER_ID = 7;

export function getReciterIdFromStorage(): number {
  if (typeof window === "undefined") return DEFAULT_RECITER_ID;
  try {
    const raw = window.localStorage.getItem(RECITER_STORAGE_KEY);
    const id = Number(raw);
    if (Number.isFinite(id) && id > 0) return id;
  } catch {
    /* ignore */
  }
  return DEFAULT_RECITER_ID;
}

export function saveReciterIdToStorage(id: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECITER_STORAGE_KEY, String(id));
  } catch {
    /* ignore */
  }
}

/** Synchronous client preference (localStorage). Profile sync is handled by ReciterProvider. */
export function getReciterId(): number {
  return getReciterIdFromStorage();
}

/** Instant local save; call ReciterProvider.saveReciterId for full flow. */
export function saveReciterId(id: number): void {
  saveReciterIdToStorage(id);
}
