const STORAGE_KEY = "dua-app:journal-entries";

export interface LocalJournalEntry {
  id: string;
  pairing_id: string;
  content: string;
  created_at: string;
}

function readAll(): LocalJournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is LocalJournalEntry =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as LocalJournalEntry).id === "string" &&
        typeof (row as LocalJournalEntry).pairing_id === "string" &&
        typeof (row as LocalJournalEntry).content === "string" &&
        typeof (row as LocalJournalEntry).created_at === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(entries: LocalJournalEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent("dua-app-journal-changed"));
}

export function getJournalEntries(): LocalJournalEntry[] {
  return readAll().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function appendJournalEntry(pairingId: string, content: string): LocalJournalEntry {
  const entry: LocalJournalEntry = {
    id: crypto.randomUUID(),
    pairing_id: pairingId,
    content,
    created_at: new Date().toISOString(),
  };
  const next = [entry, ...readAll()];
  writeAll(next);
  return entry;
}
