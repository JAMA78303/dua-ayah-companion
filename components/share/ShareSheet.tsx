"use client";

import { useEffect, useState } from "react";

import { renderShareCard, type ShareCardContent } from "@/lib/share/renderShareCard";

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
  const url = typeof window === "undefined" ? href : `${window.location.origin}${href}`;
  // Callers build `card` inline; key the render on its content so re-renders don't redraw the image.
  const cardKey = JSON.stringify(card);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    renderShareCard(JSON.parse(cardKey) as ShareCardContent)
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
  }, [cardKey, title]);

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
