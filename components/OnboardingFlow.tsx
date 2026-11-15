"use client";

import { BookOpen, Check, HandHeart, HeartHandshake, Share, SquarePlus, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { StarMark } from "@/components/brand/StarMark";
import { useReciter } from "@/components/ReciterProvider";
import { useTheme } from "@/components/ThemeProvider";
import { KISWAH_THEME_META } from "@/lib/theme/kiswahThemes";
import { THEME_IDS, canUseTheme } from "@/types/theme";

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

type Step = "welcome" | "rhythm" | "space" | "install" | "ready";

const RHYTHM = [
  { Icon: HeartHandshake, title: "Name what is here", body: "Type freely or choose a feeling. Your words stay on this device." },
  { Icon: BookOpen, title: "Receive an ayah", body: "Allah's words in Arabic, with a translation and its context from the classical tafsir." },
  { Icon: HandHeart, title: "Answer with dua", body: "Sourced words to return to Allah with, then a moment to reflect." },
];

const eyebrow = "text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent-primary)]";
const title = "font-playfair text-[30px] font-semibold leading-tight text-[var(--text-primary)]";

/** An iPhone browser tab that hasn't been added to the Home Screen. */
function needsIPhoneInstall(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return /iPad|iPhone|iPod/.test(nav.userAgent) && nav.standalone !== true;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const router = useRouter();
  const { theme, setTheme, isSupporter } = useTheme();
  const { reciters, reciterId, saveReciterId } = useReciter();
  const [steps, setSteps] = useState<Step[]>(["welcome", "rhythm", "space", "ready"]);
  const [index, setIndex] = useState(0);
  const step = steps[index];

  useEffect(() => {
    // Checked after mount: the server can't know the device.
    queueMicrotask(() => {
      if (needsIPhoneInstall()) setSteps(["welcome", "rhythm", "space", "install", "ready"]);
    });
  }, []);

  const next = () => setIndex((i) => Math.min(i + 1, steps.length - 1));
  const finish = () => {
    onComplete();
    router.push("/discover");
  };

  const primary = {
    welcome: { label: "Begin gently", action: next },
    rhythm: { label: "Continue", action: next },
    space: { label: "Continue", action: next },
    install: { label: "I'll do this later", action: next },
    ready: { label: "Go to Discover", action: finish },
  }[step];

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-var(--app-header-h)-4rem)] w-full max-w-md flex-1 flex-col px-5 pb-6 pt-5">
      <div className="flex min-h-9 items-center justify-between">
        <div className="flex gap-1.5" aria-label={`Step ${index + 1} of ${steps.length}`} role="img">
          {steps.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-[var(--accent-primary)]" : "w-1.5 bg-[var(--border)]"}`}
            />
          ))}
        </div>
        {step !== "ready" ? (
          <button type="button" onClick={onSkip} className="min-h-9 px-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-primary)]">
            Skip
          </button>
        ) : null}
      </div>

      <section className="flex flex-1 flex-col justify-center gap-6 py-8">
        {step === "welcome" ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <StarMark size={72} />
            <h1 className="font-playfair text-[40px] font-semibold leading-none text-[var(--text-primary)]">Companion</h1>
            <p dir="rtl" lang="ar" className="font-scheherazade text-[34px] leading-[1.8] text-[var(--text-arabic)]">
              وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ
            </p>
            <p className="font-playfair text-xl leading-snug text-[var(--text-primary)]">
              &ldquo;And He is with you wherever you are.&rdquo;
            </p>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] px-3 py-1 text-[11px] font-bold text-[var(--gold)]">
              Qur&apos;an 57:4
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
              Meet what you feel with revelation, remembrance and a way forward.
            </p>
          </div>
        ) : null}

        {step === "rhythm" ? (
          <>
            <h1 className={title}>A simple, sacred rhythm</h1>
            <ul className="space-y-5">
              {RHYTHM.map(({ Icon, title: t, body }) => (
                <li key={t} className="flex gap-3.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--accent-primary)]">
                    <Icon className="size-5" strokeWidth={1.6} aria-hidden />
                  </span>
                  <span>
                    <span className="block font-playfair text-xl font-semibold text-[var(--text-primary)]">{t}</span>
                    <span className="block text-sm leading-relaxed text-[var(--text-secondary)]">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {step === "space" ? (
          <>
            <div className="space-y-1.5">
              <h1 className={title}>Make the space yours</h1>
              <p className="text-sm text-[var(--text-secondary)]">You can change these any time.</p>
            </div>
            <div className="space-y-2.5">
              <p className={eyebrow}>Kiswah theme</p>
              <div className="flex flex-wrap gap-2">
                {THEME_IDS.filter((id) => canUseTheme(id, isSupporter)).map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={theme === id}
                    onClick={() => void setTheme(id)}
                    className={`inline-flex min-h-9 items-center rounded-full border px-3.5 text-xs font-bold transition ${
                      theme === id
                        ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--on-accent-text)]"
                        : "border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)]"
                    }`}
                  >
                    {KISWAH_THEME_META[id].nameEnglish.split(" · ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              <p className={eyebrow}>Reciter</p>
              <ul className="card-elevated divide-y divide-[var(--border)] overflow-hidden p-0">
                {reciters.slice(0, 3).map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      aria-pressed={reciterId === r.id}
                      onClick={() => saveReciterId(r.id)}
                      className="flex min-h-[60px] w-full items-center gap-3 px-4 text-left transition hover:bg-[var(--bg-subtle)]"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--accent-primary)]">
                        <Volume2 className="size-[18px]" strokeWidth={1.6} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[var(--text-primary)]">{r.name}</span>
                        {r.style ? <span className="block text-[11px] text-[var(--text-secondary)]">{r.style}</span> : null}
                      </span>
                      {reciterId === r.id ? (
                        <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)]">Selected</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[var(--text-secondary)]">More reciters are in the Qur&apos;an reader.</p>
            </div>
          </>
        ) : null}

        {step === "install" ? (
          <>
            <div className="space-y-1.5">
              <h1 className={title}>Keep Companion one tap away</h1>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Add it to your Home Screen from Safari and it opens full screen, like an app.
              </p>
            </div>
            <ol className="space-y-3">
              {[
                { Icon: Share, text: "Tap the Share button at the bottom of Safari." },
                { Icon: SquarePlus, text: "Choose “Add to Home Screen”." },
                { Icon: Check, text: "Keep the name “Companion” and tap Add." },
              ].map(({ Icon, text }, i) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="w-6 shrink-0 font-playfair text-lg text-[var(--gold)]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="card-elevated flex flex-1 items-center gap-3 p-3.5">
                    <Icon className="size-[18px] shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
                    <span className="text-sm text-[var(--text-primary)]">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {step === "ready" ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <span className="flex size-[76px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] text-[var(--accent-primary)]">
              <Check className="size-8" strokeWidth={1.6} aria-hidden />
            </span>
            <h1 className={title}>Your Companion is ready</h1>
            <p className="max-w-xs text-sm text-[var(--text-secondary)]">Begin with what you&apos;re feeling, or simply sit with an ayah.</p>
            <figure className="card-elevated w-full space-y-3 p-5 text-left">
              <span className="rounded-full bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] px-2.5 py-1 text-[10px] font-bold text-[var(--gold)]">
                Ash-Sharh 94:5
              </span>
              <p dir="rtl" lang="ar" className="font-scheherazade text-right text-[32px] leading-[1.9] text-[var(--text-arabic)]">
                فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا
              </p>
              <figcaption className="text-sm leading-relaxed text-[var(--text-primary)]">For indeed, with hardship comes ease.</figcaption>
            </figure>
          </div>
        ) : null}
      </section>

      <button
        type="button"
        onClick={primary.action}
        className={`flex min-h-12 w-full items-center justify-center rounded-full text-sm font-bold transition hover:opacity-90 ${
          step === "install"
            ? "bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] text-[var(--text-primary)]"
            : "bg-[var(--accent-primary)] text-[var(--on-accent-text)]"
        }`}
      >
        {primary.label}
      </button>
      {step === "install" ? (
        <button type="button" onClick={next} className="mt-2 min-h-11 text-sm font-bold text-[var(--accent-primary)]">
          I&apos;ve added it
        </button>
      ) : null}
    </main>
  );
}
