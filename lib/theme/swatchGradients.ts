import type { ThemeId } from "@/types/theme";

/** Mini preview gradients for theme swatches. */
export const THEME_SWATCH_GRADIENTS: Record<ThemeId, string> = {
  abyad: "radial-gradient(ellipse at 30% 20%, #F5F0E8 0%, #FAF8F5 50%, #F0EBE0 100%)",
  aswad: "linear-gradient(180deg, #0A0A0F 0%, #111118 50%, #0A0A0F 100%)",
  ahmar: "radial-gradient(ellipse at 50% 0%, #2E0A0A 0%, #1E0606 50%, #140404 100%)",
  akhdar: "radial-gradient(ellipse at 50% 0%, #0A2010 0%, #081808 50%, #060F06 100%)",
  dhahabi: "radial-gradient(ellipse at 40% 20%, #2A1A00 0%, #1E1200 50%, #140E00 100%)",
  mukhattam: "radial-gradient(ellipse at 30% 20%, #F5E8E8 0%, #FAF0F0 40%, #FFF8F8 100%)",
};
