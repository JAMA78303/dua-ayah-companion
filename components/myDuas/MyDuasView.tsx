"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addPersonalDua, deletePersonalDua, markDuaAnswered, reopenDua } from "@/app/actions/personalDuas";

export interface PersonalDua {
  id: string;
  text: string;
  answered_at: string | null;
  answered_note: string | null;
  created_at: string;
}

const dateLabel = (iso: string) => new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

const buttonClass =
  "rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] disabled:opacity-50";

function DuaItem({ dua }: { dua: PersonalDua }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [answering, setAnswering] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setAnswering(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <li className="card-elevated space-y-3 p-4">
      <p className="whitespace-pre-wrap text-[15px] leading-7 text-[var(--text-primary)]">{dua.text}</p>
      <p className="text-xs text-[var(--text-secondary)]">
        {dua.answered_at ? `Asked ${dateLabel(dua.created_at)} · Answered ${dateLabel(dua.answered_at)}` : `Asked ${dateLabel(dua.created_at)}`}
      </p>
      {dua.answered_note ? (
        <p className="rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-sm italic text-[var(--text-secondary)]">{dua.answered_note}</p>
      ) : null}

      {answering ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            placeholder="How was it answered? (optional)"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2"
          />
          <div className="flex gap-2">
            <button type="button" disabled={pending} onClick={() => run(() => markDuaAnswered(dua.id, note))} className={buttonClass}>
              Alhamdulillah, save
            </button>
            <button type="button" disabled={pending} onClick={() => setAnswering(false)} className={buttonClass}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {dua.answered_at ? (
            <button type="button" disabled={pending} onClick={() => run(() => reopenDua(dua.id))} className={buttonClass}>
              Move back to asking
            </button>
          ) : (
            <button type="button" disabled={pending} onClick={() => setAnswering(true)} className={buttonClass}>
              ✓ Mark answered
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm("Delete this dua?")) run(() => deletePersonalDua(dua.id));
            }}
            className={buttonClass}
          >
            Delete
          </button>
        </div>
      )}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </li>
  );
}

export function MyDuasView({ duas }: { duas: PersonalDua[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const asking = duas.filter((d) => !d.answered_at);
  const answered = duas.filter((d) => d.answered_at);

  function add() {
    setError(null);
    startTransition(async () => {
      const result = await addPersonalDua(text);
      if (result.ok) {
        setText("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-8">
      <section className="card-elevated space-y-3 p-4">
        <label htmlFor="new-dua" className="text-sm font-semibold text-[var(--text-primary)]">
          Add a dua
        </label>
        <textarea
          id="new-dua"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder="What are you asking Allah for?"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2"
        />
        <div className="flex items-center justify-between">
          {error ? <p className="text-xs text-red-600">{error}</p> : <span />}
          <button
            type="button"
            disabled={pending || !text.trim()}
            onClick={add}
            className="rounded-full bg-[var(--accent-primary)] px-5 py-2 text-sm font-semibold text-[var(--on-accent-text)] disabled:opacity-60"
          >
            {pending ? "Saving..." : "Add"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">{`Asking (${asking.length})`}</h2>
        {asking.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">Nothing here yet. Add the first thing on your heart.</p>
        ) : (
          <ul className="space-y-3">
            {asking.map((dua) => (
              <DuaItem key={dua.id} dua={dua} />
            ))}
          </ul>
        )}
      </section>

      {answered.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">{`Answered (${answered.length})`}</h2>
          <ul className="space-y-3">
            {answered.map((dua) => (
              <DuaItem key={dua.id} dua={dua} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
