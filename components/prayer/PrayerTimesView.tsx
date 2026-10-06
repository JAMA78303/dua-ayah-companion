"use client";

import Link from "next/link";
import { CloudSun, LocateFixed, MapPin, Moon, MoonStar, Search, ShieldCheck, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";
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
  "w-full rounded-[12px] border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2";

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

const MOMENT_TITLES: Record<PrayerMoment, string> = {
  Fajr: "At Fajr",
  Sunrise: "At sunrise",
  Duha: "The Duha prayer",
  Dhuhr: "At Dhuhr",
  Asr: "At Asr",
  Maghrib: "At Maghrib",
  Isha: "At Isha",
  LastThird: "In the last third of the night",
};

const ROW_ICONS: Record<ListedMoment, LucideIcon> = {
  Fajr: Sunrise,
  Sunrise: Sunrise,
  Duha: Sun,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: MoonStar,
};

function PrayerHadithCard({ moment }: { moment: PrayerMoment }) {
  return (
    <section className="space-y-3 rounded-[18px] border border-[color-mix(in_srgb,var(--gold)_35%,transparent)] bg-[color-mix(in_srgb,var(--gold)_12%,var(--card-bg))] p-4">
      <h2 className="font-playfair text-xl font-semibold text-[var(--text-primary)]">{MOMENT_TITLES[moment]}</h2>
      {PRAYER_HADITH[moment].map((hadith) => (
        <blockquote key={hadith.source} className="space-y-2">
          <p className="font-playfair text-[17px] leading-relaxed text-[var(--text-primary)]">{`“${hadith.text}”`}</p>
          <footer className="text-xs text-[var(--text-secondary)]">
            <a
              href={hadith.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[var(--card-bg)] px-2.5 py-1 font-bold text-[var(--accent-primary)] hover:opacity-80"
            >
              {hadith.source}
            </a>
            {hadith.grade ? ` · ${hadith.grade}` : null}
          </footer>
        </blockquote>
      ))}
    </section>
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

  if (!settings) return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>;

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

  const place = settings.location?.label.split(",")[0] ?? "";

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent-primary)]">
            {settings.location ? "Prayer times" : "Location needed"}
          </p>
          <h1 className="truncate font-playfair text-[32px] font-semibold leading-tight text-[var(--text-primary)]">
            {settings.location ? place : "Prayer times"}
          </h1>
        </div>
        {settings.location ? (
          <button
            type="button"
            onClick={() => update({ ...settings, location: null })}
            className="mt-3 inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-3 text-xs font-bold text-[var(--text-primary)]"
          >
            <MapPin className="size-3.5" strokeWidth={1.8} aria-hidden />
            Change
          </button>
        ) : null}
      </header>

      {settings.location ? (
        <>
          {status === "loading" && !day ? <p className="text-sm text-[var(--text-secondary)]">Loading today&apos;s times…</p> : null}
          {status === "error" ? <p className="text-sm text-[var(--text-secondary)]">Prayer times couldn&apos;t load. Check your connection and try again.</p> : null}

          {day ? (
            <>
              <div className="space-y-0.5">
                {upcoming ? (
                  <>
                    <p className="text-xs text-[var(--text-secondary)]">{`${upcoming.name} in`}</p>
                    <p className="font-playfair text-[38px] font-semibold leading-none tabular-nums text-[var(--text-primary)]">
                      {formatCountdown(upcoming.inMinutes).replace(/^in /, "")}
                    </p>
                    <p className="pt-1 text-xs font-bold text-[var(--gold)]">{`Today · ${day.timings[upcoming.name]}`}</p>
                  </>
                ) : (
                  // Tomorrow's Fajr is within a minute or two of today's.
                  <p className="text-sm text-[var(--text-primary)]">{`Isha has passed. Fajr tomorrow is around ${day.timings.Fajr}.`}</p>
                )}
              </div>

              <figure className="card-elevated space-y-2 overflow-hidden p-2">
                <SkyScene
                  period={period}
                  sun={sun}
                  moon={moon}
                  moonAge={age}
                  southern={southern}
                  label={`${caption}. ${moon === null ? "The moon is below the horizon." : `${moonPhaseName(age)} moon, ${Math.round(moonIllumination(age) * 100)}% lit.`}`}
                />
                <figcaption className="flex items-center justify-between gap-3 px-2 pb-1 text-xs text-[var(--text-secondary)]">
                  <span>{preview ? `${caption} (at ${preview === "Duha" ? duha!.best : day.timings[preview]})` : caption}</span>
                  {preview ? (
                    <button type="button" onClick={() => setPreview(null)} className="shrink-0 font-bold text-[var(--accent-primary)]">
                      Back to now
                    </button>
                  ) : (
                    <span className="shrink-0">Tap a prayer to see its sky</span>
                  )}
                </figcaption>
              </figure>

              <ul className="card-elevated space-y-0.5 p-2">
                {ROWS.map((name) => {
                  const Icon = ROW_ICONS[name];
                  const next = upcoming?.name === name;
                  return (
                    <li key={name}>
                      <button
                        type="button"
                        aria-pressed={preview === name}
                        onClick={() => setPreview(preview === name ? null : name)}
                        className={`flex min-h-12 w-full items-center gap-3 rounded-[12px] px-3 text-left text-sm transition hover:bg-[var(--bg-subtle)] ${
                          next
                            ? "bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] font-bold text-[var(--accent-primary)]"
                            : preview === name
                              ? "bg-[var(--bg-subtle)]"
                              : ""
                        } ${!next && (name === "Sunrise" || name === "Duha") ? "text-[var(--text-secondary)]" : !next ? "text-[var(--text-primary)]" : ""}`}
                      >
                        <Icon className="size-[18px] shrink-0 opacity-70" strokeWidth={1.6} aria-hidden />
                        <span className="flex-1">
                          {name}
                          {name === "Duha" ? <span className="ml-2 text-[11px] font-normal">voluntary</span> : null}
                        </span>
                        <span className="font-bold tabular-nums">{rowTime(name)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {duha ? (
                <p className="px-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {`Duha is prayed once the sun is up until shortly before Dhuhr, best around ${duha.best} when the sun is hot. The times shown are approximate.`}
                </p>
              ) : null}

              {day.lastThird ? (
                <section className="card-elevated flex items-start justify-between gap-3 p-4">
                  <div className="space-y-1">
                    <h2 className="font-playfair text-xl font-semibold text-[var(--text-primary)]">Last third of the night</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {`Begins around ${day.lastThird}, a time when dua is answered. `}
                      <Link href="/duas/how-to#times" className="font-bold text-[var(--accent-primary)] hover:opacity-80">
                        How to make dua
                      </Link>
                    </p>
                  </div>
                  <Moon className="size-6 shrink-0 text-[var(--gold)]" strokeWidth={1.6} aria-hidden />
                </section>
              ) : null}

              <PrayerHadithCard moment={moment} />
              <p className="px-1 text-xs text-[var(--text-secondary)]">{`Times are for ${day.timezone.replace(/_/g, " ")}. Your local mosque's timetable always takes priority.`}</p>
            </>
          ) : null}
        </>
      ) : (
        <>
          <section className="card-elevated space-y-3 p-5">
            <span className="flex size-11 items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--accent-primary)]">
              <MapPin className="size-5" strokeWidth={1.6} aria-hidden />
            </span>
            <h2 className="font-playfair text-[22px] font-semibold text-[var(--text-primary)]">Find prayer times near you</h2>
            <p className="text-sm text-[var(--text-secondary)]">Use your location once, or search for a city. Companion never tracks where you go.</p>
          </section>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent-primary)] text-sm font-bold text-[var(--on-accent-text)] disabled:opacity-60"
          >
            <LocateFixed className="size-[18px]" strokeWidth={1.8} aria-hidden />
            {locating ? "Finding you…" : "Use current location"}
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void search();
            }}
          >
            <label className="flex min-h-12 items-center gap-2.5 rounded-[18px] border border-[var(--border)] bg-[var(--input-bg)] px-4 focus-within:border-[var(--accent-primary)]">
              <Search className="size-[18px] shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
              <span className="sr-only">Search for a city</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city or town"
                enterKeyHint="search"
                className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
              />
            </label>
          </form>
          {results?.length ? (
            <ul className="card-elevated p-1.5">
              {results.map((place) => (
                <li key={`${place.label}-${place.latitude}`}>
                  <button
                    type="button"
                    onClick={() => update({ ...settings, location: roundedLocation(place.latitude, place.longitude, place.label) })}
                    className="w-full rounded-[12px] px-3 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                  >
                    {place.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {message ? <p className="text-xs text-[var(--text-secondary)]">{message}</p> : null}
          <section className="space-y-1 rounded-[18px] border border-[color-mix(in_srgb,var(--gold)_35%,transparent)] bg-[color-mix(in_srgb,var(--gold)_12%,var(--card-bg))] p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <ShieldCheck className="size-4 text-[var(--gold)]" strokeWidth={1.8} aria-hidden />
              Location stays private
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Kept on this device, rounded to about 1 km, and only sent to Aladhan to calculate the times.
            </p>
          </section>
        </>
      )}

      {settings.location && day ? <MoonCard age={age} hijri={day.hijri} southern={southern} /> : null}

      {settings.location && qibla !== null ? (
        <section className="card-elevated space-y-3 p-5">
          <h2 className="font-playfair text-xl font-semibold text-[var(--text-primary)]">Qibla</h2>
          <QiblaDial bearing={qibla} />
        </section>
      ) : null}

      <section className="card-elevated space-y-3 p-5">
        <h2 className="font-playfair text-xl font-semibold text-[var(--text-primary)]">Calculation method</h2>
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
