/**
 * Draws a shareable 1080×1350 image card in the browser. Canvas text uses the browser's own shaping,
 * so Arabic joins and runs right-to-left correctly (server-side image renderers are unreliable here).
 */
export interface ShareCardContent {
  /** Small caps line at the top, e.g. "Surah Ibrahim · Ayah 7". */
  eyebrow: string;
  arabic?: string;
  title?: string;
  body: string;
  /** Line under the body, e.g. a reference. */
  footnote?: string;
}

const WIDTH = 1080;
const HEIGHT = 1350;
const PADDING = 96;

function cssVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

interface Block {
  text: string;
  font: (size: number) => string;
  size: number;
  minSize: number;
  lineHeight: number;
  color: string;
  rtl?: boolean;
  gapAfter: number;
}

function layout(ctx: CanvasRenderingContext2D, blocks: Block[], scale: number, maxWidth: number) {
  return blocks.map((block) => {
    const size = Math.max(block.minSize, Math.round(block.size * scale));
    ctx.font = block.font(size);
    ctx.direction = block.rtl ? "rtl" : "ltr";
    const lines = wrapLines(ctx, block.text, maxWidth);
    return { block, size, lines, height: lines.length * size * block.lineHeight };
  });
}

export async function renderShareCard(content: ShareCardContent): Promise<Blob> {
  const arabicFamily = `${cssVar("--font-scheherazade", "")}, "Scheherazade New", serif`.replace(/^, /, "");
  const serifFamily = `${cssVar("--font-playfair", "")}, Georgia, serif`.replace(/^, /, "");
  const sansFamily = `${cssVar("--font-nunito", "")}, Arial, sans-serif`.replace(/^, /, "");

  const colors = {
    background: cssVar("--card-bg", "#ffffff"),
    base: cssVar("--bg-base", "#f5f0e8"),
    text: cssVar("--text-primary", "#2d2d3a"),
    secondary: cssVar("--text-secondary", "#6b6b80"),
    arabic: cssVar("--text-arabic", cssVar("--text-primary", "#2d2d3a")),
    gold: cssVar("--gold", "#c8973a"),
    accent: cssVar("--accent-primary", "#1a8c8c"),
  };

  // Make sure the web fonts are ready before measuring or drawing.
  await Promise.all([
    document.fonts.load(`700 96px ${arabicFamily}`, content.arabic ?? "ا"),
    document.fonts.load(`600 56px ${serifFamily}`),
    document.fonts.load(`400 40px ${sansFamily}`),
  ]).catch(() => undefined);

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  // Background: soft vertical gradient in the viewer's theme, with a thin gold frame.
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, colors.background);
  gradient.addColorStop(1, colors.base);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = colors.gold;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Eyebrow
  ctx.font = `700 26px ${sansFamily}`;
  ctx.fillStyle = colors.gold;
  ctx.direction = "ltr";
  ctx.fillText(content.eyebrow.toUpperCase(), WIDTH / 2, PADDING);

  const blocks: Block[] = [];
  if (content.arabic) {
    blocks.push({ text: content.arabic, font: (s) => `700 ${s}px ${arabicFamily}`, size: 96, minSize: 44, lineHeight: 1.75, color: colors.arabic, rtl: true, gapAfter: 36 });
  }
  if (content.title) {
    blocks.push({ text: content.title, font: (s) => `600 ${s}px ${serifFamily}`, size: 54, minSize: 34, lineHeight: 1.3, color: colors.text, gapAfter: 28 });
  }
  blocks.push({ text: content.body, font: (s) => `400 ${s}px ${sansFamily}`, size: 42, minSize: 26, lineHeight: 1.5, color: colors.text, gapAfter: content.footnote ? 32 : 0 });
  if (content.footnote) {
    blocks.push({ text: content.footnote, font: (s) => `600 ${s}px ${sansFamily}`, size: 30, minSize: 22, lineHeight: 1.4, color: colors.accent, gapAfter: 0 });
  }

  // Shrink everything together until the content fits between the eyebrow and the footer.
  const top = PADDING + 70;
  const bottom = HEIGHT - PADDING - 70;
  const maxWidth = WIDTH - PADDING * 2 - 40;
  let scale = 1;
  let laid = layout(ctx, blocks, scale, maxWidth);
  const totalHeight = () => laid.reduce((sum, item) => sum + item.height + item.block.gapAfter, 0);
  while (totalHeight() > bottom - top && scale > 0.4) {
    scale -= 0.05;
    laid = layout(ctx, blocks, scale, maxWidth);
  }

  let y = top + Math.max(0, (bottom - top - totalHeight()) / 2);
  for (const { block, size, lines } of laid) {
    ctx.font = block.font(size);
    ctx.fillStyle = block.color;
    ctx.direction = block.rtl ? "rtl" : "ltr";
    for (const line of lines) {
      ctx.fillText(line, WIDTH / 2, y);
      y += size * block.lineHeight;
    }
    y += block.gapAfter;
  }

  // Footer
  ctx.direction = "ltr";
  ctx.font = `600 26px ${serifFamily}`;
  ctx.fillStyle = colors.secondary;
  ctx.fillText("Dua & Ayah Companion", WIDTH / 2, HEIGHT - PADDING - 34);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image"))), "image/png");
  });
}
