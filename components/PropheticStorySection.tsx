"use client";

import { useState } from "react";

interface PropheticStorySectionProps {
  prophetName: string;
  story: string;
  defaultExpanded?: boolean;
}

function withSalutation(name: string) {
  if (name.toLowerCase() === "muhammad") return "Prophet Muhammad ﷺ";
  return `Prophet ${name} عليه السلام`;
}

export function PropheticStorySection({
  prophetName,
  story,
  defaultExpanded = false,
}: PropheticStorySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="mt-6 border-t border-[var(--border)] pt-4">
      <button
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={expanded}
      >
        <span className="text-sm font-medium text-[var(--accent-primary)]">
          ✦ The story behind this dua — {withSalutation(prophetName)}
        </span>
        <span className="text-sm text-[var(--text-secondary)]">{expanded ? "Close" : "Read more"}</span>
      </button>

      {expanded ? (
        <div className="mt-3 border-l-2 border-[var(--accent-gold)] pl-4 text-sm leading-relaxed text-[var(--text-secondary)] italic">
          {story}
        </div>
      ) : null}
    </div>
  );
}
