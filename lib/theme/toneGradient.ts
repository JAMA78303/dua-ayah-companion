export type ToneTag = "comfort" | "warning" | "balance";

export function toneGradientVar(tone: ToneTag) {
  switch (tone) {
    case "comfort":
      return "var(--gradient-card-comfort)";
    case "warning":
      return "var(--gradient-card-grief)";
    case "balance":
      return "var(--gradient-card-guidance)";
    default:
      return "var(--gradient-card-default)";
  }
}
