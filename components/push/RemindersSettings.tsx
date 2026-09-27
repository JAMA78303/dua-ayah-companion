"use client";

import { useEffect, useState } from "react";

const PREFS_KEY = "dua-app:reminders";
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

interface ReminderPrefs {
  morning: boolean;
  evening: boolean;
  timezone: string;
}

type ReminderState =
  | { status: "checking" }
  | { status: "unavailable"; message: string }
  | { status: "blocked" }
  | { status: "off" }
  | { status: "on"; subscription: PushSubscription; prefs: ReminderPrefs };

function readPrefs(): ReminderPrefs | null {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as ReminderPrefs) : null;
  } catch {
    return null;
  }
}

function writePrefs(prefs: ReminderPrefs | null) {
  try {
    if (prefs) window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    else window.localStorage.removeItem(PREFS_KEY);
  } catch {
    // Private mode: the toggles still work, they just won't be remembered here.
  }
}

function deviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = (value + "=".repeat((4 - (value.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function saveSubscription(subscription: PushSubscription, prefs: ReminderPrefs) {
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), ...prefs }),
  });
  if (!response.ok) throw new Error("save failed");
}

function unavailableMessage(): string | null {
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (iOS && !standalone) {
    return "On iPhone, add the app to your Home Screen first (Share → Add to Home Screen), then turn reminders on from there.";
  }
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "This browser doesn't support notifications.";
  }
  if (!VAPID_PUBLIC_KEY) return "Reminders aren't set up on this server yet.";
  return null;
}

export function RemindersSettings() {
  const [state, setState] = useState<ReminderState>({ status: "checking" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const set = (next: ReminderState) => {
      if (!cancelled) setState(next);
    };

    void (async () => {
      const message = unavailableMessage();
      if (message) return set({ status: "unavailable", message });
      // On a first visit the worker may still be registering; give it a moment.
      const registration =
        (await navigator.serviceWorker.getRegistration()) ??
        (await Promise.race([navigator.serviceWorker.ready, new Promise<undefined>((done) => setTimeout(done, 3000))]));
      if (!registration) {
        return set({ status: "unavailable", message: "Reminders work in the installed app (the service worker isn't running here)." });
      }
      if (Notification.permission === "denied") return set({ status: "blocked" });
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return set({ status: "off" });

      const stored = readPrefs();
      const prefs = { morning: stored?.morning ?? true, evening: stored?.evening ?? true, timezone: deviceTimezone() };
      // Travelled to a new timezone (or first run on this device): keep the server in step.
      if (!stored || stored.timezone !== prefs.timezone) {
        try {
          await saveSubscription(subscription, prefs);
          writePrefs(prefs);
        } catch {
          // Try again next time the sheet opens.
        }
      }
      set({ status: "on", subscription, prefs });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function turnOn() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? { status: "blocked" } : { status: "off" });
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY),
        }));
      const prefs = { morning: true, evening: true, timezone: deviceTimezone() };
      await saveSubscription(subscription, prefs);
      writePrefs(prefs);
      setState({ status: "on", subscription, prefs });
    } catch {
      setError("Couldn't turn reminders on. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function turnOff(subscription: PushSubscription) {
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
      writePrefs(null);
      setState({ status: "off" });
    } catch {
      setError("Couldn't turn reminders off. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(kind: "morning" | "evening") {
    if (state.status !== "on") return;
    const prefs = { ...state.prefs, [kind]: !state.prefs[kind], timezone: deviceTimezone() };
    if (!prefs.morning && !prefs.evening) return turnOff(state.subscription);
    setBusy(true);
    setError(null);
    try {
      await saveSubscription(state.subscription, prefs);
      writePrefs(prefs);
      setState({ ...state, prefs });
    } catch {
      setError("Couldn't save that change. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 space-y-3 border-t border-[var(--border)] pt-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Adhkar reminders</h3>

      {state.status === "checking" ? (
        <p className="text-xs text-[var(--text-secondary)]">Checking…</p>
      ) : state.status === "unavailable" ? (
        <p className="text-xs text-[var(--text-secondary)]">{state.message}</p>
      ) : state.status === "blocked" ? (
        <p className="text-xs text-[var(--text-secondary)]">
          Notifications are blocked for this app. Allow them in your browser or phone settings, then come back here.
        </p>
      ) : state.status === "off" ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-secondary)]">A gentle nudge for your morning and evening adhkar.</p>
          <button
            type="button"
            onClick={() => void turnOn()}
            disabled={busy}
            className="shrink-0 rounded-md bg-[var(--accent-primary)] px-3 py-1.5 text-sm font-semibold text-[var(--on-accent-text)] disabled:opacity-60"
          >
            {busy ? "Turning on…" : "Turn on"}
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--text-secondary)]">Sent at your local time. Untick both to stop reminders.</p>
          {(
            [
              ["morning", "Morning adhkar", "from 7am"],
              ["evening", "Evening adhkar", "from 5pm"],
            ] as const
          ).map(([kind, label, when]) => (
            <label key={kind} className="flex items-center justify-between gap-3 text-sm text-[var(--text-primary)]">
              <span>
                {label} <span className="text-xs text-[var(--text-secondary)]">{when}</span>
              </span>
              <input
                type="checkbox"
                checked={state.prefs[kind]}
                disabled={busy}
                onChange={() => void toggle(kind)}
                className="h-4 w-4 accent-[var(--accent-primary)]"
              />
            </label>
          ))}
        </>
      )}

      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
