import type { Config } from "tailwindcss";

/** Tailwind v4: theme extensions also mirrored in app/globals.css `@theme`. */
export default {
  theme: {
    extend: {
      colors: {
        teal: {
          950: "#0D5C5C",
        },
        gold: {
          200: "#F0D080",
          400: "#D4A843",
        },
        parchment: {
          DEFAULT: "#FAF8F5",
          dark: "#F0EBE3",
        },
        ink: {
          950: "#12121F",
        },
      },
    },
  },
} satisfies Config;
