import { moonIllumination, moonLitPath, moonPhaseName } from "@/lib/prayer/moon";
import { HIJRI_MONTHS, type HijriDate } from "@/lib/prayer/prayerTimes";

const WHITE_DAYS_HADITH = "https://sunnah.com/tirmidhi:761";

function whiteDaysNote(day: number): string | null {
  if (day >= 13 && day <= 15) return "Today is one of the white days, the 13th to the 15th, when the moon is full.";
  if (day >= 10 && day < 13) {
    const inDays = 13 - day;
    return `The white days, the 13th to the 15th, begin ${inDays === 1 ? "tomorrow" : `in ${inDays} days`}.`;
  }
  return null;
}

/** Today's moon: its phase as it looks, and where we are in the Islamic month. */
export function MoonCard({ age, hijri, southern }: { age: number; hijri: HijriDate | null; southern: boolean }) {
  const phase = moonPhaseName(age);
  const lit = Math.round(moonIllumination(age) * 100);
  const whiteDays = hijri ? whiteDaysNote(hijri.day) : null;

  return (
    <section className="card-elevated space-y-3 p-5">
      <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">The moon</h2>
      <div className="flex items-center gap-4">
        <svg viewBox="-24 -24 48 48" className="size-20 shrink-0" role="img" aria-label={`${phase}, ${lit}% lit`}>
          <circle r="22" fill="#0f1735" />
          <g transform={southern ? "scale(-1 1)" : undefined}>
            <circle r="17" fill="#2a3358" />
            <path d={moonLitPath(0, 0, 17, age)} fill="#f5f0dc" />
          </g>
        </svg>
        <div className="min-w-0 space-y-1">
          <p className="text-base font-semibold text-[var(--text-primary)]">{phase}</p>
          <p className="text-sm text-[var(--text-secondary)]">{`${lit}% lit · ${Math.floor(age)} ${Math.floor(age) === 1 ? "day" : "days"} since the new moon`}</p>
          {hijri ? (
            <p className="text-sm text-[var(--text-primary)]">{`${hijri.day} ${HIJRI_MONTHS[hijri.month - 1]} ${hijri.year} AH`}</p>
          ) : null}
        </div>
      </div>
      {whiteDays ? (
        <p className="rounded-xl bg-[var(--bg-subtle)] px-4 py-3 text-sm leading-relaxed text-[var(--text-primary)]">
          {`${whiteDays} The Prophet ﷺ told Abu Dharr that if he fasted three days of a month, to fast these. `}
          <a href={WHITE_DAYS_HADITH} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent-primary)] hover:opacity-80">
            Jami&apos; at-Tirmidhi 761
          </a>
          <span className="text-[var(--text-secondary)]"> · Hasan Sahih (al-Albani)</span>
        </p>
      ) : null}
      <p className="text-xs text-[var(--text-secondary)]">
        The Islamic date is calculated, so it can be a day off from the moon sighting where you are.
      </p>
    </section>
  );
}
