import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    // Migration tests boot a Postgres (PGlite) per suite.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
