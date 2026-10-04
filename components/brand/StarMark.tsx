/** The Companion mark: a star in a teal circle (from the brand foundation in Figma). */
export function StarMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static brand asset */}
      <img src="/brand/star.svg" alt="" width={Math.round(size * 0.56)} height={Math.round(size * 0.56)} />
    </span>
  );
}
