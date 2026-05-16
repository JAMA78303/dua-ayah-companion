"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ProphetSummary {
  name: string;
  duaCount: number;
}

function withSalutation(name: string) {
  if (name.toLowerCase() === "muhammad") return "Prophet Muhammad ﷺ";
  return `Prophet ${name} عليه السلام`;
}

export function PropheticDuasSection() {
  const [prophets, setProphets] = useState<ProphetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProphets() {
      try {
        const response = await fetch("/api/prophets", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as ProphetSummary[];
        if (isMounted) {
          setProphets(payload);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProphets();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Duas from the Prophets</h2>
        <p className="text-xs text-[var(--text-secondary)]">Loading prophetic duas...</p>
      </section>
    );
  }

  if (prophets.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Duas from the Prophets</h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Browse prophetic supplications by prophet.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {prophets.map((prophet) => (
          <Link
            key={prophet.name}
            href={`/prophets/${encodeURIComponent(prophet.name)}`}
            className="card-elevated p-4 transition hover:border-[var(--accent-primary)]"
          >
            <p className="font-medium text-[var(--text-primary)]">{withSalutation(prophet.name)}</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {prophet.duaCount} {prophet.duaCount === 1 ? "dua" : "duas"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
