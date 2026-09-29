"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MoonCard } from "@/components/prayer/MoonCard";
import { SkyScene } from "@/components/prayer/SkyScene";
import { moonAge, moonIllumination, moonPhaseName } from "@/lib/prayer/moon";
import { PRAYER_HADITH } from "@/lib/prayer/prayerHadith";
import {
  CALCULATION_METHODS,
  duhaWindow,
  fetchDayTimes,
  fetchQiblaDirection,
  minutesOf,
  nextPrayer,
  nowInTimezone,
  readPrayerSettings,
  roundedLocation,
  searchPlaces,
  writePrayerSettings,
  type DayTimes,
  type PlaceResult,
  type PrayerSettings,
} from "@/lib/prayer/prayerTimes";
import { moonProgress, prayerMoment, previewMinutes, skyPeriod, sunProgress, type PrayerMoment } from "@/lib/prayer/sky";

const selectClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2";

function formatCountdown(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `in ${h} h ${m} min` : `in ${m} min`;
}

type ListedMoment = Exclude<PrayerMoment, "LastThird">;

/** The rows of the timetable: the five prayers, sunrise, and the voluntary Duha. */
const ROWS: ListedMoment[] = ["Fajr", "Sunrise", "Duha", "Dhuhr", "Asr", "Maghrib", "Isha"];

const MOMENT_CAPTIONS: Record<PrayerMoment, string> = {
  Fajr: "Fajr · first light, before sunrise",
  Sunrise: "Sunrise · wait until the sun is up to pray",
  Duha: "Duha · the sun is up, the time for Duha",
  Dhuhr: "Dhuhr · the sun has passed its height",
  Asr: "Asr · the sun is lowering",
  Maghrib: "Maghrib · the sun has set",
  Isha: "Isha · night",
  LastThird: "The last third of the night",
};

function PrayerHadithCard({ moment }: { moment: PrayerMoment }) {
  return (
    <div className="space-y-3 rounded-xl border border-[var(--border)] px-4 py-3">
      {PRAYER_HADITH[moment].map((hadith) => (
        <blockquote key={hadith.source} className="space-y-1">
          <p className="text-sm leading-relaxed text-[var(--text-primary)]">{hadith.text}</p>
          <footer className="text-xs text-[var(--text-secondary)]">
            <a href={hadith.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent-primary)] hover:opacity-80">
              {hadith.source}
            </a>
            {hadith.grade ? ` · ${hadith.grade}` : null}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}

function QiblaDial({ bearing }: { bearing: number }) {
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-24 shrink-0" role="img" aria-label={`Qibla ${Math.round(bearing)} degrees from north`}>
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--border)" strokeWidth="2" />
        <text x="50" y="14" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">N</text>
        <g transform={`rotate(${bearing} 50 50)`}>
          <line x1="50" y1="50" x2="50" y2="14" stroke="var(--accent-primary)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="14" r="5" fill="var(--gold)" />
        </g>
        <circle cx="50" cy="50" r="4" fill="var(--text-primary)" />
      </svg>
      <p className="text-sm text-[var(--text-secondary)]">
        <span className="block text-2xl font-semibold text-[var(--text-primary)]">{`${Math.round(bearing)}°`}</span>
        clockwise from true north. Use a compass, or face this direction from north on a map.
      </p>
    </div>
  );
}

export function PrayerTimesView() {
  const [settings, setSettings] = useState<PrayerSettings | null>(null);
  const [day, setDay] = useState<DayTimes | null>(null);
  const [qibla, setQibla] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[] | null>(null);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [preview, setPreview] = useState<ListedMoment | null>(null);

  useEffect(() => {
    queueMicrotask(() => setSettings(readPrayerSettings()));
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!settings?.location) return;
    let cancelled = false;
    queueMicrotask(() => setStatus("loading"));
    Promise.all([fetchDayTimes(settings, new Date()), fetchQiblaDirection(settings.location)])
      .then(([times, direction]) => {
        if (cancelled) return;
        setDay(times);
        setQibla(direction);
        setStatus("idle");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [settings]);

  function update(next: PrayerSettings) {
    writePrayerSettings(next);
    setSettings(next);
  }

  function useMyLocation() {
    if (!settings) return;
    if (!navigator.geolocation) {
      setMessage("This browser can't share your location. Search for your city instead.");
      return;
    }
    setLocating(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        update({ ...settings, location: roundedLocation(position.coords.latitude, position.coords.longitude, "Your location") });
      },
      () => {
        setLocating(false);
        setMessage("Location permission wasn't given. Search for your city instead.");
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 3_600_000 },
    );
  }

  async function search() {
    if (!query.trim()) return;
    setMessage(null);
    try {
      const found = await searchPlaces(query);
      setResults(found);
      if (found.length === 0) setMessage("No places found. Try the city and country, e.g. \"Leeds, UK\".");
    } catch {
      setMessage("Place search isn't available right now.");
    }
  }

  if (!settings) return <p className="text-sm text-[var(--text-secondary)]">Loading...</p>;

  const nowMinutes = day ? minutesOf(nowInTimezone(day.timezone, now)) : 0;
  const upcoming = day ? nextPrayer(day.timings, nowInTimezone(day.timezone, now)) : null;
  const age = moonAge(now);
  const southern = (settings.location?.latitude ?? 0) < 0;
  const skyMinutes = day && preview ? previewMinutes(preview, day.timings) : nowMinutes;
  const period = day ? skyPeriod(day.timings, skyMinutes) : "night";
  const sun = day ? sunProgress(day.timings, skyMinutes) : null;
  const moon = day ? moonProgress(day.timings, skyMinutes, age) : null;
  const moment = day ? prayerMoment(day.timings, skyMinutes, day.lastThird) : "Isha";
  const caption = MOMENT_CAPTIONS[moment];
  const duha = day ? duhaWindow(day.timings) : null;
  const rowTime = (row: ListedMoment) => (row === "Duha" ? `${duha!.start}–${duha!.end}` : day!.timings[row]);

  return (
    <div className="space-y-6">
      {settings.location ? (
        <section className="card-elevated space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{settings.location.label}</p>
            <button type="button" onClick={() => update({ ...settings, location: null })} className="text-xs text-[var(--accent-primary)]">
              Change
            </button>
          </div>

          {status === "loading" && !day ? <p className="text-sm text-[var(--text-secondary)]">Loading today&apos;s times...</p> : null}
          {status === "error" ? <p className="text-sm text-[var(--text-secondary)]">Prayer times couldn&apos;t load. Check your connection and try again.</p> : null}

          {day ? (
            <>
              <figure className="space-y-2">
                <SkyScene
                  period={period}
                  sun={sun}
                  moon={moon}
                  moonAge={age}
                  southern={southern}
                  label={`${caption}. ${moon === null ? "The moon is below the horizon." : `${moonPhaseName(age)} moon, ${Math.round(moonIllumination(age) * 100)}% lit.`}`}
                />
                <figcaption className="flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
                  <span>{preview ? `${caption} (at ${preview === "Duha" ? duha!.best : day.timings[preview]})` : caption}</span>
                  {preview ? (
                    <button type="button" onClick={() => setPreview(null)} className="shrink-0 font-semibold text-[var(--accent-primary)]">
                      Back to now
                    </button>
                  ) : (
                    <span className="shrink-0">Tap a prayer to see its sky</span>
                  )}
                </figcaption>
              </figure>
              <PrayerHadithCard moment={moment} />
              <p className="rounded-xl bg-[var(--bg-subtle)] px-4 py-3 text-sm text-[var(--text-primary)]">
                {upcoming ? (
                  <>
                    <span className="font-semibold">{upcoming.name}</span>
                    {` ${formatCountdown(upcoming.inMinutes)}`}
                  </>
                ) : (
                  // Tomorrow's Fajr is within a minute or two of today's.
                  `Isha has passed. Fajr tomorrow is around ${day.timings.Fajr}.`
                )}
              </p>
              <ul className="divide-y divide-[var(--border)]">
                {ROWS.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      aria-pressed={preview === name}
                      onClick={() => setPreview(preview === name ? null : name)}
                      className={`-mx-2 flex w-[calc(100%+1rem)] items-center justify-between rounded-lg px-2 py-2.5 text-left text-sm transition hover:bg-[var(--bg-subtle)] ${
                        preview === name ? "bg-[var(--bg-subtle)]" : ""
                      } ${
                        upcoming?.name === name
                          ? "font-semibold text-[var(--accent-primary)]"
                          : name === "Sunrise" || name === "Duha"
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-primary)]"
                      }`}
                    >
                      <span>
                        {name}
                        {name === "Duha" ? <span className="ml-2 text-xs">voluntary</span> : null}
                      </span>
                      <span className="tabular-nums">{rowTime(name)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {duha ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  {`Duha is prayed once the sun is up until shortly before Dhuhr, best around ${duha.best} when the sun is hot. The times shown are approximate.`}
                </p>
              ) : null}
              {day.lastThird ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  {`The last third of the night begins around ${day.lastThird}, a time when dua is answered. `}
                  <Link href="/duas/how-to#times" className="font-medium text-[var(--accent-primary)] hover:opacity-80">
                    How to make dua
                  </Link>
                </p>
              ) : null}
              <p className="text-xs text-[var(--text-secondary)]">{`Times are for ${day.timezone.replace(/_/g, " ")}.`}</p>
            </>
          ) : null}
        </section>
      ) : (
        <section className="card-elevated space-y-4 p-5">
          <p className="text-sm text-[var(--text-primary)]">Set your location to see today&apos;s prayer times and the qibla.</p>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="w-full rounded-full bg-[var(--accent-primary)] py-2.5 text-sm font-semibold text-[var(--on-accent-text)] disabled:opacity-60"
          >
            {locating ? "Finding you..." : "Use my location"}
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void search();
            }}
            className="flex gap-2"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Or search for a city"
              aria-label="Search for a city"
              className={selectClass}
            />
            <button type="submit" className="shrink-0 rounded-full border border-[var(--border)] px-4 text-sm text-[var(--text-primary)]">
              Search
            </button>
          </form>
          {results?.length ? (
            <ul className="space-y-1">
              {results.map((place) => (
                <li key={`${place.label}-${place.latitude}`}>
                  <button
                    type="button"
                    onClick={() => update({ ...settings, location: roundedLocation(place.latitude, place.longitude, place.label) })}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                  >
                    {place.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {message ? <p className="text-xs text-[var(--text-secondary)]">{message}</p> : null}
          <p className="text-xs text-[var(--text-secondary)]">
            Your location stays on this device (rounded to about 1 km) and is only sent to Aladhan to calculate the times.
          </p>
        </section>
      )}

      {settings.location && day ? <MoonCard age={age} hijri={day.hijri} southern={southern} /> : null}

      {settings.location && qibla !== null ? (
        <section className="card-elevated space-y-3 p-5">
          <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">Qibla</h2>
          <QiblaDial bearing={qibla} />
        </section>
      ) : null}

      <section className="card-elevated space-y-3 p-5">
        <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">Calculation</h2>
        <label className="block space-y-1 text-xs text-[var(--text-secondary)]">
          Method (use your local mosque&apos;s, if you know it)
          <select value={settings.method} onChange={(e) => update({ ...settings, method: Number(e.target.value) })} className={selectClass}>
            {CALCULATION_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-xs text-[var(--text-secondary)]">
          Asr
          <select value={settings.school} onChange={(e) => update({ ...settings, school: Number(e.target.value) === 1 ? 1 : 0 })} className={selectClass}>
            <option value={0}>Standard (Shafi&apos;i, Maliki, Hanbali)</option>
            <option value={1}>Hanafi</option>
          </select>
        </label>
      </section>
    </div>
  );
}
