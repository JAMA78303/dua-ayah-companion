import { useId } from "react";

import { moonLitPath } from "@/lib/prayer/moon";
import { arcPoint, type SkyPeriod } from "@/lib/prayer/sky";

/** Sky colours for each part of the day, top to horizon. */
const SKIES: Record<SkyPeriod, [string, string, string]> = {
  night: ["#060a1c", "#0f1735", "#1c2a55"],
  fajr: ["#0f1a44", "#45508f", "#f0a07e"],
  morning: ["#4f9fdc", "#86c1ea", "#f3e3c0"],
  dhuhr: ["#2f7fd0", "#5fa6e3", "#b9dcf4"],
  asr: ["#4f8cc9", "#9cbfd9", "#f5c98a"],
  maghrib: ["#1d1f4d", "#6b3f73", "#f07f55"],
};
const PERIODS = Object.keys(SKIES) as SkyPeriod[];

const GROUND: Record<SkyPeriod, string> = {
  night: "#04060f",
  fajr: "#0b0e22",
  morning: "#1d2f25",
  dhuhr: "#203528",
  asr: "#2a3122",
  maghrib: "#140e20",
};

const SUN: Record<SkyPeriod, string> = {
  night: "#ff9e5e",
  fajr: "#ff9e5e",
  morning: "#ffe9a8",
  dhuhr: "#fff1c4",
  asr: "#ffc766",
  maghrib: "#ff8a4c",
};

const STAR_OPACITY: Record<SkyPeriod, number> = { night: 0.9, fajr: 0.35, morning: 0, dhuhr: 0, asr: 0, maghrib: 0.45 };

const STARS: [number, number, number][] = [
  [30, 22, 1], [62, 48, 0.8], [88, 16, 1.2], [118, 38, 0.7], [146, 12, 0.9], [176, 44, 1],
  [204, 20, 0.8], [232, 52, 0.7], [258, 14, 1.1], [286, 36, 0.8], [300, 62, 0.7], [46, 76, 0.7],
  [132, 70, 0.6], [214, 80, 0.6], [270, 88, 0.6], [18, 96, 0.6],
];

const SUN_ARC = { left: 26, right: 294, horizon: 122, peak: 26 };
const MOON_ARC = { left: 26, right: 294, horizon: 122, peak: 36 };
const MOON_R = 9;

export interface SkySceneProps {
  period: SkyPeriod;
  /** 0 (rising) to 1 (setting), or null when below the horizon. */
  sun: number | null;
  moon: number | null;
  moonAge: number;
  /** Flip the moon's lit side for the southern hemisphere. */
  southern: boolean;
  label: string;
}

export function SkyScene({ period, sun, moon, moonAge, southern, label }: SkySceneProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const dark = period === "night" || period === "fajr" || period === "maghrib";
  const sunPoint = sun === null ? null : arcPoint(sun, SUN_ARC);
  const moonPoint = moon === null ? null : arcPoint(moon, MOON_ARC);
  const move = "transition-transform duration-700 ease-out motion-reduce:transition-none";
  const fade = "transition-opacity duration-700 motion-reduce:transition-none";

  return (
    <svg viewBox="0 0 320 150" className="block h-auto w-full" role="img" aria-label={label}>
      <defs>
        {PERIODS.map((p) => (
          <linearGradient key={p} id={`${id}-sky-${p}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SKIES[p][0]} />
            <stop offset="0.55" stopColor={SKIES[p][1]} />
            <stop offset="0.85" stopColor={SKIES[p][2]} />
          </linearGradient>
        ))}
        <radialGradient id={`${id}-sun-glow`}>
          <stop offset="0" stopColor="#ffd66b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd66b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-dawn`}>
          <stop offset="0" stopColor="#ffb38a" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffb38a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-dusk`}>
          <stop offset="0" stopColor="#ff7a4d" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ff7a4d" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-frame`}>
          <rect width="320" height="150" rx="14" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-frame)`}>
        {PERIODS.map((p) => (
          <rect key={p} width="320" height="150" fill={`url(#${id}-sky-${p})`} opacity={p === period ? 1 : 0} className={fade} />
        ))}

        {/* First light in the east (left), the afterglow of sunset in the west (right). */}
        <ellipse cx="30" cy="124" rx="150" ry="55" fill={`url(#${id}-dawn)`} opacity={period === "fajr" ? 1 : 0} className={fade} />
        <ellipse cx="290" cy="124" rx="150" ry="55" fill={`url(#${id}-dusk)`} opacity={period === "maghrib" ? 1 : 0} className={fade} />

        <g opacity={STAR_OPACITY[period]} className={fade}>
          {STARS.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" />
          ))}
        </g>

        {moonPoint ? (
          <g style={{ transform: `translate(${moonPoint.x}px, ${moonPoint.y}px)` }} className={move}>
            <g transform={southern ? "scale(-1 1)" : undefined}>
              {dark ? <circle r={MOON_R} fill="#2a3358" opacity="0.6" /> : null}
              <path d={moonLitPath(0, 0, MOON_R, moonAge)} fill={dark ? "#f5f0dc" : "#ffffff"} opacity={dark ? 1 : 0.75} />
            </g>
          </g>
        ) : null}

        {sunPoint ? (
          <g style={{ transform: `translate(${sunPoint.x}px, ${sunPoint.y}px)` }} className={move}>
            <circle r="30" fill={`url(#${id}-sun-glow)`} />
            <circle r="11" fill={SUN[period]} />
          </g>
        ) : null}

        {/* Hills and a mosque on the horizon. */}
        <g fill={GROUND[period]} style={{ transition: "fill 700ms" }}>
          <path d="M0 124 C 60 116 110 127 170 121 S 280 116 320 122 L 320 150 L 0 150 Z" />
          {/* In the middle, under the sun's path, so the sun never sets behind it. */}
          <g transform="translate(-86 0)">
            <rect x="214" y="106" width="40" height="18" />
            <path d="M 217 107 Q 234 80 251 107 Z" />
            <rect x="233" y="80" width="2" height="8" />
            <rect x="258" y="84" width="6" height="40" />
            <rect x="256" y="95" width="10" height="2.5" />
            <path d="M 257 84 L 261 74 L 265 84 Z" />
          </g>
        </g>
      </g>
    </svg>
  );
}
