import { networkInterfaces } from "node:os";

import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxAgeSeconds: 86400 * 365 },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-files",
          expiration: { maxAgeSeconds: 86400 * 365 },
        },
      },
      {
        urlPattern: /\/api\/daily/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "daily-recommendation",
          networkTimeoutSeconds: 5,
          expiration: { maxAgeSeconds: 86400 },
        },
      },
    ],
  },
});

/** This machine's addresses on the local network, so a phone on the same Wi-Fi can use the dev server. */
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

const nextConfig: NextConfig = {
  // Development only: Next blocks dev assets requested from other origins unless they're listed.
  allowedDevOrigins: lanAddresses,
};

export default withPWA(nextConfig);
