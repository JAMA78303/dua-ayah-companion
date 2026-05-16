const STORAGE_KEY = "dua-app:favourite-pairing-ids";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("dua-app-favourites-changed"));
}

export function getFavouritePairingIds(): string[] {
  return readIds();
}

export function isFavouritePairing(pairingId: string): boolean {
  return readIds().includes(pairingId);
}

/** Returns true if now favourited, false if removed. */
export function toggleFavouritePairing(pairingId: string): boolean {
  const ids = readIds();
  const index = ids.indexOf(pairingId);
  if (index >= 0) {
    ids.splice(index, 1);
    writeIds(ids);
    return false;
  }
  writeIds([pairingId, ...ids.filter((id) => id !== pairingId)]);
  return true;
}
