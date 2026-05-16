interface OnboardingScreen1Props {
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingScreen1({ onNext, onSkip }: OnboardingScreen1Props) {
  return (
    <section className="onboarding-splash relative -mx-4 flex min-h-[min(85dvh,640px)] flex-col items-center justify-center gap-5 overflow-hidden rounded-none px-6 py-12 text-center md:-mx-8 md:min-h-[min(80dvh,720px)] md:px-10">
      <p
        dir="rtl"
        lang="ar"
        className="onboarding-splash-text font-scheherazade relative z-10 text-4xl leading-loose md:text-5xl"
      >
        مَا أَنزَلْنَا عَلَيْكَ ٱلْقُرْءَانَ لِتَشْقَىٰٓ
      </p>

      <p className="onboarding-splash-text relative z-10 max-w-md text-xl italic">
        &quot;We have not sent down the Qur&apos;an to you to cause you distress&quot;
      </p>

      <p className="onboarding-splash-pill relative z-10 rounded-full px-4 py-1.5 text-sm font-medium">
        Surah Ta-Ha, Ayah 2
      </p>

      <p className="onboarding-splash-muted relative z-10 mx-auto max-w-sm text-base leading-relaxed">
        This app exists in the spirit of that ayah. Wherever you are right now — that is exactly the
        right place to start.
      </p>

      <div className="relative z-10 flex flex-col items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onNext}
          className="onboarding-splash-btn rounded-full px-8 py-3 text-base font-semibold transition hover:opacity-90"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="onboarding-splash-muted text-sm underline underline-offset-2"
        >
          Skip
        </button>
      </div>
    </section>
  );
}
