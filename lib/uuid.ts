const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True for real pairing ids; fallback / verse-only pairings use non-UUID ids and cannot be persisted. */
export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}
