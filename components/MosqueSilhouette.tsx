/** Atmospheric mosque paper-cut silhouette for the home hero. */
export function MosqueSilhouette() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[120px] w-full"
      viewBox="0 0 400 120"
      preserveAspectRatio="xMidYMax meet"
      fill="white"
      style={{ opacity: "var(--mosque-fill-opacity)" }}
    >
      {/* Left minaret */}
      <rect x="24" y="20" width="10" height="88" rx="1" />
      <rect x="20" y="12" width="18" height="10" rx="2" />
      <polygon points="29,4 14,18 44,18" />
      {/* Left small dome */}
      <ellipse cx="72" cy="78" rx="22" ry="14" />
      <rect x="58" y="78" width="28" height="30" />
      {/* Central dome */}
      <ellipse cx="200" cy="52" rx="58" ry="36" />
      <rect x="148" y="52" width="104" height="56" />
      <polygon points="200,8 132,58 268,58" />
      {/* Right small dome */}
      <ellipse cx="328" cy="78" rx="22" ry="14" />
      <rect x="314" y="78" width="28" height="30" />
      {/* Right minaret */}
      <rect x="366" y="20" width="10" height="88" rx="1" />
      <rect x="362" y="12" width="18" height="10" rx="2" />
      <polygon points="371,4 356,18 386,18" />
      {/* Base platform */}
      <rect x="0" y="106" width="400" height="14" />
    </svg>
  );
}
