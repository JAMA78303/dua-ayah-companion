"use client";

import { useEffect, useState } from "react";

const ONBOARDING_KEY = "onboarding-complete";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    queueMicrotask(() => setShowOnboarding(!seen));
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  return { showOnboarding, completeOnboarding, skipOnboarding };
}
