"use client";

import { useEffect, useState } from "react";

import { SHARE_DESIGNS, renderShareCard, type ShareCardContent, type ShareDesign } from "@/lib/share/renderShareCard";

const DESIGN_KEY = "dac-share-design";
/** Small swatch for each design's button. */
const SWATCHES: Record<ShareDesign, string> = {
  plain: "linear-gradient(180deg, var(--card-bg), var(--bg-base))",
  night: "linear-gradient(180deg, #070b1f, #1f2b5c)",
  emerald: "linear-gradient(135deg, #0d3b2e, #06261d)",
  dawn: "linear-gradient(180deg, #fde7d4, #f6c9c4, #d9c6e8)",
  parchment: "radial-gradient(circle, #fbf3df, #ecdcb7)",
};

function readDesign(): ShareDesign {
  try {
    const saved = window.localStorage.getItem(DESIGN_KEY);
    return SHARE_DESIGNS.some((d) => d.id === saved) ? (saved as ShareDesign) : "plain";
  } catch {
    return "plain";
  }
}

interface ShareSheetProps {
  card: ShareCardContent;
  /** Path of the item's page, e.g. "/names/17". */
  href: string;
  title: string;
  text: string;
  onClose: () => void;
}

function fileNameFor(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return `${slug || "reminder"}.png`;
}

/**
 * Preview + share options. The image is rendered when the sheet opens, so the "Share image" tap
 * itself calls navigator.share directly (browsers require a fresh tap to open the share sheet).
 */
export function ShareSheet({ card, href, title, text, onClose }: ShareSheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [design, setDesign] = useState<ShareDesign>("plain");

  useEffect(() => {
    queueMicrotask(() => setDesign(readDesign()));
  }, []);

  function chooseDesign(next: ShareDesign) {
    setDesign(next);
    try {
      window.localStorage.setItem(DESIGN_KEY, next);
    } catch {
      /* the choice just won't be remembered */
    }
  }
  const url = typeof window === "undefined" ? href : `${window.location.origin}${href}`;
  // Callers build `card` inline; key the render on its content so re-renders don't redraw the image.
  const cardKey = JSON.stringify(card);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    queueMicrotask(() => {
      if (!cancelled) setPreviewUrl(null);
    });
    renderShareCard(JSON.parse(cardKey) as ShareCardContent, design)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setFile(new File([blob], fileNameFor(title), { type: "image/png" }));
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [cardKey, title, design]);

  const canShareFile = Boolean(file && typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] }));
  const canShareLink = typeof navigator !== "undefined" && typeof navigator.share === "function";

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  async function run(action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      // Dismissing the system share sheet is not an error.
      if (error instanceof DOMException && error.name === "AbortError") return;
      flash("Couldn't share right now");
    }
  }

  const buttonClass =
    "flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]";

  return (
    <div className="fixed inset-0 z-[80] flex flex-col justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-sheet-title"
        className="relative z-[1] mx-auto w-full max-w-md space-y-4 rounded-t-[20px] bg-[var(--card-bg)] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-[var(--border)]" aria-hidden />
        <h2 id="share-sheet-title" className="font-playfair text-lg text-[var(--text-primary)]">
          Share
        </h2>

        <div className="flex justify-center gap-2" role="radiogroup" aria-label="Card design">
          {SHARE_DESIGNS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={design === option.id}
              onClick={() => chooseDesign(option.id)}
              className="flex flex-col items-center gap-1 text-[11px] text-[var(--text-secondary)]"
            >
              <span
                className={`size-10 rounded-lg border-2 ${design === option.id ? "border-[var(--accent-primary)]" : "border-[var(--border)]"}`}
                style={{ background: SWATCHES[option.id] }}
                aria-hidden
              />
              {option.label}
            </button>
          ))}
        </div>

        <div className="mx-auto aspect-[4/5] w-full max-w-[260px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimisable asset
            <img src={previewUrl} alt={`Share image: ${title}`} className="h-full w-full object-cover" />
          ) : (
            <p className="flex h-full items-center justify-center px-4 text-center text-xs text-[var(--text-secondary)]">
              {failed ? "The image couldn't be created. You can still share the link." : "Preparing image..."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {canShareFile ? (
            <button
              type="button"
              className={buttonClass}
              onClick={() =>
                void run(() => navigator.share({ files: [file!], title, text: `${text}\n${url}` }))
              }
            >
              Share image
            </button>
          ) : null}
          {previewUrl && file ? (
            <a href={previewUrl} download={file.name} className={`${buttonClass} text-center`}>
              Save image
            </a>
          ) : null}
          <button
            type="button"
            className={buttonClass}
            onClick={() =>
              void run(async () => {
                await navigator.clipboard.writeText(url);
                flash("Link copied");
              })
            }
          >
            Copy link
          </button>
          {canShareLink && !canShareFile ? (
            <button type="button" className={buttonClass} onClick={() => void run(() => navigator.share({ title, text, url }))}>
              Share link
            </button>
          ) : null}
        </div>

        {toast ? (
          <p role="status" className="text-center text-xs text-[var(--text-secondary)]">
            {toast}
          </p>
        ) : null}
      </div>
    </div>
  );
}
