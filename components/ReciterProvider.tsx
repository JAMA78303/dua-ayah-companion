"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { saveReciterPreference } from "@/app/actions/reciter";
import { createClient } from "@/lib/supabase/client";
import {
  FALLBACK_RECITERS,
  fetchReciters,
  findReciterById,
  getReciterShortName,
  type QfReciter,
} from "@/lib/quranFoundation/fetchReciters";
import {
  DEFAULT_RECITER_ID,
  getReciterIdFromStorage,
  saveReciterIdToStorage,
} from "@/lib/quranFoundation/reciterPreference";

type ReciterContextValue = {
  reciterId: number;
  reciters: QfReciter[];
  reciterName: string;
  reciterShortName: string;
  ready: boolean;
  toast: string | null;
  saveReciterId: (id: number) => void;
  dismissToast: () => void;
};

const ReciterContext = createContext<ReciterContextValue | null>(null);

export function useReciter(): ReciterContextValue {
  const ctx = useContext(ReciterContext);
  if (!ctx) {
    throw new Error("useReciter must be used within ReciterProvider");
  }
  return ctx;
}

export function ReciterProvider({ children }: { children: ReactNode }) {
  const [reciterId, setReciterId] = useState(DEFAULT_RECITER_ID);
  const [reciters, setReciters] = useState<QfReciter[]>(FALLBACK_RECITERS);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => setReciterId(getReciterIdFromStorage()));

    void (async () => {
      const list = await fetchReciters();
      setReciters(list);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("reciter_id")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.reciter_id && Number.isFinite(profile.reciter_id)) {
            const id = Number(profile.reciter_id);
            setReciterId(id);
            saveReciterIdToStorage(id);
          }
        }
      } catch {
        /* local preference remains */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const saveReciterId = useCallback(
    (id: number) => {
      saveReciterIdToStorage(id);
      setReciterId(id);
      window.dispatchEvent(new CustomEvent("reciter-changed"));
      void saveReciterPreference(id);

      const reciter = findReciterById(id, reciters);
      setToast(`Reciter changed to ${reciter?.name ?? "selected reciter"}`);
      window.setTimeout(() => setToast(null), 2800);
    },
    [reciters],
  );

  const reciter = findReciterById(reciterId, reciters);
  const reciterName = reciter?.name ?? "Mishari Rashid Al-Afasy";

  const value = useMemo(
    () => ({
      reciterId,
      reciters,
      reciterName,
      reciterShortName: getReciterShortName(reciterName),
      ready,
      toast,
      saveReciterId,
      dismissToast: () => setToast(null),
    }),
    [reciterId, reciters, reciterName, ready, toast, saveReciterId],
  );

  return (
    <ReciterContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[100] max-w-[90vw] -translate-x-1/2 rounded-full bg-[var(--text-primary)] px-4 py-2 text-center text-sm text-[var(--bg-page)] shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </ReciterContext.Provider>
  );
}
