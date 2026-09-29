/**
 * The moon's phase from the mean lunar cycle: accurate to within about half a day, which is plenty for
 * drawing it. The Islamic month starts from a sighting, so its day can differ from the moon's age by a day.
 */

const SYNODIC_MONTH_DAYS = 29.530588853;
/** A new moon: 6 January 2000, 18:14 UTC. */
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86_400_000;

/** Days since the last new moon, 0 to 29.53. */
export function moonAge(date: Date): number {
  const days = (date.getTime() - REFERENCE_NEW_MOON_MS) / DAY_MS;
  return ((days % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
}

/** 0 at new moon, 0.5 at full, back to 1 at the next new moon. */
export function moonCycleFraction(age: number): number {
  return age / SYNODIC_MONTH_DAYS;
}

/** Share of the moon's face that is lit, 0 to 1. */
export function moonIllumination(age: number): number {
  return (1 - Math.cos(2 * Math.PI * moonCycleFraction(age))) / 2;
}

export type MoonPhaseName =
  | "New moon"
  | "Waxing crescent"
  | "First quarter"
  | "Waxing gibbous"
  | "Full moon"
  | "Waning gibbous"
  | "Last quarter"
  | "Waning crescent";

/** The named phase, with the four main phases each given about a day either side. */
export function moonPhaseName(age: number): MoonPhaseName {
  const quarter = SYNODIC_MONTH_DAYS / 4;
  if (age < 1 || age > SYNODIC_MONTH_DAYS - 1) return "New moon";
  if (Math.abs(age - quarter) <= 1) return "First quarter";
  if (Math.abs(age - 2 * quarter) <= 1) return "Full moon";
  if (Math.abs(age - 3 * quarter) <= 1) return "Last quarter";
  if (age < quarter) return "Waxing crescent";
  if (age < 2 * quarter) return "Waxing gibbous";
  if (age < 3 * quarter) return "Waning gibbous";
  return "Waning crescent";
}

/**
 * SVG path for the lit part of a moon of radius r centred on (cx, cy), as seen from the northern hemisphere
 * (a waxing moon is lit on the right). Mirror it for the southern hemisphere.
 */
export function moonLitPath(cx: number, cy: number, r: number, age: number): string {
  const angle = 2 * Math.PI * moonCycleFraction(age);
  const waxing = angle < Math.PI;
  const crescent = Math.cos(angle) > 0;
  const terminatorRx = Math.abs(Math.cos(angle)) * r;
  const outerSweep = waxing ? 1 : 0;
  const terminatorSweep = waxing === crescent ? 0 : 1;
  const top = `${cx} ${cy - r}`;
  const bottom = `${cx} ${cy + r}`;
  return `M ${top} A ${r} ${r} 0 0 ${outerSweep} ${bottom} A ${terminatorRx.toFixed(3)} ${r} 0 0 ${terminatorSweep} ${top} Z`;
}
