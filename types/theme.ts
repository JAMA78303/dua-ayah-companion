export const THEME_IDS = ["abyad", "aswad", "ahmar", "akhdar", "dhahabi", "mukhattam"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = "abyad";

export const THEME_STORAGE_KEY = "dac-theme";

/** Maps retired theme ids to the closest historical Kiswah theme. */
export const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  fajr: "abyad",
  kiswah: "aswad",
  abbasid: "akhdar",
  mamluk: "ahmar",
  layl: "aswad",
};

/**
 * When true, all six Kiswah themes are selectable without Supporter status.
 * Set `NEXT_PUBLIC_UNLOCK_KISWAH=false` in production once billing is live.
 */
export const KISWAH_THEMES_UNLOCKED =
  process.env.NEXT_PUBLIC_UNLOCK_KISWAH !== "false";

/** Free tier: Al-Abyad (white) and Al-Aswad (black). */
export const FREE_THEME_IDS: readonly ThemeId[] = ["abyad", "aswad"];

/** Supporter-only themes. */
export const SUPPORTER_ONLY_THEME_IDS: readonly ThemeId[] = [
  "ahmar",
  "akhdar",
  "dhahabi",
  "mukhattam",
];

export function isThemeId(value: string): value is ThemeId {
  return (THEME_IDS as readonly string[]).includes(value);
}

export function normalizeThemeId(value: string): ThemeId {
  if (isThemeId(value)) return value;
  return LEGACY_THEME_MAP[value] ?? DEFAULT_THEME;
}

export function canUseTheme(theme: ThemeId, isSupporter: boolean): boolean {
  if (KISWAH_THEMES_UNLOCKED || isSupporter) return true;
  return FREE_THEME_IDS.includes(theme);
}

export function hasFullKiswahAccess(isSupporter: boolean): boolean {
  return KISWAH_THEMES_UNLOCKED || isSupporter;
}
