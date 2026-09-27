/** This device's copy of what's saved (content keys, newest first), for the signed-out Saved page. */
const STORAGE_KEY = "dua-app:saved-content-keys";
/** Before 019 only pairings could be saved, stored as bare pairing ids. */
const LEGACY_KEY = "dua-app:favourite-pairing-ids";

export const SAVED_KEYS_STORAGE_KEYS = [STORAGE_KEY, LEGACY_KEY];
export const SAVED_KEYS_EVENT = "dua-app-saves-changed";

function parseList(raw: string | null): string[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : null;
  } catch {
    return null;
  }
}

function write(keys: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // Private mode / storage full: the account copy is still the source of truth.
  }
  window.dispatchEvent(new CustomEvent(SAVED_KEYS_EVENT));
}

export function getLocalSavedKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const current = parseList(window.localStorage.getItem(STORAGE_KEY));
    if (current) return current;
    const legacy = parseList(window.localStorage.getItem(LEGACY_KEY));
    if (!legacy) return [];
    const migrated = legacy.map((pairingId) => `pairing:${pairingId}`);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    window.localStorage.removeItem(LEGACY_KEY);
    return migrated;
  } catch {
    return [];
  }
}

export function isSavedLocally(key: string): boolean {
  return getLocalSavedKeys().includes(key);
}

export function setSavedLocally(key: string, saved: boolean) {
  const others = getLocalSavedKeys().filter((existing) => existing !== key);
  write(saved ? [key, ...others] : others);
}
