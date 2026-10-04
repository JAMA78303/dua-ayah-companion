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

/** How the card looks: the theme's own colours (plain), or one of the decorated designs. */
export const SHARE_DESIGNS = [
  { id: "plain", label: "Plain" },
  { id: "night", label: "Night" },
  { id: "emerald", label: "Emerald" },
  { id: "dawn", label: "Dawn" },
  { id: "parchment", label: "Parchment" },
] as const;
export type ShareDesign = (typeof SHARE_DESIGNS)[number]["id"];

interface Palette {
  text: string;
  secondary: string;
  arabic: string;
  gold: string;
  accent: string;
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

/** An eight-pointed star (two overlapping squares), the classic Islamic geometric motif. */
function star8(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const radius = i % 2 === 0 ? r : r * 0.76;
    const angle = (Math.PI / 8) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** A pointed (mihrab-style) arch spanning the card, from `top` down to `bottom`. */
function archPath(ctx: CanvasRenderingContext2D, inset: number, top: number, bottom: number) {
  const left = inset;
  const right = WIDTH - inset;
  const shoulder = top + (right - left) * 0.42;
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(left, shoulder);
  ctx.quadraticCurveTo(left, top + 40, WIDTH / 2, top);
  ctx.quadraticCurveTo(right, top + 40, right, shoulder);
  ctx.lineTo(right, bottom);
  ctx.closePath();
}

/** A small seeded random, so a design's stars fall in the same places every time. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Paints the background and ornaments for a decorated design and returns its text colours. */
function paintDesign(ctx: CanvasRenderingContext2D, design: Exclude<ShareDesign, "plain">): Palette {
  if (design === "night") {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#070b1f");
    sky.addColorStop(0.6, "#121c44");
    sky.addColorStop(1, "#1f2b5c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const random = seeded(7);
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 110; i++) {
      ctx.globalAlpha = 0.25 + random() * 0.6;
      ctx.beginPath();
      ctx.arc(random() * WIDTH, random() * HEIGHT, 0.8 + random() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Crescent moon, top right.
    ctx.fillStyle = "#f5e6b8";
    ctx.beginPath();
    ctx.arc(WIDTH - 190, 200, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#080c23";
    ctx.beginPath();
    ctx.arc(WIDTH - 166, 184, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e8c97a";
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);
    ctx.globalAlpha = 1;
    return { text: "#f0ede8", secondary: "#b8bfd8", arabic: "#f7e7b4", gold: "#e8c97a", accent: "#e8c97a" };
  }

  if (design === "emerald") {
    const base = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    base.addColorStop(0, "#0d3b2e");
    base.addColorStop(1, "#06261d");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // A faint lattice of eight-pointed stars.
    ctx.strokeStyle = "#e8c97a";
    ctx.globalAlpha = 0.09;
    ctx.lineWidth = 2;
    for (let y = 0; y <= HEIGHT + 90; y += 90) {
      for (let x = (y / 90) % 2 === 0 ? 0 : 45; x <= WIDTH + 90; x += 90) {
        star8(ctx, x, y, 32);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    // Double gold frame with a star at each corner.
    ctx.strokeStyle = "#e8c97a";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(56, 56, WIDTH - 112, HEIGHT - 112);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#e8c97a";
    for (const [x, y] of [[40, 40], [WIDTH - 40, 40], [40, HEIGHT - 40], [WIDTH - 40, HEIGHT - 40]] as const) {
      star8(ctx, x, y, 20);
      ctx.fill();
    }
    return { text: "#eef5f0", secondary: "#a9c9bb", arabic: "#f3dfa2", gold: "#e8c97a", accent: "#e8c97a" };
  }

  if (design === "dawn") {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#fde7d4");
    sky.addColorStop(0.55, "#f6c9c4");
    sky.addColorStop(1, "#d9c6e8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // A low sun behind the arch.
    const sun = ctx.createRadialGradient(WIDTH / 2, HEIGHT - 120, 10, WIDTH / 2, HEIGHT - 120, 520);
    sun.addColorStop(0, "rgba(255, 214, 160, 0.9)");
    sun.addColorStop(1, "rgba(255, 214, 160, 0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    archPath(ctx, 70, 70, HEIGHT - 70);
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.fill();
    ctx.strokeStyle = "#b7774d";
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 1;
    return { text: "#3a2730", secondary: "#7a5c66", arabic: "#3a2023", gold: "#b7774d", accent: "#9b4f5c" };
  }

  // Parchment
  const paper = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 200, WIDTH / 2, HEIGHT / 2, 900);
  paper.addColorStop(0, "#fbf3df");
  paper.addColorStop(1, "#ecdcb7");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  archPath(ctx, 80, 80, HEIGHT - 80);
  ctx.strokeStyle = "#a8803a";
  ctx.lineWidth = 4;
  ctx.stroke();
  archPath(ctx, 98, 100, HEIGHT - 98);
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#a8803a";
  star8(ctx, WIDTH / 2, 80, 18);
  ctx.fill();
  return { text: "#3b2f1e", secondary: "#7a6648", arabic: "#2e2416", gold: "#a8803a", accent: "#7b4a1c" };
}

export async function renderShareCard(content: ShareCardContent, design: ShareDesign = "plain"): Promise<Blob> {
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

  if (design === "plain") {
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
  } else {
    Object.assign(colors, paintDesign(ctx, design));
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Eyebrow
  ctx.font = `700 26px ${sansFamily}`;
  ctx.fillStyle = colors.gold;
  ctx.direction = "ltr";
  const arched = design === "dawn" || design === "parchment";
  ctx.fillText(content.eyebrow.toUpperCase(), WIDTH / 2, arched ? PADDING + 110 : PADDING);

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
  const top = PADDING + (arched ? 180 : 70);
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
