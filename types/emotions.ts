export const EMOTION_CATEGORIES = [
  "anxiety",
  "sadness",
  "gratitude",
  "guidance",
  "patience",
  "guilt",
  "grief",
  "hope",
  "forgiveness",
  "loneliness",
  "anger",
] as const;

export type EmotionCategory = (typeof EMOTION_CATEGORIES)[number];

export function isEmotionCategory(value: string): value is EmotionCategory {
  return (EMOTION_CATEGORIES as readonly string[]).includes(value);
}
