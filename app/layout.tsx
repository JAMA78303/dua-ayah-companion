import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist_Mono, Nunito_Sans, Scheherazade_New } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { ThemeInitScript } from "@/components/ThemeInitScript";
import { ReciterProvider } from "@/components/ReciterProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

// Body and UI text. The CSS variable keeps its original name so every existing class picks up the new face.
const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

// Headings (Cormorant Garamond, from the redesign). The variable name is historical, as above.
const playfair = Cormorant_Garamond({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Arabic text (Qur'an, duas, Names). Loaded via next/font: a CSS @import can't stay first in the bundled stylesheet.
const scheherazade = Scheherazade_New({
  variable: "--font-scheherazade",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dua & Ayah Companion",
  description: "Find grounded Qur'anic ayah and dua pairings by emotional state.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Companion",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A8C8C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="abyad"
      className={`${nunito.variable} ${playfair.variable} ${scheherazade.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <ReciterProvider>
            <div className="relative z-10 flex min-h-full flex-1 flex-col pb-20">
              <AppHeader />
              {children}
              <AppFooter />
              <BottomNav />
            </div>
          </ReciterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
