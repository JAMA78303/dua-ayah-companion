"use client";

import { useEffect, useState } from "react";

import {
  CALCULATION_METHODS,
  PRAYERS,
  fetchDayTimes,
  fetchQiblaDirection,
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

const selectClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2";

function formatCountdown(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `in ${h} h ${m} min` : `in ${m} min`;
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

  const upcoming = day ? nextPrayer(day.timings, nowInTimezone(day.timezone, now)) : null;

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
                {PRAYERS.map((name) => (
                  <li
                    key={name}
                    className={`flex items-center justify-between py-2.5 text-sm ${
                      upcoming?.name === name ? "font-semibold text-[var(--accent-primary)]" : "text-[var(--text-primary)]"
                    } ${name === "Sunrise" ? "text-[var(--text-secondary)]" : ""}`}
                  >
                    <span>{name}</span>
                    <span className="tabular-nums">{day.timings[name]}</span>
                  </li>
                ))}
              </ul>
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
