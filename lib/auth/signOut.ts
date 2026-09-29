import { SAVED_KEYS_STORAGE_KEYS } from "@/lib/local/savedKeys";
import { createClient } from "@/lib/supabase/client";

/** Per-user data mirrored on this device. Device preferences (theme, reciter, speed) are kept. */
const USER_STORAGE_KEYS = [...SAVED_KEYS_STORAGE_KEYS, "dua-app:journal-entries"];
const USER_STORAGE_PREFIXES = ["journal-draft-"];

function clearLocalUserData() {
  try {
    const storage = window.localStorage;
    for (const key of Object.keys(storage)) {
      if (USER_STORAGE_KEYS.includes(key) || USER_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        storage.removeItem(key);
      }
    }
  } catch {
    /* storage unavailable — nothing to clear */
  }
}

/** Signs out, clears the previous user's local mirror, and reloads so providers reset. */
export async function signOutAndClearLocalData(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  clearLocalUserData();
  window.location.assign("/");
}
