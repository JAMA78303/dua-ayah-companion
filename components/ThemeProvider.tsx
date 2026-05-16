"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { saveThemePreference } from "@/app/actions/theme";
import { getUserWithTimeout } from "@/lib/auth/getUserWithTimeout";
import { applyThemeToDocument, persistThemeLocally, readStoredTheme } from "@/lib/theme/applyTheme";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_THEME,
  canUseTheme,
  hasFullKiswahAccess,
  normalizeThemeId,
  type ThemeId,
} from "@/types/theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => Promise<boolean>;
  isSupporter: boolean;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [isSupporter, setIsSupporter] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      let next = readStoredTheme();
      let supporter = false;
      const user = await getUserWithTimeout();

      if (user && !cancelled) {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_premium, theme_preference")
          .eq("id", user.id)
          .maybeSingle();

        if (!cancelled) {
          supporter = Boolean(profile?.is_premium);
          setIsSupporter(supporter);
          if (profile?.theme_preference) {
            next = normalizeThemeId(profile.theme_preference);
          }
        }
      }

      if (!cancelled) {
        if (!canUseTheme(next, supporter)) {
          next = DEFAULT_THEME;
        }
        setThemeState(next);
        applyThemeToDocument(next);
        persistThemeLocally(next);
        setReady(true);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback(
    async (next: ThemeId): Promise<boolean> => {
      if (!canUseTheme(next, isSupporter)) {
        return false;
      }

      setThemeState(next);
      applyThemeToDocument(next);
      persistThemeLocally(next);

      const user = await getUserWithTimeout();
      if (user) {
        void saveThemePreference(next);
      }

      return true;
    },
    [isSupporter],
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      isSupporter: hasFullKiswahAccess(isSupporter),
      ready,
    }),
    [theme, setTheme, isSupporter, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
