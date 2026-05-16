import { DEFAULT_THEME, LEGACY_THEME_MAP, THEME_IDS } from "@/types/theme";

/** Inline script to apply stored theme before paint (avoids flash). */
export function ThemeInitScript() {
  const ids = JSON.stringify(THEME_IDS);
  const legacy = JSON.stringify(LEGACY_THEME_MAP);
  const script = `(function(){try{var ids=${ids};var legacy=${legacy};var t=localStorage.getItem('dac-theme')||'${DEFAULT_THEME}';if(ids.indexOf(t)===-1)t=legacy[t]||'${DEFAULT_THEME}';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
