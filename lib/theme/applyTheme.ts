import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  normalizeThemeId,
  type ThemeId,
} from "@/types/theme";

export function applyThemeToDocument(theme: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored) return normalizeThemeId(stored);
  return DEFAULT_THEME;
}

export function persistThemeLocally(theme: ThemeId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}
